import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { Card, StatusBadge } from '../components/Shared';
import { COLORS } from '../constants/theme';
import { submitRemovalRequest } from '../api/removalApi';
import { getAssets } from '../api/assetsApi';
import { getLocations, type LocationItem } from '../api/locationApi';
import { useAuth } from '../context/AuthContext';

const REASON_OPTIONS = [
  'Requires specialized tools',
  'Major component replacement',
  'Laboratory calibration needed',
  'Environmental contamination',
  'End of life disposal',
];

function formatLocationLabel(loc: LocationItem): string {
  const parts: string[] = [];
  parts.push(`Name: ${loc.name}`);
  if (loc.code) parts.push(`Code: ${loc.code}`);
  if (loc.type) parts.push(`Type: ${loc.type}`);
  const parentDisplay = loc.parent_code ?? loc.parent_name;
  parts.push(parentDisplay ? `Parent: ${parentDisplay}` : 'Parent: This location is the parent');
  return parts.join(' \u2022 ');
}

function formatLocationParent(loc: LocationItem): string {
  return loc.parent_code ?? loc.parent_name ?? 'This location is the parent';
}

interface RemovalFlowScreenProps {
  onComplete: () => void;
  onCancel: () => void;
  initialAsset?: { id: string; name: string } | null;
}

