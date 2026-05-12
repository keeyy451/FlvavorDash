import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from '../constants/Theme';

/**
 * SOAL 1: Implementasi Flexbox Row
 * Gambar berada di samping deskripsi secara proporsional.
 */
export default function ProductCard({ product, onPress }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  if (!product) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => onPress && onPress(product)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.touchable}
      >
        {/* Flexbox Row Container */}
        <View style={styles.row}>
          {/* Sisi Kiri: Gambar (Flex 1) */}
          <View style={styles.imageWrapper}>
            <Image 
              source={{ uri: product.image }} 
              style={styles.image} 
              resizeMode="cover"
            />
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{product.category}</Text>
            </View>
          </View>

          {/* Sisi Kanan: Deskripsi (Flex 1.5) */}
          <View style={styles.content}>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={12} color={COLORS.accent} />
              <Text style={styles.ratingText}>{product.rating}</Text>
              <Text style={styles.timeText}> • 20 min</Text>
            </View>

            <Text style={styles.title} numberOfLines={1}>{product.name}</Text>
            <Text style={styles.description} numberOfLines={2}>
              {product.description}
            </Text>

            <View style={styles.footer}>
              <Text style={styles.priceText}>Rp {product.price?.toLocaleString()}</Text>
              <View style={styles.addButton}>
                <Ionicons name="add" size={18} color={COLORS.text} />
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  touchable: {
    padding: 10,
  },
  row: {
    flexDirection: 'row', // Sesuai Soal 1: Row Layout
    alignItems: 'center',
  },
  imageWrapper: {
    flex: 1, // Proporsional sisi kiri
    height: 110,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 2,
    alignItems: 'center',
  },
  categoryBadgeText: {
    color: COLORS.text,
    fontSize: 8,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  content: {
    flex: 1.5, // Proporsional sisi kanan (lebih lebar untuk teks)
    paddingLeft: SPACING.md,
    justifyContent: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 3,
  },
  timeText: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
  title: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    fontSize: 16,
    marginBottom: 2,
  },
  description: {
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 16,
    marginBottom: SPACING.sm,
    height: 32,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '900',
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
