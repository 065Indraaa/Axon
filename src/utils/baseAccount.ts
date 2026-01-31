/**
 * Base Account Authentication Utilities
 * Implements Sign in with Base passkey authentication using CDP Smart Wallet
 */

import { Connector } from 'wagmi';

export interface BaseAccountAuthResult {
  success: boolean;
  address?: string;
  error?: string;
}

/**
 * Initialize CDP Smart Wallet connection with passkey authentication
 */
export async function signInWithBase(
  connector: Connector
): Promise<BaseAccountAuthResult> {
  try {
    console.log('🔐 Initiating CDP Smart Wallet connection...');
    console.log('📱 Connector ID:', connector.id);
    console.log('🔗 Connector Name:', connector.name);
    
    // Verify we're using the CDP Smart Wallet connector
    if (connector.id !== 'coinbaseWalletSDK') {
      throw new Error('CDP Smart Wallet connector required for Base Account authentication');
    }
    
    // Connect using CDP Smart Wallet which supports passkey authentication
    const result = await connector.connect();
    
    if (result?.accounts?.[0]) {
      const address = result.accounts[0];
      console.log(`✅ CDP Smart Wallet connected: ${address}`);
      console.log('🔗 Smart Wallet Address:', address);
      console.log('⚡ Gasless transactions enabled');
      
      return {
        success: true,
        address
      };
    } else {
      throw new Error('No account returned from CDP Smart Wallet connection');
    }
  } catch (error: any) {
    console.error('❌ CDP Smart Wallet connection failed:', error);
    
    // Handle specific error cases
    if (error.name === 'UserRejectedRequestError') {
      return {
        success: false,
        error: 'Passkey authentication was cancelled'
      };
    }
    
    if (error.name === 'ConnectorNotFoundError') {
      return {
        success: false,
        error: 'CDP Smart Wallet connector not found'
      };
    }
    
    if (error.message?.includes('CDP') || error.message?.includes('Smart Wallet')) {
      return {
        success: false,
        error: `CDP Smart Wallet error: ${error.message}`
      };
    }
    
    return {
      success: false,
      error: error.message || 'Failed to connect CDP Smart Wallet'
    };
  }
}

/**
 * Check if passkey authentication is available on the device
 */
export function isPasskeyAvailable(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.navigator &&
    window.navigator.credentials &&
    window.PublicKeyCredential !== undefined
  );
}

/**
 * Generate authentication nonce for Base Account
 */
export function generateAuthNonce(): string {
  return window.crypto.randomUUID().replace(/-/g, '');
}

/**
 * Format address for display
 */
export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Base Account configuration for Base mainnet
 */
export const BASE_ACCOUNT_CONFIG = {
  chainId: '0x2105', // Base Mainnet (8453 in decimal)
  appName: 'AXON SECURE',
  appLogoUrl: 'https://axon.finance/logo.png', // Update with actual logo
};