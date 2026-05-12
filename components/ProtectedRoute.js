/**
 * ProtectedRoute.js
 * ============================================================
 * SOAL 2 — MIDDLEWARE ROUTE PROTECTION
 *
 * Komponen ini berfungsi sebagai middleware/guard untuk
 * melindungi halaman yang membutuhkan autentikasi JWT.
 *
 * ALUR PROTEKSI ROUTE:
 * ┌─────────────────────────────────────────────────────────┐
 * │  User mengakses /order-detail                          │
 * │       ↓                                                │
 * │  ProtectedRoute membungkus halaman                     │
 * │       ↓                                                │
 * │  [1] Cek isLoading → tampilkan loading spinner         │
 * │       ↓                                                │
 * │  [2] Cek token ada? → jika TIDAK → redirect ke /login  │
 * │       ↓                                                │
 * │  [3] Jalankan JWT Middleware Pipeline:                  │
 * │      → validateTokenStructure()                        │
 * │      → decodeHeader() → cek alg & typ                  │
 * │      → decodePayload() → cek claims                    │
 * │      → checkExpiration() → cek exp vs now              │
 * │      → verifySignature() → cek integritas              │
 * │       ↓                                                │
 * │  [4] Semua PASS? → Render children (halaman)           │
 * │      Ada FAIL?   → Redirect ke /login + hapus token    │
 * └─────────────────────────────────────────────────────────┘
 *
 * Komponen ini digunakan di _layout.js atau langsung
 * membungkus halaman yang perlu diproteksi.
 * ============================================================
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { runMiddlewarePipeline } from '../utils/jwtMiddleware';

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const { token, isLoading, isAuthenticated, logout } = useAuth();
  const [middlewareResult, setMiddlewareResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(true);

  // ============================================================
  // Jalankan middleware pipeline setiap kali token berubah
  // ============================================================
  useEffect(() => {
    if (isLoading) return; // Tunggu AuthContext selesai load

    if (!token) {
      // Tidak ada token → akses ditolak
      setMiddlewareResult({
        authenticated: false,
        steps: [
          {
            step: 'Token Check',
            status: 'FAIL',
            detail: 'Token tidak ditemukan di storage',
          },
        ],
        error: 'Token JWT tidak ditemukan. Silakan login terlebih dahulu.',
      });
      setIsVerifying(false);
      return;
    }

    // Jalankan full middleware pipeline
    const result = runMiddlewarePipeline(token);
    setMiddlewareResult(result);
    setIsVerifying(false);

    // Jika token tidak valid, lakukan logout
    if (!result.authenticated) {
      logout();
    }
  }, [token, isLoading]);

  // ============================================================
  // STATE 1: Loading (AuthContext sedang memuat token)
  // ============================================================
  if (isLoading || isVerifying) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#ff6b6b" />
          <Text style={styles.loadingText}>Memverifikasi token JWT...</Text>
          <Text style={styles.loadingSubtext}>
            Menjalankan middleware pipeline
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================================
  // STATE 2: Tidak terautentikasi (middleware gagal)
  // ============================================================
  if (!middlewareResult?.authenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.lockIcon}>🔒</Text>
          <Text style={styles.lockTitle}>Akses Ditolak</Text>
          <Text style={styles.lockSubtitle}>
            Halaman ini membutuhkan autentikasi JWT yang valid
          </Text>

          {/* Tampilkan hasil middleware pipeline */}
          <View style={styles.pipelineBox}>
            <Text style={styles.pipelineTitle}>
              🔍 Middleware Pipeline Result
            </Text>
            {middlewareResult?.steps?.map((step, index) => (
              <View key={index} style={styles.pipelineStep}>
                <Text
                  style={[
                    styles.stepStatus,
                    { color: step.status === 'PASS' ? '#4caf50' : '#ff5252' },
                  ]}
                >
                  {step.status === 'PASS' ? '✅' : '❌'} {step.step}
                </Text>
                <Text style={styles.stepDetail}>{step.detail}</Text>
              </View>
            ))}
          </View>

          {/* Error message */}
          {middlewareResult?.error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>
                ⚠️ {middlewareResult.error}
              </Text>
            </View>
          )}

          {/* Action buttons */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.replace('/login')}
          >
            <Text style={styles.loginButtonText}>🔑 Login Sekarang</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace('/')}
          >
            <Text style={styles.backButtonText}>← Kembali ke Katalog</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================================
  // STATE 3: Terautentikasi (semua middleware PASS)
  // Render children (halaman yang diproteksi)
  // ============================================================
  return children;
}

// ============================================================
// STYLESHEET
// ============================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#12122a',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: '6%',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 16,
  },
  loadingSubtext: {
    color: '#a0a0c0',
    fontSize: 13,
    marginTop: 4,
  },
  lockIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  lockTitle: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 8,
  },
  lockSubtitle: {
    color: '#a0a0c0',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  pipelineBox: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  pipelineTitle: {
    color: '#ff6b6b',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 12,
  },
  pipelineStep: {
    marginBottom: 8,
  },
  stepStatus: {
    fontSize: 13,
    fontWeight: '700',
  },
  stepDetail: {
    color: '#a0a0c0',
    fontSize: 11,
    marginTop: 2,
    marginLeft: 24,
  },
  errorBox: {
    width: '100%',
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 82, 82, 0.3)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: '#ff5252',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
    elevation: 6,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  backButton: {
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#a0a0c0',
    fontSize: 14,
    fontWeight: '600',
  },
});
