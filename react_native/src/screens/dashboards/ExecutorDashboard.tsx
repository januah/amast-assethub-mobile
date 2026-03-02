import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { ActionButton, Card, SectionHeader, StatusBadge } from '../../components/Shared';
import { COLORS } from '../../constants/theme';
import { UserRole } from '../../types';
import { getExecutorDashboardSummary, ExecutorDashboardSummary } from '../../api/dashboardApi';

interface ExecutorDashboardProps {
  role: UserRole;
  onAction: (flow: string) => void;
  onLogout?: () => void;
  unreadCount?: number;
}

export function ExecutorDashboard({ role, onAction, onLogout, unreadCount = 0 }: ExecutorDashboardProps) {
  const [data, setData] = useState<ExecutorDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const roleLabelFallback = role.replace(/_/g, ' ');
  const jobTitle = role === UserRole.TOW_TRUCK ? 'Towing Ambulance WMX' : 'Biomedical / PPM';

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await getExecutorDashboardSummary();
      if (res.success && res.data) setData(res.data);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fullName = data?.fullName || 'Engineer';
  const roleLabel = data?.roleLabel || roleLabelFallback;
  const jobsTodayCount = data?.jobsTodayCount ?? 0;
  const pendingJobsCount = data?.pendingJobsCount ?? 0;
  const ppmTasksThisWeek = data?.ppmTasksThisWeek ?? 0;
  const avgRating = data?.avgRating;
  const activeJob = data?.activeJob ?? null;
  const recentActivity = data?.recentActivity ?? [];

  if (loading) {
    return (
      <View style={styles.container}>
        <Header
          title="Portal"
          showRightIcons
          onNotificationClick={() => onAction('notifications')}
          onAvatarPress={() => onAction('profile')}
          unreadCount={unreadCount}
        />
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Portal"
        showRightIcons
        onNotificationClick={() => onAction('notifications')}
        onAvatarPress={() => onAction('profile')}
        unreadCount={unreadCount}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} colors={[COLORS.primary]} />}
      >
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.heroAvatar}>
              <Text style={styles.heroAvatarText}>{role.substring(0, 2).toUpperCase()}</Text>
            </View>
            <View>
              <Text style={styles.heroName}>{fullName}</Text>
              <Text style={styles.heroRole}>{roleLabel}</Text>
            </View>
          </View>
          <View style={styles.heroStats}>
            <TouchableOpacity style={styles.heroStat} onPress={() => onAction('task_list')}>
              <Text style={styles.heroStatLabel}>Jobs Today</Text>
              <Text style={styles.heroStatValue}>{jobsTodayCount} Task{jobsTodayCount !== 1 ? 's' : ''}</Text>
            </TouchableOpacity>
            <View style={[styles.heroStat, { alignItems: 'flex-end' }]}>
              <Text style={styles.heroStatLabel}>Rating</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={styles.heroStatValueSky}>{avgRating != null ? avgRating.toFixed(1) : '-'}</Text>
                <Ionicons name="star" size={16} color={COLORS.amber[500]} />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <View style={styles.actionHalf}>
            <ActionButton label="Pending Jobs" icon="Jobs" sublabel={`${pendingJobsCount} New request${pendingJobsCount !== 1 ? 's' : ''}`} onPress={() => onAction('task_list')} color={COLORS.white} />
          </View>
          <View style={styles.actionHalf}>
            <ActionButton label="PPM Schedule" icon="Calendar" sublabel={`${ppmTasksThisWeek} Task${ppmTasksThisWeek !== 1 ? 's' : ''} this week`} onPress={() => onAction('ppm_list')} color={COLORS.white} />
          </View>
        </View>
        {role === UserRole.BIOMED_ENGINEER && (
          <View style={styles.actionsRow}>
            <View style={styles.actionHalf}>
              <ActionButton label="Replacements" icon="Replacement" sublabel="Manage loaners" onPress={() => onAction('replacement_list')} color={COLORS.white} />
            </View>
            <View style={styles.actionHalf}>
              <ActionButton label="Device Removal" icon="Truck" sublabel="Transport to office" onPress={() => onAction('removal')} color={COLORS.white} />
            </View>
          </View>
        )}

        <SectionHeader title="Currently Active Job" />
        {activeJob ? (
          <Card onPress={() => onAction('job_detail', { jobId: activeJob.id })} leftBorder={COLORS.primary} style={styles.jobCard}>
            <View style={styles.jobHeader}>
              <Text style={styles.jobId}>ACTIVE - {activeJob.id}</Text>
              <StatusBadge status={activeJob.status} />
            </View>
            <Text style={styles.jobTitle}>{activeJob.title}</Text>
            {activeJob.location ? <Text style={styles.jobLocation}>Location: {activeJob.location}</Text> : null}
            <View style={styles.jobActions}>
              <TouchableOpacity style={styles.resumeBtn} onPress={() => onAction('job_detail', { jobId: activeJob.id })}>
                <Text style={styles.resumeBtnText}>Resume Job</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.navBtn}>
                <Ionicons name="navigate-outline" size={18} color={COLORS.slate[500]} />
              </TouchableOpacity>
            </View>
          </Card>
        ) : (
          <Card style={styles.jobCard}>
            <Text style={styles.noActiveJob}>No active job</Text>
          </Card>
        )}

        <SectionHeader title="Recent Activity" onSeeAll={() => onAction('records')} />
        {recentActivity.length > 0 ? (
          recentActivity.map((a) => (
            <Card key={a.id} onPress={() => onAction('records')} style={styles.activityCard}>
              <View style={styles.activityRow}>
                <View style={styles.activityIcon}>
                  <Ionicons name="checkmark-circle" size={18} color={COLORS.emerald[600]} />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{a.title}</Text>
                  <Text style={styles.activityMeta}>{a.meta}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={COLORS.slate[300]} />
              </View>
            </Card>
          ))
        ) : (
          <Card style={styles.activityCard}>
            <Text style={styles.noActivity}>No recent activity</Text>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  hero: {
    backgroundColor: COLORS.slate[900],
    borderRadius: 16,
    padding: 20,
    marginBottom: 24
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
  heroAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  heroAvatarText: { fontSize: 18, fontWeight: '800', color: COLORS.white },
  heroName: { fontSize: 16, fontWeight: '700', color: COLORS.white },
  heroRole: { fontSize: 12, color: COLORS.slate[400], marginTop: 2 },
  heroStats: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 16, borderTopWidth: 1, borderTopColor: COLORS.slate[800] },
  heroStat: { flex: 1 },
  heroStatLabel: { fontSize: 10, fontWeight: '700', color: COLORS.slate[500], textTransform: 'uppercase', letterSpacing: 1 },
  heroStatValue: { fontSize: 18, fontWeight: '700', color: COLORS.white, marginTop: 2 },
  heroStatValueSky: { fontSize: 18, fontWeight: '700', color: COLORS.sky[400], marginTop: 2 },
  actionsRow: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  actionHalf: { flex: 1 },
  jobCard: { marginBottom: 8 },
  jobHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  jobId: { fontSize: 10, fontWeight: '700', color: COLORS.slate[400], textTransform: 'uppercase' },
  jobTitle: { fontSize: 14, fontWeight: '700', color: COLORS.slate[800], marginBottom: 4 },
  jobLocation: { fontSize: 10, color: COLORS.slate[500], marginBottom: 16 },
  jobActions: { flexDirection: 'row', gap: 8 },
  resumeBtn: { flex: 1, paddingVertical: 8, backgroundColor: COLORS.primary, borderRadius: 12, alignItems: 'center' },
  resumeBtnText: { fontSize: 12, fontWeight: '700', color: COLORS.white },
  navBtn: { padding: 8, borderWidth: 1, borderColor: COLORS.slate[200], borderRadius: 12 },
  activityCard: { marginBottom: 12 },
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  activityIcon: { width: 36, height: 36, borderRadius: 8, backgroundColor: COLORS.emerald[50], alignItems: 'center', justifyContent: 'center' },
  activityContent: { flex: 1 },
  activityTitle: { fontSize: 12, fontWeight: '700', color: COLORS.slate[800] },
  activityMeta: { fontSize: 10, color: COLORS.slate[400], marginTop: 2 },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  noActiveJob: { fontSize: 14, color: COLORS.slate[500], padding: 16, textAlign: 'center' },
  noActivity: { fontSize: 14, color: COLORS.slate[500], padding: 16, textAlign: 'center' }
});
