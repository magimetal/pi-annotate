<p>
  <img src="https://raw.githubusercontent.com/magimetal/pi-annotate/main/banner.png" alt="Pi Annotate" width="1100">
</p>

# pi-annotate

Pi package. Ships `/annotate` command plus `annotate` tool for browser-side visual annotation, screenshots, inline note capture, and edit-capture handoff.

Repo root = package root. Important because `pi install` from git clones repo and reads root `package.json`.

Maintained repository: [`magimetal/pi-annotate`](https://github.com/magimetal/pi-annotate)

Upstream source and original developer: [`nicobailon/pi-annotate`](https://github.com/nicobailon/pi-annotate) by Nico Bailon.

Durable provenance stays in [`NOTICE.md`](NOTICE.md), [`LICENSE`](LICENSE), and package metadata.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![Browser](https://img.shields.io/badge/Browser-Chrome%20%7C%20Chromium-blue?style=for-the-badge)]()

Demo:
https://github.com/user-attachments/assets/115b10ca-86e8-4b1c-b8a4-492c68759c58

## Install

### From GitHub

```bash
pi install git:github.com/magimetal/pi-annotate
# or
pi install https://github.com/magimetal/pi-annotate
```

### Project-local install

```bash
pi install -l git:github.com/magimetal/pi-annotate
```

### From local checkout

```bash
pi install /absolute/path/to/pi-annotate
# or project-local
pi install -l /absolute/path/to/pi-annotate
```

`npm:pi-annotate` not advertised here. Maintained npm publish surface not confirmed.

Reload or restart Pi after install.

## Command

```text
/annotate
/annotate https://x.com
```

Command opens annotation mode on current browser tab. If current tab is restricted (`chrome://`, extension pages, similar), command can open provided URL in new tab first.

## Tool

```text
annotate({ url?, timeout? })
```

Tool opens visual annotation mode so user can click elements, add comments, and return structured selectors, box model data, accessibility details, screenshots, and edit-capture output when enabled.

## Operator flow

### 1. Load browser extension

Open extensions page in Google Chrome, Google Chrome for Testing, or Chromium. Enable **Developer mode**. Click **Load unpacked** and choose `chrome-extension/` from installed package or local checkout. Then click **Pi Annotate** toolbar icon.

### 2. Install native host

Popup shows extension ID. Copy install command from popup, then run from `chrome-extension/native/` inside installed package or local checkout:

```bash
./install.sh <extension-id>
```

Installer writes native messaging manifest for Google Chrome, Google Chrome for Testing, and Chromium on macOS, plus default and current config-home locations for supported Linux browsers. Fully quit and reopen browser after install. Popup should show **Connected**.

### 3. Annotate page

Use command or tool, then interact in browser:

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
| Collapse panel | `−` button in toolbar header; use top-right "Restore annotator" pill to resume picking |
| Toggle annotation UI | `⌘/Ctrl+Shift+P` |
| Close | `ESC` |

## What gets captured

- **Element context**: selector, tag, id, classes, text, box model, attributes, accessibility data, key styles
- **Inline note cards**: draggable note UI with connectors, per-element comments, click-to-scroll, per-element screenshot toggles
- **Screenshots**: element crops with padding or full-page capture with numbered badges
- **Edit capture**: enable **Etch** to record inline-style changes, CSS rule edits, class changes, text edits, plus before/after screenshots
- **Restricted tab handling**: if current tab is `chrome://` or other restricted URL, command/tool can open provided URL in new tab instead

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

Key files:

- `extensions/annotate.ts` — package entrypoint
- `extensions/annotate-core.ts` — `/annotate` command and `annotate` tool runtime
- `extensions/annotate-types.ts` — TypeScript interfaces
- `chrome-extension/content.js` — element picker UI
- `chrome-extension/background.js` — native messaging, screenshots, tab routing
- `chrome-extension/native/host.cjs` — socket ↔ native messaging bridge
- `chrome-extension/popup.html` — connection status and setup UI

Auth token generated per run at `/tmp/pi-annotate.token`. Socket and token files use `0600` permissions.

## Development

```bash
npm ci
npm run typecheck
npm test
npm run check
```

`npm run check` covers typecheck, tests, packed-artifact verification, and install smoke verification.

No build step. Edit `chrome-extension/content.js` or `chrome-extension/background.js` directly, then reload extension at `chrome://extensions`. Pi extension TypeScript loads via jiti, so restart Pi after runtime changes.

Useful logs:

```bash
tail -f /tmp/pi-annotate-host.log                    # Native host logs
# chrome://extensions → Pi Annotate → service worker  # Background logs
# DevTools on target page                              # Content script logs
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| UI does not appear | Refresh page, click extension icon, check service worker console |
| `restricted URL` error | Provide URL: `/annotate https://example.com` |
| Native host not connecting | Re-run install command from popup, fully restart supported browser |
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

If Linux browser uses different config root, export `CHROME_CONFIG_HOME` or `XDG_CONFIG_HOME` before running installer. Custom `--user-data-dir` layouts not handled by installer.

## License

MIT. Original attribution remains in [`LICENSE`](LICENSE) and [`NOTICE.md`](NOTICE.md).
