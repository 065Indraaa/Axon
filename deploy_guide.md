# Panduan Deployment AxonSnap Smart Contract

Berikut adalah langkah-langkah untuk men-deploy kontrak `AxonSnap.sol` ke **Base Sepolia** menggunakan Remix IDE:

## Persiapan
1. **Wallet**: Pastikan MetaMask kamu terhubung ke jaringan **Base Sepolia**.
2. **Faucet**: Pastikan kamu punya sedikit saldo ETH di Sepolia (gratis dari faucet).

## Langkah-langkah di Remix IDE
1. **Buka Remix**: Buka [remix.ethereum.org](https://remix.ethereum.org).
2. **Buat File Baru**: Di panel kiri (File Explorer), buat file baru bernama `AxonSnap.sol`.
3. **Copy-Paste Kode**: Copy seluruh isi dari file `contracts/AxonSnap.sol` di proyekmu, lalu paste ke Remix.
4. **Compile**:
   - Klik ikon **Solidity Compiler** (ikon kedua dari bawah di sidebar kiri).
   - Pilih Compiler Version `0.8.20` atau yang lebih baru.
   - Klik tombol **Compile AxonSnap.sol**.
5. **Deploy**:
   - Klik ikon **Deploy & Run Transactions** (ikon ketiga dari bawah).
   - Di bagian **Environment**, pilih **Injected Provider - MetaMask**.
   - Pastikan **Account** sudah menunjukkan alamat dompetmu.
   - Pilih Contract **AxonSnap**.
   - Klik tombol **Deploy** (Warna Oranye).
   - Konfirmasi transaksi di MetaMask.

## Setelah Berhasil
1. **Copy Alamat Kontrak**: Setelah deploy selesai, alamat kontrak akan muncul di bagian "Deployed Contracts" (di bawah). Klik ikon copy.
2. **Update Kode**: Buka file `src/config/contracts.ts` di VS Code.
3. **Ganti Alamat**: Ganti nilai `AXON_SNAP_ADDRESS` dengan alamat yang baru saja kamu copy.
   ```typescript
   export const AXON_SNAP_ADDRESS = 'ALAMAT_BARU_KAMU' as `0x${string}`;
   ```
4. **Test**: Jalankan `npm run dev` dan coba buat Snap baru!

> [!TIP]
> Jangan lupa untuk memverifikasi kontrak di block explorer (BaseScan) agar orang lain bisa melihat kode aslinya secara transparan.
