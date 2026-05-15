# Changelog

All notable changes to Pi Annotate.

## [Unreleased]

### Changed
- Realigned package layout to sibling-style `extensions/` entrypoints while preserving `/annotate` command and `annotate` tool behavior.
- Switched maintained repository metadata and install guidance to `magimetal/pi-annotate`, with public install docs preferring git and local checkout surfaces until npm ownership is confirmed.
- Added shipped provenance via `NOTICE.md`, explicit original-developer credit for Nico Bailon, and release verification gates for tarball contents plus isolated `pi install -l` smoke testing.
- Migrated extension schema imports and package dependencies from `@sinclair/typebox` to `typebox`, aligning package metadata with Pi 0.69.0 extension guidance.
- Bumped local Pi dev dependency to `@mariozechner/pi-coding-agent` `0.69.0` and refreshed lockfile for current TypeBox-native validation path.
- Moved Pi extension API imports and package dependency metadata to `@earendil-works/pi-coding-agent` `0.74.0`.

### Fixed
- Adapted schema-contract tests to TypeBox 1 typings so package verification stays green under Pi 0.69.0.
- Restored popup setup-guide anchor by renaming README operator setup section to `Operator flow`.

## [0.4.3] - 2026-04-21

### Fixed
- Annotator panel now reserves bottom page space while expanded so normal page content can scroll above it instead of disappearing underneath.
- Annotator panel now supports collapse/restore, moving to a compact top-right pill when collapsed so bottom-fixed site UI is reachable without ending annotation.
- Collapsed annotator now pauses page-picking interception until restored, allowing real interaction with underlying site controls during an active session.

## [0.4.2] - 2026-04-20

### Fixed
- Native host install now writes manifests for Chromium and Google Chrome for Testing in addition to Google Chrome, fixing immediate native-host disconnects in Chromium.
- Popup connection checks now reuse the background service worker's native host connection instead of spawning a second host process that could disrupt the shared socket.
- Browser-facing setup and troubleshooting copy now matches the supported browser matrix and Linux config-home behavior.
- Native host filesystem cleanup and annotation screenshot reporting now preserve useful error information instead of silently swallowing failures.

## [0.4.1] - 2026-04-04

### Changed
- Added a `promptSnippet` for the `annotate` tool so Pi 0.59+ includes it in the default tool prompt section and only surfaces it for explicit visual-annotation requests.

## [0.4.0] - 2026-02-08

### Added
- **Edit capture** — New "Etch" toolbar toggle records DevTools edits via MutationObserver and produces structured property-level diffs. Tracks inline style changes, CSS rule modifications, class additions/removals, text edits, attribute changes, and structural DOM mutations
- **Before/after screenshots** — Undo-screenshot-redo cycle captures page state before and after edits. Visual-only undo (style/class attributes + stylesheet rules) covers ~95% of DevTools edits with near-perfect reliability
- **Stylesheet diffing** — Serializes all same-origin stylesheets when Etch is toggled on, diffs against current state at submit. Reports per-property changes with full selector context including `@media`/`@supports`/`@layer` nesting
- **Cross-origin stylesheet warning** — Output notes when CDN-hosted stylesheets couldn't be tracked
- **Changed element indicators** — Elements modified during recording get dashed amber outlines, making tracked changes visible at a glance

### Changed
- **Buffer limits** — Socket and native message buffers increased from 8MB to 32MB to accommodate before/after screenshots alongside element crops
- **Log redaction** — `beforeScreenshot` and `afterScreenshot` fields now redacted from native host logs

### Technical
- Added `StylePropertyChange`, `InlineStyleChange`, `RuleChange`, `DOMChange`, `EditCapture` interfaces to `types.ts`
- 16 new functions in `content.js` for observer lifecycle, stylesheet serialization/diffing, inline style diffing, DOM change compilation, and undo/redo screenshot cycle
- `formatEditCapture()` in `index.ts` renders structured diffs as markdown with before/after screenshot file paths
- Transition/animation killer stylesheet prevents visual artifacts during the screenshot cycle
- Observer disconnect in both `resetState()` and `deactivate()` prevents zombie observers on re-activation
- DOM write guards in `updateEtchCounter()` prevent MutationObserver feedback loops

## [0.3.6] - 2026-02-01

### Fixed
- Adapt execute signature to pi v0.51.0: reorder signal, onUpdate, ctx parameters

## [0.3.5] - 2026-02-01

