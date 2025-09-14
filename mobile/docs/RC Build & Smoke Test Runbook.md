# RC Build & Smoke Test Runbook

## Android RC Build
1. Prereqs: Android Studio + SDK; set `ANDROID_SDK_ROOT`.
2. Commands:
   - `npm run build`
   - `npx cap sync`
   - `npx cap open android` (or `npx cap run android` if SDK set)
3. In Android Studio:
   - Select device/emulator, Run.
   - Build → Generate Signed Bundle/APK → AAB for internal testing.

## iOS RC Build
1. Prereqs: macOS, Xcode, CocoaPods.
2. Commands:
   - `npm run build`
   - `npx cap sync`
   - `npx cap open ios`
3. In Xcode:
   - Select a device/simulator, Run.
   - Product → Archive → Distribute via TestFlight.

## Smoke Test Path (record 2–3 min)
- Settings: enter HTTPS Base URL + REST API keys → Save → Test Connection (success toast).
- Catalog: edit multiple rows → Batch Save → Summary sheet appears → Jump to first failed/conflict.
- Conflicts: Use Server and Keep Local & Retry paths (stub/live) behave as expected.
- CSV: upload → Validate → Apply → progress shown; download errors CSV.
- History: rollback an entry → Catalog row updated + focused + highlighted.
- Analytics: summary cards load.

## P0/P1 Issue Log (template)
- P0: [title]
  - Repro: [steps]
  - Expected:
  - Actual:
  - Notes/Fix:
- P1: [title]
  - Repro: [steps]
  - Expected:
  - Actual:
  - Notes/Deferral:

## Store Metadata Verify
## DEV Diagnostics & Circuit Breaker
- Toggle Diagnostics: available only in DEV at `/diagnostics`.
- Trigger Circuit Breaker: cause 5× 503 or timeouts within ~60s; banner appears. Tap "Retry now" once after ~30s to probe; on success, breaker closes.

## Build Scripts
- Android AAB: `npm run build:android:aab`
- Android APK: `npm run build:android:apk`
- Android both: `npm run build:android:all`
- iOS archive: `npm run build:ios:archive`
- iOS IPA: `npm run build:ios:ipa`

## Assets Generation (Deterministic)
1. Prepare conventional files:
   - `npm run assets:prepare`
2. Generate platform assets:
   - `npm run assets:generate`
Notes: Ensure source PNGs are sRGB, 8-bit; icon flattened, no alpha. No capacitor.assets.json is used; defaults look for assets/icon.png and assets/splash.png.

## Pre-Build Checklist (one-liner)

```bash
npm run assets:prepare && npm run assets:generate && npm run rc:check && npm run e2e:smoke
```

## iOS Signing Quick Start
1) In Xcode: Targets → App → Signing & Capabilities: select your Team.
2) Set Versions: `MARKETING_VERSION = 1.0.0-rc.2`, increment `CURRENT_PROJECT_VERSION` by +1.
3) Archive (Product → Archive) with Release configuration.
4) Export IPA using `ios/ExportOptions.plist` (method=app-store). Diagnostics is DEV-only; /diagnostics is not routable in Release.

## Smoke CSV Fixture
- Use the provided 3-row CSV for Validate → Apply during smoke:
  - `mobile/fixtures/smoke/products-sample.csv`
- Name/Bundle ID: from `capacitor.config.ts` show correctly.
## Release Sanity Checklist
- [ ] `npm run assets:prepare && npm run assets:generate && npm run rc:check && npm run e2e:smoke`
- [ ] Android signed release: `npm run build:android:aab` (Play upload) and `npm run build:android:apk` (side-load)
- [ ] iOS archive/export: `npm run build:ios:archive && npm run build:ios:ipa`
- [ ] Settings footer shows correct `name • bundleId • version (build)`
- [ ] `/diagnostics` not routable in Release build
- [ ] Smoke CSV path: `mobile/fixtures/smoke/products-sample.csv` validates/applies

## Handoff Note
RC.2 code is frozen; only P0/P1 hotfixes will be accepted. Use the issue templates in `.github/ISSUE_TEMPLATE/` and follow `docs/triage.md` for severity and hotfix branch flow.

One-liner pre-build command:
`npm run assets:prepare && npm run assets:generate && npm run rc:check && npm run e2e:smoke`

Smoke path (record 2–3 min): Home status → Catalog inline edit → Batch Save → CSV validate/apply (3 rows) → History rollback (aria-live announces) → Analytics → circuit breaker 'Retry now' probe.
- Splash: visible at launch; hidden via `SplashScreen.hide()` when app ready.
- Icons: placeholders render.
- Privacy Policy URL: present where required (store listing or in-app link).
