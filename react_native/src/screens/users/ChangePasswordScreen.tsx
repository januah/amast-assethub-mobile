import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { AnimatedScreen } from '../../components/AnimatedScreen';
import { COLORS } from '../../constants/theme';
import { changePassword } from '../../api/authApi';

interface ChangePasswordScreenProps {
  onBack: () => void;
}

export function ChangePasswordScreen({ onBack }: ChangePasswordScreenProps) {
  const [form, setForm] = useState({ current: '', new: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async () => {
    if (loading) return;
    setError(null);
    if (!form.current.trim()) {
      setError('Current password is required');
      return;
    }
    if (!form.new.trim()) {
      setError('New password is required');
      return;
    }
    if (!form.confirm.trim()) {
      setError('Confirm password is required');
      return;
    }
    if (form.new !== form.confirm) {
      setError('New password and confirm password do not match');
      return;
    }
    setLoading(true);
    const res = await changePassword({
      currentPassword: form.current,
      newPassword: form.new,
      confirmPassword: form.confirm
    });
    setLoading(false);
    if (res.success) {
      setForm({ current: '', new: '', confirm: '' });
      onBack();
      return;
    }
    setError(res.message || 'Failed to change password');
  };

  return (
    <AnimatedScreen style={styles.container}>
      <Header title="Change Password" showBack onBack={onBack} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.tipBox}>
          <Ionicons name="information-circle-outline" size={20} color={COLORS.amber[600]} />
          <Text style={styles.tipText}>
            Security Tip: Choose a password that is unique and at least 8 characters long, including numbers and symbols.
          </Text>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={18} color={COLORS.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Text style={styles.label}>Current Password <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.input}
          value={form.current}
          onChangeText={(t) => { setError(null); setForm({ ...form, current: t }); }}
          secureTextEntry
        />

        <View style={styles.divider} />

        <Text style={styles.label}>New Password <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.input}
          value={form.new}
          onChangeText={(t) => { setError(null); setForm({ ...form, new: t }); }}
          secureTextEntry
        />

        <Text style={styles.label}>Confirm New Password <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.input}
          value={form.confirm}
          onChangeText={(t) => { setError(null); setForm({ ...form, confirm: t }); }}
          secureTextEntry
        />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.updateButton, loading && styles.updateButtonDisabled]}
          onPress={handleUpdate}
          activeOpacity={0.8}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} size="small" />
          ) : (
            <Text style={styles.updateButtonText}>
              Update Password
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </AnimatedScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.slate[50]
  },
  scroll: { flex: 1 },
  content: {
    padding: 16,
    paddingBottom: 24
  },
  tipBox: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: COLORS.amber[50],
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.amber[100],
    marginBottom: 24
  },
  tipText: {
    flex: 1,
    fontSize: 10,
    color: COLORS.amber[800],
    lineHeight: 16
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
    marginBottom: 16
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.danger
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.slate[500],
    textTransform: 'uppercase',
    marginLeft: 4,
    marginBottom: 4
  },
  required: {
    color: COLORS.danger
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.slate[200],
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    marginBottom: 16
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.slate[100],
    marginVertical: 16
  },
  footer: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.slate[200]
  },
  updateButton: {
    backgroundColor: COLORS.slate[900],
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center'
  },
  updateButtonDisabled: {
    backgroundColor: COLORS.slate[200]
  },
  updateButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600'
  },
  updateButtonTextDisabled: {
    color: COLORS.slate[400]
  }
});
