import * as Keychain from 'react-native-keychain';

const SERVICE_NAME = 'com.zuraft.pnublace';

export const SecureStorage = {
  async setItem(key: string, value: string): Promise<boolean> {
    try {
      await Keychain.setGenericPassword(key, value, { service: `${SERVICE_NAME}.${key}` });
      return true;
    } catch {
      return false;
    }
  },

  async getItem(key: string): Promise<string | null> {
    try {
      const result = await Keychain.getGenericPassword({ service: `${SERVICE_NAME}.${key}` });
      if (result) {
        return result.password;
      }
      return null;
    } catch {
      return null;
    }
  },

  async removeItem(key: string): Promise<boolean> {
    try {
      await Keychain.resetGenericPassword({ service: `${SERVICE_NAME}.${key}` });
      return true;
    } catch {
      return false;
    }
  },

  async multiRemove(keys: string[]): Promise<boolean> {
    try {
      await Promise.all(keys.map((key) => this.removeItem(key)));
      return true;
    } catch {
      return false;
    }
  },
};
