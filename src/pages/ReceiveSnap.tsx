import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { NeuralSurge, CounterAnimation } from '../components/NeuralSurge';
import { Zap, Loader2, AlertCircle, Wallet } from 'lucide-react';
import { SnapService, SnapData } from '../services/snapService';
import { useAccount } from 'wagmi';
import { useAxon } from '../context/AxonContext';
import { AXON_SNAP_ADDRESS, AXON_SNAP_ABI } from '../config/contracts';
import { keccak256, stringToBytes } from 'viem';
import { useWriteContracts } from 'wagmi/experimental';

type SnapPhase = 'initial' | 'surge' | 'result' | 'error';

export default function ReceiveSnap() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { address, isConnected } = useAccount();
    const { setIsOnboardingActive } = useAxon();
    const { writeContractsAsync } = useWriteContracts();
    const [phase, setPhase] = useState<SnapPhase>('initial');
    const [touchPoint, setTouchPoint] = useState({ x: 0, y: 0 });
    const [amount, setAmount] = useState(0);
    const [snapData, setSnapData] = useState<SnapData | null>(null);
    const [isLoadingSnap, setIsLoadingSnap] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [isClaiming, setIsClaiming] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Redirect ke login jika belum login
    useEffect(() => {
        if (!isConnected) {
            navigate('/login');
        }
    }, [isConnected, navigate]);

    // Fetch Snap Details on Mount
    useEffect(() => {
        if (!id) return;

        async function loadSnap() {
            try {
                const data = await SnapService.getSnap(id!);
                setSnapData(data);
            } catch (err) {
                console.error("Failed to load snap:", err);
                setErrorMessage("This Snap link is invalid or has expired.");
                setPhase('error');
            } finally {
                setIsLoadingSnap(false);
            }
        }
        loadSnap();
    }, [id]);

    const handleSnapClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!isConnected || !address) {
            alert("Please connect your wallet to claim.");
            return;
        }

        if (!snapData || snapData.status !== 'active') {
            alert("This Snap is no longer active.");
            return;
        }

        // Get touch/click position
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left + rect.width / 2;
        const y = e.clientY - rect.top + rect.height / 2;
        setTouchPoint({ x, y });

        // Trigger haptic feedback
        if ('vibrate' in navigator) {
            navigator.vibrate([50, 30, 50]);
        }

        setIsClaiming(true);

        try {
            // Attempt to claim
            const isContractFlow = AXON_SNAP_ADDRESS !== '0x0000000000000000000000000000000000000000';

            if (isContractFlow) {
                const snapIdBytes = keccak256(stringToBytes(id!));
                const paymasterUrl = import.meta.env.VITE_PAYMASTER_URL;

                await writeContractsAsync({
                    contracts: [{
                        address: AXON_SNAP_ADDRESS,
                        abi: AXON_SNAP_ABI,
                        functionName: 'claimSnap',
                        args: [snapIdBytes]
                    }],
                    capabilities: {
                        paymasterService: { url: paymasterUrl }
                    }
                });
            }

            const result = await SnapService.claimSnap(id!, address, isContractFlow);

            if (result.success && result.amount !== undefined) {
                setAmount(result.amount);
                // Move to surge phase
                setPhase('surge');

                // Move to result after animation
                setTimeout(() => {
                    setPhase('result');
                }, 2000);
            } else {
                setErrorMessage(result.message || "Claim failed");
                setPhase('error');
            }
        } catch (error) {
            console.error("Claim error:", error);
            setErrorMessage("An unexpected error occurred.");
            setPhase('error');
        } finally {
            setIsClaiming(false);
        }
    };

    const handleConnect = () => {
        // Trigger onboarding/login flow
        if (setIsOnboardingActive) {
            setIsOnboardingActive(true);
        } else {
            navigate('/');
        }
    };

    if (isLoadingSnap) {
        return (
            <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-axon-obsidian animate-spin mb-4" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-axon-steel">Synchronizing Node...</p>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="relative min-h-screen overflow-hidden bg-[#F5F5F7] text-axon-obsidian font-sans">
            <AnimatePresence mode="wait">
                {/* PHASE 1: Initial */}
                {phase === 'initial' && (
                    <motion.div
                        key="initial"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex flex-col items-center justify-center bg-[#F5F5F7]"
                    >
                        {/* Subtle grid pattern */}
                        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:24px_24px]" />

                        {/* Top Context */}
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute top-16 text-center"
                        >
                            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-axon-steel mb-2">Neural Surge Protocol</h2>
                            <p className="text-xl font-bold italic text-axon-obsidian tracking-tight">
                                From: {snapData?.sender_address.substring(0, 6)}...{snapData?.sender_address.substring(38)}
                            </p>
                        </motion.div>

                        {/* SNAP Button */}
                        <div className="relative">
                            <motion.button
                                onClick={handleSnapClick}
                                disabled={isClaiming || !isConnected}
                                className={clsx(
                                    "relative w-56 h-56 rounded-full flex items-center justify-center group bg-white shadow-2xl z-20 transition-all",
                                    !isConnected ? "opacity-50 grayscale cursor-not-allowed" : "shadow-gray-200"
                                )}
                                whileHover={isConnected ? { scale: 1.05 } : {}}
                                whileTap={isConnected ? { scale: 0.95 } : {}}
                            >
                                {/* Pulsing outline - Neon Cyan */}
                                {isConnected && (
                                    <>
                                        <motion.div
                                            className="absolute inset-0 rounded-full border-4 border-axon-neon/50"
                                            animate={{
                                                scale: [1, 1.1, 1],
                                                opacity: [0.5, 0.8, 0.5],
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                        />
                                        <motion.div
                                            className="absolute inset-0 rounded-full border-2 border-axon-neon/30"
                                            animate={{
                                                scale: [1, 1.2, 1],
                                                opacity: [0.3, 0.6, 0.3],
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                ease: "easeInOut",
                                                delay: 0.5
                                            }}
                                        />
                                    </>
                                )}

                                {/* Inner glow */}
                                <div className="absolute inset-0 rounded-full bg-axon-neon/5 blur-xl" />

                                {/* Icon and Text */}
                                <div className="relative z-10 flex flex-col items-center gap-2">
                                    {isClaiming ? (
                                        <Loader2 className="w-12 h-12 text-axon-neon animate-spin" />
                                    ) : (
                                        <Zap className={clsx("w-14 h-14", isConnected ? "text-axon-neon fill-black" : "text-gray-300")} />
                                    )}
                                    <span className="text-4xl font-black text-axon-obsidian tracking-tighter italic">
                                        {isClaiming ? "SYNC" : "SNAP"}
                                    </span>
                                </div>
                            </motion.button>
                        </div>

                        {/* Info text */}
                        <motion.div
                            className="absolute bottom-16 left-0 right-0 text-center px-8"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            {!isConnected ? (
                                <div className="space-y-4">
                                    <p className="text-xs font-bold text-axon-steel uppercase tracking-widest">Identification Required</p>
                                    <button
                                        onClick={handleConnect}
                                        className="inline-flex items-center gap-2 px-8 py-4 bg-axon-obsidian text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl"
                                    >
                                        <Wallet className="w-4 h-4" />
                                        Login to Claim
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-axon-obsidian uppercase tracking-widest">Sequence Ready</p>
                                    <p className="text-[10px] text-axon-steel font-medium uppercase tracking-tight">Tap the core to initialize transmission</p>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}

                {/* PHASE 2: Surge */}
                {phase === 'surge' && (
                    <motion.div
                        key="surge"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 flex items-center justify-center bg-white z-50"
                    >
                        <motion.div
                            className="absolute inset-0 bg-white"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 0.8, 1, 0.8] }}
                            transition={{ duration: 1.5 }}
                        />
                        <div className="relative z-10 scale-150">
                            <div className="text-axon-obsidian font-black text-6xl italic">
                                <CounterAnimation
                                    finalAmount={amount}
                                    onComplete={() => { }}
                                />
                            </div>
                        </div>
                        <NeuralSurge
                            startX={touchPoint.x}
                            startY={touchPoint.y}
                            endX={window.innerWidth / 2}
                            endY={window.innerHeight / 2}
                            onComplete={() => { }}
                        />
                    </motion.div>
                )}

                {/* PHASE 3: Result */}
                {phase === 'result' && (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex flex-col items-center justify-center px-6 bg-[#F5F5F7]"
                    >
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[80%] h-[40%] bg-axon-neon/20 blur-[120px] rounded-full opacity-30" />
                        </div>

                        <div className="relative mb-12">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: "spring", damping: 12 }}
                                className="relative z-10 w-32 h-32 rounded-full bg-white border-4 border-axon-obsidian flex items-center justify-center shadow-2xl"
                            >
                                <Zap className="w-14 h-14 text-axon-neon fill-black" />
                            </motion.div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-center mb-16 relative z-10"
                        >
                            <h2 className="text-[10px] font-black text-axon-neon uppercase tracking-[0.5em] mb-4 font-mono bg-axon-obsidian/5 py-1 px-3 rounded-full inline-block">
                                TRANSMISSION SUCCESSFUL
                            </h2>
                            <h1 className="text-8xl font-black text-axon-obsidian mb-2 tracking-tighter italic">
                                {amount.toFixed(2)}
                            </h1>
                            <p className="text-2xl font-black text-axon-obsidian uppercase tracking-[0.2em] italic">
                                {snapData?.token_symbol}
                            </p>
                        </motion.div>

                        <div className="w-full max-w-sm space-y-4 relative z-10">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate('/scan')}
                                className="w-full h-18 bg-axon-obsidian text-white font-black text-sm uppercase tracking-[0.3em] rounded-2xl shadow-xl hover:shadow-2xl transition-all"
                            >
                                USE TO PAY
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate('/')}
                                className="w-full h-14 bg-white border-2 border-axon-obsidian/10 text-axon-obsidian font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-gray-50 transition-colors"
                            >
                                RETURN TO NEXUS
                            </motion.button>
                        </div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="mt-12 group cursor-pointer"
                            onClick={() => navigator.clipboard.writeText(id || '')}
                        >
                            <span className="text-[8px] font-mono text-gray-400 uppercase tracking-[0.3em] group-hover:text-axon-obsidian transition-colors">
                                NODE_ID: {id?.substring(0, 12).toUpperCase()}...
                            </span>
                        </motion.div>
                    </motion.div>
                )}

                {/* PHASE 4: Error */}
                {phase === 'error' && (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 flex flex-col items-center justify-center px-6 bg-[#F5F5F7]"
                    >
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
                            <AlertCircle className="w-10 h-10 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-black text-axon-obsidian italic uppercase mb-2">Node Failure</h2>
                        <p className="text-sm font-medium text-axon-steel text-center mb-12 max-w-xs">{errorMessage}</p>

                        <button
                            onClick={() => navigate('/')}
                            className="w-full max-w-xs h-14 bg-axon-obsidian text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg transition-all"
                        >
                            Emergency Reset
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
