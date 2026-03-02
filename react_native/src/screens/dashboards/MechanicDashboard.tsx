import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { Card, StatusBadge } from '../../components/Shared';
import { COLORS } from '../../constants/theme';
import { getExecutorDashboardSummary, getExecutorAssignedTasks, ExecutorAssignedTask } from '../../api/dashboardApi';

interface MechanicJob {
  id: string;
  type: string;
  asset: string;
  location: string;
  requester: string;
  priority: string;
  status: string;
  statusRaw: string;
  dueTime: string;
}

function mapTaskToMechanicJob(t: ExecutorAssignedTask): MechanicJob {
  const statusUpper = (t.status || '').toUpperCase();
  return {
    id: t.id,
    type: t.type,
    asset: t.asset || '-',
    location: t.location || '-',
    requester: t.requester || '-',
    priority: t.priority || 'Normal',
    status: t.status || '-',
    statusRaw: statusUpper,
    dueTime: t.time || '-'
  };
}

interface MechanicDashboardProps {
  onSelectJob: (id: string) => void;
  onLogout?: () => void;
}

export function MechanicDashboard({ onSelectJob, onLogout }: MechanicDashboardProps) {
  const [filter, setFilter] = useState<'New' | 'In Progress' | 'Completed'>('New');
  const [jobs, setJobs] = useState<MechanicJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState<{ pendingJobsCount: number; ppmTasksThisWeek: number } | null>(null);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const [summaryRes, tasksRes] = await Promise.all([
        getExecutorDashboardSummary(),
        getExecutorAssignedTasks()
      ]);
      if (summaryRes.success && summaryRes.data) {
        setSummary({
          pendingJobsCount: summaryRes.data.pendingJobsCount ?? 0,
          ppmTasksThisWeek: summaryRes.data.ppmTasksThisWeek ?? 0
        });
      }
      if (tasksRes.success && Array.isArray(tasksRes.data)) {
        setJobs(tasksRes.data.map(mapTaskToMechanicJob));
      } else {
        setJobs([]);
      }
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredJobs = jobs.filter((job) => {
    if (filter === 'New') return job.statusRaw === 'OPEN';
    if (filter === 'In Progress') return ['IN_PROGRESS', 'WAITING'].includes(job.statusRaw);
    return job.statusRaw === 'COMPLETED';
  });

  const getPriorityColor = (p: string) => {
    const pUpper = (p || '').toUpperCase();
    if (pUpper.includes('CRITICAL')) return COLORS.danger;
    if (pUpper.includes('URGENT') || pUpper.includes('HIGH')) return COLORS.amber[500];
    return COLORS.primary;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="My Jobs" />
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="My Jobs" />
      <View style={styles.bar}>
        <Ionicons name="briefcase-outline" size={16} color={COLORS.slate[400]} />
        <Text style={styles.barText}>My Assigned Jobs</Text>
      </View>

      <View style={styles.tabs}>
        {(['New', 'In Progress', 'Completed'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, filter === t && styles.tabActive]}
            onPress={() => setFilter(t)}
          >
            <Text style={[styles.tabText, filter === t && styles.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} colors={[COLORS.primary]} />}
      >
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <Card key={job.id} onPress={() => onSelectJob(job.id)} leftBorder={COLORS.primary} style={styles.jobCard}>
              <View style={styles.jobHeader}>
                <Text style={styles.jobId}>{job.id} - {job.type}</Text>
                <StatusBadge status={job.statusRaw === 'COMPLETED' ? 'Completed' : 'In Progress'} />
              </View>
              <Text style={styles.jobAsset}>{job.asset}</Text>
              <View style={styles.jobMeta}>
                <Ionicons name="navigate-outline" size={12} color={COLORS.slate[500]} />
                <Text style={styles.jobMetaText}>{job.location}</Text>
              </View>
              <View style={styles.jobMeta}>
                <Ionicons name="person-outline" size={12} color={COLORS.slate[500]} />
                <Text style={styles.jobMetaText}>Requester: {job.requester}</Text>
              </View>
              <View style={styles.jobFooter}>
                <Text style={[styles.jobPriority, { color: getPriorityColor(job.priority) }]}>
                  {job.priority} Priority
                </Text>
                <View style={styles.jobDue}>
                  <Ionicons name="time-outline" size={12} color={COLORS.slate[400]} />
                  <Text style={styles.jobDueText}>Due: {job.dueTime}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.viewJobBtn} onPress={() => onSelectJob(job.id)}>
                <Text style={styles.viewJobBtnText}>View Job</Text>
                <Ionicons name="chevron-forward" size={14} color={COLORS.white} />
              </TouchableOpacity>
            </Card>
          ))
        ) : (
          <View style={styles.empty}>
            <Ionicons name="briefcase-outline" size={48} color={COLORS.slate[300]} />
            <Text style={styles.emptyText}>No jobs in this category</Text>
          </View>
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
    padding: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate[200]
  },
  barText: { fontSize: 10, fontWeight: '700', color: COLORS.slate[500], letterSpacing: 1, textTransform: 'uppercase' },
  tabs: { flexDirection: 'row', padding: 4, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.slate[100] },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: 10, fontWeight: '700', color: COLORS.slate[400], letterSpacing: 1, textTransform: 'uppercase' },
  tabTextActive: { color: COLORS.white },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  jobCard: { marginBottom: 16 },
  jobHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  jobId: { fontSize: 10, fontWeight: '700', color: COLORS.slate[400], textTransform: 'uppercase' },
  jobAsset: { fontSize: 14, fontWeight: '700', color: COLORS.slate[800], marginBottom: 12 },
  jobMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  jobMetaText: { fontSize: 10, color: COLORS.slate[500] },
  jobFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.slate[100] },
  jobPriority: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  jobDue: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  jobDueText: { fontSize: 10, fontWeight: '700', color: COLORS.slate[400] },
  viewJobBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.slate[900],
    borderRadius: 12
  },
  viewJobBtnText: { fontSize: 12, fontWeight: '700', color: COLORS.white },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48 },
  emptyText: { fontSize: 14, fontWeight: '700', color: COLORS.slate[400], marginTop: 12 },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
