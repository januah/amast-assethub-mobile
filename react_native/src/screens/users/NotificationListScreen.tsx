import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { Card } from '../../components/Shared';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type Notification
} from '../../api/notificationApi';
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

type NotificationType = 'success' | 'warning' | 'info';

function getNotificationType(n: Notification): NotificationType {
  const msg = (n.message || '').toLowerCase();
  const ch = (n.channel || '').toLowerCase();
  if (ch === 'alert' || msg.includes('breakdown') || msg.includes('reject')) return 'warning';
  if (
    msg.includes('approv') ||
    msg.includes('complet') ||
    msg.includes('received') ||
    msg.includes('installed')
  )
    return 'success';
  return 'info';
}

function getNotificationTitle(n: Notification, type: NotificationType): string {
  const msg = (n.message || '').toLowerCase();
  if (msg.includes('approv')) return 'Request Approved';
  if (msg.includes('reject')) return 'Request Rejected';
  if (msg.includes('assigned') || msg.includes('job') || msg.includes('task')) return 'Job Assigned';
  if (msg.includes('ppm') || msg.includes('maintenance') || msg.includes('scheduled'))
    return 'PPM Reminder';
  if (msg.includes('invoice') || msg.includes('report')) return 'Invoice Ready';
  if (msg.includes('breakdown')) return 'Breakdown Reported';
  const firstSentence = (n.message || '').split(/[.!?]/)[0] || '';
  return firstSentence.length > 40 ? firstSentence.slice(0, 37) + '...' : firstSentence || 'Notification';
}

function getNotificationIcon(type: NotificationType): { name: keyof typeof Ionicons.glyphMap; bg: string; color: string } {
  switch (type) {
    case 'success':
      return { name: 'checkmark-circle', bg: COLORS.emerald[50], color: COLORS.emerald[600] };
    case 'warning':
      return { name: 'calendar', bg: COLORS.amber[50], color: COLORS.amber[600] };
    default:
      return { name: 'notifications', bg: COLORS.sky[50], color: COLORS.sky[600] };
  }
}

interface NotificationListScreenProps {
  onBack: () => void;
  showBack?: boolean;
  onUnreadChanged?: (count: number) => void;
}

export function NotificationListScreen({
  onBack,
  showBack = true,
  onUnreadChanged
}: NotificationListScreenProps) {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getNotifications()
      .then((res) => {
        setLoading(false);
        if (res.success && res.data) setItems(Array.isArray(res.data) ? res.data : []);
        else setItems([]);
      })
      .catch(() => {
        setLoading(false);
        setItems([]);
      });
  };

  useEffect(() => {
    load();
  }, []);

  const unreadCount = items.filter((n) => !n.read_at).length;

  useEffect(() => {
    onUnreadChanged?.(unreadCount);
  }, [unreadCount, onUnreadChanged]);

  const handleMarkRead = (id: number) => {
    markNotificationAsRead(String(id)).then(() => {
      const now = new Date().toISOString();
      setItems((prev) =>
        prev.map((n) => (n.notification_id === id ? { ...n, read_at: now } : n))
      );
      onUnreadChanged?.(0);
    });
  };

  const handleMarkAllRead = () => {
    if (unreadCount === 0) return;
    markAllNotificationsAsRead().then(() => {
      const now = new Date().toISOString();
      setItems((prev) => prev.map((n) => ({ ...n, read_at: n.read_at || now })));
      onUnreadChanged?.(0);
    });
  };

  return (
    <View style={styles.container}>
      <Header title="Notifications" showBack={showBack} onBack={onBack} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : items.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="notifications-outline" size={40} color={COLORS.slate[300]} />
            </View>
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptyDesc}>
              You're all caught up. New updates about your requests will appear here.
            </Text>
          </View>
        ) : (
          items.map((n) => {
            const isRead = !!n.read_at;
            const type = getNotificationType(n);
            const iconInfo = getNotificationIcon(type);
            const title = getNotificationTitle(n, type);
            return (
              <Card
                key={n.notification_id}
                style={styles.card}
                leftBorder={!isRead ? COLORS.sky[500] : undefined}
                onPress={() => !isRead && handleMarkRead(n.notification_id)}
              >
                <View style={[styles.iconWrap, { backgroundColor: iconInfo.bg }]}>
                  <Ionicons
                    name={iconInfo.name as React.ComponentProps<typeof Ionicons>['name']}
                    size={20}
                    color={iconInfo.color}
                  />
                </View>
                <View style={styles.body}>
                  <View style={styles.cardHeader}>
                    <Text
                      style={[styles.title, isRead && styles.titleRead]}
                      numberOfLines={1}
                    >
                      {title}
                    </Text>
                    <Text style={styles.time}>{formatTimeAgo(n.created_at)}</Text>
                  </View>
                  <Text style={styles.desc} numberOfLines={2}>
                    {n.message}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.dismissBtn}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleMarkRead(n.notification_id);
                  }}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <Ionicons name="close" size={16} color={COLORS.slate[400]} />
                </TouchableOpacity>
              </Card>
            );
          })
        )}
      </ScrollView>
      {items.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={handleMarkAllRead}
            disabled={unreadCount === 0}
            style={unreadCount === 0 && styles.footerBtnDisabled}
          >
            <Text
              style={[
                styles.footerBtnText,
                unreadCount === 0 && styles.footerBtnTextDisabled
              ]}
            >
              MARK ALL AS READ
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.slate[50] },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 24 },
  loading: { padding: 48, alignItems: 'center', justifyContent: 'center' },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
    minHeight: 200
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.slate[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: COLORS.slate[800] },
  emptyDesc: {
    fontSize: 14,
    color: COLORS.slate[500],
    marginTop: 8,
    textAlign: 'center'
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    marginBottom: 12,
    gap: 12
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  body: { flex: 1, minWidth: 0 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  title: { fontSize: 14, fontWeight: '700', color: COLORS.slate[800], flex: 1 },
  titleRead: { color: COLORS.slate[600] },
  time: { fontSize: 10, color: COLORS.slate[400] },
  desc: { fontSize: 12, color: COLORS.slate[500], lineHeight: 18 },
  dismissBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.slate[100],
    alignItems: 'center',
    justifyContent: 'center'
  },
  footer: {
    padding: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: COLORS.slate[100],
    backgroundColor: COLORS.white,
    alignItems: 'center'
  },
  footerBtnDisabled: { opacity: 0.5 },
  footerBtnText: { fontSize: 12, fontWeight: '700', color: COLORS.sky[600], letterSpacing: 2 },
  footerBtnTextDisabled: { color: COLORS.slate[400] }
});
