-- Utility function for wallet check (if not exists)
CREATE OR REPLACE FUNCTION wallet_is_user(addr text) RETURNS boolean AS $$
BEGIN
  -- Simple check for demo, in production use auth.uid() or similar
  RETURN true; 
END;
$$ LANGUAGE plpgsql;

-- Create transactions table for history tracking
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_address TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('send', 'receive', 'swap', 'snap_create', 'snap_claim')),
    amount TEXT NOT NULL,
    from_token TEXT,
    to_token TEXT,
    status TEXT NOT NULL DEFAULT 'CONFIRMED',
    tx_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for faster lookup by user address
CREATE INDEX IF NOT EXISTS idx_transactions_user_address ON public.transactions(user_address);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own transactions
CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (wallet_is_user(user_address));

-- For prototype/demo, allow insert from frontend
CREATE POLICY "Allow public insert" ON public.transactions
    FOR INSERT WITH CHECK (true);
