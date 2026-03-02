import { apiClient } from './client';

export type PendingApprovalType = 'Quotation' | 'Removal';

export interface PendingApprovalItem {
  id: string;
  asset: string;
  type: PendingApprovalType;
  priority: string;
  cost: string;
  requester: string;
  date: string;
  description?: string;
  replacement_id?: string;
  quotation_id?: string;
}

export interface GetPendingApprovalsParams {
  type?: 'all' | 'quotation' | 'removal';
  page?: number;
  limit?: number;
}

export interface GetPendingApprovalsResponse {
  data: PendingApprovalItem[];
  meta: {
    totalItems: number;
    currentPage: number;
    itemsPerPage: number;
    totalPages: number;
    totalAmount?: string;
  };
}

export async function getPendingApprovals(params?: GetPendingApprovalsParams) {
  const q = new URLSearchParams();
  if (params?.type) q.set('type', params.type);
  if (params?.page) q.set('page', String(params.page));
  if (params?.limit) q.set('limit', String(params.limit));
  const query = q.toString();
  return apiClient.get<GetPendingApprovalsResponse>(`/pending-approvals${query ? `?${query}` : ''}`);
}

export async function approveQuotation(quotationId: string) {
  return apiClient.post<{ success: boolean; message?: string }>(
    `/pending-approvals/quotation/${quotationId}/approve`,
    {}
  );
}

export async function rejectQuotation(quotationId: string, reason?: string) {
  return apiClient.post<{ success: boolean; message?: string }>(
    `/pending-approvals/quotation/${quotationId}/reject`,
    reason ? { reason } : {}
  );
}

export async function approveRemoval(replacementId: string) {
  return apiClient.post<{ success: boolean; message?: string }>(
    `/pending-approvals/removal/${replacementId}/approve`,
    {}
  );
}

export async function rejectRemoval(replacementId: string, reason?: string) {
  return apiClient.post<{ success: boolean; message?: string }>(
    `/pending-approvals/removal/${replacementId}/reject`,
    reason ? { reason } : {}
  );
}
