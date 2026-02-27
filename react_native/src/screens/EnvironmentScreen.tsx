import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useEnvironment } from '../context/EnvironmentContext';
import { COLORS } from '../constants/theme';

interface EnvironmentScreenProps {
  onBack: () => void;
}

export function EnvironmentScreen({ onBack }: EnvironmentScreenProps) {
  const { baseUrl, availableUrls, setBaseUrl } = useEnvironment();
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

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.slate[600]} />
        </TouchableOpacity>
        <Text style={styles.title}>Environment</Text>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.sectionLabel}>Backend URL</Text>
        <Text style={styles.currentLabel}>Current: {baseUrl.replace(/\/api\/mobile\/v1$/, '')}</Text>
        <Text style={styles.sectionLabel}>Select URL</Text>
        {availableUrls.map((url) => {
          const displayUrl = url.replace(/\/$/, '');
          const isSelected = baseUrl.startsWith(displayUrl);
          return (
            <TouchableOpacity
              key={url}
              style={[styles.urlRow, isSelected && styles.urlRowSelected]}
              onPress={() => handleSelect(url)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                size={22}
                color={isSelected ? COLORS.primary : COLORS.slate[400]}
              />
              <Text style={[styles.urlText, isSelected && styles.urlTextSelected]} numberOfLines={1}>
                {displayUrl}
              </Text>
            </TouchableOpacity>
          );
        })}
        <Text style={styles.sectionLabel}>Custom URL</Text>
        <View style={styles.customRow}>
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
            style={[styles.addBtn, !customUrl.trim() && styles.addBtnDisabled]}
            onPress={handleAddAndSelect}
            disabled={!customUrl.trim()}
          >
            <Text style={styles.addBtnText}>Use</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate[200],
  },
  backBtn: { marginRight: 12 },
  title: { fontSize: 18, fontWeight: '600', color: COLORS.slate[800] },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.slate[500],
    marginTop: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  currentLabel: { fontSize: 13, color: COLORS.slate[600], marginBottom: 8 },
  urlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: COLORS.slate[50],
    borderRadius: 8,
    marginBottom: 8,
  },
  urlRowSelected: { backgroundColor: COLORS.sky[50] },
  urlText: { flex: 1, marginLeft: 12, fontSize: 14, color: COLORS.slate[700] },
  urlTextSelected: { color: COLORS.slate[800], fontWeight: '500' },
  customRow: { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.slate[200],
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: COLORS.slate[800],
  },
  addBtn: {
    paddingHorizontal: 20,
    height: 44,
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  addBtnDisabled: { backgroundColor: COLORS.slate[300] },
  addBtnText: { color: COLORS.white, fontWeight: '600', fontSize: 14 },
});
