import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ShieldCheck, RefreshCw, LayoutDashboard, History as HistoryIcon, Layers, User, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useAxon } from '../context/AxonContext';
import clsx from 'clsx';

type Step = 'slides' | 'signature' | 'sync' | 'complete';

const SLIDES = [
    {
        title: "Welcome to the Nexus",
        description: "Your gateway to frictionless ASEAN cross-border payments. Stable, secure, and instant.",
        icon: <Zap className="w-12 h-12 text-axon-neon" fill="currentColor" />,
        color: "from-blue-600 to-indigo-600"
    },
    {
        title: "One QR for All",
        description: "Scan QRIS, DuitNow, or PayNow seamlessly. We handle the conversions, you handle the business.",
        icon: <RefreshCw className="w-12 h-12 text-primary" />,
        color: "from-primary to-blue-500"
    },
    {
        title: "Neural Security",
        description: "Your assets are protected by Base L2 security and local regulatory-compliant stablecoins.",
        icon: <ShieldCheck className="w-12 h-12 text-green-500" />,
        color: "from-green-500 to-emerald-600"
    }
];

const SYNC_NODES = [
    { id: 'dashboard', name: 'Neural Dashboard', icon: LayoutDashboard },
    { id: 'history', name: 'Transaction Ledgers', icon: HistoryIcon },
    { id: 'staking', name: 'Yield Protocols', icon: Layers },
    { id: 'account', name: 'User Profile', icon: User }
];

