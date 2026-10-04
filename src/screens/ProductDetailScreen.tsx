import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchProduct } from '../api/products';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

export const ProductDetailScreen: React.FC<any> = ({ route, navigation }) => {
  const productId = route?.params?.productId;
  const { addToCart, cart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAdding, setIsAdding] = useState<boolean>(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchProduct(productId);
        setProduct(data);
      } catch (err) {
        Alert.alert('Error', 'Could not load product details.');
        navigation.goBack();
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [productId, navigation]);

  const handleAddToCart = async () => {
    if (!product) return;
    setIsAdding(true);
    try {
      await addToCart(product.id, quantity);
      Alert.alert(
        'Added to Cart',
        `Added ${quantity}x "${product.name}" to your cart. Changes will immediately sync to the website.`,
        [
          { text: 'Keep Shopping', style: 'cancel' },
          { text: 'View Cart', onPress: () => navigation.navigate('CartTab') },
        ]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to add item to cart.');
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading || !product) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  const inCartItem = cart.items.find(i => i.product_id === product.id);

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.navbarTitle}>Product Details</Text>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.navigate('CartTab')}
          activeOpacity={0.7}
        >
          <Ionicons name="cart-outline" size={22} color="#0F172A" />
          {cart.total_count > 0 && (
            <View style={styles.navBadge}>
              <Text style={styles.navBadgeText}>{cart.total_count}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Large Image Preview */}
        <View style={styles.imageCard}>
          <Image
            source={{ uri: product.image_url }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          {product.is_featured && (
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredBadgeText}>Featured Choice</Text>
            </View>
          )}
        </View>

        {/* Details Card */}
        <View style={styles.content}>
          <View style={styles.badgeRow}>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={styles.ratingBadgeText}>{product.rating.toFixed(1)}</Text>
              <Text style={styles.ratingCount}>({product.reviews_count} reviews)</Text>
            </View>

            <View style={styles.stockBadge}>
              <Ionicons name="cube-outline" size={14} color="#059669" />
              <Text style={styles.stockBadgeText}>{product.stock} in stock</Text>
            </View>
          </View>

          <Text style={styles.title}>{product.name}</Text>
          <Text style={styles.price}>${product.price.toFixed(2)}</Text>

          {inCartItem && (
            <View style={styles.alreadyInCartBox}>
              <Ionicons name="information-circle" size={16} color="#2563EB" />
              <Text style={styles.alreadyInCartText}>
                You have {inCartItem.quantity} of this item in your synchronized cart.
              </Text>
            </View>
          )}

          <Text style={styles.sectionHeader}>Description</Text>
          <Text style={styles.description}>{product.description}</Text>

          <Text style={styles.sectionHeader}>Quantity</Text>
          <View style={styles.qtyRow}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >
              <Ionicons name="remove" size={18} color={quantity <= 1 ? '#CBD5E1' : '#0F172A'} />
            </TouchableOpacity>

            <Text style={styles.qtyText}>{quantity}</Text>

            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => setQuantity(Math.min(product.stock, quantity + 1))}
              disabled={quantity >= product.stock}
            >
              <Ionicons
                name="add"
                size={18}
                color={quantity >= product.stock ? '#CBD5E1' : '#0F172A'}
              />
            </TouchableOpacity>

            <Text style={styles.qtySubtotal}>
              Subtotal: ${(product.price * quantity).toFixed(2)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.totalLabel}>Total Price</Text>
          <Text style={styles.totalPrice}>${(product.price * quantity).toFixed(2)}</Text>
        </View>

        <TouchableOpacity
          style={[styles.addToCartBtn, isAdding && styles.btnDisabled]}
          onPress={handleAddToCart}
          disabled={isAdding}
          activeOpacity={0.85}
        >
          {isAdding ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Ionicons name="cart" size={20} color="#FFFFFF" />
              <Text style={styles.addToCartBtnText}>Add to Cart</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  navbarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  navBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#2563EB',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  navBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imageCard: {
    width: '100%',
    height: 280,
    backgroundColor: '#F1F5F9',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  featuredBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#2563EB',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  featuredBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  content: {
    padding: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ratingBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  ratingCount: {
    fontSize: 11,
    color: '#B45309',
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  stockBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#065F46',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 28,
    marginBottom: 8,
  },
  price: {
    fontSize: 26,
    fontWeight: '900',
    color: '#2563EB',
    marginBottom: 16,
  },
  alreadyInCartBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EFF6FF',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 16,
  },
  alreadyInCartText: {
    fontSize: 12,
    color: '#1E40AF',
    flex: 1,
    fontWeight: '500',
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginTop: 12,
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 22,
    marginBottom: 16,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 6,
  },
  qtyBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  qtyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    minWidth: 24,
    textAlign: 'center',
  },
  qtySubtotal: {
    fontSize: 13,
    color: '#64748B',
    marginLeft: 'auto',
    fontWeight: '500',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 4,
  },
  totalLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  addToCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0F172A',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  addToCartBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  btnDisabled: {
    opacity: 0.6,
  },
});
