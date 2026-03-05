import { Platform } from 'react-native';

const getDefaultBaseUrl = () => {
  const envUrl = (typeof process !== 'undefined' && (process as { env?: { EXPO_PUBLIC_API_URL?: string } }).env?.EXPO_PUBLIC_API_URL);
  if (envUrl) return envUrl;
  if (Platform.OS === 'android') return 'http://10.0.2.2:5001';
  return 'http://localhost:5001';
};

export const DEFAULT_BASE_URL = getDefaultBaseUrl();

export const AVAILABLE_BASE_URLS: string[] = [
  'https://tassethub-api.amastsales-sandbox.com',
  'http://10.0.2.2:5001',
  'http://localhost:5001',
];

export const API_MOBILE_PREFIX = '/api/mobile/v1';
