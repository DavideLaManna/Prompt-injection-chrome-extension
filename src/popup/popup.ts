import type {
  ScanStatus,
  ScanResult,
  MessageResponse,
  ExtensionSettings,
} from "../types";

const statusContainer = document.getElementById(
  "status-container"
) as HTMLDivElement;
const statusIcon = document.getElementById("status-icon") as HTMLDivElement;
const statusText = document.getElementById("status-text") as HTMLParagraphElement;
const statusDetail = document.getElementById(
  "status-detail"
) as HTMLParagraphElement;
const errorContainer = document.getElementById(
  "error-container"
) as HTMLDivElement;
const errorText = document.getElementById("error-text") as HTMLParagraphElement;
const scanButton = document.getElementById("scan-button") as HTMLButtonElement;
const scanButtonText = document.getElementById(
  "scan-button-text"
) as HTMLSpanElement;
const scanIcon = document.getElementById("scan-icon") as Element;
const modeIndicator = document.getElementById(
  "mode-indicator"
) as HTMLSpanElement;
const openSettings = document.getElementById(
  "open-settings"
) as HTMLAnchorElement;
const settingsLink = document.getElementById(
  "settings-link"
) as HTMLAnchorElement;

const statusConfig: Record<
  ScanStatus,
  {
    icon: string;
    text: string;
    bgClass: string;
    iconBgClass: string;
  }
> = {
  safe: {
    icon: "✓",
    text: "Safe",
    bgClass: "bg-green-50",
    iconBgClass: "bg-green-500 text-white",
  },
  unsafe: {
    icon: "!",
    text: "Unsafe",
    bgClass: "bg-red-50",
    iconBgClass: "bg-red-500 text-white",
  },
  unknown: {
    icon: "?",
    text: "Not Scanned",
    bgClass: "bg-gray-100",
    iconBgClass: "bg-gray-400 text-white",
  },
  scanning: {
    icon: "⟳",
    text: "Scanning...",
    bgClass: "bg-blue-50",
    iconBgClass: "bg-blue-500 text-white",
  },
  error: {
    icon: "×",
    text: "Error",
    bgClass: "bg-orange-50",
    iconBgClass: "bg-orange-500 text-white",
  },
};

function updateStatusUI(status: ScanStatus, detail?: string): void {
  const config = statusConfig[status];

  statusContainer.className = `rounded-lg p-4 text-center ${config.bgClass}`;
  statusIcon.className = `w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center text-2xl ${config.iconBgClass}`;
  statusIcon.textContent = config.icon;
  statusText.textContent = config.text;

  if (detail) {
    statusDetail.textContent = detail;
    statusDetail.classList.remove("hidden");
  } else {
    statusDetail.classList.add("hidden");
  }
}

function showError(message: string, showSettingsLink: boolean = false): void {
  errorText.textContent = message;
  errorContainer.classList.remove("hidden");
  settingsLink.classList.toggle("hidden", !showSettingsLink);
}

function hideError(): void {
  errorContainer.classList.add("hidden");
}

function setScanning(isScanning: boolean): void {
  scanButton.disabled = isScanning;

  if (isScanning) {
    scanButtonText.textContent = "Scanning...";
    scanIcon.classList.add("animate-spin");
    updateStatusUI("scanning");
  } else {
    scanButtonText.textContent = "Scan Now";
    scanIcon.classList.remove("animate-spin");
  }
}

async function loadCurrentStatus(): Promise<void> {
  const response: MessageResponse = await chrome.runtime.sendMessage({
    type: "GET_STATUS",
  });

  if (response.success && response.data) {
    const scan = response.data as ScanResult;
    updateStatusUI(scan.status, scan.error);

    if (scan.error) {
      showError(scan.error, scan.error.includes("API key"));
    }
  } else {
    updateStatusUI("unknown");
  }
}

async function loadSettings(): Promise<void> {
  const response: MessageResponse = await chrome.runtime.sendMessage({
    type: "GET_SETTINGS",
  });

  if (response.success && response.data) {
    const settings = response.data as ExtensionSettings;
    modeIndicator.textContent = `Mode: ${settings.scanMode === "automatic" ? "Automatic" : "Manual"}`;

    if (!settings.apiKey) {
      showError("API key not configured", true);
    }
  }
}

async function triggerScan(): Promise<void> {
  hideError();
  setScanning(true);

  try {
    const response: MessageResponse = await chrome.runtime.sendMessage({
      type: "SCAN_PAGE",
    });

    if (response.success && response.data) {
      const result = response.data as ScanResult;
      updateStatusUI(result.status, result.error);

      if (result.error) {
        showError(result.error, result.error.includes("API key"));
      }
    } else {
      updateStatusUI("error", response.error);
      showError(response.error || "Scan failed");
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    updateStatusUI("error", message);
    showError(message);
  } finally {
    setScanning(false);
  }
}

function openOptionsPage(): void {
  chrome.runtime.openOptionsPage();
}

scanButton.addEventListener("click", triggerScan);
openSettings.addEventListener("click", (e) => {
  e.preventDefault();
  openOptionsPage();
});
settingsLink.addEventListener("click", (e) => {
  e.preventDefault();
  openOptionsPage();
});

document.addEventListener("DOMContentLoaded", async () => {
  await loadSettings();
  await loadCurrentStatus();
});
