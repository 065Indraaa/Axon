/**
 * Environment Variables Debug Utility
 * Enhanced validation for swap functionality
 */

// Helper function to validate environment variables
export const validateEnvVar = (key: string): { isValid: boolean; value: string } => {
    const value = import.meta.env[key as keyof ImportMetaEnv];
    const isValid = Boolean(value && value.trim() !== '' && value !== 'undefined');
    return { isValid, value: isValid ? value.trim() : '' };
};

export function validateEnvironmentForSwaps(): { isValid: boolean; missing: string[] } {
    const missing: string[] = [];
    
    // Check required environment variables
    const apiKey = validateEnvVar('VITE_PUBLIC_ONCHAINKIT_API_KEY');
    const projectId = validateEnvVar('VITE_CDP_PROJECT_ID');
    const paymasterUrl = validateEnvVar('VITE_PAYMASTER_URL');
    
    console.log('🔍 Swap Environment Validation:', {
        hasApiKey: apiKey.isValid,
        hasProjectId: projectId.isValid,
        hasPaymasterUrl: paymasterUrl.isValid,
        apiKeyLength: apiKey.value.length,
        projectIdLength: projectId.value.length,
        paymasterUrlLength: paymasterUrl.value.length,
        apiKeyValue: apiKey.value.substring(0, 8) + '...',
        projectIdValue: projectId.value.substring(0, 4) + '...'
    });
    
    // Only block on CRITICAL missing variables
    if (!apiKey.isValid) {
        console.error('❌ CRITICAL: OnchainKit API Key missing');
        missing.push('OnchainKit API Key');
    }
    
    if (!projectId.isValid) {
        console.error('❌ CRITICAL: CDP Project ID missing');
        missing.push('Coinbase CDP Project ID');
    }
    
    // Paymaster is OPTIONAL - warn but don't block
    if (!paymasterUrl.isValid) {
        console.warn('⚠️ OPTIONAL: Paymaster URL not configured - gas fees may apply');
    }
    
    const isValid = missing.filter(m => !m.includes('Paymaster URL not configured')).length === 0;
    
    console.log(`✅ Environment validation result: ${isValid ? 'PASS' : 'BLOCK'}`, { missing });
    
    return {
        isValid,
        missing
    };
}

/**
 * Check if all critical swap variables are available
 */
export function hasCriticalSwapConfig(): boolean {
    const apiKey = validateEnvVar('VITE_PUBLIC_ONCHAINKIT_API_KEY');
    const projectId = validateEnvVar('VITE_CDP_PROJECT_ID');
    
    return apiKey.isValid && projectId.isValid;
}

/**
 * Get API key safely
 */
export function getOnchainKitApiKey(): string | null {
    const apiKey = validateEnvVar('VITE_PUBLIC_ONCHAINKIT_API_KEY');
    return apiKey.isValid ? apiKey.value : null;
}

/**
 * Get project ID safely
 */
export function getCoinbaseProjectId(): string | null {
    const projectId = validateEnvVar('VITE_CDP_PROJECT_ID');
    return projectId.isValid ? projectId.value : null;
}

/**
 * Get paymaster URL safely
 */
export function getPaymasterUrl(): string | null {
    const paymasterUrl = validateEnvVar('VITE_PAYMASTER_URL');
    return paymasterUrl.isValid ? paymasterUrl.value : null;
}

/**
 * Validate IDRX amount according to token specifications
 * IDRX uses 2 decimal places (Indonesian Rupiah token)
 */
export function validateIdrxAmount(amount: string): { isValid: boolean; error?: string } {
    try {
        // Check if amount is a valid number
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount)) {
            return { isValid: false, error: 'Invalid amount format' };
        }

        // Check if amount is positive
        if (numAmount <= 0) {
            return { isValid: false, error: 'Amount must be greater than 0' };
        }

        // Check decimal precision for IDRX (2 decimal places max)
        const decimalParts = amount.split('.');
        if (decimalParts.length > 1 && decimalParts[1].length > 2) {
            return { isValid: false, error: 'IDRX amount cannot have more than 2 decimal places' };
        }

        // Check minimum amount (equivalent to ~1000 IDR)
        if (numAmount < 0.01) {
            return { isValid: false, error: 'Minimum amount is 0.01 USDC' };
        }

        // Check maximum amount (prevent excessive slippage)
        if (numAmount > 10000) {
            return { isValid: false, error: 'Maximum amount is 10,000 USDC for IDRX swaps' };
        }

        return { isValid: true };
    } catch (error) {
        return { isValid: false, error: 'Amount validation failed' };
    }
}