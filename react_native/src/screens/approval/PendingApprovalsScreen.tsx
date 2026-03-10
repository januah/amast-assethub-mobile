import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { AnimatedScreen } from '../../components/AnimatedScreen';
import { Card, StatusBadge } from '../../components/Shared';
import { COLORS } from '../../constants/theme';
import {
  getPendingApprovals,
  approveQuotation,
  rejectQuotation,
  approveRemoval,
  rejectRemoval,
  type PendingApprovalItem,
  type PendingApprovalType
} from '../../api/pendingApprovalsApi';
import { getServiceRequestById } from '../../api/serviceRequestApi';
import { getReplacementById } from '../../api/replacementApi';
import type { ServiceRequestItem } from '../../api/serviceRequestApi';

const ITEMS_PER_PAGE = 15;

function formatRelativeTime(dateStr: string | undefined): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function getAccentColor(priority: string): string {
  const p = (priority || '').toLowerCase();
  if (p.includes('critical')) return COLORS.danger;
  if (p.includes('urgent')) return COLORS.amber[600];
  return COLORS.sky[600];
}

function displayType(type: PendingApprovalType): string {
  return type === 'Removal' ? 'Replacement' : type;
}

interface PendingApprovalsScreenProps {
  onBack: () => void;
}

export function PendingApprovalsScreen({ onBack }: PendingApprovalsScreenProps) {
  const [filter, setFilter] = useState<'All' | 'Quotation' | 'Replacement'>('All');
  const [items, setItems] = useState<PendingApprovalItem[]>([]);
  const [totalAmount, setTotalAmount] = useState('0.00');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [detailView, setDetailView] = useState<PendingApprovalItem | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailData, setDetailData] = useState<ServiceRequestItem | Record<string, unknown> | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [error, setError] = useState('');

  const typeParam = filter === 'All' ? 'all' : filter === 'Quotation' ? 'quotation' : 'removal';

  const fetchList = useCallback(async (page: number, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');
    const res = await getPendingApprovals({ type: typeParam, page, limit: ITEMS_PER_PAGE });
    if (isRefresh) setRefreshing(false);
    else setLoading(false);
    const data = res as { data?: PendingApprovalItem[]; meta?: { totalPages?: number; totalAmount?: string } };
    if (!data?.data) {
      setItems([]);
      setError((res as { message?: string }).message || 'Failed to load');
      return;
    }
    setItems(data.data);
    setTotalPages(data.meta?.totalPages ?? 1);
    setTotalAmount(data.meta?.totalAmount ?? '0.00');
  }, [typeParam]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  useEffect(() => {
    fetchList(currentPage);
  }, [fetchList, currentPage]);

  const openDetail = useCallback(async (item: PendingApprovalItem) => {
    setDetailView(item);
    setDetailLoading(true);
    setDetailData(null);
    try {
      if (item.type === 'Removal' && item.replacement_id) {
        const res = await getReplacementById(item.replacement_id);
        setDetailData((res as { data?: unknown })?.data ?? item);
      } else if (item.id.startsWith('REQ')) {
        const res = await getServiceRequestById(item.id);
        setDetailData((res as unknown as ServiceRequestItem) ?? item);
      } else {
        setDetailData(item);
      }
    } catch {
      setDetailData(item);
    }
    setDetailLoading(false);
  }, []);

  const closeDetail = useCallback((refresh = false) => {
    setDetailView(null);
    setDetailData(null);
    setShowRejectInput(false);
    setRejectReason('');
    if (refresh) fetchList(currentPage, true);
  }, [fetchList, currentPage]);

  const handleApprove = useCallback(async () => {
    if (!detailView || actionLoading) return;
    const qId = detailView.quotation_id;
    const rId = detailView.replacement_id;
    if ((detailView.type === 'Quotation' && !qId) || (detailView.type === 'Removal' && !rId)) return;
    setActionLoading(true);
    setError('');
    try {
      let res;
      if (detailView.type === 'Quotation') {
        res = await approveQuotation(qId!);
      } else {
        res = await approveRemoval(rId!);
      }
      if (res?.success) {
        closeDetail(true);
      } else {
        setError((res as { message?: string })?.message || 'Approval failed');
      }
    } catch (e) {
      setError((e as Error)?.message || 'Approval failed');
    } finally {
      setActionLoading(false);
    }
  }, [detailView, actionLoading, closeDetail]);

  const handleReject = useCallback(async () => {
    if (!detailView || actionLoading) return;
    if (!showRejectInput) {
      setShowRejectInput(true);
      return;
    }
    const qId = detailView.quotation_id;
    const rId = detailView.replacement_id;
    if ((detailView.type === 'Quotation' && !qId) || (detailView.type === 'Removal' && !rId)) return;
    setActionLoading(true);
    setError('');
    try {
      let res;
      if (detailView.type === 'Quotation') {
        res = await rejectQuotation(qId!, rejectReason || undefined);
      } else {
        res = await rejectRemoval(rId!, rejectReason || undefined);
      }
      if (res?.success) {
        closeDetail(true);
      } else {
        setError((res as { message?: string })?.message || 'Rejection failed');
      }
    } catch (e) {
      setError((e as Error)?.message || 'Rejection failed');
    } finally {
      setActionLoading(false);
    }
  }, [detailView, actionLoading, showRejectInput, rejectReason, closeDetail]);

  if (detailView) {
    return (
      <AnimatedScreen style={styles.container}>
        <Header title="Request Details" showBack onBack={closeDetail} />
        {detailLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <ScrollView style={styles.scroll} contentContainerStyle={styles.detailContent} showsVerticalScrollIndicator={false}>
            <View style={[styles.detailCard, { borderLeftColor: getAccentColor(detailView.priority) }]}>
              <View style={styles.detailHeader}>
                <Text style={styles.detailId}>{detailView.id} - {displayType(detailView.type)}</Text>
                <StatusBadge status="Pending" />
              </View>
              <Text style={styles.detailAsset}>{detailView.asset}</Text>
              <View style={styles.detailMetaRow}>
                <Ionicons name="person-outline" size={14} color={COLORS.slate[500]} />
                <Text style={styles.detailMeta}>{detailView.requester}</Text>
              </View>
              <View style={styles.detailMetaRow}>
                <Ionicons name="time-outline" size={14} color={COLORS.slate[500]} />
                <Text style={styles.detailMeta}>{formatRelativeTime(detailView.date)}</Text>
              </View>
              {detailView.description ? (
                <Text style={styles.detailDesc}>{detailView.description}</Text>
              ) : null}
              <View style={styles.detailCostRow}>
                <Text style={styles.detailCost}>
                  {detailView.type === 'Removal' ? 'Replacement (No Cost)' : detailView.cost}
                </Text>
              </View>
              {showRejectInput && (
                <TextInput
                  style={styles.rejectInput}
                  placeholder="Reject reason (optional)"
                  placeholderTextColor={COLORS.slate[400]}
                  value={rejectReason}
                  onChangeText={setRejectReason}
                  multiline
                  editable={!actionLoading}
                />
              )}
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.approveBtn]}
                  onPress={handleApprove}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <ActivityIndicator size="small" color={COLORS.white} />
                  ) : (
                    <Text style={styles.actionBtnText}>Approve</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.rejectBtn]}
                  onPress={handleReject}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <ActivityIndicator size="small" color={COLORS.danger} />
                  ) : (
                    <Text style={styles.rejectBtnText}>{showRejectInput ? 'Confirm Reject' : 'Reject'}</Text>
                  )}
                </TouchableOpacity>
              </View>
              {error ? (
                <View style={[styles.errorWrap, { marginTop: 16 }]}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}
            </View>
          </ScrollView>
        )}
      </AnimatedScreen>
    );
  }

  return (
    <AnimatedScreen style={styles.container}>
      <Header title="Pending Approvals" showBack onBack={onBack} />

      <View style={styles.filterBar}>
        {(['All', 'Quotation', 'Replacement'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.filterTab, filter === t && styles.filterTabActive]}
            onPress={() => setFilter(t)}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterTabText, filter === t && styles.filterTabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchList(1, true)} colors={[COLORS.primary]} />
        }
      >
        <View style={styles.summaryBar}>
          <Text style={styles.summaryCount}>{items.length} REQUESTS PENDING</Text>
          {filter !== 'Replacement' && (
            <View style={styles.summaryTotal}>
              <Ionicons name="cash-outline" size={12} color={COLORS.slate[400]} />
              <Text style={styles.summaryTotalText}>Total: RM {totalAmount}</Text>
            </View>
          )}
        </View>

        {error ? (
          <View style={styles.errorWrap}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : loading && !refreshing ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : items.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="checkmark-done-outline" size={48} color={COLORS.slate[300]} />
            <Text style={styles.emptyTitle}>Clear!</Text>
            <Text style={styles.emptyText}>
              No {filter !== 'All' ? (filter === 'Replacement' ? 'replacement' : filter.toLowerCase()) : ''} items pending approval.
            </Text>
          </View>
        ) : (
          items.map((item) => (
            <Card
              key={item.id + item.type}
              style={[styles.card, { borderLeftWidth: 4, borderLeftColor: getAccentColor(item.priority) }]}
              onPress={() => openDetail(item)}
            >
              <View style={styles.cardTop}>
                <View style={styles.cardTypeRow}>
                  <View style={[styles.typeIcon, item.type === 'Quotation' ? styles.typeIconQuotation : styles.typeIconRemoval]}>
                    <Ionicons
                      name={item.type === 'Quotation' ? 'cash-outline' : 'car-outline'}
                      size={16}
                      color={item.type === 'Quotation' ? COLORS.emerald[600] : COLORS.amber[600]}
                    />
                  </View>
                  <Text style={styles.cardId}>{item.id} - {displayType(item.type)}</Text>
                </View>
                <StatusBadge status="Pending" />
              </View>
              <Text style={styles.cardAsset}>{item.asset}</Text>
              <View style={styles.cardMetaRow}>
                <Ionicons name="person-outline" size={12} color={COLORS.slate[500]} />
                <Text style={styles.cardMeta}>{item.requester}</Text>
                <Ionicons name="time-outline" size={12} color={COLORS.slate[500]} style={styles.cardMetaSpacer} />
                <Text style={styles.cardMeta}>{formatRelativeTime(item.date)}</Text>
              </View>
              <View style={styles.cardFooter}>
                <Text style={styles.cardCost}>
                  {item.type === 'Removal' ? 'Replacement (No Cost)' : item.cost}
                </Text>
                <View style={styles.reviewLink}>
                  <Text style={styles.reviewLinkText}>Review Now</Text>
                  <Ionicons name="chevron-forward" size={12} color={COLORS.primary} />
                </View>
              </View>
            </Card>
          ))
        )}
        {!loading && items.length > 0 && totalPages > 1 && (
          <View style={styles.pagination}>
            <TouchableOpacity
              style={[styles.pageBtn, currentPage <= 1 && styles.pageBtnDisabled]}
              onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
            >
              <Text style={styles.pageBtnText}>Previous</Text>
            </TouchableOpacity>
            <Text style={styles.pageInfo}>Page {currentPage} of {totalPages}</Text>
            <TouchableOpacity
              style={[styles.pageBtn, currentPage >= totalPages && styles.pageBtnDisabled]}
              onPress={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
            >
              <Text style={styles.pageBtnText}>Next</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </AnimatedScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.slate[50] },
  filterBar: {
    flexDirection: 'row',
    padding: 4,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate[100]
  },
  filterTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12
  },
  filterTabActive: { backgroundColor: COLORS.slate[900], shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  filterTabText: { fontSize: 10, fontWeight: '600', color: COLORS.slate[400], letterSpacing: 1 },
  filterTabTextActive: { color: COLORS.white },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8
  },
  summaryCount: { fontSize: 10, fontWeight: '600', color: COLORS.slate[400], letterSpacing: 1 },
  summaryTotal: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  summaryTotalText: { fontSize: 10, fontWeight: '600', color: COLORS.slate[400] },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 80 },
  loading: { paddingVertical: 48, alignItems: 'center' },
  empty: { paddingVertical: 48, alignItems: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: COLORS.slate[800], marginTop: 12 },
  emptyText: { fontSize: 12, color: COLORS.slate[500], marginTop: 4 },
  errorWrap: { padding: 16, backgroundColor: '#fef2f2', borderRadius: 12, marginBottom: 12 },
  errorText: { fontSize: 12, color: COLORS.danger },
  card: { marginBottom: 12, paddingLeft: 12 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  cardTypeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  typeIcon: { padding: 6, borderRadius: 8 },
  typeIconQuotation: { backgroundColor: COLORS.emerald[50] },
  typeIconRemoval: { backgroundColor: COLORS.amber[50] },
  cardId: { fontSize: 10, fontWeight: '600', color: COLORS.slate[400], textTransform: 'uppercase' },
  cardAsset: { fontSize: 14, fontWeight: '600', color: COLORS.slate[800], marginBottom: 8 },
  cardMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 12 },
  cardMeta: { fontSize: 10, color: COLORS.slate[500] },
  cardMetaSpacer: { marginLeft: 12 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.slate[100]
  },
  cardCost: { fontSize: 14, fontWeight: '600', color: COLORS.slate[900] },
  reviewLink: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  reviewLinkText: { fontSize: 10, fontWeight: '600', color: COLORS.primary, textTransform: 'uppercase' },
  detailContent: { padding: 16, paddingBottom: 80 },
  detailCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    borderLeftWidth: 4
  },
  detailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  detailId: { fontSize: 10, fontWeight: '600', color: COLORS.slate[400], textTransform: 'uppercase', letterSpacing: 2 },
  detailAsset: { fontSize: 20, fontWeight: '600', color: COLORS.slate[900], marginBottom: 8 },
  detailMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  detailMeta: { fontSize: 12, color: COLORS.slate[500] },
  detailDesc: { fontSize: 12, color: COLORS.slate[600], marginTop: 12, lineHeight: 18 },
  detailCostRow: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: COLORS.slate[100] },
  detailCost: { fontSize: 16, fontWeight: '600', color: COLORS.slate[900] },
  rejectInput: {
    marginTop: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.slate[200],
    borderRadius: 12,
    fontSize: 14,
    color: COLORS.slate[800],
    minHeight: 64
  },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 24 },
  actionBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  approveBtn: { backgroundColor: COLORS.emerald[600] },
  rejectBtn: { backgroundColor: COLORS.slate[100], borderWidth: 1, borderColor: COLORS.slate[300] },
  actionBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.white },
  rejectBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.danger },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginTop: 24
  },
  pageBtn: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: COLORS.primary, borderRadius: 12 },
  pageBtnDisabled: { backgroundColor: COLORS.slate[300], opacity: 0.7 },
  pageBtnText: { fontSize: 12, fontWeight: '600', color: COLORS.white },
  pageInfo: { fontSize: 12, color: COLORS.slate[600] }
});
