import { StorageBase } from './storage-base';

const memory = new Map();

const adapter = {
  getItem(key) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const value = window.localStorage.getItem(key);
        return value;
      }
    } catch {}
    return memory.has(key) ? memory.get(key) : null;
  },
  setItem(key, value) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, String(value));
        return;
      }
    } catch {}
    memory.set(key, String(value));
  },
  removeItem(key) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
        return;
      }
    } catch {}
    memory.delete(key);
  },
};

export const storage = new StorageBase(adapter);
storage.secureGet = async (key, fallback = null) => storage.getItem(key, fallback);
storage.secureSet = async (key, value) => storage.setItem(key, value);
storage.secureRemove = async (key) => storage.removeItem(key);

export function bootstrapStorage() {
  return storage;
}