### Fixed
- **Page scrolling blocked** — Scroll wheel was completely hijacked for ancestor cycling; now requires Alt/⌥+scroll, plain scroll passes through to the page
- **`overflow: auto` silently filtered** — Flat style defaults set matched `"auto"` across properties; `overflow: auto` was hidden because `"auto"` was the default for `zIndex`. Switched to per-property defaults map
- **`zIndex: 1` silently filtered** — Same issue; `"1"` was the opacity default but also filtered `zIndex: 1`

## [0.3.4] - 2026-01-31

### Fixed
- **Cancel sends null requestId** — `handleCancel()` now captures `requestId` before calling `deactivate()`, fixing tool-flow cancellations that would hang until timeout
- **Stale auth token after native host restart** — Token is now re-read from disk on every connection attempt and cleared on socket close, fixing "not connected" errors after Chrome suspends the service worker
- **Tool error message unhelpful** — Connection failure now says to click the extension icon to wake the service worker instead of generic "make sure it's installed"

### Changed
- **Removed dead `showOutline` code** — Unused `options` parameter and outline drawing branch removed from `addBadgesToScreenshot`

## [0.3.3] - 2026-01-31

### Changed
- **Demo video** — Added `demo.mp4` and `pi.video` field for package gallery
- **Package metadata** — Added keywords, repository, author, bugs, homepage, files list

## [0.3.2] - 2026-01-30

### Added
- **Always-on key styles** — `display`, `position`, `overflow`, `zIndex`, `opacity`, `color`, `backgroundColor`, `fontSize`, `fontWeight` captured for every element without debug mode
- **Debug re-capture at submit** — When debug mode is on at submit time, re-captures computed styles, parent context, and CSS variables for ALL selected elements (fixes elements selected before debug was enabled)

### Changed
- **README rewritten for `pi install`** — Quick Start switched to git-based install guidance and updated installed-package path examples
- **Key styles suppressed in debug mode** — Compact `**Styles:**` line hidden when full `**Computed Styles:**` dump is present (no duplication)
- **Default style filtering** — `fontSize: 16px` and `fontWeight: 400` filtered from key styles to reduce noise

## [0.3.1] - 2026-01-29

### Fixed
- **Silent failure on restricted tabs** — When invoked on `chrome://`, `about:`, or other restricted URLs, the agent now gets an immediate error instead of hanging for 5 minutes
- **No active tab** — If no browser tab is available, returns an error immediately instead of failing silently
- **Popup/shortcut on fresh tabs** — "Start Annotation" button and keyboard shortcut now inject the content script automatically on tabs where it hasn't loaded yet
- **Annotation UI not dismissed on abort/timeout** — Content script now handles incoming `CANCEL` messages (from agent abort or tool timeout) and closes the annotation UI

### Added
- **New tab fallback** — When current tab is restricted and a URL is provided, opens a new tab instead of failing
- **`isRestrictedUrl()` helper** — Detects `chrome://`, `chrome-extension://`, `edge://`, `about:`, `devtools://`, `view-source:` URLs
- **`injectAfterLoad()` helper** — Shared load-wait + inject pattern used by both navigate and create-tab paths
- **`togglePicker()` function** — Single entry point for popup button and keyboard shortcut, routes through background script with automatic content script injection

### Changed
- **Popup button simplified** — Routes through background script instead of injecting directly, eliminating duplicated injection logic
- **`sendToContentScript` reports errors** — On injection failure, sends `CANCEL` back to native host with error details instead of swallowing the error
- **`onMessage` log label** — Changed from `"From content:"` to `"Message:"` since popup messages now route through the same handler

## [0.3.0] - 2026-01-28

### Added
- **DevTools-level context capture** — Automatically captures diagnostic info to reduce need for manual DevTools inspection
- **Box model breakdown** — Content dimensions, padding, border, and margin for each element
- **Accessibility info** — Role (implicit or explicit), accessible name, description, focusable state, ARIA states
- **Debug mode toggle** — New "Debug" checkbox in toolbar enables additional captures:
  - **Computed styles** — 40+ key CSS properties (layout, flex, grid, colors, typography, etc.)
  - **Parent context** — Parent element's tag, classes, and layout-relevant styles
  - **CSS variables** — Custom properties used by the element (up to 50)
- **Full screenshot badges** — When using "Full" screenshot mode, numbered teal badges are now drawn directly on the screenshot at each selected element's position, making it easy to correlate elements with the numbered list in the output

