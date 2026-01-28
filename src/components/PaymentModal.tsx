import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ArrowRight, Loader2, Wallet, AlertCircle } from 'lucide-react';
import { useState, useMemo } from 'react';
import { TOKENS } from '../config/tokens';
import { useWriteContracts } from 'wagmi/experimental';
import { parseUnits } from 'viem';
import { ERC20_ABI, AXON_VAULT_ADDRESS } from '../config/contracts';
import { supabase } from '../lib/supabase';
import { useAccount } from 'wagmi';
import clsx from 'clsx';
import toast from 'react-hot-toast';

interface Merchant {
    id: string;
    name: string;
    wallet_address: string;
    qris_payload?: string;
    suggested_amount?: string;
}

interface PaymentModalProps {
    merchant: Merchant;
    balances: Record<string, string>;
    onClose: () => void;
    onSuccess: (txHash: string, amount: string) => void;
}

export function PaymentModal({ merchant, balances, onClose, onSuccess }: PaymentModalProps) {
    const { address } = useAccount();
    const { writeContractsAsync } = useWriteContracts();
    const [amount, setAmount] = useState('');
    const [isPaying, setIsPaying] = useState(false);
    const [step, setStep] = useState<'input' | 'confirm' | 'processing' | 'success'>('input');
    const [txHash, setTxHash] = useState('');

    const idrxToken = useMemo(() => TOKENS.find(t => t.symbol === 'IDRX'), []);
    const idrxBalance = useMemo(() => {
        const bal = balances['IDRX'] || '0.00';
        return parseFloat(bal.replace(/,/g, ''));
    }, [balances]);

    const isValidAmount = useMemo(() => {
        const val = parseFloat(amount);
        return !isNaN(val) && val > 0 && val <= idrxBalance;
    }, [amount, idrxBalance]);

    // Set initial amount if suggested by QRIS
    useState(() => {
        if (merchant.suggested_amount) {
            setAmount(merchant.suggested_amount);
        }
    });

    const handleConfirmPayment = async () => {
        if (!isValidAmount || !address || !idrxToken) return;

        setIsPaying(true);
        setStep('processing');

        try {
            const parsedAmount = parseUnits(amount, idrxToken.decimals);
            const paymasterUrl = import.meta.env.VITE_PAYMASTER_URL;

            const result = await writeContractsAsync({
                contracts: [
                    {
                        address: idrxToken.address as `0x${string}`,
                        abi: ERC20_ABI,
                        functionName: 'transfer',
                        args: [
                            (merchant.wallet_address === 'QRIS' ? AXON_VAULT_ADDRESS : merchant.wallet_address) as `0x${string}`,
                            parsedAmount
                        ],
                    },
                ],
                capabilities: {
                    paymasterService: paymasterUrl ? {
                        url: paymasterUrl,
                    } : undefined,
                },
            });

            // result is usually an array involving the bundle or hash. 
            // WAGMI writeContractsAsync behavior for smart wallet often returns a string (the ID/hash)
            const hash = typeof result === 'string' ? result : (result as any).hash || (result as any)[0] || '';
            setTxHash(hash);

            // Record in history
            await supabase.from('transactions').insert({
                user_address: address,
                type: 'send',
                amount: amount,
                from_token: 'IDRX',
                to_token: 'IDRX',
                status: 'CONFIRMED',
                tx_hash: hash,
                created_at: new Date().toISOString()
            });

            // If QRIS, trigger the disbursement function
            if (merchant.wallet_address === 'QRIS' && merchant.qris_payload) {
                console.log("Triggering Instant QRIS Disbursement...");
                toast.loading("Processing Instant Payment...", { id: 'qris_disburse' });

                try {
                    const { data: disburseResp, error: disburseErr } = await supabase.functions.invoke('process-qris', {
                        body: {
                            txHash: hash,
                            amount: amount,
                            qrisPayload: merchant.qris_payload,
                            merchantName: merchant.name
                        }
                    });

                    if (disburseErr) throw disburseErr;

                    if (disburseResp?.success) {
                        toast.success("QRIS Paid Instantly", { id: 'qris_disburse' });
                    } else {
                        toast.error(disburseResp?.message || "Disbursement logic queued", { id: 'qris_disburse' });
                    }
                } catch (e) {
                    console.error("Disbursement trigger failed:", e);
                    toast.error("Crypto sent to Vault. Disbursement processing...", { id: 'qris_disburse' });
                }
            }

            setStep('success');
            onSuccess(hash, amount);

            toast.success(`Payment sent to ${merchant.name}`);
        } catch (error: any) {
            console.error('Payment failed:', error);
            if (error.name === 'UserRejectedRequestError') {
                toast.error('Transaction rejected');
                setStep('confirm');
            } else {
                toast.error('Payment failed. Please try again.');
                setStep('input');
            }
        } finally {
            setIsPaying(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="bg-[#F5F5F7] w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header/Grabber */}
                <div className="sm:hidden w-full flex justify-center py-4">
                    <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
                </div>

                <div className="p-8">
                    <AnimatePresence mode="wait">
                        {step === 'input' && (
                            <motion.div
                                key="input"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-2xl font-black text-axon-obsidian tracking-tight">PAY MERCHANT</h2>
                                        <p className="p-1 px-3 bg-axon-neon/10 rounded-full text-[10px] font-black text-primary inline-flex items-center gap-1 uppercase tracking-wider">
                                            <Check className="w-3 h-3" /> {merchant.name}
                                        </p>
                                    </div>
                                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                        <X className="w-5 h-5 text-gray-500" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
                                        <label className="text-[10px] font-black text-axon-steel uppercase tracking-[0.2em] mb-2 block">Amount in IDRX</label>
                                        <div className="relative flex items-center">
                                            <span className="text-3xl font-black text-gray-300 mr-2">Rp</span>
                                            <input
                                                type="number"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                placeholder="0"
                                                className="w-full text-5xl font-black bg-transparent outline-none text-axon-obsidian placeholder:text-gray-100"
                                                autoFocus
                                            />
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center text-xs font-bold">
                                            <span className="text-axon-steel">AVAILABLE BALANCE</span>
                                            <span className={clsx(idrxBalance < parseFloat(amount) ? "text-red-500" : "text-axon-obsidian")}>
                                                Rp {idrxBalance.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>

                                    {idrxBalance < parseFloat(amount) && (
                                        <div className="bg-red-50 p-4 rounded-2xl border border-red-100 flex items-center gap-3 text-red-600">
                                            <AlertCircle className="w-5 h-5" />
                                            <p className="text-xs font-bold">Insufficient IDRX balance. Convert USD first.</p>
                                        </div>
                                    )}
                                </div>

                                <button
                                    disabled={!isValidAmount}
                                    onClick={() => setStep('confirm')}
                                    className="w-full h-20 bg-axon-obsidian text-white rounded-[24px] font-black text-sm uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-xl disabled:opacity-50 disabled:grayscale transition-all active:scale-95"
                                >
                                    CONTINUE <ArrowRight className="w-5 h-5 text-axon-neon" />
                                </button>
                            </motion.div>
                        )}

                        {step === 'confirm' && (
                            <motion.div
                                key="confirm"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="text-center space-y-4">
                                    <div className="w-20 h-20 bg-axon-neon rounded-full flex items-center justify-center mx-auto shadow-lg shadow-axon-neon/20">
                                        <Wallet className="w-10 h-10 text-axon-obsidian" />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black text-axon-obsidian tracking-tight">CONFIRM PAYMENT</h2>
                                        <p className="text-axon-steel font-bold uppercase text-[10px] tracking-[0.2em] mt-1">Review your transaction</p>
                                    </div>
                                </div>

                                <div className="bg-white rounded-3xl border border-gray-200 divide-y divide-gray-50 overflow-hidden shadow-sm">
                                    <div className="p-5 flex justify-between items-center">
                                        <span className="text-xs font-bold text-axon-steel">TO MERCHANT</span>
                                        <span className="text-sm font-black text-axon-obsidian">{merchant.name}</span>
                                    </div>
                                    <div className="p-5 flex justify-between items-center">
                                        <span className="text-xs font-bold text-axon-steel">AMOUNT</span>
                                        <span className="text-lg font-black text-axon-obsidian">Rp {parseFloat(amount).toLocaleString()}</span>
                                    </div>
                                    <div className="p-5 flex justify-between items-center">
                                        <span className="text-xs font-bold text-axon-steel">NETWORK FEE</span>
                                        <span className="text-[10px] font-black bg-axon-obsidian text-axon-neon px-2 py-1 rounded">SUBSIDIZED</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <button
                                        disabled={isPaying}
                                        onClick={handleConfirmPayment}
                                        className="w-full h-20 bg-axon-obsidian text-white rounded-[24px] font-black text-sm uppercase tracking-[0.3em] shadow-xl hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-3"
                                    >
                                        {isPaying ? <Loader2 className="w-6 h-6 animate-spin text-axon-neon" /> : "PAY NOW"}
                                    </button>
                                    <button
                                        disabled={isPaying}
                                        onClick={() => setStep('input')}
                                        className="w-full h-14 bg-gray-100 text-axon-steel rounded-[20px] font-bold text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
                                    >
                                        BACK
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 'processing' && (
                            <motion.div
                                key="processing"
                                className="py-20 flex flex-col items-center justify-center text-center space-y-6"
                            >
                                <div className="relative">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                        className="w-24 h-24 border-4 border-gray-100 border-t-axon-neon rounded-full"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-2 h-2 bg-axon-neon rounded-full animate-ping" />
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-axon-obsidian italic">PROCESSING</h2>
                                    <p className="text-[10px] font-bold text-axon-steel uppercase tracking-[0.3em]">Neural Verification...</p>
                                </div>
                            </motion.div>
                        )}

                        {step === 'success' && (
                            <motion.div
                                key="success"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="py-12 flex flex-col items-center justify-center text-center space-y-10"
                            >
                                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-2xl shadow-green-100">
                                    <Check className="w-12 h-12 text-white" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-4xl font-black text-axon-obsidian italic tracking-tighter">PAYMENT SUCCESS</h2>
                                    <p className="text-lg font-bold text-axon-steel">Rp {parseFloat(amount).toLocaleString()} SENT</p>
                                </div>

                                <div className="w-full space-y-4">
                                    <div className="bg-white p-4 rounded-2xl border border-gray-100 text-[10px] font-mono text-gray-400 break-all">
                                        TX_ID: {txHash.substring(0, 20)}...{txHash.substring(txHash.length - 10)}
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="w-full h-18 bg-axon-obsidian text-white rounded-[24px] font-black text-sm uppercase tracking-[0.3em] shadow-xl"
                                    >
                                        DONE
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </motion.div>
    );
}
