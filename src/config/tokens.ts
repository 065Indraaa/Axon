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
        address: '0x18Bc5bcC660cf2B9cE3cd51a404aFe1a0cBD3C22',
        decimals: 18,
        icon: 'Rp',
        color: 'bg-red-500'
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
