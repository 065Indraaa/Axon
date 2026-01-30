import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    ArrowDown,
    Info,
    Zap,
    Loader2,
    TrendingUp
} from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { TokenData, TOKENS } from '../config/tokens';
import { useTokenPrices } from '../hooks/useTokenPrices';
import clsx from 'clsx';
import toast from 'react-hot-toast';

interface SwapModalProps {
    isOpen: boolean;
    onClose: () => void;
    balances: Record<string, string>;
    onSwap: (params: { fromToken: TokenData; toToken: TokenData; amount: string }) => Promise<void>;
    isPending: boolean;
}

export function SwapModal({ isOpen, onClose, balances, onSwap, isPending }: SwapModalProps) {
    const [fromAmount, setFromAmount] = useState<string>('');
    const [step, setStep] = useState<'input' | 'confirm'>('input');
    const { usdToIdr } = useTokenPrices();

    // Default tokens
    const fromToken = TOKENS[0]; // USDC
    const toToken = TOKENS[2];   // IDRX

    const balanceRaw = balances[fromToken.symbol] || '0.00';
    const balanceNum = parseFloat(balanceRaw.replace(/,/g, ''));

    // Real-time rates from Coinbase
    const EXCHANGE_RATE = usdToIdr;

    const estimatedOutput = useMemo(() => {
        const val = parseFloat(fromAmount) || 0;
        return (val * EXCHANGE_RATE).toLocaleString('id-ID', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    }, [fromAmount, EXCHANGE_RATE]);

    const handleMax = () => {
        setFromAmount(balanceNum.toString());
    };

    const handleContinue = () => {
        const amt = parseFloat(fromAmount);
        if (!amt || amt <= 0) {
            toast.error("Enter a valid amount");
            return;
        }
        if (amt > balanceNum) {
            toast.error("Insufficient balance");
            return;
        }
        setStep('confirm');
    };

    const handleConfirm = async () => {
        try {
            // Additional validation for IDRX swaps
            if (toToken.symbol === 'IDRX') {
                const amount = parseFloat(fromAmount);
                if (amount < 0.01) {
                    toast.error('Minimum amount for IDRX swap is 0.01 USDC');
                    return;
                }
                
                toast.loading('Preparing IDRX swap...', { id: 'idrx-swap' });
            }
            
            await onSwap({
                fromToken,
                toToken,
                amount: fromAmount
            });
            
            if (toToken.symbol === 'IDRX') {
                toast.dismiss('idrx-swap');
            }
        } catch (error) {
            console.error('Swap confirm error:', error);
            if (toToken.symbol === 'IDRX') {
                toast.dismiss('idrx-swap');
                toast.error('IDRX swap failed. Please try a different amount or contact support.');
            }
        }
    };

    // Reset when closed
    useEffect(() => {
        if (!isOpen) {
            setStep('input');
            setFromAmount('');
        }
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100]"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 100 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 100 }}
                        className="fixed inset-x-4 bottom-8 md:relative md:inset-auto md:max-w-md md:mx-auto z-[101]"
                    >
                        <Card className="overflow-hidden !border-0 bg-[#F5F5F7]">
                            {/* Header */}
                            <div className="p-6 bg-white border-b border-gray-100 flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-black uppercase tracking-tight">
                                        {step === 'input' ? 'CONVERT ASSETS' : 'CONFIRM SWAP'}
                                    </h2>
                                    <p className="text-[10px] font-bold text-axon-steel uppercase tracking-widest">
                                        Powered by Coinbase CDP
                                    </p>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-axon-steel" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {step === 'input' ? (
                                    <>
                                        {/* Input Box */}
                                        <div className="space-y-4">
                                            <div className="bg-white rounded-2xl p-5 border border-gray-200 focus-within:border-axon-obsidian transition-all shadow-sm">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-[10px] font-bold text-axon-steel uppercase tracking-widest">FROM</span>
                                                    <span className="text-[10px] font-mono text-axon-steel uppercase">Bal: {balanceRaw}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="number"
                                                        value={fromAmount}
                                                        onChange={(e) => setFromAmount(e.target.value)}
                                                        placeholder="0.00"
                                                        className="text-4xl font-black bg-transparent w-full outline-none placeholder:text-gray-200"
                                                    />
                                                    <div className="flex flex-col items-end gap-1">
                                                        <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
                                                            <div className={clsx("w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white", fromToken.color)}>
                                                                {fromToken.icon}
                                                            </div>
                                                            <span className="font-black text-sm">{fromToken.symbol}</span>
                                                        </div>
                                                        <button onClick={handleMax} className="text-[9px] font-black text-primary hover:opacity-80 uppercase tracking-tighter">
                                                            USE MAX
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-center -my-3 relative z-10">
                                                <div className="bg-axon-obsidian text-axon-neon p-2 rounded-full border-4 border-[#F5F5F7] shadow-lg">
                                                    <ArrowDown className="w-5 h-5" />
                                                </div>
                                            </div>

                                            <div className="bg-white/60 rounded-2xl p-5 border border-gray-100 transition-all opacity-80">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-[10px] font-bold text-axon-steel uppercase tracking-widest">TO (ESTIMATED)</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-3xl font-bold bg-transparent w-full text-axon-obsidian">
                                                        {estimatedOutput}
                                                    </span>
                                                    <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
                                                        <div className={clsx("w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white", toToken.color)}>
                                                            {toToken.icon}
                                                        </div>
                                                        <span className="font-black text-sm">{toToken.symbol}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Rate Info */}
                                        <div className="flex justify-between items-center px-2">
                                            <div className="flex items-center gap-1.5">
                                                <TrendingUp className="w-3.5 h-3.5 text-axon-steel" />
                                                <span className="text-[10px] font-mono text-axon-steel">1 {fromToken.symbol} = {EXCHANGE_RATE.toLocaleString()} {toToken.symbol}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-green-600">
                                                <Zap className="w-3 h-3 fill-current" />
                                                <span className="text-[10px] font-bold uppercase tracking-tighter">No Fee</span>
                                            </div>
                                        </div>

                                        <Button
                                            fullWidth
                                            onClick={handleContinue}
                                            className="!h-16 !bg-axon-obsidian !text-white !font-black !tracking-widest shadow-xl"
                                        >
                                            REVIEW SWAP
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        {/* Confirmation State */}
                                        <div className="space-y-4">
                                            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
                                                <div className="flex justify-between border-b border-gray-50 pb-4">
                                                    <span className="text-xs text-axon-steel font-bold uppercase">Sell</span>
                                                    <span className="text-sm font-black">{fromAmount} {fromToken.symbol}</span>
                                                </div>
                                                <div className="flex justify-between border-b border-gray-50 pb-4">
                                                    <span className="text-xs text-axon-steel font-bold uppercase">Receive</span>
                                                    <span className="text-sm font-black text-axon-obsidian">~ {estimatedOutput} {toToken.symbol}</span>
                                                </div>
                                                <div className="flex justify-between pt-1">
                                                    <span className="text-xs text-axon-steel font-bold uppercase">Network Fee</span>
                                                    <span className="text-[10px] font-black text-green-600 uppercase">Sponsored</span>
                                                </div>
                                            </div>

                                             {toToken.symbol === 'IDRX' && (
                                                 <div className="bg-amber-50 p-4 rounded-xl flex items-start gap-3 border border-amber-100">
                                                     <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                                     <div className="text-[10px] text-amber-900 font-medium leading-relaxed">
                                                         <p className="mb-2">
                                                             <strong>🇮🇩 IDRX Conversion Guide:</strong>
                                                         </p>
                                                         <ul className="space-y-1 text-xs">
                                                             <li>• <strong>Min Amount:</strong> 0.01 USDC for better success</li>
                                                             <li>• <strong>Network:</strong> Base Mainnet (8453)</li>
                                                             <li>• <strong>Gas Fees:</strong> 100% sponsored by Coinbase</li>
                                                             <li>• <strong>Slippage:</strong> Auto-set to 5% for reliability</li>
                                                             <li>• <strong>Wallet:</strong> Works with Smart Wallet & Coinbase</li>
                                                         </ul>
                                                         <p className="mt-2 text-[9px] text-amber-700">
                                                             <strong>Troubleshooting:</strong> If swap fails, try increasing amount to 1+ USDC or refresh the page.
                                                         </p>
                                                     </div>
                                                 </div>
                                             )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 pt-4">
                                            <Button variant="secondary" onClick={() => setStep('input')} className="!h-16">
                                                BACK
                                            </Button>
                                            <Button
                                                onClick={handleConfirm}
                                                disabled={isPending}
                                                className="!h-16 !bg-axon-neon !text-axon-obsidian !font-black !tracking-widest flex items-center justify-center gap-2"
                                            >
                                                {isPending ? (
                                                    <div className="flex flex-col items-center">
                                                        <Loader2 className="w-5 h-5 animate-spin mb-1" />
                                                        <span className="text-[8px] font-bold uppercase tracking-tight">Check signing modal</span>
                                                    </div>
                                                ) : "CONFIRM"}
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </Card>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
