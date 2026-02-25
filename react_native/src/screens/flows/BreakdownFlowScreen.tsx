import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { Stepper, Card, StatusBadge } from '../../components/Shared';
import { COLORS } from '../../constants/theme';

interface AssetOption {
  id: string;
  name: string;
}

interface BreakdownFlowScreenProps {
  onComplete: () => void;
  onCancel: () => void;
  initialAsset?: AssetOption | null;
}

const STEPS = ['Select Asset', 'Problem', 'Location', 'Review'];

const ASSET_OPTIONS: AssetOption[] = [
  { id: 'DF-002', name: 'Phillips Defibrillator X3' },
  { id: 'VS-441', name: 'Mindray Vital Signs Monitor' },
  { id: 'VT-992', name: 'GE Ventilator Carescape' },
  { id: 'OT-105', name: 'Operating Table Steris' },
  { id: 'IF-202', name: 'Infusion Pump Alaris' }
];

const HOSPITAL_LOCATIONS = [
  'Ward 4B (Current)',
  'Emergency Dept',
  'ICU - Level 1',
  'ICU - Level 2',
  'Operating Theater 1',
  'Operating Theater 2',
  'Radiology Unit',
  'Maternity Ward',
  'Pediatric Clinic',
  'Oncology Dept',
  'Outpatient Pharmacy',
  'Central Lab'
];

