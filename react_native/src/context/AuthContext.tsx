import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserRole } from '../types';
import { AuthUser, login as apiLogin, logout as apiLogout, getMe, refreshToken } from '../api/authApi';
import { apiClient } from '../api/client';

const STORAGE_ACCESS = '@assethub/accessToken';
const STORAGE_REFRESH = '@assethub/refreshToken';
const STORAGE_USER = '@assethub/user';

const API_ROLE_TO_USER_ROLE: Record<string, UserRole> = {
  superadmin: UserRole.SUPERADMIN,
  admin_hospital: UserRole.ADMIN_HOSPITAL,
  approver: UserRole.HOSPITAL_APPROVER,
  hospital_approver: UserRole.HOSPITAL_APPROVER,
  head_of_mechanic: UserRole.HEAD_MECHANIC,
  mechanic: UserRole.MECHANIC,
  driver_ambulance: UserRole.AMBULANCE_DRIVER,
  ambulance_driver: UserRole.AMBULANCE_DRIVER,
  installer: UserRole.INSTALLER,
  biomedical_engineer: UserRole.BIOMEDICAL_ENGINEER,
  tow_truck: UserRole.TOW_TRUCK,
  medical_officer: UserRole.MEDICAL_OFFICER,
  viewer: UserRole.VIEWER
};

function resolveRole(user: { role?: string; roles?: string[]; permissions?: string[] } | null): UserRole {
  const roleFromApi = user?.role || (Array.isArray(user?.roles) && user.roles.length > 0 ? user.roles[0] : null);
  if (roleFromApi) {
    const key = String(roleFromApi).toLowerCase().replace(/\s+/g, '_');
    if (API_ROLE_TO_USER_ROLE[key]) return API_ROLE_TO_USER_ROLE[key];
  }
  const p = new Set((user?.permissions || []).map((x) => String(x).toLowerCase()));
  if (p.has('admin') || p.has('superadmin')) return UserRole.SUPERADMIN;
  if (p.has('admin_hospital') || p.has('hospital_admin')) return UserRole.ADMIN_HOSPITAL;
  if (p.has('approver') || p.has('hospital_approver')) return UserRole.HOSPITAL_APPROVER;
  if (p.has('mechanic') || p.has('head_mechanic')) return UserRole.HEAD_MECHANIC;
  if (p.has('driver') || p.has('ambulance')) return UserRole.AMBULANCE_DRIVER;
  if (p.has('installer')) return UserRole.INSTALLER;
  if (p.has('biomedical') || p.has('tow_truck')) return UserRole.BIOMEDICAL_ENGINEER;
  if (p.has('medical_officer') || p.has('viewer')) return UserRole.MEDICAL_OFFICER;
  return UserRole.MEDICAL_OFFICER;
}

export interface AuthState {
  user: AuthUser | null;
  role: UserRole;
  accessToken: string | null;
  refreshTokenValue: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (usernameOrEmail: string, password: string) => Promise<{ success: boolean; message?: string }>;
  loginDemo: (role: UserRole) => void;
  logout: () => Promise<void>;
  setRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    role: UserRole.MEDICAL_OFFICER,
    accessToken: null,
    refreshTokenValue: null,
    isLoading: true,
    isAuthenticated: false
  });

  const persistAndSet = useCallback(
    (user: AuthUser | null, accessToken: string | null, refreshTokenValue: string | null, role?: UserRole) => {
      const r = role ?? resolveRole(user);
      setState({
        user,
        role: r,
        accessToken,
        refreshTokenValue,
        isLoading: false,
        isAuthenticated: !!(user && accessToken)
      });
      apiClient.setAccessToken(accessToken);
      if (accessToken) {
        AsyncStorage.setItem(STORAGE_ACCESS, accessToken);
      } else {
        AsyncStorage.removeItem(STORAGE_ACCESS);
      }
      if (refreshTokenValue) {
        AsyncStorage.setItem(STORAGE_REFRESH, refreshTokenValue);
      } else {
        AsyncStorage.removeItem(STORAGE_REFRESH);
      }
      if (user) {
        AsyncStorage.setItem(STORAGE_USER, JSON.stringify(user));
      } else {
        AsyncStorage.removeItem(STORAGE_USER);
      }
    },
    []
  );

  const login = useCallback(
    async (usernameOrEmail: string, password: string) => {
      setState((s) => ({ ...s, isLoading: true }));
      const isEmail = usernameOrEmail.includes('@');
      const params = isEmail
        ? { email: usernameOrEmail, password }
        : { username: usernameOrEmail, password };
      const res = await apiLogin(params);
      if (res.success && res.data) {
        persistAndSet(
          res.data.user,
          res.data.accessToken,
          res.data.refreshToken,
          resolveRole(res.data.user)
        );
        return { success: true };
      }
      setState((s) => ({ ...s, isLoading: false }));
      return { success: false, message: res.message || 'Login failed' };
    },
    [persistAndSet]
  );

  const loginDemo = useCallback((role: UserRole) => {
    persistAndSet(
      { id: 'demo', username: 'demo', full_name: 'Demo User', permissions: [] },
      'demo-token',
      null,
      role
    );
  }, [persistAndSet]);

  const logout = useCallback(async () => {
    if (state.accessToken !== 'demo-token') {
      await apiLogout(state.refreshTokenValue || undefined);
    }
    persistAndSet(null, null, null);
  }, [state.accessToken, state.refreshTokenValue, persistAndSet]);

  const setRole = useCallback((role: UserRole) => {
    setState((s) => ({ ...s, role }));
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [at, rt, userJson] = await Promise.all([
          AsyncStorage.getItem(STORAGE_ACCESS),
          AsyncStorage.getItem(STORAGE_REFRESH),
          AsyncStorage.getItem(STORAGE_USER)
        ]);
        if (cancelled) return;
        if (at && userJson) {
          apiClient.setAccessToken(at);
          const user = JSON.parse(userJson) as AuthUser;
          const res = await getMe();
          if (res.success && res.data) {
            persistAndSet(res.data, at, rt);
            return;
          }
          if (rt) {
            const refreshRes = await refreshToken(rt);
            if (refreshRes.success && refreshRes.data) {
              persistAndSet(user, refreshRes.data.accessToken, refreshRes.data.refreshToken);
              return;
            }
          }
        }
        persistAndSet(null, null, null);
      } catch {
        if (!cancelled) persistAndSet(null, null, null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [persistAndSet]);

  const value: AuthContextValue = {
    ...state,
    login,
    loginDemo,
    logout,
    setRole
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