### Changed
- **Expanded attributes** — Now captures ALL attributes instead of just 8 hardcoded ones
- **Output format** — Enhanced with box model, attributes, and accessibility in compact format

### Fixed
- **Attributes not displayed** — Bug fix: `attributes` field was captured but never output in `formatResult()`

### Technical
- Added `BoxModel`, `AccessibilityInfo`, `ParentContext` interfaces to `types.ts`
- Added 12 new helper functions with JSDoc annotations in `content.js`
- CSS variable discovery with recursive rule extraction and caching
- Reset debug mode and CSS cache in `resetState()`
- Added `addBadgesToScreenshot()` canvas function for full screenshot badge overlay

## [0.2.1] - 2026-01-28

### Added
- **Dark/Light theme support** — Auto-detects system preference via `prefers-color-scheme`
- **CSS custom properties** — 22 `--pi-*` variables for consistent theming aligned with pi interview tool
- **Element bounding boxes** — Selected elements now show visible outline rectangles
- **Expand/Contract buttons** — ▲/▼ buttons in note card headers to navigate parent/child elements
- **`isPiElement()` helper** — Top-level function to detect pi-annotate UI elements
- **`updateNoteCardLabel()` helper** — Reusable function for updating note card selectors

### Changed
- **Status updates** — Replaced `console.log` with `ctx.ui.setStatus("pi-annotate", message)` for proper pi integration
- **Screenshot toggle labels** — Changed from `Each|Full|None` to `Screenshot: Crop|Full|None` for clarity
- **Notes visibility toggle** — Replaced two buttons (▼▲) with single checkbox `☑ Notes`
- **Camera button styling** — Now shows clear on/off state (40% opacity when off, green glow when on)
- **Color palette** — Unified with pi interview tool (teal accent `#8abeb7`, consistent grays)

### Fixed
- **setStatus called before validation** — Moved status update after message type check in `handleMessage()`

### Technical
- Added `currentCtx` variable to store context for status updates in async callbacks
- Extracted duplicated pi-element detection logic into single `isPiElement()` function
- Extracted duplicated note card label update into `updateNoteCardLabel()` function
- All 96 hardcoded colors replaced with CSS variables
- Light theme overrides defined in `@media (prefers-color-scheme: light)` block

## [0.2.0] - 2026-01-27

### Added
- **Inline note cards** — Each selected element gets a floating note card with its own textarea for per-element comments
- **Draggable notes** — Drag note cards by their header to reposition them anywhere on screen
- **Clickable badges** — Click numbered badges to toggle note cards open/closed
- **SVG connectors** — Curved dashed lines connect note cards to their elements
- **Scroll to element** — Click selector in note card header to scroll element into view with highlight flash
- **Expand/Collapse all** — Toolbar buttons to open or close all notes at once
- **Context input** — Simplified single-line input for overall context (replaces textarea)
- **Per-element comments** — `comment` field added to ElementSelection type for structured annotation data
- **Scroll/resize handlers** — Badges and connectors update when page scrolls or window resizes

### Changed
- **Panel simplified** — Removed chips section, added toolbar with mode toggles, screenshot options, and note controls
- **Markers → Badges** — Replaced green marker boxes with purple clickable badge circles
- **Auto-open notes** — Clicking an element automatically opens its note card and focuses the textarea
- **formatResult output** — "User's request" renamed to "Context", per-element comments shown under each element

### Removed
- **Chips UI** — Replaced entirely by inline note cards
- **Expand/contract per-chip** — Replaced by note card "remove" button and scroll-to-element

### Technical
- Added `elementComments`, `openNotes`, `notePositions`, `dragState` state variables
- Added `createNotesContainer`, `createNoteCard`, `toggleNote`, `updateBadges`, `updateConnectors`, `removeElement`, `scrollToElement`, `expandAllNotes`, `collapseAllNotes` functions
- Drag handlers use single document-level listeners to avoid memory leaks
- Note card event handlers use `getIndex()` to read from DOM (survives reindexing)
- `pruneStaleSelections` rebuilds note cards with correct indices after DOM changes

## [0.1.3] - 2026-01-27

### Added
- **Extension popup** — Click extension icon to see connection status, copy Extension ID and install command
- **PING/PONG health check** — Native host responds to PING for reliable connection detection
- **Click to copy selector** — Click hover preview or chip text to copy selector with "Copied!" tooltip
- **Screenshot mode toggle** — Choose between "Each element", "Full page", or "None" (replaces checkboxes)
- **Platform-aware UI** — Popup shows correct keyboard shortcuts for Mac vs Windows/Linux
- **Multi-terminal handling** — When another terminal runs `/annotate`, the old session is gracefully replaced with notification

