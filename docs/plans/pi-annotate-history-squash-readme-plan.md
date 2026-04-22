# Pi Annotate History Squash and README Refresh Plan

## Objective
Rewrite `pi-annotate` repository history to one fresh root commit under current ownership, refresh `README.md` to match sibling Magi package conventions, and preserve attribution/provenance in shipped surfaces after git ancestry is replaced.

## Scope
- Git history rewrite for repository at `/Users/magimetal/Dev/pi/pi-annotate`
- README rewrite and related provenance/readme-surface alignment
- Remote/origin cutover steps and collaborator-impact handling
- Verification limited to git/history/doc surfaces and remote-state checks

## Out of Scope
- Runtime feature changes
- Browser-extension behavior changes
- Package metadata or code changes unrelated to provenance/readme alignment
- Registry publication changes unless separately requested

## Baseline Evidence
- **Observed:** local `HEAD` is already one commit deep: `git rev-list --count HEAD` returned `1`.
- **Observed:** local `HEAD` commit is `04887d628320ca50afea408d544ce1e63459fde5` with author `Magi Metal <magimetal@pm.me>` and subject `chore: re-root pi-annotate under Magi Metal authorship`.
- **Observed:** `origin` points to `git@github.com:magimetal/pi-annotate.git`.
- **Observed:** `origin/main...HEAD` returned `31 1`, meaning remote still carries older multi-commit history while local branch carries one replacement root commit.
- **Observed:** `README.md` already contains Magi-package style sections: install, command/tool surfaces, operator flow, architecture, development, troubleshooting.
- **Observed:** `README.md` already preserves provenance near top and links `NOTICE.md`.
- **Observed:** `NOTICE.md` preserves upstream/source attribution to `nicobailon/pi-annotate` and credits Nico Bailon as original developer.
- **Observed:** `LICENSE` still carries original MIT copyright notice for Nico Bailon.
- **Observed:** popup setup link points at maintained repo anchor `https://github.com/magimetal/pi-annotate#operator-flow`; README heading changes must preserve or deliberately re-home that anchor.

## Target End State
- `main` on remote resolves to one fresh root commit under current authorship.
- Old git ancestry no longer appears on default branch.
- `README.md` matches sibling Magi package shape, but keeps explicit provenance and attribution.
- `NOTICE.md`, `LICENSE`, and README provenance text remain durable attribution surfaces after ancestry rewrite.
- Remote push path and collaborator recovery steps are explicit and verified.

## Execution Decision Gate
Because local repo already appears re-rooted, implementation must choose one path after preflight:

1. **If local one-commit state is valid and only README/provenance polish remains**
   - Amend or recreate that root commit with final README/provenance content.
   - Force-push rewritten `main` to replace remote history.

2. **If local one-commit state is incomplete or invalid**
   - Recreate fresh orphan/root commit from current working tree contents.
   - Reapply README/provenance changes.
   - Force-push rewritten `main` to replace remote history.

Do not assume second rewrite necessary until preflight confirms gap.

## Tasks

### Task 1 — Preflight destructive-history safety net
- **What**
  - Capture exact local/remote history state before any further rewrite.
  - Create non-default backup references so old ancestry remains recoverable outside `main`.
  - Record branch-protection or remote-force-push blockers before any commit surgery.
- **References**
  - `.git/config`
  - `README.md`
  - `NOTICE.md`
  - `LICENSE`
  - `docs/plans/pi-annotate-history-squash-readme-plan.md`
- **Acceptance criteria**
  - Execution has recorded current `HEAD`, `origin/main`, divergence, and current README/provenance surfaces.
  - At least one recoverable backup exists for pre-rewrite state: local tag, backup branch, or `git bundle` artifact.
  - Any branch protection or remote permissions blocker is known before rewrite begins.
- **Guardrails**
  - Do not run destructive git commands before backup exists.
  - Do not assume remote force-push allowed.
  - Do not discard reflog-only recovery as sufficient sole backup.
- **Verification**
  - `git status --short`
  - `git rev-list --count HEAD`
  - `git log --format='%H %an <%ae> %s' -1`
  - `git rev-parse --verify origin/main`
  - `git rev-list --left-right --count origin/main...HEAD`
  - `git branch backup/pre-root-reset-$(date +%Y%m%d-%H%M%S)` or `git tag backup/pre-root-reset-$(date +%Y%m%d-%H%M%S)`
  - `git bundle create ../pi-annotate-pre-root-reset.bundle --all`
  - `git push --force-with-lease --dry-run origin HEAD:main`

### Task 2 — Lock README target against sibling Magi package format
- **What**
  - Compare current `README.md` against sibling package readmes and define final target structure.
  - Keep sections that already align; rewrite only sections that drift from shared Magi package format or weaken provenance clarity.
  - Preserve stable operator/setup anchor behavior used by popup link.
