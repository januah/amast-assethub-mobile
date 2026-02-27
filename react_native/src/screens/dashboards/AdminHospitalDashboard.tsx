import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { ActionButton, Card, SectionHeader } from '../../components/Shared';
import { COLORS } from '../../constants/theme';
import { getAdminDashboardSummary } from '../../api/dashboardApi';

interface AdminHospitalDashboardProps {
  onAction: (flow: string) => void;
  onLogout?: () => void;
  unreadCount?: number;
}

function formatTimeAgo(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

export function AdminHospitalDashboard({ onAction, onLogout, unreadCount = 0 }: AdminHospitalDashboardProps) {
  const [data, setData] = useState<{
    hospitalUsers: number;
    totalAssets: number;
    openRequests: number;
    completedYtd: number;
    hospitalName: string;
    recentActivity: { id: string; title: string; meta: string; time: string }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getAdminDashboardSummary().then((res) => {
      if (cancelled) return;
      setLoading(false);
      if (res.success && res.data) setData(res.data);
      else setData({
        hospitalUsers: 0,
        totalAssets: 0,
        openRequests: 0,
        completedYtd: 0,
        hospitalName: '',
        recentActivity: []
      });
    }).catch(() => {
      if (!cancelled) {
        setLoading(false);
        setData({ hospitalUsers: 0, totalAssets: 0, openRequests: 0, completedYtd: 0, hospitalName: '', recentActivity: [] });
      }
    });
    return () => { cancelled = true; };
  }, []);

  const summary = data ?? {
    hospitalUsers: 0,
    totalAssets: 0,
    openRequests: 0,
    completedYtd: 0,
    hospitalName: 'Loading...',
    recentActivity: []
  };

  return (
    <View style={styles.container}>
      <Header
        title="Admin Hospital"
        showRightIcons
        unreadCount={unreadCount}
        onNotificationClick={() => onAction('notifications')}
        onAvatarPress={() => onAction('profile')}
      />
      <View style={styles.bar}>
        <Ionicons name="navigate-outline" size={16} color={COLORS.primary} />
        <Text style={styles.barText}>{summary.hospitalName || 'HQ'}</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <>
            <View style={styles.kpiGrid}>
              <View style={[styles.kpiCard, styles.kpiPrimary]}>
                <Text style={styles.kpiValue}>{summary.hospitalUsers}</Text>
                <Text style={styles.kpiLabel}>Hospital Users</Text>
              </View>
              <View style={[styles.kpiCard, styles.kpiDark]}>
                <Text style={styles.kpiValue}>{summary.totalAssets}</Text>
                <Text style={styles.kpiLabel}>Total Assets</Text>
              </View>
              <View style={[styles.kpiCard, styles.kpiWhite]}>
                <Text style={[styles.kpiValue, styles.kpiValueAmber]}>{summary.openRequests}</Text>
                <Text style={[styles.kpiLabel, styles.kpiLabelDark]}>Open Requests</Text>
              </View>
              <View style={[styles.kpiCard, styles.kpiWhite]}>
                <Text style={[styles.kpiValue, styles.kpiValueEmerald]}>{summary.completedYtd}</Text>
                <Text style={[styles.kpiLabel, styles.kpiLabelDark]}>Completed YTD</Text>
              </View>
            </View>

            <SectionHeader title="Management Console" />
            <View style={styles.actions}>
              <ActionButton label="User Management" icon="User" sublabel="Doctors, Drivers & Approvers" onPress={() => onAction('manage_users')} />
              <ActionButton label="Asset Registry" icon="List" sublabel="Devices & Ambulance Inventory" onPress={() => onAction('assets')} />
              <ActionButton label="Compliance Reports" icon="Report" sublabel="Maintenance & Service Logs" onPress={() => onAction('admin_reports')} />
            </View>

            <SectionHeader title="Recent Activity" />
            {summary.recentActivity.length > 0 ? (
              summary.recentActivity.map((a) => (
                <View key={a.id} style={styles.activityCard}>
                  <View style={styles.activityIcon}>
                    <Ionicons name="time-outline" size={18} color={COLORS.slate[400]} />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle} numberOfLines={1}>{a.title}</Text>
                    <Text style={styles.activityMeta} numberOfLines={1}>{a.meta}</Text>
                  </View>
                  <Text style={styles.activityTime}>{formatTimeAgo(a.time)}</Text>
                </View>
              ))
            ) : (
              <View style={styles.activityCard}>
                <View style={styles.activityIcon}>
                  <Ionicons name="time-outline" size={18} color={COLORS.slate[400]} />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>No recent activity</Text>
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.slate[50] },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate[200]
  },
  barText: { fontSize: 10, fontWeight: '700', color: COLORS.slate[800], letterSpacing: 1, textTransform: 'uppercase' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  loading: { padding: 48, alignItems: 'center', justifyContent: 'center' },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12,  },
  kpiCard: { width: '47%', padding: 16, borderRadius: 16, alignItems: 'center' },
  kpiPrimary: { backgroundColor: COLORS.primary },
  kpiDark: { backgroundColor: COLORS.slate[900] },
  kpiWhite: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.slate[200] },
  kpiValue: { fontSize: 24, fontWeight: '800', color: COLORS.white },
  kpiValueAmber: { color: COLORS.amber[500] },
  kpiValueEmerald: { color: COLORS.emerald[500] },
  kpiLabel: { fontSize: 8, fontWeight: '700', color: 'rgba(255,255,255,0.8)', marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 },
  kpiLabelDark: { color: COLORS.slate[600] },
  actions: { gap: 12, marginBottom: 8 },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.slate[200],
    marginBottom: 12
  },
  activityIcon: { width: 36, height: 36, borderRadius: 8, backgroundColor: COLORS.slate[50], alignItems: 'center', justifyContent: 'center' },
  activityContent: { flex: 1 },
  activityTitle: { fontSize: 12, fontWeight: '700', color: COLORS.slate[800] },
  activityMeta: { fontSize: 10, color: COLORS.slate[400], marginTop: 2 },
  activityTime: { fontSize: 8, fontWeight: '700', color: COLORS.slate[400] }
});
