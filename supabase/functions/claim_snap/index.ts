import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createPublicClient, http, parseEther } from 'https://esm.sh/viem@2'
import { privateKeyToAccount } from 'https://esm.sh/viem@2/accounts'
import { base, baseSepolia } from 'https://esm.sh/viem@2/chains'
import { createSmartAccountClient } from 'https://esm.sh/permissionless@0.1.25'
import { privateKeyToSimpleSmartAccount } from 'https://esm.sh/permissionless@0.1.25/accounts'

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

        // 4. SMART ACCOUNT SETUP
        const privateKey = Deno.env.get('VAULT_PRIVATE_KEY') as `0x${string}`
        const paymasterUrl = Deno.env.get('PAYMASTER_URL')
        if (!privateKey || !paymasterUrl) throw new Error("Server Config Error: Missing Keys")

        const isMainnet = paymasterUrl.includes("/base/") && !paymasterUrl.includes("sepolia");
        const targetChain = isMainnet ? base : baseSepolia;

        // Use Premium Node for RPC
        const publicClient = createPublicClient({
            transport: http(paymasterUrl),
            chain: targetChain
        })

        const simpleAccount = await privateKeyToSimpleSmartAccount(publicClient, {
            privateKey,
            factoryAddress: "0x9406Cc6185a346906296840746125a0E44976454", // SimpleAccount Factory
            entryPoint: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
        })

        // Paymaster Client (Coinbase Compatible)
        const paymasterClient = createPublicClient({
            chain: targetChain,
            transport: http(paymasterUrl),
        })

        const smartAccountClient = createSmartAccountClient({
            account: simpleAccount,
            chain: targetChain,
            bundlerTransport: http(paymasterUrl),
            middleware: {
                sponsorUserOperation: async (args) => {
                    const response = await paymasterClient.request({
                        method: 'pm_sponsorUserOperation',
                        params: [
                            args.userOperation,
                            args.entryPoint
                        ]
                    })
                    return response
                }
            }
        })

        // Token Configuration
        const TOKEN_MAP: Record<string, { address: `0x${string}`, decimals: number }> = {
            'USDC': { address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', decimals: 6 },
            'USDT': { address: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2', decimals: 6 },
            'IDRX': { address: '0x18Bc5bcC660cf2B9cE3cd51a404aFe1a0cBD3C22', decimals: 18 },
            'MYRC': { address: '0x3eD03E95DD894235090B3d4A49E0C3239EDcE59e', decimals: 18 },
            'XSGD': { address: '0x0A4C9cb2778aB3302996A34BeFCF9a8Bc288C33b', decimals: 6 },
        }

        // 5. Execute Transaction (Gasless)
        let txHash: `0x${string}`;
        const tokenConfig = TOKEN_MAP[snap.token_symbol];

        if (tokenConfig) {
            // ERC20 Transfer
            const amountInUnits = BigInt(Math.floor(claimAmount * Math.pow(10, tokenConfig.decimals)));

            // Pre-Flight Check: Ensure Vault has Balance
            const balanceAbi = [{ "inputs": [{ "name": "account", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }] as const;

            try {
                const vaultBalance = await publicClient.readContract({
                    address: tokenConfig.address,
                    abi: balanceAbi,
                    functionName: 'balanceOf',
                    args: [simpleAccount.address]
                }) as bigint;

                if (vaultBalance < amountInUnits) {
                    console.error(`CRITICAL: Vault Insufficient Funds. Has: ${vaultBalance}, Needs: ${amountInUnits}`);
                    throw new Error(`System Wallet Empty (${simpleAccount.address}). Please fund with ${snap.token_symbol}.`);
                }
            } catch (err: any) {
                if (err.message.includes("System Wallet Empty")) throw err;
                console.warn("Balance check warning:", err.message);
            }

            txHash = await smartAccountClient.sendTransaction({
                to: tokenConfig.address,
                data: "0xa9059cbb" + // transfer method id
                    claimer_address.replace('0x', '').padStart(64, '0') +
                    amountInUnits.toString(16).padStart(64, '0') as `0x${string}`,
            })
        } else {
            // Native ETH Transfer
            const amountWei = BigInt(Math.floor(claimAmount * 1e18));
            txHash = await smartAccountClient.sendTransaction({
                to: claimer_address as `0x${string}`,
                value: amountWei,
            })
        }

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

        console.log(`Success! Sender/Vault: ${simpleAccount.address}`);

        return new Response(JSON.stringify({
            success: true,
            tx: txHash,
            sender: simpleAccount.address,
            amount: claimAmount
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    } catch (error: any) {
        return new Response(JSON.stringify({ success: false, message: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })
    }
})
