export type ScanStatus = "safe" | "unsafe" | "unknown" | "scanning" | "error";

export type ScanMode = "automatic" | "manual";

export interface ScanResult {
  status: ScanStatus;
  timestamp: number;
  url: string;
  error?: string;
}

export interface ExtensionSettings {
  apiKey: string;
  scanMode: ScanMode;
}

export interface ExtractedContent {
  visibleText: string;
  hiddenText: string;
  totalLength: number;
}

export interface MessageRequest {
  type:
    | "SCAN_PAGE"
    | "GET_STATUS"
    | "EXTRACT_CONTENT"
    | "UPDATE_BADGE"
    | "GET_SETTINGS"
    | "SAVE_SETTINGS";
  payload?: unknown;
}

export interface MessageResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}
