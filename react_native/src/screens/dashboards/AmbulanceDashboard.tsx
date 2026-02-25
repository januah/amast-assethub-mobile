import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { ActionButton, Card, SectionHeader } from '../../components/Shared';
import { COLORS } from '../../constants/theme';

interface AmbulanceDashboardProps {
  onAction: (flow: string) => void;
  onLogout?: () => void;
}

export function AmbulanceDashboard({ onAction, onLogout }: AmbulanceDashboardProps) {
  return (
    <View style={styles.container}>
      <Header title="Ambulance Hub" onNotificationClick={() => onAction('notifications')} onAvatarPress={onLogout} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.welcome}>
          <Text style={styles.welcomeTitle}>Driver Ahmad</Text>
          <Text style={styles.welcomeSub}>Vehicle: WMX 4821 (Toyota Hiace)</Text>
        </View>

        <View style={styles.actionsGrid}>
          <View style={styles.actionItem}>
            <ActionButton label="Breakdown" icon="Breakdown" sublabel="Emergency assistance" onPress={() => onAction('breakdown_flow')} color={COLORS.white} />
          </View>
          <View style={styles.actionItem}>
            <ActionButton label="Onsite Service" icon="Truck" sublabel="Minor repairs" onPress={() => onAction('onsite_flow')} color={COLORS.white} />
          </View>
          <View style={styles.actionItem}>
            <ActionButton label="Service & Repair" icon="PPM" sublabel="Workshop visit" onPress={() => onAction('service_repair')} color={COLORS.white} />
          </View>
          <View style={styles.actionItem}>
            <ActionButton label="Vehicle Info" icon="Report" sublabel="History & docs" onPress={() => onAction('assets')} color={COLORS.white} />
          </View>
        </View>

        <SectionHeader title="My Assigned Vehicles" onSeeAll={() => onAction('assets')} />
        <Card onPress={() => onAction('assets')} style={styles.vehicleCard}>
          <View style={styles.vehicleRow}>
            <View style={styles.vehicleIcon}>
              <Ionicons name="car-outline" size={32} color={COLORS.slate[400]} />
            </View>
            <View style={styles.vehicleInfo}>
              <View style={styles.vehicleHeader}>
                <Text style={styles.vehicleName}>WMX 4821</Text>
                <View style={[styles.badge, { backgroundColor: COLORS.emerald[100] }]}>
                  <Text style={[styles.badgeText, { color: COLORS.emerald[700] }]}>Completed</Text>
                </View>
              </View>
              <Text style={styles.vehicleMeta}>Last Service: 12 Oct 2023</Text>
            </View>
          </View>
        </Card>

        <SectionHeader title="Active Requests" onSeeAll={() => onAction('records')} />
        <View style={styles.activeReq}>
          <View style={styles.activeReqHeader}>
            <Text style={styles.activeReqTag}>REQ-2201 - ONSITE</Text>
            <View style={styles.activeReqBadge}>
              <Text style={styles.activeReqBadgeText}>In Transit</Text>
            </View>
          </View>
          <Text style={styles.activeReqTitle}>Engine Warning Light</Text>
          <Text style={styles.activeReqLocation}>Location: KL Sentral Drop-off</Text>
          <View style={styles.activeReqActions}>
            <TouchableOpacity style={styles.activeReqBtn} onPress={() => onAction('records')}>
              <Text style={styles.activeReqBtnText}>View Status</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.activeReqIconBtn}>
              <Ionicons name="call-outline" size={18} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  welcome: { marginBottom: 24 },
  welcomeTitle: { fontSize: 20, fontWeight: '700', color: COLORS.slate[900] },
  welcomeSub: { fontSize: 14, color: COLORS.slate[500], marginTop: 4 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  actionItem: { width: '47%' },
  vehicleCard: { marginBottom: 16 },
  vehicleRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  vehicleIcon: { width: 56, height: 56, borderRadius: 12, backgroundColor: COLORS.slate[100], alignItems: 'center', justifyContent: 'center' },
  vehicleInfo: { flex: 1 },
  vehicleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  vehicleName: { fontSize: 16, fontWeight: '700', color: COLORS.slate[800] },
  vehicleMeta: { fontSize: 12, color: COLORS.slate[500] },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  badgeText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  activeReq: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16
  },
  activeReqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  activeReqTag: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.8)', letterSpacing: 1, textTransform: 'uppercase' },
  activeReqBadge: { paddingHorizontal: 8, paddingVertical: 2, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 4 },
  activeReqBadgeText: { fontSize: 10, fontWeight: '700', color: COLORS.white },
  activeReqTitle: { fontSize: 14, fontWeight: '700', color: COLORS.white, marginBottom: 4 },
  activeReqLocation: { fontSize: 10, color: 'rgba(255,255,255,0.85)', marginBottom: 16 },
  activeReqActions: { flexDirection: 'row', gap: 8 },
  activeReqBtn: { flex: 1, paddingVertical: 8, backgroundColor: COLORS.white, borderRadius: 8, alignItems: 'center' },
  activeReqBtnText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  activeReqIconBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8 }
});
