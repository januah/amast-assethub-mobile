import { apiClient } from './client';

export interface ReplacementAsset {
  asset_id: string;
  name?: string;
  serial_number?: string;
  model?: string;
  status?: string;
}

export interface Replacement {
  replacement_id: string;
  replacement_case_id?: string;
  asset_id: string;
  service_request_id?: string;
  loaner_asset_id?: string;
  active_loaner_id?: boolean;
  status: string;
  request_date?: string;
  approval_date?: string;
  completion_date?: string;
  responsible_pic_id?: string;
  deployment_notes?: string;
  created_at?: string;
  updated_at?: string;
  Asset?: ReplacementAsset;
  LoanerAsset?: ReplacementAsset;
  ServiceRequest?: {
    request_id: string;
    description?: string;
    Department?: { department_id?: string; name?: string; code?: string };
  };
  ReplacementEvents?: Array<{
    event_id: number;
    replacement_id: string;
    event_type: string;
    remarks?: string | null;
    performed_by: string;
    created_at: string;
    performed_by_name?: string | null;
  }>;
  ResponsiblePIC?: { user_id: string; full_name?: string };
}

export interface ReplacementListResponse {
  success: boolean;
  data?: Replacement[];
  meta?: {
    totalItems: number;
    currentPage: number;
    itemsPerPage: number;
    totalPages: number;
  };
}

export interface ReplacementDetailResponse {
  success: boolean;
  data?: Replacement;
}

export async function getReplacements(params?: {
  page?: number;
  limit?: number;
  q?: string;
  status?: string;
}): Promise<ReplacementListResponse> {
  const q = new URLSearchParams();
  if (params?.page != null) q.set('page', String(params.page));
  if (params?.limit != null) q.set('limit', String(params.limit));
  if (params?.q != null) q.set('q', params.q);
  if (params?.status != null) q.set('status', params.status);
  const suffix = q.toString() ? `?${q}` : '';
  return apiClient.get<ReplacementListResponse['data']>(`/replacements${suffix}`) as Promise<ReplacementListResponse>;
}

export async function getReplacementById(id: string): Promise<ReplacementDetailResponse> {
  return apiClient.get<Replacement>(`/replacements/${id}`) as Promise<ReplacementDetailResponse>;
}

export type AcknowledgeEventType = 'ACK_RECEIVED' | 'ORIGINAL_INSTALLED';

export async function acknowledgeReplacement(
  replacementId: string,
  eventType: AcknowledgeEventType,
  remarks?: string
): Promise<{ success: boolean; data?: Replacement; event?: { event_id: number }; message?: string }> {
  return apiClient.post<{ data: Replacement; event: { event_id: number } }>(
    `/replacements/${replacementId}/acknowledge`,
    { event_type: eventType, remarks: remarks || '' }
  ) as Promise<{ success: boolean; data?: Replacement; event?: { event_id: number }; message?: string }>;
}

export interface EligibleServiceRequest {
  request_id: string;
  asset_id: string;
  description?: string;
  created_at?: string;
  status?: string;
  Asset?: { asset_id: string; name?: string; serial_number?: string };
}

export interface AvailableLoanerAsset {
  asset_id: string;
  name?: string;
  serial_number?: string;
}

export interface CreateReplacementParams {
  service_request_id: string;
  loaner_asset_id: string;
  responsible_pic_id: string;
  expected_return_date?: string;
  deployment_notes?: string;
}

export async function getEligibleServiceRequests(params?: { q?: string; limit?: number }): Promise<{ success: boolean; data?: EligibleServiceRequest[] }> {
  const q = new URLSearchParams();
  if (params?.q != null) q.set('q', params.q);
  if (params?.limit != null) q.set('limit', String(params.limit));
  const suffix = q.toString() ? `?${q}` : '';
  return apiClient.get(`/replacements/eligible-requests${suffix}`) as Promise<{ success: boolean; data?: EligibleServiceRequest[] }>;
}

export async function getAvailableLoanerAssets(params?: { q?: string; limit?: number }): Promise<{ success: boolean; data?: AvailableLoanerAsset[] }> {
  const q = new URLSearchParams();
  if (params?.q != null) q.set('q', params.q);
  if (params?.limit != null) q.set('limit', String(params.limit));
  const suffix = q.toString() ? `?${q}` : '';
  return apiClient.get(`/replacements/available-loaners${suffix}`) as Promise<{ success: boolean; data?: AvailableLoanerAsset[] }>;
}

export async function createReplacement(params: CreateReplacementParams): Promise<{ success: boolean; data?: Replacement; message?: string }> {
  return apiClient.post<Replacement>('/replacements', params) as Promise<{ success: boolean; data?: Replacement; message?: string }>;
}
