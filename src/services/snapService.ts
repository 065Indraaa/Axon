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
    async claimSnap(snapId: string, claimerAddress: string): Promise<ClaimResult> {
        try {
            // CALL EDGE FUNCTION (Server-side Authority)
            // This runs the "Bot" logic in the cloud: Checks DB -> Sends Crypto -> Updates DB
            const { data, error } = await supabase.functions.invoke('claim_snap', {
                body: { snap_id: snapId, claimer_address: claimerAddress }
            });

            if (error) {
                console.error('Edge Function Error:', error);
                // Fallback to client-side logic for MVP if function fails/not deployed?
                // For now, let's treat function failure as block.
                return { success: false, message: 'Server connection failed' };
            }

            if (!data.success) {
                return { success: false, message: data.message };
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
    }
};
