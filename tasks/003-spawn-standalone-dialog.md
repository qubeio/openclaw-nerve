# 003: New SpawnStandaloneDialog component

**Status:** Done
**Created:** 2026-04-25
**Updated:** 2026-04-25

## Objective

Create a new, minimal dialog component for launching standalone sessions.
Lives alongside the existing `SpawnAgentDialog.tsx` but is fully separate so
upstream changes to the existing dialog don't conflict with us.

Depends on **task 002**.

## Acceptance Criteria

- [x] New file: `src/features/sessions/SpawnStandaloneDialog.tsx`.
- [x] Component accepts: `open`, `onOpenChange`, `onSpawn` (same signature as
  existing `SpawnAgentDialog`).
- [x] Form fields:
  - **Task** (textarea, required) — first message to send
  - **Label** (text, optional) — display name in panel
  - **Parent root** (select, defaults to current root) — only relevant if
    multiple top-level agents exist; hidden if only one
  - Model + Thinking inherit silently (no UI for these in the bare dialog)
- [x] Submit calls `onSpawn({ kind: 'standalone', task, label, parentSessionKey })`.
- [x] Cancel/Escape closes the dialog and resets form state.
- [x] Visually consistent with `SpawnAgentDialog` (same Dialog primitives,
  same input components — `InlineSelect` etc.). Reuse existing UI components.

## Technical Notes

- Keep this dialog **deliberately minimal**. The whole point of standalone
  sessions is fast, low-ceremony spawning. If users want to fiddle with model
  / thinking / cleanup, they can use the full SpawnAgentDialog → Subagent
  mode.
- Reuse `getRootAgentSessionKey` and `getTopLevelAgentSessions` from
  `./sessionKeys`.
- Don't add `cleanup` selector — silent + cleanup is unsupported per task 001.
- Title: "New standalone session"
- Description: "Same agent identity as the parent. Isolated context. No
  reports back to the parent."

## Testing

Manual: open dialog, fill in task, submit, verify session appears in panel
with the expected label and that the task message is the first thing the
session sees.

## Subtasks

- [x] Scaffold component with imports
- [x] Form state + validation
- [x] Wire submit → onSpawn
- [x] Style/reuse existing UI primitives

## Log

- 2026-04-25: Created.
- 2026-04-25: Implemented. Used plain `<select>` rather than `InlineSelect` for the parent picker (InlineSelect is designed for toolbar use, not a form field). Matches Dialog/Button primitives from SpawnAgentDialog; identical visual shell.
