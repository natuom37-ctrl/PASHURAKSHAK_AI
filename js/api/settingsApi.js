/**
 * PashuRakshak AI - Settings API Service
 * Manages user preferences, language, profile, and AI configuration
 */

const SETTINGS_STORAGE_KEY = 'pashurakshak_settings';

const DEFAULT_SETTINGS = {
  profile: {
    fullName: 'Shubham Koli',
    farmName: 'Koli Dairy & Livestock Farm',
    location: 'Pune Rural, Maharashtra',
    contactNumber: '+91 98220 12345',
    email: 'shubham.koli@farm.in',
    herdSize: '24 Cattle, 8 Buffaloes'
  },
  language: 'en',
  notifications: {
    emailAlerts: true,
    smsAlerts: true,
    outbreakWarning: true,
    weeklyReport: true
  },
  appearance: {
    theme: 'light',
    highContrast: false,
    compactTable: false,
    animations: true
  },
  aiPreferences: {
    confidenceThreshold: 85,
    autoSaveScreenings: true,
    backendUrl: (typeof window !== 'undefined' ? window.location.origin : ''),
    deepScanMode: true
  }
};

export const SettingsAPI = {
  getSettings() {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('Error reading settings:', e);
    }
    return DEFAULT_SETTINGS;
  },

  saveSettings(newSettings) {
    try {
      const current = this.getSettings();
      const merged = { ...current, ...newSettings };
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(merged));
      return merged;
    } catch (e) {
      console.warn('Error saving settings:', e);
      return DEFAULT_SETTINGS;
    }
  },

  updateSection(sectionName, sectionData) {
    const current = this.getSettings();
    current[sectionName] = { ...current[sectionName], ...sectionData };
    return this.saveSettings(current);
  }
};
