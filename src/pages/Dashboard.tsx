import { MapPin, Scan, ArrowUpRight, ChevronDown, Bell, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useAxon } from '../context/AxonContext';
import { useState, useMemo } from 'react';
import { TOKENS, TokenData } from '../config/tokens';
import { useWalletBalances } from '../hooks/useWalletBalances';
import { useAccount } from 'wagmi';

export default function Dashboard() {
    const navigate = useNavigate();
    const { countryName, location: countryCode } = useAxon();
    const { isConnected } = useAccount();
    const { balances, isLoading: isBalancesLoading } = useWalletBalances();

    // Mapping mock changes to actual tokens for display
    const CRYPTO_METADATA = useMemo(() => {
        const changes: Record<string, number> = {
            'USDT': 0.01,
            'USDC': 0.00,
            'IDRX': -0.15,
            'MYRC': 0.08,
            'XSGD': 0.12
        };

        return TOKENS.map(token => ({
            ...token,
            change24h: changes[token.symbol] || 0,
            // REAL WALLET BALANCE:
            // Ensure we use the fetched balance. If it's '0.00' from the hook, it's what the wallet has.
            balance: balances[token.symbol] ?? '0.00'
        }));
    }, [balances]);

    const [selectedCrypto, setSelectedCrypto] = useState<TokenData>(TOKENS[0]); // Default to USDC
    const [showCryptoSelector, setShowCryptoSelector] = useState(false);

    // Get current balance for display
    // LOGIC: If Indonesia (ID), we calculate TOTAL VALUE in IDRX (simulating conversion) and force that as display.
    // If Global, we use the selected crypto standard logic.
    const isIndonesia = countryCode === 'ID';

    const idrxBalanceDisplay = useMemo(() => {
        if (!isIndonesia) return '0.00';

        // Simple Estimation Simulation:
        // In real world this would summing specific values. 
        // For UI now, we just take the IDRX balance if available or convert USDC/USDT total.
        // Assuming 1 USDC = 15,500 IDRX (mock rate in context)

        const usdcBal = parseFloat((balances['USDC'] || '0').replace(/,/g, ''));
        const usdtBal = parseFloat((balances['USDT'] || '0').replace(/,/g, ''));
        const idrxBal = parseFloat((balances['IDRX'] || '0').replace(/,/g, ''));

        // Mock Conversion logic (Auto-Convert via "Paymaster")
        const convertedTotal = idrxBal + (usdcBal * 15500) + (usdtBal * 15500);

        return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(convertedTotal);
    }, [isIndonesia, balances]);

    const currentBalance = isIndonesia ? idrxBalanceDisplay : (balances[selectedCrypto.symbol] || '0.00');
    const displaySymbol = isIndonesia ? 'IDRX' : selectedCrypto.symbol;
    const displayIcon = isIndonesia ? 'Rp' : (selectedCrypto.icon || '$');
    const displayColor = isIndonesia ? 'bg-red-600' : selectedCrypto.color;

    return (
        <div className="min-h-screen bg-[#F5F5F7] pb-32 font-sans text-axon-obsidian">

            {/* HEADER: COMPACT STANDARD */}
            <div className="relative px-6 pt-8 pb-4 flex justify-between items-center sticky top-0 z-30">
                {/* Background: Glass + Dot Matrix Pattern */}
                <div className="absolute inset-0 bg-white/85 backdrop-blur-xl border-b border-gray-200" />
                <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />

                {/* Content: Left */}
                <div className="relative z-10 flex flex-col">
                    <h1 className="text-lg font-black tracking-tight text-axon-obsidian leading-none flex items-center gap-2 font-mono">
                        AXON <span className="text-[8px] font-bold bg-axon-obsidian text-axon-neon px-1.5 py-0.5 rounded-sm">V2</span>
                    </h1>
                </div>

                {/* Content: Right */}
                <div className="relative z-10 flex items-center gap-3">
                    <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center bg-white hover:bg-gray-50 transition shadow-sm group">
                        <Bell className="w-3.5 h-3.5 text-axon-obsidian group-hover:rotate-12 transition-transform" />
                    </button>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 border-2 border-white shadow-md ring-1 ring-gray-100" />
                </div>
            </div>

            <div className="px-6 space-y-5 pt-2">
                {/* Balance Section - Reduced Size */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.4 }}
                >
                    <div className="flex items-center gap-2 mb-2 px-2 py-1 -ml-2">
                        <MapPin className="w-3.5 h-3.5 text-primary animate-pulse" />
                        <span className="text-[10px] font-bold tracking-widest uppercase text-axon-steel">
                            {countryName || 'LOCATING...'}
                        </span>
                    </div>

                    {/* Reduced Balance Display */}
                    <h2 className="text-3xl font-extrabold text-axon-obsidian tracking-tighter leading-none mb-2">
                        {currentBalance}
                    </h2>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <button
                                onClick={() => !isIndonesia && setShowCryptoSelector(!showCryptoSelector)}
                                className={clsx(
                                    "bg-white border border-gray-200 px-3 py-1.5 rounded-full flex items-center gap-2 transition shadow-sm group",
                                    !isIndonesia && "hover:bg-gray-50",
                                    isIndonesia && "cursor-default"
                                )}
                            >
                                <div className={clsx("w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold", displayColor)}>
                                    {displayIcon}
                                </div>
                                <span className="text-sm font-bold text-axon-obsidian">{displaySymbol}</span>
                                {!isIndonesia && <ChevronDown className={clsx("w-3.5 h-3.5 text-axon-steel group-hover:text-axon-obsidian transition-transform", showCryptoSelector && "rotate-180")} />}
                            </button>

                            <AnimatePresence>
                                {showCryptoSelector && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-swiss shadow-xl z-50 overflow-hidden"
                                    >
                                        {TOKENS.map((asset) => (
                                            <button
                                                key={asset.symbol}
                                                onClick={() => {
                                                    setSelectedCrypto(asset);
                                                    setShowCryptoSelector(false);
                                                }}
                                                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                                            >
                                                <div className={clsx("w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold", asset.color)}>
                                                    {asset.icon}
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-bold text-xs text-axon-obsidian">{asset.symbol}</p>
                                                    <p className="text-[10px] text-axon-steel font-mono">
                                                        {balances[asset.symbol] || '0.00'}
                                                    </p>
                                                </div>
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <span className="text-sm font-mono text-axon-steel">
                            {isConnected && isBalancesLoading ? (
                                <Loader2 className="w-3 h-3 animate-spin inline mr-1" />
                            ) : null}
                            {isIndonesia ? (
                                <span className="text-[10px] bg-axon-obsidian text-axon-neon px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                                    SUBSIDI PAYMASTER
                                </span>
                            ) : (
                                `≈ $${currentBalance} USD`
                            )}
                        </span>
                    </div>
                </motion.div>

                {/* Main Action Grid - Reduced Height */}
                <motion.div
                    className="grid grid-cols-2 gap-3"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                >
                    {/* PAY Button - Reduced Height */}
                    <button
                        onClick={() => navigate('/scan')}
                        className="col-span-2 relative h-20 rounded-swiss flex items-center justify-between px-6 transition shadow-lg shadow-blue-900/10 group overflow-hidden"
                    >
                        {/* Dynamic Background */}
                        <div className="absolute inset-0 bg-axon-obsidian" />
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/50 to-purple-900/50 opacity-50" />
                        <div className="absolute -right-12 -top-12 w-48 h-48 bg-axon-neon/20 blur-[60px] rounded-full group-hover:bg-axon-neon/30 transition-colors duration-500" />

                        {/* Mesh Overlay */}
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

                        <div className="relative z-10 flex flex-col items-start text-white">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="w-1 h-1 bg-axon-neon rounded-full animate-pulse" />
                                <span className="text-[9px] font-mono tracking-widest opacity-80 uppercase">Smart Vision™</span>
                            </div>
                            <span className="text-xl font-bold tracking-tight">SCAN TO PAY</span>
                        </div>
                        <div className="relative z-10 w-10 h-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                            <Scan className="w-5 h-5 text-axon-neon" />
                        </div>
                    </button>

                    {/* Secondary Actions - Reduced Height */}
                    <button
                        onClick={() => navigate('/create-snap')}
                        className="h-12 bg-white border border-gray-200 rounded-swiss flex items-center justify-center gap-2 hover:bg-gray-50 hover:border-gray-300 transition group shadow-sm"
                    >
                        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                            <svg className="w-3 h-3 text-axon-obsidian group-hover:text-primary transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M13 2L3 14h8l-2 8 10-12h-8l2-8z" />
                            </svg>
                        </div>
                        <span className="text-xs font-bold text-axon-obsidian uppercase tracking-wide">AXON Snap</span>
                    </button>
                    <button className="h-12 bg-white border border-gray-200 rounded-swiss flex items-center justify-center gap-2 hover:bg-gray-50 hover:border-gray-300 transition group shadow-sm">
                        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                            <ArrowUpRight className="w-3 h-3 text-axon-obsidian group-hover:text-primary transition-colors" />
                        </div>
                        <span className="text-xs font-bold text-axon-obsidian uppercase tracking-wide">Send</span>
                    </button>
                </motion.div>

                {/* Assets Section - Horizontal Scroll */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="space-y-3"
                >
                    <div className="flex justify-between items-end border-b border-gray-200 pb-2">
                        <h3 className="font-bold text-xs text-axon-steel uppercase tracking-wider">ASSETS</h3>
                        <span className="text-[10px] font-mono text-axon-steel">Swipe to explore</span>
                    </div>

                    <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-4 -mx-6 px-6">
                        {CRYPTO_METADATA.map((asset, idx) => (
                            <motion.div
                                key={asset.symbol}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.25 + (idx * 0.05) }}
                                className="min-w-[260px] snap-center"
                            >
                                <div className="bg-white rounded-swiss border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
                                    {/* Subtle background glow based on asset color */}
                                    <div className={clsx("absolute -right-4 -bottom-4 w-24 h-24 blur-3xl opacity-5", asset.color)} />

                                    <div className="flex justify-between items-start relative z-10">
                                        <div className="flex items-center gap-3">
                                            <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm", asset.color)}>
                                                {asset.icon}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm text-axon-obsidian">{asset.symbol}</h4>
                                                <p className="text-[10px] text-axon-steel uppercase font-bold tracking-tight">{asset.name}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-md font-mono text-axon-obsidian">
                                                {asset.balance}
                                            </p>
                                            <div className="flex items-center justify-end gap-1 mt-0.5">
                                                {asset.change24h >= 0 ? (
                                                    <TrendingUp className="w-3 h-3 text-green-600" />
                                                ) : (
                                                    <TrendingDown className="w-3 h-3 text-red-600" />
                                                )}
                                                <span className={clsx("text-[10px] font-mono font-bold", asset.change24h >= 0 ? "text-green-600" : "text-red-600")}>
                                                    {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mini Chart Pattern (Decorative) */}
                                    <div className="mt-4 h-6 w-full opacity-20 group-hover:opacity-40 transition-opacity">
                                        <svg viewBox="0 0 100 20" className="w-full h-full overflow-visible">
                                            <path
                                                d={asset.change24h >= 0
                                                    ? "M0,15 Q25,10 50,12 T100,2"
                                                    : "M0,5 Q25,12 50,10 T100,18"
                                                }
                                                fill="none"
                                                stroke={asset.change24h >= 0 ? "#10b981" : "#ef4444"}
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Recent Activity - Compact */}
                <div className="space-y-3">
                    <div className="flex justify-between items-end border-b border-gray-200 pb-2">
                        <h3 className="font-bold text-xs text-axon-steel uppercase tracking-wider">RECENT</h3>
                        <button
                            onClick={() => navigate('/history')}
                            className="text-[10px] font-mono font-bold text-primary hover:text-primary/80 transition uppercase tracking-wide"
                        >
                            VIEW ALL
                        </button>
                    </div>

                    <div className="space-y-2">
                        {[
                            {
                                name: 'KOPI KENANGAN',
                                time: '10:42 AM',
                                amount: '-35.000',
                                currency: 'IDR',
                                icon: '☕',
                                status: 'SETTLED'
                            },
                            {
                                name: 'COINBASE TOPUP',
                                time: '09:15 AM',
                                amount: '+50.00',
                                currency: 'USDC',
                                icon: 'download',
                                status: 'CONFIRMED'
                            }
                        ].map((tx, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + (idx * 0.05) }}
                                className="group"
                            >
                                <div className="flex justify-between items-center py-2 hover:bg-white px-2 rounded-lg transition -mx-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-gray-100 rounded-swiss items-center justify-center text-sm border border-gray-200 group-hover:border-axon-neon transition-colors flex">
                                            {tx.icon === 'download' ? <ArrowUpRight className="w-4 h-4 rotate-180 text-axon-steel" /> : tx.icon}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-axon-obsidian">{tx.name}</h4>
                                            <p className="text-xs text-axon-steel font-mono">{tx.time}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={clsx(
                                            "font-bold text-sm font-mono",
                                            tx.amount.startsWith('+') ? "text-axon-ether" : "text-axon-obsidian"
                                        )}>
                                            {tx.amount} <span className="text-xs text-gray-400">{tx.currency}</span>
                                        </p>
                                        <div className="flex items-center justify-end gap-1 mt-0.5">
                                            <div className="w-1 h-1 bg-axon-ether rounded-full" />
                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">
                                                {tx.status}
                                            </span>
                                        </div>
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



