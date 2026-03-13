import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { AnimatedScreen } from '../../components/AnimatedScreen';
import { DashboardSkeleton } from '../../components/DashboardSkeleton';
import { ActionButton, Card, SectionHeader } from '../../components/Shared';
import { COLORS } from '../../constants/theme';
import { DASHBOARD_SKELETON_MIN_MS } from '../../config/dashboard';
import { useAuth } from '../../context/AuthContext';
import { getAssignedVehicles, AssignedVehicle, type GetAssignedVehiclesResponse } from '../../api/assetsApi';
import { getServiceRequests, type ServiceRequestItem, type GetServiceRequestsResponse } from '../../api/serviceRequestApi';

const DASHBOARD_LIST_LIMIT = 2;

interface AmbulanceDashboardProps {
  onAction: (flow: string) => void;
  onLogout?: () => void;
}

const TERMINAL_STATUSES = ['COMPLETED', 'REJECTED', 'CANCELLED'];
function isActiveRequest(item: ServiceRequestItem) {
  return item?.status && !TERMINAL_STATUSES.includes(item.status);
}

function statusBadgeStyle(status: string) {
  const s = status || '';
  if (s === 'ACTIVE' || s === 'AVAILABLE') return { bg: COLORS.emerald[100], text: COLORS.emerald[700] };
  if (s === 'MAINTENANCE' || s === 'CALIBRATION') return { bg: COLORS.amber[100], text: COLORS.amber[800] };
  if (s === 'LOANED') return { bg: COLORS.sky[100], text: COLORS.sky[800] };
  if (s === 'DECOMMISSIONED') return { bg: COLORS.slate[200], text: COLORS.slate[600] };
  return { bg: COLORS.slate[100], text: COLORS.slate[600] };
}

