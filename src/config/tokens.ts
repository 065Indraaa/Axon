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
        address: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2', // Tether on Base (example address, verify in prod)
        decimals: 6,
        icon: '₮',
        color: 'bg-emerald-500'
    },
    {
        symbol: 'IDRX',
        name: 'Rupiah Token',
        address: '0x18Bc5bcC660cf2B9cE3cd51a404aFe1a0cBD3C22',
        decimals: 18,
        icon: 'Rp',
        color: 'bg-red-500'
    },
    {
        symbol: 'MYRC',
        name: 'Malaysian Ringgit',
        address: '0x0000000000000000000000000000000000000000', // Need real address
        decimals: 18,
        icon: 'RM',
        color: 'bg-yellow-500'
    },
    {
        symbol: 'XSGD',
        name: 'Singapore Dollar',
        address: '0x0000000000000000000000000000000000000000', // Need real address
        decimals: 18,
        icon: 'S$',
        color: 'bg-purple-500'
    },
];
