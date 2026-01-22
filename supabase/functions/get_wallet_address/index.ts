import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Coinbase, Wallet } from "npm:@coinbase/coinbase-sdk@0.10.0"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

    try {
        console.log("Processing get_wallet_address request...");

        // 1. Init Supabase
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

        if (!supabaseUrl || !supabaseKey) {
            console.error("Missing Supabase configuration");
            throw new Error("Server Config Error: Missing Supabase Keys");
        }

        const supabase = createClient(supabaseUrl, supabaseKey)

        // 2. Init CDP SDK
        const apiKeyName = Deno.env.get('CDP_API_KEY_NAME')
        const privateKey = Deno.env.get('CDP_PRIVATE_KEY')?.replace(/\\n/g, "\n")

        if (!apiKeyName || !privateKey) {
            console.error("Missing CDP credentials");
            throw new Error("Server Config Error: Missing CDP Keys")
        }

        console.log("Configuring Coinbase SDK...");
        Coinbase.configure({ apiKeyName, privateKey });

        // 3. Get or Create Wallet
        let wallet: Wallet;
        console.log("Checking for existing wallet in app_settings...");
        const { data: setting, error: settingsError } = await supabase
            .from('app_settings')
            .select('value')
            .eq('key', 'wallet_data')
            .single();

        if (settingsError && settingsError.code !== 'PGRST116') {
            console.error("Error fetching app_settings:", settingsError);
            throw new Error(`Database Error: ${settingsError.message}`);
        }

        if (setting && setting.value) {
            console.log("Loading existing wallet...");
            try {
                wallet = await Wallet.import(JSON.parse(setting.value));
                console.log("Wallet imported successfully");
            } catch (importErr: any) {
                console.error("Failed to import wallet:", importErr);
                throw new Error(`Wallet Import Failed: ${importErr.message}`);
            }
        } else {
            console.log("Creating NEW wallet...");
            try {
                wallet = await Wallet.create({ networkId: Coinbase.networks.BaseMainnet });
                const walletData = wallet.export();

                const { error: upsertError } = await supabase.from('app_settings').upsert({
                    key: 'wallet_data',
                    value: JSON.stringify(walletData)
                });

                if (upsertError) {
                    console.error("Failed to save new wallet to DB:", upsertError);
                    throw new Error(`Database Upsert Failed: ${upsertError.message}`);
                }

                console.log("✅ Wallet created and saved!");
            } catch (createErr: any) {
                console.error("Failed to create wallet:", createErr);
                throw new Error(`Wallet Creation Failed: ${createErr.message}`);
            }
        }

        const walletAddress = await wallet.getDefaultAddress();
        console.log(`Server Wallet Address: ${walletAddress.toString()}`);

        return new Response(JSON.stringify({
            success: true,
            address: walletAddress.toString(),
            message: "Copy this address and update contracts.ts"
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    } catch (error: any) {
        console.error("Fatal Error in get_wallet_address:", error.message);
        return new Response(JSON.stringify({
            success: false,
            message: error.message
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: error.message.includes("Config Error") ? 500 : 400
        })
    }
})
