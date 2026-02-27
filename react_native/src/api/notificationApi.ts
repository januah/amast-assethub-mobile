import { apiClient } from './client';

export interface Notification {
  notification_id: number;
  user_id: string;
  tenant_id: string;
  entity_type?: string | null;
  entity_id?: string | null;
  channel: string;
  message: string;
  status: string;
  created_at: string;
  read_at: string | null;
}

export async function getNotifications(params?: { limit?: number; offset?: number }) {
  const q = new URLSearchParams();
  if (params?.limit != null) q.set('limit', String(params.limit));
  if (params?.offset != null) q.set('offset', String(params.offset));
  const suffix = q.toString() ? `?${q}` : '';
  return apiClient.get<Notification[]>(`/notifications${suffix}`);
}

export async function getUnreadCount() {
  return apiClient.get<{ count: number }>('/notifications/unread-count');
}

export async function markNotificationAsRead(id: string) {
  return apiClient.patch<{ success: boolean }>(`/notifications/${id}/read`, {});
}
