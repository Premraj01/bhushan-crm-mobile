import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

/**
 * Small key-value store for the session: the keychain/keystore on phones, and
 * localStorage in the web preview (expo-secure-store has no web implementation).
 */
export const storage = {
  get(key: string): Promise<string | null> {
    if (Platform.OS !== "web") return SecureStore.getItemAsync(key);
    try {
      return Promise.resolve(localStorage.getItem(key));
    } catch {
      return Promise.resolve(null);
    }
  },
  async set(key: string, value: string) {
    if (Platform.OS !== "web") return SecureStore.setItemAsync(key, value);
    try {
      localStorage.setItem(key, value);
    } catch {
      // Private mode or blocked storage: the session just won't survive a reload.
    }
  },
  async remove(key: string) {
    if (Platform.OS !== "web") return SecureStore.deleteItemAsync(key);
    try {
      localStorage.removeItem(key);
    } catch {
      // see set()
    }
  },
};
