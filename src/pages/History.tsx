import { ArrowUpRight, ArrowDownLeft, Search, Filter, RefreshCw, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransactionHistory } from '../hooks/useTransactionHistory';
import { useAccount } from 'wagmi';

export default function History() {
    const navigate = useNavigate();
    const { isConnected } = useAccount();
    const { transactions, isLoading } = useTransactionHistory();

    // Redirect ke login jika belum login
    useEffect(() => {
        if (!isConnected) {
            navigate('/login');
        }
    }, [isConnected, navigate]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 pb-24 font-sans text-axon-obsidian">
            {/* HEADER: COMPACT STANDARD */}
            <div className="px-6 pt-8 pb-4 sticky top-0 z-30">
                {/* Enhanced Background: Glass + Gradient + Pattern */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/85 to-blue-50/90 backdrop-blur-xl border-b border-gray-200/50" />
                <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_1px,transparent_1px)] [background-size:20px_20px] bg-gradient-to-br from-axon-neon/10 to-transparent" />

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

                    {/* Enhanced Search Bar */}
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search hash, address, or token..."
                            className="w-full bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-xl pl-12 pr-4 py-3 text-sm font-mono focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-lg hover:shadow-xl"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        </div>
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
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-16 bg-white/60 backdrop-blur-sm rounded-3xl border border-white/50 shadow-xl"
                    >
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin-slow" />
                        </div>
                        <p className="text-sm font-bold text-gray-600 uppercase mb-2">No Recent Transactions</p>
                        <p className="text-xs text-gray-400 max-w-[280px] mx-auto leading-relaxed">Start making transactions to see your on-chain activity here. All transactions are secured by Base blockchain.</p>
                        <button className="mt-6 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all">
                            Make First Transaction
                        </button>
                    </motion.div>
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
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        whileHover={{ scale: 1.01, x: 5 }}
                                        className="group flex items-center justify-between p-4 bg-white/60 backdrop-blur-sm border border-white/50 rounded-2xl hover:shadow-xl hover:border-blue-200/50 transition-all cursor-pointer"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={clsx(
                                                "w-12 h-12 rounded-xl flex items-center justify-center border transition-all relative overflow-hidden shadow-md",
                                                tx.type === 'send' ? "bg-gradient-to-br from-orange-50 to-red-50 border-orange-200/50" : "bg-gradient-to-br from-green-50 to-axon-ether/20 border-green-200/50"
                                            )}>
                                                {tx.type === 'send' ?
                                                    <ArrowUpRight className="w-6 h-6 text-orange-600 relative z-10" /> :
                                                    <ArrowDownLeft className="w-6 h-6 text-green-600 relative z-10" />
                                                }
                                                <div className="absolute inset-0 bg-white/20 backdrop-blur-sm" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-axon-obsidian text-base uppercase tracking-wide">{tx.title}</h4>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-xs font-mono text-gray-500">{tx.date}</span>
                                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                    <span className="text-xs font-mono text-gray-600 font-medium">{tx.status}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={clsx(
                                                "font-bold text-base font-mono tracking-tight",
                                                tx.type === 'receive' ? "text-green-600" : "text-axon-obsidian"
                                            )}>{tx.amount}</p>
                                            <div className="text-xs text-gray-400 font-mono mt-1">USD</div>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
