# 🍽️ FlavorDash — Aplikasi Katalog Makanan & Delivery

> **Proyek Ujian Akhir Semester (UAS) — Pemrograman Mobile**
> **Framework:** React Native (Expo) | **Bahasa:** JavaScript

---

## 📋 Ringkasan Proyek

FlavorDash adalah aplikasi katalog makanan berbasis **React Native (Expo)** yang mengimplementasikan empat fitur utama:

1. **Katalog Makanan** — Tampilan responsif menggunakan Flexbox dengan komponen `<View>`, `<Text>`, dan `<Image>`.
2. **Detail Pesanan (Protected)** — Halaman yang dilindungi autentikasi JWT dengan middleware pipeline.
3. **Fitur Kamera** — Mengambil foto sebagai bukti penerimaan pesanan menggunakan `expo-camera`.
4. **Fitur Maps** — Menampilkan lokasi restoran dengan marker menggunakan `react-native-maps`.

---

## 🚀 Cara Menjalankan Aplikasi

### Prasyarat
- **Node.js** versi 18 atau lebih baru
- **npm** atau **yarn**
- **Expo Go** (aplikasi di perangkat Android/iOS) — unduh dari Play Store / App Store
- Perangkat fisik (disarankan untuk fitur Kamera & Maps)

### Langkah Instalasi

```bash
# 1. Clone repository
git clone https://github.com/keeyy451/FlvavorDash.git

# 2. Masuk ke direktori proyek
cd FlvavorDash

# 3. Install semua dependensi
npm install

# 4. Jalankan aplikasi
npx expo start --clear
```

### Menjalankan di Perangkat
- **Android/iOS**: Scan QR Code yang muncul di terminal menggunakan aplikasi **Expo Go**.
- **Web**: Tekan tombol `w` di terminal (fitur Kamera dan Maps hanya tersedia di perangkat mobile).

### Akun Demo untuk Login
```
Email    : user@flavordash.com
Password : password123
```

---

## 📁 Struktur Proyek

```
FlvavorDash/
├── app/
│   ├── _layout.js          # Root Layout — AuthProvider & Stack Navigator
│   ├── index.js             # Halaman Katalog Makanan (PUBLIC)
│   ├── login.js             # Halaman Login (PUBLIC)
│   └── order-detail.js      # Halaman Detail Pesanan (PROTECTED 🔒)
│                              → Termasuk fitur Kamera & Maps
├── components/
│   ├── ProductCard.js       # Komponen kartu produk (Flexbox Row)
│   └── ProtectedRoute.js    # Middleware guard untuk route protection
├── context/
│   └── AuthContext.js       # Context Provider untuk autentikasi JWT
├── data/
│   └── products.js          # Mock API — Data katalog makanan
├── utils/
│   └── jwtMiddleware.js     # JWT Middleware Pipeline (5-step verification)
├── constants/
│   └── Theme.js             # Design tokens (warna, spacing, tipografi)
├── assets/                  # Ikon & splash screen
├── app.json                 # Konfigurasi Expo (termasuk plugin kamera)
└── package.json             # Dependensi proyek
```

---

## 🔧 Implementasi Fitur

### 1. Katalog Makanan (Flexbox & Responsif)

**File:** `app/index.js` & `components/ProductCard.js`

Halaman katalog menampilkan daftar makanan menggunakan komponen dasar React Native:
- **`<View>`** — Container layout dengan Flexbox
- **`<Text>`** — Menampilkan nama, deskripsi, harga, dan rating
- **`<Image>`** — Menampilkan foto makanan dari URL (Unsplash)

**Implementasi Flexbox Row** pada `ProductCard.js`:
```jsx
row: {
  flexDirection: 'row',    // Gambar dan teks tersusun horizontal
  alignItems: 'center',    // Rata tengah secara vertikal
},
imageWrapper: {
  flex: 1,                 // Gambar mengambil 40% ruang
},
content: {
  flex: 1.5,               // Teks mengambil 60% ruang
  paddingLeft: 16,
},
```

