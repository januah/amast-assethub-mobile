import { apiClient } from './client';

export interface SubmitRemovalRequestParams {
  asset_id: string;
  reason: string;
  destination_location_id?: string;
}

export interface SubmitRemovalRequestResponse {
  success: boolean;
  data?: { removal_id?: number; asset_id?: string; created_at?: string };
  message?: string;
}

export async function submitRemovalRequest(params: SubmitRemovalRequestParams): Promise<SubmitRemovalRequestResponse> {
  const res = await apiClient.post<SubmitRemovalRequestResponse['data']>('/removal-requests', params) as SubmitRemovalRequestResponse;
  return res;
}
