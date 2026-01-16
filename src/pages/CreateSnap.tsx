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

        // Generate random snap ID
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
        <div className="min-h-screen bg-[#F5F5F7] font-sans">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-gray-200">
                <div className="px-6 py-4 flex items-center gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition"
                    >
                        <ArrowLeft className="w-5 h-5 text-axon-obsidian" />
                    </button>
                    <h1 className="text-xl font-black text-axon-obsidian tracking-tight">
                        Create Snap
                    </h1>
                </div>
            </div>

            {/* Content */}
            <div className="px-6 py-8 max-w-2xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-8"
                >
                    {/* Info Card */}
                    <div className="bg-gradient-to-br from-axon-obsidian to-gray-900 rounded-swiss p-6 text-white">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-axon-neon/20 rounded-full flex items-center justify-center flex-shrink-0">
                                <Zap className="w-6 h-6 text-axon-neon" fill="currentColor" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-2">AXON Snap</h3>
                                <p className="text-sm text-gray-300 leading-relaxed">
                                    Create a surprise money transfer. Recipients tap to reveal their amount with a stunning Neural Surge animation.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="space-y-8">
                        {/* Token Selector */}
                        <div>
                            <label className="block text-xs font-bold text-axon-steel uppercase tracking-wider mb-3">
                                Select Cryptocurrency
                            </label>
                            <div className="relative">
                                <button
                                    onClick={() => setShowTokenSelector(!showTokenSelector)}
                                    className="w-full flex items-center justify-between bg-white border-2 border-gray-200 rounded-swiss px-4 py-4 hover:border-axon-neon transition-colors group shadow-sm"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold", selectedToken.color)}>
                                            {selectedToken.icon}
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-axon-obsidian">{selectedToken.symbol}</p>
                                            <p className="text-[10px] text-axon-steel uppercase font-bold tracking-tight">{selectedToken.name}</p>
                                        </div>
                                    </div>
                                    <ChevronDown className={clsx("w-5 h-5 text-gray-400 group-hover:text-axon-neon transition-transform", showTokenSelector && "rotate-180")} />
                                </button>

                                {showTokenSelector && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-swiss shadow-xl z-50 overflow-hidden">
                                        {TOKENS.map((token) => (
                                            <button
                                                key={token.symbol}
                                                onClick={() => {
                                                    setSelectedToken(token);
                                                    setShowTokenSelector(false);
                                                }}
                                                className={clsx(
                                                    "w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0",
                                                    selectedToken.symbol === token.symbol && "bg-gray-50"
                                                )}
                                            >
                                                <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold", token.color)}>
                                                    {token.icon}
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-bold text-axon-obsidian">{token.symbol}</p>
                                                    <p className="text-[10px] text-axon-steel uppercase font-bold tracking-tight">{token.name}</p>
                                                </div>
                                                {selectedToken.symbol === token.symbol && (
                                                    <div className="ml-auto w-2 h-2 bg-axon-neon rounded-full" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Amount Input */}
                        <div>
                            <label className="block text-xs font-bold text-axon-steel uppercase tracking-wider mb-3">
                                Total Amount ({selectedToken.symbol})
                            </label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                className="w-full text-5xl font-black text-axon-obsidian bg-transparent border-0 border-b-4 border-gray-200 focus:border-axon-neon outline-none transition-colors pb-3 font-mono placeholder:text-gray-300"
                            />
                            <p className="mt-2 text-sm text-axon-steel font-mono">
                                Enter the total amount of {selectedToken.symbol} to distribute
                            </p>
                        </div>

                        {/* Number of Snappers */}
                        <div>
                            <label className="block text-xs font-bold text-axon-steel uppercase tracking-wider mb-3">
                                Number of Snappers
                            </label>
                            <input
                                type="number"
                                value={snappers}
                                onChange={(e) => setSnappers(e.target.value)}
                                placeholder="0"
                                min="1"
                                className="w-full text-5xl font-black text-axon-obsidian bg-transparent border-0 border-b-4 border-gray-200 focus:border-axon-neon outline-none transition-colors pb-3 font-mono placeholder:text-gray-300"
                            />
                            <p className="mt-2 text-sm text-axon-steel font-mono">
                                How many people can claim this snap?
                            </p>
                        </div>

                        {/* Distribution Mode Toggle */}
                        <div>
                            <label className="block text-xs font-bold text-axon-steel uppercase tracking-wider mb-4">
                                Distribution Mode
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setMode('equal')}
                                    className={`
                                        h-24 rounded-swiss border-2 transition-all
                                        ${mode === 'equal'
                                            ? 'border-axon-neon bg-axon-neon/10'
                                            : 'border-gray-200 bg-white hover:border-gray-300'
                                        }
                                    `}
                                >
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <div className={`text-2xl ${mode === 'equal' ? 'text-axon-neon' : 'text-axon-steel'}`}>
                                            ⚖️
                                        </div>
                                        <span className={`text-sm font-bold uppercase tracking-wide ${mode === 'equal' ? 'text-axon-obsidian' : 'text-axon-steel'}`}>
                                            Equal
                                        </span>
                                        <span className="text-xs text-gray-400 font-mono">
                                            Same amount
                                        </span>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setMode('random')}
                                    className={`
                                        h-24 rounded-swiss border-2 transition-all
                                        ${mode === 'random'
                                            ? 'border-axon-neon bg-axon-neon/10'
                                            : 'border-gray-200 bg-white hover:border-gray-300'
                                        }
                                    `}
                                >
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <div className={`text-2xl ${mode === 'random' ? 'text-axon-neon' : 'text-axon-steel'}`}>
                                            🎲
                                        </div>
                                        <span className={`text-sm font-bold uppercase tracking-wide ${mode === 'random' ? 'text-axon-obsidian' : 'text-axon-steel'}`}>
                                            Random
                                        </span>
                                        <span className="text-xs text-gray-400 font-mono">
                                            Surprise!
                                        </span>
                                    </div>
                                </button>
                            </div>

                            {/* Mode Description */}
                            <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                                <p className="text-sm text-axon-steel">
                                    {mode === 'equal'
                                        ? `Each person receives exactly ${amount && snappers ? (parseFloat(amount) / parseInt(snappers)).toFixed(2) : '0.00'} ${selectedToken.symbol}`
                                        : `Each person receives a random amount of ${selectedToken.symbol}. More excitement!`
                                    }
                                </p>
                            </div>
                        </div>

                        {/* Generate Button */}
                        <motion.button
                            onClick={handleGenerateSnap}
                            disabled={!isValid}
                            whileHover={isValid ? { scale: 1.02 } : {}}
                            whileTap={isValid ? { scale: 0.98 } : {}}
                            className={`
                                w-full h-16 rounded-swiss font-bold text-sm uppercase tracking-wider transition-all
                                ${isValid
                                    ? 'bg-axon-neon text-axon-obsidian hover:bg-axon-neon/90 shadow-lg shadow-axon-neon/20'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }
                            `}
                        >
                            Generate Snap
                        </motion.button>
                    </div>
                </motion.div>
            </div>

            {/* Confirmation Modal */}
            {showConfirmation && (
                <SnapConfirmation
                    snapId={snapId}
                    amount={parseFloat(amount)}
                    snappers={parseInt(snappers)}
                    mode={mode}
                    token={selectedToken}
                    onClose={handleClose}
                />
            )}
        </div>
    );
}
