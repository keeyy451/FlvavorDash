# FlavorDash - UTS Pemrograman Mobile

Aplikasi Katalog Makanan Premium yang dikembangkan menggunakan **React Native** dan **Expo Router**. Proyek ini merupakan hasil pengerjaan Ujian Tengah Semester (UTS) dengan fokus pada desain layout responsif dan sistem autentikasi stateless (JWT).

---

## 📱 Penjelasan Implementasi Soal

### SOAL 1: Layouting & Responsivitas (Bobot 45%)

#### 1. Implementasi Flexbox Row
Sesuai dengan instruksi soal, struktur kode pada `components/ProductCard.js` dirancang menggunakan **Flexbox** dengan arah baris (`flexDirection: 'row'`). 
- **Sisi Kiri (Flex 1)**: Menampilkan gambar produk secara proporsional.
- **Sisi Kanan (Flex 1.5)**: Menampilkan detail teks (Nama, Rating, Deskripsi, Harga).
Hal ini memastikan gambar produk berada tepat di samping deskripsi secara konsisten.

#### 2. Analisis Responsivitas
Penggunaan unit proporsional seperti **Flex** dan **Persentase (%)** lebih disarankan daripada unit absolut (pixel) karena:
- **Fragmentasi Layar**: Perangkat Android dan iOS memiliki ribuan variasi ukuran layar. Pixel bersifat statis, sedangkan Flex bersifat dinamis.
- **Adaptivitas**: Dengan Flexbox, elemen akan otomatis "menyusut" atau "meregang" sesuai dengan ruang yang tersedia, mencegah elemen terpotong (*overflow*) pada layar kecil dan mencegah kekosongan ruang pada layar besar.

---

### SOAL 2: Auth & Middleware (Bobot 55%)

#### 1. Middleware & Route Protection
Sistem keamanan dirancang menggunakan arsitektur **Expo Router** di dalam folder `app/`.
- **ProtectedRoute**: Komponen pembungkus (wrapper) yang mendeteksi keberadaan JWT sebelum merender halaman `order-detail.js`.
- **JWT Middleware Pipeline**: Terletak di `utils/jwtMiddleware.js`, melakukan verifikasi 5 tahap:
  1. Validasi Struktur Header.
  2. Validasi Struktur Payload.
  3. Verifikasi Signature (Integritas Data).
  4. Pengecekan Expiration Time (Masa Aktif).
  5. Verifikasi Keutuhan Token.

#### 2. Analisis Keamanan Stateless
Perbedaan utama antara **Stateful** dan **Stateless**:
- **Stateful (Session-based)**: Server harus menyimpan session ID di Database/RAM. Hal ini membebani server saat jumlah pengguna mencapai jutaan karena sinkronisasi database session yang berat.
- **Stateless (JWT-based)**: Server tidak menyimpan state apa pun. Seluruh informasi autentikasi ada di dalam token yang dipegang client. Server cukup melakukan operasi matematika ringan untuk memverifikasi *Signature*.
- **Efisiensi**: Stateless lebih efisien untuk aplikasi mobile skala besar karena memudahkan *horizontal scaling* (server bisa ditambah tanpa pusing memikirkan sinkronisasi session).

---

## 🛠️ Teknologi yang Digunakan
- **Framework**: React Native (Expo SDK 51)
- **Routing**: Expo Router (File-based Routing)
- **Animasi**: React Native Reanimated
- **Icons**: Expo Vector Icons (Ionicons)
- **Styling**: Vanilla StyleSheet dengan Centralized Theme Tokens

---

## 🚀 Cara Menjalankan Proyek
1. Clone repository:
   ```bash
   git clone https://github.com/keeyy451/FlvavorDash.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Jalankan aplikasi:
   ```bash
   npx expo start
   ```

---
**Dikerjakan Oleh:** Mahasiswa Universitas Dian Nusantara
**Mata Kuliah:** Pemrograman Mobile
**Semester:** 6