**Responsivitas Multi-Breakpoint** pada `index.js`:
```jsx
const { numColumns, horizontalPadding } = useMemo(() => {
  if (width > 1200) return { numColumns: 4, horizontalPadding: width * 0.1 };
  if (width > 900)  return { numColumns: 3, horizontalPadding: width * 0.05 };
  if (width > 600)  return { numColumns: 2, horizontalPadding: SPACING.lg };
  return { numColumns: 1, horizontalPadding: SPACING.md };
}, [width]);
```

**Data makanan** menggunakan **Mock API** yang didefinisikan di `data/products.js` berisi 6 item menu (Nasi Goreng, Sate Ayam, Mie Ayam, Es Teh, Rendang, Jus Alpukat) dengan atribut lengkap: id, nama, deskripsi, harga, rating, kategori, dan URL gambar.

---

### 2. Detail Pesanan — JWT Authentication & Middleware

**File:** `app/order-detail.js`, `components/ProtectedRoute.js`, `context/AuthContext.js`, `utils/jwtMiddleware.js`

Halaman Detail Pesanan **hanya dapat diakses oleh pengguna yang telah login**. Proteksi dilakukan menggunakan:

#### a. JWT Token Generation (`AuthContext.js`)
Saat login berhasil, sistem men-generate token JWT dengan struktur:
```
Header.Payload.Signature
```
- **Header**: `{ alg: "HS256", typ: "JWT" }`
- **Payload**: `{ sub, name, email, iat, exp }` (termasuk waktu kadaluarsa 1 jam)
- **Signature**: Simulasi HMAC-SHA256

Token disimpan secara aman menggunakan **`expo-secure-store`** (Keychain di iOS, Keystore di Android).

#### b. Middleware Pipeline (`jwtMiddleware.js`)
Setiap kali user mengakses halaman protected, middleware menjalankan **5 tahap verifikasi**:

| Step | Fungsi | Penjelasan |
|------|--------|------------|
| 1 | `validateTokenStructure()` | Cek format 3 bagian (Header.Payload.Signature) |
| 2 | `decodeHeader()` | Validasi algoritma (`alg`) dan tipe (`typ`) |
| 3 | `decodePayload()` | Ekstraksi data user dari payload |
| 4 | `checkExpiration()` | Cek apakah token sudah expired berdasarkan `exp` |
| 5 | `verifySignature()` | Verifikasi integritas signature token |

#### c. Route Protection (`ProtectedRoute.js`)
Komponen ini membungkus halaman `order-detail.js` dan bertindak sebagai **gatekeeper**:
- Jika **belum login** → tampilkan halaman "Akses Ditolak" dengan opsi redirect ke login
- Jika **token invalid/expired** → logout otomatis dan redirect ke login
- Jika **semua verifikasi PASS** → render konten halaman detail pesanan

```jsx
// Penggunaan di order-detail.js
export default function OrderDetailScreen() {
  return (
    <ProtectedRoute>
      <OrderDetailContent />
    </ProtectedRoute>
  );
}
```

---

### 3. Fitur Kamera — Bukti Penerimaan Pesanan

**File:** `app/order-detail.js`
**Library:** `expo-camera` (`CameraView`, `useCameraPermissions`)

Fitur kamera terintegrasi di halaman Detail Pesanan:

1. User menekan tombol **"Ambil Foto Bukti"**
2. Aplikasi meminta izin akses kamera (menggunakan `useCameraPermissions()`)
3. Jika diizinkan, **Modal kamera** terbuka secara fullscreen
4. User mengambil foto dengan menekan tombol capture
5. **Hasil foto ditampilkan** di halaman Detail Pesanan sebagai preview
6. User dapat mengambil ulang foto jika diperlukan
7. Konfirmasi pesanan **memvalidasi** bahwa foto bukti sudah diambil

```jsx
// Konfigurasi izin kamera di app.json
"plugins": [
  "expo-router",
  "expo-secure-store",
  ["expo-camera", {
    "cameraPermission": "Allow FlavorDash to access your camera for order receipts."
  }]
]
```

