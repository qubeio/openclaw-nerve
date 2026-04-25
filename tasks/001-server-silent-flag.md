# 001: Server — add `silent` flag to spawn-subagent flow

**Status:** Done
**Created:** 2026-04-25
**Updated:** 2026-04-25

## Objective

Allow the server-side `spawnSubagent()` helper and `/api/sessions/spawn-subagent`
endpoint to skip the post-launch completion monitor when the caller requests
it. This is the foundation for "Standalone Session" mode: a child of the root
that runs without ever injecting a "completion report" back into the root.

## Acceptance Criteria

- [x] `SpawnSubagentParams` in `server/lib/subagent-spawn.ts` has an optional
  `silent?: boolean` field.
- [x] `launchDirect()` skips `startCompletionMonitor()` when `silent === true`.
- [x] The marker-fallback path either supports `silent` or fails fast with a
  clear error if the caller asks for `silent` while only the marker path is
  available. (Direct path works on macOS, so this is not blocking.)
- [x] `spawnSubagentSchema` (zod) in `server/routes/sessions.ts` accepts
  optional `silent: boolean`.
- [x] The route handler passes `silent` through to `spawnSubagent()`.
- [x] Existing behaviour (calls without `silent`) is byte-identical: monitor
  runs, parent gets a report. No regression for current Subagent flow.
- [x] Unit test in `server/lib/subagent-spawn.test.ts` confirms:
  - `silent: true` → `activeMonitors` does NOT gain the new child key
  - `silent: false` (or omitted) → monitor registered as before

## Technical Notes

- The relevant entry points: `launchDirect` and `launchViaMarker` both end by
  returning a `SpawnSubagentResult`. The monitor is started inside
  `launchDirect` only — the marker path doesn't currently start one (it just
  returns the discovered session key). So implementing `silent` for the
  direct path is sufficient for our use case.
- Don't introduce a separate route. Extending the existing endpoint is simpler
  and keeps the diff tighter against upstream.
- The `cleanup` parameter (`'keep' | 'delete'`) is independent — when `silent`
  is true and `cleanup` is `'delete'`, there's no monitor to handle the
  deletion. Either:
  - (a) When silent, force `cleanup: 'keep'` and ignore the request
  - (b) When silent + delete, schedule a simple delayed delete (e.g. 24h
    after creation) — overkill for now
  - **Decision:** go with (a) and document the constraint.

## Testing

```bash
cd ~/nerve
npm test -- server/lib/subagent-spawn.test.ts
```

Manual smoke test (after task 005 is integrated):

```bash
curl -s -XPOST http://localhost:3080/api/sessions/spawn-subagent \
  -H 'Content-Type: application/json' \
  -d '{"parentSessionKey":"agent:main:main","task":"hello","silent":true}'
# Expect: { "ok": true, "sessionKey": "agent:main:subagent:...", "mode": "direct" }
# Wait ~30s, then check that no completion report appears in
# ~/.openclaw/agents/main/sessions/<root-session-file>.jsonl
```

## Subtasks

- [x] Implement `silent` in `subagent-spawn.ts`
- [x] Update zod schema + route handler in `sessions.ts`
- [x] Add/extend unit tests in `subagent-spawn.test.ts`

## Log

- 2026-04-25: Created. Branched off `feature/standalone-session`.
- 2026-04-25: Implemented. Decision: `silent + cleanup='delete'` forces `keep` (no monitor = no deletion trigger). Marker-fallback path passes `silent` through transparently — it never starts a monitor regardless, so behaviour is correct without extra code.
