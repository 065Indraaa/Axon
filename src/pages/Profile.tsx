import { User, Shield, Variable, LogOut, ChevronRight, Copy, Check, ExternalLink } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useState, useEffect, useMemo } from 'react';
import { PersonalInfoModal } from '../components/PersonalInfoModal';
import { useCoinbaseVerification } from '../hooks/useCoinbaseVerification';
import { useAccount, useDisconnect } from 'wagmi';
import { useWalletBalances } from '../hooks/useWalletBalances';
import { useUserProfile } from '../hooks/useUserProfile';
import { TOKENS } from '../config/tokens';
import clsx from 'clsx';

export default function Profile() {
    const { address, isConnected } = useAccount();
    const { disconnect } = useDisconnect();
    const { balances } = useWalletBalances();
    const { profile, saveProfile } = useUserProfile();
    const [isPersonalModalOpen, setIsPersonalModalOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const { verificationData } = useCoinbaseVerification();

    // Sync verification data to profile if connected and data changed
    useEffect(() => {
        if (isConnected && (verificationData.verificationLevel > profile.level || verificationData.name !== profile.name)) {
            // Auto-update profile in database if it increased or metadata changed
            saveProfile({
                ...profile,
                level: verificationData.verificationLevel,
                name: verificationData.name || profile.name,
                email: verificationData.email || profile.email,
                // Note: address/city/postalCode are usually not in the OAuth user object 
                // but can be manually entered once Level 2 is reached
            }).catch(console.error);
        }
    }, [isConnected, verificationData, profile, saveProfile]);

    const truncatedAddress = useMemo(() => {
        if (!address) return '';
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    }, [address]);

    const handleCopyAddress = () => {
        if (address) {
            navigator.clipboard.writeText(address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const getLevelBadge = () => {
        if (profile.level >= 3) return { bg: 'bg-axon-neon text-black', text: 'C1 PREMIUM', icon: <Shield className="w-3 h-3" /> };
        if (profile.level >= 2) return { bg: 'bg-axon-neon text-black', text: 'L2 VERIFIED', icon: <Shield className="w-3 h-3" /> };
        return { bg: 'bg-axon-obsidian text-white', text: `L${profile.level} CONNECTED`, icon: null };
    };

    const badge = getLevelBadge();

    return (
        <div className="min-h-screen bg-[#FBFBFB] pb-24 font-sans text-axon-obsidian">
            {/* Modal */}
            <PersonalInfoModal
                isOpen={isPersonalModalOpen}
                onClose={() => setIsPersonalModalOpen(false)}
                data={{
                    ...profile,
                    isAccountVerified: verificationData.isAccountVerified,
                    isCountryVerified: verificationData.isCountryVerified,
                    isCoinbaseOne: verificationData.isCoinbaseOne
                }}
                onSave={(newData) => saveProfile(newData)}
            />

            {/* HEADER: COMPACT STANDARD */}
            <div className="relative px-6 pt-8 pb-4 sticky top-0 z-30">
                {/* Background: Glass + Dot Matrix Pattern */}
                <div className="absolute inset-0 bg-white/85 backdrop-blur-xl border-b border-gray-200" />
                <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />

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

            <div className="px-6 py-6 relative z-10 px-6">

                {/* Profile Card (Obsidian Style) */}
                <div className="relative mb-8 rounded-swiss p-1 overflow-hidden group">
                    {/* Dynamic Background */}
                    <div className="absolute inset-0 bg-axon-obsidian" />
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 to-purple-900/50 opacity-50" />
                    <div className="absolute -right-12 -top-12 w-48 h-48 bg-axon-neon/20 blur-[60px] rounded-full" />
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

                    <div className="relative z-10 bg-axon-obsidian/40 backdrop-blur-sm p-5 rounded-[18px] border border-white/10 flex flex-col gap-4">
                        <div className="flex items-center space-x-5">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-gray-800 to-black border border-white/20 flex items-center justify-center text-white text-2xl font-bold shadow-lg ring-4 ring-white/5 relative">
                                {profile.name.charAt(0)}
                                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-50 border-2 border-black rounded-full" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl font-bold text-white uppercase tracking-wide flex items-center gap-2">
                                    {profile.name}
                                    {profile.level >= 2 && <Shield className="w-4 h-4 text-axon-neon fill-axon-neon/20" />}
                                </h2>
                                <p className="text-sm text-gray-400 font-mono mb-2">{profile.email || 'Email not set'}</p>
                                <div className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-sm border border-white/10 ${profile.level >= 2 ? 'bg-axon-neon/10' : 'bg-white/10'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${profile.level >= 2 ? 'bg-axon-neon' : 'bg-gray-400'}`} />
                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${profile.level >= 2 ? 'text-axon-neon' : 'text-gray-300'}`}>
                                        {profile.level === 3 ? 'COINBASE ONE' : profile.level === 2 ? 'IDENTITY VERIFIED' : `LEVEL ${profile.level}`}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Wallet Integration Info */}
                        <div className="mt-2 pt-4 border-t border-white/10 flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Wallet Address</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono text-white/80">{truncatedAddress}</span>
                                    <button
                                        onClick={handleCopyAddress}
                                        className="p-1 hover:bg-white/10 rounded-md transition-colors text-white/60 hover:text-white"
                                    >
                                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                    </button>
                                    <a
                                        href={`https://basescan.org/address/${address}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1 hover:bg-white/10 rounded-md transition-colors text-white/60 hover:text-white"
                                    >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                </div>
                            </div>
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
                            <button
                                onClick={() => setIsPersonalModalOpen(true)}
                                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 rounded-md bg-blue-50 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <span className="font-bold text-sm text-axon-obsidian uppercase">Personal Info</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {profile.level < 2 && <span className="text-[9px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">Get Verified</span>}
                                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary" />
                                </div>
                            </button>
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
                                    <div className="w-8 h-8 rounded-md bg-orange-50 text-orange-600 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors">
                                        <Variable className="w-4 h-4" />
                                    </div>
                                    <span className="font-bold text-sm text-axon-obsidian uppercase">Limits & Fees</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-orange-600" />
                            </button>
                        </div>
                    </Card>
                </div>

                <Button
                    variant="secondary"
                    fullWidth
                    className="mt-8 !text-red-600 !border-red-100 hover:!bg-red-50 hover:!border-red-200"
                    onClick={() => disconnect()}
                >
                    <LogOut className="w-4 h-4 mr-2 inline" />
                    Sign Out
                </Button>
            </div>
        </div>
    );
}
