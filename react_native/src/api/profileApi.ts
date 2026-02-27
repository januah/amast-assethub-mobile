import { apiClient } from './client';

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
}

export interface UpdateProfileParams {
  full_name?: string;
  email?: string;
  phone?: string;
  department_id?: number | null;
}

export async function getProfile() {
  return apiClient.get<Profile>('/profile');
}

export async function updateProfile(params: UpdateProfileParams) {
  return apiClient.patch<{ success: boolean; data?: Profile; message?: string }>('/profile', params);
}
