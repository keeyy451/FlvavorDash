import React, { useState } from 'react';
import {
  View, Text, Image, StyleSheet, SafeAreaView,
  TouchableOpacity, ScrollView, Alert, StatusBar,
  useWindowDimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeIn, FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import { runMiddlewarePipeline, decodePayload } from '../utils/jwtMiddleware';
import products from '../data/products';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from '../constants/Theme';

/**
 * SOAL 2: Implementasi Middleware & Route Protection
 * Halaman ini dilindungi oleh ProtectedRoute yang menjalankan pipeline JWT.
 */
function OrderDetailContent() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user, token } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const { width } = useWindowDimensions();

  const product = products.find(p => p.id === params.productId) || products[0];
  const totalPrice = product.price * quantity;

  let middlewareSteps = [];
  try {
    const pipelineResult = runMiddlewarePipeline(token);
    middlewareSteps = pipelineResult.steps || [];
  } catch (e) {}

  const formatPrice = (p) => `Rp ${p.toLocaleString('id-ID')}`;
  const isWeb = width > 768;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, isWeb && styles.webScrollContent]}>
        
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detail Pesanan</Text>
          <View style={{ width: 40 }} />
        </Animated.View>

        <View style={isWeb ? styles.webLayout : styles.mobileLayout}>
          <View style={isWeb ? styles.mainColumn : null}>
            {/* Image & Main Info */}
            <Animated.View entering={FadeIn.delay(200)} style={styles.imageContainer}>
              <Image source={{ uri: product.image }} style={styles.productImage} resizeMode="cover" />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(400)} style={styles.infoCard}>
              <Text style={styles.productName}>{product.name}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={16} color={COLORS.accent} />
                <Text style={styles.ratingText}>{product.rating} (100+ Reviews)</Text>
              </View>
              <Text style={styles.priceTag}>{formatPrice(product.price)}</Text>
              <Text style={styles.description}>{product.description}</Text>
            </Animated.View>
          </View>

          <View style={isWeb ? styles.sideColumn : null}>
            {/* Security / Middleware Section */}
            <Animated.View entering={FadeInRight.delay(600)} style={styles.securityCard}>
              <View style={styles.securityHeader}>
                <Ionicons name="shield-checkmark" size={24} color={COLORS.success} />
                <Text style={styles.securityTitle}>JWT Secured Session</Text>
              </View>
              <Text style={styles.securityUser}>User: {user?.name}</Text>
              
              <View style={styles.pipelineBox}>
                {middlewareSteps.map((step, idx) => (
                  <View key={idx} style={styles.stepItem}>
                    <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
                    <Text style={styles.stepText}>{step.step}</Text>
                  </View>
                ))}
              </View>
            </Animated.View>

            {/* THEORY ANALYSIS SECTION (FOR SOAL 1 & 2 RUBRIC) */}
            <Animated.View entering={FadeInRight.delay(800)} style={styles.analysisCard}>
              <TouchableOpacity 
                style={styles.analysisHeader} 
                onPress={() => setShowAnalysis(!showAnalysis)}
              >
                <Ionicons name="book" size={20} color={COLORS.accent} />
                <Text style={styles.analysisTitle}>Analisis Jawaban (Soal 1 & 2)</Text>
                <Ionicons name={showAnalysis ? "chevron-up" : "chevron-down"} size={20} color={COLORS.accent} />
              </TouchableOpacity>

              {showAnalysis && (
                <View style={styles.analysisBody}>
                  <Text style={styles.theoryHeading}>1. Analisis Responsivitas (Soal 1)</Text>
                  <Text style={styles.theoryText}>
                    Penggunaan unit proporsional (flex: 1 atau %) lebih disarankan daripada unit absolut (pixel) karena perangkat mobile memiliki "fragmentasi layar" (ukuran & resolusi berbeda-beda). Dengan Flexbox, layout akan beradaptasi secara dinamis; elemen akan mengisi ruang yang tersedia secara proporsional, memastikan tidak ada elemen yang terpotong (overflow) baik di Android maupun iOS.
                  </Text>

                  <Text style={styles.theoryHeading}>2. Analisis Keamanan Stateless (Soal 2)</Text>
                  <Text style={styles.theoryText}>
                    Sistem Stateful menyimpan sesi di server (Database/RAM), yang sulit di-scale untuk jutaan pengguna. Sistem Stateless (JWT) menyimpan data autentikasi di client. Server tidak perlu menyimpan state, cukup memverifikasi "Signature" token. Ini jauh lebih efisien untuk aplikasi skala besar karena mengurangi beban I/O server secara signifikan.
                  </Text>

                  <Text style={styles.theoryHeading}>3. Anatomi JWT</Text>
                  <Text style={styles.theoryText}>
                    • Header: Algoritma & tipe token.{"\n"}
                    • Payload: Data user (id, name, exp).{"\n"}
                    • Signature: Hasil hashing Header + Payload untuk validitas.
                  </Text>
                </View>
              )}
            </Animated.View>

            {/* Total Section */}
            <Animated.View entering={FadeInRight.delay(1000)} style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{formatPrice(totalPrice)}</Text>
              </View>
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={() => Alert.alert("Sukses", "Pesanan Anda sedang diproses!")}
              >
                <Text style={styles.confirmButtonText}>Konfirmasi Pesanan</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

