import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ShieldCheck, Loader2, Scan, RefreshCw, Zap, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSignMessage, useAccount } from 'wagmi';
import { useAxon } from '../context/AxonContext';
import { useWalletBalances } from '../hooks/useWalletBalances';
import { WalletWrapper } from '../components/WalletWrapper';

type Step = 'slides' | 'signature' | 'sync' | 'complete';

const SLIDES = [
    {
        title: "Welcome to the Nexus",
        subtitle: "ASEAN Finance Reimagined",
        description: "Your gateway to frictionless cross-border payments. Secure, instant, and compliant.",
        icon: <Scan className="w-10 h-10 text-axon-neon" />,
        color: "bg-axon-obsidian"
    },
    {
        title: "One QR for All",
        subtitle: "Global Standards, Local Ease",
        description: "Scan QRIS, DuitNow, or PayNow seamlessly. We handle the conversions instantly via Base L2.",
        icon: <RefreshCw className="w-10 h-10 text-blue-600" />,
        color: "bg-white border border-gray-200"
    },
    {
        title: "Neural Security",
        subtitle: "Coinbase Smart Wallet",
        description: "Your assets are protected by enterprise-grade security and your unique signature.",
        icon: <ShieldCheck className="w-10 h-10 text-green-500" />,
        color: "bg-white border border-gray-200"
    }
];

