import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { Card, SectionHeader, StatusBadge } from '../../components/Shared';
import { COLORS } from '../../constants/theme';

type AssetStatus = 'Pending' | 'In Progress' | 'Completed';

interface Asset {
  id: string;
  name: string;
  type: string;
  status: AssetStatus;
  location: string;
  nextPpm: string;
}

const MEDICAL_ASSETS: Asset[] = [
  { id: 'DF-002', name: 'Phillips Defibrillator X3', type: 'Life Support', status: 'Completed', location: 'Ward 4B', nextPpm: '12 Dec 2023' },
  { id: 'VS-441', name: 'Mindray Vital Signs Monitor', type: 'Monitoring', status: 'Pending', location: 'ICU-1', nextPpm: '05 Jan 2024' },
  { id: 'VT-118', name: 'Hamilton Ventilator C6', type: 'Life Support', status: 'In Progress', location: 'ICU-2', nextPpm: '18 Nov 2023' },
  { id: 'ECG-992', name: 'GE ECG Machine', type: 'Diagnostics', status: 'Completed', location: 'Ward 3A', nextPpm: '22 Dec 2023' },
];

interface InventoryScreenProps {
  onBack: () => void;
  onReportIssue?: (asset: { id: string; name: string }) => void;
}

export function InventoryScreen({ onBack, onReportIssue }: InventoryScreenProps) {
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAssets = MEDICAL_ASSETS.filter(
    (a) =>
      !searchQuery.trim() ||
      a.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (view === 'detail' && selectedAsset) {
    return (
      <View style={styles.container}>
        <Header title="Asset Detail" showBack onBack={() => { setView('list'); setSelectedAsset(null); }} />
        <ScrollView style={styles.scroll} contentContainerStyle={styles.detailContent} showsVerticalScrollIndicator={false}>
          <View style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <View style={styles.detailIcon}>
                <Ionicons name="medkit-outline" size={32} color={COLORS.primary} />
              </View>
              <StatusBadge status={selectedAsset.status} />
            </View>
            <Text style={styles.detailName}>{selectedAsset.name}</Text>
            <Text style={styles.detailId}>{selectedAsset.id}</Text>
          </View>

          <SectionHeader title="Technical Specs" />
          <Card style={styles.specsCard}>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Model</Text>
              <Text style={styles.specValue}>2023 Rev-X</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Warranty</Text>
              <Text style={[styles.specValue, { color: COLORS.emerald[600] }]}>Active (Exp 2025)</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Location</Text>
              <Text style={styles.specValue}>{selectedAsset.location}</Text>
            </View>
          </Card>

          <SectionHeader title="Service History" />
          <View style={styles.historyList}>
            <View style={styles.historyItem}>
              <View>
                <Text style={styles.historyTitle}>Annual PPM</Text>
                <Text style={styles.historyMeta}>Completed by Eng. Zul - 12 Oct 2023</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.slate[300]} />
            </View>
            <View style={styles.historyItem}>
              <View>
                <Text style={styles.historyTitle}>Inspection</Text>
                <Text style={styles.historyMeta}>Completed by Eng. Ahmad - 05 Aug 2023</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.slate[300]} />
            </View>
          </View>
        </ScrollView>
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.reportButton}
            onPress={() => onReportIssue?.({ id: selectedAsset.id, name: selectedAsset.name })}
            activeOpacity={0.8}
          >
            <Text style={styles.reportButtonText}>Report New Issue</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Medical Devices" showBack onBack={onBack} />
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={COLORS.slate[400]} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by ID or Name..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {filteredAssets.map((asset) => (
          <Card
            key={asset.id}
            onPress={() => { setSelectedAsset(asset); setView('detail'); }}
            style={styles.assetCard}
          >
            <View style={styles.assetIcon}>
              <Ionicons name="medkit-outline" size={24} color={COLORS.slate[400]} />
            </View>
            <View style={styles.assetInfo}>
              <View style={styles.assetRow}>
                <Text style={styles.assetId}>{asset.id}</Text>
                <StatusBadge status={asset.status} />
              </View>
              <Text style={styles.assetName}>{asset.name}</Text>
              <View style={styles.assetMeta}>
                <View style={styles.assetMetaItem}>
                  <Ionicons name="location-outline" size={12} color={COLORS.slate[400]} />
                  <Text style={styles.assetMetaText}>{asset.location}</Text>
                </View>
                <View style={styles.assetMetaItem}>
                  <Ionicons name="calendar-outline" size={12} color={COLORS.slate[400]} />
                  <Text style={styles.assetMetaText}>PPM: {asset.nextPpm}</Text>
                </View>
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.slate[50]
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 0,
    paddingBottom: 12
  },
  searchIcon: {
    position: 'absolute',
    left: 28,
    zIndex: 1
  },
  searchInput: {
    flex: 1,
    paddingLeft: 40,
    paddingRight: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.slate[50],
    borderRadius: 12,
    fontSize: 14
  },
  scroll: { flex: 1 },
  content: {
    padding: 16,
    paddingTop: 0,
    paddingBottom: 48
  },
  assetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12
  },
  assetIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.slate[100],
    alignItems: 'center',
    justifyContent: 'center'
  },
  assetInfo: { flex: 1 },
  assetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  assetId: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.slate[400],
    textTransform: 'uppercase'
  },
  assetName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.slate[800]
  },
  assetMeta: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6
  },
  assetMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  assetMetaText: {
    fontSize: 10,
    color: COLORS.slate[500]
  },
  detailContent: {
    padding: 16,
    paddingBottom: 48
  },
  detailCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.slate[200],
    marginBottom: 24
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16
  },
  detailIcon: {
    padding: 12,
    backgroundColor: COLORS.sky[50],
    borderRadius: 16
  },
  detailName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.slate[900]
  },
  detailId: {
    fontSize: 14,
    color: COLORS.slate[500],
    marginTop: 4
  },
  specsCard: {
    marginBottom: 8
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8
  },
  specLabel: {
    fontSize: 14,
    color: COLORS.slate[500]
  },
  specValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.slate[800]
  },
  historyList: {
    gap: 8
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.slate[100]
  },
  historyTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.slate[800]
  },
  historyMeta: {
    fontSize: 10,
    color: COLORS.slate[400],
    marginTop: 2
  },
  footer: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.slate[200]
  },
  reportButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center'
  },
  reportButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700'
  }
});
