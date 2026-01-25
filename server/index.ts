import express from 'express';
import cors from 'cors';
import { Coinbase } from '@coinbase/coinbase-sdk';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Coinbase CDP
const coinbase = new Coinbase({
    apiKeyName: process.env.CDP_API_KEY_NAME!,
    privateKey: process.env.CDP_PRIVATE_KEY!,
});

// Swap endpoint
app.post('/api/swap', async (req, res) => {
    try {
        const { userAddress, fromAsset, toAsset, amount, network } = req.body;

        console.log('Swap request:', { userAddress, fromAsset, toAsset, amount, network });

        // Validate inputs
        if (!userAddress || !fromAsset || !toAsset || !amount) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        // For external wallets (user's own Smart Wallet), we need to create a trade
        // and return the transaction data for user to sign

        // Get or create external wallet reference
        const wallet = await coinbase.getExternalWallet(network, userAddress);

        // Create swap trade
        const trade = await wallet.createTrade({
            amount: amount,
            fromAssetId: fromAsset,
            toAssetId: toAsset,
        });

        // Get transaction for user to sign
        const transaction = trade.getTransaction();

        return res.json({
            success: true,
            transaction: {
                to: transaction.to,
                data: transaction.data,
                value: transaction.value || '0',
            },
            tradeId: trade.getId(),
        });

    } catch (error: any) {
        console.error('Swap error:', error);
        return res.status(500).json({
            error: error.message || 'Swap failed',
            details: error.toString()
        });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'AXON CDP Swap API' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Swap API running on port ${PORT}`);
    console.log(`📡 Endpoint: http://localhost:${PORT}/api/swap`);
});
