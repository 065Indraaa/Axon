import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { NeuralSurge, CounterAnimation } from '../components/NeuralSurge';
import { Zap, Check, ArrowRight } from 'lucide-react';

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
        <div ref={containerRef} className="relative min-h-screen overflow-hidden bg-[#F5F5F7] text-axon-obsidian font-sans">
            <AnimatePresence mode="wait">
                {/* PHASE 1: Initial - Light Screen with SNAP Button */}
                {phase === 'initial' && (
                    <motion.div
                        key="initial"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center"
                    >
                        {/* Subtle grid pattern */}
                        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:24px_24px]" />

                        {/* SNAP Button */}
                        <motion.button
                            onClick={handleSnapClick}
                            className="relative w-48 h-48 rounded-full flex items-center justify-center group bg-white shadow-2xl shadow-gray-200"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {/* Pulsing outline - Neon Cyan */}
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

                            {/* Secondary pulse */}
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

                            {/* Inner glow */}
                            <div className="absolute inset-0 rounded-full bg-axon-neon/5 blur-xl" />

                            {/* Icon and Text */}
                            <div className="relative z-10 flex flex-col items-center gap-2">
                                <Zap className="w-12 h-12 text-axon-neon fill-black" />
                                <span className="text-3xl font-black text-axon-obsidian tracking-wider">SNAP</span>
                            </div>
                        </motion.button>

                        {/* Info text */}
                        <motion.div
                            className="absolute bottom-16 left-0 right-0 text-center"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <p className="text-sm text-axon-steel font-medium tracking-wide uppercase">
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
                        className="absolute inset-0 flex items-center justify-center"
                    >
                        {/* White Surge Background */}
                        <motion.div
                            className="absolute inset-0 bg-white"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 0.8, 1, 0.8] }}
                            transition={{ duration: 1.5 }}
                        />

                        {/* Center Glow */}
                        <motion.div
                            className="absolute inset-0"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 0.3, 0.5, 0.3] }}
                            style={{
                                background: 'radial-gradient(circle at center, transparent 40%, rgba(204, 255, 0, 0.2) 100%)',
                            }}
                        />

                        {/* Counter in center - Dark text */}
                        <div className="relative z-10 scale-150">
                            {/* Note: CounterAnimation needs to handle dark text if internal logic sets color, checking component... 
                                 Assume CounterAnimation styling needs to be controlled or override via standard css if possible. 
                                 For now wrapping in strict div text-color */}
                            <div className="text-axon-obsidian font-black text-6xl">
                                <CounterAnimation
                                    finalAmount={amount}
                                    onComplete={() => { }}
                                />
                            </div>
                        </div>

                        {/* Neural Surge Animation - needs to be visible against white. 
                            If NeuralSurge uses white/light colors, it might be invisible. 
                            We assume NeuralSurge uses standard colors or canvas. 
                            Ideally we'd pass a 'theme="light"' if supported. */}
                        <NeuralSurge
                            startX={touchPoint.x}
                            startY={touchPoint.y}
                            endX={window.innerWidth / 2}
                            endY={window.innerHeight / 2}
                            onComplete={() => { }}
                        />
                    </motion.div>
                )}

                {/* PHASE 3: Result - Light Screen with Amount */}
                {phase === 'result' && (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex flex-col items-center justify-center px-6"
                    >
                        {/* Background Effects */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[80%] h-[40%] bg-axon-neon/20 blur-[120px] rounded-full opacity-30" />
                        </div>

                        {/* Neural Success Ring */}
                        <div className="relative mb-12">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: "spring", damping: 12 }}
                                className="relative z-10 w-32 h-32 rounded-full bg-white border-4 border-axon-obsidian flex items-center justify-center shadow-2xl"
                            >
                                <Zap className="w-14 h-14 text-axon-neon fill-black" />
                            </motion.div>

                            {/* Decorative Orbitals */}
                            {[...Array(3)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute inset-[-20px] rounded-full border border-axon-neon"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 10 + i * 5, repeat: Infinity, ease: "linear" }}
                                    style={{ opacity: 0.3 }}
                                />
                            ))}
                        </div>

                        {/* Amount Display */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-center mb-16 relative z-10"
                        >
                            <h2 className="text-[10px] font-black text-axon-neon uppercase tracking-[0.5em] mb-4 font-mono bg-axon-obsidian/5 py-1 px-3 rounded-full inline-block">
                                SURGE COMPLETE
                            </h2>
                            <h1 className="text-7xl font-black text-axon-obsidian mb-2 tracking-tighter italic">
                                {amount.toFixed(2)}
                            </h1>
                            <p className="text-xl font-bold text-axon-steel uppercase tracking-widest font-mono">
                                USDC Received
                            </p>
                        </motion.div>

                        {/* Info Grid */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="w-full max-w-sm grid grid-cols-2 gap-px bg-gray-200 border border-gray-200 rounded-2xl overflow-hidden mb-12"
                        >
                            <div className="bg-white p-4 flex flex-col items-center">
                                <span className="text-[8px] font-bold text-axon-steel uppercase tracking-widest mb-1">Network</span>
                                <span className="text-xs font-bold text-axon-obsidian font-mono lowercase tracking-tighter">base_mainnet</span>
                            </div>
                            <div className="bg-white p-4 flex flex-col items-center">
                                <span className="text-[8px] font-bold text-axon-steel uppercase tracking-widest mb-1">Status</span>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                    <span className="text-xs font-bold text-green-600 uppercase">Settled</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Action Buttons */}
                        <div className="w-full max-w-sm space-y-4 relative z-10">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleUseToPayQRIS}
                                className="w-full h-16 bg-axon-obsidian text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl hover:shadow-2xl transition-all"
                            >
                                Use to Pay QRIS
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate('/')}
                                className="w-full h-14 bg-white border border-gray-200 text-axon-obsidian font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-gray-50 transition-colors"
                            >
                                Back to Dashboard
                            </motion.button>
                        </div>

                        {/* Snap ID */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="mt-12 group cursor-pointer"
                            onClick={() => navigator.clipboard.writeText(id || '')}
                        >
                            <span className="text-[8px] font-mono text-gray-400 uppercase tracking-[0.3em] group-hover:text-axon-obsidian transition-colors">
                                SNAP_HASH: {id?.toUpperCase()}
                            </span>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
