import { Coinbase, Wallet } from "@coinbase/coinbase-sdk";
import dotenv from 'dotenv';

dotenv.config();

async function main() {
    try {
        const apiKeyName = process.env.CDP_API_KEY_NAME;
        let privateKey = process.env.CDP_PRIVATE_KEY;
        const walletSecret = process.env.WALLET_SECRET;

        if (!apiKeyName || !privateKey) {
            throw new Error("Missing CDP credentials");
        }

        privateKey = privateKey.trim().replace(/\\n/g, '\n');

        console.log("Configuring SDK...");
        Coinbase.configure({ apiKeyName, privateKey });

        console.log("\nImporting existing wallet using Wallet Secret...");

        // Try to import wallet using the secret
        const walletData = {
            seed: walletSecret,
            networkId: "base-mainnet"
        };

        const wallet = await Wallet.import(walletData);

        const address = await wallet.getDefaultAddress();

        console.log("\n✅ SUCCESS!");
        console.log("=".repeat(70));
        console.log(`SERVER WALLET ADDRESS: ${address.toString()}`);
        console.log("=".repeat(70));

    } catch (error) {
        console.error("\n❌ ERROR:");
        console.dir(error, { depth: null, colors: true });
    }
}

main();