---

### 4. Fitur Maps — Lokasi Restoran

**File:** `app/order-detail.js`
**Library:** `react-native-maps` (`MapView`, `Marker`)

Peta ditampilkan di halaman Detail Pesanan menunjukkan lokasi restoran:

```jsx
<MapView
  style={styles.map}
  initialRegion={{
    latitude: -6.2088,      // Jakarta, Indonesia
    longitude: 106.8456,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  }}
>
  <Marker
    coordinate={{ latitude: -6.2088, longitude: 106.8456 }}
    title={product.name}    // Nama restoran sesuai produk
  />
</MapView>
```

**Catatan:** Fitur Maps dan Kamera hanya berjalan di perangkat **Android/iOS**. Di versi Web, ditampilkan placeholder informatif.

---

## 📊 Analisis

### 1. Alasan Penggunaan Flexbox dan Ukuran Proporsional

**Flexbox** adalah sistem layout utama di React Native yang menggunakan model **flexible box** untuk mengatur posisi dan ukuran elemen secara dinamis.

#### Mengapa Flexbox?

| Aspek | Unit Absolut (px) | Unit Proporsional (flex / %) |
|-------|-------------------|------------------------------|
| **Adaptivitas** | Statis — ukuran tetap di semua layar | Dinamis — menyesuaikan ukuran layar secara otomatis |
| **Fragmentasi Android** | Berisiko overflow/terpotong pada layar kecil | Mengatasi fragmentasi dengan kalkulasi proporsi |
| **Maintenance** | Harus menulis banyak kode untuk tiap ukuran | Satu kode basis untuk semua ukuran layar |
| **Orientasi** | Harus handle manual portrait/landscape | Otomatis menyesuaikan saat orientasi berubah |

#### Implementasi dalam FlavorDash:

1. **`flexDirection: 'row'`** pada `ProductCard.js` — Menyusun gambar dan informasi produk secara horizontal (satu baris), sehingga layout konsisten di semua ukuran layar.

2. **`flex: 1` dan `flex: 1.5`** — Membagi ruang dengan rasio proporsional 40:60 antara gambar dan teks. Tidak peduli layar berukuran 5 inci atau 12 inci, proporsi ini tetap terjaga.

3. **`useWindowDimensions()`** pada `index.js` — Mendeteksi lebar layar secara real-time dan menyesuaikan jumlah kolom grid secara dinamis (1 kolom untuk mobile, 2 untuk tablet, dst).

4. **Persentase (`'8%'`, `'10%'`)** untuk padding — Menggunakan persentase agar jarak antar elemen selalu proporsional terhadap ukuran layar.

**Kesimpulan:** Flexbox dengan ukuran proporsional adalah pendekatan yang tepat untuk membangun UI responsif di React Native karena perangkat Android memiliki ribuan variasi ukuran layar (fragmentasi). Dengan pendekatan ini, developer cukup menulis satu kode basis yang secara otomatis beradaptasi di semua perangkat.

---

### 2. Perbedaan Stateful dan Stateless Authentication (JWT)

#### A. Stateful Authentication (Session-Based)

```
┌──────────┐     Login      ┌──────────┐
│  Client  │ ─────────────► │  Server  │
│ (Mobile) │                │          │
│          │ ◄───────────── │ Session  │
│          │  Session ID    │ Storage  │
│          │  (Cookie)      │ (DB/RAM) │
└──────────┘                └──────────┘
```

- Server **menyimpan data sesi** di memori (RAM) atau database
- Client menyimpan **Session ID** di cookie
- Setiap request, server harus **mencari session di database** untuk verifikasi
- Logout = **server menghapus session** dari storage

#### B. Stateless Authentication (JWT)

```
┌──────────┐     Login      ┌──────────┐
│  Client  │ ─────────────► │  Server  │
│ (Mobile) │                │          │
│          │ ◄───────────── │ (Tidak   │
│          │  JWT Token     │  simpan  │
│ SecureStore              │  apapun) │
│ (Encrypted)              │          │
└──────────┘                └──────────┘
```

