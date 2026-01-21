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
        // 1. Init Supabase
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 2. Init CDP SDK
        const apiKeyName = Deno.env.get('CDP_API_KEY_NAME')
        const privateKey = Deno.env.get('CDP_PRIVATE_KEY')?.replace(/\\n/g, "\n")

        if (!apiKeyName || !privateKey) {
            throw new Error("Missing CDP credentials")
        }

        Coinbase.configure({ apiKeyName, privateKey });

        // 3. Get or Create Wallet
        let wallet: Wallet;
        const { data: setting } = await supabase.from('app_settings').select('value').eq('key', 'wallet_data').single();

        if (setting && setting.value) {
            console.log("Loading existing wallet...");
            wallet = await Wallet.import(JSON.parse(setting.value));
        } else {
            console.log("Creating NEW wallet...");
            wallet = await Wallet.create({ networkId: Coinbase.networks.BaseMainnet });

            const walletData = wallet.export();
            await supabase.from('app_settings').upsert({
                key: 'wallet_data',
                value: JSON.stringify(walletData)
            });

            console.log("✅ Wallet created and saved!");
        }

        const walletAddress = await wallet.getDefaultAddress();
        console.log(`Server Wallet Address: ${walletAddress.toString()}`);

        return new Response(JSON.stringify({
            success: true,
            address: walletAddress.toString(),
            message: "Copy this address and update contracts.ts"
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    } catch (error: any) {
        console.error("Error:", error);
        return new Response(JSON.stringify({
            success: false,
            message: error.message
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 })
    }
})
