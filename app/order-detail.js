import React, { useState, useRef } from 'react';
import {
  View, Text, Image, StyleSheet, SafeAreaView,
  TouchableOpacity, ScrollView, Alert, StatusBar,
  useWindowDimensions, Modal, Platform
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import { runMiddlewarePipeline } from '../utils/jwtMiddleware';
import products from '../data/products';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../constants/Theme';
import { CameraView, useCameraPermissions } from 'expo-camera';
import MapView, { Marker } from 'react-native-maps';

function OrderDetailContent() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user, token } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const { width } = useWindowDimensions();

  // Camera State
  const [showCamera, setShowCamera] = useState(false);
  const [photoUri, setPhotoUri] = useState(null);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  
  // Order Success State
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  const product = products.find(p => p.id === params.productId) || products[0];
  const totalPrice = product.price * quantity;

  let middlewareSteps = [];
  try {
    const pipelineResult = runMiddlewarePipeline(token);
    middlewareSteps = pipelineResult.steps || [];
  } catch (e) {}

  const formatPrice = (p) => `Rp ${p.toLocaleString('id-ID')}`;
  const isWeb = width > 768;

  const handleOpenCamera = async () => {
    if (!permission?.granted) {
      const { status } = await requestPermission();
      if (status !== 'granted') {
        Alert.alert("Izin Ditolak", "Anda memerlukan izin kamera untuk mengambil bukti penerimaan.");
        return;
      }
    }
    setShowCamera(true);
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setPhotoUri(photo.uri);
      setShowCamera(false);
    }
  };

  const confirmOrder = () => {
    if (!photoUri) {
      Alert.alert("Perhatian", "Harap ambil foto bukti penerimaan pesanan terlebih dahulu.");
      return;
    }
    setOrderConfirmed(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, isWeb && styles.webScrollContent]}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detail Pesanan</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={isWeb ? styles.webLayout : styles.mobileLayout}>
          <View style={isWeb ? styles.mainColumn : null}>
            {/* Image & Main Info */}
            <View style={styles.imageContainer}>
              <Image source={{ uri: product.image }} style={styles.productImage} resizeMode="cover" />
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.productName}>{product.name}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={16} color={COLORS.accent} />
                <Text style={styles.ratingText}>{product.rating} (100+ Reviews)</Text>
              </View>
              <Text style={styles.priceTag}>{formatPrice(product.price)}</Text>
              <Text style={styles.description}>{product.description}</Text>
            </View>

            {/* Map View */}
            <View style={styles.mapContainer}>
              <Text style={styles.sectionTitle}>Lokasi Restoran</Text>
              <View style={styles.mapWrapper}>
                {Platform.OS === 'web' ? (
                  <View style={[styles.map, { justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.surface }]}>
                    <Ionicons name="map" size={40} color={COLORS.textSecondary} />
                    <Text style={{ color: COLORS.textSecondary, marginTop: 10 }}>Peta tidak didukung di versi Web</Text>
                  </View>
                ) : (
                  <MapView 
                    style={styles.map}
                    initialRegion={{
                      latitude: -6.2088,
                      longitude: 106.8456,
                      latitudeDelta: 0.05,
                      longitudeDelta: 0.05,
                    }}
                  >
                    <Marker coordinate={{ latitude: -6.2088, longitude: 106.8456 }} title={product.name} />
                  </MapView>
                )}
              </View>
            </View>
          </View>

          <View style={isWeb ? styles.sideColumn : null}>
            {/* Camera / Proof Section */}
            <View style={styles.cameraCard}>
              <Text style={styles.sectionTitle}>Bukti Penerimaan</Text>
              {photoUri ? (
                <View style={styles.photoContainer}>
                  <Image source={{ uri: photoUri }} style={styles.previewPhoto} />
                  <TouchableOpacity style={styles.retakeButton} onPress={handleOpenCamera}>
                    <Ionicons name="camera-reverse" size={20} color="#fff" />
                    <Text style={styles.retakeText}>Ambil Ulang</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.openCameraButton} onPress={handleOpenCamera}>
                  <Ionicons name="camera" size={32} color={COLORS.primary} />
                  <Text style={styles.openCameraText}>Ambil Foto Bukti</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Security / Middleware Section */}
            <View style={styles.securityCard}>
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
            </View>

            {/* THEORY ANALYSIS SECTION */}
            <View style={styles.analysisCard}>
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
                  <Text style={styles.theoryHeading}>1. Analisis Responsivitas</Text>
                  <Text style={styles.theoryText}>
                    Penggunaan unit proporsional (flex) lebih disarankan daripada unit absolut (pixel) karena perangkat mobile memiliki fragmentasi layar.
                  </Text>

                  <Text style={styles.theoryHeading}>2. Analisis Keamanan Stateless</Text>
                  <Text style={styles.theoryText}>
                    Sistem Stateless (JWT) menyimpan data autentikasi di client, bukan server. Ini efisien untuk aplikasi besar.
                  </Text>
                </View>
              )}
            </View>

            {/* Total Section */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{formatPrice(totalPrice)}</Text>
              </View>
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={confirmOrder}
              >
                <Text style={styles.confirmButtonText}>Konfirmasi Pesanan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

      </ScrollView>

      {/* Camera Modal */}
      <Modal visible={showCamera} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
          {Platform.OS === 'web' ? (
             <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
               <Text style={{ color: 'white', marginBottom: 20 }}>Kamera tidak didukung di versi Web</Text>
               <TouchableOpacity style={styles.closeCameraButton} onPress={() => setShowCamera(false)}>
                  <Ionicons name="close" size={30} color="white" />
               </TouchableOpacity>
             </View>
          ) : (
            <CameraView style={{ flex: 1 }} facing="back" ref={cameraRef}>
              <View style={styles.cameraControls}>
                <TouchableOpacity style={styles.closeCameraButton} onPress={() => setShowCamera(false)}>
                  <Ionicons name="close" size={30} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                  <View style={styles.captureButtonInner} />
                </TouchableOpacity>
              </View>
            </CameraView>
          )}
        </SafeAreaView>
      </Modal>

      {/* Success Modal */}
      <Modal visible={orderConfirmed} animationType="fade" transparent={true}>
        <View style={styles.successModalOverlay}>
          <View style={styles.successModalContent}>
            <View style={styles.successIconCircle}>
              <Ionicons name="checkmark-circle" size={80} color={COLORS.success} />
            </View>
            <Text style={styles.successTitle}>Pesanan Berhasil!</Text>
            <Text style={styles.successSubtitle}>
              Terima kasih, {user?.name}. Pesanan {product.name} Anda sedang diproses dan akan segera diantar.
            </Text>
            <View style={styles.successDetails}>
              <View style={styles.successRow}>
                <Text style={styles.successLabel}>Total Bayar</Text>
                <Text style={styles.successValue}>{formatPrice(totalPrice)}</Text>
              </View>
              <View style={styles.successRow}>
                <Text style={styles.successLabel}>Metode Pembayaran</Text>
                <Text style={styles.successValue}>FlavorPay</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.backHomeButton} 
              onPress={() => {
                setOrderConfirmed(false);
                router.replace('/');
              }}
            >
              <Text style={styles.backHomeButtonText}>Kembali ke Katalog</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  
  // New Styles for Map and Camera
  sectionTitle: { ...TYPOGRAPHY.h3, color: COLORS.text, marginBottom: 10 },
  mapContainer: { backgroundColor: COLORS.surface, padding: 20, borderRadius: 20, marginBottom: 20, borderWidth: 1, borderColor: COLORS.glassBorder },
  mapWrapper: { height: 200, borderRadius: 12, overflow: 'hidden' },
  map: { flex: 1 },
  cameraCard: { backgroundColor: COLORS.surface, padding: 20, borderRadius: 20, marginBottom: 20, borderWidth: 1, borderColor: COLORS.glassBorder, alignItems: 'center' },
  openCameraButton: { alignItems: 'center', justifyContent: 'center', padding: 20, borderStyle: 'dashed', borderWidth: 2, borderColor: COLORS.primary, borderRadius: 12, width: '100%' },
  openCameraText: { color: COLORS.primary, marginTop: 10, fontWeight: '700' },
  photoContainer: { width: '100%', alignItems: 'center' },
  previewPhoto: { width: '100%', height: 200, borderRadius: 12, marginBottom: 10 },
  retakeButton: { flexDirection: 'row', backgroundColor: COLORS.accent, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  retakeText: { color: '#fff', marginLeft: 8, fontWeight: '700' },
  cameraControls: { flex: 1, backgroundColor: 'transparent', flexDirection: 'column', justifyContent: 'space-between', padding: 20 },
  closeCameraButton: { alignSelf: 'flex-start', marginTop: 20, padding: 10 },
  captureButton: { alignSelf: 'center', marginBottom: 40, width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255, 255, 255, 0.3)', justifyContent: 'center', alignItems: 'center' },
  captureButtonInner: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'white' },

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

  // Success Modal Styles
  successModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  successModalContent: { backgroundColor: COLORS.surface, width: '100%', maxWidth: 400, borderRadius: 24, padding: 30, alignItems: 'center', borderWidth: 1, borderColor: COLORS.glassBorder },
  successIconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(16, 185, 129, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  successTitle: { ...TYPOGRAPHY.h2, color: COLORS.success, marginBottom: 10, textAlign: 'center' },
  successSubtitle: { color: COLORS.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 30 },
  successDetails: { width: '100%', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 15, marginBottom: 30 },
  successRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  successLabel: { color: COLORS.textSecondary, fontSize: 13 },
  successValue: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  backHomeButton: { backgroundColor: COLORS.primary, width: '100%', padding: 16, borderRadius: 12, alignItems: 'center' },
  backHomeButtonText: { color: COLORS.text, fontSize: 16, fontWeight: '800' }
});
