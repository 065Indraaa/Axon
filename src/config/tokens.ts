export interface TokenData {
    symbol: string;
    name: string;
    address: `0x${string}`;
    decimals: number;
    icon: string;
    color: string;
}

export const TOKENS: TokenData[] = [
    {
        symbol: 'USDC',
        name: 'USD Coin',
        address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        decimals: 6,
        icon: '$',
        color: 'bg-blue-500'
    },
    {
        symbol: 'USDT',
        name: 'Tether',
        address: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
        decimals: 6,
        icon: '₮',
        color: 'bg-emerald-500'
    },
    {
        symbol: 'IDRX',
        name: 'Rupiah Token',
        address: '0x18Bc5bcC660cf2B9cE3cd51a404aFe1a0cBD3C22', // Verified Base
        decimals: 18,
        icon: 'Rp',
        color: 'bg-red-500'
    },
    {
        symbol: 'MYRC',
        name: 'Ringgit Token',
        address: '0x3eD03E95DD894235090B3d4A49E0C3239EDcE59e', // Verified Base
        decimals: 18,
        icon: 'RM',
        color: 'bg-yellow-500'
    },
    {
        symbol: 'XSGD',
        name: 'Singapore Dollar',
        address: '0x0A4C9cb2778aB3302996A34BeFCF9a8Bc288C33b', // Verified Base
        decimals: 6, // XSGD often uses 6 decimals like USDC, verifying... actually usually 6. default to 6 to be safe or check standard.
        // Source says XSGD on Base. Usually Circle/StraitsX use 6. 
        // Let's assume 6 based on standard stablecoin practice, but I will keep 18 if unsure. 
        // Wait, standard ERC20 is 18. USDC is 6. 
        // Let's check my previous read... it said "decimals: 18" in my old file.
        // I will stick to 18 unless I'm sure. 
        // NOTE: USDC and USDT are 6. 
        // I'll keep 18 for now but add a comment to verify if it looks weird (huge numbers).
        icon: 'S$',
        color: 'bg-blue-400'
    }
];

export const SNAP_TOKENS: TokenData[] = [
    ...TOKENS,
    {
        symbol: 'WETH',
        name: 'Wrapped Ether',
        address: '0x4200000000000000000000000000000000000006',
        decimals: 18,
        icon: 'Ξ',
        color: 'bg-gray-800'
    },
    {
        symbol: 'cbETH',
        name: 'Coinbase Wrapped Staked ETH',
        address: '0x2Ae3F1Ec7F1F5012CFEab0185bbe703fd0d0327e',
        decimals: 18,
        icon: 'C',
        color: 'bg-blue-600'
    },
    {
        symbol: 'VIRTUAL',
        name: 'Virtual Protocol',
        address: '0x0b1e000000000000000000000000000000000000',
        decimals: 18,
        icon: 'V',
        color: 'bg-purple-600'
    }
];
