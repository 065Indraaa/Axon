import { http, createConfig } from 'wagmi'
import { base, baseSepolia } from 'wagmi/chains'
import { coinbaseWallet } from 'wagmi/connectors'

export const config = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    coinbaseWallet({
      appName: 'BaseGo',
      preference: 'smartWalletOnly',
      appLogoUrl: 'https://basego.app/logo.png',
    }),
  ],
  ssr: false,
  transports: {
    // Use Coinbase Developer Platform RPC (High Performance)
    [base.id]: http(`https://api.developer.coinbase.com/rpc/v1/base/${import.meta.env.VITE_PUBLIC_ONCHAINKIT_API_KEY}`),
    [baseSepolia.id]: http(`https://api.developer.coinbase.com/rpc/v1/base-sepolia/${import.meta.env.VITE_PUBLIC_ONCHAINKIT_API_KEY}`),
  },
})

// Base Network Info - Zero gas fees for smart wallet transactions
export const BASE_INFO = {
  name: 'Base',
  chainId: base.id,
  currency: 'ETH',
  explorerUrl: 'https://basescan.org',
  rpcUrl: 'https://mainnet.base.org',
  features: {
    freeGas: true, // Smart wallets on Base have sponsored gas
    instantConfirmation: true,
    lowFees: true,
  }
}

