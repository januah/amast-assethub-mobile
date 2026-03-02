import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { ActionButton, Card, SectionHeader, StatusBadge } from '../../components/Shared';
import { COLORS } from '../../constants/theme';
import { getRequesterDashboardSummary } from '../../api/dashboardApi';

interface RequesterDashboardProps {
  onAction: (flow: string) => void;
  onLogout?: () => void;
  unreadCount?: number;
}

function formatDate(s: string | null | undefined): string {
  if (!s) return '';
  const d = new Date(s);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) || String(s);
}

function badgeStatus(status: string): string {
  if (!status) return 'Open';
  return status;
}

export function RequesterDashboard({ onAction, onLogout, unreadCount = 0 }: RequesterDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    fullName: string;
    hospitalName: string;
    departmentName: string;
    totalAssets: number;
    activeJobsCount: number;
    recentRequests: { id: string; asset: string; status: string; date: string }[];
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    getRequesterDashboardSummary()
      .then((res) => {
        if (cancelled) return;
        setData(res.success && res.data ? res.data : null);
      })
      .catch(() => {
        if (cancelled) return;
        setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);
  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Dashboard" showRightIcons onNotificationClick={() => onAction('notifications')} onAvatarPress={() => onAction('profile')} unreadCount={unreadCount} />
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </View>
    );
  }

  const welcomeName = data?.fullName ? `Hello, ${data.fullName}` : 'Hello';
  const welcomeSub = [data?.hospitalName, data?.departmentName].filter(Boolean).join(data?.hospitalName && data?.departmentName ? ', ' : '') || '';
  const totalAssets = data?.totalAssets ?? 0;
  const activeJobs = data?.activeJobsCount ?? 0;
  const recentRequests = data?.recentRequests ?? [];

  return (
    <View style={styles.container}>
      <Header
        title="Dashboard"
        showRightIcons
        onNotificationClick={() => onAction('notifications')}
        onAvatarPress={() => onAction('profile')}
        unreadCount={unreadCount}
      />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.welcome}>
          <Text style={styles.welcomeTitle}>{welcomeName}</Text>
          {welcomeSub ? <Text style={styles.welcomeSub}>{welcomeSub}</Text> : null}
        </View>

        <View style={styles.actionsRow}>
          <View style={styles.actionHalf}>
            <ActionButton label="Report Breakdown" icon="Breakdown" sublabel="Device malfunctioning" onPress={() => onAction('breakdown_flow')} />
          </View>
          <View style={styles.actionHalf}>
            <ActionButton label="Replacements" icon="Replacement" sublabel="Active loaner devices" onPress={() => onAction('replacement_list')} />
          </View>
        </View>

        <View style={styles.statsRow}>
          <TouchableOpacity style={[styles.statCard, styles.statSky]} onPress={() => onAction('assets')}>
            <Text style={[styles.statValue, styles.statValueSky]}>{totalAssets}</Text>
            <Text style={styles.statLabel}>Total Assets</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.statCard, styles.statAmber]} onPress={() => onAction('records')}>
            <Text style={[styles.statValue, styles.statValueAmber]}>{activeJobs}</Text>
            <Text style={styles.statLabel}>Active Jobs</Text>
          </TouchableOpacity>
          <View style={[styles.statCard, styles.statEmerald]}>
            <Text style={[styles.statValue, styles.statValueEmerald]}>-</Text>
            <Text style={styles.statLabel}>Uptime</Text>
          </View>
        </View>

        <SectionHeader title="Recent Requests" onSeeAll={() => onAction('records')} />
        {recentRequests.length === 0 ? (
          <Text style={styles.emptyText}>No recent requests</Text>
        ) : (
          recentRequests.map((req) => (
            <Card key={req.id} onPress={() => onAction('records')} style={styles.requestCard}>
              <View style={styles.requestRow}>
                <View>
                  <Text style={styles.requestId}>{req.id}</Text>
                  <Text style={styles.requestAsset}>{req.asset}</Text>
                </View>
                <StatusBadge status={badgeStatus(req.status)} />
              </View>
              <View style={styles.requestMeta}>
                <Ionicons name="time-outline" size={12} color={COLORS.slate[400]} />
                <Text style={styles.requestDate}>Requested on {formatDate(req.date)}</Text>
              </View>
            </Card>
          ))
        )}

        <SectionHeader title="What's New" />
        <View style={styles.banner}>
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>New PPM Schedule for 2024</Text>
            <Text style={styles.bannerDesc}>View the updated maintenance cycles for all medical devices in Ward 4B.</Text>
            <TouchableOpacity style={styles.bannerBtn} onPress={() => onAction('ppm_list')}>
              <Text style={styles.bannerBtnText}>Check Now</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.bannerIcon}>
            <Ionicons name="calendar-outline" size={24} color="rgba(255,255,255,0.9)" />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  welcome: { marginBottom: 24 },
  welcomeTitle: { fontSize: 20, fontWeight: '700', color: COLORS.slate[900] },
  welcomeSub: { fontSize: 14, color: COLORS.slate[500], marginTop: 4 },
  actionsRow: { flexDirection: 'row', gap: 16 },
  actionHalf: { flex: 1 },
  statsRow: { flexDirection: 'row', gap: 12, marginTop: 24 },
  statCard: { flex: 1, padding: 12, borderRadius: 16, borderWidth: 1 },
  statSky: { backgroundColor: COLORS.sky[50], borderColor: '#bae6fd' },
  statAmber: { backgroundColor: '#fffbeb', borderColor: '#fef3c7' },
  statEmerald: { backgroundColor: COLORS.emerald[50], borderColor: COLORS.emerald[100] },
  statValue: { fontSize: 18, fontWeight: '800', lineHeight: 22 },
  statValueSky: { color: COLORS.sky[600] },
  statValueAmber: { color: COLORS.amber[600] },
  statValueEmerald: { color: COLORS.emerald[600] },
  statLabel: { fontSize: 10, fontWeight: '600', color: COLORS.slate[600], marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 },
  requestCard: { marginBottom: 12 },
  requestRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  requestId: { fontSize: 10, fontWeight: '700', color: COLORS.slate[400], letterSpacing: 0.5, textTransform: 'uppercase' },
  requestAsset: { fontSize: 14, fontWeight: '700', color: COLORS.slate[800] },
  requestMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  requestDate: { fontSize: 10, color: COLORS.slate[400] },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyText: { fontSize: 14, color: COLORS.slate[500], paddingVertical: 16 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden'
  },
  bannerContent: { flex: 1, maxWidth: '75%', justifyContent: 'center' },
  bannerTitle: { fontSize: 14, fontWeight: '700', color: COLORS.white, marginBottom: 4 },
  bannerDesc: { fontSize: 10, color: 'rgba(255,255,255,0.85)', marginBottom: 12 },
  bannerBtn: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, backgroundColor: COLORS.white, borderRadius: 8 },
  bannerBtnText: { fontSize: 10, fontWeight: '700', color: COLORS.primary },
  bannerIcon: { padding: 12, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginLeft: 12 }
});
