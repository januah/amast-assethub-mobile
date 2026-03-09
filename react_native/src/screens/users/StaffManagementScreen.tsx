import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { AnimatedScreen } from '../../components/AnimatedScreen';
import { Card, SectionHeader } from '../../components/Shared';
import { COLORS } from '../../constants/theme';
import { getTeamSummary } from '../../api/teamApi';

function statusColor(s: string) {
  if (s === 'Online') return COLORS.emerald[500];
  if (s === 'On Job') return COLORS.amber[500];
  return COLORS.slate[300];
}

interface StaffManagementScreenProps {
  onBack: () => void;
  onAddStaff?: () => void;
  onSelectStaff?: (id: string) => void;
}

export function StaffManagementScreen({
  onBack,
  onAddStaff,
  onSelectStaff
}: StaffManagementScreenProps) {
  const [data, setData] = useState<{ activeStaff: number; efficiency: number; staff: { id: string; name: string; username?: string; role: string; status: string; score: string; tasks: string }[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getTeamSummary().then((res) => {
      if (cancelled) return;
      setLoading(false);
      if (res.success && res.data) setData(res.data);
      else setData({ activeStaff: 0, efficiency: 0, staff: [] });
    }).catch(() => {
      if (!cancelled) {
        setLoading(false);
        setData({ activeStaff: 0, efficiency: 0, staff: [] });
      }
    });
    return () => { cancelled = true; };
  }, []);

  const summary = data ?? { activeStaff: 0, efficiency: 0, staff: [] };

  return (
    <AnimatedScreen style={styles.container}>
      <Header title="Staff Management" showBack onBack={onBack} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <>
            <View style={styles.statsRow}>
              <View style={[styles.statCard, styles.statPrimary]}>
                <Text style={styles.statValue}>{summary.activeStaff}</Text>
                <Text style={styles.statLabel}>Active Staff</Text>
              </View>
              <View style={[styles.statCard, styles.statSecondary]}>
                <Text style={[styles.statValue, { color: COLORS.emerald[600] }]}>{summary.efficiency}%</Text>
                <Text style={styles.statLabel}>Efficiency</Text>
              </View>
            </View>

            <View style={styles.sectionHeaderWrap}>
              <SectionHeader title="Staff Performance" />
            </View>
            <TouchableOpacity
              style={[styles.staffCard, styles.addButton]}
              onPress={onAddStaff}
              activeOpacity={0.7}
            >
              <View style={styles.staffAvatar}>
                <Ionicons name="add" size={24} color={COLORS.slate[400]} />
              </View>
              <View style={styles.staffInfo}>
                <Text style={styles.addButtonText}>Add New Staff Member</Text>
              </View>
            </TouchableOpacity>
            {summary.staff.length > 0 ? summary.staff.map((staff) => (
          <Card
            key={staff.id}
            onPress={() => onSelectStaff?.(staff.id)}
            style={styles.staffCard}
          >
            <View style={styles.staffAvatar}>
              <Ionicons name="person-outline" size={24} color={COLORS.slate[400]} />
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: statusColor(staff.status) }
                ]}
              />
            </View>
            <View style={styles.staffInfo}>
              <View style={styles.staffRow}>
                <Text style={styles.staffName}>{staff.name}</Text>
              </View>
              <Text style={styles.staffMeta}>
                Username: {staff.username ?? staff.name}
                {' • '}{'Role: ' + staff.role}
              </Text>
              <Text style={styles.staffMeta}>{'Tasks: ' + staff.tasks}</Text>
            </View>
            <View style={styles.staffScoreRow}>
              <Ionicons name="ribbon-outline" size={14} color={COLORS.primary} style={styles.staffScoreIcon} />
              <Text style={styles.staffScore}>{staff.score}</Text>
            </View>
          </Card>
        )) : (
          <View style={styles.staffCard}>
            <View style={styles.staffAvatar}>
              <Ionicons name="person-outline" size={24} color={COLORS.slate[400]} />
            </View>
            <View style={styles.staffInfo}>
              <Text style={styles.staffName}>No staff members</Text>
              <Text style={styles.staffMeta}>Add staff to see them here</Text>
            </View>
          </View>
        )}
          </>
        )}
      </ScrollView>
    </AnimatedScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.slate[50]
  },
  scroll: { flex: 1 },
  content: {
    padding: 16,
    paddingBottom: 48
  },
  loading: { padding: 48, alignItems: 'center', justifyContent: 'center' },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12
  },
  sectionHeaderWrap: {
    marginTop: -12
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.slate[200],
    backgroundColor: COLORS.white
  },
  statPrimary: {
    borderColor: COLORS.sky[200],
    backgroundColor: COLORS.sky[50]
  },
  statSecondary: {},
  statValue: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.primary
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.slate[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 4
  },
  staffCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12
  },
  staffAvatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.slate[100],
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  statusDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.white
  },
  staffInfo: { flex: 1 },
  staffRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  staffName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.slate[800]
  },
  staffScoreRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  staffScoreIcon: {
    marginRight: 4
  },
  staffScore: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.primary
  },
  staffMeta: {
    fontSize: 10,
    color: COLORS.slate[400],
    marginTop: 2
  },
  addButton: {
    marginBottom: 12,
    padding: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.slate[300],
    borderRadius: 16,
    backgroundColor: COLORS.white
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.slate[400],
    textTransform: 'uppercase',
    letterSpacing: 1
  }
});