export function RemovalFlowScreen({ onComplete, onCancel, initialAsset }: RemovalFlowScreenProps) {
  const { user } = useAuth();
  const [assets, setAssets] = useState<{ asset_id: string; name: string }[]>([]);
  const [assetsLoading, setAssetsLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState<{ id: string; name: string } | null>(initialAsset ?? null);
  const [reason, setReason] = useState<string | null>(null);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [selectedDestination, setSelectedDestination] = useState<LocationItem | null>(null);
  const [isSigned, setIsSigned] = useState(false);
  const [showReasonPicker, setShowReasonPicker] = useState(false);
  const [showAssetPicker, setShowAssetPicker] = useState(false);
  const [showDestinationPicker, setShowDestinationPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const fetchAssets = useCallback(async () => {
    setAssetsLoading(true);
    try {
      const r = await getAssets({ limit: 200 });
      const list = (r as { assets?: { asset_id: string; name: string }[] }).assets ?? [];
      setAssets(list);
      if (!selectedAsset && list.length > 0 && initialAsset) {
        const match = list.find((a) => a.asset_id === initialAsset.id);
        if (match) setSelectedAsset({ id: match.asset_id, name: match.name });
      }
    } catch {
      setAssets([]);
    } finally {
      setAssetsLoading(false);
    }
  }, [initialAsset, selectedAsset]);

  const fetchLocations = useCallback(async () => {
    setLocationsLoading(true);
    try {
      const r = await getLocations({ limit: 200 });
      setLocations(r.data ?? []);
    } catch {
      setLocations([]);
    } finally {
      setLocationsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialAsset) setSelectedAsset(initialAsset);
    fetchAssets();
  }, [fetchAssets, initialAsset]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const assetDisplay = selectedAsset ? `${selectedAsset.name} (${selectedAsset.id})` : 'Select asset';
  const signedByName = user?.full_name || user?.username || 'Signed';

  const handleSubmit = async () => {
    if (!isSigned || !selectedAsset || !selectedDestination || !reason) return;
    setError('');
    setSubmitting(true);
    const res = await submitRemovalRequest({
      asset_id: selectedAsset.id,
      reason: reason ?? '',
      destination_location_id: selectedDestination?.location_id ?? undefined,
    });
    setSubmitting(false);
    if (res.success) {
      setSubmitted(true);
    } else {
      setError(res.message ?? 'Failed to submit');
    }
  };

  if (submitted) {
    return (
      <View style={styles.container}>
        <Header title="Asset Removal" showBack onBack={onCancel} />
        <View style={styles.successWrap}>
          <View style={styles.successIconWrap}>
            <Ionicons name="checkmark-circle" size={64} color={COLORS.emerald[500]} />
          </View>
          <Text style={styles.successTitle}>Removal request submitted</Text>
          <Text style={styles.successSub}>
            {selectedAsset?.name} has been sent to {selectedDestination?.name ?? selectedDestination?.code ?? 'destination'}.
          </Text>
          <TouchableOpacity style={styles.successBtn} onPress={onComplete} activeOpacity={0.8}>
            <Text style={styles.successBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Asset Removal" showBack onBack={onCancel} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.cardRow}>
          <View style={styles.iconWrap}>
            <Ionicons name="car-outline" size={32} color={COLORS.amber[600]} />
          </View>
          <View style={styles.cardRight}>
            <Text style={styles.cardTitle}>Request Removal</Text>
            <Text style={styles.cardAsset}>{selectedAsset ? `${selectedAsset.name} (${selectedAsset.id})` : 'Select asset below'}</Text>
          </View>
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.label}>What asset to be removed</Text>
          <TouchableOpacity style={styles.selectBtn} onPress={() => setShowAssetPicker(true)}>
            <Text style={[styles.selectBtnText, !selectedAsset && styles.selectBtnPlaceholder]}>{assetDisplay}</Text>
            <Ionicons name="chevron-down" size={18} color={COLORS.slate[500]} />
          </TouchableOpacity>
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.label}>Reason for Removal</Text>
          <TouchableOpacity style={styles.selectBtn} onPress={() => setShowReasonPicker(true)}>
            <Text style={[styles.selectBtnText, !reason && styles.selectBtnPlaceholder]}>{reason ?? 'Select reason'}</Text>
            <Ionicons name="chevron-down" size={18} color={COLORS.slate[500]} />
          </TouchableOpacity>
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.label}>Destination Lab / Workshop</Text>
          <TouchableOpacity style={styles.selectBtn} onPress={() => setShowDestinationPicker(true)}>
            <Text style={[styles.selectBtnText, !selectedDestination && styles.selectBtnPlaceholder]}>
              {selectedDestination ? formatLocationLabel(selectedDestination) : 'Select destination'}
            </Text>
            <Ionicons name="chevron-down" size={18} color={COLORS.slate[500]} />
          </TouchableOpacity>
        </View>

        <View style={styles.signCardWrap}>
          <Card style={styles.signCard}>
            <View style={styles.signHeader}>
              <Text style={styles.label}>Authorizing Officer</Text>
              {isSigned && <StatusBadge status="Completed" />}
            </View>
            <TouchableOpacity
              style={[styles.signZone, isSigned && styles.signZoneSigned]}
              onPress={() => setIsSigned(true)}
              activeOpacity={0.8}
            >
              {isSigned ? (
                <View style={styles.signedContent}>
                  <View style={styles.signedLine} />
                  <Text style={styles.signedLabel}>Signed: {signedByName}</Text>
                </View>
              ) : (
                <View style={styles.signPlaceholder}>
                  <Ionicons name="person-outline" size={24} color={COLORS.slate[300]} />
                  <Text style={styles.signPlaceholderText}>Tap to Authorize</Text>
                </View>
              )}
            </TouchableOpacity>
          </Card>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitBtn, (!isSigned || !selectedAsset || !selectedDestination || !reason || submitting) && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!isSigned || !selectedAsset || !selectedDestination || !reason || submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <>
              <Ionicons name="car-outline" size={20} color={COLORS.white} />
              <Text style={styles.submitBtnText}>Mark as Sent to Office</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <Modal visible={showReasonPicker} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowReasonPicker(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reason for Removal</Text>
            {REASON_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={styles.modalOption}
                onPress={() => {
                  setReason(opt);
                  setShowReasonPicker(false);
                }}
              >
                <Text style={styles.modalOptionText}>{opt}</Text>
                {reason === opt ? <Ionicons name="checkmark" size={20} color={COLORS.primary} /> : null}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      <Modal visible={showAssetPicker} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowAssetPicker(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation?.()}>
            <Text style={styles.modalTitle}>Select Asset</Text>
            {assetsLoading ? (
              <ActivityIndicator size="large" color={COLORS.primary} style={styles.modalLoader} />
            ) : assets.length === 0 ? (
              <Text style={styles.modalEmpty}>No assets found</Text>
            ) : (
              <ScrollView style={styles.assetListScroll} keyboardShouldPersistTaps="handled">
                {assets.map((a) => (
                  <TouchableOpacity
                    key={a.asset_id}
                    style={styles.modalOption}
                    onPress={() => {
                      setSelectedAsset({ id: a.asset_id, name: a.name });
                      setShowAssetPicker(false);
                    }}
                  >
                    <Text style={styles.modalOptionText}>{a.name}</Text>
                    <Text style={styles.modalOptionSub}>{a.asset_id}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={showDestinationPicker} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowDestinationPicker(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation?.()}>
            <Text style={styles.modalTitle}>Destination Lab / Workshop</Text>
            {locationsLoading ? (
              <ActivityIndicator size="large" color={COLORS.primary} style={styles.modalLoader} />
            ) : locations.length === 0 ? (
              <Text style={styles.modalEmpty}>No locations found</Text>
            ) : (
              <ScrollView style={styles.assetListScroll} keyboardShouldPersistTaps="handled">
                {locations.map((loc) => (
                  <TouchableOpacity
                    key={loc.location_id}
                    style={styles.modalOption}
                    onPress={() => {
                      setSelectedDestination(loc);
                      setShowDestinationPicker(false);
                    }}
                  >
                    <Text style={styles.modalOptionText}>Name: {loc.name}</Text>
                    <Text style={styles.modalOptionSub}>
                      {[loc.code && `Code: ${loc.code}`, loc.type && `Type: ${loc.type}`].filter(Boolean).join('  ') || loc.location_id}
                    </Text>
                    <Text style={styles.modalOptionSub}>
                      Parent: {formatLocationParent(loc)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.slate[50] },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 24 },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.slate[200],
  },
  iconWrap: { width: 56, height: 56, borderRadius: 16, backgroundColor: COLORS.amber[50], alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  cardRight: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: COLORS.slate[900], marginBottom: 4 },
  cardAsset: { fontSize: 12, color: COLORS.slate[500] },
  fieldBlock: { marginBottom: 24 },
  label: { fontSize: 10, fontWeight: '800', color: COLORS.slate[400], textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginLeft: 4 },
  selectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.slate[200],
  },
  selectBtnText: { fontSize: 14, fontWeight: '700', color: COLORS.slate[800] },
  selectBtnPlaceholder: { color: COLORS.slate[400] },
  signCardWrap: { marginBottom: 16 },
  signCard: { padding: 24 },
  signHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  signZone: {
    height: 160,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.slate[200],
    backgroundColor: COLORS.slate[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  signZoneSigned: { borderColor: COLORS.emerald[200], backgroundColor: 'rgba(209, 250, 229, 0.3)' },
  signPlaceholder: { alignItems: 'center', gap: 8 },
  signPlaceholderText: { fontSize: 10, fontWeight: '700', color: COLORS.slate[300], textTransform: 'uppercase', letterSpacing: 1 },
  signedContent: { alignItems: 'center' },
  signedLine: { width: 120, height: 24, backgroundColor: COLORS.slate[300], opacity: 0.5, borderRadius: 2, marginBottom: 8 },
  signedLabel: { fontSize: 8, fontWeight: '700', color: COLORS.slate[400], textTransform: 'uppercase' },
  errorText: { fontSize: 12, color: COLORS.danger, marginTop: 8, textAlign: 'center' },
  footer: { padding: 16, paddingBottom: 24, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.slate[200] },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.sky[600],
    paddingVertical: 16,
    borderRadius: 16,
  },
  submitBtnDisabled: { backgroundColor: COLORS.slate[200] },
  submitBtnText: { fontSize: 16, fontWeight: '700', color: COLORS.white },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 24 },
  modalContent: { backgroundColor: COLORS.white, borderRadius: 20, padding: 20, maxHeight: '80%' },
  assetListScroll: { maxHeight: 320 },
  modalTitle: { fontSize: 14, fontWeight: '800', color: COLORS.slate[700], marginBottom: 16 },
  modalOption: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.slate[100] },
  modalOptionText: { fontSize: 14, fontWeight: '600', color: COLORS.slate[800] },
  modalOptionSub: { fontSize: 11, color: COLORS.slate[500], marginTop: 2 },
  modalEmpty: { fontSize: 14, color: COLORS.slate[500], paddingVertical: 16 },
  modalLoader: { marginVertical: 24 },
  successWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  successIconWrap: { marginBottom: 20 },
  successTitle: { fontSize: 20, fontWeight: '700', color: COLORS.slate[900], marginBottom: 8, textAlign: 'center' },
  successSub: { fontSize: 14, color: COLORS.slate[600], textAlign: 'center', marginBottom: 32 },
  successBtn: { backgroundColor: COLORS.sky[600], paddingVertical: 14, paddingHorizontal: 32, borderRadius: 12 },
  successBtnText: { fontSize: 16, fontWeight: '700', color: COLORS.white },
});
