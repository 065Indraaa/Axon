import { http, createConfig } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { coinbaseWallet } from 'wagmi/connectors';

const isMobile = typeof window !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

export const config = createConfig({
    chains: [base, baseSepolia],
    connectors: [
        coinbaseWallet({
            appName: 'AXON',
            preference: isMobile ? 'all' : 'smartWalletOnly', // 'all' for Base App (auto-connect), 'smartWalletOnly' for Desktop (force embedded)
            version: '4',
            projectId: import.meta.env.VITE_CDP_PROJECT_ID,
        } as any),
    ],
    transports: {
        [base.id]: http(`https://api.developer.coinbase.com/rpc/v1/base/${import.meta.env.VITE_PUBLIC_ONCHAINKIT_API_KEY}`),
        [baseSepolia.id]: http(`https://api.developer.coinbase.com/rpc/v1/base-sepolia/${import.meta.env.VITE_PUBLIC_ONCHAINKIT_API_KEY}`),
    },
});