- **References**
  - `README.md`
  - `NOTICE.md`
  - `package.json`
  - `/Users/magimetal/Dev/pi/pi-gizmo/README.md`
  - `/Users/magimetal/Dev/pi/pi-system-prompt/README.md`
  - `chrome-extension/popup.html`
- **Acceptance criteria**
  - Final README outline is explicit before edits.
  - Provenance section remains near top and links upstream/source repo plus `NOTICE.md`.
  - Install section matches Magi package conventions and current allowed install surfaces.
  - Command/tool/operator-flow sections remain easy to scan and materially accurate.
  - Popup setup link still resolves to a live README anchor after rewrite.
- **Guardrails**
  - Do not erase original-developer attribution.
  - Do not advertise unconfirmed install surfaces.
  - Do not rewrite README into sibling voice at cost of package-specific operator details.
  - Do not rename `Operator flow` heading unless popup link is updated in same change.
- **Verification**
  - `rg -n '## Install|## Command|## Tool|## Operator flow|## Architecture|## Development|## Troubleshooting|## License' README.md`
  - `rg -n 'nicobailon/pi-annotate|NOTICE.md|original developer|Maintained repository|operator-flow' README.md chrome-extension/popup.html`
  - Side-by-side readback against sibling files listed above

### Task 3 — Preserve attribution/provenance outside git ancestry
- **What**
  - Confirm durable provenance surfaces that survive history replacement.
  - Keep `NOTICE.md` authoritative for derivation statement.
  - Keep README provenance block concise but explicit.
  - Leave `LICENSE` intact unless legal review explicitly requires otherwise.
  - Confirm package metadata still credits current maintainer and original developer appropriately.
- **References**
  - `NOTICE.md`
  - `README.md`
  - `LICENSE`
  - `package.json`
  - `CHANGELOG.md`
- **Acceptance criteria**
  - Upstream/source attribution remains visible without using git history.
  - README, NOTICE, and package metadata do not contradict each other.
  - License text remains intact.
  - Changelog entry, if touched, describes rewrite/provenance accurately without falsifying history.
- **Guardrails**
  - Do not imply exclusive authorship of original project.
  - Do not remove Nico Bailon attribution from shipped artifacts.
  - Do not overwrite legal text casually.
- **Verification**
  - `rg -n 'Nico Bailon|original developer|derived from|maintains|Magi Metal' README.md NOTICE.md package.json CHANGELOG.md LICENSE`
  - Manual readback of top README provenance block and full `NOTICE.md`

### Task 4 — Normalize working tree before final root commit
- **What**
  - Ensure only intended README/provenance/documentation changes are included in final replacement root commit.
  - If local one-commit state already contains desired history rewrite, stage only delta needed for final README/package-surface polish.
  - If local state is not acceptable, reconstruct clean tree from intended repo contents before creating fresh root commit.
- **References**
  - `README.md`
  - `NOTICE.md`
  - `LICENSE`
  - `package.json`
  - `CHANGELOG.md`
  - `.gitignore`
- **Acceptance criteria**
  - Working tree for final commit contains only intended repo contents.
  - No accidental temp files, backup artifacts, or secret material enter final commit.
  - README rewrite and provenance surfaces are fully staged before root-commit finalization.
- **Guardrails**
  - Do not pull unrelated code refactors into rewrite commit.
  - Do not add backup bundle/tag artifacts to tracked files.
  - Redact any surfaced secrets as `[REDACTED]`.
- **Verification**
  - `git status --short`
  - `git diff -- README.md NOTICE.md LICENSE package.json CHANGELOG.md`
  - `git add -N README.md NOTICE.md LICENSE package.json CHANGELOG.md && git diff --cached --name-only`

### Task 5 — Create final one-root commit safely
- **What**
  - Choose minimal valid history-rewrite path from Task 1 decision gate.
  - Preferred path if local repo already one commit deep: update files as needed, then `git commit --amend --reset-author` for final root commit.
  - Fallback path if full rewrite still required: create orphan branch from current tree, commit once, then move `main` to that commit.
- **References**
  - repository `.git/` state
  - `README.md`
  - `NOTICE.md`
  - `LICENSE`
  - `package.json`
- **Acceptance criteria**
  - Local `main` ends at exactly one root commit.
  - Final commit author/committer match current ownership intent.
  - Final commit contains README rewrite and provenance surfaces.
- **Guardrails**
  - Do not create multi-commit replacement history.
  - Do not preserve old ancestry on `main`.
  - Do not lose repo contents during orphan/root reconstruction.
- **Verification**
  - Preferred path: `git commit --amend --reset-author`
  - Fallback path: `git checkout --orphan root-reset-$(date +%Y%m%d-%H%M%S)` then single commit, then fast-switch `main`
  - `git rev-list --count HEAD`
  - `git rev-list --parents -n 1 HEAD`
  - `git log --graph --decorate --oneline --max-count=5`
  - `git show --stat --summary HEAD`

