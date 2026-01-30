/**
 * Environment Variables Debug Utility
 * Check all environment variables and their status
 */

/**
 * Validate a single environment variable
 */
function validateEnvVar(key: string): { isValid: boolean; value: string; prefix: string; length: number } {
    const value = import.meta.env[key];
    const isValid = value && value.trim() !== '' && value !== 'undefined';
    return {
        isValid,
        value: isValid ? value.trim() : '',
        prefix: isValid ? value.trim().substring(0, Math.min(8, value.length)) + '...' : 'MISSING',
        length: isValid ? value.length : 0
    };
}

export function debugEnvironmentVariables() {
    console.group('🌍 Environment Variables Debug');
    
    const requiredVars = [
        'VITE_PUBLIC_ONCHAINKIT_API_KEY',
        'VITE_CDP_PROJECT_ID',
        'VITE_SUPABASE_URL',
        'VITE_SUPABASE_ANON_KEY'
    ];
    
    const optionalVars = [
        'VITE_PAYMASTER_URL'
    ];
    
    const envVars: Record<string, any> = {};
    
    // Check required variables
    requiredVars.forEach(key => {
        const validation = validateEnvVar(key);
        envVars[key] = validation;
        
        console.log(`${key}:`, {
            exists: validation.isValid,
            prefix: validation.prefix,
            length: validation.length,
            isEmpty: !validation.isValid
        });
        
        if (!validation.isValid) {
            console.error(`❌ MISSING: ${key}`);
        } else {
            console.log(`✅ PRESENT: ${key}`);
        }
    });
    
    // Check optional variables
    optionalVars.forEach(key => {
        const validation = validateEnvVar(key);
        envVars[key] = validation;
        
        if (validation.isValid) {
            console.log(`✅ PRESENT: ${key}`);
        } else {
            console.warn(`⚠️ OPTIONAL: ${key}`);
        }
    });

    // Check .env file existence indicators
    console.log('\n📄 Environment File Status:');
    console.log('import.meta.env object keys:', Object.keys(import.meta.env));
    console.log('MODE:', import.meta.env.MODE);
    console.log('DEV:', import.meta.env.DEV);
    console.log('PROD:', import.meta.env.PROD);
    
    // Summary
    const missingRequired = requiredVars.filter(key => !envVars[key].isValid);
    const allRequiredPresent = missingRequired.length === 0;

    console.groupEnd();

    return {
        allRequiredPresent,
        missingRequired,
        envVars
    };
}

/**
 * Create a test environment check function
 */
export function testEnvironmentSetup() {
    console.log('🧪 Testing Environment Setup...');
    
    const result = debugEnvironmentVariables();
    
    if (!result.allRequiredPresent) {
        console.error('❌ Environment Setup Issues Found:');
        console.error('Missing required variables:', result.missingRequired);
        
        // Provide specific guidance
        result.missingRequired.forEach(varName => {
            switch (varName) {
                case 'VITE_PUBLIC_ONCHAINKIT_API_KEY':
                    console.error('- Get API Key from Coinbase Developer Portal');
                    console.error('- Add to .env file as VITE_PUBLIC_ONCHAINKIT_API_KEY=your_key');
                    break;
                case 'VITE_CDP_PROJECT_ID':
                    console.error('- Get Project ID from Coinbase CDP Dashboard');
                    console.error('- Add to .env file as VITE_CDP_PROJECT_ID=your_project_id');
                    break;
                case 'VITE_SUPABASE_URL':
                    console.error('- Add Supabase URL to .env file');
                    break;
                case 'VITE_SUPABASE_ANON_KEY':
                    console.error('- Add Supabase anonymous key to .env file');
                    break;
                case 'VITE_PAYMASTER_URL':
                    console.error('- Construct URL: https://api.developer.coinbase.com/rpc/v1/base/YOUR_API_KEY');
                    console.error('- Add to .env file (optional)');
                    break;
                default:
                    console.error(`- Add ${varName} to .env file`);
            }
        });
        
        // Check if .env file exists by trying to detect common issues
        console.error('\n🔍 Troubleshooting Tips:');
        console.error('1. Ensure .env file exists in project root');
        console.error('2. Restart your development server after adding .env');
        console.error('3. Check that variables start with VITE_');
        console.error('4. Ensure no spaces around = in .env file');
    } else {
        console.log('✅ All required environment variables are present!');
    }
    
    return result;
}

/**
 * Quick environment validation for runtime checks
 */
export function validateEnvironmentForSwaps(): { isValid: boolean; missing: string[] } {
    const required = ['VITE_PUBLIC_ONCHAINKIT_API_KEY', 'VITE_CDP_PROJECT_ID'];
    const missing = required.filter(key => {
        const value = import.meta.env[key];
        return !value || value.trim() === '' || value === 'undefined';
    });
    
    return {
        isValid: missing.length === 0,
        missing
    };
}