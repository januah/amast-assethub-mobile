import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../constants/theme';

interface EditProfileScreenProps {
  onBack: () => void;
}

export function EditProfileScreen({ onBack }: EditProfileScreenProps) {
  const { user } = useAuth();
  const [data, setData] = useState({
    name: user?.full_name || 'Dr. Sarah Jones',
    email: user?.email || 'sarah.jones@hospital.com',
    phone: user?.phone || '+60 12-345 6789',
    staffId: 'STAFF-9921',
    workplace: 'General Hospital KL',
    dept: 'Ward 4B (Cardiology)'
  });

  const handleSave = () => {
    onBack();
  };

  return (
    <View style={styles.container}>
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
                style={styles.input}
                value={data.workplace}
                onChangeText={(t) => setData({ ...data, workplace: t })}
                placeholder="Workplace"
              />
            </View>
          </View>

          <Text style={styles.label}>Department / Ward</Text>
          <TextInput
            style={styles.input}
            value={data.dept}
            onChangeText={(t) => setData({ ...data, dept: t })}
            placeholder="Department"
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
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
    fontWeight: '700',
    color: COLORS.slate[400],
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: 16
  },
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
    fontWeight: '700'
  }
});
