import { Capacitor } from '@capacitor/core';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';

const STORAGE_PREFIX = 'promptquill_mobile:';
const memoryFallback = new Map();

const buildKey = (key) => `${STORAGE_PREFIX}${key}`;

const hasBrowserStorage = () =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const isNativeStorageAvailable = () =>
  typeof Capacitor.isNativePlatform === 'function'
    ? Capacitor.isNativePlatform()
    : ['android', 'ios'].includes(Capacitor.getPlatform());

const readBrowserFallback = (key) => {
  if (hasBrowserStorage()) {
    return window.localStorage.getItem(key);
  }

  return memoryFallback.get(key) ?? null;
};

const writeBrowserFallback = (key, value) => {
  if (hasBrowserStorage()) {
    window.localStorage.setItem(key, value);
    return;
  }

  memoryFallback.set(key, value);
};

const removeBrowserFallback = (key) => {
  if (hasBrowserStorage()) {
    window.localStorage.removeItem(key);
    return;
  }

  memoryFallback.delete(key);
};

export const secureStore = {
  async get(key) {
    const storageKey = buildKey(key);

    if (isNativeStorageAvailable()) {
      try {
        const { value } = await SecureStoragePlugin.get({ key: storageKey });
        return value ?? null;
      } catch {
        return null;
      }
    }

    return readBrowserFallback(storageKey);
  },

  async set(key, value) {
    const storageKey = buildKey(key);
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

    if (isNativeStorageAvailable()) {
      await SecureStoragePlugin.set({ key: storageKey, value: stringValue });
      return stringValue;
    }

    writeBrowserFallback(storageKey, stringValue);
    return stringValue;
  },

  async remove(key) {
    const storageKey = buildKey(key);

    if (isNativeStorageAvailable()) {
      try {
        await SecureStoragePlugin.remove({ key: storageKey });
      } catch {
        return false;
      }

      return true;
    }

    removeBrowserFallback(storageKey);
    return true;
  },

  async clear() {
    if (isNativeStorageAvailable()) {
      await SecureStoragePlugin.clear();
      return true;
    }

    if (hasBrowserStorage()) {
      const keysToDelete = Object.keys(window.localStorage).filter((key) =>
        key.startsWith(STORAGE_PREFIX)
      );
      keysToDelete.forEach((key) => window.localStorage.removeItem(key));
    }

    memoryFallback.clear();
    return true;
  },

  async keys() {
    if (isNativeStorageAvailable()) {
      const { value } = await SecureStoragePlugin.keys();
      return value
        .filter((key) => key.startsWith(STORAGE_PREFIX))
        .map((key) => key.replace(STORAGE_PREFIX, ''));
    }

    if (hasBrowserStorage()) {
      return Object.keys(window.localStorage)
        .filter((key) => key.startsWith(STORAGE_PREFIX))
        .map((key) => key.replace(STORAGE_PREFIX, ''));
    }

    return Array.from(memoryFallback.keys()).map((key) => key.replace(STORAGE_PREFIX, ''));
  },

  async getJSON(key, fallbackValue = null) {
    const value = await this.get(key);

    if (!value) return fallbackValue;

    try {
      return JSON.parse(value);
    } catch {
      return fallbackValue;
    }
  },

  async setJSON(key, value) {
    return this.set(key, JSON.stringify(value));
  }
};
