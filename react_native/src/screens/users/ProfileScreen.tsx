import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../constants/theme';
interface ProfileScreenProps {
  onAction?: (flow: string) => void;
  onEditProfile?: () => void;
  onChangePassword?: () => void;
  onLogout?: () => void;
  unreadCount?: number;
}

export function ProfileScreen({
  onAction,
  onEditProfile,
  onChangePassword,
  onLogout,
  unreadCount = 0
}: ProfileScreenProps) {
  const { user, role } = useAuth();
  const userId = user?.id ?? '';
  const fullName = user?.full_name ?? '';
  const username = user?.username ?? '';
  const avatarInitials = (fullName || username || 'U').substring(0, 2);

  return (
    <View style={styles.container}>
      <Header
        title="My Profile"
        onNotificationClick={() => onAction?.('notifications')}
        unreadCount={unreadCount}
      />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{avatarInitials}</Text>
            </View>
            <View style={styles.heroTitleBlock}>
              <Text style={styles.heroLabel}>Name</Text>
              <Text style={styles.heroName} numberOfLines={2}>{fullName || '—'}</Text>
            </View>
          </View>
          <View style={styles.heroRows}>
            <View style={styles.heroRow}>
              <Text style={styles.heroRowLabel}>User ID</Text>
              <Text style={styles.heroRowValue} numberOfLines={1}>{userId || '—'}</Text>
            </View>
            <View style={styles.heroRow}>
              <Text style={styles.heroRowLabel}>Username</Text>
              <Text style={styles.heroRowValue} numberOfLines={1}>{username || '—'}</Text>
            </View>
            <View style={styles.heroRow}>
              <Text style={styles.heroRowLabel}>Role</Text>
              <Text style={styles.heroRowValue} numberOfLines={1}>{role || '—'}</Text>
            </View>
          </View>
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
  hero: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.slate[200],
    padding: 20,
    marginBottom: 24
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate[100]
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.white
  },
  heroTitleBlock: {
    flex: 1,
    minWidth: 0
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.slate[500],
    letterSpacing: 0.5,
    marginBottom: 4
  },
  heroName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.slate[900]
  },
  heroRows: {
    gap: 12,
    paddingTop: 12
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 24
  },
  heroRowLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.slate[500],
    marginRight: 12
  },
  heroRowValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.slate[800],
    flex: 1,
    textAlign: 'right'
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
