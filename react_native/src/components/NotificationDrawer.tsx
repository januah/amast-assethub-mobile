import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getNotifications, markNotificationAsRead, type Notification } from '../api/notificationApi';
import { COLORS } from '../constants/theme';

const DRAWER_HEIGHT = Dimensions.get('window').height * 0.5;

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

interface NotificationDrawerProps {
  visible: boolean;
  onClose: () => void;
}

export function NotificationDrawer({ visible, onClose }: NotificationDrawerProps) {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      setLoading(true);
      getNotifications().then((res) => {
        setLoading(false);
        if (res.success && res.data) setItems(Array.isArray(res.data) ? res.data : []);
        else setItems([]);
      }).catch(() => {
        setLoading(false);
        setItems([]);
      });
    }
  }, [visible]);

  const handleMarkRead = (id: number) => {
    markNotificationAsRead(String(id)).then(() => {
      const now = new Date().toISOString();
      setItems((prev) => prev.map((n) => (n.notification_id === id ? { ...n, read_at: now } : n)));
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.drawer}>
              <View style={styles.handle} />
              <View style={styles.header}>
                <Text style={styles.title}>Notifications</Text>
                <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                  <Ionicons name="close" size={24} color={COLORS.slate[600]} />
                </TouchableOpacity>
              </View>
              <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
              >
                {loading ? (
                  <View style={styles.loading}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                  </View>
                ) : items.length === 0 ? (
                  <View style={styles.empty}>
                    <Ionicons name="notifications-off-outline" size={40} color={COLORS.slate[300]} />
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
                          size={18}
                          color={isRead ? COLORS.slate[400] : COLORS.primary}
                        />
                      </View>
                      <View style={styles.body}>
                        <Text style={styles.message} numberOfLines={2}>{n.message}</Text>
                        <Text style={styles.time}>{formatTimeAgo(n.created_at)}</Text>
                      </View>
                      {!isRead && <View style={styles.dot} />}
                    </TouchableOpacity>
                  ); })
                )}
              </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-start',
    paddingTop: 0
  },
  drawer: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    maxHeight: DRAWER_HEIGHT,
    paddingBottom: 24
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.slate[300],
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.slate[900]
  },
  scroll: { maxHeight: DRAWER_HEIGHT - 80 },
  content: { padding: 16, paddingBottom: 32 },
  loading: { padding: 32, alignItems: 'center', justifyContent: 'center' },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32
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
    padding: 12,
    backgroundColor: COLORS.slate[50],
    borderRadius: 12,
    marginBottom: 8
  },
  cardUnread: {
    backgroundColor: COLORS.primary + '12',
    borderWidth: 1,
    borderColor: COLORS.primary + '30'
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  body: { flex: 1 },
  message: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.slate[800]
  },
  time: {
    fontSize: 10,
    color: COLORS.slate[400],
    marginTop: 2
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginLeft: 8
  }
});
