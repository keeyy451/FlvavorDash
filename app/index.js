import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  useWindowDimensions,
  ImageBackground,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import products from '../data/products';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from '../constants/Theme';

export default function CatalogScreen() {
  const router = useRouter();
  const { isAuthenticated, logout, user, orders } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const { width } = useWindowDimensions();

  const { numColumns, horizontalPadding } = useMemo(() => {
    if (width > 1200) return { numColumns: 4, horizontalPadding: width * 0.1 };
    if (width > 900) return { numColumns: 3, horizontalPadding: width * 0.05 };
    if (width > 600) return { numColumns: 2, horizontalPadding: SPACING.lg };
    return { numColumns: 1, horizontalPadding: SPACING.md };
  }, [width]);

  const categories = useMemo(() => ['Semua', ...new Set(products.map((p) => p.category))], []);

  const filteredProducts = useMemo(() => 
    selectedCategory === 'Semua'
      ? products
      : products.filter((p) => p.category === selectedCategory),
    [selectedCategory]
  );

  const handleProductPress = (product) => {
    router.push({
      pathname: '/order-detail',
      params: { productId: product.id },
    });
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.topBar}>
        <View style={styles.brandContainer}>
          <View style={styles.logoCircle}>
            <Ionicons name="flash" size={24} color={COLORS.primary} />
          </View>
          <View>
            <Text style={styles.brandName}>FlavorDash</Text>
            <Text style={styles.locationText}>Premium Delivery</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.authButton, isAuthenticated ? styles.logoutButton : styles.loginButton]}
          onPress={() => isAuthenticated ? logout() : router.push('/login')}
        >
          <Ionicons 
            name={isAuthenticated ? "log-out-outline" : "person-outline"} 
            size={18} 
            color={isAuthenticated ? COLORS.error : '#FFFFFF'} 
            style={{ marginRight: 6 }}
          />
          <Text style={[styles.authButtonText, isAuthenticated && { color: COLORS.error }]}>
            {isAuthenticated ? 'Logout' : 'Login'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.heroWrapper}>
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop' }}
          style={styles.heroBackground}
          imageStyle={{ borderRadius: RADIUS.lg }}
        >
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>Katalog Makanan{'\n'}Terbaik Untukmu</Text>
            <View style={styles.promoBadge}>
              <Ionicons name="star" size={12} color={COLORS.accent} />
              <Text style={styles.promoText}>Pilihan Teratas</Text>
            </View>
          </View>
        </ImageBackground>
      </View>

      <View style={styles.categoryWrapper}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.categoryChip, selectedCategory === item && styles.categoryChipActive]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text style={[styles.categoryChipText, selectedCategory === item && styles.categoryChipTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );

  // ============================================================
  // TAMPILAN KHUSUS DRIVER
  // ============================================================
  if (user?.role === 'driver') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.headerContainer}>
          <View style={styles.topBar}>
            <View style={styles.brandContainer}>
              <View style={styles.logoCircle}>
                <Ionicons name="bicycle" size={24} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.brandName}>Driver Dashboard</Text>
                <Text style={styles.locationText}>{user.name}</Text>
              </View>
            </View>
            <TouchableOpacity style={[styles.authButton, styles.logoutButton]} onPress={logout}>
              <Ionicons name="log-out-outline" size={18} color={COLORS.error} style={{ marginRight: 6 }} />
              <Text style={[styles.authButtonText, { color: COLORS.error }]}>Logout</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={[TYPOGRAPHY.h3, { paddingHorizontal: SPACING.md, marginBottom: SPACING.md, color: COLORS.text }]}>
            Pesanan Aktif ({orders.length})
          </Text>
        </View>

        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.deliveryCard}
              onPress={() => router.push({
                pathname: '/order-detail',
                params: { orderId: item.id, productId: item.product.id },
              })}
            >
              <View style={styles.deliveryIconCircle}>
                <Ionicons name="cube-outline" size={24} color={COLORS.primary} />
              </View>
              <View style={styles.deliveryInfo}>
                <Text style={styles.deliveryTitle}>Order #{item.id.slice(-4)}</Text>
                <Text style={styles.deliverySubtitle}>1x {item.product.name}</Text>
                <Text style={styles.deliveryDest}>Pemesan: {item.customerName}</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingHorizontal: SPACING.md }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 80 }}>
              <Ionicons name="receipt-outline" size={64} color={COLORS.glassBorder} />
              <Text style={{ color: COLORS.textMuted, marginTop: 16, fontSize: 16 }}>Belum ada pesanan masuk</Text>
            </View>
          }
        />
      </SafeAreaView>
    );
  }

  // ============================================================
  // TAMPILAN KHUSUS CUSTOMER / GUEST
  // ============================================================
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <FlatList
        key={`${numColumns}`}
        numColumns={numColumns}
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ flex: 1, paddingHorizontal: 4 }}>
            <ProductCard product={item} onPress={handleProductPress} />
          </View>
        )}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={<View style={{ height: 40 }} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.listContent, { paddingHorizontal: horizontalPadding }]}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  listContent: { paddingBottom: SPACING.xl },
  headerContainer: { paddingTop: SPACING.md, marginBottom: SPACING.lg },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xl },
  brandContainer: { flexDirection: 'row', alignItems: 'center' },
  logoCircle: {
    width: 44, height: 44, borderRadius: RADIUS.md, backgroundColor: COLORS.surface,
    justifyContent: 'center', alignItems: 'center', marginRight: 12, borderWidth: 1, borderColor: COLORS.glassBorder
  },
  brandName: { ...TYPOGRAPHY.h3, color: COLORS.text },
  locationText: { fontSize: 11, color: COLORS.textSecondary },
  authButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: RADIUS.lg },
  loginButton: { backgroundColor: COLORS.primary },
  logoutButton: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.glassBorder },
  authButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  heroWrapper: { marginBottom: SPACING.lg },
  heroBackground: { height: 160, overflow: 'hidden', borderRadius: RADIUS.lg },
  heroOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', padding: SPACING.lg, justifyContent: 'center' },
  heroTitle: { ...TYPOGRAPHY.h2, color: '#FFFFFF' },
  promoBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 8, backgroundColor: 'rgba(0,0,0,0.3)', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  promoText: { color: COLORS.accent, fontSize: 10, fontWeight: '700', marginLeft: 4 },
  categoryWrapper: { marginBottom: SPACING.sm },
  categoryChip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: RADIUS.md, backgroundColor: COLORS.surface, marginRight: 10, borderWidth: 1, borderColor: COLORS.glassBorder },
  categoryChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  categoryChipText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '700' },
  categoryChipTextActive: { color: '#FFFFFF' },
  
  // Driver Styles
  deliveryCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, padding: SPACING.md, borderRadius: RADIUS.md, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.glassBorder, ...SHADOWS.small },
  deliveryIconCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255, 90, 95, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
  deliveryInfo: { flex: 1 },
  deliveryTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700', marginBottom: 2 },
  deliverySubtitle: { color: COLORS.textSecondary, fontSize: 14, marginBottom: 4 },
  deliveryDest: { color: COLORS.primary, fontSize: 12, fontWeight: '600' },
});
