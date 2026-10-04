import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { submitCheckout } from '../api/orders';
import { Order } from '../types';

interface Props {
  navigation: any;
}

export const CheckoutScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const { cart, refreshCart } = useCart();

  const [customerName, setCustomerName] = useState(user?.name || 'Alex Rivera');
  const [customerEmail, setCustomerEmail] = useState(user?.email || 'alex.rivera@example.com');
  const [phone, setPhone] = useState('+1 (555) 234-5678');
  const [address, setAddress] = useState('742 Evergreen Terrace');
  const [city, setCity] = useState('Springfield');
  const [state, setState] = useState('OR');
  const [zip, setZip] = useState('97477');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  const handlePlaceOrder = async () => {
    if (!customerName.trim() || !customerEmail.trim() || !address.trim() || !city.trim() || !zip.trim()) {
      Alert.alert('Required Fields', 'Please fill in all shipping details to proceed.');
      return;
    }

    if (cart.items.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty. Add items before checking out.');
      return;
    }

    setIsSubmitting(true);
    try {
      const order = await submitCheckout({
        items: cart.items.map(it => ({
          product_id: it.product_id,
          quantity: it.quantity,
        })),
        customer_name: customerName.trim(),
        customer_email: customerEmail.trim(),
        customer_phone: phone.trim() || undefined,
        shipping_address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        postal_code: zip.trim(),
        country: 'United States',
        payment_method: 'VISA •••• 4242',
      });

      setPlacedOrder(order);
      await refreshCart(false);
    } catch (err: any) {
      Alert.alert('Checkout Failed', err.message || 'Could not complete order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (placedOrder) {
    return (
      <SafeAreaView style={styles.successContainer}>
        <View style={styles.successCard}>
          <View style={styles.successIconCircle}>
            <Ionicons name="checkmark-done" size={48} color="#059669" />
          </View>

          <Text style={styles.successTitle}>Order Confirmed!</Text>
          <Text style={styles.successOrderId}>ID: {placedOrder.id}</Text>
          <Text style={styles.successDesc}>
            Thank you, {placedOrder.customer_name}. A receipt has been registered and dispatched to{' '}
            <Text style={{ fontWeight: '700' }}>{placedOrder.customer_email}</Text>.
          </Text>

          <View style={styles.receiptBox}>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Total Amount</Text>
              <Text style={styles.receiptVal}>
                ${placedOrder.total_amount.toFixed(2)} {placedOrder.currency}
              </Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Status</Text>
              <Text style={styles.receiptStatus}>{placedOrder.status}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Payment</Text>
              <Text style={styles.receiptVal}>{placedOrder.payment_method}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.doneBtn}
            onPress={() => {
              setPlacedOrder(null);
              navigation.navigate('ProductsTab');
            }}
          >
            <Text style={styles.doneBtnText}>Continue Shopping</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.ordersLinkBtn}
            onPress={() => {
              setPlacedOrder(null);
              navigation.navigate('OrdersTab');
            }}
          >
            <Text style={styles.ordersLinkText}>View All Orders</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Order Summary Card */}
          <View style={styles.card}>
            <Text style={styles.cardHeader}>Order Summary ({cart.total_count} items)</Text>
            {cart.items.map(it => (
              <View key={it.product_id} style={styles.previewRow}>
                <Text style={styles.previewName} numberOfLines={1}>
                  {it.quantity}x {it.product.name}
                </Text>
                <Text style={styles.previewPrice}>
                  ${(it.product.price * it.quantity).toFixed(2)}
                </Text>
              </View>
            ))}

            <View style={styles.totalDivider} />

            <View style={styles.summaryRow}>
              <Text style={styles.sumLabel}>Subtotal</Text>
              <Text style={styles.sumVal}>${cart.subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.sumLabel}>Shipping</Text>
              <Text style={[styles.sumVal, cart.shipping_fee === 0 && styles.freeShipping]}>
                {cart.shipping_fee === 0 ? 'FREE' : `$${cart.shipping_fee.toFixed(2)}`}
              </Text>
            </View>
            <View style={[styles.summaryRow, { marginTop: 6 }]}>
              <Text style={styles.grandTotalLabel}>Total</Text>
              <Text style={styles.grandTotalVal}>${cart.total.toFixed(2)}</Text>
            </View>
          </View>

          {/* Shipping Details */}
          <View style={styles.card}>
            <Text style={styles.cardHeader}>Shipping Address</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Recipient Name *</Text>
              <TextInput
                style={styles.input}
                value={customerName}
                onChangeText={setCustomerName}
                placeholder="Full name"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Email Address *</Text>
              <TextInput
                style={styles.input}
                value={customerEmail}
                onChangeText={setCustomerEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Street Address *</Text>
              <TextInput
                style={styles.input}
                value={address}
                onChangeText={setAddress}
                placeholder="Street address or P.O. Box"
              />
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.formGroup, { flex: 2, marginRight: 8 }]}>
                <Text style={styles.label}>City *</Text>
                <TextInput style={styles.input} value={city} onChangeText={setCity} />
              </View>

              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>State *</Text>
                <TextInput style={styles.input} value={state} onChangeText={setState} />
              </View>

              <View style={[styles.formGroup, { flex: 1.5 }]}>
                <Text style={styles.label}>ZIP *</Text>
                <TextInput
                  style={styles.input}
                  value={zip}
                  onChangeText={setZip}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Payment Method Preview */}
          <View style={styles.card}>
            <Text style={styles.cardHeader}>Payment Method</Text>
            <View style={styles.paymentBox}>
              <Ionicons name="card" size={24} color="#2563EB" />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.paymentTitle}>Credit Card (Simulated)</Text>
                <Text style={styles.paymentSubtitle}>VISA ending in 4242</Text>
              </View>
              <Ionicons name="checkmark-circle" size={20} color="#059669" />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Place Order Bar */}
      <View style={styles.placeOrderBar}>
        <View>
          <Text style={styles.sumLabel}>Final Amount</Text>
          <Text style={styles.grandTotalVal}>${cart.total.toFixed(2)}</Text>
        </View>

        <TouchableOpacity
          style={[styles.placeBtn, isSubmitting && styles.placeBtnDisabled]}
          onPress={handlePlaceOrder}
          disabled={isSubmitting}
          activeOpacity={0.85}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Ionicons name="lock-closed" size={18} color="#FFFFFF" />
              <Text style={styles.placeBtnText}>Pay & Place Order</Text>
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
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
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
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
    gap: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  previewName: {
    fontSize: 13,
    color: '#475569',
    flex: 1,
    marginRight: 10,
  },
  previewPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  totalDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sumLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  sumVal: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },
  freeShipping: {
    color: '#059669',
    fontWeight: '700',
  },
  grandTotalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  grandTotalVal: {
    fontSize: 18,
    fontWeight: '900',
    color: '#2563EB',
  },
  formGroup: {
    marginBottom: 12,
  },
  rowInputs: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 14,
    color: '#0F172A',
  },
  paymentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  paymentTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E40AF',
  },
  paymentSubtitle: {
    fontSize: 11,
    color: '#3B82F6',
  },
  placeOrderBar: {
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
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 4,
  },
  placeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0F172A',
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 12,
  },
  placeBtnDisabled: {
    opacity: 0.6,
  },
  placeBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  successContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  successIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  successOrderId: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 12,
  },
  successDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  receiptBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  receiptLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  receiptVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  receiptStatus: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  doneBtn: {
    width: '100%',
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  ordersLinkBtn: {
    paddingVertical: 8,
  },
  ordersLinkText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
});
