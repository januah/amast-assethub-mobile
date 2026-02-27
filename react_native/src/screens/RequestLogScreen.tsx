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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRequestLog } from '../context/RequestLogContext';
import { COLORS } from '../constants/theme';
import type { RequestLogEntry } from '../store/requestLogStore';

function formatTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function Row({ entry, onPress }: { entry: RequestLogEntry; onPress: () => void }) {
  const statusColor = entry.error ? COLORS.danger : (entry.status && entry.status >= 400 ? COLORS.warning : COLORS.success);
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
      <View style={styles.rowBody}>
        <Text style={styles.method} numberOfLines={1}>{entry.method} {entry.path}</Text>
        <Text style={styles.meta}>
          {entry.status != null ? `${entry.status}` : 'err'} | {formatTime(entry.timestamp)}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={COLORS.slate[400]} />
    </TouchableOpacity>
  );
}

export function RequestLogScreen() {
  const { logs, setShowScreen } = useRequestLog();
  const [selected, setSelected] = useState<RequestLogEntry | null>(null);

  const renderItem = ({ item }: { item: RequestLogEntry }) => (
    <Row entry={item} onPress={() => setSelected(item)} />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setShowScreen(false)} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={COLORS.slate[600]} />
        </TouchableOpacity>
        <Text style={styles.title}>Request Log</Text>
      </View>
      {logs.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No requests yet</Text>
        </View>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
      <Modal
        visible={!!selected}
        transparent
        animationType="fade"
        onRequestClose={() => setSelected(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setSelected(null)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selected?.method} {selected?.path}
              </Text>
              <TouchableOpacity onPress={() => setSelected(null)}>
                <Ionicons name="close" size={24} color={COLORS.slate[600]} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.responseScroll} showsVerticalScrollIndicator>
              <Text style={styles.responseText} selectable>
                {selected
                  ? JSON.stringify(
                      selected.response ?? (selected.error ? { error: selected.error } : {}),
                      null,
                      2
                    )
                  : ''}
              </Text>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
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
  closeBtn: { marginRight: 12 },
  title: { fontSize: 18, fontWeight: '600', color: COLORS.slate[800] },
  list: { padding: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.slate[50],
    borderRadius: 8,
    marginBottom: 8,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
  rowBody: { flex: 1 },
  method: { fontSize: 14, fontWeight: '500', color: COLORS.slate[800] },
  meta: { fontSize: 12, color: COLORS.slate[500], marginTop: 2 },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: { fontSize: 14, color: COLORS.slate[500] },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate[200],
  },
  modalTitle: { fontSize: 14, fontWeight: '600', color: COLORS.slate[800], flex: 1 },
  responseScroll: { maxHeight: 400, padding: 16 },
  responseText: { fontFamily: 'monospace', fontSize: 12, color: COLORS.slate[700] },
});
