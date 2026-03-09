import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useEnvironment } from '../context/EnvironmentContext';
import { AnimatedScreen } from '../components/AnimatedScreen';
import { COLORS } from '../constants/theme';

interface EnvironmentScreenProps {
  onBack: () => void;
}

export function EnvironmentScreen({ onBack }: EnvironmentScreenProps) {
  const { baseUrl: rawBaseUrl, availableUrls, setBaseUrl } = useEnvironment();
  const baseUrl = rawBaseUrl ?? '';
  const [customUrl, setCustomUrl] = useState('');

  const handleSelect = async (url: string) => {
    await setBaseUrl(url);
    onBack();
  };

  const handleAddAndSelect = async () => {
    const trimmed = customUrl.trim();
    if (!trimmed) return;
    const normalized = trimmed.replace(/\/$/, '');
    await setBaseUrl(normalized);
    onBack();
  };

  const displayCurrent = (baseUrl || '').replace(/\/api\/mobile\/v1$/, '').replace(/\/$/, '') || '—';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <AnimatedScreen style={styles.animatedWrap}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={COLORS.slate[800]} />
        </TouchableOpacity>
        <Text style={styles.title}>Environment</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.currentCard}>
          <View style={styles.currentCardIcon}>
            <Ionicons name="server-outline" size={24} color={COLORS.primary} />
          </View>
          <View style={styles.currentCardBody}>
            <Text style={styles.currentLabel}>Active API</Text>
            <Text style={styles.currentUrl} numberOfLines={2} selectable>
              {displayCurrent}
            </Text>
          </View>
          <View style={styles.currentBadge}>
            <View style={styles.currentBadgeDot} />
            <Text style={styles.currentBadgeText}>Connected</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Presets</Text>
        <Text style={styles.sectionSubtitle}>Tap to switch backend</Text>
        <View style={styles.presetList}>
          {(availableUrls ?? []).map((url) => {
            const displayUrl = (url ?? '').replace(/\/$/, '');
            const isSelected = baseUrl.startsWith(displayUrl);
            return (
              <TouchableOpacity
                key={url}
                style={[styles.presetCard, isSelected && styles.presetCardSelected]}
                onPress={() => handleSelect(url)}
                activeOpacity={0.7}
              >
                <View style={[styles.presetRadio, isSelected && styles.presetRadioSelected]}>
                  {isSelected ? (
                    <Ionicons name="checkmark" size={16} color={COLORS.white} />
                  ) : null}
                </View>
                <Ionicons
                  name="link"
                  size={18}
                  color={isSelected ? COLORS.primary : COLORS.slate[400]}
                  style={styles.presetIcon}
                />
                <Text style={[styles.presetText, isSelected && styles.presetTextSelected]} numberOfLines={1}>
                  {displayUrl}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Custom URL</Text>
        <Text style={styles.sectionSubtitle}>Enter any API base URL</Text>
        <View style={styles.customCard}>
          <TextInput
            style={styles.input}
            value={customUrl}
            onChangeText={setCustomUrl}
            placeholder="https://api.example.com"
            placeholderTextColor={COLORS.slate[400]}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={[styles.useBtn, !customUrl.trim() && styles.useBtnDisabled]}
            onPress={handleAddAndSelect}
            disabled={!customUrl.trim()}
            activeOpacity={0.8}
          >
            <Text style={styles.useBtnText}>Use this URL</Text>
            <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </ScrollView>
      </AnimatedScreen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.slate[50] },
  animatedWrap: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate[100],
  },
  backBtn: { padding: 4 },
  title: { fontSize: 18, fontWeight: '600', color: COLORS.slate[900] },
  headerRight: { width: 32 },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  currentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },
  currentCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.sky[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  currentCardBody: { flex: 1, minWidth: 0 },
  currentLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.slate[500],
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  currentUrl: { fontSize: 14, fontWeight: '600', color: COLORS.slate[800] },
  currentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.emerald[50],
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  currentBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.emerald[500],
    marginRight: 6,
  },
  currentBadgeText: { fontSize: 11, fontWeight: '600', color: COLORS.emerald[700] },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.slate[800],
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.slate[500],
    marginBottom: 12,
  },
  presetList: { gap: 10, marginBottom: 24 },
  presetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  presetCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.sky[50],
  },
  presetRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.slate[300],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  presetRadioSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  presetIcon: { marginRight: 10 },
  presetText: { flex: 1, fontSize: 14, color: COLORS.slate[700] },
  presetTextSelected: { color: COLORS.slate[900], fontWeight: '600' },
  customCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.slate[200],
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: COLORS.slate[800],
    marginBottom: 12,
  },
  useBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    gap: 8,
  },
  useBtnDisabled: { backgroundColor: COLORS.slate[300] },
  useBtnText: { fontSize: 15, fontWeight: '600', color: COLORS.white },
});
