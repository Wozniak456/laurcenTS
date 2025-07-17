/**
 * Utility functions for localStorage operations
 */

export const localStorageUtils = {
  /**
   * Safely get a string value from localStorage
   * Returns the value as a string to preserve BigInt compatibility
   */
  getString: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return null;
    }
  },

  /**
   * Safely set a value in localStorage
   * Accepts any value that can be converted to string (including BigInt)
   */
  set: (key: string, value: string | number | bigint): void => {
    try {
      localStorage.setItem(key, value.toString());
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
    }
  },

  /**
   * Remove a key from localStorage
   */
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  },

  /**
   * Check if a key exists in localStorage
   */
  has: (key: string): boolean => {
    try {
      return localStorage.getItem(key) !== null;
    } catch (error) {
      console.error(`Error checking localStorage key "${key}":`, error);
      return false;
    }
  },
};
