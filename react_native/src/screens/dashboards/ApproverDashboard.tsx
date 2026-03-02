import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { Card, SectionHeader, StatusBadge } from '../../components/Shared';
import { COLORS } from '../../constants/theme';
import { getApproverDashboardSummary } from '../../api/dashboardApi';

interface ApproverDashboardProps {
  onAction: (flow: string) => void;
  onLogout?: () => void;
}

export function ApproverDashboard({ onAction, onLogout }: ApproverDashboardProps) {
  const [data, setData] = useState<{
    hospitalName: string;
    pendingCount: number;
    priorityItems: { id: string; asset: string; desc: string; cost: string | null; priority: string; status: string }[];
    approvalHistory: { id: string; title: string; meta: string; time: string }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    const res = await getApproverDashboardSummary();
    if (res.success && res.data) {
      setData(res.data);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading && !data) {
    return (
      <View style={styles.container}>
        <Header title="Approver" onNotificationClick={() => onAction('notifications')} onAvatarPress={onLogout} />
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </View>
    );
  }

  const hospitalName = data?.hospitalName || '';
  const pendingCount = data?.pendingCount ?? 0;
  const priorityItems = data?.priorityItems ?? [];
  const approvalHistory = data?.approvalHistory ?? [];

  return (
    <View style={styles.container}>
      <Header title="Approver" onNotificationClick={() => onAction('notifications')} onAvatarPress={onLogout} />
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
          <View style={styles.kpiIconBg}>
            <Ionicons name="checkmark-circle" size={120} color="rgba(255,255,255,0.1)" />
          </View>
        </View>

        <SectionHeader title="Priority Review" onSeeAll={() => onAction('admin_approval_list')} />
        {priorityItems.length === 0 ? (
          <View style={styles.emptySection}>
            <Text style={styles.emptyText}>No pending approvals</Text>
          </View>
        ) : (
          priorityItems.map((req) => (
            <Card key={req.id} onPress={() => onAction('admin_review')} leftBorder={COLORS.danger} style={styles.priorityCard}>
              <View style={styles.priorityHeader}>
                <Text style={styles.priorityId}>{req.id} - {req.priority}</Text>
                <StatusBadge status="Pending" />
              </View>
              <Text style={styles.priorityAsset}>{req.asset}</Text>
              <Text style={styles.priorityDesc}>{req.desc}</Text>
              <View style={styles.priorityFooter}>
                {req.cost ? <Text style={styles.priorityCost}>{req.cost}</Text> : <View />}
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
                  <Text style={styles.historyMeta}>{h.meta || h.time}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={COLORS.slate[300]} />
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
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
  barText: { fontSize: 10, fontWeight: '700', color: COLORS.slate[800], letterSpacing: 1, textTransform: 'uppercase' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  welcome: { marginBottom: 24 },
  welcomeTitle: { fontSize: 20, fontWeight: '700', color: COLORS.slate[900] },
  welcomeSub: { fontSize: 14, color: COLORS.slate[500], marginTop: 4 },
  kpi: {
    backgroundColor: COLORS.slate[900],
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    overflow: 'hidden'
  },
  kpiHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  kpiLabel: { fontSize: 12, color: COLORS.slate[400], fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  kpiBadge: { paddingHorizontal: 8, paddingVertical: 2, backgroundColor: 'rgba(245,158,11,0.2)', borderRadius: 4 },
  kpiBadgeText: { fontSize: 8, fontWeight: '800', color: COLORS.amber[400], textTransform: 'uppercase' },
  kpiRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  kpiValue: { fontSize: 28, fontWeight: '800', color: COLORS.white },
  reviewBtn: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: COLORS.primary, borderRadius: 12 },
  reviewBtnText: { fontSize: 10, fontWeight: '700', color: COLORS.white, textTransform: 'uppercase' },
  kpiIconBg: { position: 'absolute', bottom: -16, right: -16 },
  priorityCard: { marginBottom: 16 },
  priorityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  priorityId: { fontSize: 10, fontWeight: '700', color: COLORS.slate[400], textTransform: 'uppercase' },
  priorityAsset: { fontSize: 14, fontWeight: '700', color: COLORS.slate[800], marginBottom: 4 },
  priorityDesc: { fontSize: 10, color: COLORS.slate[500], marginBottom: 16 },
  priorityFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: COLORS.slate[100] },
  priorityCost: { fontSize: 14, fontWeight: '800', color: COLORS.danger },
  reviewLink: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  reviewLinkText: { fontSize: 10, fontWeight: '700', color: COLORS.primary, textTransform: 'uppercase' },
  historyList: { backgroundColor: COLORS.white, borderRadius: 16, borderWidth: 1, borderColor: COLORS.slate[200], overflow: 'hidden' },
  historyItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.slate[50] },
  historyIcon: { width: 36, height: 36, borderRadius: 8, backgroundColor: COLORS.emerald[50], alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  historyContent: { flex: 1 },
  historyTitle: { fontSize: 12, fontWeight: '700', color: COLORS.slate[800] },
  historyMeta: { fontSize: 10, color: COLORS.slate[400], marginTop: 2 }
});