export default function OnboardingFlow() {
    const { setOnboardingComplete } = useAxon();
    const { isConnected, address } = useAccount();
    const [currentStep, setCurrentStep] = useState<Step>('slides');
    const [currentSlide, setCurrentSlide] = useState(0);

    const { refetch: refetchBalances } = useWalletBalances();

    const { signMessage, isPending: isSigning } = useSignMessage({
        mutation: {
            onSuccess: async () => {
                // Track Login in Supabase
                if (address) {
                    try {
                        await supabase.from('users').upsert({
                            wallet_address: address,
                            last_login: new Date().toISOString()
                        });
                    } catch (err) {
                        console.warn("Login tracking failed", err);
                    }
                }
                setCurrentStep('sync');
            },
            onError: (error) => {
                console.error("Signature failed:", error);
            }
        }
    });

    // Auto-advance from Connect if already connected (in case user connects via other means or re-flow)
    useEffect(() => {
        if (currentStep === 'slides' && isConnected && currentSlide === SLIDES.length - 1) {
            const timer = setTimeout(() => {
                setCurrentStep('signature');
            }, 1500); // Allow user to see the "Connected" state briefly
            return () => clearTimeout(timer);
        }
    }, [isConnected, currentStep, currentSlide]);

    // Handle Slide Navigation
    const nextSlide = () => {
        if (currentSlide < SLIDES.length - 1) {
            setCurrentSlide(curr => curr + 1);
        }
    };

    // Handle Signature
    const handleSign = () => {
        signMessage({
            message: `AXON NEXUS AUTHORIZATION\n\nI confirm my connection to AXON NEXUS.\nTimestamp: ${new Date().getTime()}\nAction: Initialize Neural Profile`,
        });
    };

    // Robust Sync Logic
    useEffect(() => {
        let isMounted = true;
        let retryCount = 0;
        const maxRetries = 5;

        if (currentStep === 'sync') {
            const syncSeq = async () => {
                const fetchWithRetry = async () => {
                    await refetchBalances();
                    if (retryCount < maxRetries) {
                        retryCount++;
                        setTimeout(fetchWithRetry, 1000);
                    } else {
                        if (isMounted) setCurrentStep('complete');
                    }
                };

                await refetchBalances();
                setTimeout(async () => {
                    if (isMounted) setCurrentStep('complete');
                }, 3000);
            };
            syncSeq();
        }
        return () => { isMounted = false; };
    }, [currentStep, refetchBalances]);

    return (
        <div className="min-h-screen bg-[#F5F5F7] flex flex-col font-sans text-axon-obsidian overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]" />

            <AnimatePresence mode="wait">
                {currentStep === 'slides' && (
                    <motion.div
                        key="slides"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex-1 flex flex-col px-8 py-12 relative z-10"
                    >
                        {/* Top Nav */}
                        <div className="flex items-center gap-2 mb-8">
                            <div className="w-8 h-8 bg-axon-obsidian rounded-swiss flex items-center justify-center border border-white/10">
                                <Scan className="w-4 h-4 text-axon-neon" />
                            </div>
                            <span className="font-extrabold tracking-tight text-xl">AXON</span>
                            <div className="ml-auto text-[10px] font-mono font-bold text-axon-steel">
                                {currentSlide + 1} / {SLIDES.length}
                            </div>
                        </div>

                        {/* Slide Content */}
                        <div className="flex-1 flex flex-col justify-center">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentSlide}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.4 }}
                                    className="space-y-6"
                                >
                                    <div className="w-20 h-20 rounded-[24px] flex items-center justify-center bg-white border border-gray-200 shadow-xl">
                                        {SLIDES[currentSlide].icon}
                                    </div>
                                    <div className="space-y-3">
                                        <h1 className="text-4xl font-extrabold tracking-tighter leading-none text-axon-obsidian">
                                            {SLIDES[currentSlide].title}
                                        </h1>
                                        <h2 className="text-xl font-bold text-primary tracking-tight">
                                            {SLIDES[currentSlide].subtitle}
                                        </h2>
                                    </div>
                                    <p className="text-axon-steel text-lg font-medium leading-relaxed max-w-sm">
                                        {SLIDES[currentSlide].description}
                                    </p>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Navigation / Connect Button */}
                        <div className="mt-auto">
                            {currentSlide < SLIDES.length - 1 ? (
                                <button
                                    onClick={nextSlide}
                                    className="w-full h-16 bg-axon-obsidian text-white rounded-swiss font-extrabold flex items-center justify-center gap-2 shadow-xl hover:bg-black transition-all active:scale-[0.98]"
                                >
                                    <span className="uppercase tracking-widest text-sm">Next</span>
                                    <ChevronRight className="w-5 h-5 text-axon-neon" />
                                </button>
                            ) : (
                                <div className="space-y-4">
                                    <div className="relative group overflow-hidden rounded-swiss shadow-xl">
                                        {/* Real Connect components from OnchainKit support email login */}
                                        <WalletWrapper className="w-full !bg-axon-obsidian !h-16 !rounded-swiss !flex !items-center !justify-center !text-white !font-extrabold !text-sm !tracking-[0.2em] hover:!bg-black transition-all" />
                                        {!isConnected && (
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-white gap-2">
                                                <Zap className="w-5 h-5 text-axon-neon" fill="currentColor" />
                                                <span className="font-extrabold uppercase tracking-widest text-sm">GET STARTED</span>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-center text-axon-steel font-mono uppercase tracking-widest">
                                        Sign in with email or social • No gas fees
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div >
                )}

                {
                    currentStep === 'signature' && (
                        <motion.div
                            key="signature"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="flex-1 flex flex-col px-8 py-20 items-center justify-center text-center space-y-12 relative z-10"
                        >
                            <div className="w-20 h-20 bg-axon-obsidian rounded-[24px] flex items-center justify-center shadow-lg">
                                <ShieldCheck className="w-10 h-10 text-axon-neon" />
                            </div>
                            <div className="space-y-4 max-w-xs">
                                <h2 className="text-4xl font-extrabold tracking-tighter leading-tight text-axon-obsidian">AUTHORIZE NEXUS</h2>
                                <p className="text-axon-steel font-medium text-lg">Sign the secure message to synchronize your wallet assets.</p>
                            </div>

                            <div className="w-full bg-white border border-gray-200 rounded-swiss p-6 text-left space-y-4 shadow-sm relative overflow-hidden group">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold font-mono text-gray-400 uppercase tracking-widest">Coinbase Smart Wallet</span>
                                    <div className="w-2 h-2 bg-axon-neon rounded-full animate-pulse" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-axon-obsidian font-mono break-all leading-relaxed">
                                        [AUTHENTICATION_REQUEST]
                                    </p>
                                    <p className="text-[10px] font-mono text-axon-steel leading-tight">
                                        Initializing secure bridge between your wallet and AXON V2. No transaction fees will be incurred.
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={handleSign}
                                disabled={isSigning}
                                className="w-full h-16 bg-axon-obsidian text-white rounded-swiss font-extrabold flex items-center justify-center gap-2 shadow-xl hover:bg-black transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSigning ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <Zap className="w-5 h-5 text-axon-neon" fill="currentColor" />
                                        <span>SIGN TO CONNECT</span>
                                    </>
                                )}
                            </button>
                        </motion.div>
                    )
                }

                {
                    currentStep === 'sync' && (
                        <motion.div
                            key="sync"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex-1 flex flex-col px-8 py-20 items-center justify-center space-y-8 relative z-10"
                        >
                            <div className="relative">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                >
                                    <Loader2 className="w-16 h-16 text-primary" />
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="absolute inset-0 flex items-center justify-center"
                                >
                                    <div className="w-2 h-2 bg-axon-neon rounded-full" />
                                </motion.div>
                            </div>
                            <div className="text-center space-y-2">
                                <h2 className="text-2xl font-extrabold tracking-tighter">Syncing Ledger</h2>
                                <p className="text-axon-steel font-mono text-[10px] font-bold uppercase tracking-[0.3em]">
                                    Fetching Assets...
                                </p>
                            </div>
                        </motion.div>
                    )
                }

                {
                    currentStep === 'complete' && (
                        <motion.div
                            key="complete"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex-1 flex flex-col px-8 py-20 items-center justify-center text-center space-y-12 relative z-10"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", damping: 10, stiffness: 100 }}
                                className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-2xl shadow-green-100"
                            >
                                <CheckCircle2 className="w-12 h-12 text-white" />
                            </motion.div>
                            <div className="space-y-4 max-w-xs">
                                <h2 className="text-4xl font-extrabold tracking-tighter italic uppercase text-axon-obsidian">System Online</h2>
                                <p className="text-axon-steel font-medium px-4">Assets synchronized. Welcome to NEXUS.</p>
                            </div>

                            <button
                                onClick={() => setOnboardingComplete(true)}
                                className="w-full h-20 bg-axon-obsidian text-white rounded-swiss font-extrabold text-sm uppercase tracking-[0.2em] shadow-2xl hover:bg-black active:scale-[0.98] transition-all"
                            >
                                ENTER DASHBOARD
                            </button>
                        </motion.div>
                    )
                }
            </AnimatePresence >
        </div >
    );
}
