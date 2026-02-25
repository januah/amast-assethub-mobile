import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  FlatList,
  Pressable
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { COLORS } from '../../constants/theme';
import { getRoles, createStaff } from '../../api/teamApi';

interface AddStaffScreenProps {
  onBack: () => void;
  onSuccess?: () => void;
}

export function AddStaffScreen({ onBack, onSuccess }: AddStaffScreenProps) {
  const [roles, setRoles] = useState<{ role_id: string; name: string }[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [form, setForm] = useState({
    username: '',
    full_name: '',
    email: '',
    phone: '',
    password: '',
    role_id: '',
    role_label: ''
  });

  useEffect(() => {
    let cancelled = false;
    getRoles().then((res) => {
      if (cancelled) return;
      setLoadingRoles(false);
      if (res.success && res.data) setRoles(res.data);
    }).catch(() => {
      if (!cancelled) setLoadingRoles(false);
    });
    return () => { cancelled = true; };
  }, []);

  const handleSubmit = () => {
    setError(null);
    if (!form.username.trim()) {
      setError('Username is required');
      return;
    }
    if (!form.full_name.trim()) {
      setError('Full name is required');
      return;
    }
    if (!form.email.trim()) {
      setError('Email is required');
      return;
    }
    if (!form.password || form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (!form.role_id) {
      setError('Please select a role');
      return;
    }

    setSubmitting(true);
    createStaff({
      username: form.username.trim(),
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || undefined,
      password: form.password,
      role_id: form.role_id
    })
      .then((res) => {
        setSubmitting(false);
        if (res.success) {
          onSuccess?.();
          onBack();
        } else {
          setError(res.message || 'Failed to create staff');
        }
      })
      .catch(() => {
        setSubmitting(false);
        setError('Failed to create staff');
      });
  };

  return (
    <View style={styles.container}>
      <Header title="Add Staff Member" showBack onBack={onBack} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <Text style={styles.label}>Username *</Text>
          <TextInput
            style={styles.input}
            value={form.username}
            onChangeText={(t) => setForm({ ...form, username: t })}
            placeholder="Username"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={styles.input}
            value={form.full_name}
            onChangeText={(t) => setForm({ ...form, full_name: t })}
            placeholder="Full name"
          />

          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={styles.input}
            value={form.email}
            onChangeText={(t) => setForm({ ...form, email: t })}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={styles.input}
            value={form.phone}
            onChangeText={(t) => setForm({ ...form, phone: t })}
            placeholder="Phone"
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Password *</Text>
          <TextInput
            style={styles.input}
            value={form.password}
            onChangeText={(t) => setForm({ ...form, password: t })}
            placeholder="Min 8 characters"
            secureTextEntry
          />

          <Text style={styles.label}>Role *</Text>
          <TouchableOpacity
            style={styles.picker}
            onPress={() => setShowRolePicker(true)}
            activeOpacity={0.7}
          >
            <Text style={form.role_label ? styles.pickerText : styles.pickerPlaceholder}>
              {form.role_label || 'Select role'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={COLORS.slate[400]} />
          </TouchableOpacity>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, submitting && styles.saveButtonDisabled]}
          onPress={handleSubmit}
          activeOpacity={0.8}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.saveButtonText}>Add Staff Member</Text>
          )}
        </TouchableOpacity>
      </View>

      <Modal
        visible={showRolePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRolePicker(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowRolePicker(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Role</Text>
            {loadingRoles ? (
              <ActivityIndicator style={styles.modalLoader} color={COLORS.primary} />
            ) : (
              <FlatList
                data={roles}
                keyExtractor={(r) => r.role_id}
                renderItem={({ item }) => (
                  <Pressable
                    style={styles.modalItem}
                    onPress={() => {
                      setForm({ ...form, role_id: item.role_id, role_label: item.name || item.role_id });
                      setShowRolePicker(false);
                    }}
                  >
                    <Text style={styles.modalItemText}>{item.name || item.role_id}</Text>
                  </Pressable>
                )}
              />
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.slate[50] },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 24 },
  form: { gap: 12 },
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
    fontSize: 14
  },
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.slate[200],
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14
  },
  pickerText: { fontSize: 14, color: COLORS.slate[800] },
  pickerPlaceholder: { fontSize: 14, color: COLORS.slate[400] },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 12,
    padding: 12
  },
  errorText: { fontSize: 12, color: COLORS.danger },
  footer: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.slate[200]
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center'
  },
  saveButtonDisabled: { opacity: 0.7 },
  saveButtonText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    width: '100%',
    maxHeight: 320
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.slate[800],
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate[200]
  },
  modalLoader: { padding: 32 },
  modalItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.slate[100] },
  modalItemText: { fontSize: 14, color: COLORS.slate[800] }
});
