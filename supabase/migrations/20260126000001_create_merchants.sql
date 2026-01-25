-- Create merchants table
CREATE TABLE IF NOT EXISTS public.merchants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    wallet_address TEXT NOT NULL,
    qr_prefix TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read merchants (for scanning)
CREATE POLICY "Allow public read access" ON public.merchants
    FOR SELECT USING (true);

-- Insert dummy merchant for testing
INSERT INTO public.merchants (name, wallet_address, qr_prefix)
VALUES (
    'Kopi Kenangan',
    '0xD570106de907d34384230f2a8281914444E5d76F', -- Using Vault address temporarily for testing
    'AXON:KOPI_KENANGAN_001'
) ON CONFLICT (qr_prefix) DO NOTHING;
