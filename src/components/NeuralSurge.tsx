import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface NeuralSurgeProps {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    onComplete?: () => void;
}

export function NeuralSurge({ startX, startY, endX, endY, onComplete }: NeuralSurgeProps) {
    const [isAnimating, setIsAnimating] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsAnimating(false);
            onComplete?.();
        }, 800);
        return () => clearTimeout(timer);
    }, [onComplete]);

    // Create a jagged lightning bolt path
    const createLightningPath = () => {
        const segments = 8;
        let path = `M ${startX} ${startY}`;

        for (let i = 1; i <= segments; i++) {
            const progress = i / segments;
            const x = startX + (endX - startX) * progress + (Math.random() - 0.5) * 40;
            const y = startY + (endY - startY) * progress + (Math.random() - 0.5) * 40;
            path += ` L ${x} ${y}`;
        }

        path += ` L ${endX} ${endY}`;
        return path;
    };

    const [lightningPath] = useState(createLightningPath());

    if (!isAnimating) return null;

    return (
        <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-50"
            style={{ filter: 'drop-shadow(0 0 8px rgba(0, 240, 255, 0.8))' }}
        >
            {/* Main lightning bolt */}
            <motion.path
                d={lightningPath}
                stroke="url(#lightning-gradient)"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{
                    pathLength: 1,
                    opacity: [0, 1, 1, 0],
                }}
                transition={{
                    duration: 0.6,
                    times: [0, 0.1, 0.7, 1],
                    ease: "easeOut"
                }}
            />

            {/* Secondary glow bolt */}
            <motion.path
                d={lightningPath}
                stroke="#00F0FF"
                strokeWidth="1"
                fill="none"
                strokeLinecap="round"
                opacity="0.6"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            />

            {/* Gradient definition */}
            <defs>
                <linearGradient id="lightning-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="50%" stopColor="#00F0FF" />
                    <stop offset="100%" stopColor="#0080FF" />
                </linearGradient>
            </defs>

            {/* Start point glow */}
            <motion.circle
                cx={startX}
                cy={startY}
                r="8"
                fill="#00F0FF"
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: [0, 1.5, 0], opacity: [1, 0.5, 0] }}
                transition={{ duration: 0.6 }}
            />

            {/* End point impact */}
            <motion.circle
                cx={endX}
                cy={endY}
                r="20"
                fill="none"
                stroke="#00F0FF"
                strokeWidth="2"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 2, 3], opacity: [0, 1, 0] }}
                transition={{ duration: 0.8, delay: 0.4 }}
            />
        </svg>
    );
}

interface CounterAnimationProps {
    finalAmount: number;
    onComplete?: () => void;
}

export function CounterAnimation({ finalAmount, onComplete }: CounterAnimationProps) {
    const [displayAmount, setDisplayAmount] = useState(0);
    const [isSpinning, setIsSpinning] = useState(true);

    useEffect(() => {
        // Rapid spinning phase
        const spinInterval = setInterval(() => {
            setDisplayAmount(Math.random() * 100);
        }, 50);

        // Stop spinning and show final amount
        const stopTimer = setTimeout(() => {
            clearInterval(spinInterval);
            setIsSpinning(false);
            setDisplayAmount(finalAmount);
            setTimeout(() => onComplete?.(), 300);
        }, 1200);

        return () => {
            clearInterval(spinInterval);
            clearTimeout(stopTimer);
        };
    }, [finalAmount, onComplete]);

    return (
        <motion.div
            className="text-6xl font-black text-axon-neon font-mono"
            animate={isSpinning ? {
                scale: [1, 1.1, 1],
                filter: ['blur(0px)', 'blur(2px)', 'blur(0px)']
            } : {
                scale: [1.2, 1],
            }}
            transition={isSpinning ? {
                duration: 0.1,
                repeat: Infinity,
            } : {
                duration: 0.3,
                ease: "easeOut"
            }}
        >
            ${displayAmount.toFixed(2)}
        </motion.div>
    );
}
