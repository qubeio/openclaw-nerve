# 004: Add second `+` button to AGENTS panel

**Status:** Backlog
**Created:** 2026-04-25
**Updated:** 2026-04-25

## Objective

Add a second icon button in the AGENTS panel header that opens the new
`SpawnStandaloneDialog`. Keep the existing `+` button (opens
`SpawnAgentDialog`) untouched.

Depends on **task 003**.

## Acceptance Criteria

- [ ] In `src/features/sessions/SessionList.tsx`, add a new icon button next
  to the existing "Create session" `+` button.
- [ ] Icon: `Layers` (or similar) from lucide — visually distinct from `Plus`.
- [ ] Tooltip / aria-label: "New standalone session"
- [ ] Clicking opens `SpawnStandaloneDialog` (separate state from
  `spawnOpen`).
- [ ] When dialog submits successfully, dialog closes and panel refreshes
  (same pattern as existing flow).
- [ ] Existing `+` button behaviour is unchanged.

## Technical Notes

- Look for the `setSpawnOpen` state hook in `SessionList.tsx` (~line 58) and
  add a parallel `setStandaloneOpen` state.
- The dialog should be rendered alongside the existing
  `<SpawnAgentDialog />` (~line 280) — both are conditional on `onSpawn` being
  provided.
- Pass the same `onSpawn` callback to both dialogs — `SessionContext` handles
  routing based on `kind`.
- Visual placement: put the new button **before** the existing `+` so the
  fast-path is left-most. Or after — operator preference. Default to "before"
  so common case is leftmost.

## Testing

Manual:
1. Open Nerve UI
2. AGENTS panel header now shows two `+`-style icons
3. Click the standalone one → new dialog opens
4. Click the original one → existing dialog opens (unchanged)
5. Both flows complete successfully

## Subtasks

- [ ] Add new state hook
- [ ] Add new button in header JSX
- [ ] Render new dialog
- [ ] Verify no regression in existing button

## Log

- 2026-04-25: Created.
