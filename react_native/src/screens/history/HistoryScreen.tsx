import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { Card, SectionHeader, StatusBadge } from '../../components/Shared';
import { COLORS } from '../../constants/theme';
import {
  getServiceRequests,
  getServiceRequestById,
  ServiceRequestItem,
  ServiceRequestStatus,
  GetServiceRequestsResponse
} from '../../api/serviceRequestApi';

const ITEMS_PER_PAGE = 10;

const STATUS_OPTIONS: { value: ServiceRequestStatus | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'OPEN', label: 'Open' },
  { value: 'PENDING_APPROVAL', label: 'Pending Approval' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'WAITING', label: 'Waiting' },
  { value: 'AWAITING_QUOTATION', label: 'Awaiting Quotation' },
  { value: 'AWAITING_PAYMENT', label: 'Awaiting Payment' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'CANCELLED', label: 'Cancelled' }
];


const SERVICE_MODE_LABEL: Record<string, string> = {
  REPAIR: 'Breakdown',
  PPM: 'PPM',
  INSPEC: 'Inspection',
  INSTALL: 'Installation'
};

function formatDate(s: string | undefined) {
  if (!s) return '-';
  try {
    const d = new Date(s);
    return isNaN(d.getTime()) ? s : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return s;
  }
}

function parseLocation(desc: string | undefined): string {
  if (!desc) return '-';
  const m = desc.match(/\n\nLocation:\s*(.+?)(?:\n|$)/);
  return m ? m[1].trim() : '-';
}

interface HistoryScreenProps {
  onBack: () => void;
  onOpenChecklist?: () => void;
}

const STATUS_TO_LABEL: Record<string, string> = {
  CREATED: 'Request Logged',
  OPEN: 'Open',
  PENDING_APPROVAL: 'Pending Approval',
  APPROVED: 'Approved',
  IN_PROGRESS: 'In Progress',
  WAITING: 'Waiting',
  AWAITING_QUOTATION: 'Awaiting Quotation',
  AWAITING_PAYMENT: 'Awaiting Payment',
  COMPLETED: 'Completed',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled'
};

function formatTime(s: string | undefined) {
  if (!s) return '-';
  try {
    const d = new Date(s);
    return isNaN(d.getTime()) ? s : d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return s;
  }
}

