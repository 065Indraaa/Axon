# Panduan Testing (Simulasi) AxonSnap

Sebelum men-deploy ke jaringan asli (Mainnet atau Sepolia), kamu bisa melakukan simulasi 100% gratis di dalam Remix IDE.

## 1. Gunakan Remix VM (Simulator)
1. Di panel **Deploy & Run Transactions**, pada bagian **Environment**, pilih **Remix VM (London)** atau **Remix VM (Merge)**.
2. Ini adalah simulator blockchain di dalam browser. Kamu akan diberikan 10 akun yang masing-masing berisi 100 ETH palsu.

## 2. Cara Tes Fungsi Create & Claim
Karena `AxonSnap` memerlukan token ERC20 (seperti USDC), kamu perlu men-deploy token dummy untuk pengetesan:

### Langkah A: Deploy Token Dummy (Untuk Tes)
1. Di Remix, buat file baru `MockToken.sol`:
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockToken is ERC20 {
    constructor() ERC20("Mock USDC", "mUSDC") {
        _mint(msg.sender, 1000 * 10**6); // Cetak 1000 token
    }
    function decimals() public pure override returns (uint8) { return 6; }
}
```
2. Compile dan **Deploy** `MockToken`. Copy alamatnya.

### Langkah B: Jalankan Skenario Tes
1. **Deploy `AxonSnap`**.
2. **Approve**: Di kontrak `MockToken`, panggil fungsi `approve`.
   - spender: (Alamat `AxonSnap`)
   - amount: `100000000` (artinya 100 token)
3. **Create Snap**: Di kontrak `AxonSnap`, panggil `createSnap`.
   - _snapId: `0x123...` (isi acak 32 bytes)
   - _token: (Alamat `MockToken`)
   - _amount: `100000000`
   - _snappers: `5`
   - _isRandom: `false`
4. **Claim**: Ganti akun di Remix (pilih Account ke-2), lalu panggil `claimSnap` dengan snapId yang sama.
5. **Cek Saldo**: Cek `balanceOf` akun ke-2 di `MockToken`. Seharusnya sudah bertambah 20 token (100/5).

---
**Status**: Jika simulasi ini lancar, berarti logika kontrak kamu sudah **AMAN** untuk di-deploy ke Base Sepolia!
