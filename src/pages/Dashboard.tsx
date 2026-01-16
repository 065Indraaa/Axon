import { MapPin, Scan, ArrowUpRight, ChevronDown, Bell, TrendingUp, TrendingDown, Loader2, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import SmartNotification from '../components/SmartNotification';
import { useAxon } from '../context/AxonContext';
import { useState, useMemo } from 'react';
import { TOKENS, TokenData } from '../config/tokens';
import { useWalletBalances } from '../hooks/useWalletBalances';
import { useAccount } from 'wagmi';

export default function Dashboard() {
    const navigate = useNavigate();
    const { city, location } = useAxon();
    const { isConnected } = useAccount();
    const { balances, isLoading: isBalancesLoading } = useWalletBalances();

    const CRYPTO_METADATA = useMemo(() => {
        const changes: Record<string, number> = {
            'USDT': 0.01,
            'USDC': 0.00,
            'WETH': 2.45,
            'cbETH': 1.12,
            'IDRX': -0.15,
            'VIRTUAL': 12.50
        };

        return TOKENS.map(token => ({
            ...token,
            change24h: changes[token.symbol] || 0,
            balance: balances[token.symbol] || '0.00'
        }));
    }, [balances]);

    const [selectedCrypto, setSelectedCrypto] = useState<TokenData>(TOKENS[0]); // Default to USDC
    const [showCryptoSelector, setShowCryptoSelector] = useState(false);

    const currentBalance = balances[selectedCrypto.symbol] || '0.00';

    return (
        <div className="min-h-screen bg-[#0A0A0A] font-sans text-white overflow-x-hidden pb-32">
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-axon-neon/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
                <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#00F0FF_1px,transparent_1px)] [background-size:32px_32px]" />
            </div>

            <SmartNotification />

            {/* HEADER */}
            <div className="relative z-30 px-6 py-6 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-md">
                <div className="flex flex-col">
                    <h1 className="text-sm font-black text-white uppercase tracking-widest font-mono flex items-center gap-2">
                        AXON <span className="text-[10px] bg-axon-neon text-axon-obsidian px-1.5 py-0.5 rounded italic">NEXUS</span>
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <button className="relative p-2 rounded-full border border-white/10 hover:bg-white/5 transition group">
                        <Bell className="w-4 h-4 text-gray-400 group-hover:text-axon-neon transition-colors" />
                        <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-axon-neon rounded-full" />
                    </button>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-axon-neon to-blue-500 border border-white/10 p-px">
                        <div className="w-full h-full rounded-full bg-axon-obsidian overflow-hidden">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedCrypto.symbol}`} alt="Avatar" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative z-10 px-6 pt-8 space-y-10 max-w-lg mx-auto">
                {/* Balance Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center gap-2 mb-4">
                        <MapPin className="w-3 h-3 text-axon-neon" />
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                            {city || 'DENPASAR'}, {location || 'INDONESIA'}
                        </span>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-baseline gap-2">
                            <h2 className="text-6xl font-black text-white italic tracking-tighter transition-all">
                                {currentBalance}
                            </h2>
                            <span className="text-xs font-black text-axon-neon uppercase tracking-widest font-mono">
                                {selectedCrypto.symbol}
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <button
                                    onClick={() => setShowCryptoSelector(!showCryptoSelector)}
                                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-full flex items-center gap-3 hover:bg-white/10 transition group"
                                >
                                    <div className={clsx("w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-lg", selectedCrypto.color)}>
                                        {selectedCrypto.icon}
                                    </div>
                                    <span className="text-xs font-bold text-white uppercase tracking-wider">{selectedCrypto.symbol}</span>
                                    <ChevronDown className={clsx("w-3.5 h-3.5 text-gray-500 group-hover:text-axon-neon transition-transform", showCryptoSelector && "rotate-180")} />
                                </button>

                                <AnimatePresence>
                                    {showCryptoSelector && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute top-full left-0 mt-3 w-48 bg-[#1A1A1A] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl"
                                        >
                                            {TOKENS.map((token) => (
                                                <button
                                                    key={token.symbol}
                                                    onClick={() => {
                                                        setSelectedCrypto(token);
                                                        setShowCryptoSelector(false);
                                                    }}
                                                    className="w-full px-5 py-4 flex items-center gap-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0"
                                                >
                                                    <div className={clsx("w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold", token.color)}>
                                                        {token.icon}
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="font-bold text-xs text-white uppercase">{token.symbol}</p>
                                                        <p className="text-[8px] text-gray-500 font-mono">
                                                            {balances[token.symbol] || '0.00'}
                                                        </p>
                                                    </div>
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <span className="text-[10px] font-mono text-gray-500 uppercase flex items-center gap-2">
                                {isConnected && isBalancesLoading && <Loader2 className="w-2.5 h-2.5 animate-spin text-axon-neon" />}
                                ≈ ${currentBalance} USD
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* Primary Action */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                >
                    <button
                        onClick={() => navigate('/scan')}
                        className="w-full h-32 bg-white/[0.03] border border-white/10 rounded-[32px] p-8 flex items-center justify-between group relative overflow-hidden transition-all hover:border-axon-neon/50"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-axon-neon/10 via-transparent to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <div className="relative z-10 flex flex-col items-start gap-1">
                            <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-axon-neon/10 border border-axon-neon/20 mb-2">
                                <Scan className="w-2.5 h-2.5 text-axon-neon" />
                                <span className="text-[8px] font-bold text-axon-neon uppercase tracking-widest">Smart Vision</span>
                            </div>
                            <span className="text-3xl font-black text-white italic uppercase tracking-tight">SCAN TO PAY</span>
                        </div>
                        <div className="relative z-10 w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:border-axon-neon transition-all">
                            <ArrowUpRight className="w-8 h-8 text-axon-neon" />
                        </div>
                    </button>
                </motion.div>

                {/* Secondary Actions */}
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => navigate('/create-snap')}
                        className="h-20 bg-white/[0.03] border border-white/10 rounded-[24px] flex flex-col items-center justify-center gap-2 hover:bg-white/5 hover:border-axon-neon/30 transition-all group"
                    >
                        <Zap className="w-5 h-5 text-axon-neon" fill="currentColor" />
                        <span className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Axon Snap</span>
                    </button>
                    <button
                        className="h-20 bg-white/[0.03] border border-white/10 rounded-[24px] flex flex-col items-center justify-center gap-2 hover:bg-white/5 hover:border-axon-neon/30 transition-all group"
                    >
                        <ArrowUpRight className="w-5 h-5 text-axon-steel group-hover:text-axon-neon transition-colors" />
                        <span className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Send Asset</span>
                    </button>
                </div>

                {/* Assets Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="space-y-4"
                >
                    <div className="flex justify-between items-end px-1">
                        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest italic">NEURAL ASSETS</h3>
                        <span className="text-[10px] font-mono text-axon-neon/50 uppercase tracking-widest">Base Network</span>
                    </div>

                    <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar -mx-6 px-6 pb-2">
                        {CRYPTO_METADATA.map((token, idx) => (
                            <div key={token.symbol} className="min-w-[280px] snap-center">
                                <div className="bg-white/[0.03] border border-white/10 rounded-[28px] p-6 hover:border-white/20 transition-all group relative overflow-hidden">
                                    <div className={clsx("absolute -right-8 -bottom-8 w-32 h-32 blur-[60px] opacity-[0.05]", token.color)} />

                                    <div className="flex justify-between items-start relative z-10">
                                        <div className="flex items-center gap-4">
                                            <div className={clsx("w-12 h-12 rounded-full flex items-center justify-center text-white text-md font-bold shadow-2xl", token.color)}>
                                                {token.icon}
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-black text-white italic uppercase tracking-tighter">{token.symbol}</h4>
                                                <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">{token.name}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-black text-white italic tracking-tighter">{token.balance}</p>
                                            <div className={clsx("flex items-center justify-end gap-1 mt-1", token.change24h >= 0 ? 'text-green-500' : 'text-red-500')}>
                                                {token.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                                <span className="text-[10px] font-black font-mono">{token.change24h}%</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 h-10 w-full relative z-10">
                                        <svg viewBox="0 0 100 20" className="w-full h-full opacity-30">
                                            <path
                                                d={token.change24h >= 0
                                                    ? "M0,15 Q25,10 50,12 T100,2"
                                                    : "M0,5 Q25,12 50,10 T100,18"
                                                }
                                                fill="none"
                                                stroke={token.color.replace('bg-', '') === 'blue-500' ? '#3B82F6' : '#CCFF00'}
                                                strokeWidth="3"
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Recent Activity */}
                <div className="space-y-6">
                    <div className="flex justify-between items-end px-1">
                        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest italic">RECENT SURGES</h3>
                        <button className="text-[10px] font-bold text-axon-neon hover:text-axon-neon/80 transition-colors uppercase tracking-widest font-mono">Archive</button>
                    </div>

                    <div className="space-y-3">
                        {[
                            { name: 'STARBUCKS NEXUS', time: '14:40', amount: '-12.50', token: 'USDC', icon: '☕' },
                            { name: 'SURGE CLAIMED', time: '11:20', amount: '+42.06', token: 'USDC', icon: 'zap' },
                        ].map((tx, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-sm group-hover:border-axon-neon/50 transition-colors">
                                        {tx.icon === 'zap' ? <Zap className="w-4 h-4 text-axon-neon" fill="currentColor" /> : tx.icon}
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-black text-white italic uppercase tracking-wider">{tx.name}</h4>
                                        <p className="text-[9px] font-mono text-gray-500 uppercase">{tx.time} · SETTLED</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={clsx("text-sm font-black italic tracking-tighter", tx.amount.startsWith('+') ? 'text-axon-neon' : 'text-white')}>
                                        {tx.amount} <span className="text-[10px] font-mono text-gray-500 opacity-50">{tx.token}</span>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

