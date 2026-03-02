import { apiClient } from './client';

export interface RoleOption {
  role_id: string;
  name: string;
}

export interface TeamStaffMember {
  id: string;
  name: string;
  username?: string;
  role: string;
  status: string;
  score: string;
  tasks: string;
}

export interface TeamSummary {
  activeStaff: number;
  efficiency: number;
  staff: TeamStaffMember[];
}

export async function getTeamSummary() {
  return apiClient.get<TeamSummary>('/team/summary');
}

export async function getRoles() {
  return apiClient.get<RoleOption[]>('/team/roles');
}

export async function createStaff(payload: {
  username: string;
  full_name: string;
  email: string;
  phone?: string;
  password: string;
  role_id: string;
}) {
  return apiClient.post<{ user_id: string; username: string; full_name: string; email?: string; phone?: string; status: string; roles: string[] }>(
    '/team/staff',
    payload
  );
}
