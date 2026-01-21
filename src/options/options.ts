import type { ExtensionSettings, MessageResponse, ScanMode } from "../types";

const form = document.getElementById("settings-form") as HTMLFormElement;
const apiKeyInput = document.getElementById("api-key") as HTMLInputElement;
const toggleVisibility = document.getElementById(
  "toggle-visibility"
) as HTMLButtonElement;
const eyeIcon = document.getElementById("eye-icon") as Element;
const eyeOffIcon = document.getElementById("eye-off-icon") as Element;
const messageEl = document.getElementById("message") as HTMLDivElement;

function showMessage(text: string, isError: boolean = false): void {
  messageEl.textContent = text;
  messageEl.classList.remove("hidden", "bg-green-50", "bg-red-50", "text-green-700", "text-red-700");

  if (isError) {
    messageEl.classList.add("bg-red-50", "text-red-700");
  } else {
    messageEl.classList.add("bg-green-50", "text-green-700");
  }

  setTimeout(() => {
    messageEl.classList.add("hidden");
  }, 3000);
}

function toggleApiKeyVisibility(): void {
  const isPassword = apiKeyInput.type === "password";
  apiKeyInput.type = isPassword ? "text" : "password";
  eyeIcon.classList.toggle("hidden", !isPassword);
  eyeOffIcon.classList.toggle("hidden", isPassword);
}

async function loadSettings(): Promise<void> {
  const response: MessageResponse = await chrome.runtime.sendMessage({
    type: "GET_SETTINGS",
  });

  if (response.success && response.data) {
    const settings = response.data as ExtensionSettings;
    apiKeyInput.value = settings.apiKey || "";

    const modeRadio = document.querySelector(
      `input[name="scanMode"][value="${settings.scanMode}"]`
    ) as HTMLInputElement;
    if (modeRadio) {
      modeRadio.checked = true;
    }
  }
}

async function saveSettings(event: Event): Promise<void> {
  event.preventDefault();

  const formData = new FormData(form);
  const apiKey = (formData.get("apiKey") as string)?.trim() || "";
  const scanMode = (formData.get("scanMode") as ScanMode) || "manual";

  if (!apiKey) {
    showMessage("Please enter an API key", true);
    apiKeyInput.focus();
    return;
  }

  try {
    const response: MessageResponse = await chrome.runtime.sendMessage({
      type: "SAVE_SETTINGS",
      payload: { apiKey, scanMode },
    });

    if (response.success) {
      showMessage("Settings saved successfully!");
    } else {
      showMessage(response.error || "Failed to save settings", true);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    showMessage(message, true);
  }
}

toggleVisibility.addEventListener("click", toggleApiKeyVisibility);
form.addEventListener("submit", saveSettings);

document.addEventListener("DOMContentLoaded", loadSettings);
