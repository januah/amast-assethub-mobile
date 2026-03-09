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
  Image,
  Dimensions,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_FAMILY, FONT_FAMILY_BOLD } from '../constants/theme';

const appConfig = require('../../app.json');
const APP_VERSION = `v${appConfig?.expo?.version ?? '1.0.0'}`;
import { useAuth } from '../context/AuthContext';
import { AnimatedScreen } from '../components/AnimatedScreen';

const DEMO_PASSWORD = 'P@ssw0rd123!';

const DEMO_USERS = {
  hospital: [
    { username: 'admin', role: 'admin_hospital' },
    { username: 'medoff', role: 'medical_officer' },
    { username: 'approver', role: 'approver' }
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
  const [showDemoModal, setShowDemoModal] = useState(false);

  const handleDemoSelect = (username: string) => {
    setUserId(username);
    setPassword(DEMO_PASSWORD);
    setError('');
    setShowDemoModal(false);
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

  const { height: windowHeight } = Dimensions.get('window');
  return (
    <View style={[styles.root, { minHeight: windowHeight }]}>
      <ImageBackground
        source={require('../../assets/bg_blue_2.png')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <AnimatedScreen style={styles.animatedWrap}>
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
              <Image
                source={require('../../assets/adaptive-icon.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
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
            <Text style={styles.footer}> © AMAST SDN BHD — {APP_VERSION}</Text>
          </View>

          <View style={styles.demoSection}>
            <TouchableOpacity
              style={styles.demoTriggerBtn}
              onPress={() => setShowDemoModal(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="person-circle-outline" size={20} color={COLORS.slate[600]} />
              <Text style={styles.demoTriggerText}>Use demo account</Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.slate[400]} />
            </TouchableOpacity>
          </View>

          <Modal
            visible={showDemoModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowDemoModal(false)}
          >
            <Pressable style={styles.demoModalOverlay} onPress={() => setShowDemoModal(false)}>
              <Pressable style={styles.demoModalContent} onPress={(e) => e.stopPropagation()}>
                <View style={styles.demoModalHeader}>
                  <Text style={styles.demoModalTitle}>Select demo role</Text>
                  <TouchableOpacity
                    onPress={() => setShowDemoModal(false)}
                    style={styles.demoModalClose}
                    hitSlop={12}
                  >
                    <Ionicons name="close" size={24} color={COLORS.slate[600]} />
                  </TouchableOpacity>
                </View>
                <ScrollView
                  style={styles.demoModalScroll}
                  contentContainerStyle={styles.demoModalScrollContent}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
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
                </ScrollView>
              </Pressable>
            </Pressable>
          </Modal>
          </ScrollView>
        </KeyboardAvoidingView>
        </AnimatedScreen>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  animatedWrap: {
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
    fontFamily: FONT_FAMILY,
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
    overflow: 'hidden',
    shadowColor: COLORS.slate[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6
  },
  logoImage: {
    width: 120,
    height: 120
  },
  title: {
    fontSize: 28,
    fontFamily: FONT_FAMILY_BOLD,
    fontWeight: '900',
    color: COLORS.white,
    marginBottom: 4
  },
  subtitle: {
    fontSize: 14,
    fontFamily: FONT_FAMILY,
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
    fontFamily: FONT_FAMILY_BOLD,
    fontWeight: '600',
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
    fontSize: 16,
    fontFamily: FONT_FAMILY
  },
  errorWrap: {
    marginTop: 4,
    paddingHorizontal: 4
  },
  errorText: {
    fontSize: 12,
    fontFamily: FONT_FAMILY,
    color: COLORS.danger,
    fontWeight: '600'
  },
  forgotLink: {
    fontSize: 10,
    fontFamily: FONT_FAMILY_BOLD,
    fontWeight: '600',
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
    fontFamily: FONT_FAMILY_BOLD,
    fontWeight: '600'
  },
  demoSection: {
    marginTop: 32,
    width: '100%',
    maxWidth: 380,
    alignSelf: 'center',
  },
  demoTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.slate[200],
  },
  demoTriggerText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.slate[700],
  },
  demoModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  demoModalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  demoModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate[100],
  },
  demoModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.slate[900],
  },
  demoModalClose: {
    padding: 4,
  },
  demoModalScroll: {
    maxHeight: 420,
  },
  demoModalScrollContent: {
    padding: 20,
    paddingBottom: 28,
    // gap: 24,
  },
  roleSection: {
    gap: 8,
    marginBottom: 24,
  },
  roleSectionTitle: {
    fontSize: 10,
    fontFamily: FONT_FAMILY_BOLD,
    fontWeight: '600',
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
    fontFamily: FONT_FAMILY,
    fontWeight: '600',
    color: COLORS.slate[700]
  }
});
