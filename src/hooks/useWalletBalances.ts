import { useAccount, useReadContracts } from 'wagmi';
import { TOKENS, TokenData } from '../config/tokens';
import { ERC20_ABI } from '../config/contracts';
import { formatUnits } from 'viem';
import { useMemo } from 'react';

export function useWalletBalances(customTokens?: TokenData[]) {
    const { address } = useAccount();
    const tokensToWatch = customTokens || TOKENS;

    const contracts = useMemo(() => {
        if (!address) return [];
        return tokensToWatch.map((token) => ({
            address: token.address,
            abi: ERC20_ABI,
            functionName: 'balanceOf',
            args: [address],
        }));
    }, [address, tokensToWatch]);

    const { data, isLoading, refetch, error } = useReadContracts({
        contracts: contracts as any,
        query: {
            enabled: !!address && contracts.length > 0,
            refetchInterval: 5000,
        }
    });

    if (error) {
        console.error("❌ useReadContracts Error:", error);
    }

    const balances = useMemo(() => {
        if (!data) {
            return tokensToWatch.reduce((acc, token) => {
                acc[token.symbol] = '0.00';
                return acc;
            }, {} as Record<string, string>);
        }

        return tokensToWatch.reduce((acc, token, index) => {
            const result = data[index];
            const rawBalance = result?.result as bigint | undefined;
            const resError = result?.error;

            if (resError) {
                console.error(`❌ Error fetching balance for ${token.symbol}:`, resError);
            }

            if (rawBalance !== undefined) {
                const formatted = formatUnits(rawBalance, token.decimals);
                console.log(`💰 Real-time Balance [${token.symbol}]:`, formatted);
                // Formatting logic
                acc[token.symbol] = Number(formatted).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 4,
                });
            } else {
                acc[token.symbol] = '0.00';
            }
            return acc;
        }, {} as Record<string, string>);
    }, [data, tokensToWatch]);

    return {
        balances,
        isLoading,
        refetch,
    };
}
