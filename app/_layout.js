/**
 * _layout.js (Root Layout)
 * ============================================================
 * Root layout untuk Expo Router — FlavorDash
 *
 * SOAL 2 — ARSITEKTUR ROUTE PROTECTION:
 * File ini merupakan entry point routing yang membungkus
 * seluruh aplikasi dengan AuthProvider untuk menyediakan
 * state autentikasi JWT ke semua halaman.
 *
 * ALUR ROUTING:
 * ┌────────────────────────────────────────────────┐
 * │ RootLayout (_layout.js)                        │
 * │ └─ AuthProvider (context/AuthContext.js)        │
 * │    ├─ / (index.js)         → PUBLIC (katalog)  │
 * │    ├─ /login (login.js)    → PUBLIC (login)    │
 * │    └─ /order-detail        → PROTECTED 🔒      │
 * │       └─ ProtectedRoute (Middleware)            │
 * │          └─ JWT Pipeline (5 step verifikasi)    │
 * │             └─ OrderDetailContent               │
 * └────────────────────────────────────────────────┘
 *
 * KENAPA AuthProvider ADA DI _layout.js?
 * → Karena _layout.js adalah root layout Expo Router,
 *   semua halaman (screens) berada di dalamnya.
 * → Dengan menaruh AuthProvider di sini, SEMUA halaman
 *   bisa mengakses state autentikasi via useAuth() hook.
 * → Ini memungkinkan index.js menampilkan tombol login/logout,
 *   dan order-detail.js mengecek apakah user terautentikasi.
 * ============================================================
 */

import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../context/AuthContext';
import { COLORS } from '../constants/Theme';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
          animation: 'fade_from_bottom',
          animationDuration: 400,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen 
          name="login" 
          options={{ 
            animation: 'slide_from_bottom',
            presentation: 'modal'
          }} 
        />
        <Stack.Screen name="order-detail" />
      </Stack>
    </AuthProvider>
  );
}

