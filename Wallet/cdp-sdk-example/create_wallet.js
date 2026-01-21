
import { Coinbase, Wallet } from "@coinbase/coinbase-sdk";
import dotenv from 'dotenv';

dotenv.config();

async function main() {
    try {
        console.log("Reading configuration...");

        const projectId = process.env.PROJECT_ID;
        const apiKeyId = process.env.API_KEY_ID;
        let privateKey = process.env.CDP_PRIVATE_KEY;

        if (!projectId || !apiKeyId || !privateKey) {
            throw new Error("Missing env vars.");
        }

        const finalApiKeyName = `projects/${projectId.trim()}/apiKeys/${apiKeyId.trim()}`;
        privateKey = privateKey.trim().replace(/\\n/g, '\n');

        // VALIDATION
        if (!privateKey.includes("BEGIN PRIVATE KEY")) {
            console.error("⚠️  WARNING: Private Key format looks wrong. Check .env!");
        }

        console.log(`Configuring SDK...`);
        console.log(`Key Name: ${finalApiKeyName}`);

        Coinbase.configure({ apiKeyName: finalApiKeyName, privateKey });

        console.log("Creating Wallet...");
        const wallet = await Wallet.create({ networkId: Coinbase.networks.BaseMainnet });

        console.log("\n✅ SUCCESS!");
        console.log(`Address: ${await wallet.getDefaultAddress()}`);

        // EXPORT
        const data = wallet.export();
        console.log("\n👇 SAVE THIS JSON 👇");
        console.log(JSON.stringify(data, null, 2));

    } catch (error) {
        console.error("\n❌ FATAL ERROR ❌");
        // Log FULL error structure
        console.dir(error, { depth: null, colors: true });
    }
}

main();