### Changed
- **UI polish** — Removed section labels, tighter spacing, narrower right panel (160px vs 200px)
- **Fixed-height hover preview** — Single line with truncation prevents layout shift from long selectors
- **Centered arrow buttons** — ▲/▼ buttons now properly centered with larger icons
- **Options row** — Screenshot options moved inline with form elements, footer simplified

### Removed
- **+Add button** — Removed because hover changes when moving to click button (use Multi mode instead)
- **Checkbox toggles** — Replaced with unified screenshot mode toggle

### Fixed
- **Popup state handling** — Proper detection of connected/not-installed/trouble states
- **Click event propagation** — Click-to-copy works correctly with panel event handling
- **Session takeover** — New `/annotate` from different terminal properly resets UI state

## [0.1.2] - 2026-01-27

### Security
- **Auth token** — Native host generates per-run token at `/tmp/pi-annotate.token`; Pi must authenticate before messages are forwarded
- **Socket permissions** — Socket file created with 0600 permissions, token file with 0600
- **Message validation** — Schema guardrails in index.ts drop malformed messages

### Added
- **Request correlation** — End-to-end requestId tracking for proper multi-request handling
- **Buffer limits** — Max 8MB for socket/native messaging buffers, 15MB for screenshots
- **Log redaction** — Screenshots/dataUrls redacted from native host logs
- **Log rotation** — Host log rotates at 5MB
- **Stale selection pruning** — Auto-removes elements deleted from DOM before submit

### Fixed
- **Connection lost handling** — Pending tool calls resolve with `connection_lost` on socket close
- **Navigation timeout** — Now sends CANCEL with `navigation_timeout` reason to Pi
- **Canvas context guard** — Falls back to full screenshot if 2D context unavailable
- **escapeHtml robustness** — Handles null/undefined/non-string inputs safely

### Changed
- **Pending requests** — Changed from single `pendingResolve` to Map keyed by requestId
- **Async file writes** — Screenshots written asynchronously with `fs.promises.writeFile`
- **Tab routing** — Background script routes messages to correct tab via requestId mapping

## [0.1.1] - 2026-01-27

### Fixed
- **XSS vulnerability** — Escape HTML when rendering element IDs/classes in tooltips and chips
- **Screenshot map index shift on click-deselect** — Clicking to deselect now properly shifts screenshot toggle states
- **DOM validity check** — Verify elements still exist in DOM before cropping screenshots
- **Null viewport access** — Guard against undefined viewport in result formatting
- **Event listener cleanup** — Match wheel event removal options with addition options
- **Navigation listener leak** — Add 30s timeout to prevent orphaned listeners
- **Style injection fallback** — Use `document.documentElement` if `document.head` is unavailable

## [0.1.0] - 2026-01-27 (Complete Rewrite)

### Added
- **Per-element screenshots** — Each selected element gets its own cropped screenshot
- **📷 toggle button** — Enable/disable screenshot per element on chips
- **Parent/Child navigation** — Modify selected elements with ▲/▼ buttons
- **+/− buttons** — Expand to parent or contract to child on each chip
- **`/annotate` command** — Works on current tab without requiring URL
- **`/ann` alias** — Quick shortcut for annotation command
- **Full page option** — Toggle to capture entire viewport instead
- **ESC to close** — Keyboard shortcut to dismiss UI
- **× close button** — Visual close button in header

### Changed
- **Vanilla JS** — Complete rewrite from React (~800 lines vs 2000+)
- **Native messaging** — Replaced HTTP polling with native messaging for reliability
- **Text capture** — Increased from 100 to 500 characters
- **Screenshot paths** — Saved to temp files with paths returned for LLM reading
- **UI layout** — Reorganized with "Hover Preview" and "Modify Selection" sections

### Fixed
- Socket data buffering for large screenshot payloads
- Click events being blocked by panel overlay
- Cancel button working without active connection
- Content script injection on pages loaded before extension

### Architecture
```
Pi Extension ← Unix Socket → Native Host ← Native Messaging → Chrome Extension
```

## Architecture

| Aspect | This Version |
|--------|--------------|
| UI Framework | Vanilla JS |
| Lines of code | ~800 |
| Screenshots | Per-element crops |
| Communication | Native messaging |
| Chat | One-way submit |
| Build step | None |
