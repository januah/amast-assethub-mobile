import { apiClient } from './client';

export interface ApiAssetLocation {
  name?: string;
  type?: string;
  code?: string;
}

export interface ApiAssetDepartment {
  name?: string;
  code?: string;
}

export interface ApiAssetCategory {
  name?: string;
  code?: string;
}

export interface ApiAsset {
  asset_id: string;
  name: string;
  status: string;
  serial_number?: string;
  manufacturer?: string;
  model?: string;
  description?: string;
  location_id?: string;
  install_date?: string;
  warranty_expiry?: string;
  cost?: number;
  Location?: ApiAssetLocation;
  Department?: ApiAssetDepartment;
  Category?: ApiAssetCategory;
}

export interface GetAssetsResponse {
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  assets: ApiAsset[];
}

export async function getAssets(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) {
  const q = new URLSearchParams();
  if (params?.page) q.set('page', String(params.page));
  if (params?.limit) q.set('limit', String(params.limit));
  if (params?.search) q.set('search', params.search);
  if (params?.status) q.set('status', params.status.toUpperCase());
  const query = q.toString();
  return apiClient.get<GetAssetsResponse>(`/assets${query ? `?${query}` : ''}`);
}

export async function getAssetById(assetId: string) {
  return apiClient.get<ApiAsset>(`/assets/${encodeURIComponent(assetId)}`);
}

export interface AssignedVehicle {
  asset_id: string;
  name: string;
  serial_number?: string;
  manufacturer?: string;
  model?: string;
  status: string;
  location_id?: string;
  created_at?: string;
  Category?: ApiAssetCategory;
}

export interface GetAssignedVehiclesResponse {
  assignedVehicles: AssignedVehicle[];
}

export async function getAssignedVehicles() {
  return apiClient.get<GetAssignedVehiclesResponse>('/assets/assigned-vehicles');
}
