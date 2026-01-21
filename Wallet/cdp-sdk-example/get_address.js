import { Coinbase, Wallet } from "@coinbase/coinbase-sdk";
import dotenv from 'dotenv';

dotenv.config();

async function main() {
    try {
        const apiKeyName = process.env.CDP_API_KEY_NAME;
        let privateKey = process.env.CDP_PRIVATE_KEY;

        if (!apiKeyName || !privateKey) {
            throw new Error("Missing CDP_API_KEY_NAME or CDP_PRIVATE_KEY in .env");
        }

        // Clean up private key
        privateKey = privateKey.trim().replace(/\\n/g, '\n');

        console.log("Configuring SDK...");
        console.log(`API Key Name: ${apiKeyName}`);

        Coinbase.configure({ apiKeyName, privateKey });

        console.log("\nCreating wallet on Base Mainnet...");
        const wallet = await Wallet.create({ networkId: Coinbase.networks.BaseMainnet });

        const address = await wallet.getDefaultAddress();

        console.log("\n✅ SUCCESS!");
        console.log("=".repeat(70));
        console.log(`SERVER WALLET ADDRESS: ${address.toString()}`);
        console.log("=".repeat(70));
        console.log("\n👉 COPY alamat di atas dan kirim ke saya untuk update contracts.ts");

    } catch (error) {
        console.error("\n❌ ERROR:");
        console.dir(error, { depth: null, colors: true });
    }
}

main();
