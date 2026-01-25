import { useCallback, useState } from 'react';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { Address } from 'viem';
import { supabase } from '../lib/supabase';
import { useEffect, useRef } from 'react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface SwapParams {
    fromToken: Address;
    toToken: Address;
    amount: string;
    decimals: number;
}

export function useSwapTokens() {
    const { address } = useAccount();
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

            // Call Supabase Edge Function
            const response = await fetch(`${SUPABASE_URL}/functions/v1/swap`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                },
                body: JSON.stringify({
                    userAddress: address,
                    fromAsset: fromToken,
                    toAsset: toToken,
                    amount: amount,
                    network: 'base-mainnet'
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Swap request failed');
            }

            const data = await response.json();

            // Send transaction to user's wallet for signing
            if (data.transaction) {
                sendTransaction({
                    to: data.transaction.to as Address,
                    data: data.transaction.data as `0x${string}`,
                    value: BigInt(data.transaction.value || '0'),
                });
            }

            setIsPending(false);

        } catch (err: any) {
            console.error('Swap error:', err);
            setSwapError(err.message || 'Swap failed');
            setIsPending(false);
        }
    }, [address, sendTransaction]);

    // Record transaction when confirmed
    useEffect(() => {
        if (isSuccess && hash && swapParamsRef.current && address) {
            const params = swapParamsRef.current;
            const recordTransaction = async () => {
                try {
                    await supabase.from('transactions').insert({
                        user_address: address,
                        type: 'swap',
                        amount: params.amount,
                        from_token: 'USDC', // Assuming USDC for now based on Dashboard logic, or derive from params
                        to_token: 'IDRX',   // Assuming IDRX
                        status: 'CONFIRMED',
                        tx_hash: hash,
                        created_at: new Date().toISOString()
                    });
                    console.log('Swap transaction recorded');
                } catch (e) {
                    console.error('Failed to record swap transaction:', e);
                }
            };
            recordTransaction();
        }
    }, [isSuccess, hash, address]);

    return {
        executeSwap,
        isPending,
        isConfirming,
        isSuccess,
        error: swapError,
    };
}
