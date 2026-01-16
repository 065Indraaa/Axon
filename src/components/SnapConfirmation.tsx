import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Share2, Check } from 'lucide-react';
import { useState } from 'react';
import { TokenData } from '../config/tokens';

interface SnapConfirmationProps {
    snapId: string;
    amount: number;
    snappers: number;
    mode: 'equal' | 'random';
    token: TokenData;
    onClose?: () => void;
}

export function SnapConfirmation({ snapId, amount, snappers, mode, token, onClose }: SnapConfirmationProps) {
    const [copied, setCopied] = useState(false);
    const snapUrl = `${window.location.origin}/snap/${snapId}`;
    const shortUrl = `axon.to/snap/${snapId}`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(snapUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleShareWhatsApp = () => {
        const message = `🎁 You've received an AXON Snap! Tap to claim your surprise: ${snapUrl}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    };

    const handleShareTelegram = () => {
        const message = `🎁 You've received an AXON Snap! Tap to claim your surprise: ${snapUrl}`;
        window.open(`https://t.me/share/url?url=${encodeURIComponent(snapUrl)}&text=${encodeURIComponent(message)}`, '_blank');
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-xl"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="bg-[#111111] border border-white/10 rounded-[32px] p-8 max-w-md w-full shadow-[0_0_100px_rgba(0,0,0,0.5)] relative overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-axon-neon/5 blur-[80px] rounded-full pointer-events-none" />

                {/* Header */}
                <div className="text-center mb-8 relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-axon-neon/10 border border-axon-neon/20 mb-4">
                        <Check className="w-3 h-3 text-axon-neon" />
                        <span className="text-[10px] font-bold text-axon-neon uppercase tracking-widest">Snap Sequence Active</span>
                    </div>
                    <h2 className="text-3xl font-black text-white italic uppercase tracking-tight">
                        Surge <span className="text-axon-neon">Ready</span>
                    </h2>
                    <p className="text-[10px] text-gray-500 font-mono uppercase tracking-[0.2em] mt-1">
                        {snappers} Nodes · {amount} {token.symbol} · {mode.toUpperCase()} Distribution
                    </p>
                </div>

                {/* QR Code Container */}
                <div className="relative flex items-center justify-center mb-10 relative z-10">
                    {/* Animated Portal Rings */}
                    <motion.div
                        className="absolute w-60 h-60 rounded-full border border-axon-neon/30 shadow-[0_0_30px_rgba(204,255,0,0.1)]"
                        animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.div
                        className="absolute w-64 h-64 rounded-full border border-axon-neon/10"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    />

                    {/* QR Code Holder */}
                    <div className="relative bg-white p-4 rounded-[24px] shadow-2xl">
                        <QRCodeSVG
                            value={snapUrl}
                            size={180}
                            level="H"
                            includeMargin={false}
                            imageSettings={{
                                src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%230A0A0A'%3E%3Cpath d='M13 2L3 14h8l-2 8 10-12h-8l2-8z'/%3E%3C/svg%3E",
                                height: 36,
                                width: 36,
                                excavate: true,
                            }}
                        />
                    </div>
                </div>

                {/* Link Control */}
                <div className="space-y-3 mb-8 relative z-10">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                        Surge Link
                    </label>
                    <div className="flex items-center gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl">
                        <div className="flex-1 px-4 py-3 font-mono text-xs text-axon-neon/80 truncate">
                            {shortUrl}
                        </div>
                        <button
                            onClick={handleCopy}
                            className="w-11 h-11 bg-axon-neon hover:bg-axon-neon/90 text-axon-obsidian rounded-xl flex items-center justify-center transition-all active:scale-90 shadow-lg shadow-axon-neon/20"
                        >
                            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Social Grid */}
                <div className="grid grid-cols-2 gap-3 relative z-10">
                    <button
                        onClick={handleShareWhatsApp}
                        className="h-14 bg-[#25D366]/10 border border-[#25D366]/20 hover:bg-[#25D366]/20 text-[#25D366] font-bold text-[10px] uppercase tracking-widest rounded-2xl transition-all flex flex-col items-center justify-center gap-1"
                    >
                        <Share2 className="w-4 h-4" />
                        WhatsApp
                    </button>
                    <button
                        onClick={handleShareTelegram}
                        className="h-14 bg-[#0088CC]/10 border border-[#0088CC]/20 hover:bg-[#0088CC]/20 text-[#0088CC] font-bold text-[10px] uppercase tracking-widest rounded-2xl transition-all flex flex-col items-center justify-center gap-1"
                    >
                        <Share2 className="w-4 h-4" />
                        Telegram
                    </button>
                </div>

                {/* Completion Control */}
                <button
                    onClick={onClose}
                    className="w-full mt-8 h-14 bg-white/5 border border-white/10 hover:border-white/20 text-white font-black text-xs uppercase tracking-[0.3em] rounded-2xl transition-all"
                >
                    Return to Nexus
                </button>
            </motion.div>
        </motion.div>
    );
}