export default function OnboardingFlow() {
    const { setOnboardingComplete } = useAxon();
    const [currentStep, setCurrentStep] = useState<Step>('slides');
    const [currentSlide, setCurrentSlide] = useState(0);
    const [syncProgress, setSyncProgress] = useState<Record<string, number>>({
        dashboard: 0,
        history: 0,
        staking: 0,
        account: 0
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
        // Mocking a signature delay
        setCurrentStep('sync');
    };

    // Handle Synchronization Animation
    useEffect(() => {
        if (currentStep === 'sync') {
            const nodes = ['dashboard', 'history', 'staking', 'account'];
            let currentNodeIndex = 0;

            const interval = setInterval(() => {
                const currentNode = nodes[currentNodeIndex];
                setSyncProgress(prev => ({
                    ...prev,
                    [currentNode]: Math.min(prev[currentNode] + 10, 100)
                }));

                if (syncProgress[currentNode] >= 100) {
                    currentNodeIndex++;
                    if (currentNodeIndex >= nodes.length) {
                        clearInterval(interval);
                        setTimeout(() => setCurrentStep('complete'), 500);
                    }
                }
            }, 150);

            return () => clearInterval(interval);
        }
    }, [currentStep, syncProgress]);

    return (
        <div className="min-h-screen bg-[#F5F5F7] flex flex-col font-sans text-axon-obsidian overflow-hidden">
            <AnimatePresence mode="wait">
                {currentStep === 'slides' && (
                    <motion.div
                        key="slides"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="flex-1 flex flex-col px-8 py-12"
                    >
                        <div className="flex-1 flex flex-col justify-center">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentSlide}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="space-y-8"
                                >
                                    <div className={clsx(
                                        "w-24 h-24 rounded-[32px] flex items-center justify-center bg-gradient-to-br shadow-xl mb-12",
                                        SLIDES[currentSlide].color
                                    )}>
                                        {SLIDES[currentSlide].icon}
                                    </div>
                                    <h1 className="text-4xl font-extrabold tracking-tighter leading-tight">
                                        {SLIDES[currentSlide].title}
                                    </h1>
                                    <p className="text-axon-steel text-lg leading-relaxed">
                                        {SLIDES[currentSlide].description}
                                    </p>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        <div className="space-y-6">
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
                                className="w-full h-16 bg-axon-obsidian text-white rounded-swiss font-bold flex items-center justify-center gap-2 group hover:bg-black transition-all"
                            >
                                {currentSlide === SLIDES.length - 1 ? "Get Started" : "Continue"}
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </motion.div>
                )}

                {currentStep === 'signature' && (
                    <motion.div
                        key="signature"
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, y: -100 }}
                        className="flex-1 flex flex-col px-8 py-20 items-center justify-center text-center space-y-12"
                    >
                        <div className="w-20 h-20 bg-axon-neon/10 rounded-full flex items-center justify-center border border-axon-neon/20">
                            <ShieldCheck className="w-10 h-10 text-axon-obsidian" />
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-3xl font-extrabold tracking-tighter">Secure Connection</h2>
                            <p className="text-axon-steel">Please sign the authorization message in your wallet to synchronize your neural profile.</p>
                        </div>

                        <div className="w-full bg-white border border-gray-200 rounded-swiss p-6 text-left space-y-4 shadow-sm italic">
                            <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Message to Sign</p>
                            <p className="text-sm font-medium text-axon-obsidian font-mono">
                                Welcome to AXON NEXUS.
                                Timestamp: {new Date().toISOString()}
                                Action: Initialize Neural Sync
                            </p>
                        </div>

                        <button
                            onClick={handleSign}
                            className="w-full h-16 bg-axon-neon text-axon-obsidian rounded-swiss font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-axon-neon/20 hover:scale-[1.02] transition-transform"
                        >
                            Authorize & Sync
                        </button>
                    </motion.div>
                )}

                {currentStep === 'sync' && (
                    <motion.div
                        key="sync"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex-1 flex flex-col px-8 py-20 items-center justify-center space-y-16"
                    >
                        <div className="text-center space-y-4">
                            <div className="relative w-24 h-24 mx-auto mb-8">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 rounded-full border-4 border-dashed border-axon-neon opacity-30"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <RefreshCw className="w-10 h-10 text-axon-obsidian animate-spin-slow" />
                                </div>
                            </div>
                            <h2 className="text-3xl font-extrabold tracking-tighter">Synchronizing Nexus</h2>
                            <p className="text-axon-steel font-mono text-[10px] uppercase tracking-widest">Bridging secure endpoints</p>
                        </div>

                        <div className="w-full space-y-4">
                            {SYNC_NODES.map((node) => {
                                const progress = syncProgress[node.id];
                                return (
                                    <div key={node.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
                                        <div className={clsx(
                                            "w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow-inner",
                                            progress >= 100 ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-400"
                                        )}>
                                            <node.icon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-xs font-bold text-axon-obsidian">{node.name}</span>
                                                <span className="text-[10px] font-mono font-bold text-axon-steel">{progress}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${progress}%` }}
                                                    className="h-full bg-axon-neon shadow-[0_0_10px_rgba(204,255,0,0.5)]"
                                                />
                                            </div>
                                        </div>
                                        {progress >= 100 && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                            >
                                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                            </motion.div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {currentStep === 'complete' && (
                    <motion.div
                        key="complete"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex-1 flex flex-col px-8 py-20 items-center justify-center text-center space-y-12"
                    >
                        <div className="w-32 h-32 bg-green-500 rounded-full flex items-center justify-center shadow-2xl shadow-green-200">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", damping: 10, stiffness: 100, delay: 0.2 }}
                            >
                                <CheckCircle2 className="w-16 h-16 text-white" />
                            </motion.div>
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-4xl font-black tracking-tighter italic uppercase text-axon-obsidian">Neural Surge Ready</h2>
                            <p className="text-axon-steel font-medium">Welcome home, user. Your Nexus endpoint is fully synchronized and ready for cross-border operations.</p>
                        </div>

                        <button
                            onClick={() => setOnboardingComplete(true)}
                            className="w-full h-20 bg-axon-obsidian text-white rounded-swiss font-black text-sm uppercase tracking-[0.2em] shadow-2xl hover:bg-black active:scale-95 transition-all"
                        >
                            Enter AXON NEXUS
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
