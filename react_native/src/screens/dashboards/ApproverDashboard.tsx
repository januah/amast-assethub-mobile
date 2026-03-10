import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { AnimatedScreen } from '../../components/AnimatedScreen';
import { DashboardSkeleton } from '../../components/DashboardSkeleton';
import { Card, SectionHeader, StatusBadge } from '../../components/Shared';
import { COLORS } from '../../constants/theme';
import { DASHBOARD_SKELETON_MIN_MS } from '../../config/dashboard';
import { getApproverDashboardSummary } from '../../api/dashboardApi';
import { getPendingApprovals, type PendingApprovalItem } from '../../api/pendingApprovalsApi';
import { getServiceRequests } from '../../api/serviceRequestApi';

const PENDING_PREVIEW_LIMIT = 3;
const APPROVAL_HISTORY_LIMIT = 10;

interface ApproverDashboardProps {
  onAction: (flow: string) => void;
  onLogout?: () => void;
}

function formatApprovalTime(s: string | undefined): string {
  if (!s) return '';
  const d = new Date(s);
  return isNaN(d.getTime()) ? s : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function ApproverDashboard({ onAction, onLogout }: ApproverDashboardProps) {
  const [hospitalName, setHospitalName] = useState('');
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingItems, setPendingItems] = useState<PendingApprovalItem[]>([]);
  const [approvalHistory, setApprovalHistory] = useState<{ id: string; title: string; meta: string; time: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    const delayPromise = isRefresh ? Promise.resolve() : new Promise<void>((r) => setTimeout(r, DASHBOARD_SKELETON_MIN_MS));
    const [fetchResult] = await Promise.all([
      Promise.all([
        getApproverDashboardSummary(),
        getPendingApprovals({ type: 'all', page: 1, limit: PENDING_PREVIEW_LIMIT }),
        getServiceRequests({ status: 'APPROVED', page: 1, limit: APPROVAL_HISTORY_LIMIT }),
      ]),
      delayPromise,
    ]);
    const [summaryRes, pendingRes, approvedRes] = fetchResult;
    if (summaryRes.success && summaryRes.data) {
      setHospitalName(summaryRes.data.hospitalName ?? '');
    }
    const pendingData = pendingRes as { data?: PendingApprovalItem[]; meta?: { totalItems?: number } };
    setPendingCount(pendingData?.meta?.totalItems ?? 0);
    setPendingItems(pendingData?.data ?? []);
    const approvedData = approvedRes as { data?: { request_id: string; Asset?: { name?: string }; description?: string; requester?: { full_name?: string }; created_at?: string }[] };
    const list = approvedData?.data ?? [];
    setApprovalHistory(
      list.map((r) => ({
        id: r.request_id,
        title: r.Asset?.name ?? r.request_id,
        meta: r.requester?.full_name ?? r.description ?? '',
        time: formatApprovalTime(r.created_at),
      }))
    );
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading && hospitalName === '' && pendingItems.length === 0 && approvalHistory.length === 0) {
    return (
      <AnimatedScreen style={styles.container}>
        <Header title="Approver" onNotificationClick={() => onAction('notifications')} onAvatarPress={onLogout} />
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <DashboardSkeleton />
        </ScrollView>
      </AnimatedScreen>
    );
  }

  return (
    <AnimatedScreen style={styles.container}>
      <Header title="Dashboard" onNotificationClick={() => onAction('notifications')} onAvatarPress={onLogout} />
      <View style={styles.bar}>
        <Ionicons name="checkmark-circle" size={16} color={COLORS.emerald[600]} />
        <Text style={styles.barText}>{hospitalName || 'Hospital'}</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} colors={[COLORS.primary]} />
        }
      >
        <View style={styles.welcome}>
          <Text style={styles.welcomeTitle}>Pending Actions</Text>
          <Text style={styles.welcomeSub}>You have items requiring authorization</Text>
        </View>

        <View style={styles.kpi}>
          <View style={styles.kpiHeader}>
            <Text style={styles.kpiLabel}>Pending Approvals</Text>
            {pendingCount > 0 && (
              <View style={styles.kpiBadge}>
                <Text style={styles.kpiBadgeText}>Requires Action</Text>
              </View>
            )}
          </View>
          <View style={styles.kpiRow}>
            <Text style={styles.kpiValue}>{pendingCount} Request{pendingCount !== 1 ? 's' : ''}</Text>
            <TouchableOpacity style={styles.reviewBtn} onPress={() => onAction('admin_approval_list')}>
              <Text style={styles.reviewBtnText}>Review All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.kpiIconBg} pointerEvents="none">
            <Ionicons name="checkmark-circle" size={120} color="rgba(255,255,255,0.1)" />
          </View>
        </View>

        <SectionHeader title="Pending Approvals" onSeeAll={() => onAction('admin_approval_list')} />
        {pendingItems.length === 0 ? (
          <View style={styles.emptySection}>
            <Text style={styles.emptyText}>No pending approvals</Text>
          </View>
        ) : (
          pendingItems.map((item) => (
            <Card
              key={`${item.id}-${item.type}`}
              onPress={() => onAction('admin_approval_list')}
              style={[
                styles.priorityCard,
                { borderLeftWidth: 4, borderLeftColor: item.type === 'Quotation' ? COLORS.emerald[600] : COLORS.amber[600] },
              ]}
            >
              <View style={styles.priorityHeader}>
                <View style={styles.priorityHeaderLeft}>
                  <View style={[styles.typePill, item.type === 'Quotation' ? styles.typePillQuotation : styles.typePillRemoval]}>
                    <Ionicons
                      name={item.type === 'Quotation' ? 'cash-outline' : 'car-outline'}
                      size={12}
                      color={item.type === 'Quotation' ? COLORS.emerald[700] : COLORS.amber[700]}
                    />
                    <Text style={[styles.typePillText, item.type === 'Quotation' ? styles.typePillTextQuotation : styles.typePillTextRemoval]}>
                      {item.type === 'Removal' ? 'Replacement' : item.type}
                    </Text>
                  </View>
                  <Text style={styles.priorityId}>{item.id} - {item.priority}</Text>
                </View>
                <StatusBadge status="Pending" />
              </View>
              <Text style={styles.priorityAsset}>{item.asset}</Text>
              {item.description ? <Text style={styles.priorityDesc} numberOfLines={2}>{item.description}</Text> : null}
              <View style={styles.priorityFooter}>
                <Text style={styles.priorityCost}>
                  {item.type === 'Removal' ? 'Replacement (No Cost)' : (item.cost ?? '—')}
                </Text>
                <View style={styles.reviewLink}>
                  <Text style={styles.reviewLinkText}>Review</Text>
                  <Ionicons name="chevron-forward" size={12} color={COLORS.primary} />
                </View>
              </View>
            </Card>
          ))
        )}

        <SectionHeader title="Approval History" onSeeAll={() => onAction('records')} />
        <View style={styles.historyList}>
          {approvalHistory.length === 0 ? (
            <View style={styles.emptyHistory}>
              <Text style={styles.emptyText}>No recent approvals</Text>
            </View>
          ) : (
            approvalHistory.map((h) => (
              <TouchableOpacity key={h.id} style={styles.historyItem} activeOpacity={0.8}>
                <View style={styles.historyIcon}>
                  <Ionicons name="checkmark-circle" size={18} color={COLORS.emerald[600]} />
                </View>
                <View style={styles.historyContent}>
                  <Text style={styles.historyTitle}>{h.title}</Text>
                  <Text style={styles.historyMeta}>{h.meta}</Text>
                </View>
                <Text style={styles.historyTime}>{h.time}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </AnimatedScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.slate[50] },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptySection: { padding: 24, alignItems: 'center' },
  emptyHistory: { padding: 24, alignItems: 'center' },
  emptyText: { fontSize: 14, color: COLORS.slate[500], fontWeight: '600' },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate[200]
  },
  barText: { fontSize: 10, fontWeight: '600', color: COLORS.slate[800], letterSpacing: 1, textTransform: 'uppercase' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  welcome: { marginBottom: 24 },
  welcomeTitle: { fontSize: 20, fontWeight: '600', color: COLORS.slate[900] },
  welcomeSub: { fontSize: 14, color: COLORS.slate[500], marginTop: 4 },
  kpi: {
    backgroundColor: COLORS.slate[900],
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    overflow: 'hidden'
  },
  kpiHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  kpiLabel: { fontSize: 12, color: COLORS.slate[400], fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  kpiBadge: { paddingHorizontal: 8, paddingVertical: 2, backgroundColor: 'rgba(245,158,11,0.2)', borderRadius: 4 },
  kpiBadgeText: { fontSize: 8, fontWeight: '600', color: COLORS.amber[400], textTransform: 'uppercase' },
  kpiRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  kpiValue: { fontSize: 28, fontWeight: '600', color: COLORS.white },
  reviewBtn: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: COLORS.primary, borderRadius: 12 },
  reviewBtnText: { fontSize: 10, fontWeight: '600', color: COLORS.white, textTransform: 'uppercase' },
  kpiIconBg: { position: 'absolute', bottom: -16, right: -16 },
  priorityCard: { marginBottom: 16 },
  priorityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  priorityHeaderLeft: { flex: 1, gap: 6 },
  typePill: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  typePillQuotation: { backgroundColor: COLORS.emerald[100] },
  typePillRemoval: { backgroundColor: COLORS.amber[100] },
  typePillText: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
  typePillTextQuotation: { color: COLORS.emerald[700] },
  typePillTextRemoval: { color: COLORS.amber[700] },
  priorityId: { fontSize: 10, fontWeight: '600', color: COLORS.slate[400], textTransform: 'uppercase' },
  priorityAsset: { fontSize: 14, fontWeight: '600', color: COLORS.slate[800], marginBottom: 4 },
  priorityDesc: { fontSize: 10, color: COLORS.slate[500], marginBottom: 16 },
  priorityFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: COLORS.slate[100] },
  priorityCost: { fontSize: 14, fontWeight: '600', color: COLORS.danger },
  reviewLink: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  reviewLinkText: { fontSize: 10, fontWeight: '600', color: COLORS.primary, textTransform: 'uppercase' },
  historyList: { backgroundColor: COLORS.white, borderRadius: 16, borderWidth: 1, borderColor: COLORS.slate[200], overflow: 'hidden' },
  historyItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.slate[50] },
  historyIcon: { width: 36, height: 36, borderRadius: 8, backgroundColor: COLORS.emerald[50], alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  historyContent: { flex: 1 },
  historyTitle: { fontSize: 12, fontWeight: '600', color: COLORS.slate[800] },
  historyMeta: { fontSize: 10, color: COLORS.slate[400], marginTop: 2 },
  historyTime: { fontSize: 10, color: COLORS.slate[400], marginLeft: 8 }
});
