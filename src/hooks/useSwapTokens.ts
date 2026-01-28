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

            // Dynamic import to avoid SSR issues if any
            const { getSwapQuote, buildSwapTransaction } = await import('@coinbase/onchainkit/api');

            console.log('🧪 executeSwap - Using API Key:', !!API_KEY);

            // Find token data for OnchainKit's Token object requirement
            const fromTokenData = TOKENS.find(t => t.address.toLowerCase() === fromToken.toLowerCase());
            const toTokenData = TOKENS.find(t => t.address.toLowerCase() === toToken.toLowerCase());

            if (!fromTokenData || !toTokenData) {
                throw new Error('Token configuration not found');
            }

            // Construct Token objects with mandatory chainId (detected from wallet) and required image property
            const currentChainId = chainId || 8453; // Fallback to Base Mainnet if not detected
            const fromAsset = { ...fromTokenData, chainId: currentChainId, image: '' };
            const toAsset = { ...toTokenData, chainId: currentChainId, image: '' };


            // Convert amount to string based on decimals (OnchainKit human-readable requirement)
            // No atoms conversion needed for these specific API versions

            // 1. Get the quote first
            const quote = await getSwapQuote({
                from: fromAsset,
                to: toAsset,
                amount: amount,
                useAggregator: true, // Required in v0.35.0
                maxSlippage: params.maxSlippage || '3' // Default 3% slippage for IDRX liquidity
            });

            if ('error' in quote) {
                console.error('❌ OnchainKit Swap Quote Error:', quote.error);
                throw new Error(quote.error || 'Failed to get swap quote');
            }

            console.log('📦 OnchainKit Swap Quote:', quote);

            // 2. Build the transaction for signing
            // Use any cast for params to bypass fragile v0.35.0 type definitions 
            // while keeping the logic correct for the aggregator.
            const txResponse = await buildSwapTransaction({
                from: fromAsset,
                to: toAsset,
                amount: amount,
                taker: address,
                maxSlippage: params.maxSlippage || '3'
            } as any);

            if ('error' in txResponse) {
                console.error('❌ OnchainKit Build Transaction Error:', txResponse.error);
                throw new Error(txResponse.error || 'Failed to build swap transaction');
            }

            // Execute the swap transaction returned by the builder
            if (txResponse.transaction) {
                console.log('💳 Sending transaction to wallet for signing...');
                sendTransaction({
                    to: txResponse.transaction.to as Address,
                    data: txResponse.transaction.data as `0x${string}`,
                    value: BigInt(txResponse.transaction.value || '0'),
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
