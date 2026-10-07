/* ────────────────────────────────────────────────────────────────
   IUPAC Vocabulary Companion - Safe Storage Wrapper
   ──────────────────────────────────────────────────────────────── */

const safeStorage = {
  getItem(key, defaultValue = null) {
    try {
      const val = localStorage.getItem(key);
      return val !== null ? val : defaultValue;
    } catch (e) {
      console.warn(`localStorage read failed for key "${key}":`, e);
      return defaultValue;
    }
  },
  setItem(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn(`localStorage write failed for key "${key}":`, e);
    }
  },
  removeItem(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn(`localStorage delete failed for key "${key}":`, e);
    }
  }
};
