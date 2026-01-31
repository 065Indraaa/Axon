import { useCallback, useState } from 'react';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { Address } from 'viem';
import { supabase } from '../lib/supabase';
import { useEffect, useRef } from 'react';
import { TOKENS } from '../config/tokens';
import { setOnchainKitConfig } from '@coinbase/onchainkit';
import { testIdrxSwap } from '../utils/idrxSwapTest';
import { validateIdrxAmount, hasCriticalSwapConfig, getOnchainKitApiKey, getCoinbaseProjectId, getPaymasterUrl, validateEnvironmentForSwaps } from '../utils/envDebugSimple';

const API_KEY = getOnchainKitApiKey();
const PROJECT_ID = getCoinbaseProjectId();
const PAYMASTER_URL = getPaymasterUrl();

console.log('🧪 useSwapTokens Module Load:', {
    hasApiKey: !!API_KEY,
    hasProjectId: !!PROJECT_ID,
    hasPaymasterUrl: !!PAYMASTER_URL,
    apiKeyPrefix: API_KEY ? API_KEY.substring(0, 8) + '...' : 'MISSING',
    projectIdPrefix: PROJECT_ID ? PROJECT_ID.substring(0, 4) + '...' : 'MISSING',
    paymasterPrefix: PAYMASTER_URL ? PAYMASTER_URL.substring(0, 30) + '...' : 'MISSING',
    hasCriticalConfig: hasCriticalSwapConfig()
});

console.log('🧪 useSwapTokens Module Load:', {
    hasApiKey: !!API_KEY,
    hasProjectId: !!PROJECT_ID,
    hasPaymasterUrl: !!PAYMASTER_URL,
    apiKeyPrefix: API_KEY ? API_KEY.substring(0, 8) + '...' : 'MISSING',
    projectIdPrefix: PROJECT_ID ? PROJECT_ID.substring(0, 4) + '...' : 'MISSING',
    paymasterPrefix: PAYMASTER_URL ? PAYMASTER_URL.substring(0, 30) + '...' : 'MISSING',
    envKeys: Object.keys(import.meta.env).filter(k => k.startsWith('VITE_'))
});

// Only initialize OnchainKit if we have the required variables
if (API_KEY && PROJECT_ID) {
    try {
        setOnchainKitConfig({
            apiKey: API_KEY,
            projectId: PROJECT_ID,
        });
        console.log('✅ OnchainKit configured successfully');
    } catch (error) {
        console.error('❌ Failed to configure OnchainKit:', error);
    }
} else {
    console.error('❌ Cannot configure OnchainKit - missing required environment variables');
}

// Unused Supabase environment variables removed for lint safety

interface SwapParams {
    fromToken: Address;
    toToken: Address;
    amount: string;
    decimals: number;
    maxSlippage?: string;
}

// Function to validate IDRX availability
async function validateIdrxAvailability(address: Address, chainId: number) {
    try {
        const { getSwapQuote } = await import('@coinbase/onchainkit/api');
        
        const testQuote = await getSwapQuote({
            from: {
                address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC
                symbol: 'USDC',
                name: 'USD Coin',
                decimals: 6,
                chainId,
                image: ''
            },
            to: {
                address: '0x18Bc5bcC660cf2B9cE3cd51a404aFe1a0cBD3C22', // IDRX
                symbol: 'IDRX',
                name: 'Rupiah Token',
                decimals: 2,
                chainId,
                image: ''
            },
            amount: '1', // Test with 1 USDC
            useAggregator: true,
            maxSlippage: '5',
            isAmountInDecimals: true
        });

        return !('error' in testQuote);
    } catch (error) {
        console.error('IDRX availability check failed:', error);
        return false;
    }
}

