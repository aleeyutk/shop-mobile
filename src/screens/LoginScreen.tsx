import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { getApiBaseUrl, setApiBaseUrl, DEFAULT_API_BASE_URL } from '../config';

export const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('alex.rivera@example.com');
  const [name, setName] = useState('Alex Rivera');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_BASE_URL);

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert('Validation Error', 'Please enter your email address.');
      return;
    }
    setIsSubmitting(true);
    try {
      await login(email.trim(), name.trim() || undefined);
    } catch (err: any) {
      Alert.alert('Sign In Failed', err.message || 'Could not sign in to the server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = async () => {
    setEmail('alex.rivera@example.com');
    setName('Alex Rivera');
    setIsSubmitting(true);
    try {
      await login('alex.rivera@example.com', 'Alex Rivera');
    } catch (err: any) {
      Alert.alert('Demo Sign In Failed', err.message || 'Could not sign in to demo account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveApiUrl = async () => {
    try {
      await setApiBaseUrl(apiUrl);
      Alert.alert('Saved', `API Base URL updated to:\n${apiUrl}`);
      setShowConfig(false);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.brandContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="bag-handle" size={40} color="#2563EB" />
          </View>
          <Text style={styles.brandTitle}>NovaShop</Text>
          <Text style={styles.brandSubtitle}>HNG 15 Mobile Companion</Text>
          <View style={styles.syncBadge}>
            <Ionicons name="sync" size={14} color="#059669" />
            <Text style={styles.syncBadgeText}>Instant Web & Mobile Cart Sync</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardHeader}>Sign In</Text>
          <Text style={styles.cardDescription}>
            Log in with the same account as the web store to sync your cart in real-time.
          </Text>

          {/* Quick 1-Click Demo Login */}
          <TouchableOpacity
            style={styles.demoButton}
            onPress={handleQuickDemo}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            <Ionicons name="flash" size={18} color="#D97706" />
            <View style={styles.demoButtonTextCol}>
              <Text style={styles.demoButtonTitle}>1-Click Demo Login</Text>
              <Text style={styles.demoButtonSubtitle}>alex.rivera@example.com (Alex Rivera)</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or continue with email</Text>
            <View style={styles.divider} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name (Optional)</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={18} color="#94A3B8" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Aliyu Tukur"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#94A3B8"
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={18} color="#94A3B8" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="name@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, isSubmitting && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Text style={styles.primaryButtonText}>Continue to Shop</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Server Config Toggle */}
        <TouchableOpacity
          style={styles.configToggle}
          onPress={() => setShowConfig(!showConfig)}
          activeOpacity={0.7}
        >
          <Ionicons name="server-outline" size={14} color="#64748B" />
          <Text style={styles.configToggleText}>
            Server: {apiUrl.replace('https://', '')}
          </Text>
          <Ionicons
            name={showConfig ? 'chevron-up' : 'chevron-down'}
            size={14}
            color="#64748B"
          />
        </TouchableOpacity>

        {showConfig && (
          <View style={styles.configBox}>
            <Text style={styles.configLabel}>API Endpoint URL</Text>
            <TextInput
              style={styles.configInput}
              value={apiUrl}
              onChangeText={setApiUrl}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity style={styles.configSaveBtn} onPress={handleSaveApiUrl}>
              <Text style={styles.configSaveBtnText}>Save API Server</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 12,
  },
  syncBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#065F46',
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardHeader: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 20,
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderColor: '#FCD34D',
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
    gap: 12,
    marginBottom: 16,
  },
  demoButtonTextCol: {
    flex: 1,
  },
  demoButtonTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
  },
  demoButtonSubtitle: {
    fontSize: 11,
    color: '#B45309',
    marginTop: 1,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: 11,
    color: '#94A3B8',
    paddingHorizontal: 10,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    height: 48,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 2,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  configToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  configToggleText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  configBox: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 10,
  },
  configLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  configInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 38,
    fontSize: 12,
    color: '#0F172A',
    marginBottom: 10,
  },
  configSaveBtn: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  configSaveBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
