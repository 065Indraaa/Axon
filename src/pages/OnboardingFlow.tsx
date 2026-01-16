import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ShieldCheck, RefreshCw, ChevronRight, CheckCircle2, Loader2, Scan } from 'lucide-react';
import { useSignMessage } from 'wagmi';
import { useAxon } from '../context/AxonContext';
import clsx from 'clsx';

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
    const [currentStep, setCurrentStep] = useState<Step>('slides');
    const [currentSlide, setCurrentSlide] = useState(0);

    const { signMessage, isPending: isSigning } = useSignMessage({
        mutation: {
            onSuccess: () => {
                setCurrentStep('sync');
            }
        }
    });

    // Handle Slide Progression
    const nextSlide = () => {
        if (currentSlide < SLIDES.length - 1) {
            setCurrentSlide(prev => prev + 1);
        } else {
            setCurrentStep('signature');
        }
    };

    // Handle Signature
    const handleSign = () => {
        signMessage({
            message: `AXON NEXUS AUTHORIZATION\n\nI confirm my connection to AXON NEXUS.\nTimestamp: ${new Date().getTime()}\nAction: Initialize Neural Profile`,
        });
    };

    // Auto-transition from sync to complete
    useEffect(() => {
        if (currentStep === 'sync') {
            const timer = setTimeout(() => {
                setCurrentStep('complete');
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [currentStep]);

    return (
        <div className="min-h-screen bg-[#F5F5F7] flex flex-col font-sans text-axon-obsidian overflow-hidden">
            {/* Background Grain/Texture (consistent with Landing) */}
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
                        {/* Top Nav (Branding) */}
                        <div className="flex items-center gap-2 mb-16">
                            <div className="w-8 h-8 bg-axon-obsidian rounded-swiss flex items-center justify-center">
                                <Scan className="w-4 h-4 text-axon-neon" />
                            </div>
                            <span className="font-extrabold tracking-tight text-xl">AXON</span>
                        </div>

                        <div className="flex-1 flex flex-col justify-center max-w-sm">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentSlide}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.4 }}
                                    className="space-y-6"
                                >
                                    <div className={clsx(
                                        "w-20 h-20 rounded-[24px] flex items-center justify-center shadow-sm",
                                        SLIDES[currentSlide].color
                                    )}>
                                        {SLIDES[currentSlide].icon}
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-bold font-mono tracking-[0.2em] uppercase text-primary">
                                            {SLIDES[currentSlide].subtitle}
                                        </p>
                                        <h1 className="text-5xl font-extrabold tracking-tighter leading-[0.95]">
                                            {SLIDES[currentSlide].title.split(' ').map((word, i) => (
                                                <span key={i} className={i === 1 && currentSlide === 0 ? "text-primary" : ""}>
                                                    {word}{' '}
                                                    {i === 1 && i < SLIDES[currentSlide].title.split(' ').length - 1 && <br />}
                                                </span>
                                            ))}
                                        </h1>
                                    </div>
                                    <p className="text-axon-steel text-lg font-medium leading-relaxed">
                                        {SLIDES[currentSlide].description}
                                    </p>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        <div className="mt-auto space-y-8">
                            <div className="flex gap-2">
                                {SLIDES.map((_, i) => (
                                    <div
                                        key={i}
                                        className={clsx(
                                            "h-1 rounded-full transition-all duration-300",
                                            i === currentSlide ? "w-8 bg-axon-obsidian" : "w-2 bg-gray-300"
                                        )}
                                    />
                                ))}
                            </div>
                            <button
                                onClick={nextSlide}
                                className="w-full h-16 bg-axon-obsidian text-white rounded-swiss font-extrabold flex items-center justify-center gap-2 group hover:bg-black transition-all shadow-lg active:scale-[0.98]"
                            >
                                <span>{currentSlide === SLIDES.length - 1 ? "Get Started" : "Continue"}</span>
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </motion.div>
                )}

                {currentStep === 'signature' && (
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
                            <p className="text-axon-steel font-medium text-lg">Sign the secure message to synchronize your wallet assets with the AXON network.</p>
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
                )}

                {currentStep === 'sync' && (
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
                            <h2 className="text-2xl font-extrabold tracking-tighter">Initializing AXON</h2>
                            <p className="text-axon-steel font-mono text-[10px] font-bold uppercase tracking-[0.3em]">Connecting to Nexus...</p>
                        </div>
                    </motion.div>
                )}

                {currentStep === 'complete' && (
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
                            <h2 className="text-4xl font-extrabold tracking-tighter italic uppercase text-axon-obsidian">Neural Surge Ready</h2>
                            <p className="text-axon-steel font-medium px-4">Your endpoint is fully synchronized. Welcome to the future of ASEAN payments.</p>
                        </div>

                        <button
                            onClick={() => setOnboardingComplete(true)}
                            className="w-full h-20 bg-axon-obsidian text-white rounded-swiss font-extrabold text-sm uppercase tracking-[0.2em] shadow-2xl hover:bg-black active:scale-[0.98] transition-all"
                        >
                            Enter AXON NEXUS
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
