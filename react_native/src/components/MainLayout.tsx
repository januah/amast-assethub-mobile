import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BottomTabBar, TabId } from './BottomTabBar';
import {
  ProfileScreen,
  StaffManagementScreen,
  AddStaffScreen,
  EditProfileScreen,
  NotificationSettingsScreen,
  ChangePasswordScreen
} from '../screens/users';
import { InventoryScreen } from '../screens/inventory';
import { BreakdownFlowScreen } from '../screens/flows/BreakdownFlowScreen';
import { COLORS } from '../constants/theme';

type ProfileSubPage = 'edit_profile' | 'notifications' | 'password' | null;
type CurrentFlow = 'breakdown_flow' | null;

interface MainLayoutProps {
  children: React.ReactNode;
  onAction?: (flow: string, payload?: { asset?: { id: string; name: string } }) => void;
  onLogout?: () => void;
  unreadCount?: number;
  currentFlow?: CurrentFlow;
  onFlowComplete?: () => void;
  breakdownInitialAsset?: { id: string; name: string } | null;
}

export function MainLayout({
  children,
  onAction,
  onLogout,
  unreadCount = 0,
  currentFlow = null,
  onFlowComplete,
  breakdownInitialAsset = null
}: MainLayoutProps) {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [profileSubPage, setProfileSubPage] = useState<ProfileSubPage>(null);
  const [showAddStaff, setShowAddStaff] = useState(false);

  const handleAction = (flow: string, payload?: { asset?: { id: string; name: string } }) => {
    if (flow === 'add_staff') {
      setShowAddStaff(true);
    } else {
      onAction?.(flow, payload);
    }
  };

  const handleTabPress = (tabId: TabId) => {
    setProfileSubPage(null);
    setActiveTab(tabId);
    if (tabId === 'inventory' && onAction) onAction('assets');
    if (tabId === 'history' && onAction) onAction('records');
  };

  const showBottomBar = !profileSubPage && !currentFlow && !showAddStaff;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {showAddStaff && (
          <AddStaffScreen
            onBack={() => setShowAddStaff(false)}
            onSuccess={() => setShowAddStaff(false)}
          />
        )}
        {currentFlow === 'breakdown_flow' && (
          <BreakdownFlowScreen
            onComplete={onFlowComplete ?? (() => {})}
            onCancel={onFlowComplete ?? (() => {})}
            initialAsset={breakdownInitialAsset}
          />
        )}
        {!currentFlow && profileSubPage === 'edit_profile' && (
          <EditProfileScreen onBack={() => setProfileSubPage(null)} />
        )}
        {profileSubPage === 'notifications' && (
          <NotificationSettingsScreen onBack={() => setProfileSubPage(null)} />
        )}
        {profileSubPage === 'password' && (
          <ChangePasswordScreen onBack={() => setProfileSubPage(null)} />
        )}
        {!currentFlow && !profileSubPage && activeTab === 'dashboard' && children}
        {!currentFlow && !profileSubPage && !showAddStaff && activeTab === 'users' && (
          <StaffManagementScreen
            onBack={() => setActiveTab('dashboard')}
            onAddStaff={() => handleAction('add_staff')}
            onSelectStaff={(id) => onAction?.('staff_detail')}
          />
        )}
        {!currentFlow && !profileSubPage && activeTab === 'inventory' && (
          <InventoryScreen
            onBack={() => setActiveTab('dashboard')}
            onReportIssue={(asset) => onAction?.('breakdown_flow', { asset })}
          />
        )}
        {!currentFlow && !profileSubPage && activeTab === 'history' && (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>History</Text>
          </View>
        )}
        {!currentFlow && !profileSubPage && activeTab === 'profile' && (
          <ProfileScreen
            onAction={onAction}
            onEditProfile={() => setProfileSubPage('edit_profile')}
            onNotificationSettings={() => setProfileSubPage('notifications')}
            onChangePassword={() => setProfileSubPage('password')}
            onLogout={onLogout}
            unreadCount={unreadCount}
          />
        )}
      </View>
      {showBottomBar && (
        <BottomTabBar
          activeTab={activeTab}
          onTabPress={handleTabPress}
          unreadCount={unreadCount}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white
  },
  content: {
    flex: 1
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.slate[50]
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.slate[500]
  }
});
