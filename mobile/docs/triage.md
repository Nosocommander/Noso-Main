# P0/P1 Triage

## Severity Definitions
- P0 Blocker: Crash, data loss, or flow cannot proceed.
- P1 Blocking UX: Critical UX break that blocks flow but not a crash.

## Filing
Use issue templates:
- .github/ISSUE_TEMPLATE/p0_blocker.md
- .github/ISSUE_TEMPLATE/p1_blocking_ux.md

Include: repro steps, expected vs actual, screens/video link, platform, and build info from Settings footer.

## Hotfix Flow
- Branch: `hotfix/rc.2-<short-slug>`
- Implement minimal fix; add CHANGELOG entry under `1.0.0-rc.3`.
- Run: `npm run rc:check && npm run test:unit && npm run test:int && npm run e2e:smoke`.
- Open PR titled `RC.2 Hotfix — <short description>`; on merge, bump version to rc.3 and tag.
