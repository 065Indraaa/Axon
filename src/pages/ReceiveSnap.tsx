import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { NeuralSurge, CounterAnimation } from '../components/NeuralSurge';
import { Zap } from 'lucide-react';

type SnapPhase = 'initial' | 'surge' | 'result';

export default function ReceiveSnap() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [phase, setPhase] = useState<SnapPhase>('initial');
    const [touchPoint, setTouchPoint] = useState({ x: 0, y: 0 });
    const [amount, setAmount] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // Redirect if no snap ID is provided
    if (!id) {
        navigate('/');
        return null;
    }

    // Mock: Generate random amount between 0.5 and 5 USDC
    const generateAmount = () => {
        return parseFloat((Math.random() * 4.5 + 0.5).toFixed(2));
    };

    const handleSnapClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        // Get touch/click position
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left + rect.width / 2;
        const y = e.clientY - rect.top + rect.height / 2;

        setTouchPoint({ x, y });

        // Generate amount
        const snapAmount = generateAmount();
        setAmount(snapAmount);

        // Trigger haptic feedback (vibration)
        if ('vibrate' in navigator) {
            navigator.vibrate([50, 30, 50]); // Short-long-short pattern
        }

        // Move to surge phase
        setPhase('surge');

        // Move to result after animation
        setTimeout(() => {
            setPhase('result');
        }, 2000);
    };

    const handleUseToPayQRIS = () => {
        navigate('/scan');
    };

    return (
        <div ref={containerRef} className="relative min-h-screen overflow-hidden">
            <AnimatePresence mode="wait">
                {/* PHASE 1: Initial - Black Screen with SNAP Button */}
                {phase === 'initial' && (
                    <motion.div
                        key="initial"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-[#0A0A0A] flex items-center justify-center"
                    >
                        {/* Subtle grid pattern */}
                        <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#00F0FF_1px,transparent_1px)] [background-size:32px_32px]" />

                        {/* SNAP Button */}
                        <motion.button
                            onClick={handleSnapClick}
                            className="relative w-48 h-48 rounded-full flex items-center justify-center group"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {/* Pulsing outline */}
                            <motion.div
                                className="absolute inset-0 rounded-full border-4 border-axon-neon"
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

                            {/* Secondary pulse */}
                            <motion.div
                                className="absolute inset-0 rounded-full border-2 border-axon-neon"
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

                            {/* Inner glow */}
                            <div className="absolute inset-0 rounded-full bg-axon-neon/10 blur-xl" />

                            {/* Icon and Text */}
                            <div className="relative z-10 flex flex-col items-center gap-3">
                                <Zap className="w-12 h-12 text-axon-neon" fill="currentColor" />
                                <span className="text-3xl font-black text-white tracking-wider">SNAP</span>
                            </div>
                        </motion.button>

                        {/* Info text */}
                        <motion.div
                            className="absolute bottom-12 left-0 right-0 text-center"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <p className="text-sm text-gray-500 font-mono">
                                Tap to reveal your surprise
                            </p>
                        </motion.div>
                    </motion.div>
                )}

                {/* PHASE 2: Surge - Neural Animation */}
                {phase === 'surge' && (
                    <motion.div
                        key="surge"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-[#0A0A0A] flex items-center justify-center"
                    >
                        {/* Cyan glow from edges */}
                        <motion.div
                            className="absolute inset-0"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 0.3, 0.5, 0.3] }}
                            transition={{ duration: 1.5 }}
                            style={{
                                background: 'radial-gradient(circle at center, transparent 40%, rgba(0, 240, 255, 0.1) 100%)',
                            }}
                        />

                        {/* Counter in center */}
                        <div className="relative z-10">
                            <CounterAnimation
                                finalAmount={amount}
                                onComplete={() => { }}
                            />
                        </div>

                        {/* Neural Surge Animation */}
                        <NeuralSurge
                            startX={touchPoint.x}
                            startY={touchPoint.y}
                            endX={window.innerWidth / 2}
                            endY={window.innerHeight / 2}
                            onComplete={() => { }}
                        />
                    </motion.div>
                )}

                {/* PHASE 3: Result - White Screen with Amount */}
                {phase === 'result' && (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="absolute inset-0 bg-white flex flex-col items-center justify-center px-6"
                    >
                        {/* Success Icon */}
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="mb-8"
                        >
                            <div className="w-24 h-24 rounded-full bg-axon-neon/10 flex items-center justify-center">
                                <Zap className="w-12 h-12 text-axon-neon" fill="currentColor" />
                            </div>
                        </motion.div>

                        {/* Amount Display */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-center mb-12"
                        >
                            <h1 className="text-5xl font-black text-axon-obsidian mb-4 tracking-tight">
                                You Snapped
                            </h1>
                            <p className="text-6xl font-black text-axon-neon font-mono mb-6">
                                ${amount.toFixed(2)} USDC
                            </p>
                            <p className="text-sm text-axon-steel font-mono">
                                Transaction secured on Base Network
                            </p>
                        </motion.div>

                        {/* Action Button */}
                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            onClick={handleUseToPayQRIS}
                            className="w-full max-w-md h-14 bg-axon-obsidian text-white font-bold text-sm uppercase tracking-wider rounded-swiss hover:bg-axon-obsidian/90 transition-colors"
                        >
                            USE TO PAY QRIS
                        </motion.button>

                        {/* Snap ID */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            className="mt-8 text-xs text-gray-400 font-mono"
                        >
                            SNAP ID: {id?.toUpperCase()}
                        </motion.p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
