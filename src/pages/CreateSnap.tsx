import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Zap, ChevronDown, Wallet, Loader2 } from 'lucide-react';
import { SnapConfirmation } from '../components/SnapConfirmation';
import { SNAP_TOKENS } from '../config/tokens';
import { useAllWalletTokens } from '../hooks/useAllWalletTokens';
import { useWalletBalances } from '../hooks/useWalletBalances';
import { SnapService } from '../services/snapService';
import { useAccount } from 'wagmi';
import { useWriteContracts } from 'wagmi/experimental';
import { parseUnits } from 'viem';
import { AXON_VAULT_ADDRESS, ERC20_ABI } from '../config/contracts';
import clsx from 'clsx';
import { v4 as uuidv4 } from 'uuid';

type DistributionMode = 'equal' | 'random';

export default function CreateSnap() {
    const navigate = useNavigate();
    const { address } = useAccount();
    const { writeContractsAsync } = useWriteContracts();

    // Fetch all tokens from wallet using CDP API
    const { tokens: cdpTokens, isLoading: cdpLoading } = useAllWalletTokens();

    // Fallback: Use hardcoded tokens if CDP fails
    const { balances: fallbackBalances, isLoading: fallbackLoading } = useWalletBalances(SNAP_TOKENS);

    // Use CDP tokens if available, otherwise fallback to hardcoded
    const availableTokens = cdpTokens.length > 0 ? cdpTokens : SNAP_TOKENS;
    const isLoading = cdpLoading || fallbackLoading;

    const [amount, setAmount] = useState('');
    const [snappers, setSnappers] = useState('');
    const [mode, setMode] = useState<DistributionMode>('equal');
    const [selectedToken, setSelectedToken] = useState<any>(availableTokens[0] || SNAP_TOKENS[0]);
    const [showTokenSelector, setShowTokenSelector] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [snapId, setSnapId] = useState('');
    const [isCreating, setIsCreating] = useState(false);



    const handleGenerateSnap = async () => {
        if (!amount || !snappers || parseFloat(amount) <= 0 || parseInt(snappers) <= 0) {
            return;
        }

        // Balance Validation
        const currentBal = selectedToken.balanceNum ||
            (fallbackBalances[selectedToken.symbol] ? parseFloat(fallbackBalances[selectedToken.symbol].replace(/,/g, '')) : 0);
        if (parseFloat(amount) > currentBal) {
            alert("Insufficient balance!");
            return;
        }

        if (!address) {
            alert("Please connect your wallet first.");
            return;
        }

        setIsCreating(true);
        try {
            // 1. Prepare Validation (Parse Amount)
            const parsedAmount = parseUnits(amount, selectedToken.decimals);

            // 2. Execute On-Chain Transaction (Gasless via Paymaster)
            // Note: For Mainnet, we need a real Paymaster Policy URL usually.
            // Using a generic structure that Coinbase Smart Wallet might auto-sponsor if eligible.
            const paymasterUrl = import.meta.env.VITE_PAYMASTER_URL;

            const txId = await writeContractsAsync({
                contracts: [
                    {
                        address: selectedToken.address,
                        abi: ERC20_ABI,
                        functionName: 'transfer',
                        args: [AXON_VAULT_ADDRESS, parsedAmount],
                    },
                ],
                capabilities: {
                    paymasterService: {
                        url: paymasterUrl || undefined, // undefined falls back to wallet default if available
                    },
                },
            });

            console.log("Transaction sent:", txId);

            // 3. Create Snap Record in Supabase
            const newSnapId = uuidv4();
            await SnapService.createSnap({
                id: newSnapId,
                sender_address: address,
                token_symbol: selectedToken.symbol,
                total_amount: parseFloat(amount),
                remaining_amount: parseFloat(amount),
                snappers_count: parseInt(snappers),
                mode: mode,
                status: 'active'
            });

            setSnapId(newSnapId);
            setShowConfirmation(true);
        } catch (error) {
            console.error("Failed to create snap:", error);
            // Check for rejection vs actual error
            if ((error as any).name === 'UserRejectedRequestError') {
                alert("Transaction rejected by user.");
            } else {
                alert("Failed to create Snap transaction. Ensure you have network connectivity.");
            }
        } finally {
            setIsCreating(false);
        }
    };

    const handleClose = () => {
        setShowConfirmation(false);
        navigate('/');
    };

    const isValid = amount && snappers && parseFloat(amount) > 0 && parseInt(snappers) > 0;
    const hasFunds = !!address; // Show form if wallet is connected

    // Loading Screen for Initial Balance Fetch
    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-axon-obsidian animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F5F5F7] font-sans text-axon-obsidian overflow-x-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-axon-neon/20 blur-[120px] rounded-full opacity-50" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full" />
                <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:24px_24px]" />
            </div>

            <AnimatePresence>
                {/* Confirmation Overlay */}
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
            </AnimatePresence>

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
                <div className="w-10" />
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

                    {!hasFunds ? (
                        // No Funds State
                        <div className="bg-white border border-gray-200 rounded-[32px] p-8 text-center shadow-lg">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Wallet className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-axon-obsidian mb-2">No Assets Found</h3>
                            <p className="text-sm text-gray-500 mb-6">You need tokens in your wallet to create a Snap.</p>
                            <button onClick={() => navigate('/')} className="px-6 py-3 bg-axon-obsidian text-white rounded-xl font-bold uppercase text-xs tracking-wider">
                                Top Up Wallet
                            </button>
                        </div>
                    ) : (
                        /* Main Form Box */
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
                                                        {availableTokens.map((token) => (
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
                                                                        <div className="flex items-center gap-2">
                                                                            <p className="text-[10px] text-axon-steel uppercase font-bold">{token.name}</p>
                                                                            <span className="text-[10px] font-mono text-axon-obsidian/70">
                                                                                {(token as any).balance || fallbackBalances[token.symbol] || '0.00'}
                                                                            </span>
                                                                        </div>
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
                                            Available: {(selectedToken as any).balance || fallbackBalances[selectedToken.symbol] || '0.00'} {selectedToken.symbol}
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

                                {/* Nodes Input */}
                                <div className="space-y-3">
                                    <label className="block text-[10px] font-bold text-axon-steel uppercase tracking-widest ml-1">
                                        Recipient Nodes
                                    </label>
                                    <div className="flex items-center gap-4">
                                        {['5', '10', '25', '50'].map((num) => (
                                            <button
                                                key={num}
                                                onClick={() => setSnappers(num)}
                                                className={clsx(
                                                    "flex-1 h-12 rounded-xl text-xs font-black transition-all border",
                                                    snappers === num
                                                        ? "bg-axon-obsidian text-white border-axon-obsidian shadow-lg"
                                                        : "bg-white text-axon-steel border-gray-200 hover:border-gray-300 hover:text-axon-obsidian"
                                                )}
                                            >
                                                {num}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Mode Selector */}
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
                                            <div className="flex gap-1 mb-1">
                                                {[1, 2, 3].map(i => <div key={i} className={clsx("w-1.5 h-3 rounded-full", mode === 'equal' ? "bg-axon-neon" : "bg-gray-300")} />)}
                                            </div>
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
                                            <div className="flex gap-1 items-end h-3 mb-1">
                                                <div className={clsx("w-1.5 h-1.5 rounded-full", mode === 'random' ? "bg-purple-600" : "bg-gray-300")} />
                                                <div className={clsx("w-1.5 h-3 rounded-full", mode === 'random' ? "bg-purple-600" : "bg-gray-300")} />
                                                <div className={clsx("w-1.5 h-1 rounded-full", mode === 'random' ? "bg-purple-600" : "bg-gray-300")} />
                                            </div>
                                            <span className={clsx("text-xs font-bold uppercase tracking-widest", mode === 'random' ? 'text-axon-obsidian' : 'text-axon-steel')}>Random</span>
                                            <span className={clsx("text-[8px] font-mono uppercase opacity-60", mode === 'random' ? 'text-axon-obsidian' : 'text-gray-400')}>Chaotic Surge</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Generate Button */}
                            <div className="mt-8 relative z-10">
                                <button
                                    onClick={handleGenerateSnap}
                                    disabled={!isValid || isCreating}
                                    className={clsx(
                                        "w-full h-16 rounded-[24px] font-black text-sm uppercase tracking-[0.2em] transition-all relative overflow-hidden group",
                                        isValid && !isCreating
                                            ? "bg-axon-obsidian text-white shadow-xl hover:shadow-2xl active:scale-[0.98]"
                                            : "bg-gray-100 text-gray-300 cursor-not-allowed border border-gray-200"
                                    )}
                                >
                                    {isCreating ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Processing...
                                        </span>
                                    ) : (
                                        <span className="relative z-10 flex items-center justify-center gap-3">
                                            <Zap className={clsx("w-4 h-4", isValid ? "text-axon-neon fill-current" : "text-gray-300")} />
                                            Initiate Surge
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
