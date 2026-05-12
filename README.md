#  FlavorDash: Premium Food Catalog & Secure Authentication
> **Proyek Ujian Tengah Semester (UTS) - Pemrograman Mobile**
> **Program Studi Informatika | Semester 6**

---

##  Ringkasan Proyek
FlavorDash adalah aplikasi katalog makanan berbasis **React Native** yang dirancang untuk mendemonstrasikan penguasaan dalam dua aspek krusial pengembangan mobile: **Desain Layout Responsif** yang adaptif terhadap fragmentasi perangkat, serta **Arsitektur Keamanan Stateless** menggunakan teknologi JWT (JSON Web Token) dengan middleware pada Expo Router.

---

##  Implementasi Teknis & Analisis Soal

###  Desain Layout & Analisis Responsivitas

#### A. Arsitektur Flexbox Row
Implementasi pada komponen `ProductCard.js` mengadopsi prinsip **Flexbox Grid**. Sesuai dengan instruksi, struktur kode menggunakan `flexDirection: 'row'` untuk memastikan entitas visual (gambar) dan entitas informasi (teks/deskripsi) berada dalam satu sumbu horizontal.

*   **Proporsionalitas**: Menggunakan pembagian `flex: 1` untuk kontainer gambar dan `flex: 1.5` untuk kontainer informasi. Hal ini menjamin bahwa ruang yang dialokasikan selalu konsisten secara rasio (40:60) di seluruh ukuran layar.
*   **Komponen Inti**: Mengintegrasikan `<View>`, `<Text>`, dan `<Image>` yang dibungkus dengan `TouchableOpacity` untuk interaktivitas, serta dioptimalkan dengan `Animated.View` dari *React Native Reanimated* untuk performa rendering yang halus.

#### B. Analisis Teknis Fragmentasi Layar
| Aspek | Unit Absolut (Pixel) | Unit Proposional (Flex/%) |
| :--- | :--- | :--- |
| **Adaptivitas** | Statis, tidak berubah saat layar berbeda. | Dinamis, menghitung ruang relatif terhadap layar. |
| **Fragmentasi** | Berisiko menyebabkan elemen terpotong (overflow) pada DPI rendah. | Mengatasi fragmentasi dengan menghitung densitas pixel secara otomatis. |
| **Maintenance** | Sulit dikelola untuk ribuan variasi perangkat Android/iOS. | Cukup satu basis kode untuk semua ukuran (Responsive Design). |

> **Analisis Mahasiswa:** Penggunaan unit proporsional adalah standar industri dalam menangani fragmentasi Android/iOS. Dengan Flexbox, kita tidak menentukan "berapa pixel lebar elemen", melainkan "berapa porsi elemen tersebut terhadap layar", sehingga UI tetap proporsional baik pada smartphone 5-inci maupun tablet 12-inci.

---

###  Keamanan Stateless & Arsitektur Middleware 

#### A. Implementasi Route Protection & Middleware
Proyek ini mengimplementasikan **Stateless Authentication** yang diintegrasikan ke dalam sistem routing *Expo Router*.

1.  **JWT Middleware Pipeline**: Berlokasi di `utils/jwtMiddleware.js`, sistem ini melakukan pengecekan integritas token melalui 5 layer verifikasi:
    *   **Structure Check**: Memastikan token memiliki 3 bagian (Header, Payload, Signature).
    *   **Anatomi JWT**: 
        - *Header*: Algoritma enkripsi (misal: HS256).
        - *Payload*: Data identitas user dan metadata session.
        - *Signature*: Kunci keamanan untuk mendeteksi manipulasi data.
2.  **Route Protection**: Menggunakan komponen `ProtectedRoute` di halaman `order-detail.js` sebagai *gatekeeper*. Jika verifikasi pipeline gagal, pengguna secara otomatis dialihkan ke halaman login, memastikan data detail pesanan bersifat *private*.

#### B. Analisis Efisiensi Stateless vs Stateful
Dalam pengembangan aplikasi skala besar (enterprise), metode **Stateless (JWT)** lebih efisien karena:
*   **Scalability**: Server tidak perlu menyimpan session di memori (RAM) atau Database. Ini memungkinkan *Horizontal Scaling* (menambah ribuan server tanpa perlu sinkronisasi data session).
*   **Security**: JWT mengandung *Self-contained Information*. Verifikasi dilakukan melalui hashing algorithm, yang jauh lebih cepat daripada query database session.
*   **Mobile-Friendly**: Sangat cocok untuk aplikasi mobile yang sering mengalami perubahan jaringan (IP address), karena token tetap valid selama signature-nya benar.

---

##  Stack Teknologi
- **Framework**: React Native (Expo SDK 54.0.0)
- **State Management**: React Context API (Auth Provider)
- **Animation Engine**: React Native Reanimated (Spring physics-based)
- **Vector Icons**: Ionicons (Premium Vector Assets)
- **Design System**: Centralized Theme Tokens (Dark Mode Optimized)

---

##  Instalasi & Pengoperasian
1. **Clone & Install**:
   ```bash
   git clone https://github.com/keeyy451/FlvavorDash.git
   cd FlvavorDash
   npm install
   ```
2. **Execution**:
   ```bash
   npx expo start --clear
   ```

---
**FlavorDash Project** - 