- Server **TIDAK menyimpan** data sesi apapun
- Seluruh informasi autentikasi **tersimpan di dalam token** itu sendiri
- Verifikasi dilakukan dengan **mendecode dan mengecek signature** token
- Logout = **client menghapus token** (server tidak perlu diberitahu)

#### C. Perbandingan Lengkap

| Aspek | Stateful (Session) | Stateless (JWT) |
|-------|-------------------|-----------------|
| **Penyimpanan** | Server menyimpan session di DB/RAM | Client menyimpan token, server tidak simpan apapun |
| **Verifikasi** | Query database setiap request | Decode token + cek signature (O(1)) |
| **Scalability** | Sulit di-scale (perlu session replication) | Mudah di-scale horizontal (serverless-ready) |
| **Performa** | Lambat (I/O database) | Cepat (kalkulasi lokal) |
| **Offline Support** | Tidak bisa (butuh server) | Token bisa diverifikasi secara lokal |
| **Mobile-Friendly** | Kurang (cookie tidak ideal di mobile) | Sangat cocok (disimpan di SecureStore) |
| **Logout** | Harus hapus di server + client | Cukup hapus di client saja |

#### D. Alasan Pemilihan JWT pada Aplikasi Mobile

1. **Keamanan Native Storage** — JWT disimpan di `expo-secure-store` yang menggunakan Keychain (iOS) dan Keystore (Android) dengan enkripsi tingkat hardware. Ini jauh lebih aman dibanding cookie yang rentan terhadap serangan CSRF.

2. **Performa Verifikasi O(1)** — Tidak perlu roundtrip ke server untuk memverifikasi identitas user. Token didecode secara lokal dan dicek signature-nya, menghasilkan verifikasi yang sangat cepat.

3. **Horizontal Scalability** — Karena server tidak menyimpan session, server bisa di-scale ke ribuan instance tanpa perlu sinkronisasi data session antar server.

4. **Offline Capability** — Aplikasi mobile sering berada di kondisi jaringan tidak stabil. Dengan JWT, verifikasi bisa dilakukan secara lokal tanpa koneksi internet.

5. **Cross-Platform** — Token JWT bersifat platform-agnostic. Token yang sama bisa digunakan di Android, iOS, maupun Web tanpa perlu mekanisme autentikasi yang berbeda.

---

## 🛠️ Stack Teknologi

| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| React Native | 0.81.5 | Framework utama |
| Expo SDK | 54.0.0 | Development platform |
| Expo Router | 6.0.23 | File-based routing |
| Expo Camera | 17.0.10 | Akses kamera perangkat |
| React Native Maps | 1.20.1 | Tampilan peta & marker |
| Expo Secure Store | 15.0.8 | Penyimpanan token terenkripsi |
| base-64 | 1.0.0 | Encoding/decoding Base64 untuk JWT |

---

## 📱 Screenshot Fitur

### Alur Penggunaan Aplikasi
```
┌─────────────┐    ┌─────────────┐    ┌──────────────────┐
│   Katalog   │───►│    Login     │───►│  Detail Pesanan  │
│  (Public)   │    │  (JWT Auth)  │    │   (Protected)    │
│             │    │              │    │  ┌────────────┐  │
│ • FlatList  │    │ • Email/Pass │    │  │   Maps     │  │
│ • Flexbox   │    │ • SecureStore│    │  │  (Marker)  │  │
│ • Kategori  │    │ • Demo Akun  │    │  └────────────┘  │
│             │    │              │    │  ┌────────────┐  │
│             │    │              │    │  │  Kamera    │  │
│             │    │              │    │  │  (Bukti)   │  │
│             │    │              │    │  └────────────┘  │
└─────────────┘    └─────────────┘    └──────────────────┘
```

---

## 👤 Informasi Pengembang

**Repository:** [github.com/keeyy451/FlvavorDash](https://github.com/keeyy451/FlvavorDash)

---

**© FlavorDash Project — UAS Pemrograman Mobile**
