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

export async function getAdminDashboardSummary() {
  return apiClient.get<AdminDashboardSummary>('/dashboard/admin-summary');
}
