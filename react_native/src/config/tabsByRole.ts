import { UserRole } from '../types';
import type { TabItem } from '../components/BottomTabBar';

export type RoleTabId = 'dashboard' | 'users' | 'inventory' | 'history' | 'profile' | 'pending' | 'alerts';

const TAB_DASHBOARD: TabItem = { id: 'dashboard', label: 'Dashboard', iconOutline: 'grid-outline', iconFilled: 'grid' };
const TAB_HOME: TabItem = { id: 'dashboard', label: 'Home', iconOutline: 'home-outline', iconFilled: 'home' };
const TAB_JOBS: TabItem = { id: 'dashboard', label: 'Jobs', iconOutline: 'briefcase-outline', iconFilled: 'briefcase' };
const TAB_USERS: TabItem = { id: 'users', label: 'Users', iconOutline: 'people-outline', iconFilled: 'people' };
const TAB_INVENTORY: TabItem = { id: 'inventory', label: 'Inventory', iconOutline: 'list-outline', iconFilled: 'list' };
const TAB_ASSETS: TabItem = { id: 'inventory', label: 'Assets', iconOutline: 'cube-outline', iconFilled: 'cube' };
const TAB_HISTORY: TabItem = { id: 'history', label: 'History', iconOutline: 'document-text-outline', iconFilled: 'document-text' };
const TAB_RECORDS: TabItem = { id: 'history', label: 'Records', iconOutline: 'document-text-outline', iconFilled: 'document-text' };
const TAB_PROFILE: TabItem = { id: 'profile', label: 'Profile', iconOutline: 'person-outline', iconFilled: 'person' };
const TAB_PENDING: TabItem = { id: 'pending', label: 'Pending', iconOutline: 'checkmark-circle-outline', iconFilled: 'checkmark-circle' };
const TAB_ALERTS: TabItem = { id: 'alerts', label: 'Alerts', iconOutline: 'notifications-outline', iconFilled: 'notifications' };

export function getTabsForRole(role: UserRole, unreadCount?: number): TabItem[] {
  const alertsWithBadge = {
    ...TAB_ALERTS,
    badge: unreadCount ?? 0
  };

  if (role === UserRole.MECHANIC || role === UserRole.HEAD_MECHANIC || role === UserRole.INSTALLER) {
    return [TAB_JOBS, TAB_HISTORY, alertsWithBadge, TAB_PROFILE];
  }
  if (role === UserRole.ADMIN_HOSPITAL || role === UserRole.SUPERADMIN) {
    return [TAB_DASHBOARD, TAB_USERS, TAB_INVENTORY, TAB_HISTORY, TAB_PROFILE];
  }
  if (role === UserRole.HOSPITAL_APPROVER) {
    return [TAB_DASHBOARD, TAB_PENDING, TAB_RECORDS, TAB_PROFILE];
  }
  return [TAB_HOME, TAB_ASSETS, TAB_RECORDS, TAB_PROFILE];
}
