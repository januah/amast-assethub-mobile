import { apiClient } from './client';

export type ServiceRequestStatus =
  | 'OPEN'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'IN_PROGRESS'
  | 'WAITING'
  | 'AWAITING_QUOTATION'
  | 'AWAITING_PAYMENT'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED';

export interface StatusHistoryItem {
  history_id: number;
  from_status: string;
  to_status: string;
  changed_at: string;
  comments?: string;
  changedBy?: { user_id: string; username?: string; full_name?: string };
}

export interface ServiceRequestItem {
  request_id: string;
  asset_id?: string;
  description?: string;
  status: ServiceRequestStatus;
  created_at?: string;
  service_mode?: string;
  requester?: { user_id: string; username?: string; full_name?: string };
  Asset?: { asset_id: string; name?: string; serial_number?: string };
  Priority?: { priority_id: number; name?: string };
  ServiceRequestStatusHistories?: StatusHistoryItem[];
}

export interface GetServiceRequestsParams {
  page?: number;
  limit?: number;
  status?: ServiceRequestStatus;
  q?: string;
  asset_id?: string;
}

export interface GetServiceRequestsResponse {
  data: ServiceRequestItem[];
  meta: { totalItems: number; currentPage: number; itemsPerPage: number; totalPages: number };
}

export async function getServiceRequests(params?: GetServiceRequestsParams) {
  const q = new URLSearchParams();
  if (params?.page) q.set('page', String(params.page));
  if (params?.limit) q.set('limit', String(params.limit));
  if (params?.status) q.set('status', params.status.toUpperCase());
  if (params?.q) q.set('q', params.q);
  if (params?.asset_id) q.set('asset_id', params.asset_id);
  const query = q.toString();
  return apiClient.get<GetServiceRequestsResponse>(`/service-requests${query ? `?${query}` : ''}`);
}

export async function getServiceRequestById(requestId: string) {
  return apiClient.get<ServiceRequestItem>(`/service-requests/${encodeURIComponent(requestId)}`);
}

export interface CreateBreakdownParams {
  asset_id: string;
  description: string;
  location?: string;
  priority?: 'Normal' | 'Urgent' | 'Critical';
}

export interface CreateBreakdownResponse {
  success: boolean;
  data?: { request_id: string };
  request_id?: string;
  message?: string;
}

export async function createBreakdownRequest(params: CreateBreakdownParams) {
  return apiClient.post<CreateBreakdownResponse>('/service-requests', params);
}

export interface UpdateStatusParams {
  status: 'IN_PROGRESS' | 'COMPLETED' | 'WAITING';
  notes?: string;
}

export async function updateServiceRequestStatus(requestId: string, params: UpdateStatusParams) {
  return apiClient.patch<ServiceRequestItem>(`/service-requests/${encodeURIComponent(requestId)}/status`, params);
}

export async function getServiceRequestStatusHistory(requestId: string) {
  return apiClient.get<StatusHistoryItem[]>(`/service-requests/${encodeURIComponent(requestId)}/status-history`);
}
