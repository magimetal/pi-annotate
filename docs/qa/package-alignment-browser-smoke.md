# Package Alignment Browser Smoke Evidence

Date: 2026-04-22

## Objective
Close execution-review gap with browser-backed smoke evidence after package realignment, while explicitly preserving already-requested annotator panel behavior work in current `chrome-extension/content.js` worktree state.

## Scope Boundary
- Package-alignment target under review: extension/package move did not break basic browser-side smoke path and popup setup guide points at maintained repo.
- Separately requested browser behavior already in worktree: collapsed annotator panel behavior in `chrome-extension/content.js`.
- This run does **not** treat collapsed-panel behavior as package-alignment scope expansion. It records that behavior only as preserved, already-requested browser functionality that remained intact during package-alignment verification.

## Harness
- Browser mode: managed headless Chromium via Pi browser automation
- Local server: `python3 -m http.server 4173` from repo root
- Popup URL: `http://127.0.0.1:4173/chrome-extension/popup.html?v=package-smoke`
- Browser-flow fixture URL: `http://127.0.0.1:4173/docs/qa/annotator-panel-collapse-fixture.html?v=package-smoke`
- Fixture script under test: `chrome-extension/content.js` loaded directly from repo root
- Prior deep runtime coverage for panel behavior: `docs/qa/annotator-panel-collapse-verification.md`

## Browser Run Summary
### Scenario 1 — Popup footer points at maintained repository
Observed from popup page snapshot:
- Visible footer link text: `Setup Guide →`
- Link target: `https://github.com/magimetal/pi-annotate#quick-start`

Result:
- PASS — popup/setup path now points at maintained repo, not upstream fork URL.

### Scenario 2 — Browser-side smoke path still launches after package move
Actions:
1. Open fixture page.
2. Click fixture control `Start annotator`.
3. Click fixture control `Scroll bottom sentinel`.
4. Click real annotator panel collapse button `−`.
5. Click fixture control `Probe collapsed click`.

Observed after `Start annotator`:
- `panel.present = true`
- `panel.collapsed = false`
- `body.paddingBottom = 179px`
- `body.scrollPaddingBottom = 203px`
- `root.scrollPaddingBottom = 203px`

Observed after `Scroll bottom sentinel`:
- `bottom.proofAbovePanel = true`
- `bottom.proofGapPx = 24px`
- `last.synthetic = scroll:#bottom-proof`
- `last.defaultPrevented = false`

Observed after collapse + collapsed click probe:
- `panel.collapsed = true`
- `restore.visible = true`
- `panel.count = 1 selected`
- `selected.primary = #probe-child`
- `markers.count = 1`
- `notes.open = 1`
- `probe.clicks = 0`
- `last.synthetic = click:#probe-child`
- `last.defaultPrevented = true`

Result:
- PASS — browser-side annotator smoke path still starts, panel mounts, expanded bottom inset works, and previously requested collapsed-panel selection behavior remains intact in current worktree.

## Interpretation
- **Observed:** package realignment did not break repo-served browser smoke path for `chrome-extension/content.js`.
- **Observed:** popup footer/setup guide now resolves to maintained repo.
- **Observed:** current annotator panel behavior changes remained functional and were not reverted while closing package-alignment review gaps.
- **Inferred:** package move under `extensions/` preserved browser-side integration expectations because packed-artifact install checks pass and browser smoke still exercises repo browser assets successfully.

## Limits
- **Observed:** popup page was opened outside full extension runtime, so browser smoke here verified rendered footer link target, not `chrome.runtime`-driven field population.
- **Observed:** native-host registration and project-scope install validation came from automated repo checks (`npm run check`), not this browser smoke page alone.
- **Unknown:** full live extension popup behavior inside Chrome extension context was not re-run in this focused smoke pass.
