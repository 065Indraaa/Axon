# Safe Testing Strategy (AXON Snap)

To avoid losing real funds during testing, follow these three methods:

## 1. Use Base Sepolia (Recommended)
This is the "Gold Standard" for testing. It works exactly like mainnet but uses free "fake" money.
1. **Change Secret**: Set your `PAYMASTER_URL` to a Sepolia Paymaster:
   ```powershell
   .\supabase.exe secrets set PAYMASTER_URL="https://api.developer.coinbase.com/rpc/v1/base-sepolia/..."
   ```
2. **Use Sepolia ETH/USDC**: Get free tokens from a faucet (e.g., [Coinbase Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)).
3. **Contracts.ts**: Update the address to Sepolia test tokens (e.g., Sepolia USDC: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`).

## 2. Local Testing (Supabase Serve)
Testing without deploying to the cloud.
1. **Run Locally**:
   ```powershell
   .\supabase.exe functions serve --no-verify-jwt
   ```
2. **Create a local `.env`** in `supabase/functions/` with the same secrets.
3. **Check Crash**: If the code crashes, you'll see it here before any transaction is even attempted.

## 3. Dry-Run / Simulation
You can modify `claim_snap/index.ts` temporarily to "Simulate" instead of "Send".

### How to read Logs safely:
Before the transaction is sent, the code logs "Sending claim transaction...". 
If there's an error in your logic (keys, address, etc.), it will fail **before** that line.

Check your logs in Supabase Dashboard:
`Project -> Edge Functions -> claim_snap -> Logs`

---
**Need a Sepolia Setup?** I can help update your `contracts.ts` and `index.ts` to fully support a "Test Mode" toggle if you wish.
