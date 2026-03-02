import { apiClient } from './client';

export interface PPMAsset {
  asset_id: string;
  name?: string;
  serial_number?: string;
}

export interface PPMAppointment {
  appointment_id?: string;
  pm_schedule_id: string;
  tenant_id?: string;
  asset_id: string;
  service_type?: string;
  maintenance_type?: string;
  frequency?: string;
  scheduled_date?: string;
  next_due_date?: string;
  last_completed_date?: string;
  assigned_technician_id?: string;
  assigned_to?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  technician?: { user_id: string; full_name?: string; email?: string } | null;
  creator?: { user_id: string; full_name?: string; email?: string } | null;
  Asset?: PPMAsset | null;
}

export interface PPMListResponse {
  success?: boolean;
  data?: PPMAppointment[];
  total?: number;
  page?: number;
  limit?: number;
  pages?: number;
  meta?: { total?: number };
}

export async function getPpmAppointments(params?: {
  page?: number;
  limit?: number;
  status?: string;
  maintenance_type?: string;
}): Promise<PPMListResponse> {
  const q = new URLSearchParams();
  if (params?.page != null) q.set('page', String(params.page));
  if (params?.limit != null) q.set('limit', String(params.limit));
  if (params?.status) q.set('status', params.status);
  if (params?.maintenance_type) q.set('maintenance_type', params.maintenance_type);
  const suffix = q.toString() ? `?${q}` : '';
  return apiClient.get<PPMAppointment[]>(`/appointments${suffix}`) as Promise<PPMListResponse>;
}

export async function getPpmProposedDates(params?: { asset_id?: string; limit?: number }): Promise<{ success?: boolean; data?: PPMAppointment[]; meta?: { total?: number } }> {
  const q = new URLSearchParams();
  if (params?.asset_id) q.set('asset_id', params.asset_id);
  if (params?.limit != null) q.set('limit', String(params.limit));
  const suffix = q.toString() ? `?${q}` : '';
  return apiClient.get<PPMAppointment[]>(`/appointments/ppm/proposed-dates${suffix}`) as Promise<{ success?: boolean; data?: PPMAppointment[]; meta?: { total?: number } }>;
}

export async function getPpmAppointmentById(id: string): Promise<{ success?: boolean; data?: PPMAppointment; message?: string }> {
  const res = await apiClient.get<PPMAppointment>(`/appointments/${id}`) as PPMAppointment | { success: false; message: string };
  if (res && typeof res === 'object' && 'message' in res && !('pm_schedule_id' in res)) {
    return { success: false, message: (res as { message: string }).message };
  }
  return { success: true, data: res as PPMAppointment };
}

export async function confirmPpmSchedule(id: string): Promise<{ success?: boolean; message?: string; data?: PPMAppointment }> {
  return apiClient.post<{ data: PPMAppointment }>(`/appointments/ppm/${id}/confirm`) as Promise<{ success?: boolean; message?: string; data?: PPMAppointment }>;
}

export async function requestNewPpmDates(
  id: string,
  params?: { reason?: string; proposed_date?: string; proposed_time?: string }
): Promise<{ success?: boolean; message?: string; data?: PPMAppointment; request_meta?: { reason?: string } }> {
  return apiClient.post<{ data: PPMAppointment }>(`/appointments/ppm/${id}/request-new-dates`, params || {}) as Promise<{ success?: boolean; message?: string; data?: PPMAppointment; request_meta?: { reason?: string } }>;
}
