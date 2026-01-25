export const CONTRACTS = {
  MERCHANT_ROUTER: '0x1234567890123456789012345678901234567890' as `0x${string}`,
  USDT: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2' as `0x${string}`,
  USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as `0x${string}`,
  IDRX: '0x18Bc5bcC660cf2B9cE3cd51a404aFe1a0cBD3C22' as `0x${string}`,
}

export const MERCHANT_ROUTER_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'tokenIn', type: 'address' },
      { internalType: 'uint256', name: 'amountIn', type: 'uint256' },
      { internalType: 'address', name: 'merchant', type: 'address' },
    ],
    name: 'swapAndPay',
    outputs: [{ internalType: 'uint256', name: 'amountOut', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'merchantBalances',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'withdrawMerchantBalance',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

export const ERC20_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

// ADDRESS VAULT (DOMPET ADMIN PENAMPUNG SNAP - LEGACY)
// This is the actual Smart Account contract address
export const AXON_VAULT_ADDRESS = '0xD570106de907d34384230f2a8281914444E5d76F' as `0x${string}`;

// AXON SNAP SMART CONTRACT ADDRESS
export const AXON_SNAP_ADDRESS = '0x0000000000000000000000000000000000000000' as `0x${string}`; // TO BE DEPLOYED

export const AXON_SNAP_ABI = [
  {
    "inputs": [{ "internalType": "address", "name": "_trustedForwarder", "type": "address" }],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "_snapId", "type": "bytes32" },
      { "internalType": "address", "name": "_token", "type": "address" },
      { "internalType": "uint256", "name": "_amount", "type": "uint256" },
      { "internalType": "uint256", "name": "_snappers", "type": "uint256" },
      { "internalType": "bool", "name": "_isRandom", "type": "bool" }
    ],
    "name": "createSnap",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes32", "name": "_snapId", "type": "bytes32" }],
    "name": "claimSnap",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes32", "name": "_snapId", "type": "bytes32" }],
    "name": "cancelSnap",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
    "name": "snaps",
    "outputs": [
      { "internalType": "address", "name": "creator", "type": "address" },
      { "internalType": "address", "name": "token", "type": "address" },
      { "internalType": "uint256", "name": "totalAmount", "type": "uint256" },
      { "internalType": "uint256", "name": "remainingAmount", "type": "uint256" },
      { "internalType": "uint256", "name": "totalSnappers", "type": "uint256" },
      { "internalType": "uint256", "name": "remainingSnappers", "type": "uint256" },
      { "internalType": "bool", "name": "isRandom", "type": "bool" },
      { "internalType": "bool", "name": "isActive", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;



