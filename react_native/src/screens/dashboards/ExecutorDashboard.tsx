import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { ActionButton, Card, SectionHeader, StatusBadge } from '../../components/Shared';
import { COLORS } from '../../constants/theme';
import { UserRole } from '../../types';

interface ExecutorDashboardProps {
  role: UserRole;
  onAction: (flow: string) => void;
  onLogout?: () => void;
  unreadCount?: number;
}

export function ExecutorDashboard({ role, onAction, onLogout, unreadCount = 0 }: ExecutorDashboardProps) {
  const roleLabel = role.replace(/_/g, ' ');
  const jobTitle = role === UserRole.TOW_TRUCK ? 'Towing Ambulance WMX' : 'Biomedical / PPM';

  return (
    <View style={styles.container}>
      <Header
        title={`${roleLabel} Portal`}
        showRightIcons
        onNotificationClick={() => onAction('notifications')}
        onAvatarPress={() => onAction('profile')}
        unreadCount={unreadCount}
      />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.heroAvatar}>
              <Text style={styles.heroAvatarText}>{role.substring(0, 2).toUpperCase()}</Text>
            </View>
            <View>
              <Text style={styles.heroName}>Ahmad Kamal</Text>
              <Text style={styles.heroRole}>Senior {roleLabel}</Text>
            </View>
          </View>
          <View style={styles.heroStats}>
            <TouchableOpacity style={styles.heroStat} onPress={() => onAction('task_list')}>
              <Text style={styles.heroStatLabel}>Jobs Today</Text>
              <Text style={styles.heroStatValue}>4 Tasks</Text>
            </TouchableOpacity>
            <View style={[styles.heroStat, { alignItems: 'flex-end' }]}>
              <Text style={styles.heroStatLabel}>Rating</Text>
              <Text style={styles.heroStatValueSky}>4.9</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <View style={styles.actionHalf}>
            <ActionButton label="Pending Jobs" icon="Jobs" sublabel="3 New requests" onPress={() => onAction('task_list')} color={COLORS.white} />
          </View>
          <View style={styles.actionHalf}>
            <ActionButton label="PPM Schedule" icon="Calendar" sublabel="8 Tasks this week" onPress={() => onAction('ppm_list')} color={COLORS.white} />
          </View>
        </View>
        {role === UserRole.BIOMED_ENGINEER && (
          <View style={styles.actionsRow}>
            <View style={styles.actionHalf}>
              <ActionButton label="Replacements" icon="Replacement" sublabel="Manage loaners" onPress={() => onAction('replacement_list')} color={COLORS.white} />
            </View>
            <View style={styles.actionHalf}>
              <ActionButton label="Device Removal" icon="Truck" sublabel="Transport to office" onPress={() => onAction('removal')} color={COLORS.white} />
            </View>
          </View>
        )}

        <SectionHeader title="Currently Active Job" />
        <Card onPress={() => onAction('job_detail')} leftBorder={COLORS.primary} style={styles.jobCard}>
          <View style={styles.jobHeader}>
            <Text style={styles.jobId}>ACTIVE - REQ-1102</Text>
            <StatusBadge status="In Progress" />
          </View>
          <Text style={styles.jobTitle}>{jobTitle}</Text>
          <Text style={styles.jobLocation}>Location: Hospital Seri Botani - Level 2</Text>
          <View style={styles.jobActions}>
            <TouchableOpacity style={styles.resumeBtn} onPress={() => onAction('job_detail')}>
              <Text style={styles.resumeBtnText}>Resume Job</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navBtn}>
              <Ionicons name="navigate-outline" size={18} color={COLORS.slate[500]} />
            </TouchableOpacity>
          </View>
        </Card>

        <SectionHeader title="Recent Activity" onSeeAll={() => onAction('records')} />
        {[1, 2].map((i) => (
          <Card key={i} onPress={() => onAction('records')} style={styles.activityCard}>
            <View style={styles.activityRow}>
              <View style={styles.activityIcon}>
                <Ionicons name="checkmark-circle" size={18} color={COLORS.emerald[600]} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Completed Repair #{i}</Text>
                <Text style={styles.activityMeta}>Yesterday</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.slate[300]} />
            </View>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  hero: {
    backgroundColor: COLORS.slate[900],
    borderRadius: 16,
    padding: 20,
    marginBottom: 24
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
  heroAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  heroAvatarText: { fontSize: 18, fontWeight: '800', color: COLORS.white },
  heroName: { fontSize: 16, fontWeight: '700', color: COLORS.white },
  heroRole: { fontSize: 12, color: COLORS.slate[400], marginTop: 2 },
  heroStats: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 16, borderTopWidth: 1, borderTopColor: COLORS.slate[800] },
  heroStat: { flex: 1 },
  heroStatLabel: { fontSize: 10, fontWeight: '700', color: COLORS.slate[500], textTransform: 'uppercase', letterSpacing: 1 },
  heroStatValue: { fontSize: 18, fontWeight: '700', color: COLORS.white, marginTop: 2 },
  heroStatValueSky: { fontSize: 18, fontWeight: '700', color: COLORS.sky[400], marginTop: 2 },
  actionsRow: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  actionHalf: { flex: 1 },
  jobCard: { marginBottom: 8 },
  jobHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  jobId: { fontSize: 10, fontWeight: '700', color: COLORS.slate[400], textTransform: 'uppercase' },
  jobTitle: { fontSize: 14, fontWeight: '700', color: COLORS.slate[800], marginBottom: 4 },
  jobLocation: { fontSize: 10, color: COLORS.slate[500], marginBottom: 16 },
  jobActions: { flexDirection: 'row', gap: 8 },
  resumeBtn: { flex: 1, paddingVertical: 8, backgroundColor: COLORS.primary, borderRadius: 12, alignItems: 'center' },
  resumeBtnText: { fontSize: 12, fontWeight: '700', color: COLORS.white },
  navBtn: { padding: 8, borderWidth: 1, borderColor: COLORS.slate[200], borderRadius: 12 },
  activityCard: { marginBottom: 12 },
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  activityIcon: { width: 36, height: 36, borderRadius: 8, backgroundColor: COLORS.emerald[50], alignItems: 'center', justifyContent: 'center' },
  activityContent: { flex: 1 },
  activityTitle: { fontSize: 12, fontWeight: '700', color: COLORS.slate[800] },
  activityMeta: { fontSize: 10, color: COLORS.slate[400], marginTop: 2 }
});
