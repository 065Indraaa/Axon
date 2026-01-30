const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { txHash, amount, qrisPayload, merchantName } = await req.json()

        console.log(`[QRIS DISBURSE] Received Request:`);
        console.log(`- TX Hash: ${txHash}`);
        console.log(`- Amount: ${amount}`);
        console.log(`- Merchant: ${merchantName}`);

        // 1. (Optional) Chain Verification
        // In production, we should wait for confirmation and verify that the vault received the funds.
        // For now, we assume the frontend sent a valid hash.

        // 2. DISBURSEMENT GATEWAY INTEGRATION (MOCK)
        // We have liquidity at the gateway (Xendit/Brick)
        console.log(`[GATEWAY] Initiating disbursement to: ${merchantName}`);

        // Simulate API call to Xendit/Brick
        const mockDisbursement = async () => {
            return {
                id: "disb-" + Math.random().toString(36).substr(2, 9),
                status: "COMPLETED",
                external_id: txHash,
                amount: amount,
                bank_code: "QRIS",
                account_holder_name: merchantName
            }
        }

        const result = await mockDisbursement();
        console.log(`[GATEWAY] Disbursement success:`, result.id);

        return new Response(
            JSON.stringify({
                success: true,
                message: "Instant disbursement processed via AXON Gateway",
                gateway_ref: result.id
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error: any) {
        console.error('[QRIS ERR]', error.message)
        return new Response(
            JSON.stringify({ success: false, message: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
