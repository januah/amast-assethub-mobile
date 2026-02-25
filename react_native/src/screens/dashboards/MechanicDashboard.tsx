import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { Card, StatusBadge } from '../../components/Shared';
import { COLORS } from '../../constants/theme';

interface MechanicJob {
  id: string;
  type: string;
  asset: string;
  location: string;
  requester: string;
  priority: 'Normal' | 'Urgent' | 'Critical';
  status: string;
  dueTime: string;
}

const MOCK_JOBS: MechanicJob[] = [
  { id: 'JOB-MECH-4821', type: 'Service & Repair', asset: 'Toyota Hiace Ambulance (WMX 4821)', location: 'Hospital Seri Botani - Workshop', requester: 'Driver Ahmad', priority: 'Urgent', status: 'Assigned', dueTime: '2h 15m left' },
  { id: 'JOB-MECH-9902', type: 'Onsite Service', asset: 'Mercedes Sprinter (WVB 9902)', location: 'KL Sentral - Drop-off A', requester: 'Driver Sam', priority: 'Normal', status: 'En-route', dueTime: '4h 30m left' },
  { id: 'JOB-MECH-4401', type: 'Breakdown', asset: 'Ambulance Unit 04', location: 'MRR2 Highway - KM 12.5', requester: 'Driver Kamal', priority: 'Critical', status: 'Completed', dueTime: 'Finished' }
];

interface MechanicDashboardProps {
  onSelectJob: (id: string) => void;
  onLogout?: () => void;
}

export function MechanicDashboard({ onSelectJob, onLogout }: MechanicDashboardProps) {
  const [filter, setFilter] = useState<'New' | 'In Progress' | 'Completed'>('New');

  const filteredJobs = MOCK_JOBS.filter((job) => {
    if (filter === 'New') return job.status === 'Assigned';
    if (filter === 'In Progress') return ['En-route', 'Arrived', 'Inspection', 'Work-in-progress'].includes(job.status);
    return job.status === 'Completed';
  });

  const getPriorityColor = (p: string) => {
    if (p === 'Critical') return COLORS.danger;
    if (p === 'Urgent') return COLORS.amber[500];
    return COLORS.primary;
  };

  return (
    <View style={styles.container}>
      <Header title="My Jobs" />
      <View style={styles.bar}>
        <Ionicons name="briefcase-outline" size={16} color={COLORS.slate[400]} />
        <Text style={styles.barText}>Central Workshop A</Text>
      </View>

      <View style={styles.tabs}>
        {(['New', 'In Progress', 'Completed'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, filter === t && styles.tabActive]}
            onPress={() => setFilter(t)}
          >
            <Text style={[styles.tabText, filter === t && styles.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <Card key={job.id} onPress={() => onSelectJob(job.id)} leftBorder={COLORS.primary} style={styles.jobCard}>
              <View style={styles.jobHeader}>
                <Text style={styles.jobId}>{job.id} - {job.type}</Text>
                <StatusBadge status={job.status === 'Completed' ? 'Completed' : 'In Progress'} />
              </View>
              <Text style={styles.jobAsset}>{job.asset}</Text>
              <View style={styles.jobMeta}>
                <Ionicons name="navigate-outline" size={12} color={COLORS.slate[500]} />
                <Text style={styles.jobMetaText}>{job.location}</Text>
              </View>
              <View style={styles.jobMeta}>
                <Ionicons name="person-outline" size={12} color={COLORS.slate[500]} />
                <Text style={styles.jobMetaText}>Requester: {job.requester}</Text>
              </View>
              <View style={styles.jobFooter}>
                <Text style={[styles.jobPriority, { color: getPriorityColor(job.priority) }]}>
                  {job.priority} Priority
                </Text>
                <View style={styles.jobDue}>
                  <Ionicons name="time-outline" size={12} color={COLORS.slate[400]} />
                  <Text style={styles.jobDueText}>Due: {job.dueTime}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.viewJobBtn} onPress={() => onSelectJob(job.id)}>
                <Text style={styles.viewJobBtnText}>View Job</Text>
                <Ionicons name="chevron-forward" size={14} color={COLORS.white} />
              </TouchableOpacity>
            </Card>
          ))
        ) : (
          <View style={styles.empty}>
            <Ionicons name="briefcase-outline" size={48} color={COLORS.slate[300]} />
            <Text style={styles.emptyText}>No jobs in this category</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.slate[50] },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate[200]
  },
  barText: { fontSize: 10, fontWeight: '700', color: COLORS.slate[500], letterSpacing: 1, textTransform: 'uppercase' },
  tabs: { flexDirection: 'row', padding: 4, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.slate[100] },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: 10, fontWeight: '700', color: COLORS.slate[400], letterSpacing: 1, textTransform: 'uppercase' },
  tabTextActive: { color: COLORS.white },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  jobCard: { marginBottom: 16 },
  jobHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  jobId: { fontSize: 10, fontWeight: '700', color: COLORS.slate[400], textTransform: 'uppercase' },
  jobAsset: { fontSize: 14, fontWeight: '700', color: COLORS.slate[800], marginBottom: 12 },
  jobMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  jobMetaText: { fontSize: 10, color: COLORS.slate[500] },
  jobFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.slate[100] },
  jobPriority: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  jobDue: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  jobDueText: { fontSize: 10, fontWeight: '700', color: COLORS.slate[400] },
  viewJobBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.slate[900],
    borderRadius: 12
  },
  viewJobBtnText: { fontSize: 12, fontWeight: '700', color: COLORS.white },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48 },
  emptyText: { fontSize: 14, fontWeight: '700', color: COLORS.slate[400], marginTop: 12 }
});
