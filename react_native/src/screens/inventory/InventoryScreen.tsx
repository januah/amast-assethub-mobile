import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { Card, SectionHeader, StatusBadge } from '../../components/Shared';
import { COLORS } from '../../constants/theme';
import { getAssets, getAssetById, ApiAsset, GetAssetsResponse } from '../../api/assetsApi';

const ITEMS_PER_PAGE = 10;

const ASSET_STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
  { value: 'CALIBRATION', label: 'Calibration' },
  { value: 'DECOMMISSIONED', label: 'Decommissioned' }
];

function formatDate(s: string | undefined) {
  if (!s) return '-';
  try {
    const d = new Date(s);
    return isNaN(d.getTime()) ? s : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return s;
  }
}

interface InventoryScreenProps {
  onBack: () => void;
  onReportIssue?: (asset: { id: string; name: string }) => void;
}

export function InventoryScreen({ onBack, onReportIssue }: InventoryScreenProps) {
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [selectedAsset, setSelectedAsset] = useState<ApiAsset | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [assets, setAssets] = useState<ApiAsset[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAssets = useCallback(async (page: number, search?: string, status?: string) => {
    setLoading(true);
    setError('');
    const res = await getAssets({ page, limit: ITEMS_PER_PAGE, search: search || undefined, status: status || undefined });
    setLoading(false);
    if ((res as { success?: boolean }).success === false) {
      setAssets([]);
      setTotalPages(1);
      setTotalItems(0);
      setError((res as { message?: string }).message || 'Failed to load assets');
      return;
    }
    const data = res as unknown as GetAssetsResponse;
    setAssets(data.assets || []);
    setTotalPages(data.totalPages ?? 1);
    setTotalItems(data.totalItems ?? 0);
  }, []);

  useEffect(() => {
    fetchAssets(currentPage, appliedSearch || undefined, statusFilter || undefined);
  }, [fetchAssets, currentPage, appliedSearch, statusFilter]);

  const handleSearch = useCallback(() => {
    setAppliedSearch(searchQuery.trim());
    setCurrentPage(1);
  }, [searchQuery]);

  const displayAssets = assets;

  const openDetail = useCallback(async (asset: ApiAsset) => {
    setView('detail');
    setSelectedAsset(asset);
    setDetailLoading(true);
    const res = await getAssetById(asset.asset_id);
    setDetailLoading(false);
    if ((res as { success?: boolean }).success === false) {
      setSelectedAsset(asset);
      return;
    }
    setSelectedAsset((res as unknown as ApiAsset) || asset);
  }, []);

  const locationName = (a: ApiAsset) =>
    a.Location?.name || a.Department?.name || a.location_id || '-';

  const nextPpm = (a: ApiAsset) => formatDate(a.warranty_expiry || a.install_date);

  if (view === 'detail' && selectedAsset) {
    return (
      <View style={styles.container}>
        <Header title="Asset Detail" showBack onBack={() => { setView('list'); setSelectedAsset(null); }} />
        {detailLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <ScrollView style={styles.scroll} contentContainerStyle={styles.detailContent} showsVerticalScrollIndicator={false}>
            <View style={styles.detailCard}>
              <View style={styles.detailHeader}>
                <View style={styles.detailIcon}>
                  <Ionicons name="medkit-outline" size={32} color={COLORS.primary} />
                </View>
                <StatusBadge status={selectedAsset.status as 'ACTIVE' | 'MAINTENANCE' | 'CALIBRATION' | 'DECOMMISSIONED'} />
              </View>
              <Text style={styles.detailName}>{selectedAsset.name}</Text>
              <Text style={styles.detailId}>{selectedAsset.asset_id}</Text>
            </View>

            <SectionHeader title="Technical Specs" />
            <Card style={styles.specsCard}>
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Model</Text>
                <Text style={styles.specValue}>{selectedAsset.model || '-'}</Text>
              </View>
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Serial</Text>
                <Text style={styles.specValue}>{selectedAsset.serial_number || '-'}</Text>
              </View>
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Manufacturer</Text>
                <Text style={styles.specValue}>{selectedAsset.manufacturer || '-'}</Text>
              </View>
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Warranty</Text>
                <Text style={[styles.specValue, selectedAsset.warranty_expiry ? { color: COLORS.emerald[600] } : undefined]}>
                  {selectedAsset.warranty_expiry ? `Exp ${formatDate(selectedAsset.warranty_expiry)}` : '-'}
                </Text>
              </View>
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Location</Text>
                <Text style={styles.specValue}>{locationName(selectedAsset)}</Text>
              </View>
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Category</Text>
                <Text style={styles.specValue}>{selectedAsset.Category?.name || '-'}</Text>
              </View>
            </Card>
          </ScrollView>
        )}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.reportButton}
            onPress={() => onReportIssue?.({ id: selectedAsset.asset_id, name: selectedAsset.name })}
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
      <Header title="Asset Management" showBack onBack={onBack} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterScrollContent}>
        {ASSET_STATUS_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value || 'all'}
            onPress={() => { setStatusFilter(opt.value); setCurrentPage(1); }}
            style={[styles.filterChip, statusFilter === opt.value && styles.filterChipActive]}
          >
            <Text style={[styles.filterChipText, statusFilter === opt.value && styles.filterChipTextActive]}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={COLORS.slate[400]} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by ID, name, or serial..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity onPress={handleSearch} style={styles.searchBtn}>
          <Text style={styles.searchBtnText}>Search</Text>
        </TouchableOpacity>
      </View>
      {error ? (
        <View style={styles.errorWrap}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : displayAssets.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No assets found</Text>
          </View>
        ) : (
          displayAssets.map((asset) => (
            <Card
              key={asset.asset_id}
              onPress={() => openDetail(asset)}
              style={styles.assetCard}
            >
              <View style={styles.assetIcon}>
                <Ionicons name="medkit-outline" size={24} color={COLORS.slate[400]} />
              </View>
              <View style={styles.assetInfo}>
                <View style={styles.assetRow}>
                  <Text style={styles.assetId}>{asset.asset_id}</Text>
                  <StatusBadge status={asset.status as 'ACTIVE' | 'MAINTENANCE' | 'CALIBRATION' | 'DECOMMISSIONED'} />
                </View>
                <Text style={styles.assetName}>{asset.name}</Text>
                <View style={styles.assetMeta}>
                  <View style={styles.assetMetaItem}>
                    <Ionicons name="location-outline" size={12} color={COLORS.slate[400]} />
                    <Text style={styles.assetMetaText}>{locationName(asset)}</Text>
                  </View>
                  <View style={styles.assetMetaItem}>
                    <Ionicons name="calendar-outline" size={12} color={COLORS.slate[400]} />
                    <Text style={styles.assetMetaText}>Warranty: {nextPpm(asset)}</Text>
                  </View>
                </View>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
      {!loading && displayAssets.length > 0 && totalPages > 1 ? (
        <View style={styles.pagination}>
          <TouchableOpacity
            style={[styles.pageBtn, currentPage <= 1 && styles.pageBtnDisabled]}
            onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
          >
            <Ionicons name="chevron-back" size={20} color={currentPage <= 1 ? COLORS.slate[300] : COLORS.slate[700]} />
            <Text style={[styles.pageBtnText, currentPage <= 1 && styles.pageBtnTextDisabled]}>Prev</Text>
          </TouchableOpacity>
          <Text style={styles.pageInfo}>Page {currentPage} of {totalPages}</Text>
          <TouchableOpacity
            style={[styles.pageBtn, currentPage >= totalPages && styles.pageBtnDisabled]}
            onPress={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
          >
            <Text style={[styles.pageBtnText, currentPage >= totalPages && styles.pageBtnTextDisabled]}>Next</Text>
            <Ionicons name="chevron-forward" size={20} color={currentPage >= totalPages ? COLORS.slate[300] : COLORS.slate[700]} />
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.slate[50]
  },
  filterScroll: { maxHeight: 50, marginBottom: 4 },
  filterScrollContent: { 
    paddingHorizontal: 16, 
    gap: 4, 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 8 
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.slate[200]
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.slate[600]
  },
  filterChipTextActive: {
    color: COLORS.white
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 10
  },
  searchInput: {
    flex: 1,
    paddingLeft: 12,
    paddingRight: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.slate[200],
    fontSize: 14
  },
  searchBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: COLORS.primary,
    borderRadius: 12
  },
  searchBtnText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 14
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.slate[200]
  },
  pageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  pageBtnDisabled: {
    opacity: 0.5
  },
  pageBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.slate[700]
  },
  pageBtnTextDisabled: {
    color: COLORS.slate[400]
  },
  pageInfo: {
    fontSize: 14,
    color: COLORS.slate[500]
  },
  errorWrap: {
    paddingHorizontal: 16,
    paddingBottom: 8
  },
  errorText: {
    fontSize: 12,
    color: COLORS.danger,
    fontWeight: '600'
  },
  loading: {
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center'
  },
  empty: {
    padding: 48,
    alignItems: 'center'
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.slate[500]
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
