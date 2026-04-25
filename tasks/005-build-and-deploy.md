# 005: Build, deploy, and smoke test

**Status:** Backlog
**Created:** 2026-04-25
**Updated:** 2026-04-25

## Objective

Compile the patched Nerve, restart the launchd service, and verify end-to-end
that the new standalone-session flow works without regressing existing flows.

Depends on **tasks 001-004**.

## Acceptance Criteria

- [ ] `npm run build` succeeds with no TypeScript or lint errors.
- [ ] `launchctl kickstart -k gui/$(id -u)/com.nerve.server` brings the
  service back up cleanly.
- [ ] `curl -sI http://localhost:3080/` returns `200 OK`.
- [ ] Existing Subagent spawn flow still injects a completion report into
  main when the child finishes (regression check).
- [ ] New Standalone Session spawn:
  - Appears in AGENTS panel with the chosen label
  - Has its own context — first message is what we sent
  - **Does NOT** inject a completion report into main when it finishes
- [ ] `~/nerve/nerve.log` shows no new errors during the test.

## Technical Notes

```bash
cd ~/nerve
npm run build
launchctl kickstart -k gui/$(id -u)/com.nerve.server

# wait ~3s for service
sleep 3
curl -sI http://localhost:3080/ | head -1
tail -f ~/nerve/nerve.log    # watch in another terminal
```

If the build fails on type errors in the new dialog, fix before kickstarting.
Don't deploy a half-built version.

To verify the no-report behaviour, snapshot the root session's transcript
file before spawning, spawn + wait for the child to go idle, then diff:

```bash
ROOT_FILE=$(jq -r '."agent:main:main".sessionFile' \
  ~/.openclaw/agents/main/sessions/sessions.json)
wc -l "$ROOT_FILE"
# spawn standalone, wait
wc -l "$ROOT_FILE"
# line count should NOT have grown
```

## Testing

End-to-end manual smoke test as above. Add notes to the log if anything
surprised.

## Subtasks

- [ ] Build
- [ ] Deploy (kickstart)
- [ ] Verify no log errors
- [ ] Subagent regression test
- [ ] Standalone happy path
- [ ] Standalone no-report verification

## Log

- 2026-04-25: Created.
