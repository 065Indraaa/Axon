import { QrCode, Camera, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';
import { Button } from '../components/ui/Button';
import Webcam from 'react-webcam';
import toast from 'react-hot-toast';

export default function ScanPage() {
    const navigate = useNavigate();
    const [scanning, setScanning] = useState(true);
    const webcamRef = useRef<Webcam>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);

    // Video constraints for rear camera on mobile
    const videoConstraints = {
        facingMode: { exact: "environment" }
    };

    // Fallback if environment is not found (e.g. desktop)
    const fallbackConstraints = {
        facingMode: "user"
    };

    const handleCapture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            setCapturedImage(imageSrc);
            setScanning(false);
            // Simulate processing
            toast.loading("Processing QR Code...", { duration: 1500 });
            setTimeout(() => {
                toast.success("Merchant Verified: KOPI KENANGAN");
                toast("Redirecting to payment...", { icon: '💸' });
                // In a real app, navigate to payment screen
                setTimeout(() => setScanning(true), 3000); // Reset for demo
            }, 1500);
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
                                                setCapturedImage(reader.result as string);
                                                setScanning(false);
                                                // Trigger logic (simulated)
                                                toast.loading("Analyzing Image...", { duration: 1500 });
                                                setTimeout(() => {
                                                    toast.success("Merchant Verified: KOPI KENANGAN");
                                                    toast("Redirecting to payment...", { icon: '💸' });
                                                    setTimeout(() => setScanning(true), 3000);
                                                }, 1500);
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
                                className="bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold h-20 w-20 rounded-full flex items-center justify-center hover:bg-white/20 hover:scale-105 active:scale-95 transition-all ring-4 ring-transparent hover:ring-axon-neon/30"
                            >
                                <div className="w-16 h-16 bg-white rounded-full" />
                            </button>

                            {/* Flashlight Button (Right of Shutter) - Moved from top specific logic later */}
                            <button className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors">
                                <Flashlight className="w-5 h-5 text-white/70" />
                            </button>
                        </div>
                    ) : (
                        <Button
                            fullWidth
                            onClick={() => {
                                setScanning(true);
                                setCapturedImage(null);
                            }}
                            className="!bg-axon-neon !text-black !font-black !tracking-widest shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_30px_rgba(0,240,255,0.6)]"
                        >
                            SCAN AGAIN
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