export function useSwapTokens() {
    const { address, chainId } = useAccount();
    const { sendTransaction, data: hash } = useSendTransaction();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const [isPending, setIsPending] = useState(false);
    const [swapError, setSwapError] = useState<string | null>(null);
    const swapParamsRef = useRef<SwapParams | null>(null);

    const executeSwap = useCallback(async (params: SwapParams) => {
        swapParamsRef.current = params;
        const { fromToken, toToken, amount } = params;
        if (!address) {
            setSwapError('Wallet not connected');
            return;
        }

        // Environment check - only warn, don't block unless critical
        const hasCriticalConfig = hasCriticalSwapConfig();
        if (!hasCriticalConfig) {
            const errorMessage = 'Critical configuration missing. Check console for details.';
            console.error('❌', errorMessage);
            setSwapError(errorMessage);
            return; // Block the swap if critical config is missing
        }

        // Validate amount
        const amountValidation = validateIdrxAmount(amount);
        if (!amountValidation.isValid) {
            setSwapError(amountValidation.error || 'Invalid amount');
            return;
        }

        try {
            setSwapError(null);
            setIsPending(true);

            console.log(`🔍 Getting swap quote for ${amount} tokens...`);

            // Dynamic import
            const { getSwapQuote, buildSwapTransaction } = await import('@coinbase/onchainkit/api');

            // Find token data
            const fromTokenData = TOKENS.find(t => t.address.toLowerCase() === fromToken.toLowerCase());
            const toTokenData = TOKENS.find(t => t.address.toLowerCase() === toToken.toLowerCase());

            console.log('🔍 Token lookup results:', {
                fromToken,
                toToken,
                fromTokenData: fromTokenData ? `${fromTokenData.symbol} (${fromTokenData.address})` : 'NOT FOUND',
                toTokenData: toTokenData ? `${toTokenData.symbol} (${toTokenData.address})` : 'NOT FOUND'
            });

            if (!fromTokenData || !toTokenData) {
                const missing = [];
                if (!fromTokenData) missing.push(`from: ${fromToken}`);
                if (!toTokenData) missing.push(`to: ${toToken}`);
                throw new Error(`Token configuration not found for: ${missing.join(', ')}`);
            }

            // Special handling for IDRX swaps
            const isIdrxSwap = toTokenData.symbol === 'IDRX';
            if (isIdrxSwap) {
                console.log('🇮🇩 IDRX Swap detected - using enhanced configuration');
                
                // Comprehensive IDRX swap test
                const idrxTest = await testIdrxSwap(amount, address, chainId || 8453);
                if (!idrxTest.canSwap) {
                    const errorDetails = [
                        idrxTest.error,
                        ...(idrxTest.recommendations || [])
                    ].filter(Boolean).join(' | ');
                    throw new Error(`IDRX swap unavailable: ${errorDetails}`);
                }

                if (idrxTest.warnings && idrxTest.warnings.length > 0) {
                    console.warn('🇮🇩 IDRX Swap Warnings:', idrxTest.warnings);
                }
            }

            // Construct Token objects
            const currentChainId = chainId || 8453;
            const fromAsset = {
                address: fromTokenData.address,
                symbol: fromTokenData.symbol,
                name: fromTokenData.name,
                decimals: fromTokenData.decimals,
                chainId: currentChainId,
                image: ''
            };
            const toAsset = {
                address: toTokenData.address,
                symbol: toTokenData.symbol,
                name: toTokenData.name,
                decimals: toTokenData.decimals,
                chainId: currentChainId,
                image: ''
            };

            // IDRX-specific validation and configuration
            if (isIdrxSwap) {
                console.log('🇮🇩 IDRX Swap Configuration:', {
                    fromToken: fromAsset.symbol,
                    toToken: toAsset.symbol,
                    fromAmount: amount,
                    decimals: {
                        from: fromAsset.decimals,
                        to: toAsset.decimals
                    },
                    chainId: currentChainId
                });

                // Ensure amount is properly formatted for IDRX decimals
                if (toAsset.decimals === 2 && fromAsset.decimals === 6) {
                    const amountInSmallestUnit = parseFloat(amount);
                    if (amountInSmallestUnit < 100) { // Less than 1 USDC equivalent
                        console.warn('⚠️ Small amount detected for IDRX swap, may fail due to dust');
                    }
                }
            }

            // 1. Get the quote
            // OnchainKit getSwapQuote with isAmountInDecimals: true is safer for human-readable input
            const baseMaxSlippage = params.maxSlippage || '3';
            const quoteParams = {
                from: fromAsset,
                to: toAsset,
                amount: amount,
                useAggregator: true,
                // Use higher slippage for IDRX swaps due to potential liquidity issues
                maxSlippage: isIdrxSwap ? Math.max(parseFloat(baseMaxSlippage), 5).toString() : baseMaxSlippage,
                isAmountInDecimals: true
            };

            console.log('💎 Requesting quote with params:', JSON.stringify(quoteParams, null, 2));

            const quote = await getSwapQuote(quoteParams);

            if ('error' in quote) {
                console.error('❌ OnchainKit Swap Quote Error Object:', quote);
                const errorMsg = quote.message || quote.error || 'Failed to get swap quote';
                // Enhanced error context for IDRX
                if (isIdrxSwap) {
                    console.error('🇮🇩 IDRX Quote Error Details:', {
                        fromAsset,
                        toAsset,
                        amount,
                        chainId: currentChainId,
                        tokenSupport: 'IDRX may not be supported by this aggregator'
                    });
                }
                throw new Error(errorMsg);
            }

            console.log('📦 OnchainKit Swap Quote Success:', {
                hasQuote: !!quote,
                fromAmount: quote.quote?.fromAmount,
                toAmount: quote.quote?.toAmount,
                hasWarning: !!quote.warning,
                warningType: quote.warning?.type
            });

            // 2. Build the transaction
            const buildParams = {
                from: fromAsset,
                to: toAsset,
                amount: amount,
                fromAddress: address, // Type requires fromAddress
                maxSlippage: params.maxSlippage || '3',
                isAmountInDecimals: true
            };

            console.log('🛠️ Building swap transaction with params:', JSON.stringify(buildParams, null, 2));

            const txResponse = await buildSwapTransaction(buildParams as any);

            if ('error' in txResponse) {
                console.error('❌ OnchainKit Build Transaction Error Object:', txResponse);
                const errorMsg = txResponse.message || txResponse.error || 'Failed to build swap transaction';
                
                // Enhanced error context for IDRX
                if (isIdrxSwap) {
                    console.error('🇮🇩 IDRX Build Transaction Error Details:', {
                        fromAsset,
                        toAsset,
                        amount,
                        address,
                        error: txResponse,
                        possibleCauses: [
                            'Insufficient liquidity for IDRX',
                            'IDRX token not supported by aggregator',
                            'Gas estimation failed',
                            'Slippage too high'
                        ]
                    });
                }
                
                throw new Error(errorMsg);
            }

            console.log('🏗️ Transaction Build Success:', {
                hasTransaction: !!txResponse.transaction,
                hasApprove: !!txResponse.approveTransaction,
                to: txResponse.transaction?.to,
                value: txResponse.transaction?.value,
                dataLength: txResponse.transaction?.data?.length
            });

            // 3. Execute the swap transaction with Sponsorship Capabilities
            if (txResponse.transaction) {
                console.log('💳 Sending transaction to wallet with sponsorship...');

                // Define capabilities for Gasless/Sponsored transactions
                // Using correct format for Coinbase Smart Wallet
                const capabilities = PAYMASTER_URL ? {
                    paymasterService: {
                        url: PAYMASTER_URL,
                    },
                } : undefined;

                // Validate transaction data before sending
                if (!txResponse.transaction.to || !txResponse.transaction.data) {
                    console.error('❌ Invalid transaction data:', txResponse.transaction);
                    throw new Error('Invalid transaction data: missing to or data fields');
                }

                console.log('📤 Transaction details:', {
                    to: txResponse.transaction.to,
                    dataLength: txResponse.transaction.data.length,
                    value: txResponse.transaction.value,
                    hasCapabilities: !!capabilities
                });

                sendTransaction({
                    to: txResponse.transaction.to as Address,
                    data: txResponse.transaction.data as `0x${string}`,
                    value: BigInt(txResponse.transaction.value || '0'),
                    capabilities
                });
            } else {
                console.error('❌ No transaction data in swap response');
                throw new Error('No transaction data received from aggregator');
            }

            setIsPending(false);

        } catch (err: any) {
            console.error('Swap error:', err);
            
            // Enhanced error handling for IDRX swaps
            const isIdrxSwap = swapParamsRef.current?.toToken && 
                TOKENS.find(t => t.address.toLowerCase() === swapParamsRef.current.toToken.toLowerCase())?.symbol === 'IDRX';
            
            if (isIdrxSwap) {
                // Debug IDRX-specific errors
                debugIdrxSwap({
                    amount: params.amount,
                    userAddress: address,
                    chainId: chainId || 8453,
                    error: err
                });
                
                // Specific IDRX error handling with actionable messages
                if (err.message?.includes('insufficient funds')) {
                    setSwapError('Insufficient balance for IDRX swap. Please check your USDC balance.');
                } else if (err.message?.includes('UNPREDICTABLE_GAS_LIMIT')) {
                    setSwapError('Gas estimation failed. Try a smaller amount or wait for better liquidity.');
                } else if (err.message?.includes('no route') || err.message?.includes('no path')) {
                    setSwapError('No swap route for IDRX. The token may have insufficient liquidity right now.');
                } else if (err.message?.includes('slippage')) {
                    setSwapError('High slippage detected. Reduce amount or increase tolerance to 5%.');
                } else if (err.message?.includes('Missing OnchainKit API Key')) {
                    setSwapError('API configuration missing. Please contact support.');
                } else {
                    setSwapError('IDRX swap failed. Try again or use a different amount.');
                }
            } else {
                // Generic error handling for other tokens
                let errorMsg = err.message || (typeof err === 'string' ? err : 'Swap failed - Check console');
                if (errorMsg.includes('insufficient funds')) {
                    errorMsg = 'Insufficient balance for this swap.';
                } else if (errorMsg.includes('no route')) {
                    errorMsg = 'No swap route available. Try different tokens.';
                }
                setSwapError(errorMsg);
            }
            
            setIsPending(false);
        }
    }, [address, sendTransaction]);

    // Record transaction when confirmed
    useEffect(() => {
        if (isSuccess && hash && swapParamsRef.current && address) {
            const params = swapParamsRef.current;
            const fromTokenData = TOKENS.find(t => t.address.toLowerCase() === params.fromToken.toLowerCase());
            const toTokenData = TOKENS.find(t => t.address.toLowerCase() === params.toToken.toLowerCase());

            const fromTokenSymbol = fromTokenData?.symbol || 'USD';
            const toTokenSymbol = toTokenData?.symbol || 'IDRX';

            const recordTransaction = async () => {
                try {
                    console.log(`📝 Recording swap: ${params.amount} ${fromTokenSymbol} -> ${toTokenSymbol}`);
                    await supabase.from('transactions').insert({
                        user_address: address,
                        type: 'swap',
                        amount: params.amount,
                        from_token: fromTokenSymbol,
                        to_token: toTokenSymbol,
                        status: 'CONFIRMED',
                        tx_hash: hash,
                        created_at: new Date().toISOString()
                    });
                    console.log(`✅ Swap transaction recorded successfully`);
                } catch (e) {
                    console.error('❌ Failed to record swap transaction:', e);
                }
            };
            recordTransaction();
        }
    }, [isSuccess, hash, address, executeSwap]);

    return {
        executeSwap,
        isPending,
        isConfirming,
        isSuccess,
        error: swapError,
    };
}
