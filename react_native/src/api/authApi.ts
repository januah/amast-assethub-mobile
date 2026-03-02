import { apiClient } from './client';

export interface AuthUser {
  id: string;
  username: string;
  email?: string;
  full_name?: string;
  hospital_id?: string;
  tenant_id?: string;
  status?: string;
  permissions?: string[];
  roles?: string[];
  role?: string;
}

export interface AuthData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  sessionId?: string;
  user: AuthUser;
  permissions?: string[];
}

export interface LoginParams {
  username?: string;
  email?: string;
  password: string;
}

export async function login(params: LoginParams) {
  const res = await apiClient.post<AuthData>('/auth/login', params);
  if (res.success && res.data) {
    apiClient.setAccessToken(res.data.accessToken);
  }
  return res;
}

export async function logout(refreshToken?: string) {
  const res = await apiClient.post<{ message: string }>('/auth/logout', {
    refreshToken
  });
  apiClient.setAccessToken(null);
  return res;
}

export async function getMe() {
  return apiClient.get<AuthUser>('/auth/me');
}

export async function refreshToken(refreshToken: string) {
  const res = await apiClient.post<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: string;
    sessionId?: string;
  }>('/auth/refresh', { refreshToken });
  if (res.success && res.data) {
    apiClient.setAccessToken(res.data.accessToken);
  }
  return res;
}

export interface ChangePasswordParams {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export async function changePassword(params: ChangePasswordParams) {
  return apiClient.post<{ message: string }>('/auth/password/change', params);
}
