import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Header } from '../../components/Header';
import { AnimatedScreen } from '../../components/AnimatedScreen';
import { SectionHeader } from '../../components/Shared';
import { COLORS } from '../../constants/theme';
import { getProfile, updateProfile } from '../../api/profileApi';

interface ToggleRowProps {
  label: string;
  desc: string;
  active: boolean;
  onToggle: () => void;
}

function ToggleRow({ label, desc, active, onToggle }: ToggleRowProps) {
  return (
    <TouchableOpacity
      style={styles.toggleRow}
      onPress={onToggle}
      activeOpacity={0.8}
    >
      <View style={styles.toggleText}>
        <Text style={styles.toggleLabel}>{label}</Text>
        <Text style={styles.toggleDesc}>{desc}</Text>
      </View>
      <View style={[styles.switch, active && styles.switchActive]}>
        <View style={[styles.switchKnob, active && styles.switchKnobActive]} />
      </View>
    </TouchableOpacity>
  );
}

interface NotificationSettingsScreenProps {
  onBack: () => void;
}

export function NotificationSettingsScreen({ onBack }: NotificationSettingsScreenProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    breakdown: true,
    ppm: true,
    approvals: true,
    updates: false,
    email: true,
    push: true
  });

  useEffect(() => {
    getProfile().then((res) => {
      setLoading(false);
      if (res.success && res.data?.settings?.push_notifications_enabled !== undefined) {
        setSettings((s) => ({ ...s, push: !!res.data?.settings?.push_notifications_enabled }));
      }
    }).catch(() => setLoading(false));
  }, []);

  const updatePush = (value: boolean) => {
    setSettings((s) => ({ ...s, push: value }));
    setSaving(true);
    updateProfile({ settings: { push_notifications_enabled: value } }).finally(() => setSaving(false));
  };

  return (
    <AnimatedScreen style={styles.container}>
      <Header title="Notifications" showBack onBack={onBack} />
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SectionHeader title="Alert Preferences" />
        <View style={styles.toggleGroup}>
          <ToggleRow
            label="Breakdown Alerts"
            desc="Instant notifications when a device breakdown is reported in your ward."
            active={settings.breakdown}
            onToggle={() => setSettings({ ...settings, breakdown: !settings.breakdown })}
          />
          <ToggleRow
            label="PPM Reminders"
            desc="Get reminded 24 hours before a scheduled maintenance."
            active={settings.ppm}
            onToggle={() => setSettings({ ...settings, ppm: !settings.ppm })}
          />
          <ToggleRow
            label="Approval Status"
            desc="Notifications when your requests are approved or rejected."
            active={settings.approvals}
            onToggle={() => setSettings({ ...settings, approvals: !settings.approvals })}
          />
        </View>

        <SectionHeader title="Channel Settings" />
        <View style={styles.toggleGroup}>
          <ToggleRow
            label="Push Notifications"
            desc="Receive alerts on your mobile device even when app is closed."
            active={settings.push}
            onToggle={() => !saving && updatePush(!settings.push)}
          />
          <ToggleRow
            label="Email Reports"
            desc="Weekly summaries and service reports sent to your inbox."
            active={settings.email}
            onToggle={() => setSettings({ ...settings, email: !settings.email })}
          />
        </View>
      </ScrollView>
      )}
    </AnimatedScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.slate[50]
  },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1 },
  content: {
    padding: 16,
    paddingBottom: 48
  },
  toggleGroup: {
    gap: 12,
    marginBottom: 8
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.slate[100]
  },
  toggleText: { flex: 1, marginRight: 16 },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.slate[800]
  },
  toggleDesc: {
    fontSize: 10,
    color: COLORS.slate[400],
    marginTop: 4
  },
  switch: {
    width: 48,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.slate[200],
    padding: 2,
    justifyContent: 'center'
  },
  switchActive: {
    backgroundColor: COLORS.primary
  },
  switchKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    alignSelf: 'flex-start'
  },
  switchKnobActive: {
    alignSelf: 'flex-end'
  }
});
