/**
 * IDRX Token Debug Utility
 * For troubleshooting IDRX swap issues
 */

import { TOKENS } from '../config/tokens';

export interface IdrxDebugInfo {
  tokenConfig: any;
  contractAddress: string;
  decimals: number;
  symbol: string;
  networkInfo: {
    baseId: number;
    baseSepoliaId: number;
  };
  troubleshooting: string[];
}

/**
 * Get IDRX token debug information
 */
export function getIdrxDebugInfo(): IdrxDebugInfo {
  const idrxToken = TOKENS.find(t => t.symbol === 'IDRX');
  
  return {
    tokenConfig: idrxToken,
    contractAddress: '0x18Bc5bcC660cf2B9cE3cd51a404aFe1a0cBD3C22',
    decimals: 2, // Important: IDRX uses 2 decimals
    symbol: 'IDRX',
    networkInfo: {
      baseId: 8453,
      baseSepoliaId: 84532
    },
    troubleshooting: [
      'Ensure IDRX address is correct: 0x18Bc5bcC660cf2B9cE3cd51a404aFe1a0cBD3C22',
      'IDRX uses 2 decimals (not 6 like USDC)',
      'Minimum amount for IDRX swap: 0.01 USDC',
      'Gas fees sponsored by Coinbase paymaster',
      'Higher slippage tolerance: 5% recommended',
      'Check liquidity before large swaps'
    ]
  };
}

/**
 * Log comprehensive IDRX debug information
 */
export function debugIdrxSwap(params: {
  amount: string;
  userAddress: string;
  chainId?: number;
  error?: any;
}): void {
  console.group('🇮🇩 IDRX Swap Debug Information');
  
  const debug = getIdrxDebugInfo();
  
  console.log('Token Configuration:', debug.tokenConfig);
  console.log('Contract Address:', debug.contractAddress);
  console.log('Decimals:', debug.decimals);
  console.log('Network IDs:', debug.networkInfo);
  
  console.log('Swap Parameters:', {
    amount: params.amount,
    userAddress: params.userAddress,
    chainId: params.chainId,
    amountInSmallestUnit: parseFloat(params.amount) * Math.pow(10, debug.decimals)
  });
  
  if (params.error) {
    console.error('Swap Error Details:', {
      message: params.error.message,
      code: params.error.code,
      details: params.error.details
    });
    
    // Specific IDRX error analysis
    if (params.error.message?.includes('UNPREDICTABLE_GAS_LIMIT')) {
      console.warn('Gas estimation failed - likely due to:');
      console.warn('- Insufficient IDRX liquidity');
      console.warn('- Contract execution complexity');
      console.warn('- Network congestion');
    }
  }
  
  console.log('Troubleshooting Checklist:');
  debug.troubleshooting.forEach((item, index) => {
    console.log(`${index + 1}. ${item}`);
  });
  
  console.groupEnd();
}

/**
 * Validate IDRX amount formatting
 */
export function validateIdrxAmount(amount: string): {
  isValid: boolean;
  error?: string;
  recommendations?: string[];
} {
  const amountNum = parseFloat(amount);
  
  if (isNaN(amountNum)) {
    return {
      isValid: false,
      error: 'Amount is not a valid number',
      recommendations: ['Enter a numeric amount like 10.50']
    };
  }
  
  if (amountNum <= 0) {
    return {
      isValid: false,
      error: 'Amount must be greater than 0',
      recommendations: ['Enter a positive amount']
    };
  }
  
  if (amountNum < 0.01) {
    return {
      isValid: false,
      error: 'Amount too small',
      recommendations: ['Minimum amount is 0.01 USDC for IDRX swaps']
    };
  }
  
  return { isValid: true };
}

/**
 * Get environment check for IDRX swaps
 */
export function checkIdrxEnvironment(): {
  isConfigured: boolean;
  missing: string[];
  warnings: string[];
} {
  const missing: string[] = [];
  const warnings: string[] = [];
  
  // Check environment variables
  if (!import.meta.env.VITE_PUBLIC_ONCHAINKIT_API_KEY) {
    missing.push('OnchainKit API Key');
  }
  
  if (!import.meta.env.VITE_CDP_PROJECT_ID) {
    missing.push('Coinbase CDP Project ID');
  }
  
  if (!import.meta.env.VITE_PAYMASTER_URL) {
    warnings.push('Paymaster URL not configured - gas fees may apply');
  }
  
  return {
    isConfigured: missing.length === 0,
    missing,
    warnings
  };
}