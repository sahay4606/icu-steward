import * as SecureStore from 'expo-secure-store';

import { StorageBase } from './storage-base';

const memory = new Map();

const adapter = {
  getItem(key) {
    const value = memory.has(key) ? memory.get(key) : null;
    return value;
  },
  setItem(key, value) {
    memory.set(key, String(value));
  },
  removeItem(key) {
    memory.delete(key);
  },
};

export const storage = new StorageBase(adapter);

storage.secureGet = async (key, fallback = null) => {
  try {
    const value = await SecureStore.getItemAsync(key);
    return value == null ? fallback : value;
  } catch {
    return fallback;
  }
};

storage.secureSet = async (key, value) => {
  try {
    await SecureStore.setItemAsync(key, String(value));
    return true;
  } catch {
    return false;
  }
};

storage.secureRemove = async (key) => {
  try {
    await SecureStore.deleteItemAsync(key);
    return true;
  } catch {
    return false;
  }
};

export function bootstrapStorage() {
  return storage;
}
