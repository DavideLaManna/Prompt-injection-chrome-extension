import type {
  ScanStatus,
  ScanResult,
  MessageRequest,
  MessageResponse,
  ExtractedContent,
  ScanMode,
} from "../types";
import {
  getSettings,
  saveSettings,
  getCurrentScan,
  saveCurrentScan,
  clearCurrentScan,
} from "../lib/storage";
import { analyzeContent } from "../lib/api";

async function updateBadge(status: ScanStatus): Promise<void> {
  const badgeConfig: Record<ScanStatus, { text: string; color: string }> = {
    safe: { text: "✓", color: "#22c55e" },
    unsafe: { text: "!", color: "#ef4444" },
    unknown: { text: "?", color: "#6b7280" },
    scanning: { text: "...", color: "#3b82f6" },
    error: { text: "×", color: "#f97316" },
  };

  const config = badgeConfig[status];
  await chrome.action.setBadgeText({ text: config.text });
  await chrome.action.setBadgeBackgroundColor({ color: config.color });
}

function extractPageContentFunction(): ExtractedContent {
  function isElementHidden(element: Element): boolean {
    const style = window.getComputedStyle(element);

    if (style.display === "none" || style.visibility === "hidden") {
      return true;
    }

    const fontSize = parseFloat(style.fontSize);
    if (fontSize < 1) {
      return true;
    }

    if (style.opacity === "0") {
      return true;
    }

    const color = style.color;
    const bgColor = style.backgroundColor;
    if (
      color &&
      bgColor &&
      color === bgColor &&
      bgColor !== "rgba(0, 0, 0, 0)"
    ) {
      return true;
    }

    const rect = element.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (
      rect.right < 0 ||
      rect.bottom < 0 ||
      rect.left > viewportWidth ||
      rect.top > viewportHeight
    ) {
      if (rect.width > 0 && rect.height > 0) {
        return true;
      }
    }

    if (rect.width === 0 || rect.height === 0) {
      return true;
    }

    if (
      style.clip === "rect(0px, 0px, 0px, 0px)" ||
      style.clipPath === "inset(100%)"
    ) {
      return true;
    }

    if (element.getAttribute("aria-hidden") === "true") {
      return true;
    }

    const parent = element.parentElement;
    if (parent && parent !== document.body) {
      return isElementHidden(parent);
    }

    return false;
  }

  function extractTextFromElement(element: Element): {
    visible: string;
    hidden: string;
  } {
    let visible = "";
    let hidden = "";

    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;

        const tagName = parent.tagName.toLowerCase();
        if (["script", "style", "noscript", "template"].includes(tagName)) {
          return NodeFilter.FILTER_REJECT;
        }

        const text = node.textContent?.trim();
        if (!text) return NodeFilter.FILTER_REJECT;

        return NodeFilter.FILTER_ACCEPT;
      },
    });

    let node: Node | null;
    while ((node = walker.nextNode())) {
      const text = node.textContent?.trim();
      if (!text) continue;

      const parent = node.parentElement;
      if (!parent) continue;

      if (isElementHidden(parent)) {
        hidden += text + " ";
      } else {
        visible += text + " ";
      }
    }

    return { visible: visible.trim(), hidden: hidden.trim() };
  }

  function extractHiddenAttributes(): string {
    const hiddenTexts: string[] = [];
    const elements = document.querySelectorAll("*");

    elements.forEach((el) => {
      const attrs = [
        "alt",
        "title",
        "aria-label",
        "data-content",
        "placeholder",
      ];
      attrs.forEach((attr) => {
        const value = el.getAttribute(attr);
        if (value && isElementHidden(el)) {
          hiddenTexts.push(value);
        }
      });

      Array.from(el.attributes).forEach((attr) => {
        if (attr.name.startsWith("data-") && attr.value.length > 50) {
          if (
            attr.value.toLowerCase().includes("ignore") ||
            attr.value.toLowerCase().includes("instruction") ||
            attr.value.toLowerCase().includes("prompt")
          ) {
            hiddenTexts.push(attr.value);
          }
        }
      });
    });

    return hiddenTexts.join(" ");
  }

  function extractHtmlComments(): string {
    const comments: string[] = [];
    const walker = document.createTreeWalker(
      document.documentElement,
      NodeFilter.SHOW_COMMENT
    );

    let node: Node | null;
    while ((node = walker.nextNode())) {
      const text = node.textContent?.trim();
      if (text && text.length > 10) {
        comments.push(text);
      }
    }

    return comments.join(" ");
  }

  const textContent = extractTextFromElement(document.body);
  const hiddenAttributes = extractHiddenAttributes();
  const htmlComments = extractHtmlComments();

  const hiddenText = [textContent.hidden, hiddenAttributes, htmlComments]
    .filter(Boolean)
    .join(" ")
    .trim();

  return {
    visibleText: textContent.visible,
    hiddenText: hiddenText,
    totalLength: textContent.visible.length + hiddenText.length,
  };
}

