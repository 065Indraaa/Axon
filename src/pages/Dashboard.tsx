import { MapPin, Scan, ArrowUpRight, ChevronDown, Bell, TrendingUp, TrendingDown, Loader2, Zap, QrCode, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useAxon } from '../context/AxonContext';
import { useState, useMemo, useEffect } from 'react';
import { TOKENS, TokenData } from '../config/tokens';
import { useWalletBalances } from '../hooks/useWalletBalances';
import { useAccount } from 'wagmi';
import { useTransactionHistory } from '../hooks/useTransactionHistory';
import { Button } from '../components/ui/Button';
import { ShieldCheck, Info, AlertTriangle } from 'lucide-react';
import { useSwapTokens } from '../hooks/useSwapTokens';
import toast from 'react-hot-toast';
import { useSwitchChain } from 'wagmi';
import { base } from 'wagmi/chains';
import { SwapModal } from '../components/SwapModal';
import { AssetDetailsModal } from '../components/AssetDetailsModal';
import { useTokenPrices } from '../hooks/useTokenPrices';
import { QRCodeSVG } from 'qrcode.react';
import { useUserProfile } from '../hooks/useUserProfile';

export default function Dashboard() {
    const navigate = useNavigate();
    const { countryName, location: countryCode } = useAxon();
    const { isConnected, chainId } = useAccount();
    const { switchChain } = useSwitchChain();
    const { balances, isLoading: isBalancesLoading } = useWalletBalances();
    const { transactions, isLoading: isHistoryLoading } = useTransactionHistory();
    const { prices, usdToIdr, convertToIdr } = useTokenPrices();

    // Mapping real prices to tokens for display
    const CRYPTO_METADATA = useMemo(() => {
        return TOKENS.map(token => {
            const rawBalance = (balances[token.symbol] ?? '0.00');
            const balanceNum = parseFloat(rawBalance.replace(/,/g, ''));
            const usdPrice = prices[token.symbol] || (token.symbol === 'IDRX' ? 1 / usdToIdr : 1);

            return {
                ...token,
                change24h: token.symbol === 'IDRX' ? -0.12 : 0.05, // Slight mock variety for UX
                balance: rawBalance,
                valueInIdr: convertToIdr(balanceNum * usdPrice).toLocaleString('id-ID', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                })
            };
        });
    }, [balances, prices, usdToIdr, convertToIdr]);

    const [selectedCrypto, setSelectedCrypto] = useState<TokenData>(TOKENS[0]); // Default to USDC
    const [selectedAssetForDetails, setSelectedAssetForDetails] = useState<any>(null);
    const [showAssetDetails, setShowAssetDetails] = useState(false);
    const [showCryptoSelector, setShowCryptoSelector] = useState(false);
    const [showQrMenu, setShowQrMenu] = useState(false);
    const [showMyQrModal, setShowMyQrModal] = useState(false);
    const { profile } = useUserProfile();
    const { address } = useAccount();

    // Get current balance for display
    // LOGIC: If Indonesia (ID), we calculate TOTAL VALUE in IDRX (simulating conversion) and force that as display.
    // If Global, we use the selected crypto standard logic.
    const isIndonesia = countryCode === 'ID';

    // State for Conversion Approval
    const [showSwapModal, setShowSwapModal] = useState(false);
    const [showConversionModal, setShowConversionModal] = useState(false);
    const [isConvertedMode, setIsConvertedMode] = useState(false);
    const [hasCheckedLocation, setHasCheckedLocation] = useState(false);

    const hasUSDBalance = useMemo(() => {
        const usdc = parseFloat((balances['USDC'] || '0').replace(/,/g, ''));
        const usdt = parseFloat((balances['USDT'] || '0').replace(/,/g, ''));
        return usdc > 0 || usdt > 0;
    }, [balances]);

    const hasIDRXBalance = useMemo(() => {
        const idrx = parseFloat((balances['IDRX'] || '0').replace(/,/g, ''));
        return idrx > 0;
    }, [balances]);

    // Debug logs for balance issue
    useEffect(() => {
        console.log('🔍 Balance Debug:', {
            isIndonesia,
            hasUSDBalance,
            hasIDRXBalance,
            balances,
            countryCode
        });
    }, [isIndonesia, hasUSDBalance, hasIDRXBalance, balances, countryCode]);

    // Triggers - ALWAYS show modal if: Indonesia + has USD + NO IDRX (no dismiss)
    useEffect(() => {
        if (isIndonesia && hasUSDBalance && !hasIDRXBalance && !isConvertedMode && !hasCheckedLocation) {
            const timer = setTimeout(() => {
                console.log('✅ Showing conversion modal - IDRX is required for transactions');
                setShowConversionModal(true);
                setHasCheckedLocation(true);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [isIndonesia, hasUSDBalance, hasIDRXBalance, isConvertedMode, hasCheckedLocation]);

    const { executeSwap, isPending: isSwapping, isSuccess: swapComplete, error: swapError } = useSwapTokens();

    const triggerConversion = async (paramsOrEvent?: any) => {
        // Handle case where React MouseEvent is passed instead of params
        const params = (paramsOrEvent && 'fromToken' in paramsOrEvent) ? paramsOrEvent : null;

        if (!params) {
            setShowSwapModal(true);
            setShowConversionModal(false);
            return;
        }

        const { fromToken, toToken, amount } = params;

        try {
            console.log(`🚀 Swapping ${amount} ${fromToken?.symbol} to ${toToken?.symbol}...`);

            if (!fromToken || !toToken) {
                toast.error("Invalid token selection");
                return;
            }

            await executeSwap({
                fromToken: fromToken.address,
                toToken: toToken.address,
                amount: amount,
                decimals: fromToken.decimals,
                maxSlippage: '3', // 3% slippage for IDRX swaps
            });
        } catch (err: any) {
            console.error("Conversion trigger failed:", err);
            toast.error("Conversion failed: " + (err.message || "Unknown error"));
        }
    };

    const dismissConversion = () => {
        setShowConversionModal(false);
        // Note: No sessionStorage - popup will show again on next login if still IDRX = 0
    };

    // Effect: Close modal and reload when swap completes successfully
    useEffect(() => {
        if (swapComplete) {
            toast.success("Conversion successful! Refreshing balances...");
            setIsConvertedMode(true);
            setShowConversionModal(false);
            setShowSwapModal(false);
            const idrx = TOKENS.find(t => t.symbol === 'IDRX');
            if (idrx) setSelectedCrypto(idrx);

            // Re-fetch history to show the new swap
            setTimeout(() => {
                window.location.reload();
            }, 2500);
        }
    }, [swapComplete]);

    useEffect(() => {
        if (swapError) {
            console.error("❌ Swap Error Detail:", swapError);
            
            // Enhanced error handling for IDRX swaps
            const msg = swapError.toString();
            let errorMessage = msg;
            let actions = [];
            
            if (msg.includes('IDRX')) {
                errorMessage = 'IDRX swap failed';
                actions.push('Try increasing amount to 1+ USDC');
                actions.push('Ensure you are on Base network');
                actions.push('Check that IDRX has liquidity');
            } else if (msg.includes('insufficient')) {
                errorMessage = 'Insufficient balance';
                actions.push('Check your token balance');
                actions.push('Consider using smaller amount');
            } else if (msg.includes('no route')) {
                errorMessage = 'No swap route available';
                actions.push('Try different token pair');
                actions.push('Wait for better liquidity');
            }
            
            const actionText = actions.length > 0 ? `\n\nSuggestions: ${actions.join(' • ')}` : '';
            const displayMessage = msg.length > 60 ? msg.substring(0, 60) + '...' + actionText : msg + actionText;
            
            toast.error(displayMessage, {
                duration: 6000,
                style: {
                    maxWidth: '400px',
                    fontSize: '12px'
                }
            });
        }
    }, [swapError]);

    const idrxBalanceDisplay = useMemo(() => {
        const realIdrxBalRaw = balances['IDRX'] || '0.00';
        const idrxBal = parseFloat(realIdrxBalRaw.replace(/,/g, ''));

        if (!isConvertedMode) {
            return realIdrxBalRaw;
        }

        // Real-time Estimation based on Coinbase Rates
        const usdcBal = parseFloat((balances['USDC'] || '0').replace(/,/g, ''));
        const usdtBal = parseFloat((balances['USDT'] || '0').replace(/,/g, ''));

        const convertedTotal = idrxBal + convertToIdr(usdcBal + usdtBal);

        return new Intl.NumberFormat('id-ID', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(convertedTotal);
    }, [isConvertedMode, balances, convertToIdr]);

    // Display Logic: If Converted Mode, show IDRX Total. Else show standard selected crypto.
    const currentBalance = isConvertedMode ? idrxBalanceDisplay : (balances[selectedCrypto.symbol] || '0.00');
    const displaySymbol = isConvertedMode ? 'IDRX' : selectedCrypto.symbol;
    const displayIcon = isConvertedMode ? 'Rp' : (selectedCrypto.icon || '$');
    const displayColor = isConvertedMode ? 'bg-red-600' : selectedCrypto.color;

    return (
        <div className="min-h-screen bg-[#F5F5F7] pb-32 font-sans text-axon-obsidian">
            {/* Network Warning Banner */}
            {isConnected && chainId !== base.id && (
                <div className="bg-amber-50 border-b border-amber-100 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                        <div>
                            <p className="text-xs font-bold text-amber-900">WRONG NETWORK DETECTED</p>
                            <p className="text-[10px] text-amber-700 font-medium">Please switch to Base Mainnet to see your real balances.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => switchChain({ chainId: base.id })}
                        className="bg-amber-600 text-white text-[10px] font-black px-4 py-2 rounded-lg hover:bg-amber-700 transition shadow-sm uppercase tracking-wider"
                    >
                        Switch to Base
                    </button>
                </div>
            )}

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
                <div className="relative z-10 flex items-center gap-2">
                    <div className="relative">
                        <button
                            onClick={() => setShowQrMenu(!showQrMenu)}
                            className={clsx(
                                "w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center bg-white hover:bg-gray-50 transition shadow-sm group",
                                showQrMenu && "ring-2 ring-axon-neon/50 border-axon-neon/50"
                            )}
                        >
                            <QrCode className="w-3.5 h-3.5 text-axon-obsidian group-hover:scale-110 transition-transform" />
                        </button>

                        <AnimatePresence>
                            {showQrMenu && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setShowQrMenu(false)}
                                    />
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-swiss shadow-xl z-50 overflow-hidden"
                                    >
                                        <button
                                            onClick={() => {
                                                navigate('/scan');
                                                setShowQrMenu(false);
                                            }}
                                            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100"
                                        >
                                            <Scan className="w-4 h-4 text-axon-obsidian" />
                                            <span className="text-xs font-bold text-axon-obsidian uppercase tracking-wider">Scan</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowMyQrModal(true);
                                                setShowQrMenu(false);
                                            }}
                                            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                                        >
                                            <QrCode className="w-4 h-4 text-axon-obsidian" />
                                            <span className="text-xs font-bold text-axon-obsidian uppercase tracking-wider">My QR</span>
                                        </button>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>

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
                                onClick={() => setShowCryptoSelector(!showCryptoSelector)}
                                className={clsx(
                                    "bg-white border border-gray-200 px-3 py-1.5 rounded-full flex items-center gap-2 transition shadow-sm group hover:bg-gray-50",
                                    isConvertedMode && "ring-2 ring-axon-neon ring-offset-1"
                                )}
                            >
                                <div className={clsx("w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold", displayColor)}>
                                    {displayIcon}
                                </div>
                                <span className="text-sm font-bold text-axon-obsidian">{displaySymbol}</span>
                                <ChevronDown className={clsx("w-3.5 h-3.5 text-axon-steel group-hover:text-axon-obsidian transition-transform", showCryptoSelector && "rotate-180")} />
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
                            {isConvertedMode ? (
                                <span className="text-[10px] bg-axon-obsidian text-axon-neon px-1.5 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1">
                                    <ShieldCheck className="w-3 h-3" />
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
                    {/* Secondary Actions - Professional Grid */}
                    <button
                        onClick={() => setShowSwapModal(true)}
                        className="h-12 bg-white border border-gray-200 rounded-swiss flex items-center justify-center gap-2 hover:bg-gray-50 hover:border-gray-300 transition group shadow-sm"
                    >
                        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-axon-neon/10 transition-colors">
                            <TrendingUp className="w-3 h-3 text-axon-obsidian group-hover:text-axon-neon transition-colors" />
                        </div>
                        <span className="text-xs font-bold text-axon-obsidian uppercase tracking-wide">SWAP USD</span>
                    </button>
                    <button
                        onClick={() => navigate('/create-snap')}
                        className="h-12 bg-white border border-gray-200 rounded-swiss flex items-center justify-center gap-2 hover:bg-gray-50 hover:border-gray-300 transition group shadow-sm"
                    >
                        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                            <Zap className="w-3 h-3 text-axon-obsidian group-hover:text-primary transition-colors" />
                        </div>
                        <span className="text-xs font-bold text-axon-obsidian uppercase tracking-wide">AXON Snap</span>
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
                                <div
                                    onClick={() => {
                                        setSelectedAssetForDetails(asset);
                                        setShowAssetDetails(true);
                                    }}
                                    className="bg-white rounded-swiss border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all group relative overflow-hidden cursor-pointer active:scale-95"
                                >
                                    {/* Subtle background glow based on asset color */}
                                    <div className={clsx("absolute -right-4 -bottom-4 w-24 h-24 blur-3xl opacity-5", asset.color)} />

                                    <div className="flex justify-between items-start relative z-10">
                                        <div className="flex items-center gap-3">
                                            <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm", asset.color)}>
                                                {asset.icon}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm text-axon-obsidian">{asset.symbol}</h4>
                                                <p className="text-[10px] text-primary lowercase font-black tracking-tight italic">Rp{asset.valueInIdr}</p>
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
                        {isHistoryLoading ? (
                            <div className="text-center py-4">
                                <Loader2 className="w-4 h-4 text-axon-steel animate-spin mx-auto" />
                            </div>
                        ) : transactions.length > 0 ? (
                            transactions.slice(0, 3).map((tx, idx) => (
                                <motion.div
                                    key={tx.id || idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + (idx * 0.05) }}
                                    className="group"
                                >
                                    <div className="flex justify-between items-center py-2 hover:bg-white px-2 rounded-lg transition -mx-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-gray-100 rounded-swiss items-center justify-center text-sm border border-gray-200 group-hover:border-axon-neon transition-colors flex">
                                                {tx.type === 'receive' ? <ArrowUpRight className="w-4 h-4 rotate-180 text-axon-steel" /> : <ArrowUpRight className="w-4 h-4 text-axon-steel" />}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm text-axon-obsidian">{tx.title}</h4>
                                                <p className="text-xs text-axon-steel font-mono">{tx.date}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={clsx(
                                                "font-bold text-sm font-mono",
                                                tx.type === 'receive' ? "text-axon-ether" : "text-axon-obsidian"
                                            )}>
                                                {tx.amount}
                                            </p>
                                            <div className="flex items-center justify-end gap-1 mt-0.5">
                                                <div className={clsx("w-1 h-1 rounded-full", tx.status === 'CONFIRMED' ? "bg-axon-ether" : "bg-yellow-500")} />
                                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">
                                                    {tx.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-4 border border-dashed border-gray-200 rounded-lg">
                                <p className="text-[10px] text-gray-400 font-mono uppercase tracking-wide">No on-chain activity found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* CONVERSION MODAL */}
            <AnimatePresence>
                {showConversionModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed inset-x-6 top-[25%] z-[100] bg-white rounded-[24px] p-6 shadow-2xl border border-gray-200"
                        >
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="w-16 h-16 bg-axon-obsidian rounded-full flex items-center justify-center mb-2 shadow-lg shadow-axon-obsidian/30">
                                    <span className="text-2xl">🇮🇩</span>
                                </div>
                                <h2 className="text-xl font-black text-axon-obsidian uppercase tracking-tight leading-none">
                                    Welcome to Indonesia
                                </h2>
                                <p className="text-sm text-axon-steel font-medium leading-relaxed">
                                    We detected you are currently in Indonesia. Would you like to enable <span className="text-axon-obsidian font-bold">Auto-Conversion</span> for your USD assets to <span className="font-bold text-red-600">IDRX</span>?
                                </p>

                                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 w-full text-left flex items-start gap-3">
                                    <Info className="w-5 h-5 text-axon-obsidian shrink-0 mt-0.5" />
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-axon-obsidian uppercase">Subsidi Paymaster Active</p>
                                        <p className="text-[10px] text-gray-500">Gas fees and conversion rates are subsidized for local transactions.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 w-full pt-2">
                                    <Button onClick={dismissConversion} variant="secondary" className="!h-12 !text-xs">
                                        KEEP USD
                                    </Button>
                                    <Button
                                        onClick={triggerConversion}
                                        disabled={isSwapping}
                                        className="!h-12 !text-xs !bg-axon-neon !text-axon-obsidian !font-black flex items-center justify-center gap-2"
                                    >
                                        {isSwapping ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                        {isSwapping ? "PROCESSING..." : "CONVERT TO IDRX"}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <SwapModal
                isOpen={showSwapModal}
                onClose={() => setShowSwapModal(false)}
                balances={balances}
                onSwap={(params) => triggerConversion(params)}
                isPending={isSwapping}
            />

            {selectedAssetForDetails && (
                <AssetDetailsModal
                    isOpen={showAssetDetails}
                    onClose={() => setShowAssetDetails(false)}
                    asset={selectedAssetForDetails}
                    idrValue={selectedAssetForDetails.valueInIdr}
                    transactions={transactions}
                />
            )}

            {/* MY QR MODAL */}
            <AnimatePresence>
                {showMyQrModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowMyQrModal(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed inset-x-6 top-[20%] z-[120] bg-white rounded-[32px] p-8 shadow-2xl border border-gray-200 flex flex-col items-center text-center"
                        >
                            <button
                                onClick={() => setShowMyQrModal(false)}
                                className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>

                            <div className="w-12 h-12 bg-axon-obsidian rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-axon-obsidian/20">
                                <QrCode className="w-6 h-6 text-axon-neon" />
                            </div>

                            <h2 className="text-2xl font-black text-axon-obsidian uppercase tracking-tight leading-none mb-2">
                                {profile.name || 'AXON USER'}
                            </h2>
                            <p className="text-xs text-axon-steel font-mono mb-8 break-all max-w-[200px]">
                                {address}
                            </p>

                            <div className="p-6 bg-white border-2 border-gray-100 rounded-3xl shadow-inner mb-8">
                                <QRCodeSVG
                                    value={address || ''}
                                    size={200}
                                    level="H"
                                    includeMargin={false}
                                    className="rounded-lg"
                                />
                            </div>

                            <p className="text-[10px] text-axon-steel font-bold uppercase tracking-[0.2em] mb-6">
                                Scan to send assets
                            </p>

                            <Button
                                onClick={() => setShowMyQrModal(false)}
                                variant="secondary"
                                className="!h-12 !w-full !text-xs !font-black !rounded-xl"
                            >
                                CLOSE
                            </Button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}



