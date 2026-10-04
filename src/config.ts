import AsyncStorage from '@react-native-async-storage/async-storage';

export const DEFAULT_API_BASE_URL = 'https://hng15-shop-aleeyu.fly.dev';
const API_URL_STORAGE_KEY = '@novashop_api_base_url';

let currentApiUrl = DEFAULT_API_BASE_URL;

export async function getApiBaseUrl(): Promise<string> {
  try {
    const stored = await AsyncStorage.getItem(API_URL_STORAGE_KEY);
    if (stored && stored.trim().length > 0) {
      currentApiUrl = stored.trim().replace(/\/+$/, '');
      return currentApiUrl;
    }
  } catch (e) {
    console.warn('Failed to load API URL from storage:', e);
  }
  return DEFAULT_API_BASE_URL;
}

export async function setApiBaseUrl(url: string): Promise<void> {
  const cleanUrl = url.trim().replace(/\/+$/, '');
  currentApiUrl = cleanUrl || DEFAULT_API_BASE_URL;
  await AsyncStorage.setItem(API_URL_STORAGE_KEY, currentApiUrl);
}

export function getCurrentApiUrl(): string {
  return currentApiUrl;
}
