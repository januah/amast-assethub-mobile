import { Platform } from 'react-native';

const getDefaultBaseUrl = () => {
  const envUrl = (typeof process !== 'undefined' && (process as { env?: { EXPO_PUBLIC_API_URL?: string } }).env?.EXPO_PUBLIC_API_URL);
  if (envUrl) return envUrl;
  if (Platform.OS === 'android') return 'http://10.0.2.2:3001';
  return 'http://localhost:3001';
};

export const DEFAULT_BASE_URL = getDefaultBaseUrl();

export const AVAILABLE_BASE_URLS: string[] = [
  'http://10.0.2.2:3001',
  'http://localhost:3001',
];

export const API_MOBILE_PREFIX = '/api/mobile/v1';
