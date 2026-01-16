import { useAccount, useReadContracts } from 'wagmi';
import { TOKENS } from '../config/tokens';
import { ERC20_ABI } from '../config/contracts';
import { formatUnits } from 'viem';
import { useMemo } from 'react';

export function useWalletBalances() {
    const { address } = useAccount();

    const contracts = useMemo(() => {
        if (!address) return [];
        return TOKENS.map((token) => ({
            address: token.address,
            abi: ERC20_ABI,
            functionName: 'balanceOf',
            args: [address],
        }));
    }, [address]);

    const { data, isLoading, refetch } = useReadContracts({
        contracts: contracts as any,
        query: {
            enabled: !!address && contracts.length > 0,
        }
    });

    const balances = useMemo(() => {
        if (!data) {
            return TOKENS.reduce((acc, token) => {
                acc[token.symbol] = '0.00';
                return acc;
            }, {} as Record<string, string>);
        }

        return TOKENS.reduce((acc, token, index) => {
            const rawBalance = data[index]?.result as bigint | undefined;
            if (rawBalance !== undefined) {
                const formatted = formatUnits(rawBalance, token.decimals);
                // Human readable format: 2 decimal places
                acc[token.symbol] = Number(formatted).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                });
            } else {
                acc[token.symbol] = '0.00';
            }
            return acc;
        }, {} as Record<string, string>);
    }, [data]);

    return {
        balances,
        isLoading,
        refetch,
    };
}
