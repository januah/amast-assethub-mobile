import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { Card } from '../../components/Shared';
import { COLORS, INSTALL_STATUS_COLORS } from '../../constants/theme';

interface InstallationItem {
  id: string;
  docNo: string;
  status: string;
  asset: { name: string };
  hospital: { name: string; site: string };
  dueDate: string;
  signedCount: number;
}

const MOCK_INSTALLATIONS: InstallationItem[] = [
  { id: 'INS-001', docNo: 'SR-INSTALL-2023-440', status: 'assigned', asset: { name: 'GE MRI Magnetom' }, hospital: { name: 'Pantai Hospital KL', site: 'Radiology Wing' }, dueDate: '2023-10-30', signedCount: 0 },
  { id: 'INS-002', docNo: 'SR-INSTALL-2023-442', status: 'in_progress', asset: { name: 'Mindray Anesthesia System' }, hospital: { name: 'Pantai Hospital KL', site: 'OT-4' }, dueDate: '2023-11-05', signedCount: 1 },
  { id: 'INS-003', docNo: 'SR-INSTALL-2023-410', status: 'pending_ack', asset: { name: 'Patient Monitor B40' }, hospital: { name: 'Gleneagles KL', site: 'ICU-B' }, dueDate: '2023-10-22', signedCount: 2 }
];

interface InstallerDashboardProps {
  onSelect: (id: string) => void;
  onLogout?: () => void;
}

