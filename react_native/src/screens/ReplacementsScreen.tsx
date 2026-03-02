import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, Modal, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { Card, ReplacementStatusBadge, SectionHeader, Stepper } from '../components/Shared';
import { COLORS } from '../constants/theme';
import { getReplacements, getReplacementById, acknowledgeReplacement, type Replacement } from '../api/replacementApi';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

const ITEMS_PER_PAGE = 10;
const ACTIVE_STATUSES = ['IN USE', 'IN USE', 'OVERDUE', 'Issued', 'In Use', 'Overdue'];
const HISTORY_STATUSES = ['CLOSED', 'CANCELLED', 'FORCE_CLOSED', 'Closed', 'Cancelled', 'ORIGINAL RETURNED', 'Loaner Returned'];

function formatDate(s: string | null | undefined): string {
  if (!s) return '-';
  try {
    const d = new Date(s);
    return isNaN(d.getTime()) ? String(s) : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return String(s);
  }
}

function formatDateTime(s: string | null | undefined): string {
  if (!s) return '-';
  try {
    const d = new Date(s);
    if (isNaN(d.getTime())) return String(s);
    const date = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
    return `${date} at ${time}`;
  } catch {
    return String(s);
  }
}

function isOverdue(completionDate: string | null | undefined): boolean {
  if (!completionDate) return false;
  try {
    return new Date(completionDate) < new Date();
  } catch {
    return false;
  }
}

interface ReplacementsScreenProps {
  onBack: () => void;
}

