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

        console.log('--- SWAP REQUEST START ---');
        console.log('Params:', { userAddress, fromAsset, toAsset, amount, network });

        // Initialize Coinbase CDP
        const apiKeyName = Deno.env.get('CDP_API_KEY_NAME');
        const privateKey = Deno.env.get('CDP_PRIVATE_KEY');

        if (!apiKeyName || !privateKey) {
            console.error('Missing API Keys');
            return new Response(JSON.stringify({ error: 'Missing CDP API Keys' }), { status: 500, headers: corsHeaders });
        }

        const coinbase = new Coinbase({
            apiKeyName,
            privateKey: privateKey.replace(/\\n/g, '\n'),
        });

        const normalizedNetwork = network === 'base-mainnet' ? 'base' : network;
        let wallet;

        try {
            console.log('Attempting Wallet.import for:', userAddress);
            // In many versions of the SDK, Wallet.import is for existing addresses
            wallet = await Wallet.import({
                address: userAddress,
                networkId: normalizedNetwork
            });
            console.log('Wallet imported successfully via Wallet.import');
        } catch (importErr: any) {
            console.error('Wallet.import failed:', importErr.message);
            console.log('Trying Wallet.create as fallback...');
            // Fallback for some SDK versions where addresses are managed via create
            wallet = await Wallet.create({
                networkId: normalizedNetwork,
                address: userAddress
            });
            console.log('Wallet reference created via Wallet.create fallback');
        }

        // Map asset addresses back to symbols for SDK if needed
        // Coinbase SDK createTrade often prefers symbols (USDC, ETH, etc.) or specific Asset objects
        const fromAssetId = fromAsset.toLowerCase().includes('0x833589') ? 'USDC' : fromAsset;
        const toAssetId = toAsset.toLowerCase().includes('0x18bc5b') ? 'IDRX' : toAsset;

        console.log('Creating trade:', { fromAssetId, toAssetId, amount });

        const trade = await wallet.createTrade({
            amount: amount,
            fromAssetId: fromAssetId,
            toAssetId: toAssetId,
        });

        console.log('Trade created successfully. Fetching transaction data...');
        const transaction = await trade.getTransaction();

        console.log('--- SWAP REQUEST SUCCESS ---');
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
        console.error('--- SWAP REQUEST FAILED ---');
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);

        return new Response(
            JSON.stringify({
                error: error.message || 'Swap failed internally',
                details: error.stack,
                type: error.name
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
