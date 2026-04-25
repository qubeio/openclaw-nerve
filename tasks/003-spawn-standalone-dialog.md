# 003: New SpawnStandaloneDialog component

**Status:** Backlog
**Created:** 2026-04-25
**Updated:** 2026-04-25

## Objective

Create a new, minimal dialog component for launching standalone sessions.
Lives alongside the existing `SpawnAgentDialog.tsx` but is fully separate so
upstream changes to the existing dialog don't conflict with us.

Depends on **task 002**.

## Acceptance Criteria

- [ ] New file: `src/features/sessions/SpawnStandaloneDialog.tsx`.
- [ ] Component accepts: `open`, `onOpenChange`, `onSpawn` (same signature as
  existing `SpawnAgentDialog`).
- [ ] Form fields:
  - **Task** (textarea, required) — first message to send
  - **Label** (text, optional) — display name in panel
  - **Parent root** (select, defaults to current root) — only relevant if
    multiple top-level agents exist; hidden if only one
  - Model + Thinking inherit silently (no UI for these in the bare dialog)
- [ ] Submit calls `onSpawn({ kind: 'standalone', task, label, parentSessionKey })`.
- [ ] Cancel/Escape closes the dialog and resets form state.
- [ ] Visually consistent with `SpawnAgentDialog` (same Dialog primitives,
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

- [ ] Scaffold component with imports
- [ ] Form state + validation
- [ ] Wire submit → onSpawn
- [ ] Style/reuse existing UI primitives

## Log

- 2026-04-25: Created.
