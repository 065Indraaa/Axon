import { useState, useEffect } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { parseAbiItem, formatEther, Address } from 'viem';

export interface Transaction {
    id: string;
    type: 'send' | 'receive';
    title: string;
    amount: string;
    date: string;
    status: 'CONFIRMED' | 'PENDING' | 'FAILED';
    hash: string;
}

export function useTransactionHistory() {
    const { address, isConnected } = useAccount();
    const publicClient = usePublicClient();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!isConnected || !address || !publicClient) return;

        const fetchHistory = async () => {
            setIsLoading(true);
            try {
                const currentBlock = await publicClient.getBlockNumber();
                // Scan last 1000 blocks for demo/efficiency 
                // In production with indexing, fetch from API. Direct RPC scan is heavy.
                const fromBlock = currentBlock - 1000n;

                // 1. Fetch ETH Transfers (Scan blocks for transactions)
                // Note: Standard RPCs make scanning *every* tx slow. 
                // We will fetch the last few blocks and filter for user txs to be lighter.
                const recentBlocksToScan = 20;
                const blocks = await Promise.all(
                    Array.from({ length: recentBlocksToScan }).map((_, i) =>
                        publicClient.getBlock({
                            blockNumber: currentBlock - BigInt(i),
                            includeTransactions: true
                        })
                    )
                );

                const txs: Transaction[] = [];

                for (const block of blocks) {
                    for (const tx of block.transactions) {
                        // Check if transaction object is fully populated (it should be with includeTransactions: true)
                        if (typeof tx === 'object' && (tx.from.toLowerCase() === address.toLowerCase() || tx.to?.toLowerCase() === address.toLowerCase())) {
                            const isSend = tx.from.toLowerCase() === address.toLowerCase();
                            txs.push({
                                id: tx.hash,
                                type: isSend ? 'send' : 'receive',
                                title: isSend ? (tx.to ? `To: ${tx.to.substring(0, 6)}...` : 'Contract Interaction') : `From: ${tx.from.substring(0, 6)}...`,
                                amount: `${isSend ? '-' : '+'}${formatEther(tx.value)} ETH`,
                                date: new Date(Number(block.timestamp) * 1000).toLocaleDateString(),
                                status: 'CONFIRMED',
                                hash: tx.hash
                            });
                        }
                    }
                }

                setTransactions(txs);
            } catch (error) {
                console.error("Failed to fetch history:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, [address, isConnected, publicClient]);

    return { transactions, isLoading };
}
