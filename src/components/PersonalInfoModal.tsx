import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Smartphone, ShieldCheck, CreditCard, MapPin, Home, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';
import { initiateCoinbaseOAuth } from '../hooks/useCoinbaseVerification';

interface ProfileData {
    name: string;
    email: string;
    phone: string;
    nik: string;
    address: string;
    city: string;
    postalCode: string;
    level: number;
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
                                            <label className="text-[10px] font-bold text-axon-steel uppercase tracking-wider">Full Legal Name</label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    className="w-full bg-white border border-gray-200 rounded-lg py-2.5 pl-10 pr-4 text-sm font-medium text-axon-obsidian focus:ring-1 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                                                    placeholder="As per ID document"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-axon-steel uppercase tracking-wider">Email</label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                        className="w-full bg-white border border-gray-200 rounded-lg py-2.5 pl-10 pr-4 text-sm font-medium text-axon-obsidian focus:ring-1 focus:ring-primary/30 focus:border-primary outline-none transition-all"
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

                                    {/* Identification Section - Only shown if Level 2 */}
                                    {formData.level >= 2 && (
                                        <div className="space-y-4">
                                            <h3 className="text-[10px] font-bold text-axon-steel uppercase tracking-[0.15em] pb-2 border-b border-gray-200 flex items-center gap-2">
                                                Identification
                                                <span className="text-[9px] bg-axon-neon/10 text-axon-neon px-1.5 py-0.5 rounded font-bold">VERIFIED</span>
                                            </h3>

                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-axon-steel uppercase tracking-wider">National ID (NIK)</label>
                                                <div className="relative">
                                                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        name="nik"
                                                        value={formData.nik}
                                                        onChange={handleChange}
                                                        className="w-full bg-white border border-gray-200 rounded-lg py-2.5 pl-10 pr-4 text-sm font-medium text-axon-obsidian font-mono focus:ring-1 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                                                        placeholder="16 digit NIK"
                                                        maxLength={16}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

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
                                        <h3 className="text-[10px] font-bold text-axon-steel uppercase tracking-[0.15em] mb-3 flex items-center gap-2">
                                            Verification Status
                                            <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold">COINBASE</span>
                                        </h3>

                                        <div className="space-y-2">
                                            {/* Level 1 */}
                                            <div className={`flex items-center justify-between p-3 rounded-lg border transition-all ${formData.level >= 1 ? 'bg-white border-green-200' : 'bg-transparent border-gray-200 opacity-50'}`}>
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black ${formData.level >= 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                                                        L1
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] font-bold text-axon-obsidian uppercase tracking-wide">Basic Verification</p>
                                                        <p className="text-[9px] text-gray-500 font-mono">Email & Phone</p>
                                                    </div>
                                                </div>
                                                {formData.level >= 1 && <ShieldCheck className="w-4 h-4 text-green-600" />}
                                            </div>

                                            {/* Level 2 */}
                                            <div className={`flex items-center justify-between p-3 rounded-lg border transition-all ${formData.level >= 2 ? 'bg-white border-axon-neon shadow-sm' : 'bg-transparent border-gray-200'}`}>
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black ${formData.level >= 2 ? 'bg-axon-neon text-black' : 'bg-gray-100 text-gray-400'}`}>
                                                        L2
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] font-bold text-axon-obsidian uppercase tracking-wide">Identity Verified</p>
                                                        <p className="text-[9px] text-gray-500 font-mono">POI & POA</p>
                                                    </div>
                                                </div>
                                                {formData.level >= 2 ? (
                                                    <ShieldCheck className="w-4 h-4 text-axon-neon" />
                                                ) : (
                                                    <button
                                                        onClick={initiateCoinbaseOAuth}
                                                        className="text-[9px] font-bold bg-axon-obsidian text-white px-2.5 py-1 rounded hover:bg-black transition-colors uppercase tracking-wider flex items-center gap-1"
                                                    >
                                                        VERIFY WITH COINBASE
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
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
