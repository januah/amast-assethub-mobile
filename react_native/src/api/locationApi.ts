import { apiClient } from './client';

export interface LocationItem {
  location_id: string;
  name: string;
  code?: string | null;
  type?: string | null;
  parent_location_id?: string | null;
  parent_name?: string | null;
  parent_code?: string | null;
}

export interface GetLocationsResponse {
  success: boolean;
  data?: LocationItem[];
  meta?: { totalItems: number };
}

export async function getLocations(params?: { search?: string; page?: number; limit?: number }): Promise<GetLocationsResponse> {
  const q = new URLSearchParams();
  if (params?.search) q.set('search', params.search);
  if (params?.page) q.set('page', String(params.page));
  if (params?.limit) q.set('limit', String(params.limit));
  const suffix = q.toString() ? `?${q}` : '';
  return apiClient.get<GetLocationsResponse['data']>(`/locations${suffix}`) as Promise<GetLocationsResponse>;
}
