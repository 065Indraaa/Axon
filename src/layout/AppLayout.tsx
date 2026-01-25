import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, History, Scan, Wallet, User } from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import SmartNotification from '../components/SmartNotification';

export function AppLayout() {
    const navigate = useNavigate();
    const location = useLocation();

    // Configuration for the 5-Tab System
    const tabs = [
        { id: 'dashboard', icon: Home, label: 'Home', path: '/' },
        { id: 'history', icon: History, label: 'History', path: '/history' },
        { id: 'scan', icon: Scan, label: 'Scan', path: '/scan', isFab: true }, // Special styling for Scan
        { id: 'account', icon: User, label: 'Account', path: '/account' },
    ];

    return (
        <div className="flex flex-col h-screen bg-[#F5F5F7] max-w-md mx-auto relative overflow-hidden shadow-2xl">
            <SmartNotification />
            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
                <Outlet />
            </div>

            {/* Swiss Style Bottom Navigation */}
            <div className="h-[80px] bg-white border-t border-gray-200 flex items-center justify-between px-6 pb-2 safe-area-bottom z-50">
                {tabs.map((tab) => {
                    const isActive = location.pathname === tab.path;

                    if (tab.isFab) {
                        return (
                            <div key={tab.id} className="relative -top-6">
                                <button
                                    onClick={() => navigate(tab.path)}
                                    className="w-14 h-14 bg-axon-obsidian rounded-full flex items-center justify-center text-axon-neon shadow-lg shadow-gray-900/20 active:scale-95 transition-transform border-[3px] border-[#F5F5F7]"
                                >
                                    <Scan className="w-6 h-6" />
                                </button>
                            </div>
                        );
                    }

                    return (
                        <button
                            key={tab.id}
                            onClick={() => navigate(tab.path)}
                            className="flex flex-col items-center justify-center gap-1 w-12"
                        >
                            <div className="relative">
                                <tab.icon
                                    className={clsx(
                                        "w-6 h-6 transition-colors",
                                        isActive ? "text-primary" : "text-gray-400"
                                    )}
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-dot"
                                        className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                                    />
                                )}
                            </div>
                            <span className={clsx(
                                "text-[10px] font-bold tracking-wide uppercase transition-colors",
                                isActive ? "text-primary" : "text-gray-400"
                            )}>
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
