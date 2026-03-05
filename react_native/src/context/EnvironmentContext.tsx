import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../api/client';
import { AVAILABLE_BASE_URLS, DEFAULT_BASE_URL } from '../config/api';

const STORAGE_BASE_URL = '@assethub/baseUrl';

interface EnvironmentContextValue {
  baseUrl: string;
  availableUrls: string[];
  setBaseUrl: (url: string) => Promise<void>;
}

const EnvironmentContext = createContext<EnvironmentContextValue | null>(null);

export function EnvironmentProvider({ children }: { children: React.ReactNode }) {
  const [baseUrl, setBaseUrlState] = useState<string>(DEFAULT_BASE_URL);
  const [loaded, setLoaded] = useState(false);

  const loadStored = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_BASE_URL);
      const url = (stored && stored.trim()) ? stored.trim() : DEFAULT_BASE_URL;
      setBaseUrlState(url);
      apiClient.setBaseUrl(url);
    } catch {
      setBaseUrlState(DEFAULT_BASE_URL);
      apiClient.setBaseUrl(DEFAULT_BASE_URL);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadStored();
  }, [loadStored]);

  const setBaseUrl = useCallback(async (url: string) => {
    const normalized = (url ?? '').trim().replace(/\/$/, '') || DEFAULT_BASE_URL;
    const prev = baseUrl.replace(/\/api\/mobile\/v1$/, '').replace(/\/$/, '');
    const next = normalized.replace(/\/api\/mobile\/v1$/, '').replace(/\/$/, '');
    const changed = prev !== next;
    await AsyncStorage.setItem(STORAGE_BASE_URL, normalized);
    setBaseUrlState(normalized);
    apiClient.setBaseUrl(normalized);
    if (changed) {
      Alert.alert(
        'Restart required',
        'Environment URL has been changed. Please restart the app for the change to take effect.',
        [{ text: 'OK' }]
      );
    }
  }, [baseUrl]);

  if (!loaded) return null;

  return (
    <EnvironmentContext.Provider
      value={{
        baseUrl,
        availableUrls: AVAILABLE_BASE_URLS,
        setBaseUrl,
      }}
    >
      {children}
    </EnvironmentContext.Provider>
  );
}

export function useEnvironment() {
  const ctx = useContext(EnvironmentContext);
  if (!ctx) throw new Error('useEnvironment must be used within EnvironmentProvider');
  return ctx;
}
