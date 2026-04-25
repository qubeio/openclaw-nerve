# 006: (Optional) Open upstream PR

**Status:** Backlog
**Created:** 2026-04-25
**Updated:** 2026-04-25

## Objective

Once the standalone-session feature has been live on Andreas's local Nerve
for at least a week without issues, consider opening a PR against
`daggerhashimoto/openclaw-nerve`.

This task is **optional** — only do this if Andreas wants to share the
feature upstream. Otherwise, mark this task `Done` with a "decided not to
upstream" note.

## Acceptance Criteria

- [ ] Feature has been running locally for ≥7 days without issues.
- [ ] Andreas signs off on opening the PR.
- [ ] PR description explains the use case (Discord-thread-like isolated
  sessions without report-back pollution).
- [ ] PR includes:
  - Server: `silent` flag
  - Client: `'standalone'` kind
  - New `SpawnStandaloneDialog` component
  - Panel button
  - PRD-style note in the PR body summarising the design decisions
- [ ] PR addresses any review feedback.

## Technical Notes

```bash
gh pr create --repo daggerhashimoto/openclaw-nerve \
  --base master \
  --head qubeio:feature/standalone-session \
  --title "feat: add Standalone Session spawn mode" \
  --body-file .github/PR_BODY.md
```

Before opening, rebase the feature branch onto `upstream/master` to avoid
trivial conflicts:

```bash
git fetch upstream
git checkout feature/standalone-session
git rebase upstream/master
git push --force-with-lease origin feature/standalone-session
```

## Subtasks

- [ ] Wait 7 days
- [ ] Get Andreas's sign-off
- [ ] Rebase onto upstream
- [ ] Draft PR body
- [ ] Open PR
- [ ] Address review

## Log

- 2026-04-25: Created.
