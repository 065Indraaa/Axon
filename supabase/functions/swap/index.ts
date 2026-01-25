import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Coinbase, Wallet } from "npm:@coinbase/coinbase-sdk@0.25.0";

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

        console.log('Swap request received:', {
            userAddress, fromAsset, toAsset, amount, network
        });

        // Initialize Coinbase CDP
        const coinbase = new Coinbase({
            apiKeyName: Deno.env.get('CDP_API_KEY_NAME')!,
            privateKey: Deno.env.get('CDP_PRIVATE_KEY')!.replace(/\\n/g, '\n'),
        });

        // Use the Wallet.import pattern which is more standard in recent SDKs
        // for external addresses we want to build trades for.
        // We create a dummy wallet reference for the external address
        const wallet = await Wallet.importExternalWallet(network === 'base-mainnet' ? 'base' : network, userAddress);

        console.log('Wallet reference created for:', userAddress);

        // Execute trade to get transaction data
        const trade = await wallet.createTrade({
            amount: amount,
            fromAssetId: fromAsset,
            toAssetId: toAsset,
        });

        const transaction = await trade.getTransaction();
        console.log('Trade transaction built successfully');

        return new Response(
            JSON.stringify({
                success: true,
                transaction: {
                    to: transaction.to,
                    data: transaction.data,
                    value: transaction.value?.toString() || '0',
                },
                tradeId: trade.getId(),
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error: any) {
        console.error('Swap Edge Function Error:', error);

        // Fallback for SDK method issues
        let errorMessage = error.message;
        if (errorMessage.includes('importExternalWallet is not a function') ||
            errorMessage.includes('getExternalWallet is not a function')) {
            errorMessage = "Coinbase SDK Compatibility Error. Please ensure local CLI is updated and Docker is running for re-deploy.";
        }

        return new Response(
            JSON.stringify({
                error: errorMessage,
                details: error.stack
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
