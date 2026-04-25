# 002: Client — extend SpawnSessionOpts with `standalone` kind

**Status:** Backlog
**Created:** 2026-04-25
**Updated:** 2026-04-25

## Objective

Add a third `kind` to the spawn-session client API: `'standalone'`. Wire it
through `SessionContext.spawnSession()` so it routes to the existing
`/api/sessions/spawn-subagent` endpoint with `silent: true`.

Depends on **task 001** (server must accept `silent`).

## Acceptance Criteria

- [ ] `SpawnSessionOpts.kind` in `src/contexts/SessionContext.tsx` is now
  `'root' | 'subagent' | 'standalone'`.
- [ ] `spawnSession()` has a new branch for `kind === 'standalone'` that:
  - Resolves the parent root key the same way as `'subagent'`
  - POSTs to `/api/sessions/spawn-subagent` with `silent: true`
  - Refreshes session list and switches focus to the new session
- [ ] Existing `'root'` and `'subagent'` flows are byte-identical.
- [ ] No new HTTP endpoint introduced — reuses existing one.

## Technical Notes

- Look at the existing `kind === 'subagent'` branch in `spawnSession()`
  (around line 905 in SessionContext.tsx) and copy it; the only difference is
  adding `silent: true` to the body.
- Consider extracting the shared body-building logic into a helper to avoid
  duplication.
- Don't expose `cleanup` in the standalone path (per task 001's decision —
  silent + cleanup='delete' is unsupported).

## Testing

Manual:
```js
// In browser devtools on http://nerve.localhost:
const ctx = /* somehow get SessionContext */;
await ctx.spawnSession({ kind: 'standalone', task: 'hello, standalone' });
// Verify new session appears in panel; no message lands in main's transcript.
```

## Subtasks

- [ ] Update type in `SpawnSessionOpts`
- [ ] Add `'standalone'` branch in `spawnSession()`

## Log

- 2026-04-25: Created.
