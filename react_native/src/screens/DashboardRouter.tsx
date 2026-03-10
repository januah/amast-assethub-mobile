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

interface DashboardRouterProps {
  role: UserRole;
  onAction: (flow: string) => void;
  onLogout?: () => void;
  onSelectJob?: (id: string) => void;
  unreadCount?: number;
}

type FlowState = 'breakdown_flow' | 'replacement_list' | 'ppm_list' | 'task_list' | 'job_detail' | 'request_detail' | 'removal_flow' | null;

type ActionPayload = { asset?: { id: string; name: string }; jobId?: string; requestId?: string };

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
    jobDetailRequestId: string | null;
    requestDetailId: string | null;
    handleAction: (flow: string, payload?: ActionPayload) => void;
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
      jobDetailRequestId={flowProps.jobDetailRequestId}
      requestDetailId={flowProps.requestDetailId}
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
  unreadCount = 0
}: DashboardRouterProps) {
  const [currentFlow, setCurrentFlow] = useState<FlowState>(null);
  const [breakdownInitialAsset, setBreakdownInitialAsset] = useState<{ id: string; name: string } | null>(null);
  const [jobDetailRequestId, setJobDetailRequestId] = useState<string | null>(null);
  const [requestDetailId, setRequestDetailId] = useState<string | null>(null);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(unreadCount ?? 0);

  const fetchUnread = useCallback(() => {
    getUnreadCount().then((res) => {
      if (res.success && res.data) setUnreadNotificationCount(res.data.count ?? 0);
    }).catch(() => setUnreadNotificationCount(0));
  }, []);

  useEffect(() => {
    fetchUnread();
  }, [fetchUnread]);

  const handleAction = (flow: string, payload?: ActionPayload) => {
    if (flow === 'open_scan') {
      setCurrentFlow(null);
      return;
    }
    if (flow === 'breakdown_flow') {
      setBreakdownInitialAsset(payload?.asset ?? null);
      setCurrentFlow('breakdown_flow');
    } else if (flow === 'replacement_list') {
      setCurrentFlow('replacement_list');
    } else if (flow === 'ppm_list') {
      setCurrentFlow('ppm_list');
    } else if (flow === 'task_list') {
      setCurrentFlow('task_list');
    } else if (flow === 'job_detail' && payload?.jobId) {
      setJobDetailRequestId(payload.jobId);
      setCurrentFlow('job_detail');
    } else if (flow === 'request_detail' && payload?.requestId) {
      setRequestDetailId(payload.requestId);
      setCurrentFlow('request_detail');
    } else if (flow === 'removal') {
      setCurrentFlow('removal_flow');
    } else {
      onAction(flow);
    }
  };

  const handleFlowComplete = () => {
    setCurrentFlow(null);
    setBreakdownInitialAsset(null);
    setJobDetailRequestId(null);
    setRequestDetailId(null);
  };

  const flowProps = {
    currentFlow,
    onFlowComplete: handleFlowComplete,
    breakdownInitialAsset,
    jobDetailRequestId,
    requestDetailId,
    handleAction,
    onNotificationListClose: fetchUnread
  };

  const count = unreadNotificationCount;

  if (role === UserRole.MEDICAL_OFFICER) {
    return wrapWithLayout(
      <RequesterDashboard role={role} onAction={handleAction} onLogout={onLogout} unreadCount={count} />,
      role,
      count,
      onAction,
      onLogout,
      flowProps
    );
  }
  if (role === UserRole.DRIVER_AMBULANCE) {
    return wrapWithLayout(<AmbulanceDashboard onAction={handleAction} onLogout={onLogout} />, role, count, onAction, onLogout, flowProps);
  }
  if (role === UserRole.BIOMED_ENGINEER || role === UserRole.TOW_TRUCK) {
    return wrapWithLayout(
      <ExecutorDashboard role={role} onAction={handleAction} onLogout={onLogout} unreadCount={count} />,
      role,
      count,
      onAction,
      onLogout,
      flowProps
    );
  }
  if (role === UserRole.APPROVER) {
    return wrapWithLayout(<ApproverDashboard onAction={handleAction} onLogout={onLogout} />, role, count, onAction, onLogout, flowProps);
  }
  if (role === UserRole.ADMIN_HOSPITAL || role === UserRole.SUPERADMIN) {
    return wrapWithLayout(<AdminHospitalDashboard onAction={handleAction} onLogout={onLogout} />, role, count, onAction, onLogout, flowProps);
  }
  if (role === UserRole.MECHANIC || role === UserRole.HEAD_MECHANIC) {
    const handleMechanicSelectJob = (id: string) => {
      handleAction('job_detail', { jobId: id });
      onSelectJob?.(id);
    };
    return wrapWithLayout(<MechanicDashboard onSelectJob={handleMechanicSelectJob} onLogout={onLogout} />, role, count, onAction, onLogout, flowProps);
  }

  return null;
}
