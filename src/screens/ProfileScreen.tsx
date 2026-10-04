import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getApiBaseUrl, setApiBaseUrl } from '../config';

export const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const { cart, lastSyncedAt } = useCart();
  const [apiUrl, setApiUrl] = useState('');
  const [editingUrl, setEditingUrl] = useState(false);

  useEffect(() => {
    getApiBaseUrl().then(url => setApiUrl(url));
  }, []);

  const handleSaveUrl = async () => {
    if (!apiUrl.trim()) return;
    await setApiBaseUrl(apiUrl.trim());
    setEditingUrl(false);
    Alert.alert('Server Updated', `API Endpoint set to:\n${apiUrl.trim()}`);
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const avatar = user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=0D8ABC&color=fff`;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Card */}
        <View style={styles.profileCard}>
          <Image source={{ uri: avatar }} style={styles.avatar} />
          <Text style={styles.userName}>{user?.name || 'Shopper'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>

          <View style={styles.accountBadge}>
            <Ionicons name="shield-checkmark" size={14} color="#059669" />
            <Text style={styles.accountBadgeText}>Synchronized Account</Text>
          </View>
        </View>

        {/* Sync & Companion Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.cardHeader}>HNG 15 Lesson 3 Companion</Text>
          <Text style={styles.infoText}>
            This mobile app is bound directly to your shop backend. Any item added to cart on the
            web storefront immediately shows up in this app, and changes made here sync straight back
            to the web.
          </Text>

          <View style={styles.metricRow}>
            <View style={styles.metricCol}>
              <Text style={styles.metricNumber}>{cart.total_count}</Text>
              <Text style={styles.metricLabel}>Items in Cart</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricCol}>
              <Text style={styles.metricNumber}>${cart.total.toFixed(2)}</Text>
              <Text style={styles.metricLabel}>Cart Value</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricCol}>
              <Text style={styles.metricNumber}>2s</Text>
              <Text style={styles.metricLabel}>Sync Interval</Text>
            </View>
          </View>

          <View style={styles.syncStatusLine}>
            <View style={styles.greenDot} />
            <Text style={styles.syncStatusText}>
              Last synced: {lastSyncedAt ? lastSyncedAt.toLocaleTimeString() : 'Active'}
            </Text>
          </View>
        </View>

        {/* Server Configuration */}
        <View style={styles.infoCard}>
          <View style={styles.headerWithAction}>
            <Text style={styles.cardHeader}>Backend API Endpoint</Text>
            <TouchableOpacity onPress={() => setEditingUrl(!editingUrl)}>
              <Text style={styles.editActionText}>{editingUrl ? 'Cancel' : 'Edit'}</Text>
            </TouchableOpacity>
          </View>

          {editingUrl ? (
            <View style={styles.editBox}>
              <TextInput
                style={styles.urlInput}
                value={apiUrl}
                onChangeText={setApiUrl}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity style={styles.saveUrlBtn} onPress={handleSaveUrl}>
                <Text style={styles.saveUrlBtnText}>Save Endpoint</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.urlDisplayRow}>
              <Ionicons name="link" size={16} color="#64748B" />
              <Text style={styles.urlDisplayText} numberOfLines={1}>
                {apiUrl}
              </Text>
            </View>
          )}
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={18} color="#DC2626" />
          <Text style={styles.logoutBtnText}>Sign Out of Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EFF6FF',
    marginBottom: 12,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  userEmail: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  accountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  accountBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerWithAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 16,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 12,
  },
  metricCol: {
    alignItems: 'center',
  },
  metricNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },
  syncStatusLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  syncStatusText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '500',
  },
  editActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },
  urlDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
  },
  urlDisplayText: {
    fontSize: 12,
    color: '#334155',
    flex: 1,
    fontFamily: 'monospace',
  },
  editBox: {
    gap: 8,
  },
  urlInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
    fontSize: 12,
    color: '#0F172A',
  },
  saveUrlBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveUrlBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  logoutBtnText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '700',
  },
});
