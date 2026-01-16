import { ArrowUpRight, ArrowDownLeft, Search, Filter } from 'lucide-react';
import { Card } from '../components/ui/Card';
import clsx from 'clsx';
import { motion } from 'framer-motion';

export default function History() {
    const transactions = [
        { id: 1, type: 'send', title: 'KOPI KENANGAN', amount: '-Rp 35.000', date: 'TODAY, 10:30 AM', status: 'SETTLED' },
        { id: 2, type: 'receive', title: 'TOP UP USDC', amount: '+Rp 500.000', date: 'YESTERDAY', status: 'CONFIRMED' },
        { id: 3, type: 'send', title: 'STARBUCKS', amount: '-Rp 65.000', date: 'OCT 24', status: 'SETTLED' },
        { id: 4, type: 'send', title: 'GOPAY TOPUP', amount: '-Rp 100.000', date: 'OCT 22', status: 'SETTLED' },
        { id: 5, type: 'receive', title: 'REFUND', amount: '+Rp 25.000', date: 'OCT 20', status: 'CONFIRMED' },
    ];

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
                            Activity
                        </h1>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-gray-400 font-mono">FILTER: ALL</span>
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
                {/* Today Group */}
                <div>
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 pl-1">Today</h3>
                    <div className="space-y-2">
                        {transactions.slice(0, 1).map((tx, idx) => (
                            <motion.div
                                key={tx.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
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
                                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
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

                {/* Yesterday Group */}
                <div>
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 pl-1">Yesterday</h3>
                    <div className="space-y-2">
                        {transactions.slice(1, 2).map((tx, idx) => (
                            <motion.div
                                key={tx.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.15 }}
                            >
                                <div className="group flex items-center justify-between p-3 bg-white border border-gray-100 rounded-swiss hover:border-axon-neon transition-all cursor-pointer opacity-80 hover:opacity-100">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-md flex items-center justify-center border bg-gray-50 border-gray-100 group-hover:bg-axon-obsidian group-hover:border-axon-obsidian group-hover:text-white transition-colors duration-300">
                                            <ArrowDownLeft className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors relative z-10" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-axon-obsidian text-sm uppercase group-hover:text-primary transition-colors">{tx.title}</h4>
                                            <span className="text-[10px] font-mono text-gray-400">{tx.date}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-sm font-mono text-axon-ether">{tx.amount}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Previous Group */}
                <div>
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 pl-1">October</h3>
                    <div className="space-y-2">
                        {transactions.slice(2).map((tx, idx) => (
                            <motion.div
                                key={tx.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 + (idx * 0.05) }}
                            >
                                <div className="group flex items-center justify-between p-3 bg-white border border-gray-100 rounded-swiss hover:shadow-md hover:border-primary/30 transition-all cursor-pointer opacity-70 hover:opacity-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-md flex items-center justify-center border bg-gray-50 border-gray-200">
                                            {tx.type === 'send' ?
                                                <ArrowUpRight className="w-4 h-4 text-gray-500" /> :
                                                <ArrowDownLeft className="w-4 h-4 text-gray-500" />
                                            }
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-axon-obsidian uppercase tracking-wide mb-0.5">{tx.title}</h4>
                                            <span className="text-[10px] font-mono text-gray-400">{tx.date}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={clsx(
                                            "font-bold text-sm font-mono",
                                            tx.type === 'receive' ? "text-axon-ether" : "text-axon-obsidian"
                                        )}>{tx.amount}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
