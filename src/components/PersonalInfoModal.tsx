import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Smartphone, ShieldCheck, MapPin, Home, Loader2, ExternalLink } from 'lucide-react';
import { Button } from './ui/Button';
import { redirectToCoinbaseVerification, initiateCoinbaseOAuth } from '../hooks/useCoinbaseVerification';

interface ProfileData {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    level: number;
    isAccountVerified?: boolean;
    isCountryVerified?: boolean;
    isCoinbaseOne?: boolean;
}

interface PersonalInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: ProfileData;
    onSave: (newData: ProfileData) => void;
}

export function PersonalInfoModal({ isOpen, onClose, data, onSave }: PersonalInfoModalProps) {
    const [formData, setFormData] = useState(data);
    const [isSaving, setIsSaving] = useState(false);

    // Sync state with incoming data (e.g. from verification)
    useEffect(() => {
        if (isOpen) {
            setFormData({
                ...data,
                name: data.isAccountVerified && data.name ? data.name : (data.name || formData.name),
                email: data.isAccountVerified && data.email ? data.email : (data.email || formData.email),
            });
        }
    }, [data, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setTimeout(() => {
            onSave(formData);
            setIsSaving(false);
            onClose();
        }, 1000);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-x-4 top-[5%] bottom-[5%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg z-[80] bg-[#FBFBFB] rounded-[20px] overflow-hidden shadow-2xl border border-gray-200 flex flex-col"
                    >
                        {/* Header - Swiss Style */}
                        <div className="relative bg-white px-6 py-4 border-b border-gray-200 shrink-0">
                            <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />
                            <div className="relative flex justify-between items-center">
                                <div>
                                    <h2 className="text-base font-black text-axon-obsidian uppercase tracking-tight font-mono">
                                        Personal Information
                                    </h2>
                                    <p className="text-[10px] text-axon-steel font-mono mt-0.5 uppercase tracking-wider">
                                        Profile & Verification
                                    </p>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto">
                            <div className="p-6">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Basic Information Section */}
                                    <div className="space-y-4">
                                        <h3 className="text-[10px] font-bold text-axon-steel uppercase tracking-[0.15em] pb-2 border-b border-gray-200">
                                            Basic Information
                                        </h3>

                                        <div className="space-y-1.5">
                                            <div className="flex justify-between items-center">
                                                <label className="text-[10px] font-bold text-axon-steel uppercase tracking-wider">Full Legal Name</label>
                                                {data.isAccountVerified && <span className="text-[8px] font-bold text-axon-neon uppercase tracking-widest flex items-center gap-1"><ShieldCheck className="w-2.5 h-2.5" /> Verified</span>}
                                            </div>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    readOnly={data.isAccountVerified}
                                                    className={`w-full bg-white border border-gray-200 rounded-lg py-2.5 pl-10 pr-4 text-sm font-medium text-axon-obsidian focus:ring-1 focus:ring-primary/30 focus:border-primary outline-none transition-all ${data.isAccountVerified ? 'bg-gray-50/50 cursor-not-allowed opacity-80' : ''}`}
                                                    placeholder="As per ID document"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1.5">
                                                <div className="flex justify-between items-center">
                                                    <label className="text-[10px] font-bold text-axon-steel uppercase tracking-wider">Email</label>
                                                    {data.isAccountVerified && <span className="text-[8px] font-bold text-axon-neon uppercase tracking-widest flex items-center gap-1"><ShieldCheck className="w-2.5 h-2.5" /> Verified</span>}
                                                </div>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                        readOnly={data.isAccountVerified}
                                                        className={`w-full bg-white border border-gray-200 rounded-lg py-2.5 pl-10 pr-4 text-sm font-medium text-axon-obsidian focus:ring-1 focus:ring-primary/30 focus:border-primary outline-none transition-all ${data.isAccountVerified ? 'bg-gray-50/50 cursor-not-allowed opacity-80' : ''}`}
                                                        placeholder="email@example.com"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-axon-steel uppercase tracking-wider">Phone</label>
                                                <div className="relative">
                                                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                    <input
                                                        type="tel"
                                                        name="phone"
                                                        value={formData.phone}
                                                        onChange={handleChange}
                                                        className="w-full bg-white border border-gray-200 rounded-lg py-2.5 pl-10 pr-4 text-sm font-medium text-axon-obsidian focus:ring-1 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                                                        placeholder="+62 812..."
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>



                                    {/* Residential Address Section - Only shown if Level 2 */}
                                    {formData.level >= 2 && (
                                        <div className="space-y-4">
                                            <h3 className="text-[10px] font-bold text-axon-steel uppercase tracking-[0.15em] pb-2 border-b border-gray-200 flex items-center gap-2">
                                                Residential Address
                                                <span className="text-[9px] bg-axon-neon/10 text-axon-neon px-1.5 py-0.5 rounded font-bold">VERIFIED</span>
                                            </h3>

                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-axon-steel uppercase tracking-wider">Street Address</label>
                                                <div className="relative">
                                                    <Home className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                                    <textarea
                                                        name="address"
                                                        value={formData.address}
                                                        onChange={handleChange}
                                                        rows={2}
                                                        className="w-full bg-white border border-gray-200 rounded-lg py-2.5 pl-10 pr-4 text-sm font-medium text-axon-obsidian focus:ring-1 focus:ring-primary/30 focus:border-primary outline-none transition-all resize-none"
                                                        placeholder="Street, building, apartment"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold text-axon-steel uppercase tracking-wider">City</label>
                                                    <div className="relative">
                                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                        <input
                                                            type="text"
                                                            name="city"
                                                            value={formData.city}
                                                            onChange={handleChange}
                                                            className="w-full bg-white border border-gray-200 rounded-lg py-2.5 pl-10 pr-4 text-sm font-medium text-axon-obsidian focus:ring-1 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                                                            placeholder="Jakarta"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold text-axon-steel uppercase tracking-wider">Postal Code</label>
                                                    <input
                                                        type="text"
                                                        name="postalCode"
                                                        value={formData.postalCode}
                                                        onChange={handleChange}
                                                        className="w-full bg-white border border-gray-200 rounded-lg py-2.5 px-4 text-sm font-medium text-axon-obsidian font-mono focus:ring-1 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                                                        placeholder="12345"
                                                        maxLength={5}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Verification Status */}
                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                        <h3 className="text-[10px] font-bold text-axon-steel uppercase tracking-[0.15em] mb-4 flex items-center justify-between">
                                            <span className="flex items-center gap-2">
                                                Verification Status
                                                <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold uppercase">Source: On-Chain (EAS)</span>
                                            </span>
                                            {(!data.isAccountVerified || !data.isCountryVerified) && (
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        redirectToCoinbaseVerification();
                                                    }}
                                                    className="text-[9px] font-bold text-primary hover:underline flex items-center gap-1"
                                                >
                                                    HOW TO VERIFY <ExternalLink className="w-2.5 h-2.5" />
                                                </button>
                                            )}
                                        </h3>

                                        <div className="space-y-2">
                                            {/* Level 1: Coinbase Account */}
                                            <div className={`flex items-center justify-between p-3 rounded-lg border transition-all ${data.isAccountVerified ? 'bg-white border-green-200 shadow-sm' : 'bg-transparent border-gray-200 opacity-60'}`}>
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-7 h-7 rounded-sm flex items-center justify-center text-[10px] font-black border ${data.isAccountVerified ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                                                        01
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] font-bold text-axon-obsidian uppercase tracking-wide">Coinbase Account</p>
                                                        <p className="text-[9px] text-gray-500 font-mono uppercase">Verified Account Status</p>
                                                    </div>
                                                </div>
                                                {data.isAccountVerified ? (
                                                    <ShieldCheck className="w-4 h-4 text-green-600" />
                                                ) : (
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            // Trigger OAuth to get Name/Email + Link Account
                                                            initiateCoinbaseOAuth();
                                                        }}
                                                        className="text-[8px] font-bold bg-axon-obsidian text-white px-2 py-1 rounded hover:bg-black transition-colors uppercase"
                                                    >
                                                        SYNC PROFILE
                                                    </button>
                                                )}
                                            </div>

                                            {/* Level 2: Country / Identity */}
                                            <div className={`flex items-center justify-between p-3 rounded-lg border transition-all ${data.isCountryVerified ? 'bg-white border-green-200 shadow-sm' : 'bg-transparent border-gray-200 opacity-60'}`}>
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-7 h-7 rounded-sm flex items-center justify-center text-[10px] font-black border ${data.isCountryVerified ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                                                        02
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] font-bold text-axon-obsidian uppercase tracking-wide">Identity & Country</p>
                                                        <p className="text-[9px] text-gray-500 font-mono uppercase">POI & POA Verification</p>
                                                    </div>
                                                </div>
                                                {data.isCountryVerified ? (
                                                    <ShieldCheck className="w-4 h-4 text-green-600" />
                                                ) : (
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            // For Level 2, we might still want the onchain verification page if OAuth doesn't give enough info, 
                                                            // but the user requirement stresses "reading name/gmail" which comes from OAuth. 
                                                            // We will trigger OAuth first as it's the primary "Read User" method requested.
                                                            initiateCoinbaseOAuth();
                                                        }}
                                                        className="text-[8px] font-bold bg-axon-obsidian text-white px-2 py-1 rounded hover:bg-black transition-colors uppercase"
                                                    >
                                                        SYNC INFO
                                                    </button>
                                                )}
                                            </div>

                                            {/* Bonus: Coinbase One */}
                                            <div className={`flex items-center justify-between p-3 rounded-lg border transition-all ${data.isCoinbaseOne ? 'bg-axon-obsidian text-white border-axon-neon/30 shadow-lg' : 'bg-transparent border-gray-200 opacity-60'}`}>
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-7 h-7 rounded-sm flex items-center justify-center text-[10px] font-black border ${data.isCoinbaseOne ? 'bg-axon-neon text-black border-axon-neon' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                                                        C1
                                                    </div>
                                                    <div>
                                                        <p className={`text-[11px] font-bold uppercase tracking-wide ${data.isCoinbaseOne ? 'text-white' : 'text-axon-obsidian'}`}>Coinbase One</p>
                                                        <p className={`text-[9px] font-mono uppercase ${data.isCoinbaseOne ? 'text-axon-neon/80' : 'text-gray-500'}`}>Premium Membership</p>
                                                    </div>
                                                </div>
                                                {data.isCoinbaseOne && <ShieldCheck className="w-4 h-4 text-axon-neon" />}
                                            </div>
                                        </div>

                                        {(!data.isAccountVerified || !data.isCountryVerified) && (
                                            <div className="mt-4 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                                                <p className="text-[9px] text-blue-600 font-medium leading-relaxed">
                                                    <span className="font-bold">NOTE:</span> Verification is performed on-chain via Coinbase. If you have already verified, it may take a few moments for the attestation to appear on Base.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Footer - Fixed */}
                        <div className="shrink-0 bg-white border-t border-gray-200 p-4">
                            <Button
                                fullWidth
                                disabled={isSaving}
                                onClick={handleSubmit}
                                className="!h-11 !text-xs !font-black !tracking-wider"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        UPDATING...
                                    </>
                                ) : (
                                    "SAVE CHANGES"
                                )}
                            </Button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
