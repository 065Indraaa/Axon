import { useCallback, useState } from 'react';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { Address } from 'viem';
import { supabase } from '../lib/supabase';
import { useEffect, useRef } from 'react';
import { TOKENS } from '../config/tokens';
import { setOnchainKitConfig } from '@coinbase/onchainkit';

// Initialize OnchainKit at module level
const API_KEY = import.meta.env.VITE_PUBLIC_ONCHAINKIT_API_KEY;
console.log('🧪 useSwapTokens Module Load - API Key present:', !!API_KEY);

setOnchainKitConfig({
    apiKey: API_KEY,
    projectId: import.meta.env.VITE_CDP_PROJECT_ID,
});

// Unused Supabase environment variables removed for lint safety

interface SwapParams {
    fromToken: Address;
    toToken: Address;
    amount: string;
    decimals: number;
    maxSlippage?: string;
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

        try {
            setSwapError(null);
            setIsPending(true);

            console.log(`🔍 Getting swap quote for ${amount} tokens...`);

            // Dynamic import
            const { getSwapQuote, buildSwapTransaction } = await import('@coinbase/onchainkit/api');

            // Find token data
            const fromTokenData = TOKENS.find(t => t.address.toLowerCase() === fromToken.toLowerCase());
            const toTokenData = TOKENS.find(t => t.address.toLowerCase() === toToken.toLowerCase());

            if (!fromTokenData || !toTokenData) {
                throw new Error('Token configuration not found');
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

            // 1. Get the quote
            // OnchainKit getSwapQuote with isAmountInDecimals: true is safer for human-readable input
            const quoteParams = {
                from: fromAsset,
                to: toAsset,
                amount: amount,
                useAggregator: true,
                maxSlippage: params.maxSlippage || '3',
                isAmountInDecimals: true
            };

            console.log('💎 Requesting quote with params:', JSON.stringify(quoteParams, null, 2));

            const quote = await getSwapQuote(quoteParams);

            if ('error' in quote) {
                console.error('❌ OnchainKit Swap Quote Error Object:', quote);
                throw new Error(quote.message || quote.error || 'Failed to get swap quote');
            }

            console.log('📦 OnchainKit Swap Quote Success:', quote);

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
                throw new Error(txResponse.message || txResponse.error || 'Failed to build swap transaction');
            }

            // 3. Execute the swap transaction with Sponsorship Capabilities
            if (txResponse.transaction) {
                console.log('💳 Sending transaction to wallet with sponsorship...');

                // Define capabilities for Gasless/Sponsored transactions
                const capabilities = {
                    paymasterService: {
                        url: `https://api.developer.coinbase.com/rpc/v1/base/${API_KEY}`,
                    },
                };

                sendTransaction({
                    to: txResponse.transaction.to as Address,
                    data: txResponse.transaction.data as `0x${string}`,
                    value: BigInt(txResponse.transaction.value || '0'),
                    // @ts-ignore - Pass capabilities for Coinbase Smart Wallet sponsorship
                    capabilities
                });
            } else {
                console.error('❌ No transaction data in swap response');
                throw new Error('No transaction data received from aggregator');
            }

            setIsPending(false);

        } catch (err: any) {
            console.error('Swap error:', err);
            // Some errors are objects with detailed codes
            const errorMsg = err.message || (typeof err === 'string' ? err : 'Swap failed - Check console');
            setSwapError(errorMsg);
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