export default function OrderDetailScreen() {
  return (
    <ProtectedRoute>
      <OrderDetailContent />
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 40 },
  webScrollContent: { paddingHorizontal: '10%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg },
  backButton: { width: 40, height: 40, borderRadius: 10, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.glassBorder },
  headerTitle: { ...TYPOGRAPHY.h3, color: COLORS.text },
  webLayout: { flexDirection: 'row', gap: 20, padding: 20 },
  mobileLayout: { paddingHorizontal: 20 },
  mainColumn: { flex: 1.5 },
  sideColumn: { flex: 1 },
  imageContainer: { width: '100%', height: 250, borderRadius: 20, overflow: 'hidden', marginBottom: 20 },
  productImage: { width: '100%', height: '100%' },
  infoCard: { backgroundColor: COLORS.surface, padding: 20, borderRadius: 20, marginBottom: 20, borderWidth: 1, borderColor: COLORS.glassBorder },
  productName: { ...TYPOGRAPHY.h2, color: COLORS.text, marginBottom: 5 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  ratingText: { color: COLORS.accent, marginLeft: 5, fontWeight: '700' },
  priceTag: { ...TYPOGRAPHY.h2, color: COLORS.primary, marginBottom: 15 },
  description: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 22 },
  securityCard: { backgroundColor: 'rgba(16, 185, 129, 0.05)', padding: 15, borderRadius: 15, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.2)', marginBottom: 20 },
  securityHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  securityTitle: { color: COLORS.success, fontWeight: '800', marginLeft: 10 },
  securityUser: { color: COLORS.textSecondary, fontSize: 12, marginBottom: 10 },
  pipelineBox: { backgroundColor: 'rgba(0,0,0,0.1)', padding: 10, borderRadius: 8 },
  stepItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  stepText: { color: COLORS.textSecondary, fontSize: 11, marginLeft: 8 },
  analysisCard: { backgroundColor: COLORS.surface, borderRadius: 15, padding: 15, marginBottom: 20, borderWidth: 1, borderColor: COLORS.accent },
  analysisHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  analysisTitle: { color: COLORS.accent, fontWeight: '800', fontSize: 13 },
  analysisBody: { marginTop: 15, borderTopWidth: 1, borderTopColor: COLORS.glassBorder, paddingTop: 10 },
  theoryHeading: { color: COLORS.text, fontWeight: '800', fontSize: 12, marginTop: 10, marginBottom: 4 },
  theoryText: { color: COLORS.textSecondary, fontSize: 11, lineHeight: 16 },
  summaryCard: { backgroundColor: COLORS.surface, padding: 20, borderRadius: 20, borderWidth: 1, borderColor: COLORS.glassBorder },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  totalLabel: { ...TYPOGRAPHY.h3, color: COLORS.text },
  totalValue: { ...TYPOGRAPHY.h2, color: COLORS.primary },
  confirmButton: { backgroundColor: COLORS.primary, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  confirmButtonText: { color: COLORS.text, fontWeight: '900', fontSize: 16 },
});
