# PRD: Prompt Injection Detector Chrome Extension

## Introduction

A production-ready Chrome extension that detects hidden prompt injections in web pages. The extension scans page content—including hidden text (CSS hidden elements, zero-size fonts, same-color text)—and uses GPT-5-nano via OpenRouter API to identify potential prompt injection attacks. Users can choose between automatic scanning (background scan with warnings only on detection) or manual mode (on-demand scan with explicit safe/unsafe feedback). Visual feedback is provided through a colored badge on the extension icon.

## Goals

- Provide real-time protection against hidden prompt injection attacks in web pages
- Offer flexible scanning modes (automatic and manual) to suit different user preferences
- Deliver clear, immediate visual feedback via badge colors (green = safe, red = unsafe)
- Ensure production-ready quality for Chrome Web Store deployment
- Maintain user privacy by requiring users to provide their own OpenRouter API key

## User Stories

### US-001: Project Setup with Modern Tooling

**Description:** As a developer, I need a properly configured project structure so that the extension can be built, tested, and packaged for the Chrome Web Store.

**Acceptance Criteria:**

- [ ] Initialize project with TypeScript 5.x
- [ ] Configure Vite 6.x with CRXJS plugin for Chrome extension bundling
- [ ] Set up Manifest V3 configuration with required permissions (activeTab, storage, scripting)
- [ ] Configure ESLint 9.x with flat config and TypeScript support
- [ ] Add Prettier for code formatting
- [ ] Create build script that outputs production-ready extension to `dist/`
- [ ] Typecheck and lint pass with zero errors

### US-002: Content Script for Page Text Extraction

**Description:** As a user, I want the extension to extract all text content from a page, including hidden text, so that hidden prompt injections can be detected.

**Acceptance Criteria:**

- [ ] Content script extracts all visible text from the page
- [ ] Detects and extracts text from elements with `display: none` or `visibility: hidden`
- [ ] Detects text with `font-size: 0` or very small font sizes (< 1px)
- [ ] Detects text with matching foreground/background colors (camouflaged text)
- [ ] Detects text positioned off-screen (negative margins, absolute positioning outside viewport)
- [ ] Detects text in `aria-hidden="true"` elements
- [ ] Returns structured data distinguishing visible vs hidden text
- [ ] Typecheck passes

### US-003: OpenRouter API Integration

**Description:** As a developer, I need a service module to communicate with OpenRouter API using GPT-5-nano so that page content can be analyzed for prompt injections.

**Acceptance Criteria:**

- [ ] Create API service module with TypeScript types for request/response
- [ ] Implement function to send text content to OpenRouter API endpoint
- [ ] Use model `openai/gpt-5-nano` via OpenRouter
- [ ] Craft system prompt that instructs the model to detect prompt injection patterns
- [ ] Handle API errors gracefully (network errors, rate limits, invalid API key)
- [ ] Return boolean result (safe/unsafe) from analysis
- [ ] Typecheck passes

### US-004: Settings Page for API Key Configuration

**Description:** As a user, I want to enter my OpenRouter API key so that the extension can perform scans.

**Acceptance Criteria:**

- [ ] Create options page accessible from extension context menu
- [ ] Input field for OpenRouter API key with show/hide toggle
- [ ] Save button that stores API key in `chrome.storage.local`
- [ ] Validation that API key is not empty before saving
- [ ] Success feedback when API key is saved
- [ ] Load and display existing API key (masked) on page open
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-005: Scan Mode Toggle (Automatic/Manual)

**Description:** As a user, I want to choose between automatic and manual scanning modes so that I can control when scans occur.

**Acceptance Criteria:**

- [ ] Toggle switch in settings to select scan mode
- [ ] Automatic mode: scans every page on load, shows warning only if unsafe
- [ ] Manual mode: scans only when user clicks the extension icon
- [ ] Persist mode selection in `chrome.storage.local`
- [ ] Default to manual mode for new installations
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-006: Extension Popup UI

**Description:** As a user, I want a simple popup interface so that I can see scan results and trigger manual scans.

**Acceptance Criteria:**

- [ ] Popup opens when clicking extension icon
- [ ] Display current page scan status: "Safe", "Unsafe", or "Not scanned"
- [ ] "Scan Now" button to trigger manual scan (visible in both modes)
- [ ] Loading state while scan is in progress
- [ ] Error state if API key is not configured (with link to settings)
- [ ] Clean, minimal UI using Tailwind CSS 4.x
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-007: Badge Status Indicator

**Description:** As a user, I want to see the scan result at a glance via the extension icon badge so that I don't need to open the popup.

**Acceptance Criteria:**

