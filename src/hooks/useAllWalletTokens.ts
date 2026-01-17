import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { TokenData, SNAP_TOKENS } from '../config/tokens';
import { formatUnits } from 'viem';

interface CoinbaseTokenBalance {
    token_address: string;
    token_name: string;
    token_symbol: string;
    token_decimals: number;
    balance: string;
}

interface TokenWithBalance extends TokenData {
    balance: string;
    balanceNum: number;
}

/**
 * Hook to fetch ALL tokens from wallet using Coinbase CDP API
 * Falls back to hardcoded SNAP_TOKENS if API fails
 */
export function useAllWalletTokens() {
    const { address, isConnected } = useAccount();
    const [tokens, setTokens] = useState<TokenWithBalance[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!address || !isConnected) {
            setTokens([]);
            setIsLoading(false);
            return;
        }

        const fetchTokens = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const apiKey = import.meta.env.VITE_PUBLIC_ONCHAINKIT_API_KEY;

                if (!apiKey) {
                    throw new Error('OnchainKit API Key not configured');
                }

                // Fetch token balances from Coinbase CDP API
                const response = await fetch(
                    `https://api.developer.coinbase.com/rpc/v1/base/${apiKey}`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            jsonrpc: '2.0',
                            id: 1,
                            method: 'cdp_listTokenBalances',
                            params: {
                                address: address,
                                network: 'base', // or 'base-sepolia' for testnet
                            },
                        }),
                    }
                );

                if (!response.ok) {
                    throw new Error(`CDP API error: ${response.statusText}`);
                }

                const data = await response.json();

                if (data.error) {
                    throw new Error(data.error.message || 'CDP API returned error');
                }

                const cdpTokens: CoinbaseTokenBalance[] = data.result?.balances || [];

                // Map CDP tokens to our TokenData format
                const mappedTokens: TokenWithBalance[] = cdpTokens
                    .map((cdpToken) => {
                        const balanceNum = parseFloat(
                            formatUnits(BigInt(cdpToken.balance), cdpToken.token_decimals)
                        );

                        // Find matching token from our hardcoded list for icon/color
                        const knownToken = SNAP_TOKENS.find(
                            (t) => t.address.toLowerCase() === cdpToken.token_address.toLowerCase()
                        );

                        return {
                            symbol: cdpToken.token_symbol,
                            name: cdpToken.token_name,
                            address: cdpToken.token_address as `0x${string}`,
                            decimals: cdpToken.token_decimals,
                            icon: knownToken?.icon || cdpToken.token_symbol.charAt(0),
                            color: knownToken?.color || 'bg-gray-500',
                            balance: balanceNum.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 4,
                            }),
                            balanceNum,
                        };
                    })
                    .filter((token) => token.balanceNum > 0) // Only show tokens with balance
                    .sort((a, b) => b.balanceNum - a.balanceNum); // Sort by balance DESC

                setTokens(mappedTokens);
            } catch (err) {
                console.error('Error fetching tokens from CDP:', err);
                setError(err instanceof Error ? err.message : 'Unknown error');

                // Fallback: Use hardcoded tokens with manual balance fetch
                // (This will be handled by the existing useWalletBalances hook)
                setTokens([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTokens();

        // Refetch every 10 seconds for realtime updates
        const interval = setInterval(fetchTokens, 10000);

        return () => clearInterval(interval);
    }, [address, isConnected]);

    return {
        tokens,
        isLoading,
        error,
    };
}
