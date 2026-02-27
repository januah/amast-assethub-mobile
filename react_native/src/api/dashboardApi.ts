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
