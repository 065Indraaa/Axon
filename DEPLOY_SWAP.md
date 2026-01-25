# Quick Deploy Guide - Supabase Edge Function

## Option 1: Via CLI (jika sudah link)

```powershell
# Link project (sekali saja)
.\supabase link --project-ref dgzaqrdqinhwvpjjggjr

# Deploy function
.\supabase functions deploy swap

# Set secrets
.\supabase secrets set CDP_API_KEY_NAME="your-key-here"
.\supabase secrets set CDP_PRIVATE_KEY="your-private-key-here"
```

## Option 2: Via Supabase Dashboard (lebih mudah)

1. Buka https://supabase.com/dashboard/project/dgzaqrdqinhwvpjjggjr
2. Klik **Edge Functions** di sidebar
3. Klik **Create a new function** atau **Deploy**
4. Copy isi file `supabase/functions/swap/index.ts`
5. Paste ke editor
6. Click **Deploy**
7. Go to **Settings** → **Edge Function Secrets**
8. Add:
   - `CDP_API_KEY_NAME` = your CDP key
   - `CDP_PRIVATE_KEY` = your private key

**Option 2 lebih cepat karena tidak perlu CLI!**

## Test Endpoint

Setelah deploy, test dengan:
```bash
curl -X POST \
  https://dgzaqrdqinhwvpjjggjr.supabase.co/functions/v1/swap \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"userAddress":"0x...","fromAsset":"0x...","toAsset":"0x...","amount":"1.0","network":"base-mainnet"}'
```
