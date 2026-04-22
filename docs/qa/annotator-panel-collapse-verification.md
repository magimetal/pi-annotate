# Annotator Panel Collapse Verification Evidence

Date: 2026-04-21

## Objective
Close review gap with runtime evidence for collapsed picker behavior and expanded-mode bottom-content reachability in current `chrome-extension/content.js` worktree state.

## Harness
- Fixture page: `docs/qa/annotator-panel-collapse-fixture.html`
- Script under test: `chrome-extension/content.js` loaded directly from repo root
- Browser mode: managed headless Chromium via Pi browser automation
- Local server: `python3 -m http.server 4173` from repo root
- Fixture shim: stubs `chrome.runtime.onMessage` and `chrome.runtime.sendMessage` so content-script UI runs without popup/native host
- Probe method: fixture buttons with `pi-`-prefixed classes dispatch runtime `mousemove`, `wheel`, `click`, and scroll actions against `#probe-child`; content script handles same DOM listeners used in live picking flow

## Worktree Scope
`git status --short` during verification showed broader dirty state:
- `M .gitignore`
- `M CHANGELOG.md`
- `M README.md`
- `M chrome-extension/content.js`
- `M chrome-extension/native/host-wrapper.sh`
- `?? docs/`
- `?? test-results/`

Because worktree not clean, evidence below is scoped strictly to runtime behavior observed from current `chrome-extension/content.js` when loaded into fixture page. No claim made about unrelated modified files.

## Browser Run Summary
Browser session opened:
- `http://127.0.0.1:4173/docs/qa/annotator-panel-collapse-fixture.html?v=2`

Observed interaction sequence:
1. Start annotator.
2. Scroll bottom sentinel while panel expanded.
3. Click real panel collapse button `−`.
4. Probe collapsed hover.
5. Probe collapsed `Alt/Option+wheel`.
6. Probe collapsed click-select.

## Scenario 1 — Expanded mode keeps bottom content reachable
### Actions
1. Click fixture control **Start annotator**.
2. Click fixture control **Scroll bottom sentinel** while panel remained expanded.

### Observed
- `panel.present = true`
- `panel.collapsed = false`
- `body.paddingBottom = 179px`
- `body.scrollPaddingBottom = 203px`
- `root.scrollPaddingBottom = 203px`
- `bottom.proofAbovePanel = true`
- `bottom.proofGapPx = 24px`
- `last.synthetic = scroll:#bottom-proof`
- `last.defaultPrevented = false`

### Result
PASS — bottom proof chip rendered above expanded panel with 24px measured gap.

## Scenario 2 — Collapsed mode keeps hover highlight live
### Actions
1. Click real annotator panel collapse button `−`.
2. Click fixture control **Probe collapsed hover**.

### Observed
- `panel.collapsed = true`
- `restore.visible = true`
- `body.paddingBottom = [empty]`
- `body.scrollPaddingBottom = [empty]`
- `root.scrollPaddingBottom = [empty]`
- `highlight.visible = true`
- `tooltip.text = button#probe-child.probe-cta205×52⌥+▲▼ 1/4`
- `panel.count = 0 selected`
- `probe.clicks = 0`
- `last.synthetic = mousemove:#probe-child`
- `last.defaultPrevented = false`

### Result
PASS — collapsed state preserved live hover targeting and tooltip/highlight over child CTA.

## Scenario 3 — Collapsed Alt/Option+wheel cycles picker to parent
### Actions
1. Leave panel collapsed.
2. Click fixture control **Probe Alt+wheel**.

### Observed
- `panel.collapsed = true`
- `highlight.visible = true`
- `tooltip.text = div#probe-parent.picker-parent912×185⌥+▲▼ 2/4`
- `panel.count = 0 selected`
- `probe.clicks = 0`
- `last.synthetic = wheel+alt:#probe-child`
- `last.defaultPrevented = true`

### Result
PASS — collapsed picker advanced from child CTA (`1/4`) to parent container (`2/4`), and wheel event was prevented.

## Scenario 4 — Collapsed click selects element and suppresses page CTA action
### Actions
1. Leave panel collapsed.
2. Click fixture control **Probe collapsed click**.

### Observed
- `panel.collapsed = true`
- `panel.count = 1 selected`
- `selected.primary = #probe-child`
- `markers.count = 1`
- `notes.open = 1`
- `tooltip.text = button#probe-child.probe-cta205×52⌥+▲▼ 1/4`
- `probe.clicks = 0`
- Probe status text remained: `Page CTA idle. Picker click should keep this unchanged while selection count increases.`
- `last.synthetic = click:#probe-child`
- `last.defaultPrevented = true`

### Result
PASS — click selected target element in collapsed mode and did not trigger underlying page CTA handler.

## Limits
- **Observed:** expanded bottom inset behavior, collapsed hover highlight, collapsed click-select, collapsed Alt/Option+wheel parent cycling, click suppression vs page CTA.
- **Observed:** evidence came from live `content.js` runtime in headless Chromium against fixture DOM.
- **Observed:** probe buttons dispatch synthetic DOM input to content-script listeners because Pi browser automation does not expose freeform hover/wheel-at-coordinate primitives.
- **Unknown:** extension popup initiation path, native host transport, screenshot capture transport, submit payload transport.
- **Unknown:** behavior differences, if any, under native user hardware input outside this fixture harness.
