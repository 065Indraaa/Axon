import { Card } from '../components/ui/Card';
import { ArrowUpRight, ArrowDownLeft, Wallet as WalletIcon, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWalletBalances } from '../hooks/useWalletBalances';
import { useMemo } from 'react';
import { TOKENS } from '../config/tokens';

export default function StakingPage() {
    const { balances } = useWalletBalances();

    const assets = useMemo(() => {
        return TOKENS.map(token => ({
            symbol: token.symbol,
            name: token.name,
            balance: balances[token.symbol] || '0.00',
            value: `$0.00`, // Value would need a price feed oracle
            change: '~4.8%' // Estimated APY if staked
        })).filter(a => ['ETH', 'USDC', 'IDRX'].includes(a.symbol));
    }, [balances]);

    return (
        <div className="min-h-screen bg-[#F5F5F7] pb-24 font-sans text-axon-obsidian">
            {/* HEADER: COMPACT STANDARD */}
            <div className="relative px-6 pt-8 pb-4 sticky top-0 z-30">
                {/* Background: Glass + Dot Matrix Pattern */}
                <div className="absolute inset-0 bg-white/85 backdrop-blur-xl border-b border-gray-200" />
                <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />

                <div className="relative z-10 flex justify-between items-end">
                    <h1 className="text-lg font-black tracking-tight leading-none uppercase font-mono text-axon-obsidian">
                        Staking
                    </h1>
                    <div className="text-right">
                        <p className="text-[8px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-0.5">EARNINGS</p>
                        <p className="text-sm font-bold text-axon-ether font-mono leading-none">+$24.50</p>
                    </div>
                </div>
            </div>

            <div className="px-6 py-6">

                {/* Staking Summary Card - Obsidian Black */}
                <motion.div
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className="bg-axon-obsidian text-white rounded-swiss p-6 shadow-2xl shadow-gray-900/10 mb-8 relative overflow-hidden"
                >
                    {/* Decorative Mesh */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/20 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2" />

                    <div className="relative z-10">
                        <p className="text-axon-steel text-xs font-mono uppercase tracking-widest mb-2">Total Staked Value</p>
                        <h2 className="text-4xl font-bold mb-8 tracking-tight font-mono">$5,400.00</h2>

                        <div className="flex items-center gap-4 border-t border-white/10 pt-6">
                            <div className="flex-1">
                                <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1">Current APY</p>
                                <p className="text-xl font-bold text-axon-neon">4.8%</p>
                            </div>
                            <div className="w-px h-8 bg-white/10" />
                            <div className="flex-1">
                                <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1">Rewards</p>
                                <p className="text-xl font-bold text-green-400">+$0.32 <span className="text-[10px] text-gray-400">/ day</span></p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Staking Options - Precise Grid */}
                <div>
                    <h3 className="font-bold text-sm text-axon-steel uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">
                        AVAILABLE VAULTS
                    </h3>
                    <div className="space-y-3">
                        {assets.map((asset, idx) => (
                            <motion.div
                                key={asset.symbol}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.1 + (idx * 0.1) }}
                            >
                                <Card className="flex items-center justify-between !p-4 hover:border-primary transition group cursor-pointer">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 bg-white border border-gray-200 rounded-swiss flex items-center justify-center font-bold text-axon-obsidian group-hover:bg-primary group-hover:text-white transition-colors">
                                            {asset.symbol[0]}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-axon-obsidian text-sm uppercase">{asset.name}</h4>
                                            <p className="text-[10px] font-mono text-axon-steel">APY: {asset.change}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <button className="bg-axon-obsidian text-white text-[10px] font-bold px-4 py-2 rounded-sm uppercase tracking-widest hover:bg-gray-800 transition">
                                            Stake
                                        </button>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
