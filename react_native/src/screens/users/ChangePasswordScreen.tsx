import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { COLORS } from '../../constants/theme';

interface ChangePasswordScreenProps {
  onBack: () => void;
}

export function ChangePasswordScreen({ onBack }: ChangePasswordScreenProps) {
  const [form, setForm] = useState({ current: '', new: '', confirm: '' });

  const isValid = form.current.length > 0 && form.new.length > 0 && form.new === form.confirm;

  const handleUpdate = () => {
    if (isValid) onBack();
  };

  return (
    <View style={styles.container}>
      <Header title="Change Password" showBack onBack={onBack} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.tipBox}>
          <Ionicons name="information-circle-outline" size={20} color={COLORS.amber[600]} />
          <Text style={styles.tipText}>
            Security Tip: Choose a password that is unique and at least 8 characters long, including numbers and symbols.
          </Text>
        </View>

        <Text style={styles.label}>Current Password</Text>
        <TextInput
          style={styles.input}
          value={form.current}
          onChangeText={(t) => setForm({ ...form, current: t })}
          placeholder="••••••••"
          secureTextEntry
        />

        <View style={styles.divider} />

        <Text style={styles.label}>New Password</Text>
        <TextInput
          style={styles.input}
          value={form.new}
          onChangeText={(t) => setForm({ ...form, new: t })}
          placeholder="••••••••"
          secureTextEntry
        />

        <Text style={styles.label}>Confirm New Password</Text>
        <TextInput
          style={styles.input}
          value={form.confirm}
          onChangeText={(t) => setForm({ ...form, confirm: t })}
          placeholder="••••••••"
          secureTextEntry
        />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.updateButton, !isValid && styles.updateButtonDisabled]}
          onPress={handleUpdate}
          activeOpacity={0.8}
          disabled={!isValid}
        >
          <Text style={[styles.updateButtonText, !isValid && styles.updateButtonTextDisabled]}>
            Update Password
          </Text>
        </TouchableOpacity>
      </View>
    </View>
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
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.slate[500],
    textTransform: 'uppercase',
    marginLeft: 4,
    marginBottom: 4
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
    fontWeight: '700'
  },
  updateButtonTextDisabled: {
    color: COLORS.slate[400]
  }
});
