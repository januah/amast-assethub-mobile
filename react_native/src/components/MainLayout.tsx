import React, { useState, useEffect, cloneElement, isValidElement } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomTabBar, TabId, TabItem } from './BottomTabBar';
import {
  ProfileScreen,
  StaffManagementScreen,
  AddStaffScreen,
  EditProfileScreen,
  ChangePasswordScreen
} from '../screens/users';
import { NotificationDrawer } from './NotificationDrawer';
import { NotificationListScreen } from '../screens/users/NotificationListScreen';
import { PendingApprovalsScreen } from '../screens/approval/PendingApprovalsScreen';
import { InventoryScreen } from '../screens/inventory';
import { HistoryScreen } from '../screens/history';
import { BreakdownFlowScreen } from '../screens/flows/BreakdownFlowScreen';
import { COLORS } from '../constants/theme';

type ProfileSubPage = 'edit_profile' | 'password' | null;
type CurrentFlow = 'breakdown_flow' | null;

interface MainLayoutProps {
  children: React.ReactNode;
  onAction?: (flow: string, payload?: { asset?: { id: string; name: string } }) => void;
  onLogout?: () => void;
  unreadCount?: number;
  currentFlow?: CurrentFlow;
  onFlowComplete?: () => void;
  breakdownInitialAsset?: { id: string; name: string } | null;
  onNotificationListClose?: () => void;
  tabs?: TabItem[];
}

export function MainLayout({
  children,
  onAction,
  onLogout,
  unreadCount = 0,
  currentFlow = null,
  onFlowComplete,
  breakdownInitialAsset = null,
  onNotificationListClose,
  tabs = []
}: MainLayoutProps) {
  const defaultTab = (tabs[0]?.id ?? 'dashboard') as TabId;
  const [activeTab, setActiveTab] = useState<TabId>(defaultTab);
  const [profileSubPage, setProfileSubPage] = useState<ProfileSubPage>(null);

  useEffect(() => {
    const validIds = tabs.map((t) => t.id);
    if (tabs.length > 0 && !validIds.includes(activeTab)) {
      setActiveTab((tabs[0].id ?? 'dashboard') as TabId);
    }
  }, [tabs, activeTab]);
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [showNotificationList, setShowNotificationList] = useState(false);

  const handleAction = (flow: string, payload?: { asset?: { id: string; name: string } }) => {
    if (flow === 'notifications') {
      setShowNotificationList(true);
      return;
    }
    if (flow === 'add_staff') {
      setShowAddStaff(true);
    } else if (flow === 'manage_users') {
      setProfileSubPage(null);
      setActiveTab('users');
    } else if (flow === 'pending_tab' || flow === 'admin_approval_list') {
      setProfileSubPage(null);
      setActiveTab('pending');
    } else if (flow === 'assets') {
      setProfileSubPage(null);
      setActiveTab('inventory');
    } else if (flow === 'admin_reports' || flow === 'records') {
      setProfileSubPage(null);
      setActiveTab('history');
    } else if (flow === 'profile') {
      setProfileSubPage(null);
      setActiveTab('profile');
    } else {
      onAction?.(flow, payload);
    }
  };

  const handleTabPress = (tabId: TabId) => {
    setProfileSubPage(null);
    setActiveTab(tabId);
  };

  const showBottomBar = !profileSubPage && !currentFlow && !showAddStaff;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
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
        {profileSubPage === 'password' && (
          <ChangePasswordScreen onBack={() => setProfileSubPage(null)} />
        )}
        {!currentFlow && !profileSubPage && activeTab === 'dashboard' && (isValidElement(children) ? cloneElement(children as React.ReactElement<{ onAction?: (flow: string, payload?: unknown) => void; unreadCount?: number }>, { onAction: handleAction, unreadCount }) : children)}
        {!currentFlow && !profileSubPage && !showAddStaff && activeTab === 'users' && (
          <StaffManagementScreen
            onBack={() => setActiveTab((tabs[0]?.id ?? 'dashboard') as TabId)}
            onAddStaff={() => handleAction('add_staff')}
            onSelectStaff={(id) => onAction?.('staff_detail')}
          />
        )}
        {!currentFlow && !profileSubPage && activeTab === 'inventory' && (
          <InventoryScreen
            onBack={() => setActiveTab((tabs[0]?.id ?? 'dashboard') as TabId)}
            onReportIssue={(asset) => onAction?.('breakdown_flow', { asset })}
          />
        )}
        {!currentFlow && !profileSubPage && activeTab === 'history' && (
          <HistoryScreen
            onBack={() => setActiveTab((tabs[0]?.id ?? 'dashboard') as TabId)}
            onOpenChecklist={onAction ? () => onAction('checklist_flow') : undefined}
          />
        )}
        {!currentFlow && !profileSubPage && activeTab === 'pending' && (
          <PendingApprovalsScreen onBack={() => setActiveTab((tabs[0]?.id ?? 'dashboard') as TabId)} />
        )}
        {!currentFlow && !profileSubPage && activeTab === 'alerts' && (
          <NotificationListScreen
            onBack={() => {
              onNotificationListClose?.();
              setActiveTab((tabs[0]?.id ?? 'dashboard') as TabId);
            }}
          />
        )}
        {!currentFlow && !profileSubPage && activeTab === 'profile' && (
          <ProfileScreen
            onAction={onAction}
            onEditProfile={() => setProfileSubPage('edit_profile')}
            onChangePassword={() => setProfileSubPage('password')}
            onLogout={onLogout}
            unreadCount={unreadCount}
          />
        )}
      </View>
      <NotificationDrawer
        visible={showNotificationList}
        onClose={() => {
          onNotificationListClose?.();
          setShowNotificationList(false);
        }}
      />
      {showBottomBar && tabs.length > 0 && (
        <BottomTabBar
          activeTab={activeTab}
          onTabPress={handleTabPress}
          tabs={tabs}
        />
      )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white
  },
  safeArea: {
    flex: 1
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
