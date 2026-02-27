import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { getNotifications, markNotificationAsRead, type Notification } from '../../api/notificationApi';
import { COLORS } from '../../constants/theme';

function formatTimeAgo(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

interface NotificationListScreenProps {
  onBack: () => void;
}

export function NotificationListScreen({ onBack }: NotificationListScreenProps) {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getNotifications().then((res) => {
      setLoading(false);
      if (res.success && res.data) setItems(Array.isArray(res.data) ? res.data : []);
      else setItems([]);
    }).catch(() => {
      setLoading(false);
      setItems([]);
    });
  };

  useEffect(() => { load(); }, []);

  const handleMarkRead = (id: number) => {
    markNotificationAsRead(String(id)).then(() => {
      const now = new Date().toISOString();
      setItems((prev) => prev.map((n) => (n.notification_id === id ? { ...n, read_at: now } : n)));
    });
  };

  return (
    <View style={styles.container}>
      <Header title="Notifications" showBack onBack={onBack} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : items.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={48} color={COLORS.slate[300]} />
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        ) : (
          items.map((n) => {
            const isRead = !!n.read_at;
            return (
            <TouchableOpacity
              key={n.notification_id}
              style={[styles.card, !isRead && styles.cardUnread]}
              onPress={() => !isRead && handleMarkRead(n.notification_id)}
              activeOpacity={0.8}
            >
              <View style={styles.iconWrap}>
                <Ionicons
                  name={n.channel === 'alert' ? 'warning-outline' : 'information-circle-outline'}
                  size={20}
                  color={isRead ? COLORS.slate[400] : COLORS.primary}
                />
              </View>
              <View style={styles.body}>
                <Text style={styles.message} numberOfLines={2}>{n.message}</Text>
                <Text style={styles.time}>{formatTimeAgo(n.created_at)}</Text>
              </View>
              {!isRead && (
                <View style={styles.dot} />
              )}
            </TouchableOpacity>
          ); })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.slate[50] },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  loading: { padding: 48, alignItems: 'center', justifyContent: 'center' },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.slate[500],
    marginTop: 12
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.slate[200],
    marginBottom: 12
  },
  cardUnread: {
    borderColor: COLORS.primary + '40',
    backgroundColor: COLORS.primary + '08'
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.slate[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  body: { flex: 1 },
  message: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.slate[800]
  },
  time: {
    fontSize: 10,
    color: COLORS.slate[400],
    marginTop: 4
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginLeft: 8
  }
});