export function ReplacementsScreen({ onBack }: ReplacementsScreenProps) {
  const { role } = useAuth();
  const [view, setView] = useState<'list' | 'detail' | 'wizard'>('list');
  const [wizardStep, setWizardStep] = useState(0);
  const [activeTab, setActiveTab] = useState<'Active' | 'History'>('Active');
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<Replacement[]>([]);
  const [selected, setSelected] = useState<Replacement | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [ackType, setAckType] = useState<'received' | 'installed' | null>(null);
  const [remarks, setRemarks] = useState('');
  const [ackSubmitting, setAckSubmitting] = useState(false);
  const [ackError, setAckError] = useState('');

  const canManage = [UserRole.ADMIN_HOSPITAL, UserRole.SUPERADMIN, UserRole.BIOMED_ENGINEER].includes(role);
  const isBiomed = [UserRole.ADMIN_HOSPITAL, UserRole.SUPERADMIN, UserRole.BIOMED_ENGINEER].includes(role);
  const isMO = role === UserRole.MEDICAL_OFFICER;

  const fetchList = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    const res = await getReplacements({ page, limit: ITEMS_PER_PAGE, q: search || undefined });
    setLoading(false);
    if (!res.success || res.data === undefined) {
      setItems([]);
      setTotalPages(1);
      setError((res as { message?: string }).message || 'Failed to load replacements');
      return;
    }
    setItems(res.data || []);
    setTotalPages(res.meta?.totalPages ?? 1);
  }, [search]);

  useEffect(() => {
    fetchList(currentPage);
  }, [fetchList, currentPage]);

  const filtered = useMemo(() => {
    const searchLower = search.toLowerCase();
    return items.filter((r) => {
      const isActive = !HISTORY_STATUSES.includes(r.status);
      const matchesTab = activeTab === 'Active' ? isActive : !isActive;
      const matchesSearch = !searchLower ||
        (r.replacement_id?.toLowerCase().includes(searchLower)) ||
        (r.Asset?.name?.toLowerCase().includes(searchLower)) ||
        (r.ResponsiblePIC?.full_name?.toLowerCase().includes(searchLower));
      return matchesTab && matchesSearch;
    });
  }, [items, activeTab, search]);

  const openDetail = useCallback(async (item: Replacement) => {
    setView('detail');
    setSelected(item);
    setDetailLoading(true);
    const res = await getReplacementById(item.replacement_id);
    setDetailLoading(false);
    if (res.success && res.data) setSelected(res.data);
  }, []);

  const goBackToList = useCallback(() => {
    setView('list');
    setSelected(null);
  }, []);

  const openWizard = useCallback(() => { setView('wizard'); setWizardStep(0); }, []);
  const closeWizard = useCallback(() => { setView('list'); setWizardStep(0); fetchList(1); }, [fetchList]);

  const handleAcknowledge = useCallback(async () => {
    if (!ackType || !selected) return;
    const eventType = ackType === 'received' ? 'ACK_RECEIVED' : 'ORIGINAL_INSTALLED';
    setAckSubmitting(true);
    setAckError('');
    const res = await acknowledgeReplacement(selected.replacement_id, eventType, remarks.trim() || undefined);
    setAckSubmitting(false);
    if (res.success) {
      setAckType(null);
      setRemarks('');
      const detailRes = await getReplacementById(selected.replacement_id);
      if (detailRes.success && detailRes.data) setSelected(detailRes.data);
    } else {
      setAckError((res as { message?: string }).message || 'Failed to acknowledge');
    }
  }, [ackType, selected, remarks]);

  if (view === 'detail' && selected) {
    const r = selected;
    const original = r.Asset || { asset_id: r.asset_id, name: r.asset_id };
    const loaner = r.LoanerAsset;
    const sr = r.ServiceRequest;
    const dept = sr?.Department?.name || '-';
    const pic = r.ResponsiblePIC?.full_name || r.responsible_pic_id || '-';
    const timeline = r.ReplacementEvents || [];
    const displayStatus = r.status === 'OVERDUE' && isOverdue(r.completion_date) ? 'Overdue' : r.status;
    const hasAckReceived = timeline.some((e) => e.event_type === 'ACK_RECEIVED');
    const hasOriginalInstalled = timeline.some((e) => e.event_type === 'ORIGINAL_INSTALLED');
    const canAckReceipt = !hasAckReceived;
    const canAckOriginalInstalled = hasAckReceived && !hasOriginalInstalled;

    return (
      <View style={styles.container}>
        <Header title="Replacement Detail" showBack onBack={goBackToList} />
        {detailLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <Card style={styles.detailCard}>
              <View style={styles.detailHeader}>
                <View>
                  <Text style={styles.detailId}>{r.replacement_id}</Text>
                  <Text style={styles.detailTitle}>{original.name || original.asset_id}</Text>
                </View>
                <ReplacementStatusBadge status={displayStatus} />
              </View>

              {sr && (
                <View style={styles.linkedRequest}>
                  <Ionicons name="document-text-outline" size={20} color={COLORS.slate[400]} />
                  <View style={styles.linkedRequestText}>
                    <Text style={styles.linkedRequestLabel}>Linked Request</Text>
                    <Text style={styles.linkedRequestValue}>{sr.request_id}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.slate[300]} />
                </View>
              )}

              <View style={styles.gridRow}>
                <View style={styles.gridCard}>
                  <Text style={styles.gridLabel}>Loaner Device</Text>
                  <Text style={styles.gridValue}>{loaner?.name || loaner?.asset_id || '-'}</Text>
                  {loaner?.asset_id && <Text style={styles.gridSub}>{loaner.asset_id}</Text>}
                </View>
                <View style={styles.gridCard}>
                  <Text style={styles.gridLabel}>PIC</Text>
                  <Text style={styles.gridValue}>{pic}</Text>
                  <Text style={styles.gridSub}>{dept}</Text>
                </View>
              </View>
            </Card>

            <SectionHeader title="Case Timeline" />
            {timeline.length > 0 ? (
              <View style={styles.timeline}>
                {timeline.map((event, idx) => {
                  const eventLabel = event.event_type === 'ACK_RECEIVED'
                    ? 'Loaner Acknowledged Received'
                    : event.event_type === 'ORIGINAL_INSTALLED'
                      ? 'Original Device Installed'
                      : event.event_type === 'DEPLOYED' || event.event_type === 'ISSUED'
                        ? 'Issued'
                        : event.event_type;
                  const byUser = event.performed_by_name;
                  return (
                    <View key={event.event_id || idx} style={styles.timelineItem}>
                      <View style={styles.timelineDot} />
                      <View style={styles.timelineCard}>
                        <View style={styles.timelineHeader}>
                          <Text style={styles.timelineType}>{eventLabel}</Text>
                          <Text style={styles.timelineTime}>{formatDateTime(event.created_at)}</Text>
                        </View>
                        {event.remarks ? (
                          <Text style={styles.timelineRemark}>{event.remarks}</Text>
                        ) : null}
                        {byUser ? (
                          <Text style={styles.timelineBy}>By {byUser}</Text>
                        ) : null}
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : (
              <Text style={styles.emptyTimeline}>No timeline events</Text>
            )}
          </ScrollView>
        )}

        {(isBiomed || isMO) && (
          <View style={styles.detailBottomActions}>
            {isBiomed && (
              <>
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.actionBtnOutline} onPress={() => {}}>
                    <Text style={styles.actionBtnOutlineText}>Update Return</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtnOutline} onPress={() => {}}>
                    <Text style={styles.actionBtnOutlineText}>Swap Loaner</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.actionBtnPrimary} onPress={() => {}}>
                    <Text style={styles.actionBtnPrimaryText}>Return Loaner</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtnDark, displayStatus === 'Loaner Returned' && styles.actionBtnDisabled]} disabled={displayStatus !== 'Loaner Returned'} onPress={() => {}}>
                    <Text style={styles.actionBtnDarkText}>Close Case</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
            {isMO && (canAckReceipt || canAckOriginalInstalled) && (
              <View style={styles.moActionsStack}>
                {canAckReceipt && (
                  <TouchableOpacity style={styles.moBtnPrimary} onPress={() => setAckType('received')}>
                    <Text style={styles.moBtnPrimaryText}>Acknowledge Receipt</Text>
                  </TouchableOpacity>
                )}
                {canAckOriginalInstalled && (
                  <TouchableOpacity style={styles.moBtnOutline} onPress={() => setAckType('installed')}>
                    <Text style={styles.moBtnOutlineText}>Acknowledge Original Installed</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        )}

        {ackType && (
          <Modal visible transparent animationType="fade" onRequestClose={() => setAckType(null)}>
            <Pressable style={styles.modalBackdrop} onPress={() => { if (!ackSubmitting) { setAckType(null); setAckError(''); } }}>
              <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalCenter}>
                <Pressable style={styles.modalCard} onPress={() => {}}>
                  <View style={styles.modalHeader}>
                    <View style={styles.modalIconWrap}>
                      <Ionicons name="checkmark-circle" size={32} color={COLORS.sky[600]} />
                    </View>
                    <TouchableOpacity onPress={() => { setAckType(null); setAckError(''); }} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} disabled={ackSubmitting}>
                      <Ionicons name="close" size={24} color={COLORS.slate[400]} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.modalTitle}>
                    {ackType === 'received' ? 'Acknowledge Receipt' : 'Original Device Ready'}
                  </Text>
                  <Text style={styles.modalDesc}>
                    {ackType === 'received'
                      ? 'Confirm that the loaner device has been received, is in good condition, and is currently functional in your department.'
                      : 'Confirm that the original device has been returned, installed, and is verified working as intended.'}
                  </Text>
                  <Text style={styles.modalLabel}>Optional Remarks</Text>
                  <TextInput
                    style={styles.modalTextArea}
                    placeholder="e.g. Loaner received without carrying case..."
                    placeholderTextColor={COLORS.slate[400]}
                    value={remarks}
                    onChangeText={setRemarks}
                    multiline
                    numberOfLines={3}
                    editable={!ackSubmitting}
                  />
                  {ackError ? <Text style={styles.modalError}>{ackError}</Text> : null}
                  <TouchableOpacity
                    style={[styles.modalConfirm, ackSubmitting && styles.modalConfirmDisabled]}
                    onPress={handleAcknowledge}
                    disabled={ackSubmitting}
                  >
                    {ackSubmitting ? (
                      <ActivityIndicator size="small" color={COLORS.white} />
                    ) : (
                      <Text style={styles.modalConfirmText}>Confirm Acknowledgment</Text>
                    )}
                  </TouchableOpacity>
                </Pressable>
              </KeyboardAvoidingView>
            </Pressable>
          </Modal>
        )}
      </View>
    );
  }

  if (view === 'wizard') {
    const steps = ['Context', 'Select Loaner', 'Issue To'];
    return (
      <View style={styles.container}>
        <Header title="Issue Loaner" showBack onBack={closeWizard} />
        <Stepper steps={steps} current={wizardStep} />
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          <SectionHeader title={steps[wizardStep]} />
          <Text style={styles.wizardPlaceholder}>Issue Replacement Wizard - Coming soon</Text>
        </ScrollView>
        <View style={styles.wizardFooter}>
          <TouchableOpacity style={styles.wizardNext} onPress={() => (wizardStep >= 2 ? closeWizard() : setWizardStep((s) => s + 1))}>
            <Text style={styles.wizardNextText}>{wizardStep >= 2 ? 'Issue Loaner' : 'Continue'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Temporary Replacements" showBack onBack={onBack} />
      <View style={styles.tabs}>
        {(['Active', 'History'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, activeTab === t && styles.tabActive]}
            onPress={() => setActiveTab(t)}
          >
            <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={16} color={COLORS.slate[400]} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by ID, Tag, or PIC..."
          placeholderTextColor={COLORS.slate[400]}
          value={search}
          onChangeText={setSearch}
        />
      </View>
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : error ? (
        <View style={styles.empty}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.slate[300]} />
          <Text style={styles.emptyText}>{error}</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="swap-horizontal-outline" size={48} color={COLORS.slate[200]} />
          <Text style={styles.emptyText}>No temporary replacements found</Text>
          {canManage && (
            <TouchableOpacity style={styles.emptyCta} onPress={openWizard}>
              <Text style={styles.emptyCtaText}>Issue Temporary Replacement</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {filtered.map((r) => {
            const original = r.Asset || { asset_id: r.asset_id, name: r.asset_id };
            const loaner = r.LoanerAsset;
            const dept = r.ServiceRequest?.Department?.name || '-';
            const pic = r.ResponsiblePIC?.full_name || r.responsible_pic_id || '-';
            const overdue = r.status === 'OVERDUE' || isOverdue(r.completion_date);
            const displayStatus = overdue ? 'Overdue' : r.status;
            return (
              <Card key={r.replacement_id} onPress={() => openDetail(r)} style={styles.listCard} leftBorder={COLORS.sky[500]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardId}>{r.replacement_id}</Text>
                  <ReplacementStatusBadge status={displayStatus} />
                </View>
                <View style={styles.cardRow}>
                  <Text style={styles.cardLabel}>Original</Text>
                  <Text style={styles.cardValue}>{original.name || original.asset_id}</Text>
                </View>
                <View style={styles.cardRow}>
                  <Text style={styles.cardLabel}>Loaner</Text>
                  <Text style={styles.cardValueLoaner}>{loaner?.name || loaner?.asset_id || '-'}</Text>
                </View>
                <View style={styles.cardFooter}>
                  <View style={styles.cardMeta}>
                    <Ionicons name="navigate-outline" size={12} color={COLORS.slate[400]} />
                    <Text style={styles.cardMetaText}>{dept} - {pic}</Text>
                  </View>
                  <Text style={[styles.cardExp, overdue && styles.cardExpOverdue]}>
                    Exp: {formatDate(r.completion_date)}
                  </Text>
                </View>
              </Card>
            );
          })}
          {totalPages > 1 && (
            <View style={styles.pagination}>
              <TouchableOpacity style={[styles.pageBtn, currentPage <= 1 && styles.pageBtnDisabled]} onPress={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage <= 1}>
                <Text style={styles.pageBtnText}>Previous</Text>
              </TouchableOpacity>
              <Text style={styles.pageInfo}>{currentPage} / {totalPages}</Text>
              <TouchableOpacity style={[styles.pageBtn, currentPage >= totalPages && styles.pageBtnDisabled]} onPress={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}>
                <Text style={styles.pageBtnText}>Next</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}
      {canManage && activeTab === 'Active' && filtered.length > 0 && (
        <View style={styles.bottomCta}>
          <TouchableOpacity style={styles.bottomCtaBtn} onPress={openWizard}>
            <Ionicons name="add" size={20} color={COLORS.white} />
            <Text style={styles.bottomCtaText}>Issue Loaner</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.slate[50] },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  tabs: { flexDirection: 'row', padding: 4, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.slate[100] },
  tab: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  tabActive: { backgroundColor: COLORS.sky[600], shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  tabText: { fontSize: 10, fontWeight: '700', letterSpacing: 2, color: COLORS.slate[400] },
  tabTextActive: { color: COLORS.white },
  searchWrap: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.slate[100] },
  searchIcon: { position: 'absolute', left: 28, zIndex: 1 },
  searchInput: { flex: 1, paddingLeft: 40, paddingRight: 16, paddingVertical: 10, backgroundColor: COLORS.slate[50], borderRadius: 12, fontSize: 14 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyText: { fontSize: 14, color: COLORS.slate[500], marginTop: 16, fontStyle: 'italic' },
  emptyCta: { marginTop: 24, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: COLORS.sky[600], borderRadius: 16 },
  emptyCtaText: { fontSize: 14, fontWeight: '700', color: COLORS.white },
  listCard: { marginBottom: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  cardId: { fontSize: 10, fontWeight: '700', color: COLORS.slate[400], letterSpacing: 0.5, textTransform: 'uppercase' },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardLabel: { fontSize: 12, color: COLORS.slate[500] },
  cardValue: { fontSize: 12, fontWeight: '700', color: COLORS.slate[800] },
  cardValueLoaner: { fontSize: 12, fontWeight: '700', color: COLORS.sky[600] },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.slate[50] },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardMetaText: { fontSize: 10, color: COLORS.slate[400] },
  cardExp: { fontSize: 10, fontWeight: '700', color: COLORS.slate[400] },
  cardExpOverdue: { color: COLORS.danger },
  pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 24 },
  pageBtn: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: COLORS.primary, borderRadius: 8 },
  pageBtnDisabled: { backgroundColor: COLORS.slate[300] },
  pageBtnText: { fontSize: 12, fontWeight: '600', color: COLORS.white },
  pageInfo: { fontSize: 12, color: COLORS.slate[600] },
  bottomCta: { padding: 16, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.slate[200] },
  bottomCtaBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, backgroundColor: COLORS.slate[900], borderRadius: 16 },
  bottomCtaText: { fontSize: 14, fontWeight: '700', color: COLORS.white },
  detailCard: { marginBottom: 24 },
  detailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  detailId: { fontSize: 10, fontWeight: '800', color: COLORS.slate[400], letterSpacing: 0.5, textTransform: 'uppercase' },
  detailTitle: { fontSize: 18, fontWeight: '700', color: COLORS.slate[900] },
  linkedRequest: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, backgroundColor: COLORS.slate[50], borderRadius: 12, marginBottom: 12 },
  linkedRequestText: { flex: 1 },
  linkedRequestLabel: { fontSize: 10, fontWeight: '700', color: COLORS.slate[400], textTransform: 'uppercase' },
  linkedRequestValue: { fontSize: 12, fontWeight: '700', color: COLORS.sky[600] },
  gridRow: { flexDirection: 'row', gap: 12 },
  gridCard: { flex: 1, padding: 12, borderWidth: 1, borderColor: COLORS.slate[100], borderRadius: 12 },
  gridLabel: { fontSize: 10, fontWeight: '700', color: COLORS.slate[400], textTransform: 'uppercase', marginBottom: 4 },
  gridValue: { fontSize: 12, fontWeight: '700', color: COLORS.slate[800] },
  gridSub: { fontSize: 8, fontWeight: '700', color: COLORS.slate[400], marginTop: 2 },
  timeline: { paddingLeft: 24 },
  timelineItem: { flexDirection: 'row', marginBottom: 16, position: 'relative' },
  timelineDot: { position: 'absolute', left: -22, top: 6, width: 16, height: 16, borderRadius: 8, backgroundColor: COLORS.white, borderWidth: 4, borderColor: COLORS.sky[500] },
  timelineCard: { flex: 1, padding: 12, backgroundColor: COLORS.white, borderRadius: 16, borderWidth: 1, borderColor: COLORS.slate[200] },
  timelineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  timelineType: { fontSize: 12, fontWeight: '700', color: COLORS.slate[800] },
  timelineTime: { fontSize: 10, color: COLORS.slate[400] },
  timelineRemark: { fontSize: 11, color: COLORS.slate[500], lineHeight: 18, marginBottom: 6 },
  timelineBy: { fontSize: 9, fontWeight: '700', color: COLORS.slate[400], textTransform: 'uppercase', letterSpacing: 0.5 },
  emptyTimeline: { fontSize: 12, color: COLORS.slate[500], fontStyle: 'italic', paddingVertical: 16 },
  detailBottomActions: { padding: 16, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.slate[200], gap: 8 },
  actionRow: { flexDirection: 'row', gap: 8 },
  moActionsStack: { gap: 8 },
  moBtnPrimary: { paddingVertical: 12, backgroundColor: COLORS.sky[600], borderRadius: 12, alignItems: 'center' },
  moBtnPrimaryText: { fontSize: 12, fontWeight: '700', color: COLORS.white },
  moBtnOutline: { paddingVertical: 12, backgroundColor: COLORS.white, borderWidth: 2, borderColor: COLORS.sky[600], borderRadius: 12, alignItems: 'center' },
  moBtnOutlineText: { fontSize: 12, fontWeight: '700', color: COLORS.sky[600] },
  actionBtnOutline: { flex: 1, paddingVertical: 12, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.slate[200], borderRadius: 12 },
  actionBtnOutlineText: { fontSize: 12, fontWeight: '700', color: COLORS.slate[800], textAlign: 'center' },
  actionBtnPrimary: { flex: 1, paddingVertical: 12, backgroundColor: COLORS.emerald[600], borderRadius: 12 },
  actionBtnPrimaryText: { fontSize: 12, fontWeight: '700', color: COLORS.white, textAlign: 'center' },
  actionBtnDark: { flex: 1, paddingVertical: 12, backgroundColor: COLORS.slate[900], borderRadius: 12 },
  actionBtnDarkText: { fontSize: 12, fontWeight: '700', color: COLORS.white, textAlign: 'center' },
  actionBtnDisabled: { opacity: 0.5 },
  actionBtnOutlineSky: { flex: 1, paddingVertical: 12, backgroundColor: COLORS.white, borderWidth: 2, borderColor: COLORS.sky[600], borderRadius: 12 },
  actionBtnOutlineSkyText: { fontSize: 12, fontWeight: '700', color: COLORS.sky[600], textAlign: 'center' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.6)', justifyContent: 'center', padding: 24 },
  modalCenter: { width: '100%' },
  modalCard: { backgroundColor: COLORS.white, borderRadius: 24, padding: 24, width: '100%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  modalIconWrap: { padding: 12, backgroundColor: COLORS.sky[50], borderRadius: 16 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: COLORS.slate[900], marginBottom: 8 },
  modalDesc: { fontSize: 14, color: COLORS.slate[500], lineHeight: 22, marginBottom: 24 },
  modalLabel: { fontSize: 10, fontWeight: '700', color: COLORS.slate[500], letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' },
  modalTextArea: { padding: 16, backgroundColor: COLORS.slate[50], borderWidth: 1, borderColor: COLORS.slate[100], borderRadius: 16, fontSize: 14, minHeight: 80, textAlignVertical: 'top', marginBottom: 24 },
  modalConfirm: { paddingVertical: 16, backgroundColor: COLORS.sky[600], borderRadius: 16, alignItems: 'center' },
  modalConfirmDisabled: { opacity: 0.7 },
  modalConfirmText: { fontSize: 14, fontWeight: '700', color: COLORS.white },
  modalError: { fontSize: 12, color: COLORS.danger, marginBottom: 12 },
  wizardPlaceholder: { fontSize: 14, color: COLORS.slate[500], paddingVertical: 24 },
  wizardFooter: { padding: 16, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.slate[200] },
  wizardNext: { paddingVertical: 16, backgroundColor: COLORS.sky[600], borderRadius: 16, alignItems: 'center' },
  wizardNextText: { fontSize: 14, fontWeight: '700', color: COLORS.white },
});
