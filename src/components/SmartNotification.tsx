import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Wallet, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAxon } from '../context/AxonContext';

export type NotificationType = 'location' | 'balance' | 'network';

interface NotificationData {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    action?: string;
    onAction?: () => void;
    path?: string;
    color: string;
}

export function SmartNotification() {
    const [notifications, setNotifications] = useState<NotificationData[]>([]);
    const navigate = useNavigate();
    const { location, city, currency, updateRealLocation } = useAxon();

    // AI Logic: Trigger Notification on Location Change
    useEffect(() => {
        // Automatically try to detect location on mount
        const initLocation = async () => {
            // Show detecting state
            addNotification({
                id: 'loc-finding',
                type: 'location',
                title: 'AXON AI',
                message: 'Detecting Location...',
                color: 'text-gray-400',
            });

            try {
                await updateRealLocation();
            } catch (err) {
                // Only show error if strictly needed, or silent fail to default
                addNotification({
                    id: 'loc-err',
                    type: 'location',
                    title: 'GPS ERROR',
                    message: 'Location access denied.',
                    color: 'text-red-500',
                });
            }
        };

        if (location === 'US') { // Trigger only if default
            initLocation();
        }
    }, []);

    // handleEnableLocation is no longer needed but keeping the logic inline above

    // Watch for successful location updates
    useEffect(() => {
        if (city && city !== 'Jakarta') { // Simple check to avoid initial default trigger if you want
            addNotification({
                id: `loc-${Date.now()}`,
                type: 'location',
                title: 'SMART LOCATION',
                message: `📍 ${city.toUpperCase()}, ${location}. Mode: ${currency.code}`,
                color: 'text-axon-neon',
            });
        }
    }, [city, location, currency]);

    const addNotification = (notif: NotificationData) => {
        setNotifications((prev) => [notif, ...prev]);
        setTimeout(() => {
            removeNotification(notif.id);
        }, 6000);
    };

    const removeNotification = (id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    return (
        <div className="fixed top-6 left-0 right-0 z-[100] flex flex-col items-center pointer-events-none px-6">
            <AnimatePresence>
                {notifications.map((notif) => (
                    <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        className="pointer-events-auto w-full max-w-sm mb-3"
                    >
                        <div className="bg-white/90 backdrop-blur-md border border-gray-200 rounded-swiss shadow-lg p-4 flex items-center gap-3">
                            {/* Icon Box */}
                            <div className="w-10 h-10 bg-axon-obsidian rounded-md flex items-center justify-center shrink-0 shadow-sm">
                                {notif.type === 'location' && <MapPin className="w-5 h-5 text-axon-neon" />}
                                {notif.type === 'balance' && <Wallet className="w-5 h-5 text-red-500" />}
                            </div>

                            {/* Text */}
                            <div className="flex-1">
                                <h4 className="font-bold text-[10px] font-mono text-axon-steel tracking-wider uppercase mb-0.5">
                                    {notif.title}
                                </h4>
                                <p className="text-sm font-bold text-axon-obsidian leading-tight">
                                    {notif.message}
                                </p>
                            </div>

                            {/* Action */}
                            {notif.action && (
                                <button
                                    onClick={() => {
                                        if (notif.onAction) notif.onAction();
                                        if (notif.path) navigate(notif.path);
                                        removeNotification(notif.id);
                                    }}
                                    className="bg-axon-paper px-3 py-1.5 rounded-md text-xs font-bold font-mono text-primary border border-gray-200 hover:bg-gray-100 transition"
                                >
                                    {notif.action}
                                </button>
                            )}

                            <button
                                onClick={() => removeNotification(notif.id)}
                                className="text-gray-400 hover:text-axon-obsidian ml-1"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}

export default SmartNotification;
