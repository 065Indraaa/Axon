import { ArrowUpRight, ArrowDownLeft, Search, Filter, RefreshCw, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { useTransactionHistory } from '../hooks/useTransactionHistory';
import { useAccount } from 'wagmi';

export default function History() {
    const { isConnected } = useAccount();
    const { transactions, isLoading } = useTransactionHistory();

    return (
        <div className="min-h-screen bg-[#F5F5F7] pb-24 font-sans text-axon-obsidian">
            {/* HEADER: COMPACT STANDARD */}
            <div className="relative px-6 pt-8 pb-4 sticky top-0 z-30">
                {/* Background: Glass + Dot Matrix Pattern */}
                <div className="absolute inset-0 bg-white/85 backdrop-blur-xl border-b border-gray-200" />
                <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />

                <div className="relative z-10 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <h1 className="text-lg font-black tracking-tight text-axon-obsidian font-mono uppercase">
                            On-Chain Activity
                        </h1>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-gray-400 font-mono">RPC: CDP LIVE</span>
                            <button className="w-6 h-6 rounded-sm bg-gray-100 flex items-center justify-center border border-gray-200 hover:bg-gray-200 transition">
                                <Filter className="w-3 h-3 text-axon-obsidian" />
                            </button>
                        </div>
                    </div>

                    {/* Integrated Search - Compact */}
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search hash or address..."
                            className="w-full bg-gray-50/50 border border-gray-200 rounded-sm pl-9 pr-3 py-2 text-xs font-mono focus:outline-none focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Timeline List */}
            <div className="px-6 py-4 space-y-6">
                {!isConnected ? (
                    <div className="text-center py-10">
                        <p className="text-xs font-bold text-gray-400 uppercase">Connect Wallet to view history</p>
                    </div>
                ) : isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 text-axon-obsidian animate-spin mb-2" />
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Scanning Blocks...</p>
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-swiss border border-gray-200">
                        <RefreshCw className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">No Recent Transactions</p>
                        <p className="text-[10px] text-gray-300 max-w-[200px] mx-auto">Scanned last 20 blocks via CDP RPC. Make a transaction to see it here.</p>
                    </div>
                ) : (
                    <div>
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 pl-1">Recent Activity</h3>
                        <div className="space-y-2">
                            {transactions.map((tx, idx) => (
                                <motion.div
                                    key={tx.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <div className="group flex items-center justify-between p-3 bg-white border border-gray-200 rounded-swiss hover:shadow-md hover:border-primary/30 transition-all cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className={clsx(
                                                "w-10 h-10 rounded-md flex items-center justify-center border transition-colors relative overflow-hidden",
                                                tx.type === 'send' ? "bg-orange-50 border-orange-100" : "bg-axon-ether/10 border-axon-ether/20"
                                            )}>
                                                {tx.type === 'send' ?
                                                    <ArrowUpRight className="w-5 h-5 text-orange-600 relative z-10" /> :
                                                    <ArrowDownLeft className="w-5 h-5 text-axon-ether relative z-10" />
                                                }
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-axon-obsidian text-sm uppercase">{tx.title}</h4>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-mono text-gray-400">{tx.date}</span>
                                                    <span className="w-1 h-1 rounded-full bg-green-500"></span>
                                                    <span className="text-[10px] font-mono text-axon-steel">{tx.status}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={clsx(
                                                "font-bold text-sm font-mono tracking-tight",
                                                tx.type === 'receive' ? "text-axon-ether" : "text-axon-obsidian"
                                            )}>{tx.amount}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
