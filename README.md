![Pi Annotate](docs/pi-annotate.png)
# pi-annotate

Pi package. Adds `/annotate` command and `annotate` tool for browser-side visual annotation: element picking, inline notes, screenshots, and edit-capture handoff into Pi.

Repo root = package root. Important because Pi installs GitHub packages by cloning repo and reading root `package.json`.

## Install

From GitHub:

```bash
pi install git:github.com/magimetal/pi-annotate
# or
pi install https://github.com/magimetal/pi-annotate
```

Project-local install:

```bash
pi install -l git:github.com/magimetal/pi-annotate
```

From local checkout:

```bash
pi install /absolute/path/to/pi-annotate
# or project-local
pi install -l /absolute/path/to/pi-annotate
```

Reload or restart Pi after install.

## Prerequisites

Requires a Chromium-based browser (Google Chrome, Google Chrome for Testing, or Chromium) plus the bundled unpacked extension and native messaging host. Setup steps live in [Operator setup](#operator-setup).

## Use

Command:

```text
/annotate
/annotate https://example.com
```

Opens annotation mode on current browser tab. If current tab is restricted (`chrome://`, extension pages, similar), supplied URL opens in a new tab first.

Tool:

```text
annotate({ url?: string, timeout?: number })
```

Returns structured selectors, box model, accessibility data, screenshots, and edit-capture output when enabled.

In-browser controls:

| Action | How |
|--------|-----|
| Select element | Click on page |
| Cycle ancestors | Alt/⌥+scroll while hovering |
| Multi-select | Toggle "Multi" or Shift+click |
| Add comment | Type in note card textarea |
| Toggle screenshot | 📷 button in note card header |
| Reposition note | Drag by header |
| Scroll to element | Click selector in note card |
| Toggle note | Click numbered badge |
| Expand/collapse all | ▼/▲ buttons in toolbar |
| Toggle edit capture | "Etch" toggle in toolbar |
| Collapse panel | `−` in toolbar header; "Restore annotator" pill resumes picking |
| Toggle annotation UI | `⌘/Ctrl+Shift+P` |
| Close | `ESC` |

## Operator setup

### 1. Load browser extension

Open the extensions page in Google Chrome, Google Chrome for Testing, or Chromium. Enable **Developer mode**. Click **Load unpacked** and choose `chrome-extension/` from the installed package or local checkout. Click the **Pi Annotate** toolbar icon.

### 2. Install native host

Popup shows the extension ID. Copy the install command from the popup, then run from `chrome-extension/native/` inside the installed package or local checkout:

```bash
./install.sh <extension-id>
```

Installer writes the native messaging manifest for Google Chrome, Google Chrome for Testing, and Chromium on macOS, plus default and current config-home locations on supported Linux browsers. Fully quit and reopen the browser after install. Popup should show **Connected**.

## What gets captured

- **Element context**: selector, tag, id, classes, text, box model, attributes, accessibility data, key styles
- **Inline note cards**: draggable note UI with connectors, per-element comments, click-to-scroll, per-element screenshot toggles
- **Screenshots**: element crops with padding or full-page capture with numbered badges
- **Edit capture**: enable **Etch** to record inline-style changes, CSS rule edits, class changes, text edits, plus before/after screenshots
- **Restricted tab handling**: command/tool can open a supplied URL in a new tab when the current tab is `chrome://` or otherwise restricted

Debug mode adds computed styles, parent context, and CSS variables per element.

## Output shape

```markdown
## Page Annotation: https://example.com
**Viewport:** 1440×900

**Context:** Fix styling issues

### Selected Elements (2)

1. **button**
   - Selector: `#submit-btn`
   - ID: `submit-btn`
   - Classes: `btn, btn-primary`
   - Text: "Submit"
   - **Box Model:** 120×40 (content: 96×24, padding: 8 16, border: 1, margin: 0 8)
   - **Attributes:** type="submit", data-testid="submit"
   - **Styles:** display: flex, backgroundColor: rgb(59, 130, 246)
   - **Accessibility:** role=button, name="Submit", focusable=true, disabled=false
   - **Comment:** Make this blue with rounded corners

2. **div**
   - Selector: `.error-message`
   - Classes: `error-message, hidden`
   - Text: "Please fill required fields"
   - **Box Model:** 300×20 (content: 300×20, padding: 0, border: 0, margin: 0 0 8)
   - **Accessibility:** focusable=false, disabled=false
   - **Comment:** This should appear in red, not hidden

### Screenshots

- Element 1: /var/folders/.../pi-annotate-...-el1.png
- Element 2: /var/folders/.../pi-annotate-...-el2.png

## Edit Capture (2 changes, 35s)

### Inline Style Changes

**`#submit-btn`**
- `background-color`: `rgb(59, 130, 246)` → `rgb(37, 99, 235)`
- `border-radius`: added `8px`

### CSS Rule Changes

**`.btn-primary:hover`** (styles.css)
- `background-color`: `rgb(37, 99, 235)` → `rgb(29, 78, 216)`

### Before/After Screenshots

- Before: /var/folders/.../pi-annotate-...-before.png
- After: /var/folders/.../pi-annotate-...-after.png
```

## Architecture

```text
Pi Extension (extensions/annotate.ts)
    ↕ Unix Socket (/tmp/pi-annotate.sock)
Native Host (chrome-extension/native/host.cjs)
    ↕ Browser Native Messaging
Browser Extension (background.js → content.js)
```

Auth token generated per run at `/tmp/pi-annotate.token`. Socket and token files use `0600` permissions.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| UI does not appear | Refresh page, click extension icon, check service worker console |
| `restricted URL` error | Provide URL: `/annotate https://example.com` |
| Native host not connecting | Re-run install command from popup, fully restart browser |
| Extension ID mismatch | Copy popup command again, then rerun `./install.sh <extension-id>` |
| Socket errors | `ls -la /tmp/pi-annotate.sock` |

Native-host manifest paths to inspect:

- macOS Google Chrome: `~/Library/Application Support/Google/Chrome/NativeMessagingHosts/com.pi.annotate.json`
- macOS Google Chrome for Testing: `~/Library/Application Support/Google/ChromeForTesting/NativeMessagingHosts/com.pi.annotate.json`
- macOS Chromium: `~/Library/Application Support/Chromium/NativeMessagingHosts/com.pi.annotate.json`
- Linux Google Chrome default: `~/.config/google-chrome/NativeMessagingHosts/com.pi.annotate.json`
- Linux Google Chrome for Testing default: `~/.config/google-chrome-for-testing/NativeMessagingHosts/com.pi.annotate.json`
- Linux Chromium default: `~/.config/chromium/NativeMessagingHosts/com.pi.annotate.json`
- Custom Linux config root: `${CHROME_CONFIG_HOME:-${XDG_CONFIG_HOME:-$HOME/.config}}`

If a Linux browser uses a different config root, export `CHROME_CONFIG_HOME` or `XDG_CONFIG_HOME` before running the installer. Custom `--user-data-dir` layouts are not handled by the installer.

Useful logs:

```bash
tail -f /tmp/pi-annotate-host.log                    # native host
# chrome://extensions → Pi Annotate → service worker  # background
# DevTools on target page                              # content script
```

## Repo layout

```text
.
├── extensions/
│   ├── annotate.ts
│   ├── annotate-core.ts
│   └── annotate-types.ts
├── chrome-extension/
│   ├── background.js
│   ├── content.js
│   ├── popup.html
│   ├── popup.js
│   ├── manifest.json
│   ├── icons/
│   └── native/
│       ├── host.cjs
│       └── install.sh
├── docs/
│   └── pi-annotate.png
├── tests/
├── package.json
├── CHANGELOG.md
├── NOTICE.md
├── LICENSE
└── README.md
```

## Develop

Install deps:

```bash
npm install
```

Run quality gates:

```bash
npm run typecheck
npm test
npm run check
```

No build step. Edit `chrome-extension/content.js` or `chrome-extension/background.js` directly, then reload the extension at `chrome://extensions`. Pi extension TypeScript loads via jiti, so restart Pi after runtime changes.
