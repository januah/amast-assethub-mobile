import { DEFAULT_BASE_URL, API_MOBILE_PREFIX } from '../config/api';
import { addRequestLog } from '../store/requestLogStore';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

class ApiClient {
  private baseUrl: string;
  private accessToken: string | null = null;

  constructor() {
    this.baseUrl = `${DEFAULT_BASE_URL}${API_MOBILE_PREFIX}`;
  }

  setBaseUrl(baseUrl: string) {
    const base = (baseUrl ?? '').replace(/\/$/, '') || DEFAULT_BASE_URL;
    this.baseUrl = `${base}${API_MOBILE_PREFIX}`;
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  getAccessToken() {
    return this.accessToken;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {})
    };
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }
    const config: RequestInit = {
      ...options,
      headers
    };
    const body = config.body;
    let bodyPayload: unknown = undefined;
    if (body && typeof body === 'string') {
      try { bodyPayload = JSON.parse(body); } catch { bodyPayload = body; }
    }
    console.log(`API ${config.method || 'GET'} ${url}`, bodyPayload !== undefined ? { body: bodyPayload } : '');
    try {
      const res = await fetch(url, config);
      const json = await res.json().catch(() => ({}));
      addRequestLog({
        method: config.method || 'GET',
        path,
        url,
        status: res.status,
        response: json,
      });
      if (!res.ok) {
        return {
          success: false,
          message: json.message || `Request failed: ${res.status}`,
          errors: json.errors
        };
      }
      return json;
    } catch (err: any) {
      addRequestLog({
        method: config.method || 'GET',
        path,
        url,
        error: err?.message || 'Network error',
      });
      return {
        success: false,
        message: err?.message || 'Network error'
      };
    }
  }

  get<T>(path: string) {
    return this.request<T>(path, { method: 'GET' });
  }

  post<T>(path: string, body?: object) {
    return this.request<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined
    });
  }

  put<T>(path: string, body?: object) {
    return this.request<T>(path, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined
    });
  }

  patch<T>(path: string, body?: object) {
    return this.request<T>(path, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined
    });
  }

  delete<T>(path: string) {
    return this.request<T>(path, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
