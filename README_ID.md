# Akademi Nusantara 3D Online — Android PWA + Multiplayer

Project ini mengubah prototipe 3D menjadi **web app yang bisa dipasang di Android** (PWA) dan menambahkan multiplayer real-time melalui WebSocket.

## Fitur yang sudah disiapkan
- Dunia kampus 3D dan kontrol layar sentuh dari versi sebelumnya.
- PWA: manifest, ikon, dan service worker.
- Multiplayer satu dunia/room: pemain lain terlihat bergerak secara real-time.
- Chat global sederhana.
- Server Node.js + WebSocket; posisi pemain dibatasi dalam area kampus.
- Endpoint pemeriksaan server: `/health`.

## Menjalankan di komputer untuk uji coba
Butuh Node.js 18 atau lebih baru.

```bash
npm install
npm start
```

Buka `http://localhost:3000` di browser. Untuk menguji multiplayer lokal, buka alamat yang sama di dua tab/perangkat pada jaringan yang sama (untuk perangkat lain gunakan IP komputer, dan izinkan port 3000 di firewall lokal).

## Membuat game bisa dipasang di Android dan dimainkan online
PWA dan WebSocket harus di-host pada layanan yang mendukung Node.js dan HTTPS/WSS. Contoh alur deployment:

1. Buat repository Git dan unggah seluruh isi folder project ini.
2. Buat Web Service Node pada penyedia hosting yang mendukung Node.js (misalnya Render).
3. Build command: `npm install`.
4. Start command: `npm start`.
5. Setelah deployment selesai, buka URL HTTPS dari hosting di Chrome Android.
6. Pilih menu Chrome ⋮ → **Tambahkan ke layar utama** atau **Install app**.
7. Jalankan ikon Akademi Nusantara dari layar utama. Semua pemain harus memakai URL server yang sama agar bertemu di dunia yang sama.

WebSocket otomatis memakai `wss://` ketika halaman dibuka melalui HTTPS. Jika frontend dan server ditempatkan pada host berbeda, atur `window.AKADEMI_WS_URL` sebelum script game berjalan ke alamat WebSocket server, misalnya `wss://alamat-server-anda/ws`.

## Catatan penting
- Ini adalah **PWA Android**, bukan APK native yang sudah ditandatangani. PWA dapat dipasang dari Chrome tanpa Play Store. Untuk APK native, project perlu dibungkus/build lebih lanjut menggunakan Android Studio/Capacitor.
- Multiplayer baru menyinkronkan posisi/arah karakter dan chat. Misi, progres, KTA, dan pemilihan mingguan belum disimpan ke database bersama.
- Server contoh memakai satu room global dan memori proses; pemain akan kembali hilang saat server restart. Untuk produksi diperlukan database, autentikasi, moderasi chat, pembatasan spam, dan penyimpanan progres.
- Game memuat Three.js dari CDN, sehingga koneksi internet diperlukan saat memuat game.
- Jangan memasukkan data identitas asli. Gunakan nama karakter fiksi.
