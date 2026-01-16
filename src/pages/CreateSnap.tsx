import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Zap, ChevronDown } from 'lucide-react';
import { SnapConfirmation } from '../components/SnapConfirmation';
import { TOKENS, TokenData } from '../config/tokens';
import clsx from 'clsx';

type DistributionMode = 'equal' | 'random';

export default function CreateSnap() {
    const navigate = useNavigate();
    const [amount, setAmount] = useState('');
    const [snappers, setSnappers] = useState('');
    const [mode, setMode] = useState<DistributionMode>('equal');
    const [selectedToken, setSelectedToken] = useState<TokenData>(TOKENS[0]); // Default to USDC
    const [showTokenSelector, setShowTokenSelector] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [snapId, setSnapId] = useState('');

    const handleGenerateSnap = () => {
        if (!amount || !snappers || parseFloat(amount) <= 0 || parseInt(snappers) <= 0) {
            return;
        }

        const id = Math.random().toString(36).substring(2, 10);
        setSnapId(id);
        setShowConfirmation(true);
    };

    const handleClose = () => {
        setShowConfirmation(false);
        navigate('/');
    };

    const isValid = amount && snappers && parseFloat(amount) > 0 && parseInt(snappers) > 0;

    return (
        <div className="min-h-screen bg-[#0A0A0A] font-sans text-white overflow-x-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-axon-neon/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
                <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#00F0FF_1px,transparent_1px)] [background-size:32px_32px]" />
            </div>

            {/* Header */}
            <div className="relative z-30 px-6 py-6 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-md">
                <button
                    onClick={() => navigate('/')}
                    className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition"
                >
                    <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                <h1 className="text-sm font-black text-white uppercase tracking-widest font-mono">
                    NEURAL SNAP GENERATOR
                </h1>
                <div className="w-10" /> {/* Spacer */}
            </div>

            {/* Content */}
            <div className="relative z-10 px-6 py-8 max-w-lg mx-auto pb-32">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-10"
                >
                    {/* Hero Section */}
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-axon-neon/10 border border-axon-neon/20 mb-2">
                            <Zap className="w-3 h-3 text-axon-neon" fill="currentColor" />
                            <span className="text-[10px] font-bold text-axon-neon uppercase tracking-tighter">AI-POWERED DISTRIBUTION</span>
                        </div>
                        <h2 className="text-3xl font-black tracking-tight text-white uppercase italic">
                            Create <span className="text-axon-neon">Snap</span>
                        </h2>
                        <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">
                            Instant neural money distribution
                        </p>
                    </div>

                    {/* Main Form Box */}
                    <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[32px] p-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-axon-neon/5 via-transparent to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                        <div className="relative z-10 space-y-8">
                            {/* Token Selector */}
                            <div className="space-y-3">
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                                    Network Asset
                                </label>
                                <div className="relative">
                                    <button
                                        onClick={() => setShowTokenSelector(!showTokenSelector)}
                                        className="w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl px-5 py-4 hover:border-axon-neon/50 transition-all group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-black/40", selectedToken.color)}>
                                                {selectedToken.icon}
                                            </div>
                                            <div className="text-left">
                                                <p className="font-bold text-white text-lg leading-none mb-1">{selectedToken.symbol}</p>
                                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">{selectedToken.name}</p>
                                            </div>
                                        </div>
                                        <ChevronDown className={clsx("w-5 h-5 text-gray-500 group-hover:text-axon-neon transition-transform", showTokenSelector && "rotate-180")} />
                                    </button>

                                    <AnimatePresence>
                                        {showTokenSelector && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute top-full left-0 right-0 mt-3 bg-[#1A1A1A] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl"
                                            >
                                                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                                    {TOKENS.map((token) => (
                                                        <button
                                                            key={token.symbol}
                                                            onClick={() => {
                                                                setSelectedToken(token);
                                                                setShowTokenSelector(false);
                                                            }}
                                                            className={clsx(
                                                                "w-full px-5 py-4 flex items-center justify-between hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0",
                                                                selectedToken.symbol === token.symbol && "bg-white/5"
                                                            )}
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold", token.color)}>
                                                                    {token.icon}
                                                                </div>
                                                                <div className="text-left">
                                                                    <p className="font-bold text-white text-sm">{token.symbol}</p>
                                                                    <p className="text-[10px] text-gray-500 uppercase font-bold">{token.name}</p>
                                                                </div>
                                                            </div>
                                                            {selectedToken.symbol === token.symbol && (
                                                                <div className="w-2 h-2 bg-axon-neon rounded-full shadow-[0_0_10px_rgba(204,255,0,0.8)]" />
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Amount Input */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-end ml-1">
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                        Surge Amount
                                    </label>
                                    <span className="text-[10px] font-mono text-axon-neon/60 uppercase">Available: 420.69 {selectedToken.symbol}</span>
                                </div>
                                <div className="relative group/input">
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full text-5xl font-black text-white bg-transparent border-b-2 border-white/10 focus:border-axon-neon outline-none transition-all pb-4 font-mono placeholder:text-white/5"
                                    />
                                    <div className="absolute right-0 bottom-4 text-axon-steel font-mono text-sm uppercase font-bold opacity-40 group-focus-within/input:opacity-100 transition-opacity">
                                        {selectedToken.symbol}
                                    </div>
                                </div>
                            </div>

                            {/* Number of Snappers */}
                            <div className="space-y-3">
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                                    Nodes (Recipients)
                                </label>
                                <div className="relative group/input">
                                    <input
                                        type="number"
                                        value={snappers}
                                        onChange={(e) => setSnappers(e.target.value)}
                                        placeholder="0"
                                        className="w-full text-4xl font-black text-white bg-transparent border-b-2 border-white/10 focus:border-axon-neon outline-none transition-all pb-4 font-mono placeholder:text-white/5"
                                    />
                                    <div className="absolute right-0 bottom-4 text-axon-steel font-mono text-sm uppercase font-bold opacity-40 group-focus-within/input:opacity-100 transition-opacity">
                                        SNAPPERS
                                    </div>
                                </div>
                            </div>

                            {/* Distribution Mode */}
                            <div className="space-y-4">
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                                    Neural Logic
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setMode('equal')}
                                        className={clsx(
                                            "relative h-20 rounded-[20px] border transition-all flex flex-col items-center justify-center gap-1 overflow-hidden",
                                            mode === 'equal'
                                                ? 'bg-white/10 border-axon-neon shadow-[0_0_20px_rgba(204,255,0,0.1)]'
                                                : 'bg-white/5 border-white/10 hover:border-white/20'
                                        )}
                                    >
                                        <span className={clsx("text-xs font-bold uppercase tracking-widest", mode === 'equal' ? 'text-axon-neon' : 'text-gray-400')}>Equal</span>
                                        <span className="text-[8px] font-mono text-gray-500 uppercase opacity-60">Linear Split</span>
                                    </button>
                                    <button
                                        onClick={() => setMode('random')}
                                        className={clsx(
                                            "relative h-20 rounded-[20px] border transition-all flex flex-col items-center justify-center gap-1 overflow-hidden",
                                            mode === 'random'
                                                ? 'bg-white/10 border-axon-neon shadow-[0_0_20px_rgba(204,255,0,0.1)]'
                                                : 'bg-white/5 border-white/10 hover:border-white/20'
                                        )}
                                    >
                                        <span className={clsx("text-xs font-bold uppercase tracking-widest", mode === 'random' ? 'text-axon-neon' : 'text-gray-400')}>Random</span>
                                        <span className="text-[8px] font-mono text-gray-500 uppercase opacity-60">Chaotic Surge</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-4">
                        <button
                            onClick={handleGenerateSnap}
                            disabled={!isValid}
                            className={clsx(
                                "w-full h-16 rounded-[24px] font-black text-sm uppercase tracking-[0.2em] transition-all relative overflow-hidden group/btn",
                                isValid
                                    ? 'bg-axon-neon text-axon-obsidian shadow-[0_0_40px_rgba(204,255,0,0.2)] hover:shadow-[0_0_60px_rgba(204,255,0,0.4)] active:scale-95'
                                    : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
                            )}
                        >
                            {isValid && (
                                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 ease-out italic" />
                            )}
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                <Zap className="w-4 h-4 fill-current" />
                                Initiate Surge
                            </span>
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Confirmation Overlay */}
            <AnimatePresence>
                {showConfirmation && (
                    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-2xl">
                        <SnapConfirmation
                            snapId={snapId}
                            amount={parseFloat(amount)}
                            snappers={parseInt(snappers)}
                            mode={mode}
                            token={selectedToken}
                            onClose={handleClose}
                        />
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
