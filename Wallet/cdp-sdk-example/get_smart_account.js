import { createPublicClient, http } from 'viem'
import { base } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'
import { toSimpleSmartAccount } from 'permissionless/accounts'

const privateKey = '0xb5456bf089fab91937b794fa1b9a00351f20f89f4b17f9731753fecd5f2bac10'
const rpcUrl = 'https://mainnet.base.org'

async function main() {
    const publicClient = createPublicClient({
        transport: http(rpcUrl),
        chain: base
    })

    const signer = privateKeyToAccount(privateKey)

    const simpleAccount = await toSimpleSmartAccount({
        client: publicClient,
        owner: signer,
        factoryAddress: "0x9406Cc6185a346906296840746125a0E44976454",
        entryPoint: {
            address: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
            version: "0.6"
        }
    })

    console.log('\n🔑 EOA OWNER ADDRESS (Apa yang kamu lihat di dompet):')
    console.log('='.repeat(70))
    console.log(signer.address)
    console.log('='.repeat(70))

    console.log('\n🤖 SMART ACCOUNT ADDRESS (Vault kita):')
    console.log('='.repeat(70))
    console.log(simpleAccount.address)
    console.log('='.repeat(70))
}

main().catch(console.error)
