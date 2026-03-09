import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedScreen } from '../components/AnimatedScreen';
import { COLORS } from '../constants/theme';
import { getAssetById, ApiAsset } from '../api/assetsApi';

function parseAssetIdFromQrData(data: string): string {
  const trimmed = (data || '').trim();
  if (!trimmed) return '';
  const urlMatch = trimmed.match(/\/(?:assets?\/)?([^/?\s]+)(?:\?|$)/i);
  if (urlMatch) return urlMatch[1];
  return trimmed;
}

interface ScanScreenProps {
  onBack: () => void;
  onAssetScanned: (asset: { id: string; name: string }) => void;
}

export function ScanScreen({ onBack, onAssetScanned }: ScanScreenProps) {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [scanning, setScanning] = useState(true);
  const [lookingUp, setLookingUp] = useState(false);
  const lastScannedRef = useRef<string | null>(null);
  const scanCooldownRef = useRef(false);

  const handleBarCodeScanned = useCallback(
    async ({ data }: { type: string; data: string }) => {
      if (scanCooldownRef.current || lookingUp) return;
      const assetId = parseAssetIdFromQrData(data);
      if (!assetId) return;
      if (lastScannedRef.current === assetId) return;
      lastScannedRef.current = assetId;
      scanCooldownRef.current = true;
      setTimeout(() => {
        lastScannedRef.current = null;
        scanCooldownRef.current = false;
      }, 2000);

      setScanning(false);
      setLookingUp(true);
      try {
        const res = await getAssetById(assetId);
        setLookingUp(false);
        if ((res as { success?: boolean }).success === false) {
          const msg = (res as { message?: string }).message || 'Asset not found';
          Alert.alert('Asset Not Found', msg, [{ text: 'OK', onPress: () => setScanning(true) }]);
          return;
        }
        const asset = res as unknown as ApiAsset;
        if (!asset?.asset_id) {
          Alert.alert('Asset Not Found', 'The scanned code did not match a valid asset.', [
            { text: 'OK', onPress: () => setScanning(true) },
          ]);
          return;
        }
        onAssetScanned({ id: asset.asset_id, name: asset.name || asset.asset_id });
      } catch {
        setLookingUp(false);
        Alert.alert('Error', 'Could not look up asset. Please try again.', [
          { text: 'OK', onPress: () => setScanning(true) },
        ]);
      }
    },
    [lookingUp, onAssetScanned]
  );

  if (!permission) {
    return (
      <AnimatedScreen style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={12}>
            <Ionicons name="chevron-back" size={24} color={COLORS.slate[600]} />
          </TouchableOpacity>
          <Text style={styles.title}>Scan Asset QR</Text>
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.message}>Checking camera access...</Text>
        </View>
      </AnimatedScreen>
    );
  }

  if (!permission.granted) {
    return (
      <AnimatedScreen style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={12}>
            <Ionicons name="chevron-back" size={24} color={COLORS.slate[600]} />
          </TouchableOpacity>
          <Text style={styles.title}>Scan Asset QR</Text>
        </View>
        <View style={styles.centered}>
          <Text style={styles.message}>Camera permission is required to scan QR codes.</Text>
          <TouchableOpacity style={styles.permBtn} onPress={requestPermission} activeOpacity={0.8}>
            <Text style={styles.permBtnText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </AnimatedScreen>
    );
  }

  return (
    <AnimatedScreen style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        ratio="4:3"
        barCodeScannerSettings={{ barCodeTypes: ['qr'] }}
        onBarCodeScanned={scanning && !lookingUp ? handleBarCodeScanned : undefined}
      />
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={[styles.title, styles.titleLight]}>Scan Asset QR</Text>
      </View>
      <View style={styles.overlay}>
        <View style={styles.frame} />
        <Text style={styles.hint}>Align the asset QR code within the frame</Text>
      </View>
      <View style={[styles.noteWrap, { paddingBottom: insets.bottom + 12 }]}>
        <Text style={styles.noteText}>
          This QR code identifies a medical device or ambulance. Scanning it looks up the asset so you can report a breakdown or view its details.
        </Text>
      </View>
      {lookingUp && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.white} />
          <Text style={styles.loadingText}>Looking up asset...</Text>
        </View>
      )}
    </AnimatedScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.slate[900] },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 12,
  },
  backBtn: { marginRight: 8, padding: 4 },
  title: { fontSize: 18, fontWeight: '600', color: COLORS.slate[800] },
  titleLight: { color: COLORS.white },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  message: { fontSize: 14, color: COLORS.slate[600], textAlign: 'center', marginTop: 12 },
  permBtn: {
    marginTop: 20,
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
  },
  permBtnText: { color: COLORS.white, fontWeight: '600', fontSize: 15 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frame: {
    width: 240,
    height: 240,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
    borderRadius: 16,
  },
  hint: {
    marginTop: 24,
    fontSize: 14,
    color: COLORS.slate[300],
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  noteWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  noteText: {
    fontSize: 12,
    color: COLORS.slate[300],
    textAlign: 'center',
    lineHeight: 18,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: { marginTop: 12, fontSize: 14, color: COLORS.white },
});
