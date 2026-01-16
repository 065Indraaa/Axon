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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="bg-white rounded-swiss p-8 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-black text-axon-obsidian mb-2">
                        Snap Created
                    </h2>
                    <p className="text-sm text-axon-steel font-mono">
                        {snappers} {snappers === 1 ? 'person' : 'people'} · {amount.toFixed(2)} {token.symbol} · {mode === 'equal' ? 'Equal' : 'Random'}
                    </p>
                </div>

                {/* QR Code with Pulse Animation */}
                <div className="relative flex items-center justify-center mb-8">
                    {/* Pulsing circles */}
                    <motion.div
                        className="absolute w-64 h-64 rounded-full border-2 border-axon-neon/30"
                        animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.3, 0.6, 0.3],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                    <motion.div
                        className="absolute w-64 h-64 rounded-full border-2 border-axon-neon/20"
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.2, 0.4, 0.2],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 0.5
                        }}
                    />

                    {/* QR Code */}
                    <div className="relative bg-white p-4 rounded-2xl shadow-lg">
                        <QRCodeSVG
                            value={snapUrl}
                            size={200}
                            level="H"
                            includeMargin={true}
                            imageSettings={{
                                src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2300F0FF'%3E%3Cpath d='M13 2L3 14h8l-2 8 10-12h-8l2-8z'/%3E%3C/svg%3E",
                                height: 40,
                                width: 40,
                                excavate: true,
                            }}
                        />
                    </div>
                </div>

                {/* Link Section */}
                <div className="mb-6">
                    <label className="block text-xs font-bold text-axon-steel uppercase tracking-wider mb-2">
                        Share Link
                    </label>
                    <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 px-4 py-3 rounded-lg font-mono text-sm text-axon-obsidian">
                            {shortUrl}
                        </div>
                        <button
                            onClick={handleCopy}
                            className="w-12 h-12 bg-axon-neon hover:bg-axon-neon/90 rounded-lg flex items-center justify-center transition-colors"
                        >
                            {copied ? (
                                <Check className="w-5 h-5 text-axon-obsidian" />
                            ) : (
                                <Copy className="w-5 h-5 text-axon-obsidian" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Share Buttons */}
                <div className="space-y-3">
                    <button
                        onClick={handleShareWhatsApp}
                        className="w-full h-12 bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold text-sm uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <Share2 className="w-4 h-4" />
                        Share via WhatsApp
                    </button>
                    <button
                        onClick={handleShareTelegram}
                        className="w-full h-12 bg-[#0088CC] hover:bg-[#0077B5] text-white font-bold text-sm uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <Share2 className="w-4 h-4" />
                        Share via Telegram
                    </button>
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="w-full mt-6 h-12 border-2 border-gray-200 hover:border-gray-300 text-axon-obsidian font-bold text-sm uppercase tracking-wider rounded-lg transition-colors"
                >
                    Done
                </button>
            </motion.div>
        </motion.div>
    );
}
