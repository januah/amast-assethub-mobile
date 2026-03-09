import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { AnimatedScreen } from '../../components/AnimatedScreen';
import { DashboardSkeleton } from '../../components/DashboardSkeleton';
import { ActionButton, Card, SectionHeader, StatusBadge } from '../../components/Shared';
import { COLORS } from '../../constants/theme';
import { getRequesterDashboardSummary } from '../../api/dashboardApi';
import { DASHBOARD_SKELETON_MIN_MS } from '../../config/dashboard';
import { UserRole } from '../../types';

function formatRole(role: UserRole): string {
  if (role === UserRole.AUTH) return '—';
  return String(role).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

interface RequesterDashboardProps {
  role?: UserRole;
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

export function RequesterDashboard({ role, onAction, onLogout, unreadCount = 0 }: RequesterDashboardProps) {
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
    const delay = new Promise<void>((r) => setTimeout(r, DASHBOARD_SKELETON_MIN_MS));
    Promise.all([getRequesterDashboardSummary(), delay])
      .then(([res]) => {
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
      <AnimatedScreen style={styles.container}>
        <Header title="Dashboard" showRightIcons onNotificationClick={() => onAction('notifications')} onAvatarPress={() => onAction('profile')} unreadCount={unreadCount} />
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <DashboardSkeleton />
        </ScrollView>
      </AnimatedScreen>
    );
  }

  const welcomeName = data?.fullName ? `Hello, ${data.fullName}` : 'Hello';
  const totalAssets = data?.totalAssets ?? 0;
  const activeJobs = data?.activeJobsCount ?? 0;
  const recentRequests = data?.recentRequests ?? [];

  return (
    <AnimatedScreen style={styles.container}>
      <Header
        title="Dashboard"
        showRightIcons
        onNotificationClick={() => onAction('notifications')}
        onAvatarPress={() => onAction('profile')}
        unreadCount={unreadCount}
      />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <Text style={styles.heroGreeting}>Welcome back</Text>
            <Text style={styles.heroName}>{data?.fullName ?? 'User'}</Text>
          </View>
          <View style={styles.heroMeta}>
            <View style={styles.heroMetaItem}>
              <Ionicons name="business-outline" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.heroMetaLabel}>{data?.hospitalName ?? '—'}</Text>
            </View>
            <View style={styles.heroMetaItem}>
              <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.heroMetaLabel}>{data?.departmentName ?? '—'}</Text>
            </View>
            <View style={styles.heroMetaItem}>
              <Ionicons name="person-outline" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.heroMetaLabel}>{role ? formatRole(role) : '—'}</Text>
            </View>
          </View>
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
        <TouchableOpacity style={styles.whatsNewBanner} onPress={() => onAction('ppm_list')} activeOpacity={0.9}>
          <View style={styles.whatsNewContent}>
            <View style={styles.whatsNewTextWrap}>
              <Text style={styles.whatsNewTitle}>New PPM Schedule for 2026</Text>
              <Text style={styles.whatsNewDesc}>View the updated maintenance cycles for all medical devices.</Text>
              <View style={styles.whatsNewBtnWrap}>
                <Text style={styles.whatsNewBtnText}>Check Now</Text>
              </View>
            </View>
            <View style={styles.whatsNewIconWrap}>
              <Ionicons name="calendar" size={24} color="rgba(255,255,255,0.9)" />
            </View>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </AnimatedScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  hero: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    overflow: 'hidden',
  },
  heroTop: { marginBottom: 16 },
  heroGreeting: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.75)', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 },
  heroName: { fontSize: 22, fontWeight: '600', color: COLORS.white, letterSpacing: -0.5 },
  heroMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  heroMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  heroMetaLabel: { fontSize: 12, fontWeight: '600', color: COLORS.white },
  actionsRow: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  actionHalf: { flex: 1 },
  statsRow: { flexDirection: 'row', gap: 12, marginTop: 6 },
  statCard: { flex: 1, padding: 12, borderRadius: 16, borderWidth: 1 },
  statSky: { backgroundColor: COLORS.sky[50], borderColor: '#bae6fd' },
  statAmber: { backgroundColor: '#fffbeb', borderColor: '#fef3c7' },
  statEmerald: { backgroundColor: COLORS.emerald[50], borderColor: COLORS.emerald[100] },
  statValue: { fontSize: 18, fontWeight: '600', lineHeight: 22 },
  statValueSky: { color: COLORS.sky[600] },
  statValueAmber: { color: COLORS.amber[600] },
  statValueEmerald: { color: COLORS.emerald[600] },
  statLabel: { fontSize: 10, fontWeight: '600', color: COLORS.slate[600], marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 },
  requestCard: { marginBottom: 12 },
  requestRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  requestId: { fontSize: 10, fontWeight: '600', color: COLORS.slate[400], letterSpacing: 0.5, textTransform: 'uppercase' },
  requestAsset: { fontSize: 14, fontWeight: '600', color: COLORS.slate[800] },
  requestMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  requestDate: { fontSize: 10, color: COLORS.slate[400] },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyText: { fontSize: 14, color: COLORS.slate[500], paddingVertical: 16 },
  whatsNewBanner: {
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    backgroundColor: COLORS.sky[600],
  },
  whatsNewContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 16,
  },
  whatsNewTextWrap: { flex: 1, maxWidth: '70%' },
  whatsNewTitle: { fontSize: 14, fontWeight: '600', color: COLORS.white, marginBottom: 4 },
  whatsNewDesc: { fontSize: 10, color: 'rgba(255,255,255,0.9)', marginBottom: 12 },
  whatsNewBtnWrap: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: COLORS.white,
    borderRadius: 10,
  },
  whatsNewBtnText: { fontSize: 10, fontWeight: '600', color: COLORS.sky[600] },
  whatsNewIconWrap: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },
});
