import React, { useState, useEffect, useCallback } from 'react';
import { UserRole } from '../types';
import { MainLayout } from '../components/MainLayout';
import { getTabsForRole } from '../config/tabsByRole';
import { getUnreadCount } from '../api/notificationApi';
import { RequesterDashboard } from './dashboards/RequesterDashboard';
import { AmbulanceDashboard } from './dashboards/AmbulanceDashboard';
import { ExecutorDashboard } from './dashboards/ExecutorDashboard';
import { ApproverDashboard } from './dashboards/ApproverDashboard';
import { AdminHospitalDashboard } from './dashboards/AdminHospitalDashboard';
import { MechanicDashboard } from './dashboards/MechanicDashboard';
import { InstallerDashboard } from './dashboards/InstallerDashboard';

interface DashboardRouterProps {
  role: UserRole;
  onAction: (flow: string) => void;
  onLogout?: () => void;
  onSelectJob?: (id: string) => void;
  onSelectInstallation?: (id: string) => void;
  unreadCount?: number;
}

type FlowState = 'breakdown_flow' | null;

function wrapWithLayout(
  children: React.ReactNode,
  role: UserRole,
  unreadCount: number,
  onAction: (flow: string) => void,
  onLogout: (() => void) | undefined,
  flowProps: {
    currentFlow: FlowState;
    onFlowComplete: () => void;
    breakdownInitialAsset: { id: string; name: string } | null;
    handleAction: (flow: string, payload?: { asset?: { id: string; name: string } }) => void;
    onNotificationListClose?: () => void;
  }
) {
  const tabs = getTabsForRole(role, unreadCount);
  return (
    <MainLayout
      unreadCount={unreadCount}
      onAction={flowProps.handleAction}
      onLogout={onLogout}
      currentFlow={flowProps.currentFlow}
      onFlowComplete={flowProps.onFlowComplete}
      breakdownInitialAsset={flowProps.breakdownInitialAsset}
      onNotificationListClose={flowProps.onNotificationListClose}
      tabs={tabs}
    >
      {children}
    </MainLayout>
  );
}

export function DashboardRouter({
  role,
  onAction,
  onLogout,
  onSelectJob,
  onSelectInstallation,
  unreadCount = 0
}: DashboardRouterProps) {
  const [currentFlow, setCurrentFlow] = useState<FlowState>(null);
  const [breakdownInitialAsset, setBreakdownInitialAsset] = useState<{ id: string; name: string } | null>(null);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(unreadCount ?? 0);

  const fetchUnread = useCallback(() => {
    getUnreadCount().then((res) => {
      if (res.success && res.data) setUnreadNotificationCount(res.data.count ?? 0);
    }).catch(() => setUnreadNotificationCount(0));
  }, []);

  useEffect(() => {
    fetchUnread();
  }, [fetchUnread]);

  const handleAction = (flow: string, payload?: { asset?: { id: string; name: string } }) => {
    if (flow === 'breakdown_flow') {
      setBreakdownInitialAsset(payload?.asset ?? null);
      setCurrentFlow('breakdown_flow');
    } else {
      onAction(flow);
    }
  };

  const handleFlowComplete = () => {
    setCurrentFlow(null);
    setBreakdownInitialAsset(null);
  };

  const flowProps = {
    currentFlow,
    onFlowComplete: handleFlowComplete,
    breakdownInitialAsset,
    handleAction,
    onNotificationListClose: fetchUnread
  };

  const count = unreadNotificationCount;

  if (role === UserRole.MEDICAL_OFFICER || role === UserRole.VIEWER) {
    return wrapWithLayout(
      <RequesterDashboard onAction={handleAction} onLogout={onLogout} unreadCount={count} />,
      role,
      count,
      onAction,
      onLogout,
      flowProps
    );
  }
  if (role === UserRole.AMBULANCE_DRIVER) {
    return wrapWithLayout(<AmbulanceDashboard onAction={handleAction} onLogout={onLogout} />, role, count, onAction, onLogout, flowProps);
  }
  if (role === UserRole.BIOMEDICAL_ENGINEER || role === UserRole.TOW_TRUCK) {
    return wrapWithLayout(
      <ExecutorDashboard role={role} onAction={handleAction} onLogout={onLogout} unreadCount={count} />,
      role,
      count,
      onAction,
      onLogout,
      flowProps
    );
  }
  if (role === UserRole.HOSPITAL_APPROVER) {
    return wrapWithLayout(<ApproverDashboard onAction={handleAction} onLogout={onLogout} />, role, count, onAction, onLogout, flowProps);
  }
  if (role === UserRole.ADMIN_HOSPITAL || role === UserRole.SUPERADMIN) {
    return wrapWithLayout(<AdminHospitalDashboard onAction={handleAction} onLogout={onLogout} />, role, count, onAction, onLogout, flowProps);
  }
  if (role === UserRole.MECHANIC || role === UserRole.HEAD_MECHANIC) {
    return wrapWithLayout(<MechanicDashboard onSelectJob={onSelectJob || (() => {})} onLogout={onLogout} />, role, count, onAction, onLogout, flowProps);
  }
  if (role === UserRole.INSTALLER) {
    return wrapWithLayout(<InstallerDashboard onSelect={onSelectInstallation || (() => {})} onLogout={onLogout} />, role, count, onAction, onLogout, flowProps);
  }

  return null;
}
