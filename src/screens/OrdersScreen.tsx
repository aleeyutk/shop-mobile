import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchOrders } from '../api/orders';
import { Order } from '../types';
import { useAuth } from '../context/AuthContext';

interface Props {
  navigation: any;
}

export const OrdersScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadOrders = useCallback(async () => {
    try {
      const data = await fetchOrders(user?.email);
      setOrders(data);
    } catch (err) {
      console.warn('Failed to fetch orders:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const renderOrderItem = ({ item }: { item: Order }) => {
    const formattedDate = new Date(item.created_at).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <View style={styles.orderCard}>
        {/* Order Header */}
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderId}>{item.id}</Text>
            <Text style={styles.orderDate}>{formattedDate}</Text>
          </View>
          <View style={styles.statusBadge}>
            <Ionicons name="checkmark-circle" size={12} color="#059669" />
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.itemsList}>
          {item.items.map(sub => (
            <View key={sub.id} style={styles.subItemRow}>
              <Image
                source={{ uri: sub.product_image }}
                style={styles.subItemImage}
                resizeMode="cover"
              />
              <View style={styles.subItemInfo}>
                <Text style={styles.subItemName} numberOfLines={1}>
                  {sub.product_name}
                </Text>
                <Text style={styles.subItemDetails}>
                  Qty: {sub.quantity} • ${sub.unit_price.toFixed(2)}
                </Text>
              </View>
              <Text style={styles.subItemTotal}>${sub.subtotal.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Order Footer */}
        <View style={styles.orderFooter}>
          <View>
            <Text style={styles.footerLabel}>Delivered To</Text>
            <Text style={styles.footerVal} numberOfLines={1}>
              {item.shipping_address}, {item.city}
            </Text>
          </View>

          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.footerLabel}>Order Total</Text>
            <Text style={styles.totalPrice}>
              ${item.total_amount.toFixed(2)} {item.currency}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navbar}>
        <Text style={styles.navbarTitle}>My Orders</Text>
        <Text style={styles.navbarSubtitle}>
          {orders.length} {orders.length === 1 ? 'order' : 'orders'} placed
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={item => item.id}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={54} color="#94A3B8" />
              <Text style={styles.emptyTitle}>No orders placed yet</Text>
              <Text style={styles.emptySubtitle}>
                Add items to your cart on either the web store or this mobile app to place your first order.
              </Text>
              <TouchableOpacity
                style={styles.browseBtn}
                onPress={() => navigation.navigate('ProductsTab')}
              >
                <Text style={styles.browseBtnText}>Browse Products</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  navbar: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  navbarTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  navbarSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  listContent: {
    padding: 16,
    gap: 14,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 12,
    marginBottom: 12,
  },
  orderId: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  orderDate: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
  },
  itemsList: {
    gap: 10,
    marginBottom: 12,
  },
  subItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subItemImage: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  subItemInfo: {
    flex: 1,
    marginLeft: 10,
  },
  subItemName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  subItemDetails: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  subItemTotal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  footerLabel: {
    fontSize: 10,
    color: '#94A3B8',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  footerVal: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
    maxWidth: 160,
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2563EB',
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
    paddingVertical: 80,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 16,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  browseBtn: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  browseBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