### Task 6 — Validate rewritten local state before remote replacement
- **What**
  - Re-read final README and provenance files after commit.
  - Confirm history really is single-root and commit content matches intended repo tree.
  - Confirm no broken popup README anchor caused by section rename.
- **References**
  - `README.md`
  - `NOTICE.md`
  - `LICENSE`
  - `chrome-extension/popup.html`
  - `.git/config`
- **Acceptance criteria**
  - Final doc surfaces read cleanly and consistently.
  - `HEAD` is one root commit.
  - Popup setup link anchor is valid.
  - No unintended tracked files appear in final commit.
- **Guardrails**
  - Do not skip readback after commit.
  - Do not claim success from git count alone; content must also match target.
- **Verification**
  - `git rev-list --count HEAD`
  - `git rev-list --parents -n 1 HEAD`
  - `git show --name-status --summary HEAD`
  - `git grep -n 'operator-flow' README.md chrome-extension/popup.html`
  - `git show HEAD:README.md | sed -n '1,220p'`
  - `git show HEAD:NOTICE.md`

### Task 7 — Replace remote default-branch history and handle blast radius
- **What**
  - Force-push rewritten `main` to `origin` once local validation passes.
  - Record collaborator-facing impact and recovery instructions because every prior commit SHA on `main` becomes obsolete.
  - Review open PRs, tags, release notes, and automation assumptions that may still reference pre-rewrite SHAs.
- **References**
  - `.git/config`
  - remote `origin`
  - repository hosting settings for `magimetal/pi-annotate`
- **Acceptance criteria**
  - Remote `main` points at replacement root commit.
  - Force push used with lease protection, not blind overwrite.
  - Recovery guidance exists for other clones and branches.
  - Known downstream breakage points are documented: open PRs, stale SHAs, protected branch rules, external links to old commits.
- **Guardrails**
  - Do not use plain `--force` when `--force-with-lease` works.
  - Do not push until backup and local validation are complete.
  - Do not ignore branch-protection failure; stop and resolve explicitly.
- **Verification**
  - `git push --force-with-lease origin HEAD:main`
  - `git ls-remote origin main`
  - `git fetch origin && git rev-list --count origin/main`
  - `test "$(git rev-parse HEAD)" = "$(git rev-parse origin/main)"`

### Task 8 — Post-push confirmation and operator notes
- **What**
  - Verify remote now exposes one-commit default branch.
  - Capture short operator note describing what changed, where provenance now lives, and what collaborators must do next.
  - Include explicit recovery commands for existing clones.
- **References**
  - remote `origin`
  - `README.md`
  - `NOTICE.md`
  - `LICENSE`
- **Acceptance criteria**
  - Remote history shape confirmed after push.
  - Operator note includes provenance surfaces and collaborator reset/reclone instructions.
  - Remaining unknowns are called out plainly.
- **Guardrails**
  - Do not state remote success without direct remote check.
  - Do not hide downstream inconvenience from collaborators.
- **Verification**
  - `git rev-list --count origin/main`
  - `git log origin/main --format='%H %an <%ae> %s' -1`
  - Recommended collaborator recovery:
    - fresh clone preferred
    - or existing clone: `git fetch origin && git checkout main && git reset --hard origin/main && git clean -fd`

## Recommended Sequence
1. Task 1 safety net first.
2. Task 2 README target lock.
3. Task 3 provenance surface check.
4. Task 4 working-tree normalization.
5. Task 5 final root commit creation/amend.
6. Task 6 local validation.
7. Task 7 remote replacement.
8. Task 8 post-push confirmation and collaborator note.

## Remote and Collaboration Implications
- Force-push rewrites every old `main` SHA. Existing links to specific old commits stay stale.
- Open pull requests based on old history may become noisy or unusable.
- Local clones must reset hard or reclone.
- Protected-branch rules may block force-push; confirm before execution.
- Tags pointing into pre-rewrite ancestry may need follow-up decision: keep as historical refs, move intentionally, or leave untouched.

## Key Assumptions
- Current desired ownership identity is `Magi Metal <magimetal@pm.me>`.
- Attribution requirement is satisfied by `README.md`, `NOTICE.md`, `LICENSE`, and package metadata rather than preserved git ancestry.
- README should follow sibling Magi package conventions, not become a verbatim copy of another package README.
- Runtime/package behavior stays unchanged; only history and documentation surfaces move.

## Open Risks / Unknowns
- **Observed:** local repo already appears re-rooted; execution may be mostly validation + README polish + force-push, not full second rewrite.
- **Unknown:** whether remote branch protection allows `--force-with-lease` to `main`.
- **Unknown:** whether any external automation, releases, or consumers still depend on old SHAs.
- **Unknown:** whether tags/releases exist on old history and need separate handling.
- **Inferred:** if README heading slugs change without popup link update, setup guide link will break silently.
- **Inferred:** backup bundle outside repo is safest cheap recovery path before destructive remote replacement.
