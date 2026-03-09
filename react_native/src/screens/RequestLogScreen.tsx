import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Pressable,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRequestLog } from '../context/RequestLogContext';
import { COLORS } from '../constants/theme';
import type { RequestLogEntry } from '../store/requestLogStore';

function formatTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function methodColor(method: string): string {
  const m = (method || '').toUpperCase();
  if (m === 'GET') return COLORS.emerald[600];
  if (m === 'POST') return COLORS.sky[600];
  if (m === 'PUT' || m === 'PATCH') return COLORS.amber[600];
  if (m === 'DELETE') return COLORS.danger;
  return COLORS.slate[600];
}

function LogCard({ entry, onPress }: { entry: RequestLogEntry; onPress: () => void }) {
  const statusColor = entry.error
    ? COLORS.danger
    : entry.status && entry.status >= 400
      ? COLORS.amber[600]
      : COLORS.emerald[500];
  const methodBg = methodColor(entry.method);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardTop}>
        <View style={[styles.methodBadge, { backgroundColor: methodBg }]}>
          <Text style={styles.methodText}>{entry.method}</Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: statusColor }]}>
          <Text style={styles.statusPillText}>
            {entry.status != null ? entry.status : 'err'}
          </Text>
        </View>
      </View>
      <Text style={styles.cardUrl} numberOfLines={2} selectable>
        {entry.url || `${entry.method} ${entry.path}`}
      </Text>
      <View style={styles.cardMeta}>
        <Ionicons name="time-outline" size={12} color={COLORS.slate[400]} />
        <Text style={styles.cardTime}>{formatTime(entry.timestamp)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.92;
const MODAL_HEADER_HEIGHT = 60;
const MODAL_URL_BAR_HEIGHT = 72;
const RESPONSE_SECTION_HEIGHT = Math.max(280, MODAL_HEIGHT - MODAL_HEADER_HEIGHT - MODAL_URL_BAR_HEIGHT - 36);

export function RequestLogScreen() {
  const { logs, setShowScreen } = useRequestLog();
  const [selected, setSelected] = useState<RequestLogEntry | null>(null);

  const renderItem = ({ item }: { item: RequestLogEntry }) => (
    <LogCard entry={item} onPress={() => setSelected(item)} />
  );

  const responseBody = selected
    ? selected.response ?? (selected.error ? { error: selected.error } : {})
    : null;
  const responseStr = responseBody != null ? JSON.stringify(responseBody, null, 2) : '';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="list" size={22} color={COLORS.slate[700]} />
          <Text style={styles.title}>Request Log</Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowScreen(false)}
          style={styles.closeBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="close" size={26} color={COLORS.slate[600]} />
        </TouchableOpacity>
      </View>

      {logs.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="cloud-offline-outline" size={48} color={COLORS.slate[300]} />
          </View>
          <Text style={styles.emptyTitle}>No requests yet</Text>
          <Text style={styles.emptySub}>API calls will appear here. Double-tap with two fingers anywhere to open this screen.</Text>
        </View>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={<Text style={styles.listHint}>Tap a card to view response</Text>}
        />
      )}

      <Modal
        visible={!!selected}
        transparent
        animationType="fade"
        onRequestClose={() => setSelected(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setSelected(null)}>
          <Pressable
            style={[styles.modalContent, { height: MODAL_HEIGHT, maxHeight: MODAL_HEIGHT }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={1}>
                {selected?.method} {selected?.url || selected?.path}
              </Text>
              <TouchableOpacity onPress={() => setSelected(null)} style={styles.modalCloseBtn} hitSlop={12}>
                <Ionicons name="close" size={24} color={COLORS.slate[600]} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalUrlBar}>
              <Text style={styles.modalUrlLabel}>URL</Text>
              <Text style={styles.modalUrlText} numberOfLines={2} selectable>
                {selected?.url ?? ''}
              </Text>
            </View>
            <View style={[styles.modalResponseBar, { height: RESPONSE_SECTION_HEIGHT }]}>
              <Text style={styles.modalResponseLabel}>Response</Text>
              <ScrollView
                style={styles.responseScroll}
                contentContainerStyle={styles.responseScrollContent}
                showsVerticalScrollIndicator
                nestedScrollEnabled
              >
                <Text style={styles.responseText} selectable>
                  {responseStr}
                </Text>
              </ScrollView>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const cardShadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  android: { elevation: 3 },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.slate[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate[200],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.slate[900],
  },
  closeBtn: {
    padding: 4,
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  listHint: {
    fontSize: 12,
    color: COLORS.slate[500],
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...cardShadow,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  methodBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  methodText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.white,
  },
  cardUrl: {
    fontSize: 13,
    color: COLORS.slate[800],
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 8,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardTime: {
    fontSize: 11,
    color: COLORS.slate[500],
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.slate[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.slate[700],
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: COLORS.slate[500],
    textAlign: 'center',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    width: '100%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate[200],
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.slate[800],
    flex: 1,
    marginRight: 12,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalUrlBar: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: COLORS.slate[50],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate[100],
  },
  modalUrlLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.slate[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  modalUrlText: {
    fontSize: 12,
    color: COLORS.slate[800],
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  modalResponseBar: {
    flex: 1,
    padding: 18,
    minHeight: 300,
  },
  modalResponseLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.slate[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  responseScroll: {
    flex: 1,
    backgroundColor: COLORS.slate[50],
    borderRadius: 12,
    minHeight: 0,
  },
  responseScrollContent: {
    padding: 14,
    paddingBottom: 24,
  },
  responseText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 11,
    color: COLORS.slate[700],
  },
});
