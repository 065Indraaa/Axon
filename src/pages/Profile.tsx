import { User, Shield, Variable, LogOut, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useState, useEffect, useMemo } from 'react';
// import { PersonalInfoModal } from '../components/PersonalInfoModal';
import { useCoinbaseVerification } from '../hooks/useCoinbaseVerification';
import { useAccount, useDisconnect } from 'wagmi';
import { useWalletBalances } from '../hooks/useWalletBalances';
import { useUserProfile } from '../hooks/useUserProfile';
import { TOKENS } from '../config/tokens';
import clsx from 'clsx';
import { Avatar, Name, Identity, Address } from '@coinbase/onchainkit/identity';

export default function Profile() {
    const navigate = useNavigate();
    const { address, isConnected } = useAccount();
    const { disconnect } = useDisconnect();
    const { balances } = useWalletBalances();
    const { profile, saveProfile } = useUserProfile();
    const [isPersonalModalOpen, setIsPersonalModalOpen] = useState(false);
    const { verificationData } = useCoinbaseVerification();

    // Redirect ke login jika belum login
    useEffect(() => {
        if (!isConnected) {
            navigate('/login');
        }
    }, [isConnected, navigate]);

    // Sync verification data to profile if connected and data changed
    useEffect(() => {
        const isDefaultProfile = profile.name === "New AXON User" || !profile.name;
        const hasVerifiedMetadata = verificationData.name || verificationData.email;

        const needsSync = isConnected && (
            (hasVerifiedMetadata && isDefaultProfile) ||
            verificationData.verificationLevel > profile.level ||
            (verificationData.name && verificationData.name !== profile.name) ||
            (verificationData.email && verificationData.email !== profile.email)
        );

        if (needsSync) {
            console.log("Syncing verified metadata to profile...");
            saveProfile({
                ...profile,
                level: Math.max(profile.level, verificationData.verificationLevel),
                name: verificationData.name || profile.name,
                email: verificationData.email || profile.email,
            }).catch(console.error);
        }
    }, [isConnected, verificationData, profile, saveProfile]);


    const getLevelBadge = () => {
        const currentLevel = Math.max(profile.level, verificationData.verificationLevel);
        if (currentLevel >= 3) return { bg: 'bg-axon-neon text-black', text: 'C1 PREMIUM', icon: <Shield className="w-3 h-3" /> };
        if (currentLevel >= 2) return { bg: 'bg-axon-neon text-black', text: 'L2 VERIFIED', icon: <Shield className="w-3 h-3" /> };
        return { bg: 'bg-axon-obsidian text-white', text: `L${currentLevel} CONNECTED`, icon: null };
    };

    const badge = getLevelBadge();

    // UI Fallbacks for immediate data
    const displayName = profile.name === "New AXON User" ? (verificationData.name || profile.name) : profile.name;
    const displayEmail = !profile.email ? (verificationData.email || "") : profile.email;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30 pb-24 font-sans text-axon-obsidian">
            {/* Modal */}
            {/* PersonalInfoModal removed as requested */}

            {/* HEADER: COMPACT STANDARD */}
            <div className="px-6 pt-8 pb-4 sticky top-0 z-30">
                {/* Enhanced Background: Glass + Gradient + Pattern */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/85 to-purple-50/90 backdrop-blur-xl border-b border-gray-200/50" />
                <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_1px,transparent_1px)] [background-size:20px_20px] bg-gradient-to-br from-purple-400/10 to-transparent" />

                <div className="relative z-10 flex justify-between items-start">
                    <h1 className="text-lg font-black tracking-tight text-axon-obsidian font-mono uppercase">
                        Account
                    </h1>
                    <div className="flex items-center gap-2">
                        <div className={`px-2 py-0.5 rounded-sm flex items-center gap-1 ${badge.bg}`}>
                            {badge.icon}
                            <span className="text-[9px] font-mono font-bold">{badge.text}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 py-6 relative z-10">

                {/* Enhanced Profile Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative mb-8 rounded-3xl p-1 overflow-hidden group"
                >
                    {/* Dynamic Enhanced Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/30 to-purple-600/30 opacity-60" />
                    <div className="absolute -right-12 -top-12 w-48 h-48 bg-axon-neon/30 blur-[80px] rounded-full animate-pulse" />
                    <div className="absolute left-8 bottom-8 w-32 h-32 bg-purple-500/20 blur-[60px] rounded-full" />
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_1px,transparent_1px)] [background-size:24px_24px] bg-gradient-to-br from-white/10 to-transparent" />

                    <div className="relative z-10 bg-white/10 backdrop-blur-md p-6 rounded-[24px] border border-white/20 flex flex-col gap-6">
                        <div className="flex items-center space-x-6">
                            <div className="group relative">
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                >
                                    <Avatar address={address} className="w-20 h-20 rounded-full border-3 border-axon-neon/40 ring-4 ring-white/10 shadow-2xl" />
                                    <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-400 border-2 border-white rounded-full shadow-lg animate-pulse" />
                                </motion.div>
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-white uppercase tracking-wide flex items-center gap-3">
                                    <Name address={address} className="text-white" />
                                    {Math.max(profile.level, verificationData.verificationLevel) >= 2 && <Shield className="w-4 h-4 text-axon-neon fill-axon-neon/20" />}
                                </h2>
                                <p className="text-sm text-gray-400 font-mono mb-2">{displayEmail || 'Base Account Verified'}</p>
                                <div className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-sm border border-white/10 ${profile.level >= 2 ? 'bg-axon-neon/10' : 'bg-white/10'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${profile.level >= 2 ? 'bg-axon-neon' : 'bg-gray-400'}`} />
                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${profile.level >= 2 ? 'text-axon-neon' : 'text-gray-300'}`}>
                                        {profile.level === 3 ? 'COINBASE ONE' : profile.level === 2 ? 'BASE ACCOUNT' : `LEVEL ${profile.level}`}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Wallet Integration Info */}
                        <div className="mt-0 pt-4 border-t border-white/10">
                            <Identity address={address} className="!bg-transparent !p-0">
                                <Address className="text-[10px] font-mono text-white/60 hover:text-white uppercase tracking-widest" />
                            </Identity>
                        </div>
                    </div>
                </div>

                {/* Wallet Assets Section */}
                <div className="space-y-4 mb-8">
                    <h3 className="font-bold text-xs text-axon-steel uppercase tracking-widest border-b border-gray-200 pb-2">
                        Wallet Assets
                    </h3>
                    <Card className="!p-0 overflow-hidden border border-gray-200 shadow-sm">
                        <div className="divide-y divide-gray-100">
                            {TOKENS.map((token) => (
                                <div key={token.symbol} className="flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center space-x-3">
                                        <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold", token.color)}>
                                            {token.icon}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-axon-obsidian">{token.symbol}</p>
                                            <p className="text-[10px] text-axon-steel uppercase font-bold tracking-tight">{token.name}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-sm font-mono text-axon-obsidian">
                                            {balances[token.symbol] || '0.00'}
                                        </p>
                                        <p className="text-[10px] text-axon-steel font-mono uppercase tracking-tighter">On Base Network</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Menu Settings */}
                <div className="space-y-4">
                    <h3 className="font-bold text-xs text-axon-steel uppercase tracking-widest border-b border-gray-200 pb-2">
                        Settings
                    </h3>
                    <Card className="!p-0 overflow-hidden border border-gray-200">
                        <div className="divide-y divide-gray-100">
                            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                        <Shield className="w-4 h-4" />
                                    </div>
                                    <span className="font-bold text-sm text-axon-obsidian uppercase">Security & Passkeys</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600" />
                            </button>
                            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 rounded-md bg-green-50 text-green-600 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors">
                                        <Variable className="w-4 h-4" />
                                    </div>
                                    <span className="font-bold text-sm text-axon-obsidian uppercase">FAQ</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-green-600" />
                            </button>
                        </div>
                    </Card>
                </div>

                <Button
                    variant="secondary"
                    fullWidth
                    className="mt-8 !text-red-600 !border-red-100 hover:!bg-red-50 hover:!border-red-200"
                    onClick={() => {
                        disconnect();
                        window.location.reload();
                    }}
                >
                    <LogOut className="w-4 h-4 mr-2 inline" />
                    Sign Out
                </Button>
            </div>
        </div>
    );
}