export function InstallerDashboard({ onSelect, onLogout }: InstallerDashboardProps) {
  const [filter, setFilter] = useState<'all' | 'assigned' | 'in_progress' | 'pending_ack'>('all');
  const [search, setSearch] = useState('');

  const filtered = MOCK_INSTALLATIONS.filter(
    (item) =>
      (filter === 'all' || item.status === filter) &&
      (item.asset.name.toLowerCase().includes(search.toLowerCase()) || item.docNo.toLowerCase().includes(search.toLowerCase()))
  );

  const stats = {
    total: MOCK_INSTALLATIONS.length,
    active: MOCK_INSTALLATIONS.filter((i) => i.status === 'in_progress').length,
    pending: MOCK_INSTALLATIONS.filter((i) => i.status === 'pending_ack').length
  };

  const getStatusStyle = (status: string) => INSTALL_STATUS_COLORS[status] || { bg: COLORS.slate[100], text: COLORS.slate[600] };

  return (
    <View style={styles.container}>
      <Header title="My Installations" />
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={[styles.statItem, styles.statDivider]}>
          <Text style={[styles.statValue, styles.statValueAmber]}>{stats.active}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={[styles.statItem, styles.statDivider]}>
          <Text style={[styles.statValue, styles.statValuePurple]}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Sign-offs</Text>
        </View>
      </View>

      <View style={styles.searchBar}>
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={18} color={COLORS.slate[400]} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by Tag, Name or Doc #..."
            placeholderTextColor={COLORS.slate[400]}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <View style={styles.filterWrap}>
          <TouchableOpacity style={styles.filterBtn}>
            <Text style={styles.filterBtnText}>{filter === 'all' ? 'All' : filter.replace('_', ' ')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {filtered.length > 0 ? (
          filtered.map((item) => {
            const statusStyle = getStatusStyle(item.status);
            return (
              <Card key={item.id} onPress={() => onSelect(item.id)} leftBorder={COLORS.primary} style={styles.installCard}>
                <View style={styles.installHeader}>
                  <View>
                    <Text style={styles.installDocNo}>{item.docNo}</Text>
                    <Text style={styles.installAsset}>{item.asset.name}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                    <Text style={[styles.statusBadgeText, { color: statusStyle.text }]}>{item.status.replace('_', ' ')}</Text>
                  </View>
                </View>
                <View style={styles.installMeta}>
                  <Ionicons name="navigate-outline" size={12} color={COLORS.slate[300]} />
                  <Text style={styles.installMetaText}>{item.hospital.name} - {item.hospital.site}</Text>
                </View>
                <View style={styles.installMeta}>
                  <Ionicons name="calendar-outline" size={12} color={COLORS.slate[300]} />
                  <Text style={styles.installMetaText}>Target Date: <Text style={styles.installDate}>{item.dueDate}</Text></Text>
                </View>
                <View style={styles.installFooter}>
                  <View style={styles.signoffDots}>
                    {[1, 2, 3].map((i) => (
                      <View
                        key={i}
                        style={[
                          styles.signoffDot,
                          i <= item.signedCount ? styles.signoffDotSigned : styles.signoffDotPending
                        ]}
                      >
                        <Text style={i <= item.signedCount ? styles.signoffDotTextSigned : styles.signoffDotTextPending}>{i}</Text>
                      </View>
                    ))}
                    <Text style={styles.signoffLabel}>Sign-offs</Text>
                  </View>
                  <View style={styles.detailLink}>
                    <Text style={styles.detailLinkText}>Detail</Text>
                    <Ionicons name="chevron-forward" size={12} color={COLORS.primary} />
                  </View>
                </View>
              </Card>
            );
          })
        ) : (
          <View style={styles.empty}>
            <Ionicons name="briefcase-outline" size={64} color={COLORS.slate[300]} />
            <Text style={styles.emptyText}>No tasks found</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.slate[50] },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate[200]
  },
  statItem: { flex: 1, paddingVertical: 16, alignItems: 'center' },
  statDivider: { borderLeftWidth: 1, borderLeftColor: COLORS.slate[100] },
  statValue: { fontSize: 20, fontWeight: '800', color: COLORS.slate[900] },
  statValueAmber: { color: COLORS.amber[500] },
  statValuePurple: { color: '#7c3aed' },
  statLabel: { fontSize: 9, fontWeight: '700', color: COLORS.slate[400], marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate[100]
  },
  searchWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', position: 'relative' },
  searchIcon: { position: 'absolute', left: 12, zIndex: 1 },
  searchInput: {
    flex: 1,
    paddingLeft: 40,
    paddingRight: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.slate[50],
    borderWidth: 1,
    borderColor: COLORS.slate[200],
    borderRadius: 12,
    fontSize: 14
  },
  filterWrap: { width: 90 },
  filterBtn: {
    padding: 10,
    backgroundColor: COLORS.slate[50],
    borderWidth: 1,
    borderColor: COLORS.slate[200],
    borderRadius: 12
  },
  filterBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.slate[800],
    textTransform: 'uppercase'
  },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  installCard: { marginBottom: 16 },
  installHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  installDocNo: { fontSize: 10, fontWeight: '700', color: COLORS.slate[400], textTransform: 'uppercase' },
  installAsset: { fontSize: 14, fontWeight: '700', color: COLORS.slate[800], marginTop: 4 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  statusBadgeText: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },
  installMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  installMetaText: { fontSize: 10, color: COLORS.slate[500] },
  installDate: { fontWeight: '700', color: COLORS.slate[700] },
  installFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.slate[100] },
  signoffDots: { flexDirection: 'row', alignItems: 'center', gap: -6 },
  signoffDot: { width: 20, height: 20, borderRadius: 10, borderWidth: 1, borderColor: COLORS.white, alignItems: 'center', justifyContent: 'center' },
  signoffDotSigned: { backgroundColor: COLORS.emerald[500] },
  signoffDotPending: { backgroundColor: COLORS.slate[200] },
  signoffDotTextSigned: { fontSize: 8, fontWeight: '800', color: COLORS.white },
  signoffDotTextPending: { fontSize: 8, fontWeight: '800', color: COLORS.slate[400] },
  signoffLabel: { fontSize: 8, fontWeight: '700', color: COLORS.slate[400], marginLeft: 24, textTransform: 'uppercase' },
  detailLink: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailLinkText: { fontSize: 10, fontWeight: '700', color: COLORS.primary, textTransform: 'uppercase' },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 64 },
  emptyText: { fontSize: 14, fontWeight: '700', color: COLORS.slate[400], marginTop: 16 }
});
