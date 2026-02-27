import { apiClient } from './client';

export interface PriorityItem {
  priority_id: number;
  code: string;
  name: string;
  default_response_minutes: number | null;
  default_resolution_minutes: number | null;
}

export async function getPriorities() {
  return apiClient.get<PriorityItem[]>('/priorities');
}
