# Tech Spec — Noso Woo MVP Deployment Readiness

## Purpose
This document defines the deployment readiness state of the **Noso Woo** MVP.  
It consolidates features implemented, pending work, safeguards, testing responsibilities, and release gates.  
Goal: **No Play Store/TestFlight submission until all tests pass and P0/P1 issues are resolved.**

---

## 1. App Purpose & Value
- **Purpose:** Manage WooCommerce product catalogs quickly and reliably.  
- **User Intent:** Small–mid merchants use the app to edit stock, pricing, names, and SKUs across multiple stores with minimal friction.  
- **Value Provided:**  
  - Rapid inline catalog editing (spreadsheet-like UX).  
  - Batch save with rollback and conflict resolution.  
  - CSV upload/apply pipeline.  
  - Per-store history with rollback.  
  - Analytics overview.  
  - Store toggle with safeguards.  
  - API resilience (retry queue, offline persistence).  

---

Feature Summary (Implemented)
- Settings & Multi-Store
  - Settings Gate (Base URL, keys, default store, Test Connection), redirect to /home when configured.
  - Settings footer shows app name, bundle id, version/build via Capacitor App.getInfo().

- Home
  - Minimal Home with quick actions (Catalog, CSV, History, Analytics; DEV-only Diagnostics) and connection status tile with “Check Now”.

- Catalog & Editing
  - Spreadsheet-style inline editing with sticky Action Bar, batch save, per-row conflict handling, dirty guard modal, focus/highlight on updates.

- CSV Pipeline
  - Upload → Validate → Apply with progress; downloadable error CSV.
  - Zod validation for CSV validate/status; schema-aligned endpoints.

- History & Rollback
  - Per-store history with diffs/timestamps; rollback updates Catalog and marks entries “Reverted”.
  - a11y: aria-live announces “Rollback completed”.

- Analytics
  - Summary cards; unified `ErrorCard`; `EmptyState` adopted (Catalog; Analytics cleaned).

- Navigation / UX / Resilience / a11y
  - Bottom tabs, keyboard-aware views, haptics, skeleton loaders.
  - Retry queue + offline persistence; shared Empty/Error states; aria-live/focus flows.

- API Safeguards & Validation
  - Central API client: HTTPS/auth checks, 10s timeout, GET retries with backoff, correlation-id + idempotency headers.
  - Zod validation for products list, batch update, CSV endpoints, rollback.
  - Circuit breaker: closed→open (≥5 5xx/timeout in 60s)→half-open (30s cool-off)→closed on success; global banner with single “Retry now” probe.
  - Telemetry ring buffer (DEV) emitting `api_req`, `api_res`, `cb_open/half_open/closed`.

- Diagnostics (DEV-only)
  - `/diagnostics` screen shows last 50 events; hard-gated from Release via conditional imports + runtime guard.

- Privacy & Compliance
  - In-app Privacy Policy at `/privacy`, linked from Settings and footer.

- Branding & Build Tooling
  - Deterministic assets pipeline: placeholders in `assets/icon.png`, `assets/splash.png`; scripts `assets:prepare`, `assets:generate` (Capacitor defaults).
  - Android/iOS build wrappers: `build:android:aab`, `build:android:apk`, `build:android:all`, `build:ios:archive`, `build:ios:ipa`; iOS `ExportOptions.plist`.

- Versioning, Docs, Tests
  - Version bumped to `1.0.0-rc.2`; CHANGELOG + RC Runbook updated (diagnostics toggle, breaker trigger, asset/build commands).
  - CI sanity script `rc:check` (typecheck+lint) passing; unit, integration, and e2e smoke scripts passing locally.

---

MVP Checklist (Outstanding to Deploy) — Priority Ordered
- [ ] Generate platform assets on the release machine (`npm run assets:prepare && npm run assets:generate`) and verify in Android Studio/Xcode (no missing/warning icons).  
  Rationale: Ensures icon/splash are embedded correctly for store acceptance.

- [ ] Configure signing for Release builds (Android keystore + `release` signingConfig; iOS Team/automatic signing with valid provisioning) and confirm versioning (iOS MARKETING_VERSION/CURRENT_PROJECT_VERSION = 1.0.0-rc.2/+1; Android versionCode/versionName match).  
  Rationale: Required to archive, sign, and distribute builds.

- [ ] Produce Release artifacts using provided scripts (AAB, APK, `.xcarchive`, `.ipa`) on a clean machine.  
  Rationale: Deliverables needed for TestFlight/Play Console distribution.

- [ ] Execute real-device smoke test (Android + iOS) and record 2–3 min video: Home status → Catalog inline edit → Batch Save → CSV validate/apply (3-row sample) → History rollback (aria-live heard) → Analytics open → trigger breaker probe path.  
  Rationale: Validates stability, safeguards, and accessibility end-to-end.

- [ ] Triage outcomes: fix all P0 (crash/data-loss/blocked save/rollback); resolve or explicitly defer P1 with rationale; update CHANGELOG and bump to `rc.3` if fixes land.  
  Rationale: Meets release gates for stability and transparency.

- [ ] Upload builds to TestFlight and Play Console (internal/testing track) with minimal listing metadata (app name, category, privacy URL).  
  Rationale: Enables tester distribution and final validation prior to submission.

- [ ] Final engineer sign-off after verifying: Privacy page renders offline, Diagnostics absent in Release builds, version/build footer matches artifacts.  
  Rationale: Confirms compliance and build provenance before submission.

Validation
- Implemented features reflect both your doc and all subsequent session updates (Home quick actions, circuit breaker, DEV-gated diagnostics, deterministic assets pipeline, rc.2, build wrappers/tests).  
- Checklist is deployability-only, specific, and free of post-MVP scope.

Acceptance Criteria
- Feature Summary is complete and aligned.  
- Checklist items are actionable, prioritized, and sufficient to ship a deployable MVP upon completion.





Ask ChatGPT
