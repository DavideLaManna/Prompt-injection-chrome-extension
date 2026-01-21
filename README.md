# Prompt Injection Detector

A Chrome extension that detects hidden prompt injections in web pages to protect against AI manipulation attacks.

## Features

- **Hidden Text Detection:** Scans for text hidden via CSS (`display: none`, `visibility: hidden`, zero-size fonts, matching colors, off-screen positioning)
- **AI-Powered Analysis:** Uses GPT-5-nano via OpenRouter API to identify prompt injection patterns
- **Two Scan Modes:**
  - **Manual:** Scan on-demand by clicking the extension icon
  - **Automatic:** Silently scan every page and warn only if unsafe
- **Visual Feedback:** Badge indicator shows scan status at a glance (green = safe, red = unsafe)

## Installation

### From Source (Development)

```bash
# Clone the repository
git clone <repo-url>
cd prompt-injection-detector

# Install dependencies
npm install

# Build the extension
npm run build

# Load in Chrome:
# 1. Go to chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select the dist/ folder
```

### From Chrome Web Store

Coming soon.

## Configuration

1. Click the extension icon
2. Click "Settings" or right-click the icon → Options
3. Enter your [OpenRouter API key](https://openrouter.ai/keys)
4. Select your preferred scan mode (Manual or Automatic)
5. Click "Save Settings"

## Usage

### Manual Mode (Default)

1. Navigate to any web page
2. Click the extension icon
3. Click "Scan Now"
4. View the result: Safe (green) or Unsafe (red)

### Automatic Mode

1. Enable Automatic mode in Settings
2. Browse normally - pages are scanned automatically
3. Badge turns red if a prompt injection is detected

## Development

```bash
npm run dev        # Development mode with hot reload
npm run build      # Production build
npm run typecheck  # Type checking
npm run lint       # Linting
npm run package    # Create ZIP for Chrome Web Store
```

## Tech Stack

- TypeScript 5.7
- Vite 6.x + CRXJS
- Tailwind CSS 4.x
- Manifest V3
- ESLint 9.x + Prettier

---

# Next Steps for Chrome Web Store Publication

## 1. Create Developer Account

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Pay the one-time $5 registration fee
3. Verify your identity

## 2. Prepare Store Assets

### Required Assets

| Asset | Size | Notes |
|-------|------|-------|
| Icon | 128x128 | Already generated in `icons/` |
| Screenshot 1 | 1280x800 or 640x400 | Popup showing "Safe" status |
| Screenshot 2 | 1280x800 or 640x400 | Popup showing "Unsafe" status |
| Screenshot 3 | 1280x800 or 640x400 | Settings page |
| Promotional tile (small) | 440x280 | Optional but recommended |

### Screenshot Suggestions

1. **Safe scan result:** Show the popup with green "Safe" status on a clean website
2. **Unsafe detection:** Show the popup with red "Unsafe" status (create a test page with hidden prompt injection)
3. **Settings page:** Show the options page with API key field and mode toggle
4. **Badge indicator:** Show browser with extension badge visible

## 3. Write Store Listing

### Short Description (132 chars max)

```
Detect hidden prompt injections in web pages. Protect yourself from AI manipulation attacks with automatic or manual scanning.
```

### Detailed Description

```
Prompt Injection Detector scans web pages for hidden text that could manipulate AI systems.

HOW IT WORKS
• Scans visible and hidden text on any webpage
• Uses AI to detect prompt injection patterns
• Shows results via badge: green (safe), red (unsafe)

WHAT IT DETECTS
• Hidden text (display:none, visibility:hidden)
• Zero-size or invisible fonts
• Text matching background colors
• Off-screen positioned content
• Suspicious HTML comments

TWO SCANNING MODES
• Manual: Click to scan when you want
• Automatic: Scans every page, warns only on threats

PRIVACY-FOCUSED
• Your API key stays in your browser
• No data sent to third parties except OpenRouter for analysis
• No browsing history stored

REQUIREMENTS
• OpenRouter API key (get one free at openrouter.ai)
• Chrome 120 or higher

Perfect for AI researchers, security professionals, and privacy-conscious users.
```

## 4. Create Privacy Policy

Create a privacy policy page (can be a GitHub gist or simple webpage) covering:

```markdown
# Privacy Policy for Prompt Injection Detector

Last updated: [DATE]

## Data Collection
- This extension does NOT collect personal data
- This extension does NOT store browsing history
- This extension does NOT track users

## Data Processing
- Page content is sent to OpenRouter API for analysis
- Only text content is sent, not images or media
- API calls are made directly from your browser
- Your API key is stored locally in Chrome storage

## Third-Party Services
- OpenRouter (openrouter.ai) - AI analysis provider
- See OpenRouter's privacy policy: https://openrouter.ai/privacy

## Data Storage
- API key: Stored locally in chrome.storage.local
- Scan results: Stored temporarily, cleared on navigation
- No data is synced across devices

## Contact
[Your email]
```

Host this at a public URL (GitHub Pages, Gist, or your website).

## 5. Upload to Chrome Web Store

1. Run `npm run package` to create `prompt-injection-detector.zip`
2. Go to Developer Dashboard → Items → New Item
3. Upload the ZIP file
4. Fill in store listing details
5. Add screenshots and promotional images
6. Paste privacy policy URL
7. Select category: "Productivity" or "Developer Tools"
8. Submit for review

## 6. Review Process

- Initial review typically takes 1-3 business days
- Common rejection reasons:
  - Missing privacy policy
  - Excessive permissions
  - Misleading description
  - Poor quality screenshots

## 7. Post-Publication

- [ ] Monitor reviews and respond to feedback
- [ ] Set up error tracking (optional)
- [ ] Plan feature updates based on user requests
- [ ] Consider adding rate limiting to prevent API abuse

---

## Future Enhancements (Ideas)

- [ ] Local ML model for offline detection
- [ ] Whitelist/blacklist for trusted sites
- [ ] Detailed breakdown of detected patterns
- [ ] Export scan reports
- [ ] Firefox/Edge ports
- [ ] Team/enterprise features

## License

MIT
