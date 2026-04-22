# Annotator Panel Collapse Plan

## Objective
Make Chrome annotator panel collapsible and stop it from obscuring page UI near viewport bottom, without widening scope beyond extension-side behavior.

## Scope
- Chrome extension content-script UI only
- Primary target: `chrome-extension/content.js`
- Secondary touch points only if needed for docs/release notes: `README.md`, `CHANGELOG.md`

## Evidence Summary
- **Observed:** `chrome-extension/content.js` renders `#pi-panel` as `position: fixed; bottom: 0; left: 0; right: 0;` and appends it directly to `document.body`.
- **Observed:** No page inset/reserved space is applied to `document.documentElement` or `document.body`; current script only mutates `document.body.style.cursor`.
- **Observed:** Panel height is only consumed for note-card placement and resize clamping (`calculateNotePosition`, `adjustForCollisions`, `handleResize`), not for page layout.
- **Observed:** `createPanel()` has close/cancel controls, but no collapse/minimize state, toggle, or restore affordance.
- **Inferred:** Normal-flow page content can sit behind panel because viewport bottom is not reserved.
- **Inferred:** Bottom-fixed/sticky site controls cannot be safely and generically auto-shifted without high breakage risk; safest bounded fix is panel collapse plus page inset for normal-flow content.
- **Observed:** `package.json` exposes no test scripts, so verification will be manual unless implementation adds a dedicated fixture.

## Proposed Approach
Use two coordinated behaviors:

1. **Expanded panel reserves bottom inset for normal page flow**
   - Apply and maintain a temporary bottom inset while panel is expanded.
   - Reuse same measured inset for note-card clamping and scroll-related behavior.

2. **Collapsed mode removes bottom obstruction for fixed site UI**
   - Replace full-width bottom panel with a small restore handle that is **not bottom-docked across the viewport**.
   - Keep annotation session active while collapsed so user can interact with bottom-fixed site controls and continue selecting.

This avoids brittle heuristics that try to rewrite arbitrary site `position: fixed` / `position: sticky` elements.

## Tasks

### Task 1 — Centralize panel layout state and occupied-bottom calculations
- **What**
  - Add explicit panel UI state in `chrome-extension/content.js` for `expanded` vs `collapsed`.
  - Add helper(s) to measure current panel footprint and compute `occupiedBottomInset`.
  - Replace hardcoded `panelHeight` reads in note-card and resize logic with shared inset helper so all overlay placement uses same source of truth.
- **References**
  - `chrome-extension/content.js`
    - `createPanel()`
    - `calculateNotePosition()`
    - `adjustForCollisions()`
    - `handleResize()`
    - `scrollToElement()`
    - activation/deactivation flow near `activate()`, `resetState()`, `deactivate()`
- **Acceptance criteria**
  - Single helper defines current bottom exclusion zone.
  - Note cards and drag clamping respect expanded/collapsed state correctly.
  - No duplicated hardcoded fallback heights remain in modified area.
- **Guardrails**
  - Do not change annotation message protocol or native-host flow.
  - Do not introduce site-specific heuristics for arbitrary page elements yet.
  - Do not persist state outside active annotation session unless clearly justified.
- **Verification**
  - Manual code audit: all panel-height consumers route through shared helper.
  - Manual runtime check: note cards stay within visible viewport in both expanded and collapsed states.

### Task 2 — Add collapse/expand affordance that frees viewport bottom
- **What**
  - Add collapse button to panel header/toolbar.
  - Add collapsed restore affordance with clear label/icon, keyboard focusability, and accessible text.
  - Place collapsed affordance away from full-width bottom edge so it does not recreate bottom obstruction; preferred shape: compact side handle or small corner pill.
  - Keep selection state, notes state, screenshot mode, debug mode, and etch mode intact when toggling.
- **References**
  - `chrome-extension/content.js`
    - `STYLES`
    - `createPanel()`
    - event handlers around `onKeyDown()` and panel click wiring
- **Acceptance criteria**
  - User can collapse and restore panel without canceling annotation.
  - Collapsed UI no longer spans viewport width at bottom.
  - Bottom-fixed site controls become visible/clickable when panel is collapsed.
  - Existing submit/cancel behavior still works after expand/collapse cycles.
- **Guardrails**
  - Collapse must not silently submit, cancel, or clear selections.
  - Restore affordance must remain discoverable and keyboard reachable.
  - Do not move collapsed affordance to viewport bottom center/full width.
