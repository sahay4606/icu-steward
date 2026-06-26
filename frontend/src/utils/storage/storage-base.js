export class StorageBase {
  constructor(adapter) {
    this.adapter = adapter;
  }

  getItem(key, fallback = null) {
    try {
      const value = this.adapter.getItem(key);
      return value == null ? fallback : value;
    } catch {
      return fallback;
    }
  }

  setItem(key, value) {
    try {
      this.adapter.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }

  removeItem(key) {
    try {
      this.adapter.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }
}

export function AssertNoExtras(value, allowed = []) {
  if (!value || typeof value !== 'object') return true;
  return Object.keys(value).every((key) => allowed.includes(key));
}

export const StorageItemValue = {
  string: 'string',
  json: 'json',
};
