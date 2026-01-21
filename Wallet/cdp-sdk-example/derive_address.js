import { privateKeyToAccount } from 'viem/accounts'

const privateKey = '0xb5456bf089fab91937b794fa1b9a00351f20f89f4b17f9731753fecd5f2bac10'

const account = privateKeyToAccount(privateKey)

console.log('\n✅ Wallet Address:')
console.log('='.repeat(70))
console.log(account.address)
console.log('='.repeat(70))