export function BreakdownFlowScreen({ onComplete, onCancel, initialAsset }: BreakdownFlowScreenProps) {
  const [step, setStep] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<AssetOption | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [location, setLocation] = useState('Ward 4B (Current)');
  const [priority, setPriority] = useState<'Normal' | 'Urgent' | 'Critical'>('Normal');

  useEffect(() => {
    if (initialAsset) {
      setSelectedAsset(initialAsset);
      setStep(1);
    }
  }, [initialAsset]);

  const filteredAssets = ASSET_OPTIONS.filter(
    (a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLocations = HOSPITAL_LOCATIONS.filter((loc) =>
    loc.toLowerCase().includes(locationSearchQuery.toLowerCase())
  );

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      setIsSubmitted(true);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      if (step === 1 && initialAsset) {
        onCancel();
      } else {
        setStep(step - 1);
      }
    } else {
      onCancel();
    }
  };

  const priorityStatus = priority === 'Critical' ? 'Rejected' : priority === 'Urgent' ? 'In Progress' : 'Pending';

  if (isSubmitted) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark-circle" size={48} color={COLORS.emerald[600]} />
        </View>
        <Text style={styles.successTitle}>Request Submitted!</Text>
        <Text style={styles.successDesc}>
          Your breakdown report for <Text style={styles.successBold}>{selectedAsset?.name}</Text> has been logged. A
          technician will be notified immediately.
        </Text>
        <View style={styles.refBox}>
          <Text style={styles.refLabel}>Reference Number</Text>
          <Text style={styles.refValue}>REQ-{Math.floor(Math.random() * 9000) + 1000}</Text>
        </View>
        <TouchableOpacity style={styles.doneButton} onPress={onComplete} activeOpacity={0.8}>
          <Text style={styles.doneButtonText}>Return to Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Report Breakdown" showBack onBack={handleBack} />
      <Stepper steps={STEPS} current={step} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {step === 0 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Which device is broken?</Text>
            <View style={styles.searchWrap}>
              <Ionicons name="search" size={20} color={COLORS.slate[400]} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by ID or Name..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            {filteredAssets.length > 0 ? (
              filteredAssets.map((asset) => (
                <TouchableOpacity
                  key={asset.id}
                  style={[
                    styles.assetOption,
                    selectedAsset?.id === asset.id && styles.assetOptionSelected
                  ]}
                  onPress={() => setSelectedAsset(asset)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.radio, selectedAsset?.id === asset.id && styles.radioSelected]}>
                    {selectedAsset?.id === asset.id && <View style={styles.radioInner} />}
                  </View>
                  <View style={styles.assetOptionText}>
                    <Text style={styles.assetOptionName}>{asset.name}</Text>
                    <Text style={styles.assetOptionId}>ID: {asset.id}</Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyText}>No assets found matching your search.</Text>
            )}
            <TouchableOpacity style={styles.scanButton} activeOpacity={0.8}>
              <Ionicons name="qr-code-outline" size={40} color={COLORS.slate[400]} />
              <Text style={styles.scanButtonText}>Scan QR Code</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 1 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Describe the problem</Text>
            <View style={styles.assetChip}>
              <Ionicons name="document-text-outline" size={16} color={COLORS.primary} />
              <Text style={styles.assetChipText}>
                {selectedAsset?.name} ({selectedAsset?.id})
              </Text>
            </View>
            <TextInput
              style={styles.textArea}
              value={problemDescription}
              onChangeText={setProblemDescription}
              placeholder="Provide a brief description of the issue (e.g., 'Device fails to power on', 'Error code E-102 displayed')..."
              placeholderTextColor={COLORS.slate[400]}
              multiline
              numberOfLines={5}
            />
            <Text style={styles.optionalLabel}>Attach Photos (Optional)</Text>
            <TouchableOpacity style={styles.addPhotoButton} activeOpacity={0.8}>
              <Ionicons name="add" size={24} color={COLORS.slate[400]} />
              <Text style={styles.addPhotoText}>Add Photo</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Where is the asset?</Text>
            <View style={styles.searchWrap}>
              <Ionicons name="search" size={20} color={COLORS.slate[400]} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search location (e.g. Ward, OT, ICU)..."
                value={locationSearchQuery}
                onChangeText={setLocationSearchQuery}
              />
            </View>
            <ScrollView style={styles.locationList} nestedScrollEnabled showsVerticalScrollIndicator={false}>
              {filteredLocations.map((loc) => (
                <TouchableOpacity
                  key={loc}
                  style={[styles.locationOption, location === loc && styles.locationOptionSelected]}
                  onPress={() => setLocation(loc)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.locationText, location === loc && styles.locationTextSelected]}>{loc}</Text>
                  {location === loc && <Ionicons name="checkmark" size={18} color={COLORS.primary} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={styles.priorityLabel}>Priority Level</Text>
            <View style={styles.priorityRow}>
              {(['Normal', 'Urgent', 'Critical'] as const).map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.priorityOption,
                    priority === p && styles.priorityOptionNormal,
                    priority === p && p === 'Urgent' && styles.priorityOptionUrgent,
                    priority === p && p === 'Critical' && styles.priorityOptionCritical
                  ]}
                  onPress={() => setPriority(p)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.priorityText,
                      priority === p && p === 'Normal' && styles.priorityTextActive,
                      priority === p && p === 'Urgent' && { color: COLORS.amber[600] },
                      priority === p && p === 'Critical' && { color: COLORS.danger }
                    ]}
                  >
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {step === 3 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Request Summary</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <Text style={styles.summaryLabel}>Selected Asset</Text>
                <StatusBadge status={priorityStatus as 'Pending' | 'In Progress' | 'Rejected'} />
              </View>
              <Text style={styles.summaryAssetName}>{selectedAsset?.name || 'No Asset Selected'}</Text>
              <Text style={styles.summaryAssetId}>ID: {selectedAsset?.id}</Text>
              <View style={styles.summaryRow}>
                <View>
                  <Text style={styles.summaryMetaLabel}>Location</Text>
                  <Text style={styles.summaryMetaValue}>{location}</Text>
                </View>
                <View>
                  <Text style={styles.summaryMetaLabel}>Priority</Text>
                  <Text
                    style={[
                      styles.summaryMetaValue,
                      priority === 'Critical' && { color: COLORS.danger },
                      priority === 'Urgent' && { color: COLORS.amber[600] },
                      priority === 'Normal' && { color: COLORS.primary }
                    ]}
                  >
                    {priority}
                  </Text>
                </View>
              </View>
              <View>
                <Text style={styles.summaryMetaLabel}>Problem Description</Text>
                <Text style={styles.summaryDesc}>{problemDescription || 'No description provided.'}</Text>
              </View>
            </View>
            <View style={styles.tipBox}>
              <Ionicons name="warning-outline" size={20} color={COLORS.amber[600]} />
              <Text style={styles.tipText}>
                Heads up! Average response time for {location} is 15 minutes. A biomedical technician will be notified
                once you submit.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextButton, step === 0 && !selectedAsset && styles.nextButtonDisabled]}
          onPress={handleNext}
          activeOpacity={0.8}
          disabled={step === 0 && !selectedAsset}
        >
          <Text style={[styles.nextButtonText, step === 0 && !selectedAsset && styles.nextButtonTextDisabled]}>
            {step === STEPS.length - 1 ? 'Submit Request' : 'Continue'}
          </Text>
          <Ionicons name="chevron-forward" size={18} color={step === 0 && !selectedAsset ? COLORS.slate[400] : COLORS.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.slate[50] },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 24 },
  stepContent: { gap: 16 },
  stepTitle: { fontSize: 18, fontWeight: '700', color: COLORS.slate[900] },
  searchWrap: { position: 'relative' },
  searchIcon: { position: 'absolute', left: 12, top: 14, zIndex: 1 },
  searchInput: {
    paddingLeft: 40,
    paddingRight: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.slate[200],
    borderRadius: 16,
    fontSize: 14
  },
  assetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.slate[100]
  },
  assetOptionSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.sky[50] },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.slate[300],
    alignItems: 'center',
    justifyContent: 'center'
  },
  radioSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primary },
  radioInner: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.white },
  assetOptionText: { flex: 1 },
  assetOptionName: { fontSize: 14, fontWeight: '700', color: COLORS.slate[800] },
  assetOptionId: { fontSize: 10, color: COLORS.slate[400], textTransform: 'uppercase', marginTop: 2 },
  emptyText: { textAlign: 'center', paddingVertical: 32, color: COLORS.slate[400], fontSize: 14, fontStyle: 'italic' },
  scanButton: {
    padding: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.slate[300],
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)'
  },
  scanButtonText: { fontSize: 12, fontWeight: '700', color: COLORS.slate[400], textTransform: 'uppercase', marginTop: 8 },
  assetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: COLORS.sky[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.sky[100]
  },
  assetChipText: { fontSize: 12, fontWeight: '700', color: COLORS.sky[800], flex: 1 },
  textArea: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.slate[200],
    borderRadius: 16,
    fontSize: 14,
    minHeight: 120,
    textAlignVertical: 'top'
  },
  optionalLabel: { fontSize: 10, fontWeight: '700', color: COLORS.slate[500], textTransform: 'uppercase', marginTop: 8 },
  addPhotoButton: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.slate[300],
    backgroundColor: COLORS.slate[100],
    alignItems: 'center',
    justifyContent: 'center'
  },
  addPhotoText: { fontSize: 10, fontWeight: '700', color: COLORS.slate[400], marginTop: 4 },
  locationList: { maxHeight: 220 },
  locationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.slate[100],
    marginBottom: 8
  },
  locationOptionSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.sky[50] },
  locationText: { fontSize: 14, fontWeight: '700', color: COLORS.slate[500], flex: 1 },
  locationTextSelected: { color: COLORS.primary },
  priorityLabel: { fontSize: 10, fontWeight: '700', color: COLORS.slate[500], textTransform: 'uppercase', marginTop: 8 },
  priorityRow: { flexDirection: 'row', gap: 12 },
  priorityOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.slate[100],
    alignItems: 'center'
  },
  priorityOptionNormal: { borderColor: COLORS.primary, backgroundColor: COLORS.sky[50] },
  priorityOptionUrgent: { borderColor: COLORS.amber[500], backgroundColor: COLORS.amber[50] },
  priorityOptionCritical: { borderColor: COLORS.danger, backgroundColor: '#fef2f2' },
  priorityText: { fontSize: 12, fontWeight: '700', color: COLORS.slate[400] },
  priorityTextActive: { color: COLORS.primary },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.slate[200],
    overflow: 'hidden'
  },
  summaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: COLORS.slate[50], borderBottomWidth: 1, borderBottomColor: COLORS.slate[100] },
  summaryLabel: { fontSize: 10, fontWeight: '700', color: COLORS.slate[400], textTransform: 'uppercase' },
  summaryAssetName: { fontSize: 18, fontWeight: '800', color: COLORS.slate[900], padding: 16, paddingBottom: 4 },
  summaryAssetId: { fontSize: 12, color: COLORS.slate[500], paddingHorizontal: 16 },
  summaryRow: { flexDirection: 'row', gap: 24, padding: 16 },
  summaryMetaLabel: { fontSize: 10, color: COLORS.slate[400], fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  summaryMetaValue: { fontSize: 14, fontWeight: '700', color: COLORS.slate[800] },
  summaryDesc: { fontSize: 12, color: COLORS.slate[700], fontStyle: 'italic', backgroundColor: COLORS.slate[50], padding: 12, borderRadius: 12, marginTop: 8 },
  tipBox: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: COLORS.amber[50],
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.amber[100]
  },
  tipText: { flex: 1, fontSize: 10, color: COLORS.amber[800], lineHeight: 16 },
  footer: { padding: 16, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.slate[200] },
  nextButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 16 },
  nextButtonDisabled: { backgroundColor: COLORS.slate[200] },
  nextButtonText: { fontSize: 16, fontWeight: '700', color: COLORS.white },
  nextButtonTextDisabled: { color: COLORS.slate[400] },
  successContainer: { flex: 1, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', padding: 32 },
  successIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.emerald[100], alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  successTitle: { fontSize: 24, fontWeight: '800', color: COLORS.slate[900], marginBottom: 8 },
  successDesc: { fontSize: 14, color: COLORS.slate[500], textAlign: 'center', marginBottom: 32 },
  successBold: { fontWeight: '700', color: COLORS.slate[800] },
  refBox: { width: '100%', padding: 16, backgroundColor: COLORS.emerald[50], borderRadius: 16, borderWidth: 1, borderColor: COLORS.emerald[100], marginBottom: 32 },
  refLabel: { fontSize: 10, fontWeight: '700', color: COLORS.emerald[600], textTransform: 'uppercase', marginBottom: 4 },
  refValue: { fontSize: 20, fontWeight: '800', color: COLORS.slate[900] },
  doneButton: { width: '100%', backgroundColor: COLORS.slate[900], paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  doneButtonText: { fontSize: 16, fontWeight: '700', color: COLORS.white }
});
