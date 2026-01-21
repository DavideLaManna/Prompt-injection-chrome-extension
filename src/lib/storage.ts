import type { ExtensionSettings, ScanResult, ScanMode } from "../types";

const SETTINGS_KEY = "settings";
const CURRENT_SCAN_KEY = "currentScan";

const DEFAULT_SETTINGS: ExtensionSettings = {
  apiKey: "",
  scanMode: "manual",
};

export async function getSettings(): Promise<ExtensionSettings> {
  const result = await chrome.storage.local.get(SETTINGS_KEY);
  return result[SETTINGS_KEY] ?? DEFAULT_SETTINGS;
}

export async function saveSettings(
  settings: Partial<ExtensionSettings>
): Promise<void> {
  const current = await getSettings();
  await chrome.storage.local.set({
    [SETTINGS_KEY]: { ...current, ...settings },
  });
}

export async function getApiKey(): Promise<string> {
  const settings = await getSettings();
  return settings.apiKey;
}

export async function saveApiKey(apiKey: string): Promise<void> {
  await saveSettings({ apiKey });
}

export async function getScanMode(): Promise<ScanMode> {
  const settings = await getSettings();
  return settings.scanMode;
}

export async function saveScanMode(scanMode: ScanMode): Promise<void> {
  await saveSettings({ scanMode });
}

export async function getCurrentScan(): Promise<ScanResult | null> {
  const result = await chrome.storage.local.get(CURRENT_SCAN_KEY);
  return result[CURRENT_SCAN_KEY] ?? null;
}

export async function saveCurrentScan(scan: ScanResult): Promise<void> {
  await chrome.storage.local.set({ [CURRENT_SCAN_KEY]: scan });
}

export async function clearCurrentScan(): Promise<void> {
  await chrome.storage.local.remove(CURRENT_SCAN_KEY);
}
