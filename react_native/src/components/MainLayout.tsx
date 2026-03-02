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
import { NotificationListScreen } from '../screens/users/NotificationListScreen';
import { PendingApprovalsScreen } from '../screens/approval/PendingApprovalsScreen';
import { InventoryScreen } from '../screens/inventory';
import { HistoryScreen } from '../screens/history';
import { BreakdownFlowScreen } from '../screens/flows/BreakdownFlowScreen';
import { ReplacementsScreen } from '../screens/ReplacementsScreen';
import { PPMListScreen } from '../screens/PPMListScreen';
import { AssignedTasksScreen } from '../screens/AssignedTasksScreen';
import { JobExecutionScreen } from '../screens/JobExecutionScreen';
import { COLORS } from '../constants/theme';

type ProfileSubPage = 'edit_profile' | 'password' | null;
type CurrentFlow = 'breakdown_flow' | 'replacement_list' | 'ppm_list' | 'task_list' | 'job_detail' | null;

interface MainLayoutProps {
  children: React.ReactNode;
  onAction?: (flow: string, payload?: { asset?: { id: string; name: string }; jobId?: string }) => void;
  onLogout?: () => void;
  unreadCount?: number;
  currentFlow?: CurrentFlow;
  onFlowComplete?: () => void;
  breakdownInitialAsset?: { id: string; name: string } | null;
  jobDetailRequestId?: string | null;
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
  jobDetailRequestId = null,
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

  const handleAction = (flow: string, payload?: { asset?: { id: string; name: string }; jobId?: string }) => {
    if (flow === 'notifications') {
      setShowNotificationList(true);
      setActiveTab((tabs[0]?.id ?? 'dashboard') as TabId);
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

  const showBottomBar = !profileSubPage && !currentFlow && !showAddStaff && !showNotificationList;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.content}>
        {showNotificationList ? (
          <NotificationListScreen
            onBack={() => {
              onNotificationListClose?.();
              setShowNotificationList(false);
              setActiveTab((tabs[0]?.id ?? 'dashboard') as TabId);
            }}
            onUnreadChanged={onNotificationListClose}
          />
        ) : (
        <>
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
        {currentFlow === 'replacement_list' && (
          <ReplacementsScreen onBack={onFlowComplete ?? (() => {})} />
        )}
        {currentFlow === 'ppm_list' && (
          <PPMListScreen onBack={onFlowComplete ?? (() => {})} />
        )}
        {currentFlow === 'task_list' && (
          <AssignedTasksScreen onBack={onFlowComplete ?? (() => {})} onSelectTask={(id) => onAction?.('job_detail', { jobId: id })} />
        )}
        {currentFlow === 'job_detail' && jobDetailRequestId && (
          <JobExecutionScreen
            requestId={jobDetailRequestId}
            onBack={onFlowComplete ?? (() => {})}
            onComplete={onFlowComplete}
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
            onUnreadChanged={onNotificationListClose}
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
        </>
        )}
      </View>
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
