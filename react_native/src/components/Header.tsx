import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  showRightIcons?: boolean;
  onNotificationClick?: () => void;
  onAvatarPress?: () => void;
  unreadCount?: number;
}

export function Header({
  title,
  showBack,
  onBack,
  showRightIcons = false,
  onNotificationClick,
  onAvatarPress,
  unreadCount = 0
}: HeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {showBack && onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={COLORS.slate[500]} />
          </TouchableOpacity>
        )}
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
      </View>
      {showRightIcons && (
        <View style={styles.right}>
          {onNotificationClick && (
            <TouchableOpacity onPress={onNotificationClick} style={styles.iconBtn}>
              <Ionicons name="notifications-outline" size={22} color={COLORS.slate[500]} />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          {onAvatarPress && (
            <TouchableOpacity style={styles.avatar} onPress={onAvatarPress} activeOpacity={0.8}>
              <Ionicons name="person-outline" size={20} color={COLORS.slate[500]} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate[200]
  },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backBtn: { padding: 4, marginRight: 4 },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.slate[900]
  },
  iconBtn: { position: 'relative', padding: 4 },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 8,
    fontWeight: '700'
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.slate[200],
    alignItems: 'center',
    justifyContent: 'center'
  }
});
