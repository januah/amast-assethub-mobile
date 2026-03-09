import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { AnimatedScreen } from '../components/AnimatedScreen';
import { Card, StatusBadge, Stepper } from '../components/Shared';
import { COLORS } from '../constants/theme';
import {
  getServiceRequestById,
  updateServiceRequestStatus,
  getServiceRequestStatusHistory,
  type ServiceRequestItem,
  type StatusHistoryItem,
} from '../api/serviceRequestApi';

function formatDate(s: string | null | undefined): string {
  if (!s) return '-';
  try {
    const d = new Date(s);
    return isNaN(d.getTime()) ? String(s) : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return String(s);
  }
}

function getPriorityColor(p: string): string {
  if (!p) return COLORS.primary;
  const lower = p.toLowerCase();
  if (lower.includes('critical')) return COLORS.danger;
  if (lower.includes('urgent')) return COLORS.amber[500];
  return COLORS.primary;
}

interface JobExecutionScreenProps {
  requestId: string;
  onBack: () => void;
  onComplete?: () => void;
}

export function JobExecutionScreen({ requestId, onBack, onComplete }: JobExecutionScreenProps) {
  const [job, setJob] = useState<ServiceRequestItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<'start' | 'complete' | null>(null);
  const [notes, setNotes] = useState('');
  const [statusHistory, setStatusHistory] = useState<StatusHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchJob = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const res = await getServiceRequestById(requestId);
      const err = res as { success?: boolean; message?: string };
      if (err?.success === false || err?.message) {
        setJob(null);
        setError(err.message || 'Failed to load job');
      } else {
        setJob(res as ServiceRequestItem);
      }
    } catch {
      setJob(null);
      setError('Failed to load job');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [requestId]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  const fetchStatusHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await getServiceRequestStatusHistory(requestId);
      const err = res as { success?: boolean; message?: string };
      if (err?.success === false || err?.message) {
        setStatusHistory([]);
      } else {
        setStatusHistory(Array.isArray(res) ? res : (res as { data?: StatusHistoryItem[] })?.data ?? []);
      }
    } catch {
      setStatusHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    if (isCompleted) fetchStatusHistory();
  }, [isCompleted, fetchStatusHistory]);

  const handleStartJob = useCallback(async () => {
    setActionLoading('start');
    try {
      const res = await updateServiceRequestStatus(requestId, { status: 'IN_PROGRESS', notes: notes.trim() || undefined });
      const err = res as { success?: boolean; message?: string };
      if (err?.success === false || err?.message) {
        setError(err.message || 'Failed to start job');
      } else {
        setJob(res as ServiceRequestItem);
        setNotes('');
        onComplete?.();
      }
    } catch {
      setError('Failed to start job');
    } finally {
      setActionLoading(null);
    }
  }, [requestId, notes, onComplete]);

  const handleCompleteJob = useCallback(async () => {
    setActionLoading('complete');
    try {
      const res = await updateServiceRequestStatus(requestId, { status: 'COMPLETED', notes: notes.trim() || undefined });
      const err = res as { success?: boolean; message?: string };
      if (err?.success === false || err?.message) {
        setError(err.message || 'Failed to complete job');
      } else {
        setJob(res as ServiceRequestItem);
        setNotes('');
        onComplete?.();
      }
    } catch {
      setError('Failed to complete job');
    } finally {
      setActionLoading(null);
    }
  }, [requestId, notes, onComplete]);

  const status = (job?.status || '').toUpperCase();
  const isOpen = status === 'OPEN';
  const isInProgress = ['IN_PROGRESS', 'WAITING'].includes(status);
  const isCompleted = status === 'COMPLETED';
  const canStart = isOpen;
  const canComplete = isInProgress;

  const statusSteps = ['Pending', 'In Progress', 'Completed'];
  const statusStepIndex = isCompleted ? 2 : isInProgress ? 1 : 0;

  const assetName = job?.Asset?.name || (job as Record<string, unknown>)?.Asset?.name || '-';
  const priorityName = job?.Priority?.name || (job as Record<string, unknown>)?.Priority?.name || 'Normal';
  const requesterName = job?.requester?.full_name || (job?.requester as Record<string, unknown>)?.full_name || '-';
  const embeddedHistory = (job?.ServiceRequestStatusHistories ?? []) as StatusHistoryItem[];
  const displayHistory = statusHistory.length > 0 ? statusHistory : embeddedHistory;

  if (loading) {
    return (
      <AnimatedScreen style={styles.container}>
        <Header title="Job Execution" showBack onBack={onBack} />
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </AnimatedScreen>
    );
  }

  if (error && !job) {
    return (
      <AnimatedScreen style={styles.container}>
        <Header title="Job Execution" showBack onBack={onBack} />
        <View style={styles.errorWrap}>
          <Ionicons name="alert-circle-outline" size={40} color={COLORS.slate[400]} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </AnimatedScreen>
    );
  }

  return (
    <AnimatedScreen style={styles.container}>
      <Header title="Job Execution" showBack onBack={onBack} />
      <Stepper steps={statusSteps} current={statusStepIndex} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchJob(true)} colors={[COLORS.primary]} />
        }
      >
        <Card style={styles.card} leftBorder={COLORS.primary}>
          <View style={styles.header}>
            <Text style={styles.requestId}>{job?.request_id}</Text>
            <StatusBadge status={isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'Pending'} />
          </View>
          <Text style={styles.title}>{job?.description || assetName}</Text>
          <View style={styles.row}>
            <Ionicons name="cube-outline" size={14} color={COLORS.slate[500]} />
            <Text style={styles.rowText}>{assetName}</Text>
          </View>
          <View style={styles.row}>
            <Ionicons name="person-outline" size={14} color={COLORS.slate[500]} />
            <Text style={styles.rowText}>Requester: {requesterName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.priorityText, { color: getPriorityColor(priorityName) }]}>{priorityName} Priority</Text>
          </View>
          <Text style={styles.meta}>Created {formatDate(job?.created_at)}</Text>
        </Card>

        {isCompleted && (
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Status History</Text>
            {historyLoading ? (
              <ActivityIndicator size="small" color={COLORS.primary} style={styles.historyLoading} />
            ) : displayHistory.length > 0 ? (
              displayHistory.map((h, idx) => (
                <View
                  key={h.history_id ?? idx}
                  style={[styles.historyItem, idx === displayHistory.length - 1 && styles.historyItemLast]}
                >
                  <View style={styles.historyRow}>
                    <Text style={styles.historyStatus}>
                      {String(h.from_status).replace(/_/g, ' ')} → {String(h.to_status).replace(/_/g, ' ')}
                    </Text>
                    <Text style={styles.historyDate}>{formatDate(h.changed_at)}</Text>
                  </View>
                  {(h.changedBy as { full_name?: string })?.full_name ? (
                    <Text style={styles.historyBy}>by {(h.changedBy as { full_name: string }).full_name}</Text>
                  ) : null}
                  {h.comments ? (
                    <Text style={styles.historyNotes}>{h.comments}</Text>
                  ) : null}
                </View>
              ))
            ) : (
              <Text style={styles.historyEmpty}>No status history</Text>
            )}
          </Card>
        )}

        {!isCompleted && (canStart || canComplete) && (
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Add notes (optional)"
              placeholderTextColor={COLORS.slate[400]}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />
            <View style={styles.actions}>
              {canStart && (
                <TouchableOpacity
                  style={[styles.actionBtn, styles.startBtn]}
                  onPress={handleStartJob}
                  disabled={!!actionLoading}
                >
                  {actionLoading === 'start' ? (
                    <ActivityIndicator size="small" color={COLORS.white} />
                  ) : (
                    <Text style={styles.actionBtnText}>Start Job</Text>
                  )}
                </TouchableOpacity>
              )}
              {canComplete && (
                <TouchableOpacity
                  style={[styles.actionBtn, styles.completeBtn]}
                  onPress={handleCompleteJob}
                  disabled={!!actionLoading}
                >
                  {actionLoading === 'complete' ? (
                    <ActivityIndicator size="small" color={COLORS.white} />
                  ) : (
                    <Text style={styles.actionBtnText}>Complete Job</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </Card>
        )}

        {error ? <Text style={styles.errorInline}>{error}</Text> : null}
      </ScrollView>
    </AnimatedScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.slate[50] },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  errorText: { fontSize: 14, color: COLORS.slate[500], marginTop: 12, textAlign: 'center' },
  errorInline: { fontSize: 12, color: COLORS.danger, marginTop: 8, textAlign: 'center' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  card: { marginBottom: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  requestId: { fontSize: 12, fontWeight: '600', color: COLORS.slate[400], textTransform: 'uppercase' },
  title: { fontSize: 16, fontWeight: '600', color: COLORS.slate[800], marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  rowText: { fontSize: 12, color: COLORS.slate[600] },
  priorityText: { fontSize: 12, fontWeight: '600' },
  meta: { fontSize: 10, color: COLORS.slate[400], marginTop: 8 },
  sectionTitle: { fontSize: 12, fontWeight: '600', color: COLORS.slate[600], marginBottom: 8 },
  notesInput: {
    borderWidth: 1,
    borderColor: COLORS.slate[200],
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: COLORS.slate[800],
    minHeight: 80,
    textAlignVertical: 'top'
  },
  actions: { flexDirection: 'row', gap: 12, marginTop: 16 },
  actionBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  startBtn: { backgroundColor: COLORS.primary },
  completeBtn: { backgroundColor: COLORS.emerald[600] },
  actionBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.white },
  historyLoading: { paddingVertical: 16 },
  historyItem: { marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: COLORS.slate[100] },
  historyItemLast: { marginBottom: 0, paddingBottom: 0, borderBottomWidth: 0 },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  historyStatus: { fontSize: 12, fontWeight: '600', color: COLORS.slate[800], flex: 1 },
  historyDate: { fontSize: 10, color: COLORS.slate[400] },
  historyBy: { fontSize: 10, color: COLORS.slate[500], marginBottom: 4 },
  historyNotes: { fontSize: 12, color: COLORS.slate[600], marginTop: 4, fontStyle: 'italic' },
  historyEmpty: { fontSize: 12, color: COLORS.slate[400], paddingVertical: 8 }
});