- [ ] Green badge with "✓" when page is safe
- [ ] Red badge with "!" when page is unsafe (prompt injection detected)
- [ ] Gray badge with "?" when page has not been scanned
- [ ] Badge updates immediately after scan completes
- [ ] Badge resets when navigating to a new page
- [ ] Typecheck passes

### US-008: Automatic Scanning on Page Load

**Description:** As a user with automatic mode enabled, I want pages to be scanned automatically so that I'm protected without manual intervention.

**Acceptance Criteria:**

- [ ] When automatic mode is enabled, scan triggers on `document.onload`
- [ ] Scan runs in background without blocking page interaction
- [ ] Badge updates silently to green if safe (no popup/notification)
- [ ] Badge updates to red if unsafe
- [ ] Automatic scan skips if API key is not configured
- [ ] Typecheck passes

### US-009: Manual Scan Trigger

**Description:** As a user with manual mode enabled, I want to trigger a scan by clicking the extension icon so that I can check pages on demand.

**Acceptance Criteria:**

- [ ] Clicking extension icon opens popup with "Scan Now" button
- [ ] Clicking "Scan Now" initiates page scan
- [ ] Popup shows loading spinner during scan
- [ ] Result displays as "Safe" (green) or "Unsafe" (red) in popup
- [ ] Badge updates to reflect result
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-010: Production Build and Chrome Web Store Readiness

**Description:** As a developer, I need the extension to meet all Chrome Web Store requirements so that it can be published.

**Acceptance Criteria:**

- [ ] Manifest V3 compliant with all required fields (name, version, description, icons)
- [ ] Include 16x16, 48x48, and 128x128 icon sizes
- [ ] Privacy policy placeholder or link (required for extensions using remote APIs)
- [ ] No use of `eval()` or inline scripts (CSP compliant)
- [ ] Build produces a ZIP file ready for upload
- [ ] Extension loads without errors in Chrome
- [ ] All permissions are justified and minimal
- [ ] Typecheck and lint pass

## Functional Requirements

- FR-1: The extension must use Manifest V3 and be compatible with Chrome 120+
- FR-2: The content script must extract all text from the page, including hidden text (CSS hidden, zero-size font, camouflaged colors, off-screen positioning)
- FR-3: The extension must call OpenRouter API with model `openai/gpt-5-nano` to analyze extracted text
- FR-4: The user must be able to enter and save their OpenRouter API key in the settings page
- FR-5: The extension must support two scan modes: automatic (scan on page load) and manual (scan on user request)
- FR-6: The extension must display a colored badge on the icon: green (safe), red (unsafe), gray (not scanned)
- FR-7: The popup must display scan status and provide a "Scan Now" button
- FR-8: In automatic mode, the extension must scan silently and only alert (via badge) if unsafe
- FR-9: In manual mode, the popup must show explicit "Safe" or "Unsafe" status after scanning
- FR-10: The extension must handle API errors gracefully and display appropriate messages

## Non-Goals

- No scan history or logging of past results
- No detailed breakdown of detected injection patterns (only safe/unsafe)
- No cloud sync of settings between devices
- No support for browsers other than Chrome
- No offline scanning capability (requires API)
- No custom prompt injection pattern definitions by users
- No notification sounds or desktop notifications

## Design Considerations

- **Popup UI:** Minimal design with status indicator, scan button, and settings link
- **Color Scheme:** Use semantic colors—green (#22c55e) for safe, red (#ef4444) for unsafe, gray (#6b7280) for unknown
- **Icon:** Simple shield icon representing protection
- **Settings Page:** Single-page form with API key input and mode toggle
- **Typography:** System font stack for fast loading and native feel

## Technical Considerations

- **Build Tool:** Vite 6.x with CRXJS Vite Plugin for Manifest V3 support
- **Language:** TypeScript 5.x with strict mode enabled
- **Styling:** Tailwind CSS 4.x (compiled, no runtime)
- **State Management:** Chrome Storage API (`chrome.storage.local`)
- **API Client:** Native `fetch` API with TypeScript types
- **Content Script Injection:** Use `chrome.scripting.executeScript` for on-demand injection
- **Message Passing:** Chrome runtime messaging between popup, background, and content scripts
- **Bundle Size:** Target < 500KB total for fast installation

## Success Metrics

- Extension passes Chrome Web Store review on first submission
- Scan completes in under 3 seconds for typical web pages
- Zero runtime errors in production
- Badge correctly reflects scan status in all scenarios
- API key storage is secure and not exposed in page context

## Open Questions

- Should there be a rate limit on automatic scans to prevent excessive API usage?
- Should the extension show a first-run tutorial or onboarding flow?
- What should happen if a page has no extractable text content?
