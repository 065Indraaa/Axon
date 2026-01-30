/**
 * Environment Debug Script
 * Run this in browser console to debug environment variables
 */

console.log('🌍 Environment Debug Script Started');

// Function to safely get env var
const getEnv = (key: string) => {
    const value = import.meta.env[key];
    console.log(`${key}:`, {
        exists: !!value,
        type: typeof value,
        isString: typeof value === 'string',
        isEmpty: value === '',
        isUndefined: value === undefined,
        isNull: value === null,
        length: value?.length || 0,
        preview: value ? `${value.substring(0, 10)}...` : 'MISSING'
    });
    return value;
};

console.log('\n📋 All Environment Variables:');
const allEnvKeys = Object.keys(import.meta.env);
allEnvKeys.forEach(key => {
    if (key.startsWith('VITE_')) {
        getEnv(key);
    }
});

console.log('\n🎯 Critical Variables Check:');
const criticalVars = [
    'VITE_PUBLIC_ONCHAINKIT_API_KEY',
    'VITE_CDP_PROJECT_ID',
    'VITE_PAYMASTER_URL',
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
];

let allPresent = true;
criticalVars.forEach(varName => {
    const value = getEnv(varName);
    if (!value || value.trim() === '') {
        console.error(`❌ MISSING: ${varName}`);
        allPresent = false;
    } else {
        console.log(`✅ PRESENT: ${varName}`);
    }
});

console.log('\n🔍 Additional Info:');
console.log('MODE:', import.meta.env.MODE);
console.log('DEV:', import.meta.env.DEV);
console.log('PROD:', import.meta.env.PROD);
console.log('Base URL:', import.meta.env.BASE_URL);

console.log('\n📊 Summary:');
console.log(`All critical variables present: ${allPresent ? '✅ YES' : '❌ NO'}`);

if (!allPresent) {
    console.log('\n🛠️ Solutions:');
    console.log('1. Create .env file in project root');
    console.log('2. Copy from .env.example');
    console.log('3. Replace placeholder values with real ones');
    console.log('4. Restart development server');
}

// Test window location (sometimes environment variables are loaded differently)
console.log('\n🌐 Window Location:');
console.log('Current URL:', window.location.href);
console.log('Protocol:', window.location.protocol);
console.log('Hostname:', window.location.hostname);

export { getEnv };