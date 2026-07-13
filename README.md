# FlavorDash — Aplikasi Katalog Makanan & Delivery

## Penjelasan (Summary)
FlavorDash adalah aplikasi pemesanan dan pengantaran makanan berbasis React Native yang menghubungkan pelanggan (Customer) dan kurir (Driver) dalam satu platform terpadu. Aplikasi ini menyederhanakan proses mulai dari melihat responsivitas katalog makanan, melakukan pemesanan, hingga melampirkan konfirmasi foto pengiriman pesanan menggunakan mekanisme autentikasi JWT.

## Stack / Teknis
- **Bahasa Pemrograman**: JavaScript (React Native / Expo SDK 54)
- **AI Recommendation**: Dibantu oleh Antigravity IDE (Gemini 3.1 Pro) untuk Code Generation, Refactoring, dan Analisis Arsitektur.
- **Database / API**: Menggunakan Mock API (Data Statis Lokal di `data/products.js`) yang dihubungkan melalui *Context API* untuk mensimulasikan State Management tersinkronisasi tanpa memerlukan backend khusus.
- **Modul Tambahan**: `expo-camera` (Integrasi Kamera), `react-native-maps` (Integrasi Peta Interaktif), `expo-secure-store` (Keamanan JWT), dan `base-64` (Decoding JWT).

## Flow Aplikasi
Secara garis besar, aplikasi FlavorDash memiliki alur yang terbagi menjadi dua peran (*Dual-Role System*) yang saling tersinkronisasi secara langsung melalui Global State:

1. **Flow Customer (Pemesan)**: 
   Pengguna masuk menggunakan akun Customer (`customer@flavordash.com`). Pengguna akan disajikan antarmuka Katalog Makanan yang responsif (dibangun dengan Flexbox). Setelah memilih produk, Customer diarahkan ke halaman Detail Pesanan (dilindungi middleware JWT) untuk melihat Peta Lokasi Restoran dan menekan tombol *Pesan Sekarang*.
   
2. **Sinkronisasi (Order Management)**: 
   Pesanan yang baru saja dibuat oleh Customer akan ditangkap oleh *Context API* dan disimpan dalam antrean pesanan aktif, menyimulasikan *real-time database sync*.

3. **Flow Driver (Kurir)**: 
   Pengguna masuk menggunakan akun Driver (`driver@flavordash.com`). Aplikasi mendeteksi peran kurir dan langsung mengarahkan ke halaman *Driver Dashboard* yang menampilkan daftar pesanan aktif dari Customer. Saat pesanan diklik, Driver akan melihat Peta Lokasi Pengiriman (Customer). Driver diwajibkan menggunakan fitur Kamera untuk mengambil **Foto Bukti Penerimaan** sebelum sistem mengizinkan Driver menekan tombol *Selesaikan Pengiriman*. Setelah selesai, pesanan akan terhapus dari daftar.
