import { apiClient } from './client';

export interface AdminDashboardSummary {
  hospitalUsers: number;
  totalAssets: number;
  openRequests: number;
  completedYtd: number;
  hospitalName: string;
  recentActivity: {
    type: string;
    id: string;
    title: string;
    meta: string;
    time: string;
  }[];
}

export interface RequesterDashboardSummary {
  fullName: string;
  hospitalName: string;
  departmentName: string;
  totalAssets: number;
  activeJobsCount: number;
  recentRequests: {
    id: string;
    asset: string;
    status: string;
    date: string;
  }[];
}

export async function getAdminDashboardSummary() {
  return apiClient.get<AdminDashboardSummary>('/dashboard/admin-summary');
}

export async function getRequesterDashboardSummary() {
  return apiClient.get<RequesterDashboardSummary>('/dashboard/requester-summary');
}

export interface ApproverDashboardSummary {
  hospitalName: string;
  pendingCount: number;
  priorityItems: {
    id: string;
    asset: string;
    desc: string;
    cost: string | null;
    priority: string;
    status: string;
  }[];
  approvalHistory: {
    id: string;
    title: string;
    meta: string;
    time: string;
  }[];
}

export async function getApproverDashboardSummary() {
  return apiClient.get<ApproverDashboardSummary>('/dashboard/approver-summary');
}

export interface ExecutorDashboardSummary {
  fullName: string;
  roleLabel: string;
  tenantName?: string;
  jobsTodayCount: number;
  pendingJobsCount: number;
  ppmTasksThisWeek: number;
  avgRating: number | null;
  activeJob: {
    id: string;
    title: string;
    location: string;
    status: string;
  } | null;
  recentActivity: {
    id: string;
    title: string;
    meta: string;
    time: string;
  }[];
}

export async function getExecutorDashboardSummary() {
  return apiClient.get<ExecutorDashboardSummary>('/dashboard/executor-summary');
}

export interface ExecutorAssignedTask {
  id: string;
  title: string;
  asset: string;
  type: 'PPM' | 'Breakdown';
  service_mode?: string | null;
  location: string;
  requester: string;
  priority: string;
  status: string;
  time: string;
  createdAt: string;
  updatedAt: string;
}

export async function getExecutorAssignedTasks() {
  return apiClient.get<ExecutorAssignedTask[]>('/dashboard/executor-assigned-tasks');
}
