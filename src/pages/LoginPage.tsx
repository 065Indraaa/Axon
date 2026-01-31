import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { BaseAccountSignIn } from '../components/auth/BaseAccountSignIn';

export default function LoginPage() {
    const navigate = useNavigate();
    const { isConnected } = useAccount();

    // Automatically navigate if connected
    useEffect(() => {
        if (isConnected) {
            navigate('/');
        }
    }, [isConnected, navigate]);

    const handleSignInSuccess = () => {
        navigate('/');
    };

    const handleSignInError = (error: string) => {
        console.error('Base Account sign-in error:', error);
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
                            Sign in with Base
                        </h1>
                        <p className="text-axon-steel font-medium">
                            Your Base Account holds your smart wallet. Access it with a passkey.
                        </p>
                    </div>

                    <BaseAccountSignIn 
                        onSuccess={handleSignInSuccess}
                        onError={handleSignInError}
                    />

                    <div className="space-y-4">


                        {/* Tombol sign-in sudah dihandle oleh BaseAccountSignIn */}

                        <div className="grid grid-cols-1 gap-3">
                            <div className="bg-purple-50/50 p-3 rounded-xl flex items-start gap-3 border border-purple-100">
                                <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-purple-900 uppercase tracking-wider">Passkey Authentication</p>
                                    <p className="text-[10px] text-purple-700 leading-relaxed">
                                        Use your device's biometric (Face ID, Touch ID, or Windows Hello) for secure access.
                                    </p>
                                </div>
                            </div>

                            <div className="bg-blue-50/50 p-3 rounded-xl flex items-start gap-3 border border-blue-100">
                                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-blue-900 uppercase tracking-wider">Base Smart Wallet</p>
                                    <p className="text-[10px] text-blue-700 leading-relaxed">
                                        Your Base Account holds a smart wallet on Base blockchain with no gas fees for users.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </main>

            <footer className="py-8 text-center">
                <p className="text-[9px] text-axon-steel font-mono uppercase tracking-[0.3em]">
                    Passkey Secured • Base Account • Smart Wallet Technology
                </p>
            </footer>
        </div>
    );
}
