import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { supabase } from '../lib/supabase';

export interface Transaction {
    id: string;
    type: 'send' | 'receive' | 'swap' | 'snap_create' | 'snap_claim';
    title: string;
    amount: string;
    date: string;
    status: 'CONFIRMED' | 'PENDING' | 'FAILED';
    hash: string;
    from_token?: string;
    to_token?: string;
}

export function useTransactionHistory() {
    const { address } = useAccount();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!address) {
            setTransactions([]);
            return;
        }

        const fetchHistory = async () => {
            setIsLoading(true);
            try {
                // Fetch from Supabase transactions table
                const { data, error } = await supabase
                    .from('transactions')
                    .select('*')
                    .eq('user_address', address)
                    .order('created_at', { ascending: false })
                    .limit(50);

                if (error) throw error;

                // Transform to Transaction format
                const formatted: Transaction[] = (data || []).map((tx: any) => ({
                    id: tx.id,
                    type: tx.type,
                    title: formatTitle(tx),
                    amount: formatAmount(tx),
                    date: formatDate(tx.created_at),
                    status: tx.status || 'CONFIRMED',
                    hash: tx.tx_hash || '',
                    from_token: tx.from_token,
                    to_token: tx.to_token,
                }));

                setTransactions(formatted);
            } catch (err) {
                console.error('Failed to fetch transaction history:', err);
                setTransactions([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();

        // Realtime subscription for new transactions
        const channel = supabase
            .channel('transactions')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'transactions',
                    filter: `user_address=eq.${address}`
                },
                () => {
                    fetchHistory(); // Refresh on new transaction
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [address]);

    return { transactions, isLoading };
}

function formatTitle(tx: any): string {
    switch (tx.type) {
        case 'swap':
            return `Swap ${tx.from_token} → ${tx.to_token}`;
        case 'snap_create':
            return `Created Snap`;
        case 'snap_claim':
            return `Claimed Snap`;
        case 'send':
            return `Sent ${tx.to_token || 'Token'}`;
        case 'receive':
            return `Received ${tx.to_token || 'Token'}`;
        default:
            return 'Transaction';
    }
}

function formatAmount(tx: any): string {
    if (tx.type === 'swap') {
        return `${tx.amount} ${tx.from_token}`;
    }
    return `${tx.amount} ${tx.to_token || ''}`;
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
