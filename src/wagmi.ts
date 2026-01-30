import { http, createConfig } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { coinbaseWallet } from 'wagmi/connectors';


export const config = createConfig({
    chains: [base, baseSepolia],
    connectors: [
        coinbaseWallet({
            appName: 'AXON',
            preference: 'all', // Allow both Smart Wallet and regular Coinbase Wallet for IDRX compatibility
            version: '4',
            projectId: import.meta.env.VITE_CDP_PROJECT_ID,
            // Configure paymaster for gas sponsorship
            paymasterUrls: {
                [base.id]: `https://api.developer.coinbase.com/rpc/v1/base/${import.meta.env.VITE_PUBLIC_ONCHAINKIT_API_KEY || 'NQTfYj9jR92AAZ4REeBBieHzESBA7lEn'}`,
                [baseSepolia.id]: `https://api.developer.coinbase.com/rpc/v1/base-sepolia/${import.meta.env.VITE_PUBLIC_ONCHAINKIT_API_KEY || 'NQTfYj9jR92AAZ4REeBBieHzESBA7lEn'}`,
            },
        } as any),
    ],
    transports: {
        [base.id]: http(`https://api.developer.coinbase.com/rpc/v1/base/${import.meta.env.VITE_PUBLIC_ONCHAINKIT_API_KEY || 'NQTfYj9jR92AAZ4REeBBieHzESBA7lEn'}`),
        [baseSepolia.id]: http(`https://api.developer.coinbase.com/rpc/v1/base-sepolia/${import.meta.env.VITE_PUBLIC_ONCHAINKIT_API_KEY || 'NQTfYj9jR92AAZ4REeBBieHzESBA7lEn'}`),
    },
});
