# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/claude-code) when working with this repository.

## Project Overview

**Prompt Injection Detector** is a Chrome extension that detects hidden prompt injections in web pages. It scans page content—including hidden text (CSS hidden elements, zero-size fonts, same-color text)—and uses GPT-5-nano via OpenRouter API to identify potential prompt injection attacks.

## Tech Stack

- **Language:** TypeScript 5.7
- **Build Tool:** Vite 6.x with CRXJS plugin
- **Styling:** Tailwind CSS 4.x
- **Extension Format:** Manifest V3
- **Linting:** ESLint 9.x (flat config)
- **Formatting:** Prettier

## Project Structure

```
src/
├── background/index.ts    # Service worker (main extension logic)
├── lib/
│   ├── api.ts             # OpenRouter API integration
│   └── storage.ts         # Chrome storage utilities
├── options/               # Settings page (API key, scan mode)
├── popup/                 # Extension popup UI
├── types/index.ts         # Shared TypeScript types
└── styles.css             # Tailwind CSS entry point
```

## Common Commands

```bash
npm run dev        # Start development mode with hot reload
npm run build      # Production build to dist/
npm run typecheck  # Run TypeScript type checking
npm run lint       # Run ESLint
npm run lint:fix   # Fix ESLint issues
npm run format     # Format code with Prettier
npm run icons      # Generate PNG icons from SVG
npm run package    # Build + create ZIP for Chrome Web Store
```

## Architecture Notes

### Content Extraction

The extension uses `chrome.scripting.executeScript` with an inline function (not a separate content script file) to extract page content. This approach:
- Avoids separate build configuration for content scripts
- Keeps all logic in the service worker bundle
- Uses the `func` parameter instead of `files`

### Hidden Text Detection

The extraction function detects hidden text via:
- `display: none` / `visibility: hidden`
- `font-size < 1px`
- `opacity: 0`
- Matching foreground/background colors
- Off-screen positioning (negative margins, absolute positioning)
- `clip: rect(0,0,0,0)` / `clip-path: inset(100%)`
- `aria-hidden="true"` elements
- HTML comments

### API Integration

Uses OpenRouter API with model `openai/gpt-5-nano`. The API key is stored in `chrome.storage.local` and provided by the user.

### Scan Modes

- **Manual:** User clicks extension icon → clicks "Scan Now"
- **Automatic:** Scans every page on load, updates badge silently

### Badge States

| Status | Badge | Color |
|--------|-------|-------|
| Safe | ✓ | Green (#22c55e) |
| Unsafe | ! | Red (#ef4444) |
| Unknown | ? | Gray (#6b7280) |
| Scanning | ... | Blue (#3b82f6) |
| Error | × | Orange (#f97316) |

## Testing Locally

1. Run `npm run build`
2. Open `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `dist/` folder

## Key Files for Changes

- **API Logic:** `src/lib/api.ts` - Modify prompt or model
- **Detection Logic:** `src/background/index.ts` - `extractPageContentFunction()`
- **UI:** `src/popup/` and `src/options/`
- **Permissions:** `manifest.json`
