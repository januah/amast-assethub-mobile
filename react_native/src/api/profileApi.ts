import { apiClient } from './client';

export interface ProfileSettings {
  push_notifications_enabled?: boolean;
}

export interface Profile {
  user_id: string;
  username: string;
  full_name?: string;
  email?: string;
  phone?: string;
  hospital_id?: string;
  hospital_name?: string;
  assigned_department_id?: number | null;
  assigned_department_name?: string | null;
  settings?: ProfileSettings;
}

export interface UpdateProfileParams {
  full_name?: string;
  email?: string;
  phone?: string;
  department_id?: number | null;
  settings?: ProfileSettings;
}

export async function getProfile() {
  return apiClient.get<Profile>('/profile');
}

export async function updateProfile(params: UpdateProfileParams) {
  return apiClient.patch<{ success: boolean; data?: Profile; message?: string }>('/profile', params);
}
