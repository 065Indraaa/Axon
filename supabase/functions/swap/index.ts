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
        const body = await req.json();
        const { userAddress, fromAsset, toAsset, amount, network } = body;

        console.log('--- SWAP REQUEST START ---');
        console.log('Body:', JSON.stringify(body));

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
            console.log('Referencing wallet for:', userAddress);
            // Try Wallet.create for external reference in v0.25.0
            wallet = await Wallet.create({
                networkId: normalizedNetwork,
                // Some SDK versions use 'address' for external refs, others use it during import
            });
            // Attach external address for trade generation
            (wallet as any).address = userAddress;
            console.log('Wallet reference created');
        } catch (walletErr: any) {
            console.error('Wallet setup failed:', walletErr.message);
            throw new Error(`Wallet setup failed: ${walletErr.message}`);
        }

        // Standardize Assets
        // CDP SDK Trade API prefers symbols for base assets but can use addresses
        const fromAssetId = fromAsset.toLowerCase().includes('0x833589') ? 'usdc' : fromAsset;
        const toAssetId = toAsset.toLowerCase().includes('0x18bc5b') ? 'idrx' : toAsset;

        console.log('Creating trade:', { fromAssetId, toAssetId, amount });

        try {
            const trade = await wallet.createTrade({
                amount: amount.toString(),
                fromAssetId: fromAssetId,
                toAssetId: toAssetId,
            });

            console.log('Trade created. Getting transaction data...');
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
        } catch (tradeErr: any) {
            console.error('Trade creation failed:', tradeErr);
            throw new Error(`CDP Trade Error: ${tradeErr.message || 'Unknown trade error'}`);
        }

    } catch (error: any) {
        console.error('--- SWAP REQUEST FAILED ---');
        console.error('Error:', error);

        return new Response(
            JSON.stringify({
                error: error.message || 'Swap failed internally',
                details: error.stack,
                type: error.name,
                full_error: JSON.stringify(error)
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
