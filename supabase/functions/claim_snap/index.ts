import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Coinbase, Wallet } from "npm:@coinbase/coinbase-sdk@0.10.0"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

    try {
        const { snap_id, claimer_address } = await req.json()

        // 1. Init Supabase
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 2. Fetch Snap
        const { data: snap, error: snapError } = await supabase
            .from('snaps')
            .select('*')
            .eq('id', snap_id)
            .single()

        if (snapError || !snap) throw new Error("Snap not found")
        if (snap.status !== 'active') throw new Error("Snap is no longer active")
        if (snap.remaining_amount <= 0.0001) throw new Error("Snap is empty")

        // 3. Check Claims
        const { data: existing } = await supabase.from('snap_claims').select('*').eq('snap_id', snap_id).eq('claimer_address', claimer_address).single()
        if (existing) throw new Error("Already claimed")

        const claimAmount = snap.total_amount / snap.snappers_count

        // 4. INIT CDP SDK
        const apiKeyName = Deno.env.get('CDP_API_KEY_NAME')
        const privateKey = Deno.env.get('CDP_PRIVATE_KEY')?.replace(/\\n/g, "\n")

        if (!apiKeyName || !privateKey) {
            throw new Error("Missing CDP credentials")
        }

        Coinbase.configure({ apiKeyName, privateKey });

        // 5. Get or Create Wallet
        let wallet: Wallet;
        const { data: setting } = await supabase.from('app_settings').select('value').eq('key', 'wallet_data').single();

        if (setting && setting.value) {
            console.log("Importing existing wallet from database...");
            wallet = await Wallet.import(JSON.parse(setting.value));
        } else {
            console.log("Creating NEW wallet (first run)...");
            wallet = await Wallet.create({ networkId: Coinbase.networks.BaseMainnet });

            // Export and save
            const walletData = wallet.export();
            await supabase.from('app_settings').upsert({
                key: 'wallet_data',
                value: JSON.stringify(walletData)
            });

            console.log("✅ Wallet created and saved!");
        }

        const walletAddress = await wallet.getDefaultAddress();
        console.log(`Using Wallet Address: ${walletAddress.toString()}`);

        // 6. Execute Transfer
        const assetId = (snap.token_symbol === 'USDC' || snap.token_symbol === 'USDT')
            ? snap.token_symbol.toLowerCase()
            : 'eth';

        console.log(`Transferring ${claimAmount} ${assetId}...`);

        let txHash = '';
        try {
            const transfer = await wallet.createTransfer({
                amount: claimAmount,
                assetId: assetId,
                destination: claimer_address
            });

            const result = await transfer.wait();
            txHash = result.getTransactionHash() || '';

        } catch (err: any) {
            console.error("Transfer error:", err);
            if (err.message?.includes("insufficient funds")) {
                throw new Error(`Server Wallet Empty (${walletAddress}). Please fund with ${snap.token_symbol}.`);
            }
            throw err;
        }

        // 7. DB Updates
        await supabase.from('snap_claims').insert({
            snap_id, claimer_address, amount: claimAmount, tx_hash: txHash
        })

        const newRem = snap.remaining_amount - claimAmount
        await supabase.from('snaps').update({
            remaining_amount: newRem,
            status: newRem <= 0.0001 ? 'completed' : 'active'
        }).eq('id', snap_id)

        return new Response(JSON.stringify({
            success: true,
            tx: txHash,
            sender: walletAddress.toString(),
            amount: claimAmount
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    } catch (error: any) {
        return new Response(JSON.stringify({ success: false, message: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })
    }
})
