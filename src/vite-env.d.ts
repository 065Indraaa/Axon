/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_PUBLIC_ONCHAINKIT_API_KEY: string
    readonly VITE_COINBASE_CLIENT_ID: string
    readonly VITE_COINBASE_CLIENT_SECRET: string
    readonly VITE_COINBASE_REDIRECT_URI: string
    readonly VITE_COINBASE_VERIFICATION_SCHEMA_ID: string
    readonly VITE_SUPABASE_URL: string
    readonly VITE_SUPABASE_ANON_KEY: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
