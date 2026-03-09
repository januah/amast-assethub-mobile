import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { AnimatedScreen } from '../../components/AnimatedScreen';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../constants/theme';
import { getProfile, updateProfile } from '../../api/profileApi';

interface EditProfileScreenProps {
  onBack: () => void;
}

export function EditProfileScreen({ onBack }: EditProfileScreenProps) {
  const { user, updateUser } = useAuth();
  const [data, setData] = useState({
    name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    staffId: user?.id || user?.username || '',
    workplace: '',
    dept: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProfile().then((res: { success?: boolean; data?: { full_name?: string; email?: string; phone?: string; user_id?: string; hospital_name?: string; assigned_department_name?: string } }) => {
      setLoading(false);
      if (res?.success && res?.data) {
        const d = res.data;
        setData({
          name: d.full_name || '',
          email: d.email || '',
          phone: d.phone || '',
          staffId: d.user_id || user?.id || user?.username || '',
          workplace: d.hospital_name || '',
          dept: d.assigned_department_name || ''
        });
      } else {
        setData((prev) => ({
          ...prev,
          name: user?.full_name || prev.name,
          email: user?.email || prev.email,
          phone: user?.phone || prev.phone,
          staffId: user?.id || user?.username || prev.staffId
        }));
      }
    }).catch(() => setLoading(false));
  }, [user]);

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    const res = await updateProfile({
      full_name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone.trim() || undefined
    });
    setSaving(false);
    const r = res as { success?: boolean; data?: { full_name?: string; email?: string; phone?: string }; message?: string };
    if (r?.success) {
      updateUser({
        full_name: r.data?.full_name ?? data.name,
        email: r.data?.email ?? data.email,
        phone: r.data?.phone ?? data.phone
      });
      onBack();
    } else {
      setError(r?.message || 'Failed to update profile');
    }
  };

  if (loading) {
    return (
      <AnimatedScreen style={styles.container}>
        <Header title="Edit Profile" showBack onBack={onBack} />
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </AnimatedScreen>
    );
  }

  return (
    <AnimatedScreen style={styles.container}>
      <Header title="Edit Profile" showBack onBack={onBack} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Ionicons name="person-outline" size={48} color={COLORS.primary} />
          </View>
          <Text style={styles.avatarLabel}>Profile Picture</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={data.name}
            onChangeText={(t) => setData({ ...data, name: t })}
            placeholder="Full name"
          />

          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            value={data.email}
            onChangeText={(t) => setData({ ...data, email: t })}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={data.phone}
            onChangeText={(t) => setData({ ...data, phone: t })}
            placeholder="Phone"
            keyboardType="phone-pad"
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.row}>
            <View style={[styles.half, { marginRight: 8 }]}>
              <Text style={styles.label}>Staff ID</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={data.staffId}
                editable={false}
              />
            </View>
            <View style={styles.half}>
              <Text style={styles.label}>Workplace</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={data.workplace}
                editable={false}
              />
            </View>
          </View>

          <Text style={styles.label}>Department / Ward</Text>
          <TextInput
            style={[styles.input, styles.inputDisabled]}
            value={data.dept}
            editable={false}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          activeOpacity={0.8}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
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
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: COLORS.sky[100],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: COLORS.white
  },
  avatarLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.slate[400],
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: 16
  },
  form: { gap: 12 },
  label: {
    fontSize: 10,
    fontWeight: '600',
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
  inputDisabled: {
    backgroundColor: COLORS.slate[100],
    color: COLORS.slate[500]
  },
  row: { flexDirection: 'row' },
  half: { flex: 1 },
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
  saveButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600'
  },
  saveButtonDisabled: {
    opacity: 0.6
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  errorText: {
    fontSize: 12,
    color: COLORS.danger,
    marginTop: 4
  }
});
