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

        console.log('--- SWAP REQUEST DIAGNOSTIC START ---');
        console.log('Params:', { userAddress, fromAsset, toAsset, amount, network });

        // Initialize Coinbase CDP
        const apiKeyName = Deno.env.get('CDP_API_KEY_NAME');
        const privateKey = Deno.env.get('CDP_PRIVATE_KEY');

        if (!apiKeyName || !privateKey) {
            return new Response(JSON.stringify({ error: 'Missing CDP API Keys' }), { status: 500, headers: corsHeaders });
        }

        // Standard configuration pattern
        Coinbase.configure({
            apiKeyName,
            privateKey: privateKey.replace(/\\n/g, '\n'),
        });

        console.log('Introspection - Available Methods:', {
            CoinbaseKeys: Object.keys(Coinbase),
            WalletKeys: Object.keys(Wallet),
            // Check for Trade if exported
            hasTrade: typeof (Coinbase as any).Trade !== 'undefined'
        });

        const normalizedNetwork = network === 'base-mainnet' ? 'base' : network;

        // EXPERT PATTERN: If Wallet.create/import fails, we use the direct trade generation patterns.
        // For external addresses, some SDK versions expect a "ghost" wallet object.
        let wallet;
        try {
            console.log('Attempting to setup unmanaged wallet reference...');
            // In v0.25.0, creating a wallet without a walletId might fail if not configured for it.
            // Let's try to fetch or create with minimal persistence.
            wallet = await Wallet.create({
                networkId: normalizedNetwork
            });
            console.log('Wallet created. Setting address...');
            (wallet as any).address = userAddress;
        } catch (e: any) {
            console.warn('Wallet setup failed, trying static Trade method if available...', e.message || e);
            // Fallback: If we can't create a wallet, the SDK might not be the right tool for 
            // "quote-only" trades on Base in this environment.
            throw new Error(`SDK Wallet Setup Error: ${e.message || JSON.stringify(e)}`);
        }

        const fromAssetId = fromAsset.toLowerCase().includes('0x833589') ? 'usdc' : fromAsset;
        const toAssetId = toAsset.toLowerCase().includes('0x18bc5b') ? 'idrx' : toAsset;

        console.log('Creating Trade for:', { fromAssetId, toAssetId, amount });

        const trade = await wallet.createTrade({
            amount: amount.toString(),
            fromAssetId: fromAssetId,
            toAssetId: toAssetId,
        });

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
        console.error('Internal Error Object:', error);

        return new Response(
            JSON.stringify({
                error: error.message || 'Swap failed internally',
                details: error.stack,
                name: error.name,
                raw: JSON.stringify(error)
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