async function extractPageContent(tabId: number): Promise<ExtractedContent> {
  const results = await chrome.scripting.executeScript({
    target: { tabId },
    func: extractPageContentFunction,
  });

  if (!results || results.length === 0 || !results[0].result) {
    throw new Error("Failed to extract page content");
  }

  return results[0].result as ExtractedContent;
}

async function scanPage(tabId: number, url: string): Promise<ScanResult> {
  const settings = await getSettings();

  if (!settings.apiKey) {
    return {
      status: "error",
      timestamp: Date.now(),
      url,
      error: "API key not configured",
    };
  }

  await updateBadge("scanning");

  try {
    const content = await extractPageContent(tabId);

    if (content.totalLength === 0) {
      const result: ScanResult = {
        status: "safe",
        timestamp: Date.now(),
        url,
      };
      await saveCurrentScan(result);
      await updateBadge("safe");
      return result;
    }

    const isUnsafe = await analyzeContent(
      content.visibleText,
      content.hiddenText,
      settings.apiKey
    );

    const result: ScanResult = {
      status: isUnsafe ? "unsafe" : "safe",
      timestamp: Date.now(),
      url,
    };

    await saveCurrentScan(result);
    await updateBadge(result.status);
    return result;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    const result: ScanResult = {
      status: "error",
      timestamp: Date.now(),
      url,
      error: errorMessage,
    };
    await saveCurrentScan(result);
    await updateBadge("error");
    return result;
  }
}

chrome.runtime.onMessage.addListener(
  (
    request: MessageRequest,
    _sender,
    sendResponse: (response: MessageResponse) => void
  ) => {
    (async () => {
      try {
        switch (request.type) {
          case "SCAN_PAGE": {
            const [tab] = await chrome.tabs.query({
              active: true,
              currentWindow: true,
            });
            if (!tab?.id || !tab.url) {
              sendResponse({ success: false, error: "No active tab found" });
              return;
            }
            const result = await scanPage(tab.id, tab.url);
            sendResponse({ success: true, data: result });
            break;
          }

          case "GET_STATUS": {
            const scan = await getCurrentScan();
            sendResponse({ success: true, data: scan });
            break;
          }

          case "UPDATE_BADGE": {
            const status = request.payload as ScanStatus;
            await updateBadge(status);
            sendResponse({ success: true });
            break;
          }

          case "GET_SETTINGS": {
            const settings = await getSettings();
            sendResponse({ success: true, data: settings });
            break;
          }

          case "SAVE_SETTINGS": {
            await saveSettings(
              request.payload as { apiKey?: string; scanMode?: ScanMode }
            );
            sendResponse({ success: true });
            break;
          }

          default:
            sendResponse({ success: false, error: "Unknown message type" });
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        sendResponse({ success: false, error: errorMessage });
      }
    })();

    return true;
  }
);

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    await clearCurrentScan();
    await updateBadge("unknown");

    const settings = await getSettings();
    if (settings.scanMode === "automatic" && settings.apiKey) {
      await scanPage(tabId, tab.url);
    }
  }
});

chrome.tabs.onActivated.addListener(async () => {
  const scan = await getCurrentScan();
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (scan && tab?.url === scan.url) {
    await updateBadge(scan.status);
  } else {
    await clearCurrentScan();
    await updateBadge("unknown");
  }
});
