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
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

const DEMO_PASSWORD = 'P@ssw0rd123!';

const DEMO_USERS = {
  hospital: [
    { username: 'medoff', role: 'medical_officer' },
    { username: 'staff1', role: 'viewer' },
    { username: 'approver', role: 'approver' },
    { username: 'admin', role: 'admin_hospital' }
  ],
  service: [
    { username: 'biomed', role: 'biomedical_engineer' },
    { username: 'mechanic', role: 'mechanic' },
    { username: 'head_mechanic', role: 'head_of_mechanic' },
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

export function LoginScreen() {
  const { login } = useAuth();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
              <Ionicons name="close" size={40} color={COLORS.white} style={{ transform: [{ rotate: '45deg' }] }} />
            </View>
            <Text style={styles.title}>Mybaiki</Text>
            <Text style={styles.subtitle}>Asset maintenance, simplified.</Text>
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
          </View>

          <View style={styles.demoSection}>
            <View style={styles.demoDivider}>
              <View style={styles.dividerLine} />
              <Text style={styles.demoLabel}>DEMO ROLE SELECTION</Text>
              <View style={styles.dividerLine} />
            </View>
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
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white
  },
  keyboardView: {
    flex: 1
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    paddingHorizontal: 32,
    paddingTop: 48,
    paddingBottom: 48
  },
  header: {
    marginBottom: 40
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.slate[900],
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.slate[500]
  },
  form: {
    gap: 16
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
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 16
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
    gap: 24
  },
  demoDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
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
