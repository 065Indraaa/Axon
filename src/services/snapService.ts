import { supabase } from '../lib/supabase';

export interface SnapData {
    id: string;
    sender_address: string;
    token_symbol: string;
    total_amount: number;
    remaining_amount: number;
    snappers_count: number;
    mode: 'equal' | 'random';
    status: 'active' | 'completed' | 'expired';
    created_at?: string;
}

export interface ClaimResult {
    success: boolean;
    amount?: number;
    message?: string;
    tx_hash?: string; // Optional: if we record on-chain later
}

export const SnapService = {
    /**
     * Creates a new Snap record in the database.
     * In a real mainnet app, this would be called AFTER the on-chain transfer is verified.
     * Here we treat it as the "Source of Truth" for the off-chain game state.
     */
    async createSnap(data: SnapData) {
        const { error } = await supabase
            .from('snaps')
            .insert([data]);

        if (error) {
            console.error('Error creating snap:', error);
            throw error;
        }

        // Record creation in transactions history
        await supabase.from('transactions').insert({
            user_address: data.sender_address,
            type: 'snap_create',
            amount: data.total_amount.toString(),
            from_token: data.token_symbol,
            to_token: 'SNAP',
            status: 'CONFIRMED',
            tx_hash: '', // Internal off-chain initially or update if on-chain
            created_at: new Date().toISOString()
        });

        return true;
    },

    /**
     * Retrieves snap details by ID.
     */
    async getSnap(id: string) {
        const { data, error } = await supabase
            .from('snaps')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as SnapData;
    },

    /**
     * Claims a snap.
     * Uses a stored procedure (RPC) or careful logic to prevent double claims.
     * ideally we use an RPC 'claim_snap' to handle concurrency.
     * For now, we'll do a simple check-update (Optimistic).
     */
    async claimSnap(snapId: string, claimerAddress: string, isContractFlow: boolean = false): Promise<ClaimResult> {
        try {
            if (isContractFlow) {
                // Return success but note that transaction must be handled by frontend
                return { success: true, message: "Transaction pending in wallet" };
            }

            // LEGACY: CALL EDGE FUNCTION
            const { data, error } = await supabase.functions.invoke('claim_snap', {
                body: { snap_id: snapId, claimer_address: claimerAddress }
            });

            if (error) {
                console.error('Edge Function Error:', error);

                // Try to extract logical error from response if it's a 400
                if (error instanceof Error) {
                    return { success: false, message: error.message };
                }

                // Supabase invoke error structure
                const errMsg = (error as any).message || 'Server connection failed';
                return { success: false, message: errMsg };
            }

            if (!data.success) {
                return { success: false, message: data.message };
            }

            // Record claim in transactions history
            if (data.amount) {
                await supabase.from('transactions').insert({
                    user_address: claimerAddress,
                    type: 'snap_claim',
                    amount: data.amount.toString(),
                    from_token: 'SNAP',
                    to_token: 'USDC', // Assuming USDC or derived from snap details if available
                    status: 'CONFIRMED',
                    tx_hash: data.tx || '',
                    created_at: new Date().toISOString()
                });
            }

            return {
                success: true,
                amount: data.amount,
                tx_hash: data.tx
            };

        } catch (e) {
            console.error('Claim failed:', e);
            return { success: false, message: 'System error' };
        }
    },

    async getClaimCount(snapId: string) {
        const { count } = await supabase
            .from('snap_claims')
            .select('*', { count: 'exact', head: true })
            .eq('snap_id', snapId);
        return count || 0;
    },

    /**
     * Fetches all snaps created by a specific address.
     * Includes claim metadata.
     */
    async getUserSnaps(address: string) {
        const { data, error } = await supabase
            .from('snaps')
            .select(`
                *,
                snap_claims (
                    id
                )
            `)
            .eq('sender_address', address)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching user snaps:', error);
            throw error;
        }

        return data.map((snap: any) => ({
            ...snap,
            claimed_count: snap.snap_claims?.length || 0
        }));
    }
};
