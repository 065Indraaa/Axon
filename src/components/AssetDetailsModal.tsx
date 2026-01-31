import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    ArrowDownLeft,
    Clock,
    ShieldCheck,
    Globe
} from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { TokenData } from '../config/tokens';
import clsx from 'clsx';
import { useMemo } from 'react';
import { AssetRealtimeChart } from './AssetRealtimeChart';

interface AssetDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    asset: TokenData & { balance: string; change24h: number };
    idrValue: string;
    transactions: any[];
}

export function AssetDetailsModal({ isOpen, onClose, asset, idrValue, transactions }: AssetDetailsModalProps) {
    // Filter transactions for this specific asset
    const assetTransactions = useMemo(() => {
        return transactions.filter(tx =>
            tx.from_token === asset.symbol || tx.to_token === asset.symbol || tx.token_symbol === asset.symbol
        ).slice(0, 5);
    }, [transactions, asset.symbol]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
import { AssetRealtimeChart } from './AssetRealtimeChart';
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-lg z-[110]"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-x-0 bottom-0 z-[111] bg-[#F5F5F7] rounded-t-[32px] overflow-hidden max-h-[90vh] flex flex-col"
                    >
                        {/* Drag Handle */}
                        <div className="w-full h-8 flex items-center justify-center">
                            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
                        </div>

                        {/* Sticky Header */}
                        <div className="px-6 pb-4 flex justify-between items-center bg-[#F5F5F7]/80 backdrop-blur-md">
                            <div className="flex items-center gap-3">
                                <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg", asset.color)}>
                                    {asset.icon}
                                </div>
                                <div>
                                    <h2 className="text-xl font-black uppercase tracking-tight leading-none">{asset.name}</h2>
                                    <p className="text-[10px] font-bold text-axon-steel uppercase tracking-widest">{asset.symbol} • Base Network</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors">
                                <X className="w-5 h-5 text-axon-obsidian" />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto px-6 pb-20 space-y-8">
                            {/* Principal Stats */}
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-axon-steel uppercase tracking-[0.2em] mb-2">Portfolio Value</p>
                                <div className="flex items-baseline gap-2">
                                    <h1 className="text-5xl font-black tracking-tighter italic">Rp{idrValue}</h1>
                                    <span className="text-axon-steel font-mono font-medium text-sm">IDR</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={clsx("flex items-center gap-1 text-xs font-bold", asset.change24h >= 0 ? "text-green-600" : "text-red-600")}>
                                        {asset.change24h >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                                        {asset.change24h}%
                                    </div>
                                    <span className="text-[10px] text-gray-400 font-mono uppercase">Past 24H</span>
                                </div>
                            </div>

                            {/* Real-time chart and price */}
                            <div className="flex flex-col items-center w-full mb-4">
                                <div className="text-2xl font-black text-axon-obsidian mb-2">
                                    {asset.symbol} Price
                                </div>
                                <div className="w-full h-32">
                                    <AssetRealtimeChart symbol={asset.symbol === 'IDRX' ? 'USDC-USD' : `${asset.symbol}-USD`} />
                                </div>
                            </div>

                            {/* Assets Actions */}
                            <div className="grid grid-cols-2 gap-3">
                                <Button className="!h-16 !bg-axon-obsidian !text-white flex items-center justify-center gap-2">
                                    <ArrowDownLeft className="w-5 h-5 text-axon-neon" />
                                    <span>RECEIVE</span>
                                </Button>
                                <Button className="!h-16 !bg-white !text-axon-obsidian border border-gray-200 flex items-center justify-center gap-2">
                                    <ArrowUpRight className="w-5 h-5 text-primary" />
                                    <span>SEND</span>
                                </Button>
                            </div>

                            {/* Detail Stats */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-bold text-axon-steel uppercase tracking-[0.2em]">Market Stats</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-white rounded-2xl border border-gray-100">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">On-chain Balance</p>
                                        <p className="text-lg font-black">{asset.balance} {asset.symbol}</p>
                                    </div>
                                    <div className="p-4 bg-white rounded-2xl border border-gray-100">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Network</p>
                                        <div className="flex items-center gap-1.5">
                                            <img src="/base-logo.png" className="w-4 h-4" alt="" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                            <p className="text-sm font-black uppercase">BASE MAINNET</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Transactions for Asset */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-[10px] font-bold text-axon-steel uppercase tracking-[0.2em]">Recent Activity</h3>
                                    <Clock className="w-4 h-4 text-gray-300" />
                                </div>
                                <div className="space-y-2">
                                    {assetTransactions.length > 0 ? (
                                        assetTransactions.map((tx, idx) => (
                                            <Card key={idx} className="p-4 flex items-center justify-between !shadow-none !border-gray-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center font-bold text-xs uppercase">
                                                        {tx.type === 'swap' ? '⇆' : tx.type === 'receive' ? '↓' : '↑'}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold uppercase tracking-wide">{tx.type}</p>
                                                        <p className="text-[10px] text-axon-steel">{new Date(tx.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <p className="font-bold text-xs font-mono">{tx.amount} {asset.symbol}</p>
                                            </Card>
                                        ))
                                    ) : (
                                        <div className="text-center py-6 border border-dashed border-gray-200 rounded-2xl">
                                            <span className="text-[10px] text-gray-400 font-mono uppercase tracking-widest">No activity for {asset.symbol}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Bottom Sticky Info */}
                        <div className="mt-auto p-4 bg-white border-t border-gray-100 flex items-center justify-center gap-4">
                            <div className="flex items-center gap-1.5 text-[8px] font-bold text-axon-steel uppercase tracking-widest">
                                <ShieldCheck className="w-3 h-3" /> SECURE LEDGER
                            </div>
                            <div className="w-1 h-1 bg-gray-300 rounded-full" />
                            <div className="flex items-center gap-1.5 text-[8px] font-bold text-axon-steel uppercase tracking-widest">
                                <Globe className="w-3 h-3" /> VERIFIED ON BASE
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
