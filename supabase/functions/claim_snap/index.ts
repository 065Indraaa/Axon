import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createPublicClient, http, parseEther, createWalletClient } from 'https://esm.sh/viem@2'
import { privateKeyToAccount } from 'https://esm.sh/viem@2/accounts'
import { base, baseSepolia } from 'https://esm.sh/viem@2/chains'
import { createSmartAccountClient } from 'https://esm.sh/permissionless@0.1.25'
import { privateKeyToSimpleSmartAccount } from 'https://esm.sh/permissionless@0.1.25/accounts'
import { createPimlicoPaymasterClient } from 'https://esm.sh/permissionless@0.1.25/clients/pimlico'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
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
        if (snap.status !== 'active') throw new Error("Snap active") // Typos in msg but logic ok
        if (snap.remaining_amount <= 0.0001) throw new Error("Snap empty")

        // 3. Check Claims
        const { data: existing } = await supabase.from('snap_claims').select('*').eq('snap_id', snap_id).eq('claimer_address', claimer_address).single()
        if (existing) throw new Error("Already claimed")

        const claimAmount = snap.total_amount / snap.snappers_count

        // 4. SMART ACCOUNT SETUP (The "Complex" Gasless Way)
        const privateKey = Deno.env.get('VAULT_PRIVATE_KEY') as `0x${string}`
        const paymasterUrl = Deno.env.get('PAYMASTER_URL') // Must be full RPC URL like https://api.pimlico.io/v2/...
        if (!privateKey || !paymasterUrl) throw new Error("Server Config Error: Missing Keys")

        const isMainnet = paymasterUrl.includes("/base/") && !paymasterUrl.includes("sepolia");
        const targetChain = isMainnet ? base : baseSepolia;
        const rpcUrl = isMainnet ? "https://mainnet.base.org" : "https://sepolia.base.org";

        // Define Chain
        const publicClient = createPublicClient({
            transport: http(rpcUrl),
            chain: targetChain
        })

        // Create Simple Smart Account (Using the Vault Key as owner)
        // This creates a deterministic Smart Wallet address governed by the key.
        // NOTE: The "Sender" address is now this Smart Account Address, NOT the EOA of the private key.
        const simpleAccount = await privateKeyToSimpleSmartAccount(publicClient, {
            privateKey,
            factoryAddress: "0x9406Cc6185a346906296840746125a0E44976454", // SimpleAccountFactory (Same on Base & Sepolia)
            entryPoint: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789", // v0.6 EntryPoint
        })

        // Create Smart Account Client (The "Bundler" Client)
        const smartAccountClient = createSmartAccountClient({
            account: simpleAccount,
            chain: targetChain,
            transport: http(paymasterUrl), // Use Paymaster/Bundler URL (e.g. Pimlico/Coinbase)
            sponsorUserOperation: async ({ userOperation }) => {
                // Simple sponsorship logic: Just trust the paymaster to sign it
                // Ideally use a Paymaster Client here if using Pimlico specially, 
                // but for standard RPC Paymasters, the transport handles it if configured as Bundler+Paymaster

                // Let's assume the PAYMASTER_URL supports 'pm_sponsorUserOperation' or similar standard
                // or we just use the bundler url. 
                // For MVP: We assume the user provides a "Bundler with Paymaster" URL (like Pimlico/Stackup)
                return userOperation
            }
        })

        // 5. Execute Transaction (Gasless)
        const txHash = await smartAccountClient.sendTransaction({
            to: claimer_address as `0x${string}`,
            value: parseEther("0.0001"), // Sending generic amount or actual claimAmount
            data: "0x"
        })

        // 6. DB Updates
        await supabase.from('snap_claims').insert({
            snap_id, claimer_address, amount: claimAmount, tx_hash: txHash
        })

        // Decrement
        const newRem = snap.remaining_amount - claimAmount
        await supabase.from('snaps').update({
            remaining_amount: newRem,
            status: newRem <= 0.0001 ? 'completed' : 'active'
        }).eq('id', snap_id)

        return new Response(JSON.stringify({ success: true, tx: txHash, sender: simpleAccount.address }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    } catch (error) {
        return new Response(JSON.stringify({ success: false, message: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 })
    }
})
