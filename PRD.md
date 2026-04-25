# Nerve Fork — PRD & Maintenance Notes

> **Fork of:** [daggerhashimoto/openclaw-nerve](https://github.com/daggerhashimoto/openclaw-nerve)
> **Owner:** qubeio (Andreas Frangopoulos)
> **Fork URL:** https://github.com/qubeio/openclaw-nerve

## Why we forked

We needed several local modifications to Nerve that weren't suitable for upstream
(yet) or where upstream's pace didn't match our needs. Rather than maintain a
pile of unpushed local commits in `~/nerve`, we forked to:

- Have a clean place to push our changes
- Make it trivial to PR things upstream when they're ready
- Reduce merge friction by keeping our diffs additive where possible
- Stop being terrified of accidentally `git pull`-ing something destructive

## Repository setup

This repo lives at `~/nerve` on Andreas's Mac (Anubis). It runs as a launchd
service (`com.nerve.server`) — see `~/Library/LaunchAgents/com.nerve.server.plist`
and `~/nerve/start.sh`. Config persists in `~/.nerve/`.

### Remotes

```
origin      https://github.com/qubeio/openclaw-nerve.git    # our fork
upstream    https://github.com/daggerhashimoto/openclaw-nerve.git
```

### Branches

- `master` — tracks upstream master (don't commit to this directly)
- `local-gpu-fixes` — long-lived branch with our base local tweaks (GPU/CSS,
  Traefik proxy trust)
- `feature/<name>` — branched off `local-gpu-fixes` for individual features

### Active feature branches

| Branch | Purpose | Status |
|---|---|---|
| `local-gpu-fixes` | GPU/backdrop-filter fixes + Traefik proxy trust | Live, in production |
| `feature/standalone-session` | Adds "Standalone Session" spawn mode (see below) | In progress |

## Standalone Session feature (current work)

### Problem

Nerve's spawn dialog has two modes:

1. **Root** — creates a brand new agent (separate identity, workspace, memory).
   Good if you want a different persona; **wrong** if you want "same agent,
   isolated context."
2. **Subagent** — creates a child of an existing root, but registers a
   server-side completion monitor that injects a "completion report" message
   into the parent root when the child first goes idle. This pollutes the
   root session with stub messages.

For users who want **isolated conversation contexts that share the same agent
identity** (i.e. "threads" in the Discord sense), neither mode fits. Subagent
is correct identity-wise but spams the root with reports.

### Solution

Add a third spawn mode: **Standalone Session.**

- Same agent identity as the parent (so it's still "Pepper", with same SOUL.md,
  workspace, memory)
- Child of `agent:<name>:main` (uses existing key namespace
  `agent:<name>:subagent:<uuid>`)
- **No completion monitor** → no report-back to the root → no clutter
- Surfaced as a separate `+` button in the AGENTS panel header (additive UI
  change → minimal upstream merge conflicts)

### Implementation plan

**Server (Node):**
- `server/lib/subagent-spawn.ts` — add optional `silent: boolean` to
  `SpawnSubagentParams`. When `silent`, skip `startCompletionMonitor` in
  `launchDirect`.
- `server/routes/sessions.ts` — extend `spawnSubagentSchema` with optional
  `silent` boolean. No new endpoint; reuse `/api/sessions/spawn-subagent`.

**Client (React/TS):**
- `src/contexts/SessionContext.tsx` — extend `SpawnSessionOpts.kind` with
  `'standalone'`. Route through the same endpoint with `silent: true`.
- `src/features/sessions/SpawnStandaloneDialog.tsx` — **new file** (additive).
  Minimal dialog: task input + label only (model/thinking/cleanup inherit).
- `src/features/sessions/SessionList.tsx` — add a second `+` button in the
  AGENTS panel header (icon: `Layers` from lucide). ~5 lines.

**Why this minimises merge conflicts:**
- Existing `SpawnAgentDialog.tsx` is **untouched** — upstream changes there
  won't conflict with us.
- All our new code lives in a new file (`SpawnStandaloneDialog.tsx`).
- Edits to existing files are tiny and localised.

## How to update from upstream

When daggerhashimoto pushes new commits to `master`:

```bash
cd ~/nerve

# Get latest upstream state
git fetch upstream

# Update our master (fast-forward)
git checkout master
git merge upstream/master
git push origin master

# Bring our feature branches up to date
git checkout local-gpu-fixes
git rebase upstream/master           # or merge if conflicts get scary
# resolve any conflicts, then:
git push origin local-gpu-fixes --force-with-lease

# Same for any active feature branches
git checkout feature/standalone-session
git rebase local-gpu-fixes
git push origin feature/standalone-session --force-with-lease

# Rebuild & restart
npm install                          # if package.json changed upstream
npm run build
launchctl kickstart -k gui/$(id -u)/com.nerve.server
```

If a rebase gets messy, prefer `git merge` instead — keeps history but is
safer when you're not sure what you're doing.

## How to start a new feature

```bash
cd ~/nerve
git checkout local-gpu-fixes         # or master if the feature should target upstream
git pull
git checkout -b feature/<name>
# ... make changes ...
git add -A && git commit -m "feat: describe change"
git push -u origin feature/<name>
```

To open a PR against upstream:

```bash
gh pr create --repo daggerhashimoto/openclaw-nerve \
  --base master \
  --head qubeio:feature/<name> \
  --title "..." --body "..."
```

## Build & deploy (this Mac)

This repo is the running production copy. After any code change:

```bash
cd ~/nerve
npm run build
launchctl kickstart -k gui/$(id -u)/com.nerve.server
# verify
curl -sI http://localhost:3080/ | head -1
tail -f ~/nerve/nerve.log
```

The build emits to `dist/` (frontend) and `server-dist/` (server). The launchd
service runs `node server-dist/index.js`.

## Operator notes (for Pepper)

- Andreas is "really bad at git" — assume he won't run any of these commands
  himself. Pepper does the git work.
- Always work on a feature branch, never directly on `master` or
  `local-gpu-fixes`.
- Push to `origin` (qubeio's fork), never to `upstream`.
- For upstream PRs, ask before opening — Andreas may want to review the diff
  first.
- After any deploy, sanity-check that the launchd service came back up
  cleanly. Hot reload doesn't always work for server-side changes.
- The OpenClaw config (`~/.openclaw/openclaw.json`) is *not* part of this repo
  — don't touch it from here.

## Known issues / TODOs

- [ ] Creating a "Root" agent via the existing dialog triggers a gateway
  restart due to a config-classifier bug in OpenClaw (not Nerve's fault, but
  affects the root spawn UX). Worth filing upstream against OpenClaw.
- [ ] Standalone Session marker-fallback path: not yet supported on macOS
  (direct path works fine, so deferred).
- [ ] Consider adding a `pepper-standalone` CLI wrapper for headless
  use (calls gateway RPC directly, bypasses Nerve entirely).

## Provenance

- **Forked at commit:** `b57a51f` (`fix: disable backdrop-filter and GPU-heavy
  CSS; trust Docker bridge IPs for Traefik proxy`)
- **Fork date:** 2026-04-25
- **Initial maintainer:** Pepper 🌶️ (with Andreas's sign-off)
