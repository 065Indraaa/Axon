import { Camera, X, Flashlight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useRef, useCallback } from 'react';
import { Button } from '../components/ui/Button';
import Webcam from 'react-webcam';
import toast from 'react-hot-toast';
import jsQR from 'jsqr';
import { supabase } from '../lib/supabase';
import { useWalletBalances } from '../hooks/useWalletBalances';
import { PaymentModal } from '../components/PaymentModal';
import { AnimatePresence } from 'framer-motion';

// Simple EMVCo (QRIS) Parser
const parseQRIS = (data: string) => {
    try {
        const result: any = { raw: data };
        let i = 0;
        while (i < data.length) {
            const tag = data.substring(i, i + 2);
            const length = parseInt(data.substring(i + 2, i + 4));
            const value = data.substring(i + 4, i + 4 + length);

            if (tag === '59') result.name = value;
            if (tag === '54') result.amount = value;

            i += 4 + length;
        }
        return result;
    } catch (e) {
        return null;
    }
};

export default function ScanPage() {
    const navigate = useNavigate();
    const [scanning, setScanning] = useState(true);
    const webcamRef = useRef<Webcam>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const { balances } = useWalletBalances();
    const [activeMerchant, setActiveMerchant] = useState<any>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Video constraints for rear camera on mobile
    const videoConstraints = {
        facingMode: { exact: "environment" }
    };

    const handleDecode = async (imageSrc: string) => {
        setIsProcessing(true);
        const image = new Image();
        image.src = imageSrc;

        image.onload = async () => {
            const canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            ctx.drawImage(image, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);

            if (code) {
                const qrData = code.data;
                console.log("QR Scaled Data:", qrData);

                // Check for AXON format or regular address
                if (qrData.startsWith('AXON:')) {
                    const prefix = qrData;
                    const { data: merchant, error } = await supabase
                        .from('merchants')
                        .select('*')
                        .eq('qr_prefix', prefix)
                        .single();

                    if (merchant && !error) {
                        toast.success(`Merchant Verified: ${merchant.name}`);
                        setActiveMerchant(merchant);
                    } else {
                        toast.error("Unrecognized AXON QR Code");
                        setScanning(true);
                    }
                } else if (qrData.startsWith('0x') && qrData.length === 42) {
                    // Raw address payment
                    setActiveMerchant({
                        name: "Direct Transfer",
                        wallet_address: qrData
                    });
                } else if (qrData.startsWith('000201')) {
                    // QRIS Pattern Detected
                    const qris = parseQRIS(qrData);
                    if (qris) {
                        toast.success(`QRIS Detected: ${qris.name || 'Merchant'}`);
                        setActiveMerchant({
                            name: qris.name || "QRIS Merchant",
                            wallet_address: 'QRIS', // Marker for special handling
                            qris_payload: qrData,
                            suggested_amount: qris.amount
                        });
                    } else {
                        toast.error("Malformed QRIS Data");
                        setScanning(true);
                    }
                } else {
                    toast.error("Invalid QR Format");
                    setScanning(true);
                }
            } else {
                toast.error("No QR code detected. Try again.");
                setScanning(true);
            }
            setIsProcessing(false);
        };
    };

    const handleCapture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            setCapturedImage(imageSrc);
            setScanning(false);
            toast.loading("Analyzing Hologram...", { duration: 1000 });
            handleDecode(imageSrc);
        }
    }, [webcamRef]);

    return (
        <div className="fixed inset-0 bg-black z-[60] text-white font-sans">
            {/* Header Controls */}
            <div className="absolute top-4 left-0 right-0 px-6 py-4 flex justify-between items-center z-20">
                <button
                    onClick={() => navigate('/')}
                    className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>
                <div className="text-[10px] font-bold font-mono uppercase bg-axon-neon text-black px-3 py-1 rounded-sm shadow-[0_0_15px_rgba(0,240,255,0.4)]">
                    SMART VERIFY ACTIVE
                </div>
                <button className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors">
                    <Flashlight className="w-5 h-5" />
                </button>
            </div>

            {/* Camera Viewport */}
            <div className="relative w-full h-full bg-gray-900 overflow-hidden flex items-center justify-center">
                {/* Real Webcam Feedback */}
                {scanning && (
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        videoConstraints={videoConstraints}
                        onUserMediaError={() => {
                            // Automatically fallback to user camera if environment fails
                            console.log("Rear camera not found, using default");
                        }}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                )}

                {/* Captured Image Preview (Freezes the frame) */}
                {!scanning && capturedImage && (
                    <img src={capturedImage} alt="Captured" className="absolute inset-0 w-full h-full object-cover" />
                )}

                {/* Animated Laser Line (Scanner Effect) */}
                {scanning && (
                    <div className="absolute top-0 left-0 w-full h-full z-10 animate-scan pointer-events-none opacity-80">
                        <div className="h-[2px] bg-axon-neon w-full absolute top-[50%] shadow-[0_0_30px_rgba(0,240,255,0.8)]" />
                    </div>
                )}

                {/* Camera Overlay Corners - AXON NEON */}
                <div className="absolute inset-0 px-12 py-32 pointer-events-none z-10 flex flex-col justify-between">
                    <div className="flex justify-between">
                        <div className="w-12 h-12 border-t-[3px] border-l-[3px] border-axon-neon rounded-tl-sm opacity-100 shadow-[0_0_10px_rgba(0,240,255,0.4)]" />
                        <div className="w-12 h-12 border-t-[3px] border-r-[3px] border-axon-neon rounded-tr-sm opacity-100 shadow-[0_0_10px_rgba(0,240,255,0.4)]" />
                    </div>
                    <div className="flex items-center justify-center">
                        {/* Center Focus Reticle */}
                        <div className="w-20 h-20 border border-white/20 rounded-full flex items-center justify-center">
                            <div className="w-1 h-1 bg-axon-neon rounded-full animate-ping" />
                        </div>
                    </div>
                    <div className="flex justify-between">
                        <div className="w-12 h-12 border-b-[3px] border-l-[3px] border-axon-neon rounded-bl-sm opacity-100 shadow-[0_0_10px_rgba(0,240,255,0.4)]" />
                        <div className="w-12 h-12 border-b-[3px] border-r-[3px] border-axon-neon rounded-br-sm opacity-100 shadow-[0_0_10px_rgba(0,240,255,0.4)]" />
                    </div>
                </div>

                {/* Grid Overlay for "High Tech" feel */}
                <div className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}
                />
            </div>

            {/* Bottom Actions */}
            <div className="absolute bottom-10 left-0 right-0 px-6 z-20 flex flex-col items-center space-y-8">
                <div className="text-center space-y-2">
                    <p className="font-mono text-xs text-axon-neon tracking-[0.2em] uppercase animate-pulse drop-shadow-[0_0_5px_rgba(0,240,255,0.8)]">
                        {scanning ? "Searching for Merchant QR..." : "Processing Data..."}
                    </p>
                    <p className="text-xs text-white/60 max-w-[200px] mx-auto leading-relaxed">
                        Align the code within the holographic frame.
                    </p>
                </div>

                <div className="w-full max-w-sm flex flex-col gap-3">
                    {scanning ? (
                        <div className="flex items-center justify-center gap-8">
                            {/* Gallery Upload Button (Left of Shutter) */}
                            <label className="cursor-pointer w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors group">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            const file = e.target.files[0];
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                const res = reader.result as string;
                                                setCapturedImage(res);
                                                setScanning(false);
                                                toast.loading("Analyzing Hologram...", { duration: 1000 });
                                                handleDecode(res);
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                                <div className="relative">
                                    <Camera className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
                                    <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-axon-neon rounded-full border border-black" />
                                </div>
                            </label>

                            {/* Main Shutter Button */}
                            <button
                                onClick={handleCapture}
                                disabled={isProcessing}
                                className="bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold h-20 w-20 rounded-full flex items-center justify-center hover:bg-white/20 hover:scale-105 active:scale-95 transition-all ring-4 ring-transparent hover:ring-axon-neon/30"
                            >
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                                    {isProcessing && <Loader2 className="w-8 h-8 text-axon-obsidian animate-spin" />}
                                </div>
                            </button>

                            {/* Flashlight Button (Right of Shutter) */}
                            <button className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors">
                                <Flashlight className="w-5 h-5 text-white/70" />
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <Button
                                fullWidth
                                onClick={() => {
                                    setScanning(true);
                                    setCapturedImage(null);
                                    setActiveMerchant(null);
                                }}
                                className="!h-16 !bg-axon-neon !text-black !font-black !tracking-widest shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_30px_rgba(0,240,255,0.6)]"
                            >
                                SCAN AGAIN
                            </Button>
                            <Button
                                variant="outline"
                                fullWidth
                                onClick={() => navigate('/')}
                                className="!h-12 !border-white/10 !text-white !font-bold"
                            >
                                ABORT MISSION
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Payment Modal */}
            <AnimatePresence>
                {activeMerchant && (
                    <PaymentModal
                        merchant={activeMerchant}
                        balances={balances}
                        onClose={() => {
                            setActiveMerchant(null);
                            setScanning(true);
                        }}
                        onSuccess={(hash, amt) => {
                            console.log("Payment Successful:", hash, amt);
                            // Keep merchant state to show success in modal
                            // Modal will handle its own success state then close
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

