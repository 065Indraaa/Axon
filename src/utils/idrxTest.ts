// IDRX Swap Debugging Test Script
// Run this in the browser console to test IDRX swap functionality

async function testIdrxSwap() {
    console.log('🧪 Testing IDRX Swap Configuration...');
    
    // Test 1: Check if tokens are properly configured
    const tokens = [
        {
            symbol: 'USDC',
            address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
            decimals: 6
        },
        {
            symbol: 'IDRX',
            address: '0x18Bc5bcC660cf2B9cE3cd51a404aFe1a0cBD3C22',
            decimals: 2
        }
    ];
    
    console.log('✅ Token Configuration:', tokens);
    
    // Test 2: Check if OnchainKit is properly configured
    try {
        const { getSwapQuote } = await import('@coinbase/onchainkit/api');
        console.log('✅ OnchainKit imported successfully');
        
        // Test 3: Try to get a quote for a small amount
        const testQuote = await getSwapQuote({
            from: {
                address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
                symbol: 'USDC',
                name: 'USD Coin',
                decimals: 6,
                chainId: 8453,
                image: ''
            },
            to: {
                address: '0x18Bc5bcC660cf2B9cE3cd51a404aFe1a0cBD3C22',
                symbol: 'IDRX',
                name: 'Rupiah Token',
                decimals: 2,
                chainId: 8453,
                image: ''
            },
            amount: '1',
            useAggregator: true,
            maxSlippage: '5',
            isAmountInDecimals: true
        });
        
        if ('error' in testQuote) {
            console.error('❌ Quote test failed:', testQuote);
        } else {
            console.log('✅ Quote test successful:', {
                fromAmount: testQuote.quote?.fromAmount,
                toAmount: testQuote.quote?.toAmount,
                hasWarning: !!testQuote.warning
            });
        }
        
    } catch (error) {
        console.error('❌ OnchainKit test failed:', error);
    }
    
    // Test 4: Check wallet connection
    if (typeof window !== 'undefined' && window.ethereum) {
        console.log('✅ Wallet detected');
        try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            console.log('✅ Connected accounts:', accounts.length);
        } catch (error) {
            console.error('❌ Wallet connection test failed:', error);
        }
    } else {
        console.log('⚠️ No wallet detected');
    }
    
    console.log('🧪 IDRX Swap Test Complete');
    return true;
}

// Auto-run the test
if (typeof window !== 'undefined') {
    window.testIdrxSwap = testIdrxSwap;
    console.log('🔧 IDRX Test function loaded. Run testIdrxSwap() in console to test.');
}