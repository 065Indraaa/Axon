import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Zap, ChevronDown } from 'lucide-react';
import { SnapConfirmation } from '../components/SnapConfirmation';
import { SNAP_TOKENS, TokenData } from '../config/tokens';
import clsx from 'clsx';

type DistributionMode = 'equal' | 'random';

export default function CreateSnap() {
    const navigate = useNavigate();
    const [amount, setAmount] = useState('');
    const [snappers, setSnappers] = useState('');
    const [mode, setMode] = useState<DistributionMode>('equal');
    const [selectedToken, setSelectedToken] = useState<TokenData>(SNAP_TOKENS[0]); // Default to USDC
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
        <div className="min-h-screen bg-[#F5F5F7] font-sans text-axon-obsidian overflow-x-hidden">
            {/* Background Effects (Subtle for Light Mode) */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-axon-neon/20 blur-[120px] rounded-full opacity-50" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full" />
                <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:24px_24px]" />
            </div>

            {/* Header */}
            <div className="relative z-30 px-6 py-6 flex items-center justify-between sticky top-0 bg-[#F5F5F7]/80 backdrop-blur-md border-b border-gray-200">
                <button
                    onClick={() => navigate('/')}
                    className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition shadow-sm"
                >
                    <ArrowLeft className="w-5 h-5 text-axon-obsidian" />
                </button>
                <h1 className="text-xs font-black text-axon-obsidian uppercase tracking-widest font-mono">
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
                    className="space-y-8"
                >
                    {/* Hero Section */}
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm mb-2">
                            <Zap className="w-3.5 h-3.5 text-axon-neon fill-black" />
                            <span className="text-[10px] font-bold text-axon-obsidian uppercase tracking-wide">AI Distribution</span>
                        </div>
                        <h2 className="text-4xl font-black tracking-tight text-axon-obsidian uppercase italic leading-none">
                            Create <span className="text-transparent bg-clip-text bg-gradient-to-r from-axon-obsidian to-gray-600">Snap</span>
                        </h2>
                        <p className="text-xs text-axon-steel font-medium tracking-wide">
                            Instant multi-node money distribution
                        </p>
                    </div>

                    {/* Main Form Box */}
                    <div className="bg-white border border-gray-200 rounded-[32px] p-8 shadow-xl shadow-gray-200/50 relative overflow-hidden">

                        <div className="relative z-10 space-y-8">
                            {/* Token Selector */}
                            <div className="space-y-3">
                                <label className="block text-[10px] font-bold text-axon-steel uppercase tracking-widest ml-1">
                                    Network Asset
                                </label>
                                <div className="relative">
                                    <button
                                        onClick={() => setShowTokenSelector(!showTokenSelector)}
                                        className="w-full flex items-center justify-between bg-[#F9F9FB] border border-gray-200 rounded-2xl px-5 py-4 hover:border-gray-300 transition-all group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm", selectedToken.color)}>
                                                {selectedToken.icon}
                                            </div>
                                            <div className="text-left">
                                                <p className="font-bold text-axon-obsidian text-lg leading-none mb-1">{selectedToken.symbol}</p>
                                                <p className="text-[10px] text-axon-steel uppercase font-bold tracking-tight">{selectedToken.name}</p>
                                            </div>
                                        </div>
                                        <ChevronDown className={clsx("w-5 h-5 text-gray-400 group-hover:text-axon-obsidian transition-transform", showTokenSelector && "rotate-180")} />
                                    </button>

                                    <AnimatePresence>
                                        {showTokenSelector && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute top-full left-0 right-0 mt-3 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden"
                                            >
                                                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                                    {SNAP_TOKENS.map((token) => (
                                                        <button
                                                            key={token.symbol}
                                                            onClick={() => {
                                                                setSelectedToken(token);
                                                                setShowTokenSelector(false);
                                                            }}
                                                            className={clsx(
                                                                "w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0",
                                                                selectedToken.symbol === token.symbol && "bg-gray-50"
                                                            )}
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold", token.color)}>
                                                                    {token.icon}
                                                                </div>
                                                                <div className="text-left">
                                                                    <p className="font-bold text-axon-obsidian text-sm">{token.symbol}</p>
                                                                    <p className="text-[10px] text-axon-steel uppercase font-bold">{token.name}</p>
                                                                </div>
                                                            </div>
                                                            {selectedToken.symbol === token.symbol && (
                                                                <div className="w-2 h-2 bg-axon-obsidian rounded-full" />
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
                                    <label className="block text-[10px] font-bold text-axon-steel uppercase tracking-widest">
                                        Surge Amount
                                    </label>
                                    <span className="text-[10px] font-mono text-axon-obsidian/60 uppercase font-bold">
                                        Bal: 420.69 {selectedToken.symbol}
                                    </span>
                                </div>
                                <div className="relative group/input">
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full text-5xl font-black text-axon-obsidian bg-transparent border-b-2 border-gray-200 focus:border-axon-obsidian outline-none transition-all pb-4 font-mono placeholder:text-gray-200"
                                    />
                                    <div className="absolute right-0 bottom-4 text-gray-300 font-mono text-sm uppercase font-bold opacity-100 group-focus-within/input:text-axon-obsidian transition-colors">
                                        {selectedToken.symbol}
                                    </div>
                                </div>
                            </div>

                            {/* Number of Snappers */}
                            <div className="space-y-3">
                                <label className="block text-[10px] font-bold text-axon-steel uppercase tracking-widest ml-1">
                                    Nodes (Recipients)
                                </label>
                                <div className="relative group/input">
                                    <input
                                        type="number"
                                        value={snappers}
                                        onChange={(e) => setSnappers(e.target.value)}
                                        placeholder="0"
                                        className="w-full text-4xl font-black text-axon-obsidian bg-transparent border-b-2 border-gray-200 focus:border-axon-obsidian outline-none transition-all pb-4 font-mono placeholder:text-gray-200"
                                    />
                                    <div className="absolute right-0 bottom-4 text-gray-300 font-mono text-sm uppercase font-bold group-focus-within/input:text-axon-obsidian transition-colors">
                                        SNAPPERS
                                    </div>
                                </div>
                            </div>

                            {/* Distribution Mode */}
                            <div className="space-y-4">
                                <label className="block text-[10px] font-bold text-axon-steel uppercase tracking-widest ml-1">
                                    Neural Logic
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setMode('equal')}
                                        className={clsx(
                                            "relative h-20 rounded-[20px] border transition-all flex flex-col items-center justify-center gap-1 overflow-hidden group",
                                            mode === 'equal'
                                                ? 'bg-axon-obsidian border-axon-obsidian shadow-lg'
                                                : 'bg-[#F9F9FB] border-gray-200 hover:border-gray-300'
                                        )}
                                    >
                                        <span className={clsx("text-xs font-bold uppercase tracking-widest", mode === 'equal' ? 'text-white' : 'text-axon-steel')}>Equal</span>
                                        <span className={clsx("text-[8px] font-mono uppercase opacity-60", mode === 'equal' ? 'text-gray-300' : 'text-gray-400')}>Linear Split</span>
                                    </button>
                                    <button
                                        onClick={() => setMode('random')}
                                        className={clsx(
                                            "relative h-20 rounded-[20px] border transition-all flex flex-col items-center justify-center gap-1 overflow-hidden group",
                                            mode === 'random'
                                                ? 'bg-axon-neon border-axon-neon shadow-[0_0_20px_rgba(204,255,0,0.4)]'
                                                : 'bg-[#F9F9FB] border-gray-200 hover:border-gray-300'
                                        )}
                                    >
                                        <span className={clsx("text-xs font-bold uppercase tracking-widest", mode === 'random' ? 'text-axon-obsidian' : 'text-axon-steel')}>Random</span>
                                        <span className={clsx("text-[8px] font-mono uppercase opacity-60", mode === 'random' ? 'text-axon-obsidian' : 'text-gray-400')}>Chaotic Surge</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-2">
                        <button
                            onClick={handleGenerateSnap}
                            disabled={!isValid}
                            className={clsx(
                                "w-full h-16 rounded-[24px] font-black text-sm uppercase tracking-[0.2em] transition-all relative overflow-hidden group",
                                isValid
                                    ? 'bg-axon-obsidian text-white shadow-xl hover:shadow-2xl active:scale-[0.98]'
                                    : 'bg-gray-100 text-gray-300 cursor-not-allowed border border-gray-200'
                            )}
                        >
                            {isValid && (
                                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out" />
                            )}
                            <span className="relative z-10 flex items-center justify-center gap-3">
                                <Zap className={clsx("w-4 h-4", isValid ? "text-axon-neon fill-current" : "text-gray-300")} />
                                Initiate Surge
                            </span>
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Confirmation Overlay */}
            <AnimatePresence>
                {showConfirmation && (
                    <div className="fixed inset-0 z-[100] bg-white/60 backdrop-blur-xl">
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
