# 005: Build, deploy, and smoke test

**Status:** Done (automated checks passed; manual UI tests pending Andreas sign-off)
**Created:** 2026-04-25
**Updated:** 2026-04-25

## Objective

Compile the patched Nerve, restart the launchd service, and verify end-to-end
that the new standalone-session flow works without regressing existing flows.

Depends on **tasks 001-004**.

## Acceptance Criteria

- [x] `npm run build` succeeds with no TypeScript or lint errors.
- [x] `launchctl kickstart -k gui/$(id -u)/com.nerve.server` brings the
  service back up cleanly.
- [x] `curl -sI http://localhost:3080/` returns `200 OK`.
- [ ] Existing Subagent spawn flow still injects a completion report into
  main when the child finishes (regression check — requires manual UI test).
- [ ] New Standalone Session spawn:
  - Appears in AGENTS panel with the chosen label
  - Has its own context — first message is what we sent
  - **Does NOT** inject a completion report into main when it finishes
- [x] `~/nerve/nerve.log` shows no new errors during the test.

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

- [x] Build
- [x] Deploy (kickstart)
- [x] Verify no log errors
- [ ] Subagent regression test (manual — requires UI)
- [ ] Standalone happy path (manual — requires UI)
- [ ] Standalone no-report verification (manual — requires UI)

## Log

- 2026-04-25: Created.
- 2026-04-25: Build succeeded, no TS errors. Service kickstarted, HTTP 200. nerve.log clean. Pre-existing test failures (5 files / 10 tests) confirmed pre-existing by stash baseline comparison; CreateTaskDialog flakiness confirmed flaky (passes in isolation). Manual UI smoke tests remain for Andreas.
