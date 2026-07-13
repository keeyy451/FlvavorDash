/**
 * AuthContext.js
 * ============================================================
 * SOAL 2 — STATELESS AUTHENTICATION DENGAN JWT
 *
 * Context Provider untuk mengelola state autentikasi JWT.
 * Menggunakan expo-secure-store untuk menyimpan token secara aman.
 *
 * KONSEP STATELESS AUTHENTICATION:
 * ─────────────────────────────────────────────────────────────
 * Berbeda dengan Stateful (session-based) dimana server menyimpan
 * data sesi di memory/database, metode Stateless menyimpan SEMUA
 * informasi autentikasi di dalam token itu sendiri (JWT).
 *
 * Server TIDAK perlu menyimpan state apapun tentang user.
 * Verifikasi dilakukan dengan mendecode token dan mengecek
 * signature-nya, BUKAN mencari data di database.
 *
 * ALUR AUTENTIKASI JWT:
 * ┌─────────────────────────────────────────────────────────┐
 * │  LOGIN FLOW:                                            │
 * │  [1] User input email + password                        │
 * │  [2] Validasi credentials (simulasi server)             │
 * │  [3] Generate JWT: Header.Payload.Signature             │
 * │  [4] Simpan JWT di SecureStore (native encrypted)       │
 * │  [5] Set state: token, user, isAuthenticated = true     │
 * │  [6] Redirect ke halaman utama                          │
 * ├─────────────────────────────────────────────────────────┤
 * │  AUTO-LOGIN FLOW (App dimuat ulang):                    │
 * │  [1] Cek SecureStore → ada token?                       │
 * │  [2] Decode payload dari token                          │
 * │  [3] Cek exp > Date.now() → token masih valid?          │
 * │  [4] Jika valid → set state (auto login)                │
 * │  [5] Jika expired → hapus token (force logout)          │
 * ├─────────────────────────────────────────────────────────┤
 * │  LOGOUT FLOW:                                           │
 * │  [1] Hapus token dari SecureStore                       │
 * │  [2] Reset state: token = null, user = null             │
 * │  [3] isAuthenticated = false                            │
 * │  ※ Tidak perlu memberitahu server (stateless!)          │
 * └─────────────────────────────────────────────────────────┘
 *
 * KENAPA STATELESS LEBIH BAIK UNTUK MOBILE?
 * 1. SecureStore (native) lebih aman dari cookie
 * 2. Tidak bergantung pada koneksi server untuk verifikasi lokal
 * 3. Server bisa di-scale horizontal tanpa session replication
 * 4. Performa verifikasi O(1) — tidak perlu query database
 * ============================================================
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { decode as atob, encode as btoa } from 'base-64';

const AuthContext = createContext(null);

// ============================================================
// PENYIMPANAN TOKEN — Cross-Platform
// ─────────────────────────────────────────────────────────────
// Native (iOS/Android): expo-secure-store
//   → Data dienkripsi menggunakan Keychain (iOS) atau
//     Keystore (Android). JAUH lebih aman dari AsyncStorage.
//
// Web: localStorage (fallback)
//   → SecureStore tidak tersedia di web browser.
//   → Di produksi, sebaiknya gunakan httpOnly cookie untuk web.
// ============================================================
const TOKEN_KEY = 'flavordash_jwt_token';

async function saveToken(token) {
  if (Platform.OS === 'web') {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }
}

async function getToken() {
  if (Platform.OS === 'web') {
    return localStorage.getItem(TOKEN_KEY);
  } else {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  }
}

async function removeToken() {
  if (Platform.OS === 'web') {
    localStorage.removeItem(TOKEN_KEY);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}

// ============================================================
// JWT TOKEN GENERATOR (Simulasi Server)
// ─────────────────────────────────────────────────────────────
// Di produksi, JWT dihasilkan oleh BACKEND SERVER.
// Di sini kita simulasikan proses pembuatan JWT untuk demo.
//
// Struktur JWT:
//   HEADER    = { alg: "HS256", typ: "JWT" }
//   PAYLOAD   = { sub, name, email, iat, exp }
//   SIGNATURE = HMACSHA256(header + "." + payload, SECRET_KEY)
//
// Hasil akhir: base64(header).base64(payload).base64(signature)
//
// Penjelasan Claims di Payload:
//   sub → Subject: ID unik user (identifikasi)
//   name → Nama user
//   email → Email user
//   iat → Issued At: waktu token dibuat (Unix timestamp)
//   exp → Expiration: waktu token kadaluarsa (Unix timestamp)
// ============================================================
function generateMockJWT(user) {
  // HEADER: metadata algoritma dan tipe token
  const header = {
    alg: 'HS256',     // Algoritma: HMAC-SHA256
    typ: 'JWT',       // Tipe: JSON Web Token
  };

  // PAYLOAD: data user dan metadata waktu
  const payload = {
    sub: user.id,                              // Subject (user ID)
    name: user.name,                           // Nama user
    email: user.email,                         // Email user
    role: user.role,                           // Peran (Customer/Driver)
    iat: Math.floor(Date.now() / 1000),        // Issued At (sekarang)
    exp: Math.floor(Date.now() / 1000) + 3600, // Expires in 1 jam
  };

  // Encode ke Base64
  const base64Header = btoa(JSON.stringify(header));
  const base64Payload = btoa(JSON.stringify(payload));

  // SIGNATURE: Di produksi, ini dihitung menggunakan HMAC-SHA256
  // Formula: HMACSHA256(base64Header + "." + base64Payload, secretKey)
  // Di sini kita simulasikan dengan mock signature
  const mockSignature = btoa('flavordash-secret-key-2024');

  // Gabungkan: Header.Payload.Signature
  return `${base64Header}.${base64Payload}.${mockSignature}`;
}

// ============================================================
// AUTH PROVIDER COMPONENT
// ─────────────────────────────────────────────────────────────
// Menyediakan state autentikasi ke seluruh aplikasi melalui
// React Context API. Dipasang di _layout.js (root layout).
// ============================================================
export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState([]); // Global state untuk sinkronisasi pesanan

  // ============================================================
  // AUTO-LOGIN: Cek token saat app pertama kali dimuat
  // ─────────────────────────────────────────────────────────────
  // Mengambil token dari SecureStore, decode payload-nya,
  // dan cek apakah masih valid (belum expired).
  // Jika valid → user otomatis login tanpa input ulang.
  // ============================================================
  useEffect(() => {
    async function loadToken() {
      try {
        const storedToken = await getToken();
        if (storedToken) {
          setToken(storedToken);
          // Decode payload dari token (bagian ke-2)
          const parts = storedToken.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            // Cek apakah token sudah expired
            if (payload.exp && payload.exp > Math.floor(Date.now() / 1000)) {
              // Token masih valid → auto login
              setUser({
                id: payload.sub,
                name: payload.name,
                email: payload.email,
                role: payload.role,
              });
            } else {
              // Token expired → hapus dan force logout
              await removeToken();
              setToken(null);
            }
          }
        }
      } catch (error) {
        console.error('Error loading token:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadToken();
  }, []);

  // ============================================================
  // LOGIN FUNCTION
  // ─────────────────────────────────────────────────────────────
  // Simulasi proses autentikasi:
  // 1. Validasi email + password
  // 2. Generate JWT token
  // 3. Simpan di SecureStore
  // 4. Update state
  //
  // Di produksi: ini memanggil API endpoint POST /api/auth/login
  // yang mengembalikan JWT dari server.
  // ============================================================
  const login = async (email, password) => {
    // Simulasi validasi credentials (di produksi: API call)
    let userData = null;

    if (email === 'customer@flavordash.com' && password === 'password123') {
      userData = { id: 'usr_001', name: 'Budi (Customer)', email: email, role: 'customer' };
    } else if (email === 'driver@flavordash.com' && password === 'password123') {
      userData = { id: 'drv_001', name: 'Agus (Driver)', email: email, role: 'driver' };
    }

    if (userData) {
      // Generate JWT token (di produksi: server generate ini)
      const jwtToken = generateMockJWT(userData);

      // Simpan token di SecureStore (encrypted native storage)
      await saveToken(jwtToken);

      // Update React state
      setToken(jwtToken);
      setUser(userData);

      return { success: true };
    }

    return {
      success: false,
      message: 'Email atau password salah!',
    };
  };

  // ============================================================
  // LOGOUT FUNCTION
  // ─────────────────────────────────────────────────────────────
  // Stateless logout: cukup hapus token dari client.
  // TIDAK perlu memberitahu server (berbeda dari session-based
  // yang harus destroy session di server).
  //
  // Keuntungan Stateless Logout:
  // - Lebih cepat (tidak perlu network request)
  // - Bisa logout saat offline
  // - Server tidak perlu mengelola session cleanup
  // ============================================================
  const logout = async () => {
    await removeToken();
    setToken(null);
    setUser(null);
  };

  // ============================================================
  // ORDER MANAGEMENT (Sinkronisasi Customer -> Driver)
  // ============================================================
  const placeOrder = (product, customerName) => {
    const newOrder = {
      id: Date.now().toString(),
      product,
      customerName,
      status: 'pending'
    };
    setOrders((prev) => [newOrder, ...prev]);
  };

  const completeOrder = (orderId) => {
    setOrders((prev) => prev.filter(o => o.id !== orderId));
  };

  // ============================================================
  // COMPUTED STATE
  // isAuthenticated = true hanya jika ada token DAN user data
  // ============================================================
  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        token,         // JWT token string (Header.Payload.Signature)
        user,          // Data user { id, name, email }
        isLoading,     // true saat cek SecureStore
        isAuthenticated, // true jika token valid & user ada
        login,         // Fungsi login(email, password)
        logout,        // Fungsi logout()
        orders,        // Daftar pesanan aktif
        placeOrder,    // Fungsi tambah pesanan (Customer)
        completeOrder, // Fungsi selesaikan pesanan (Driver)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================
// CUSTOM HOOK: useAuth()
// ─────────────────────────────────────────────────────────────
// Hook untuk mengakses AuthContext dari komponen manapun.
// Harus digunakan di dalam tree AuthProvider.
//
// Contoh penggunaan:
//   const { isAuthenticated, user, login, logout } = useAuth();
// ============================================================
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return context;
}
