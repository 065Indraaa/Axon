import { motion } from 'framer-motion';
import { Scan, Globe, ShieldCheck, Zap, ArrowRight, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-[#F5F5F7] flex flex-col relative overflow-hidden font-sans text-axon-obsidian">
            {/* Background Map Effect (Abstract) */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />
            </div>

            {/* Nav */}
            <nav className="relative z-10 px-6 pt-8 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-axon-obsidian rounded-swiss flex items-center justify-center">
                        <Scan className="w-4 h-4 text-axon-neon" />
                    </div>
                    <span className="font-extrabold tracking-tight text-xl">AXON</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-mono font-bold text-axon-steel uppercase tracking-widest">
                        ASEAN NETWORK LIVE
                    </span>
                </div>
            </nav>

            {/* Hero Content */}
            <main className="flex-1 flex flex-col justify-center px-6 relative z-10 pb-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="mb-6 inline-flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-sm">
                        <span className="text-sm">🌏</span>
                        <span className="text-[10px] font-bold font-mono tracking-widest uppercase text-axon-steel">
                            CROSS-BORDER PAYMENTS
                        </span>
                    </div>

                    <h1 className="text-5xl font-extrabold leading-[0.95] tracking-tighter mb-6 text-axon-obsidian">
                        ONE QR. <br />
                        <span className="text-primary">ALL OF ASEAN.</span>
                    </h1>

                    <p className="text-axon-steel font-medium text-lg leading-relaxed max-w-sm mb-8">
                        Pay effortlessly across Indonesia, Singapore, Malaysia, and Thailand using
                        <span className="text-axon-obsidian font-bold"> Fiat Stablecoins</span>.
                        Zero fx fees, instant settlement.
                    </p>

                    {/* Feature Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-10">
                        <div className="bg-white p-4 rounded-swiss border border-gray-200">
                            <Zap className="w-5 h-5 text-axon-neon fill-black mb-2" />
                            <h3 className="font-bold text-sm">Instant</h3>
                            <p className="text-xs text-axon-steel">Settlement via Base L2</p>
                        </div>
                        <div className="bg-white p-4 rounded-swiss border border-gray-200">
                            <Scan className="w-5 h-5 text-primary mb-2" />
                            <h3 className="font-bold text-sm">ASEAN Universal</h3>
                            <p className="text-xs text-axon-steel">Scan QRIS, DuitNow, & more</p>
                        </div>
                    </div>

                    {/* Login Button - Navigates to dedicated Gmail Login Page */}
                    <div className="flex flex-col gap-4">
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full h-16 bg-axon-obsidian text-white rounded-swiss font-extrabold flex items-center justify-center gap-3 shadow-xl hover:bg-black transition-all active:scale-[0.98]"
                        >
                            <LogIn className="w-5 h-5 text-axon-neon" />
                            <span className="uppercase tracking-widest text-sm">Login with Gmail</span>
                        </button>

                        <div className="flex items-center justify-center gap-4 opacity-60 grayscale">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/QRIS_logo.svg/1200px-QRIS_logo.svg.png" className="h-4 object-contain" alt="QRIS" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/4/4e/DuitNow_logo.png" className="h-4 object-contain" alt="DuitNow" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/PayNow_logo.svg/1200px-PayNow_logo.svg.png" className="h-4 object-contain" alt="PayNow" />
                        </div>
                    </div>
                </motion.div>
            </main>

            {/* Footer Features */}
            <div className="bg-white border-t border-gray-200 p-6 flex justify-between items-center relative z-10">
                <div className="flex items-center gap-2 text-xs font-bold text-axon-obsidian">
                    <Globe className="w-4 h-4 text-axon-steel" />
                    Border-less
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-axon-obsidian">
                    <ShieldCheck className="w-4 h-4 text-axon-steel" />
                    Stablecoin
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-axon-obsidian">
                    <ArrowRight className="w-4 h-4 text-axon-steel" />
                    Gasless
                </div>
            </div>
        </div>
    );
}
