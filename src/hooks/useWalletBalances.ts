import { useAccount, useReadContracts } from 'wagmi';
import { TOKENS } from '../config/tokens';
import { ERC20_ABI } from '../config/contracts';
import { formatUnits } from 'viem';
import { useMemo } from 'react';

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

    const { data, isLoading, refetch } = useReadContracts({
        contracts: contracts as any,
        query: {
            enabled: !!address && contracts.length > 0,
            refetchInterval: 5000,
        }
    });

    const balances = useMemo(() => {
        if (!data) {
            return tokensToWatch.reduce((acc, token) => {
                acc[token.symbol] = '0.00';
                return acc;
            }, {} as Record<string, string>);
        }

        return tokensToWatch.reduce((acc, token, index) => {
            const rawBalance = data[index]?.result as bigint | undefined;
            if (rawBalance !== undefined) {
                const formatted = formatUnits(rawBalance, token.decimals);
                // Formatting logic
                acc[token.symbol] = Number(formatted).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 4, // Allow more precision for small balances
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
