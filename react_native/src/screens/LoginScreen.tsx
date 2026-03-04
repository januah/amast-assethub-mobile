import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

const appConfig = require('../../app.json');
const APP_VERSION = `v${appConfig?.expo?.version ?? '1.0.0'}`;
import { useAuth } from '../context/AuthContext';

const DEMO_PASSWORD = 'P@ssw0rd123!';

const DEMO_USERS = {
  hospital: [
    { username: 'medoff', role: 'medical_officer' },
    { username: 'approver', role: 'approver' },
    { username: 'admin', role: 'admin_hospital' }
  ],
  service: [
    { username: 'biomed', role: 'biomed_engineer' },
    { username: 'mechanic', role: 'mechanic' },
    { username: 'head_mechanic', role: 'head_mechanic' },
    { username: 'tow', role: 'tow_truck' },
    { username: 'driver', role: 'driver_ambulance' }
  ],
  system: [
    { username: 'superadmin', role: 'superadmin' }
  ]
};

function DemoUserSection({
  title,
  users,
  onSelect
}: {
  title: string;
  users: { username: string; role: string }[];
  onSelect: (username: string) => void;
}) {
  return (
    <View style={styles.roleSection}>
      <Text style={styles.roleSectionTitle}>{title}</Text>
      <View style={styles.roleChipContainer}>
        {users.map((u) => (
          <Pressable
            key={u.username}
            onPress={() => onSelect(u.username)}
            style={({ pressed }) => [
              styles.roleChip,
              pressed && styles.roleChipPressed
            ]}
          >
            <Text style={styles.roleChipText}>{u.role}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

interface LoginScreenProps {
  onOpenSettings?: () => void;
}

export function LoginScreen({ onOpenSettings }: LoginScreenProps) {
  const { login } = useAuth();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDemoRoles, setShowDemoRoles] = useState(false);

  const handleDemoSelect = (username: string) => {
    setUserId(username);
    setPassword(DEMO_PASSWORD);
    setError('');
  };

  const handleLogin = async () => {
    setError('');
    if (!userId.trim()) {
      setError('Username or email is required');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }
    setLoading(true);
    const res = await login(userId.trim(), password);
    setLoading(false);
    if (res.success) return;
    setError(res.message || 'Login failed');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ImageBackground source={require('../../assets/bg_blue_2.png')} style={styles.bgImage} resizeMode="cover">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logoIconWrap}>
                <Ionicons name="cube-outline" size={32} color={COLORS.primary} />
                <View style={styles.logoBadge}>
                  <Ionicons name="checkmark-done" size={14} color={COLORS.white} />
                </View>
              </View>
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title}>AssetHub</Text>
              <Text style={styles.subtitle}>Asset maintenance, simplified.</Text>
            </View>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>USERNAME OR EMAIL</Text>
              <TextInput
                style={styles.input}
                value={userId}
                onChangeText={(t) => { setUserId(t); setError(''); }}
                placeholder="Enter your username or email"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="username"
                editable={!loading}
              />
            </View>
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>PASSWORD</Text>
                {/* <TouchableOpacity activeOpacity={0.7} disabled={loading}>
                  <Text style={styles.forgotLink}>Forgot Password?</Text>
                </TouchableOpacity> */}
              </View>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={(t) => { setPassword(t); setError(''); }}
                placeholder="Enter your password"
                secureTextEntry
                autoComplete="password"
                editable={!loading}
              />
            </View>
            {error ? (
              <View style={styles.errorWrap}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.loginRow}>
              <TouchableOpacity
                style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                onPress={handleLogin}
                activeOpacity={0.8}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <Text style={styles.loginButtonText}>Login</Text>
                )}
              </TouchableOpacity>
              {onOpenSettings && (
                <TouchableOpacity
                  style={styles.settingsBtn}
                  onPress={onOpenSettings}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="settings-outline" size={22} color={COLORS.slate[600]} />
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.footer}>AMAST SDN BHD | {APP_VERSION}</Text>
          </View>

          <View style={styles.demoSection}>
            <Pressable
              style={({ pressed }) => [styles.demoHeader, pressed && styles.demoHeaderPressed]}
              onPress={() => setShowDemoRoles((v) => !v)}
            >
              <View style={styles.demoDivider}>
                <View style={styles.dividerLine} />
                <Text style={styles.demoLabel}>DEMO ROLE SELECTION</Text>
                <View style={styles.dividerLine} />
              </View>
              <View style={styles.demoChevronWrap}>
                <Ionicons
                  name={showDemoRoles ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={COLORS.slate[400]}
                />
              </View>
            </Pressable>
            {showDemoRoles && (
              <View style={styles.demoContent}>
                <DemoUserSection
                  title="Hospital Staff"
                  users={DEMO_USERS.hospital}
                  onSelect={handleDemoSelect}
                />
                <DemoUserSection
                  title="Service & Engineering"
                  users={DEMO_USERS.service}
                  onSelect={handleDemoSelect}
                />
                <DemoUserSection
                  title="System & Support"
                  users={DEMO_USERS.system}
                  onSelect={handleDemoSelect}
                />
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  bgImage: {
    flex: 1,
  },
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
  },
  settingsBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.slate[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyboardView: {
    flex: 1
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
    alignItems: 'center',
  },
  footer: {
    marginTop: 16,
    fontSize: 12,
    color: COLORS.slate[400],
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 40,
    width: '100%',
    maxWidth: 380,
    alignSelf: 'center',
  },
  headerText: {
    flex: 1
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.slate[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6
  },
  logoIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  logoBadge: {
    position: 'absolute',
    bottom: -2,
    right: -8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.emerald[500],
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.white,
    marginBottom: 4
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.white
  },
  form: {
    gap: 16,
    width: '100%',
    maxWidth: 380,
    alignSelf: 'center',
  },
  inputGroup: {
    gap: 8
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.slate[500],
    letterSpacing: 1.2,
    textTransform: 'uppercase'
  },
  input: {
    backgroundColor: COLORS.slate[50],
    borderWidth: 1,
    borderColor: COLORS.slate[200],
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16
  },
  errorWrap: {
    marginTop: 4,
    paddingHorizontal: 4
  },
  errorText: {
    fontSize: 12,
    color: COLORS.danger,
    fontWeight: '600'
  },
  forgotLink: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary
  },
  loginButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  loginButtonDisabled: {
    opacity: 0.7
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700'
  },
  demoSection: {
    marginTop: 48,
    paddingTop: 32,
    borderTopWidth: 1,
    borderTopColor: COLORS.slate[100],
    width: '100%',
    maxWidth: 380,
    alignSelf: 'center',
  },
  demoHeader: {
    paddingVertical: 4,
  },
  demoHeaderPressed: {
    opacity: 0.7,
  },
  demoContent: {
    marginTop: 20,
    gap: 24,
  },
  demoChevronWrap: {
    alignItems: 'center',
    marginTop: 8,
  },
  demoDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.slate[100]
  },
  demoLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.slate[400],
    letterSpacing: 2
  },
  roleSection: {
    gap: 8
  },
  roleSectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.slate[400],
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginLeft: 4
  },
  roleChipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  roleChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.slate[200],
    borderRadius: 12
  },
  roleChipPressed: {
    borderColor: COLORS.primary,
    backgroundColor: '#f0f9ff'
  },
  roleChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.slate[700]
  }
});
