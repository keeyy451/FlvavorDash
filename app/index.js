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
import Animated, { 
  FadeInDown, 
  FadeInRight, 
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import products from '../data/products';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from '../constants/Theme';

export default function CatalogScreen() {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const { width } = useWindowDimensions();

  // Optimized for horizontal cards (Soal 1)
  const { numColumns, horizontalPadding } = useMemo(() => {
    if (width > 900) return { numColumns: 2, horizontalPadding: width * 0.1 };
    return { numColumns: 1, horizontalPadding: SPACING.lg };
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
      <Animated.View entering={FadeInDown.duration(800)} style={styles.topBar}>
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
            color={COLORS.text} 
            style={{ marginRight: 6 }}
          />
          <Text style={styles.authButtonText}>{isAuthenticated ? 'Logout' : 'Login'}</Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200)} style={styles.heroWrapper}>
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop' }}
          style={styles.heroBackground}
          imageStyle={{ borderRadius: RADIUS.lg }}
        >
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>Katalog Makanan{'\n'}Terbaik Untukmu</Text>
            <View style={styles.theoryBadge}>
              <Ionicons name="school-outline" size={12} color={COLORS.accent} />
              <Text style={styles.theoryText}>Analisis Responsivitas Aktif</Text>
            </View>
          </View>
        </ImageBackground>
      </Animated.View>

      <View style={styles.categoryWrapper}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInRight.delay(300 + (index * 100))}>
              <TouchableOpacity
                style={[styles.categoryChip, selectedCategory === item && styles.categoryChipActive]}
                onPress={() => setSelectedCategory(item)}
              >
                <Text style={[styles.categoryChipText, selectedCategory === item && styles.categoryChipTextActive]}>
                  {item}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <FlatList
        key={`${numColumns}`}
        numColumns={numColumns}
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <Animated.View 
            entering={FadeInDown.delay(400 + (index * 50))}
            style={{ flex: 1, paddingHorizontal: 4 }}
          >
            <ProductCard product={item} onPress={handleProductPress} />
          </Animated.View>
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
  authButtonText: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  heroWrapper: { marginBottom: SPACING.lg },
  heroBackground: { height: 160, overflow: 'hidden', borderRadius: RADIUS.lg },
  heroOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', padding: SPACING.lg, justifyContent: 'center' },
  heroTitle: { ...TYPOGRAPHY.h2, color: COLORS.text },
  theoryBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 8, backgroundColor: 'rgba(0,0,0,0.3)', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  theoryText: { color: COLORS.accent, fontSize: 10, fontWeight: '700', marginLeft: 4 },
  categoryWrapper: { marginBottom: SPACING.sm },
  categoryChip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: RADIUS.md, backgroundColor: COLORS.surface, marginRight: 10, borderWidth: 1, borderColor: COLORS.glassBorder },
  categoryChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  categoryChipText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '700' },
  categoryChipTextActive: { color: COLORS.text },
});
