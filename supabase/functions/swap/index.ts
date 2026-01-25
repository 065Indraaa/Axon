import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Coinbase } from "npm:@coinbase/coinbase-sdk@^0.25.0";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { userAddress, fromAsset, toAsset, amount, network } = await req.json();

        console.log('Swap request:', { userAddress, fromAsset, toAsset, amount, network });

        // Validate inputs
        if (!userAddress || !fromAsset || !toAsset || !amount) {
            return new Response(
                JSON.stringify({ error: 'Missing required parameters' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Initialize Coinbase CDP with environment variables
        const coinbase = new Coinbase({
            apiKeyName: Deno.env.get('CDP_API_KEY_NAME')!,
            privateKey: Deno.env.get('CDP_PRIVATE_KEY')!,
        });

        // Get external wallet reference (user's Smart Wallet)
        const wallet = await coinbase.getExternalWallet(network, userAddress);

        // Create swap trade
        const trade = await wallet.createTrade({
            amount: amount,
            fromAssetId: fromAsset,
            toAssetId: toAsset,
        });

        // Get transaction data for user to sign
        const transaction = trade.getTransaction();

        return new Response(
            JSON.stringify({
                success: true,
                transaction: {
                    to: transaction.to,
                    data: transaction.data,
                    value: transaction.value || '0',
                },
                tradeId: trade.getId(),
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('Swap error:', error);
        return new Response(
            JSON.stringify({
                error: error.message || 'Swap failed',
                details: error.toString()
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
