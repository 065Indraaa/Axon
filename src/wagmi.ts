import { http, createConfig } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { coinbaseWallet } from 'wagmi/connectors';


export const config = createConfig({
    chains: [base, baseSepolia],
    connectors: [
        coinbaseWallet({
            appName: 'AXON SECURE',
            appLogoUrl: 'https://axon.finance/logo.png',
            preference: 'smartWalletOnly', // Enforce CDP Smart Wallet only
            version: '4',
            projectId: import.meta.env.VITE_CDP_PROJECT_ID,
            // Configure paymaster for gas sponsorship - CDP Smart Wallet supports gasless transactions
            paymasterUrls: {
                [base.id]: import.meta.env.VITE_PAYMASTER_URL || `https://api.developer.coinbase.com/rpc/v1/base/${import.meta.env.VITE_PUBLIC_ONCHAINKIT_API_KEY}`,
                [baseSepolia.id]: `https://api.developer.coinbase.com/rpc/v1/base-sepolia/${import.meta.env.VITE_PUBLIC_ONCHAINKIT_API_KEY}`,
            },
            // CDP Smart Wallet specific configurations
            enableMobileWalletLink: true,
            // Force embedded wallet behavior
            connection: {
                requireAuth: false, // Allow connection without initial auth for better UX
            },
            // Enhanced security features for CDP
            security: {
                enforceOrigin: true,
            },
        } as any),
    ],
    transports: {
        [base.id]: http(`https://api.developer.coinbase.com/rpc/v1/base/${import.meta.env.VITE_PUBLIC_ONCHAINKIT_API_KEY}`),
        [baseSepolia.id]: http(`https://api.developer.coinbase.com/rpc/v1/base-sepolia/${import.meta.env.VITE_PUBLIC_ONCHAINKIT_API_KEY}`),
    },
});

// Base Account Configuration
export const BASE_ACCOUNT_CONFIG = {
    chainId: base.id,
    name: 'Base',
    features: {
        passkeyAuth: true,
        gaslessTransactions: true,
        smartWallet: true,
    }
};
