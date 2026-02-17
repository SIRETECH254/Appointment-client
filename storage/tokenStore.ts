import { Platform } from 'react-native';

type TokenKey = 'accessToken' | 'refreshToken';

async function getSecureStoreModule() {
  const mod = await import('expo-secure-store');
  return mod;
}

function getWebStorage(): Storage | null {
  try {
    if (typeof window === 'undefined') return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

export async function getToken(key: TokenKey): Promise<string | null> {
  if (Platform.OS === 'web') {
    const storage = getWebStorage();
    return storage?.getItem(key) ?? null;
  }
  const SecureStore = await getSecureStoreModule();
  return await SecureStore.getItemAsync(key);
}

export async function setToken(key: TokenKey, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    const storage = getWebStorage();
    storage?.setItem(key, value);
    return;
  }
  const SecureStore = await getSecureStoreModule();
  await SecureStore.setItemAsync(key, value);
}

export async function deleteToken(key: TokenKey): Promise<void> {
  if (Platform.OS === 'web') {
    const storage = getWebStorage();
    storage?.removeItem(key);
    return;
  }
  const SecureStore = await getSecureStoreModule();
  await SecureStore.deleteItemAsync(key);
}

