import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CartItem } from '../types';

interface Props {
  navigation: any;
}

export const CartScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const { cart, isLoading, isSyncing, lastSyncedAt, updateQuantity, removeFromCart, clearCart, refreshCart } = useCart();
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const handleUpdateQty = async (productId: number, newQty: number) => {
    setUpdatingId(productId);
    try {
      await updateQuantity(productId, newQty);
    } catch (err: any) {
      Alert.alert('Update Failed', err.message || 'Could not update item quantity.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = (item: CartItem) => {
    Alert.alert(
      'Remove Item',
      `Remove "${item.product.name}" from your cart?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setUpdatingId(item.product_id);
            try {
              await removeFromCart(item.product_id);
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Could not remove item.');
            } finally {
              setUpdatingId(null);
            }
          },
        },
      ]
    );
  };

  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to empty your entire cart? This will also clear your cart on the website.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearCart();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Could not clear cart.');
            }
          },
        },
      ]
    );
  };

  const renderCartItem = ({ item }: { item: CartItem }) => {
    const isBusy = updatingId === item.product_id;

    return (
      <View style={styles.itemCard}>
        <Image
          source={{ uri: item.product.image_url }}
          style={styles.itemImage}
          resizeMode="cover"
        />

        <View style={styles.itemDetails}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemName} numberOfLines={1}>
              {item.product.name}
            </Text>
            <TouchableOpacity
              onPress={() => handleRemove(item)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.trashBtn}
            >
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
            </TouchableOpacity>
          </View>

          <Text style={styles.itemUnitPrice}>${item.product.price.toFixed(2)} each</Text>

          <View style={styles.itemActionRow}>
            {/* Quantity Stepper */}
            <View style={styles.stepperContainer}>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => handleUpdateQty(item.product_id, item.quantity - 1)}
                disabled={isBusy}
              >
                <Ionicons name="remove" size={14} color="#0F172A" />
              </TouchableOpacity>

              {isBusy ? (
                <ActivityIndicator size="small" color="#2563EB" style={styles.busyIndicator} />
              ) : (
                <Text style={styles.stepperQty}>{item.quantity}</Text>
              )}

              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => handleUpdateQty(item.product_id, item.quantity + 1)}
                disabled={isBusy || item.quantity >= item.product.stock}
              >
                <Ionicons
                  name="add"
                  size={14}
                  color={item.quantity >= item.product.stock ? '#CBD5E1' : '#0F172A'}
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.itemSubtotal}>
              ${(item.product.price * item.quantity).toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const formattedTime = lastSyncedAt
    ? lastSyncedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : 'Connecting...';

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.pageTitle}>Shopping Cart</Text>
          <Text style={styles.pageSubtitle}>
            {cart.total_count} {cart.total_count === 1 ? 'item' : 'items'}
          </Text>
        </View>

        {cart.items.length > 0 && (
          <TouchableOpacity onPress={handleClearCart} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>Clear Cart</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Sync Status Banner */}
      <View style={styles.syncCard}>
        <View style={styles.syncCardLeft}>
          <View style={[styles.pulseDot, isSyncing && styles.pulseDotSyncing]} />
          <View>
            <Text style={styles.syncTitle}>
              {isSyncing ? 'Synchronizing with Website...' : 'Synced with Website Storefront'}
            </Text>
            <Text style={styles.syncSubtitle}>
              Logged in as {user?.email} • Last checked: {formattedTime}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => refreshCart(false)}
          style={styles.refreshSyncBtn}
          disabled={isSyncing}
        >
          <Ionicons
            name="refresh"
            size={16}
            color="#2563EB"
            style={isSyncing ? styles.rotating : undefined}
          />
        </TouchableOpacity>
      </View>

      {isLoading && cart.items.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Fetching synchronized cart...</Text>
        </View>
      ) : cart.items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="cart-outline" size={54} color="#94A3B8" />
          </View>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>
            Items added on either the website or this mobile app will appear here instantly.
          </Text>

          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => navigation.navigate('ProductsTab')}
            activeOpacity={0.85}
          >
            <Ionicons name="sparkles-outline" size={18} color="#FFFFFF" />
            <Text style={styles.exploreBtnText}>Explore Catalog</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cart.items}
            keyExtractor={item => item.product_id.toString()}
            renderItem={renderCartItem}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={isSyncing} onRefresh={() => refreshCart(false)} />
            }
          />

          {/* Checkout & Summary Bottom Bar */}
          <View style={styles.summaryBar}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryVal}>${cart.subtotal.toFixed(2)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping (Free over $50)</Text>
              <Text style={[styles.summaryVal, cart.shipping_fee === 0 && styles.freeShipping]}>
                {cart.shipping_fee === 0 ? 'FREE' : `$${cart.shipping_fee.toFixed(2)}`}
              </Text>
            </View>

            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>${cart.total.toFixed(2)}</Text>
            </View>

            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={() => navigation.navigate('Checkout')}
              activeOpacity={0.85}
            >
              <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  pageSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
    fontWeight: '500',
  },
  clearBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
  },
  clearBtnText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '700',
  },
  syncCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ECFDF5',
    borderBottomWidth: 1,
    borderBottomColor: '#A7F3D0',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  syncCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
  },
  pulseDotSyncing: {
    backgroundColor: '#3B82F6',
  },
  syncTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
  },
  syncSubtitle: {
    fontSize: 10,
    color: '#047857',
    marginTop: 1,
  },
  refreshSyncBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  rotating: {
    transform: [{ rotate: '45deg' }],
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
    marginBottom: 10,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  trashBtn: {
    padding: 2,
  },
  itemUnitPrice: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  itemActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stepperBtn: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperQty: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    minWidth: 24,
    textAlign: 'center',
  },
  busyIndicator: {
    width: 24,
  },
  itemSubtotal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 10,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0F172A',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  summaryBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  summaryVal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  freeShipping: {
    color: '#059669',
    fontWeight: '700',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
    marginTop: 4,
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '900',
    color: '#2563EB',
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 12,
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
