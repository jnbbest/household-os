/**
 * Local-First Google Sheets Sync Client for Household OS
 * Works with Vercel Environment Variable (VITE_GOOGLE_SHEET_URL)
 * or optional local in-app override.
 */

export type SyncStatus = 'connected' | 'syncing' | 'offline' | 'unconfigured';

const STORAGE_KEY_SETTINGS = 'household_os_settings';
const STORAGE_KEY_TASKS = 'household_os_tasks';
const STORAGE_KEY_MONEY = 'household_os_money';
const STORAGE_KEY_DOCS = 'household_os_docs';
const STORAGE_KEY_RESET = 'household_os_reset';
const STORAGE_KEY_ICE = 'household_os_ice';

export function getGoogleSheetUrl(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.googleSheetUrl && parsed.googleSheetUrl.trim()) {
        return parsed.googleSheetUrl.trim();
      }
    }
  } catch (e) {}

  // Fallback to Vercel Environment Variable
  const envUrl = import.meta.env.VITE_GOOGLE_SHEET_URL;
  return envUrl && typeof envUrl === 'string' ? envUrl.trim() : '';
}

export async function testConnection(url: string): Promise<boolean> {
  if (!url || !url.startsWith('https://script.google.com/macros/s/')) {
    return false;
  }
  try {
    const res = await fetch(`${url}?tab=Ownership`, { method: 'GET' });
    const data = await res.json();
    return data && data.status === 'success';
  } catch (e) {
    return false;
  }
}

export async function syncTabToSheet(tabName: 'Ownership' | 'Money_Pool' | 'Doc_Index' | 'Sunday_Reset', rows: any[]): Promise<boolean> {
  const url = getGoogleSheetUrl();
  if (!url) return false;

  try {
    await fetch(url, {
      method: 'POST',
      mode: 'no-cors', // Apps Script standard webhook mode
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tab: tabName,
        action: 'sync_tab',
        rows: rows
      })
    });
    return true;
  } catch (e) {
    console.warn(`[HouseholdOS] Sync to ${tabName} failed, queued locally:`, e);
    return false;
  }
}

// Local Storage Helpers
export function loadFromLocal<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (e) {
    return fallback;
  }
}

export function saveToLocal<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {}
}

export const KEYS = {
  SETTINGS: STORAGE_KEY_SETTINGS,
  TASKS: STORAGE_KEY_TASKS,
  MONEY: STORAGE_KEY_MONEY,
  DOCS: STORAGE_KEY_DOCS,
  RESET: STORAGE_KEY_RESET,
  ICE: STORAGE_KEY_ICE
};
