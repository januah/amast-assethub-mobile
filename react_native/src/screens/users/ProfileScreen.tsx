import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../constants/theme';
import { UserRole } from '../../types';

function roleLabel(role: UserRole): string {
  const s = String(role).replace(/_/g, ' ');
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

interface ProfileScreenProps {
  onAction?: (flow: string) => void;
  onEditProfile?: () => void;
  onNotificationSettings?: () => void;
  onChangePassword?: () => void;
  onLogout?: () => void;
  unreadCount?: number;
}

export function ProfileScreen({
  onAction,
  onEditProfile,
  onNotificationSettings,
  onChangePassword,
  onLogout,
  unreadCount = 0
}: ProfileScreenProps) {
  const { user, role } = useAuth();
  const displayName = user?.full_name || user?.username || 'User';

  return (
    <View style={styles.container}>
      <Header
        title="My Profile"
        onNotificationClick={() => onAction?.('notifications')}
        unreadCount={unreadCount}
      />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(displayName || 'U').substring(0, 2).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.role}>{roleLabel(role)}</Text>
        </View>

        <View style={styles.menu}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={onEditProfile}
            activeOpacity={0.7}
          >
            <Ionicons name="person-outline" size={20} color={COLORS.slate[400]} />
            <Text style={styles.menuLabel}>Edit Profile</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.slate[300]} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={onNotificationSettings}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={20} color={COLORS.slate[400]} />
            <Text style={styles.menuLabel}>Notification Settings</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.slate[300]} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={onChangePassword}
            activeOpacity={0.7}
          >
            <Ionicons name="lock-closed-outline" size={20} color={COLORS.slate[400]} />
            <Text style={styles.menuLabel}>Change Password</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.slate[300]} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, styles.logoutItem]}
            onPress={onLogout}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
            <Text style={[styles.menuLabel, styles.logoutText]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.slate[50]
  },
  scroll: { flex: 1 },
  content: {
    padding: 24,
    paddingBottom: 48
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.white
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.slate[900]
  },
  role: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.slate[500],
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: 4
  },
  menu: {
    gap: 12
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.slate[200]
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.slate[800]
  },
  logoutItem: {
    marginTop: 24,
    borderColor: COLORS.danger + '40',
    backgroundColor: '#fef2f2'
  },
  logoutText: {
    color: COLORS.danger
  }
});
