import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Loader2, ShieldCheck, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useConnect, useAccount } from 'wagmi';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const navigate = useNavigate();
    const { isConnected } = useAccount();
    const { connect, connectors, isPending } = useConnect();
    const [email, setEmail] = useState('');
    const [step, setStep] = useState<'input' | 'otp'>('input');

    // Automatically navigate if connected
    useEffect(() => {
        if (isConnected) {
            navigate('/');
        }
    }, [isConnected, navigate]);

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !email.includes('@')) {
            toast.error("Please enter a valid email address");
            return;
        }

        const coinbaseConnector = connectors.find(c => c.id === 'coinbaseWalletSDK');

        if (!coinbaseConnector) {
            toast.error("Coinbase Wallet configuration not found");
            return;
        }

        try {
            // Trigger connection with email preference
            // Note: Wagmi's connect doesn't directly take email, but the Coinbase SDK 
            // modal will handle the email entry if configured for Smart Wallets.
            // To force it, we rely on the OnchainKit/Coinbase SDK behavior.
            connect({ connector: coinbaseConnector });

            // We set step to 'otp' visually, although the actual OTP is handled by the Coinbase Modal
            setStep('otp');
        } catch (err: any) {
            console.error("Login failed:", err);
            toast.error("Login failed. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F5F7] flex flex-col font-sans text-axon-obsidian p-6">
            {/* Nav Header */}
            <div className="flex justify-between items-center mb-12 pt-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-axon-obsidian rounded-swiss flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4 text-axon-neon" />
                    </div>
                    <span className="font-extrabold tracking-tight text-lg uppercase">AXON SECURE</span>
                </div>
                <button
                    onClick={() => navigate(-1)}
                    className="text-xs font-bold text-axon-steel uppercase tracking-widest"
                >
                    Back
                </button>
            </div>

            <main className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                >
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black tracking-tight leading-none uppercase">
                            {step === 'input' ? "Login with Gmail" : "Verify Identity"}
                        </h1>
                        <p className="text-axon-steel font-medium">
                            {step === 'input'
                                ? "Enter your email to access your secure AXON Nexus wallet."
                                : "A verification code has been sent to your inbox."}
                        </p>
                    </div>

                    <form onSubmit={handleEmailSubmit} className="space-y-4">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-axon-steel group-focus-within:text-axon-neon transition-colors">
                                <Mail className="w-5 h-5" />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value.toLowerCase())}
                                placeholder="name@gmail.com"
                                disabled={isPending || step === 'otp'}
                                className="w-full h-16 bg-white border-2 border-gray-200 rounded-swiss pl-12 pr-4 font-bold text-axon-obsidian focus:border-axon-obsidian outline-none transition-all placeholder:text-gray-300 disabled:opacity-50"
                            />
                        </div>

                        <Button
                            type="submit"
                            fullWidth
                            disabled={isPending}
                            className="!h-16 !bg-axon-obsidian !text-white !font-black !text-sm group"
                        >
                            {isPending ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span className="uppercase tracking-[0.2em]">Continue</span>
                                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="bg-blue-50/50 p-4 rounded-xl flex items-start gap-3 border border-blue-100">
                        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-blue-900 uppercase tracking-wider">Programmable Wallet</p>
                            <p className="text-[10px] text-blue-700 leading-relaxed">
                                AXON uses Coinbase CDP technology to create a non-custodial wallet
                                protected by your Google authentication.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </main>

            <footer className="py-8 text-center">
                <p className="text-[9px] text-axon-steel font-mono uppercase tracking-[0.3em]">
                    End-to-End Encrypted • Powered by Base
                </p>
            </footer>
        </div>
    );
}