export function AmbulanceDashboard({ onAction, onLogout }: AmbulanceDashboardProps) {
  const { user } = useAuth();
  const [assignedVehicles, setAssignedVehicles] = useState<AssignedVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [activeRequests, setActiveRequests] = useState<ServiceRequestItem[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const delayPromise = new Promise<void>((r) => setTimeout(r, DASHBOARD_SKELETON_MIN_MS));
    Promise.all([
      getAssignedVehicles().then((res) => {
        const body = res as unknown as GetAssignedVehiclesResponse;
        if (!cancelled && Array.isArray(body?.assignedVehicles)) setAssignedVehicles(body.assignedVehicles);
      }),
      delayPromise,
    ]).finally(() => { if (!cancelled) setLoading(false); setInitialLoadDone(true); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!initialLoadDone) return;
    let cancelled = false;
    getServiceRequests({ page: 1, limit: 20 })
      .then((res) => {
        if (cancelled) return;
        const data = (res as unknown as GetServiceRequestsResponse)?.data;
        const list = Array.isArray(data) ? data : [];
        setActiveRequests(list.filter(isActiveRequest));
      })
      .finally(() => { if (!cancelled) setRequestsLoading(false); });
    return () => { cancelled = true; };
  }, [initialLoadDone]);

  const displayName = user?.full_name || user?.username || 'Driver';
  const firstVehicle = assignedVehicles[0];
  const welcomeSub = firstVehicle
    ? `${firstVehicle.name}${firstVehicle.model ? ` (${firstVehicle.model})` : ''}`
    : 'No vehicle assigned';

  if (loading) {
    return (
      <AnimatedScreen style={styles.container}>
        <Header
          title="Dashboard"
          showRightIcons
          onNotificationClick={() => onAction('notifications')}
          onAvatarPress={() => onAction('profile')}
        />
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <DashboardSkeleton />
        </ScrollView>
      </AnimatedScreen>
    );
  }

  return (
    <AnimatedScreen style={styles.container}>
      <Header
        title="Dashboard"
        showRightIcons
        onNotificationClick={() => onAction('notifications')}
        onAvatarPress={() => onAction('profile')}
      />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.welcome}>
          <Text style={styles.welcomeTitle}>{displayName}</Text>
          <Text style={styles.welcomeSub}>Vehicle: {welcomeSub}</Text>
          {assignedVehicles.length > 1 ? (
            <Text style={styles.welcomeNote}>Showing 1 only. See Assigned Vehicles below for more.</Text>
          ) : null}
        </View>

        <View style={styles.actionsGrid}>
          <View style={styles.actionItem}>
            <ActionButton label="Breakdown" icon="Breakdown" sublabel="Emergency assistance" onPress={() => onAction('breakdown_flow')} color={COLORS.white} />
          </View>
          <View style={styles.actionItem}>
            <ActionButton label="Onsite Service" icon="Truck" sublabel="Minor repairs" onPress={() => Alert.alert('Features not yet finalized', '', [{ text: 'OK' }])} color={COLORS.white} />
          </View>
          <View style={styles.actionItem}>
            <ActionButton label="Service & Repair" icon="PPM" sublabel="Workshop visit" onPress={() => Alert.alert('Features not yet finalized', '', [{ text: 'OK' }])} color={COLORS.white} />
          </View>
          <View style={styles.actionItem}>
            <ActionButton label="Vehicle Info" icon="Report" sublabel="History & docs" onPress={() => onAction('assets')} color={COLORS.white} />
          </View>
        </View>

        <SectionHeader title="My Assigned Vehicles" onSeeAll={() => onAction('assets')} />
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        ) : assignedVehicles.length === 0 ? (
          <Card style={styles.vehicleCard}>
            <Text style={styles.emptyText}>No vehicles assigned</Text>
          </Card>
        ) : (
          assignedVehicles.slice(0, DASHBOARD_LIST_LIMIT).map((v) => {
            const badge = statusBadgeStyle(v.status);
            return (
              <Card key={v.asset_id} onPress={() => onAction('assets')} style={styles.vehicleCard}>
                <View style={styles.vehicleRow}>
                  <View style={styles.vehicleIcon}>
                    <Ionicons name="car-outline" size={32} color={COLORS.slate[400]} />
                  </View>
                  <View style={styles.vehicleInfo}>
                    <View style={styles.vehicleHeader}>
                      <Text style={styles.vehicleName} numberOfLines={1}>{v.name}</Text>
                      <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                        <Text style={[styles.badgeText, { color: badge.text }]} numberOfLines={1}>{v.status}</Text>
                      </View>
                    </View>
                    {(v.serial_number || v.model) ? (
                      <Text style={styles.vehicleMeta} numberOfLines={1}>{[v.serial_number, v.model].filter(Boolean).join(' · ')}</Text>
                    ) : null}
                  </View>
                </View>
              </Card>
            );
          })
        )}

        <SectionHeader title="Active Requests" onSeeAll={() => onAction('records')} />
        {requestsLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        ) : activeRequests.length === 0 ? (
          <Card style={styles.activeReq}>
            <Text style={styles.emptyText}>No active requests</Text>
          </Card>
        ) : (
          activeRequests.slice(0, DASHBOARD_LIST_LIMIT).map((req) => {
            const title = (req.description || '').split('\n')[0] || req.request_id;
            const locationMatch = (req.description || '').match(/\bLocation:\s*(.+?)(?:\n|$)/i);
            const location = locationMatch ? locationMatch[1].trim() : '';
            return (
              <View key={req.request_id} style={styles.activeReq}>
                <View style={styles.activeReqHeader}>
                  <Text style={styles.activeReqTag}>{req.request_id}{req.service_mode ? ` - ${req.service_mode}` : ''}</Text>
                  <View style={styles.activeReqBadge}>
                    <Text style={styles.activeReqBadgeText}>{req.status}</Text>
                  </View>
                </View>
                <Text style={styles.activeReqTitle} numberOfLines={2}>{title}</Text>
                {req.Asset?.name ? <Text style={styles.activeReqLocation}>Asset: {req.Asset.name}</Text> : null}
                {location ? <Text style={styles.activeReqLocation}>Location: {location}</Text> : null}
                <View style={styles.activeReqActions}>
                  <TouchableOpacity style={styles.activeReqBtn} onPress={() => onAction('records')}>
                    <Text style={styles.activeReqBtnText}>View Status</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.activeReqIconBtn}>
                    <Ionicons name="call-outline" size={18} color={COLORS.white} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </AnimatedScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  welcome: { marginBottom: 24 },
  welcomeTitle: { fontSize: 20, fontWeight: '600', color: COLORS.slate[900] },
  welcomeSub: { fontSize: 14, color: COLORS.slate[500], marginTop: 4 },
  welcomeNote: { fontSize: 12, color: COLORS.slate[500], marginTop: 6 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  actionItem: { width: '47%' },
  loadingWrap: { paddingVertical: 24, alignItems: 'center' },
  emptyText: { fontSize: 14, color: COLORS.slate[500], textAlign: 'center' },
  vehicleCard: { marginBottom: 16 },
  vehicleRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  vehicleIcon: { width: 56, height: 56, borderRadius: 12, backgroundColor: COLORS.slate[100], alignItems: 'center', justifyContent: 'center' },
  vehicleInfo: { flex: 1 },
  vehicleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  vehicleName: { fontSize: 16, fontWeight: '600', color: COLORS.slate[800] },
  vehicleMeta: { fontSize: 12, color: COLORS.slate[500] },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  badgeText: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
  activeReq: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16
  },
  activeReqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  activeReqTag: { fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.8)', letterSpacing: 1, textTransform: 'uppercase' },
  activeReqBadge: { paddingHorizontal: 8, paddingVertical: 2, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 4 },
  activeReqBadgeText: { fontSize: 10, fontWeight: '600', color: COLORS.white },
  activeReqTitle: { fontSize: 14, fontWeight: '600', color: COLORS.white, marginBottom: 4 },
  activeReqLocation: { fontSize: 10, color: 'rgba(255,255,255,0.85)', marginBottom: 16 },
  activeReqActions: { flexDirection: 'row', gap: 8 },
  activeReqBtn: { flex: 1, paddingVertical: 8, backgroundColor: COLORS.white, borderRadius: 8, alignItems: 'center' },
  activeReqBtnText: { fontSize: 12, fontWeight: '600', color: COLORS.primary },
  activeReqIconBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8 }
});
