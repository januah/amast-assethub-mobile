import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { AnimatedScreen } from '../../components/AnimatedScreen';
import { Card, SectionHeader, StatusBadge } from '../../components/Shared';
import { COLORS } from '../../constants/theme';
import { getServiceRequestById, type ServiceRequestItem } from '../../api/serviceRequestApi';

const SERVICE_MODE_LABEL: Record<string, string> = {
  REPAIR: 'Breakdown',
  PPM: 'PPM',
  INSPEC: 'Inspection',
  INSTALL: 'Installation'
};

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

function formatDate(s: string | undefined) {
  if (!s) return '-';
  try {
    const d = new Date(s);
    return isNaN(d.getTime()) ? s : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return s;
  }
}

function formatTime(s: string | undefined) {
  if (!s) return '-';
  try {
    const d = new Date(s);
    return isNaN(d.getTime()) ? s : d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return s;
  }
}

function parseLocation(desc: string | undefined): string {
  if (!desc) return '-';
  const m = desc.match(/\n\nLocation:\s*(.+?)(?:\n|$)/);
  return m ? m[1].trim() : '-';
}

interface RequestDetailScreenProps {
  requestId: string;
  onBack: () => void;
  onOpenChecklist?: () => void;
}

export function RequestDetailScreen({ requestId, onBack, onOpenChecklist }: RequestDetailScreenProps) {
  const [request, setRequest] = useState<ServiceRequestItem | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRequest = useCallback(async () => {
    setLoading(true);
    const res = await getServiceRequestById(requestId);
    setLoading(false);
    if ((res as { success?: boolean }).success === false) {
      setRequest(null);
      return;
    }
    setRequest((res as unknown as ServiceRequestItem) || null);
  }, [requestId]);

  useEffect(() => {
    fetchRequest();
  }, [fetchRequest]);

  const getTypeLabel = (item: ServiceRequestItem) =>
    SERVICE_MODE_LABEL[item.service_mode || ''] || item.service_mode || 'Request';

  if (loading && !request) {
    return (
      <AnimatedScreen style={styles.container}>
        <Header title="Request Details" showBack onBack={onBack} />
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </AnimatedScreen>
    );
  }

  if (!request) {
    return (
      <AnimatedScreen style={styles.container}>
        <Header title="Request Details" showBack onBack={onBack} />
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Request not found</Text>
        </View>
      </AnimatedScreen>
    );
  }

  const isCompleted = request.status === 'COMPLETED';

  return (
    <AnimatedScreen style={styles.container}>
      <Header title="Request Details" showBack onBack={onBack} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.detailContent} showsVerticalScrollIndicator={false}>
        <View style={styles.detailCard}>
          <View style={styles.detailHeader}>
            <Text style={styles.detailId}>{request.request_id}</Text>
            <StatusBadge status={request.status ?? 'OPEN'} />
          </View>
          <Text style={styles.detailAsset}>{request.Asset?.name || request.asset_id || '-'}</Text>
          <Text style={styles.detailMeta}>
            {getTypeLabel(request)} Request - {formatDate(request.created_at)}
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
          {request.ServiceRequestStatusHistories && request.ServiceRequestStatusHistories.length > 0 ? (
            request.ServiceRequestStatusHistories.map((step, i) => {
              const label = STATUS_TO_LABEL[step.to_status] || step.to_status;
              const steps = request.ServiceRequestStatusHistories;
              const isLast = i === (steps?.length ?? 0) - 1;
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
              {request.requester?.full_name || request.requester?.username || '-'}
            </Text>
          </View>
          <View style={styles.infoGrid}>
            <View style={styles.infoCell}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{parseLocation(request.description)}</Text>
            </View>
            <View style={styles.infoCell}>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoValue}>{formatDate(request.created_at)}</Text>
            </View>
          </View>
        </Card>
      </ScrollView>
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
    </AnimatedScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.slate[50] },
  loading: { paddingVertical: 48, alignItems: 'center' },
  empty: { paddingVertical: 48, alignItems: 'center' },
  emptyText: { fontSize: 14, color: COLORS.slate[500] },
  scroll: { flex: 1 },
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
  detailId: { fontSize: 10, fontWeight: '600', color: COLORS.slate[400], textTransform: 'uppercase', letterSpacing: 2 },
  detailAsset: { fontSize: 20, fontWeight: '600', color: COLORS.slate[900], marginBottom: 4 },
  detailMeta: { fontSize: 12, color: COLORS.slate[500] },
  reportCard: { marginBottom: 24, backgroundColor: COLORS.primary, borderWidth: 0 },
  reportCardContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 },
  reportCardTitle: { fontSize: 14, fontWeight: '600', color: COLORS.white },
  reportCardSub: { fontSize: 10, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  reportBtn: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: COLORS.white, borderRadius: 12 },
  reportBtnText: { fontSize: 10, fontWeight: '600', color: COLORS.primary, textTransform: 'uppercase' },
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
  timelineLabel: { fontSize: 12, fontWeight: '600', color: COLORS.slate[800] },
  timelineNotFound: { fontSize: 14, color: COLORS.slate[500], fontStyle: 'italic', paddingVertical: 16 },
  timelineTime: { fontSize: 10, color: COLORS.slate[400], marginTop: 2 },
  infoCard: { marginBottom: 24 },
  infoRow: { marginBottom: 16 },
  infoLabel: { fontSize: 10, fontWeight: '600', color: COLORS.slate[400], textTransform: 'uppercase', marginBottom: 4 },
  infoValue: { fontSize: 14, fontWeight: '600', color: COLORS.slate[800] },
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
  contactBtnText: { fontSize: 16, fontWeight: '600', color: COLORS.white }
});
