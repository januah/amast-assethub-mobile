import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export type TabId = 'dashboard' | 'users' | 'inventory' | 'history' | 'profile' | 'pending' | 'alerts' | 'scan';

export interface TabItem {
  id: TabId;
  label: string;
  iconOutline: string;
  iconFilled: string;
  badge?: number;
  special?: boolean;
}

export const BOTTOM_TABS: TabItem[] = [
  { id: 'dashboard', label: 'Dashboard', iconOutline: 'grid-outline', iconFilled: 'grid' },
  { id: 'users', label: 'Users', iconOutline: 'people-outline', iconFilled: 'people' },
  { id: 'inventory', label: 'Inventory', iconOutline: 'list-outline', iconFilled: 'list' },
  { id: 'history', label: 'History', iconOutline: 'document-text-outline', iconFilled: 'document-text' },
  { id: 'profile', label: 'Profile', iconOutline: 'person-outline', iconFilled: 'person' }
];

interface BottomTabBarProps {
  activeTab: TabId;
  onTabPress: (tabId: TabId) => void;
  tabs?: TabItem[];
  unreadCount?: number;
}

export function BottomTabBar({
  activeTab,
  onTabPress,
  tabs = BOTTOM_TABS,
  unreadCount = 0
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const items = tabs;

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <View style={styles.inner}>
        {items.map((tab) => {
          const isActive = activeTab === tab.id;
          const iconName = isActive ? tab.iconFilled : tab.iconOutline;
          const count = tab.badge ?? 0;

          if (tab.special) {
            return (
              <View key={tab.id} style={styles.tab}>
                <TouchableOpacity
                  style={[styles.floatingBtn, isActive && styles.floatingBtnActive]}
                  onPress={() => onTabPress(tab.id)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={iconName as React.ComponentProps<typeof Ionicons>['name']}
                    size={28}
                    color={COLORS.white}
                  />
                </TouchableOpacity>
                <Text style={[styles.label, styles.labelFloating]} numberOfLines={1}>
                  {tab.label}
                </Text>
              </View>
            );
          }

          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tab}
              onPress={() => onTabPress(tab.id)}
              activeOpacity={0.7}
            >
              <View style={styles.iconWrap}>
                <Ionicons
                  name={iconName as React.ComponentProps<typeof Ionicons>['name']}
                  size={24}
                  color={isActive ? COLORS.primary : COLORS.slate[400]}
                />
                {count > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{count > 9 ? '9+' : count}</Text>
                  </View>
                )}
              </View>
              <Text
                style={[styles.label, isActive && styles.labelActive]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.slate[200],
    paddingTop: 8,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.06, shadowRadius: 8 },
      android: { elevation: 8 }
    })
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconWrap: {
    position: 'relative',
    marginBottom: 4
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
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
    fontSize: 9,
    fontWeight: '600'
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.slate[500]
  },
  labelActive: {
    color: COLORS.primary
  },
  floatingBtn: {
    position: 'absolute',
    top: -22,
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: COLORS.white,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
      android: { elevation: 8 }
    })
  },
  floatingBtnActive: {
    backgroundColor: COLORS.sky[800]
  },
  labelFloating: {
    marginTop: 38,
    // color: COLORS.sky[600],
    fontWeight: '600'
  }
});
