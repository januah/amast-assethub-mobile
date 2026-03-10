import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { AnimatedScreen } from '../components/AnimatedScreen';
import { Card } from '../components/Shared';
import { COLORS, STATUS_COLORS } from '../constants/theme';
import { getExecutorAssignedTasks, type ExecutorAssignedTask } from '../api/dashboardApi';

type FilterTab = 'PPM' | 'Breakdown' | null;

interface AssignedTasksScreenProps {
  onBack: () => void;
  onSelectTask?: (id: string) => void;
}

export function AssignedTasksScreen({ onBack, onSelectTask }: AssignedTasksScreenProps) {
  const [filter, setFilter] = useState<FilterTab>('PPM');
  const [tasks, setTasks] = useState<ExecutorAssignedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const filteredTasks = tasks.filter((t) => !filter || (t.type && t.type === filter));
  const queueCount = filteredTasks.filter((t) => (t.status || '').toUpperCase() !== 'COMPLETED').length;

  const fetchTasks = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const res = await getExecutorAssignedTasks();
      if (res.success && Array.isArray(res.data)) {
        setTasks(res.data);
      } else {
        setTasks([]);
        setError((res as { message?: string }).message || 'Failed to load tasks');
      }
    } catch {
      setTasks([]);
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const getPriorityColor = (p: string) => {
    if (!p) return COLORS.primary;
    const lower = p.toLowerCase();
    if (lower.includes('critical')) return COLORS.danger;
    if (lower.includes('urgent')) return COLORS.amber[500];
    return COLORS.primary;
  };

  const getTypeBorderColor = (type: string | undefined) => {
    const t = (type || '').toUpperCase();
    if (t === 'BREAKDOWN') return '#dc2626';
    if (t === 'PPM') return '#0ea5e9';
    return '#0ea5e9';
  };

  const getStatusStyle = (s: string) => {
    const key = (s || '').toUpperCase().replace(/\s/g, '_');
    return STATUS_COLORS[key] || { bg: COLORS.slate[100], text: COLORS.slate[600] };
  };
  const getStatusLabel = (s: string) => {
    const key = (s || '').toUpperCase().replace(/\s/g, '_');
    if (key === 'COMPLETED') return 'Completed';
    if (key === 'IN_PROGRESS' || key === 'WAITING') return 'In Progress';
    return 'Pending';
  };

  return (
    <AnimatedScreen style={styles.container}>
      <Header title="Assigned Tasks" showBack onBack={onBack} />
      <View style={styles.tabs}>
        <Text style={styles.serviceModeLabel}>Service Mode:</Text>
        {(['PPM', 'Breakdown'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, filter === t && styles.tabActive]}
            onPress={() => setFilter(filter === t ? null : t)}
          >
            <Text style={[styles.tabText, filter === t && styles.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.serviceModeNote}>
        <Text style={styles.serviceModeNoteText}>
          PPM = Preventive Maintenance. Breakdown = REPAIR, INSPEC, INSTALL.
        </Text>
      </View>
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : error ? (
        <View style={styles.errorWrap}>
          <Ionicons name="alert-circle-outline" size={40} color={COLORS.slate[400]} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => fetchTasks(true)} colors={[COLORS.primary]} />
          }
        >
          <View style={styles.header}>
            <Text style={styles.queueText}>{queueCount} Incomplete Jobs in Queue</Text>
          </View>

          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <Card
                key={task.id}
                onPress={() => onSelectTask?.(task.id)}
                leftBorder={getTypeBorderColor(task.type)}
                style={styles.taskCard}
              >
                <View style={styles.taskHeader}>
                  <View style={styles.taskHeaderLeft}>
                    <View
                      style={[
                        styles.typeIcon,
                        task.type === 'Breakdown' ? styles.typeIconBreakdown : styles.typeIconPpm
                      ]}
                    >
                      <Ionicons
                        name={task.type === 'Breakdown' ? 'warning-outline' : 'calendar-outline'}
                        size={16}
                        color={task.type === 'Breakdown' ? COLORS.danger : COLORS.primary}
                      />
                    </View>
                    <View>
                      <Text style={styles.taskId}>{task.id}</Text>
                      <View style={[styles.serviceModeChip, task.type === 'Breakdown' ? styles.serviceModeChipBreakdown : styles.serviceModeChipPpm]}>
                        <Text style={[styles.serviceModeChipText, task.type === 'Breakdown' ? styles.serviceModeChipTextBreakdown : styles.serviceModeChipTextPpm]}>
                          {task.service_mode || task.type}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.taskBadges}>
                    <View style={[styles.priorityBadge, { backgroundColor: `${getPriorityColor(task.priority)}20` }]}>
                      <Text style={[styles.priorityBadgeText, { color: getPriorityColor(task.priority) }]}>
                        Priority: {task.priority}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusStyle(task.status).bg }]}>
                      <Text style={[styles.statusBadgeText, { color: getStatusStyle(task.status).text }]}>
                        {getStatusLabel(task.status)}
                      </Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.taskAsset}>{task.asset}</Text>
                <View style={styles.taskMeta}>
                  {task.location ? (
                    <View style={styles.taskMetaRow}>
                      <Ionicons name="navigate-outline" size={12} color={COLORS.slate[500]} />
                      <Text style={styles.taskMetaText}>{task.location}</Text>
                    </View>
                  ) : null}
                  <View style={styles.taskMetaRow}>
                    <Ionicons name="time-outline" size={12} color={COLORS.slate[500]} />
                    <Text style={styles.taskMetaText}>{task.time}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.startBtn} onPress={() => onSelectTask?.(task.id)}>
                  <Text style={styles.startBtnText}>
                    {(() => {
                      const s = (task.status || '').toUpperCase().replace(/\s/g, '_');
                      if (s === 'COMPLETED') return 'View Job';
                      if (s === 'IN_PROGRESS' || s === 'WAITING') return 'Continue Job';
                      return 'Start Job';
                    })()}
                  </Text>
                  <Ionicons name="chevron-forward" size={14} color={COLORS.white} />
                </TouchableOpacity>
              </Card>
            ))
          ) : (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Ionicons name="briefcase-outline" size={32} color={COLORS.slate[300]} />
              </View>
              <Text style={styles.emptyTitle}>No {filter ? `${filter} ` : ''}Jobs</Text>
              <Text style={styles.emptySub}>Your task queue is clear.</Text>
            </View>
          )}
        </ScrollView>
      )}
    </AnimatedScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.slate[50] },
  tabs: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate[100]
  },
  serviceModeLabel: { fontSize: 12, fontWeight: '600', color: COLORS.slate[600] },
  serviceModeNote: { paddingHorizontal: 12, paddingVertical: 8, paddingBottom: 12, backgroundColor: COLORS.slate[50], borderBottomWidth: 1, borderBottomColor: COLORS.slate[100] },
  serviceModeNoteText: { fontSize: 10, color: COLORS.slate[500], lineHeight: 14 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: 10, fontWeight: '600', color: COLORS.slate[400], letterSpacing: 1, textTransform: 'uppercase' },
  tabTextActive: { color: COLORS.white },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  errorText: { fontSize: 14, color: COLORS.slate[500], marginTop: 12, textAlign: 'center' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  queueText: { fontSize: 10, fontWeight: '600', color: COLORS.slate[400], textTransform: 'uppercase' },
  taskCard: { marginBottom: 16 },
  taskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  taskHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  taskBadges: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  typeIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  typeIconBreakdown: { backgroundColor: '#fee2e2' },
  typeIconPpm: { backgroundColor: '#e0f2fe' },
  taskId: { fontSize: 10, fontWeight: '600', color: COLORS.slate[400] },
  serviceModeChip: { alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
  serviceModeChipPpm: { backgroundColor: '#e0f2fe' },
  serviceModeChipBreakdown: { backgroundColor: '#fee2e2' },
  serviceModeChipText: { fontSize: 9, fontWeight: '600', textTransform: 'uppercase' },
  serviceModeChipTextPpm: { color: '#0369a1' },
  serviceModeChipTextBreakdown: { color: '#dc2626' },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  priorityBadgeText: { fontSize: 8, fontWeight: '600', textTransform: 'uppercase' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusBadgeText: { fontSize: 8, fontWeight: '600', textTransform: 'uppercase' },
  taskAsset: { fontSize: 14, fontWeight: '600', color: COLORS.slate[800], marginBottom: 12 },
  taskMeta: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  taskMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  taskMetaText: { fontSize: 10, color: COLORS.slate[500] },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    backgroundColor: COLORS.slate[900],
    borderRadius: 12
  },
  startBtnText: { fontSize: 12, fontWeight: '600', color: COLORS.white },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48 },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.slate[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  emptyTitle: { fontSize: 14, fontWeight: '600', color: COLORS.slate[800] },
  emptySub: { fontSize: 12, color: COLORS.slate[400], marginTop: 4 }
});