export function HistoryScreen({ onBack, onOpenChecklist }: HistoryScreenProps) {
  const [tab, setTab] = useState<'requests' | 'docs'>('requests');
  const [statusFilter, setStatusFilter] = useState<ServiceRequestStatus | ''>('');
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequestItem | null>(null);
  const [items, setItems] = useState<ServiceRequestItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchRequests = useCallback(async (page: number, status?: ServiceRequestStatus | '') => {
    setLoading(true);
    setError('');
    const res = await getServiceRequests({ page, limit: ITEMS_PER_PAGE, status: status || undefined });
    setLoading(false);
    const data = res as unknown as GetServiceRequestsResponse;
    if (data?.data === undefined) {
      setItems([]);
      setTotalPages(1);
      setError((res as { message?: string }).message || 'Failed to load requests');
      return;
    }
    setItems(data.data || []);
    setTotalPages(data.meta?.totalPages ?? 1);
  }, []);

  useEffect(() => {
    if (tab === 'requests') fetchRequests(currentPage, statusFilter);
  }, [tab, fetchRequests, currentPage, statusFilter]);

  const openDetail = useCallback(async (item: ServiceRequestItem) => {
    setView('detail');
    setSelectedRequest(item);
    setDetailLoading(true);
    const res = await getServiceRequestById(item.request_id);
    setDetailLoading(false);
    if ((res as { success?: boolean }).success === false) {
      setSelectedRequest(item);
      return;
    }
    setSelectedRequest((res as unknown as ServiceRequestItem) || item);
  }, []);

  const getTypeLabel = (item: ServiceRequestItem) =>
    SERVICE_MODE_LABEL[item.service_mode || ''] || item.service_mode || 'Request';

  if (view === 'detail' && selectedRequest) {
    const isCompleted = selectedRequest.status === 'COMPLETED';
    return (
      <View style={styles.container}>
        <Header title="Request Details" showBack onBack={() => { setView('list'); setSelectedRequest(null); }} />
        {detailLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <ScrollView style={styles.scroll} contentContainerStyle={styles.detailContent} showsVerticalScrollIndicator={false}>
            <View style={styles.detailCard}>
              <View style={styles.detailHeader}>
                <Text style={styles.detailId}>{selectedRequest.request_id}</Text>
                <StatusBadge status={(selectedRequest.status ?? 'OPEN').replace(/_/g, ' ')} />
              </View>
              <Text style={styles.detailAsset}>{selectedRequest.Asset?.name || selectedRequest.asset_id || '-'}</Text>
              <Text style={styles.detailMeta}>
                {getTypeLabel(selectedRequest)} Request - {formatDate(selectedRequest.created_at)}
              </Text>
            </View>

            {isCompleted && onOpenChecklist && (
              <Card style={styles.reportCard}>
                <View style={styles.reportCardContent}>
                  <View>
                    <Text style={styles.reportCardTitle}>Technical Report Available</Text>
                    <Text style={styles.reportCardSub}>Checklist results and maintenance logs ready.</Text>
                  </View>
                  <TouchableOpacity style={styles.reportBtn} onPress={onOpenChecklist} activeOpacity={0.8}>
                    <Text style={styles.reportBtnText}>View Report</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            )}

            <SectionHeader title="Timeline" />
            <View style={styles.timelineCard}>
              {selectedRequest.ServiceRequestStatusHistories && selectedRequest.ServiceRequestStatusHistories.length > 0 ? (
                selectedRequest.ServiceRequestStatusHistories.map((step, i) => {
                  const label = STATUS_TO_LABEL[step.to_status] || step.to_status;
                  const steps = selectedRequest.ServiceRequestStatusHistories;
                  const isLast = i === steps.length - 1;
                  return (
                    <View key={`${step.to_status}-${i}`} style={styles.timelineRowWrap}>
                      <View style={styles.timelineRow}>
                        <View style={styles.timelineDotWrap}>
                          <View style={[styles.timelineDot, styles.timelineDotDone]}>
                            <Ionicons name="checkmark" size={12} color={COLORS.white} />
                          </View>
                          {!isLast && <View style={[styles.timelineLine, styles.timelineLineDone]} />}
                        </View>
                        <View style={styles.timelineContent}>
                          <Text style={styles.timelineLabel}>{label}</Text>
                          <Text style={styles.timelineTime}>{formatTime(step.changed_at)}</Text>
                        </View>
                      </View>
                    </View>
                  );
                })
              ) : (
                <Text style={styles.timelineNotFound}>Not found</Text>
              )}
            </View>

            <SectionHeader title="Information" />
            <Card style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Requester</Text>
                <Text style={styles.infoValue}>
                  {selectedRequest.requester?.full_name || selectedRequest.requester?.username || '-'}
                </Text>
              </View>
              <View style={styles.infoGrid}>
                <View style={styles.infoCell}>
                  <Text style={styles.infoLabel}>Location</Text>
                  <Text style={styles.infoValue}>{parseLocation(selectedRequest.description)}</Text>
                </View>
                <View style={styles.infoCell}>
                  <Text style={styles.infoLabel}>Date</Text>
                  <Text style={styles.infoValue}>{formatDate(selectedRequest.created_at)}</Text>
                </View>
              </View>
            </Card>
          </ScrollView>
        )}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.contactBtn}
            onPress={() => Linking.openURL('tel:+60000000000')}
            activeOpacity={0.8}
          >
            <Ionicons name="call-outline" size={20} color={COLORS.white} />
            <Text style={styles.contactBtnText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Records & History" showBack onBack={onBack} />
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, tab === 'requests' && styles.tabActive]}
          onPress={() => setTab('requests')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, tab === 'requests' && styles.tabTextActive]}>My Requests</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'docs' && styles.tabActive]}
          onPress={() => setTab('docs')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, tab === 'docs' && styles.tabTextActive]}>Docs & Invoices</Text>
        </TouchableOpacity>
      </View>

      {tab === 'requests' && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterRow}>
          {STATUS_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value || 'all'}
              style={[styles.filterChip, statusFilter === opt.value && styles.filterChipActive]}
              onPress={() => { setStatusFilter(opt.value); setCurrentPage(1); }}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterChipText, statusFilter === opt.value && styles.filterChipTextActive]}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {tab === 'requests' ? (
          <>
            {error ? (
              <View style={styles.errorWrap}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
            {loading ? (
              <View style={styles.loading}>
                <ActivityIndicator size="large" color={COLORS.primary} />
              </View>
            ) : items.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>No requests found</Text>
              </View>
            ) : (
              items.map((item) => (
                <Card key={item.request_id} style={styles.card}>
                  <View style={styles.cardTop}>
                    <Text style={styles.cardId}>{item.request_id} - {getTypeLabel(item)}</Text>
                    <StatusBadge status={(item.status ?? 'OPEN').replace(/_/g, ' ')} />
                  </View>
                  <Text style={styles.cardAsset}>{item.Asset?.name || item.asset_id || '-'}</Text>
                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={styles.detailsBtn}
                      onPress={() => openDetail(item)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.detailsBtnText}>Details</Text>
                    </TouchableOpacity>
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
          </>
        ) : (
          <View style={styles.docsPlaceholder}>
            <SectionHeader title="Service Reports" />
            <View style={styles.docsEmpty}>
              <Ionicons name="document-text-outline" size={48} color={COLORS.slate[300]} />
              <Text style={styles.docsEmptyText}>Docs & invoices coming soon</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.slate[50] },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 80 },
  loading: { paddingVertical: 48, alignItems: 'center' },
  empty: { paddingVertical: 48, alignItems: 'center' },
  emptyText: { fontSize: 14, color: COLORS.slate[500] },
  errorWrap: { padding: 16, backgroundColor: '#fef2f2', borderRadius: 12, marginBottom: 12 },
  errorText: { fontSize: 12, color: COLORS.danger },

  tabBar: {
    flexDirection: 'row',
    padding: 4,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate[100]
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12, },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: 12, fontWeight: '700', color: COLORS.slate[400] },
  tabTextActive: { color: COLORS.white },

  filterScroll: { maxHeight: 60, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.slate[200] },
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 12 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, backgroundColor: COLORS.slate[100] },
  filterChipActive: { backgroundColor: COLORS.primary },
  filterChipText: { fontSize: 12, fontWeight: '600', color: COLORS.slate[600] },
  filterChipTextActive: { color: COLORS.white },

  card: { marginBottom: 12 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  cardId: { fontSize: 10, fontWeight: '700', color: COLORS.slate[400] },
  cardAsset: { fontSize: 14, fontWeight: '700', color: COLORS.slate[800], marginBottom: 12 },
  cardActions: { flexDirection: 'row', gap: 8 },
  detailsBtn: { flex: 1, paddingVertical: 8, backgroundColor: COLORS.slate[100], borderRadius: 12, alignItems: 'center' },
  detailsBtnText: { fontSize: 10, fontWeight: '700', color: COLORS.slate[600] },

  detailContent: { padding: 16, paddingBottom: 24 },
  detailCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.slate[200]
  },
  detailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  detailId: { fontSize: 10, fontWeight: '800', color: COLORS.slate[400], textTransform: 'uppercase', letterSpacing: 2 },
  detailAsset: { fontSize: 20, fontWeight: '700', color: COLORS.slate[900], marginBottom: 4 },
  detailMeta: { fontSize: 12, color: COLORS.slate[500] },

  reportCard: { marginBottom: 24, backgroundColor: COLORS.primary, borderWidth: 0 },
  reportCardContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 },
  reportCardTitle: { fontSize: 14, fontWeight: '700', color: COLORS.white },
  reportCardSub: { fontSize: 10, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  reportBtn: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: COLORS.white, borderRadius: 12 },
  reportBtnText: { fontSize: 10, fontWeight: '800', color: COLORS.primary, textTransform: 'uppercase' },

  timelineCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.slate[200]
  },
  timelineRowWrap: { marginBottom: 0 },
  timelineRow: { flexDirection: 'row', alignItems: 'flex-start' },
  timelineDotWrap: { alignItems: 'center', marginRight: 16 },
  timelineLine: {
    width: 2,
    height: 32,
    backgroundColor: COLORS.slate[100],
    marginTop: 4
  },
  timelineLineDone: { backgroundColor: COLORS.emerald[500] },
  timelineDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.slate[200],
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1
  },
  timelineDotDone: { backgroundColor: COLORS.emerald[500], borderColor: COLORS.emerald[500] },
  timelineContent: { marginLeft: 16 },
  timelineLabel: { fontSize: 12, fontWeight: '700', color: COLORS.slate[800] },
  timelineNotFound: { fontSize: 14, color: COLORS.slate[500], fontStyle: 'italic', paddingVertical: 16 },
  timelineLabelMuted: { color: COLORS.slate[400] },
  timelineTime: { fontSize: 10, color: COLORS.slate[400], marginTop: 2 },

  infoCard: { marginBottom: 24 },
  infoRow: { marginBottom: 16 },
  infoLabel: { fontSize: 10, fontWeight: '700', color: COLORS.slate[400], textTransform: 'uppercase', marginBottom: 4 },
  infoValue: { fontSize: 14, fontWeight: '700', color: COLORS.slate[800] },
  infoGrid: { flexDirection: 'row', gap: 24 },
  infoCell: { flex: 1 },

  footer: { padding: 16, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.slate[200] },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    backgroundColor: COLORS.slate[900],
    borderRadius: 24
  },
  contactBtnText: { fontSize: 16, fontWeight: '700', color: COLORS.white },

  pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 24 },
  pageBtn: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: COLORS.primary, borderRadius: 12 },
  pageBtnDisabled: { backgroundColor: COLORS.slate[300], opacity: 0.7 },
  pageBtnText: { fontSize: 12, fontWeight: '700', color: COLORS.white },
  pageInfo: { fontSize: 12, color: COLORS.slate[600] },

  docsPlaceholder: { paddingBottom: 80 },
  docsEmpty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48, backgroundColor: COLORS.white, borderRadius: 24, borderWidth: 1, borderColor: COLORS.slate[200] },
  docsEmptyText: { fontSize: 12, color: COLORS.slate[400], marginTop: 12 }
});
