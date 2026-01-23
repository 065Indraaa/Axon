import { privateKeyToAccount } from 'viem/accounts'

const pk = '0xb5456bf089fab91937b794fa1b9a00351f20f89f4b17f9731753fecd5f2bac10'
try {
    const account = privateKeyToAccount(pk)
    console.log('PRIVATE_KEY:', pk)
    console.log('DERIVED_EOA_ADDRESS:', account.address)
} catch (e) {
    console.error('Error:', e.message)
}