- **Verification**
  - Manual: start annotation, select at least one element, collapse, click previously obscured site control, restore, submit/cancel successfully.
  - Manual: toggle collapse repeatedly; state remains intact.

### Task 3 — Reserve layout space only while expanded, and restore page cleanly
- **What**
  - Apply temporary bottom inset while expanded using extension-owned inline styles or a dedicated CSS variable on page root/body.
  - Also apply supporting scroll inset where helpful so programmatic scrolling does not tuck targets under expanded panel.
  - Remove or zero the inset when collapsed.
  - Fully restore original page styles during `deactivate()` and `resetState()`.
- **References**
  - `chrome-extension/content.js`
    - `activate()`
    - `resetState()`
    - `deactivate()`
    - `scrollToElement()`
    - style injection in `STYLES`
- **Acceptance criteria**
  - Normal-flow page content can scroll above expanded panel instead of disappearing underneath it.
  - Collapsing panel removes reserved bottom space.
  - Cancel, submit, ESC, and session restart leave no residual page inset or inline style drift.
- **Guardrails**
  - Preserve pre-existing page inline styles; restore exact prior values on cleanup.
  - Do not mutate unrelated style properties.
  - Do not attempt broad DOM rewrites of page layout.
- **Verification**
  - Manual: on a long page, bottom content remains reachable above expanded panel.
  - Manual: after cancel/submit, inspect page visually and confirm no leftover spacing.
  - Manual: restart annotation on same tab; no compounding inset occurs.

### Task 4 — Validate fixed/sticky UI scenario and document behavior
- **What**
  - Verify against at least two page classes:
    1. normal-flow long page
    2. page with bottom-fixed or sticky CTA/chat/input bar
  - Update lightweight user-facing docs so collapse behavior is discoverable.
- **References**
  - Runtime behavior in `chrome-extension/content.js`
  - `README.md`
  - `CHANGELOG.md`
- **Acceptance criteria**
  - README mentions collapse/restore workflow and when to use it.
  - Changelog records feature/fix.
  - Manual QA evidence covers both normal-flow and bottom-fixed page cases.
- **Guardrails**
  - Keep docs scoped to actual shipped behavior.
  - Do not claim automatic site-fixed-element repositioning if implementation does not do that.
- **Verification**
  - Manual: reload extension in `chrome://extensions`, retest both scenarios after code change.
  - Manual: confirm docs match observed UI labels and behavior.

## Suggested Implementation Sequence
1. Add panel state + occupied-bottom helper.
2. Wire collapse/restore UI and state transitions.
3. Apply/remove page inset based on state.
4. Route note-card/resize/scroll logic through shared inset helper.
5. Run manual QA on normal-flow and bottom-fixed pages.
6. Update README/CHANGELOG if implementation ships.

## Risks / Unknowns
- **Primary risk:** Generic attempts to auto-shift third-party fixed/sticky site elements may break layouts or pointer behavior. Plan intentionally avoids that.
- **Unknown:** Best collapsed affordance location may need quick browser validation for discoverability vs obstruction; right-edge or top-right handle likely safest.
- **Unknown:** Some pages with aggressive root overflow/viewport locking may respond differently to added inset; cleanup logic must restore original inline values exactly.
- **Unknown:** If note cards themselves become secondary obstruction in collapsed mode, follow-up scope may be needed, but current reported root cause is bottom panel.

## Minimal Verification Matrix
- **Scenario A — Normal flow page**
  - Start annotation with panel expanded.
  - Scroll near page bottom.
  - Confirm content not hidden beneath panel.
- **Scenario B — Bottom-fixed page UI**
  - Open page with bottom-fixed CTA/chat/input.
  - Confirm panel expanded obscures it before fix.
  - Collapse panel.
  - Confirm fixed site control becomes visible and clickable.
- **Scenario C — Session integrity**
  - Select elements, add note, toggle screenshot/debug/etch states.
  - Collapse and restore.
  - Confirm state preserved.
- **Scenario D — Cleanup**
  - Cancel via button and via `ESC`, then re-open.
  - Confirm no leftover spacing or detached restore handle.

## Verification Evidence
- Runtime evidence recorded in `docs/qa/annotator-panel-collapse-verification.md`.
- Repro fixture recorded in `docs/qa/annotator-panel-collapse-fixture.html`.
