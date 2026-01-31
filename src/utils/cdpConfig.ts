/**
 * CDP Environment Configuration Validator
 * Ensures all required environment variables are properly configured for CDP Smart Wallet
 */

import { validateEnvVar } from './envDebugSimple';

export interface CDPEnvironmentStatus {
  isValid: boolean;
  projectId: {
    configured: boolean;
    value: string;
    error?: string;
  };
  apiKey: {
    configured: boolean;
    value: string;
    error?: string;
  };
  paymaster: {
    configured: boolean;
    value: string;
    error?: string;
  };
  network: {
    name: string;
    chainId: number;
  };
}

/**
 * Validate CDP Smart Wallet environment configuration
 */
export function validateCDPEnvironment(): CDPEnvironmentStatus {
  // Validate required CDP environment variables
  const projectId = validateEnvVar('VITE_CDP_PROJECT_ID');
  const apiKey = validateEnvVar('VITE_PUBLIC_ONCHAINKIT_API_KEY');
  const paymaster = validateEnvVar('VITE_PAYMASTER_URL');

  // Check if critical components are configured
  const isCriticalValid = projectId.isValid && apiKey.isValid;
  const isFullyValid = isCriticalValid && paymaster.isValid;

  // Determine network based on environment
  const network = {
    name: 'Base Mainnet',
    chainId: 8453
  };

  const status: CDPEnvironmentStatus = {
    isValid: isFullyValid,
    projectId: {
      configured: projectId.isValid,
      value: projectId.value,
      error: projectId.isValid ? undefined : 'CDP Project ID is required for CDP Smart Wallet'
    },
    apiKey: {
      configured: apiKey.isValid,
      value: apiKey.value,
      error: apiKey.isValid ? undefined : 'OnchainKit API Key is required for CDP Smart Wallet'
    },
    paymaster: {
      configured: paymaster.isValid,
      value: paymaster.value,
      error: paymaster.isValid ? undefined : 'Paymaster URL is optional but recommended for gasless transactions'
    },
    network
  };

  // Log status for debugging
  console.group('🔍 CDP Environment Validation');
  console.log('✅ Valid:', status.isValid);
  console.log('📱 Project ID:', status.projectId.configured ? '✓ Configured' : '✗ Missing');
  console.log('🔑 API Key:', status.apiKey.configured ? '✓ Configured' : '✗ Missing');
  console.log('⚡ Paymaster:', status.paymaster.configured ? '✓ Configured' : '⚠ Optional');
  console.log('🌐 Network:', `${network.name} (${network.chainId})`);
  console.groupEnd();

  return status;
}

/**
 * Get CDP Smart Wallet RPC URLs
 */
export function getCDPRpcUrls() {
  const apiKey = import.meta.env.VITE_PUBLIC_ONCHAINKIT_API_KEY;
  
  if (!apiKey) {
    throw new Error('OnchainKit API Key not configured');
  }

  return {
    base: `https://api.developer.coinbase.com/rpc/v1/base/${apiKey}`,
    baseSepolia: `https://api.developer.coinbase.com/rpc/v1/base-sepolia/${apiKey}`
  };
}

/**
 * Check if environment is properly configured for CDP Smart Wallet
 */
export function isCDPConfigured(): boolean {
  const status = validateCDPEnvironment();
  return status.projectId.configured && status.apiKey.configured;
}