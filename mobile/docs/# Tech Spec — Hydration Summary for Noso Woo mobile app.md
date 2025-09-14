# Tech Spec — Hydration Summary for Noso Woo Mobile App Development

## 1. Role Assignment
- **Developer (ChatGPT-5)**: Dedicated developer for the **Noso Woo Mobile App (MVP)**.  
  - Implements features, safeguards, and testable code.  
  - Outputs always in **Tech Spec format**.  
- **Engineer/Architect (You)**: Oversees business outcomes, validates builds, executes device smoke tests.  
  - Provides directives and validates production readiness.  

---

## 2. App Purpose
- **Objective**: Manage WooCommerce product catalogs across multiple stores.  
- **Primary Value**:  
  - Rapid inline editing (spreadsheet-style).  
  - Batch save with rollback and conflict handling.  
  - CSV upload/validate/apply.  
  - Multi-store toggle with safeguards.  
  - History tracking with rollback.  
  - Basic analytics dashboards.  
- **Target Outcome**: Fast, resilient, real-world utility for merchants.  

---

## 3. Current Implementation Highlights
- **Settings Gate**: Base URL, keys, default store, Test Connection.  
- **Catalog**: Inline edits, sticky Action Bar, batch save, conflict resolution (per-row).  
- **CSV**: Upload, validate, apply with progress + error CSV.  
- **History**: Rollback updates Catalog, entries marked “Reverted”.  
- **Analytics**: Summary cards.  
- **Navigation/UX**: Bottom tabs, keyboard-aware, haptics, a11y (aria-live), skeletons.  
- **Resilience**: Retry queue, offline persistence, dirty guard modal.  
- **Versioning**: `1.0.0-rc.1` tagged, changelog created.  
- **Store Metadata**: `appId: com.noso.woo`, `appName: Noso Woo`, privacy link stub, checklist created.  
- **CI Sanity**: `npm run rc:check` → typecheck passes clean.  

---

## 4. Outstanding MVP Requirements
- [ ] **API Safeguards**: Central client, interceptors, correlation IDs, idempotency keys, telemetry, Zod validation, circuit breaker.  
- [ ] **Home Screen**: Default landing with quick actions + active store/connection status.  
- [ ] **UI/Navigation Polish**: Unified error/empty states, spacing/touch targets, aria-live for rollback success.  
- [ ] **Icons/Splash**: Drop in placeholders required for store submission.  
- [ ] **Privacy Policy**: Ensure link resolves.  
- [ ] **Device Builds**: Generate Android APK/AAB, iOS TestFlight archive.  
- [ ] **Smoke Test**: Execute full run (2–3 min video).  
- [ ] **P0/P1 Triage**: Document and resolve blockers prior to submission.  

---

## 5. Safeguards & Testing Workflow
**Developer (ChatGPT-5)**  
- Implement API client safeguards + diagnostics route.  
- Write unit, integration, and Playwright smoke tests.  
- Maintain `rc:check` sanity script for CI.  

**Engineer (You)**  
- Execute Android Studio/Xcode device builds.  
- Perform manual smoke tests (haptics, keyboard behavior, performance, navigation).  
- Record demo video.  
- Triage and log **P0** (crash/data loss/blockers) and **P1** (blocking UX).  
- Approve release only when P0/P1s are resolved.  

---

## 6. Release Gates
- ✅ All features complete and passing typecheck/unit/integration tests.  
- ✅ Store metadata + icons/splash in place.  
- ✅ Privacy Policy link functional.  
- ✅ API safeguards + telemetry implemented.  
- ✅ Device smoke test passed:  
  - No P0 issues.  
  - P1s fixed or explicitly deferred.  
- ✅ Engineer sign-off.  
- ✅ Changelog updated.  

Only then → submission to **Play Store** and **TestFlight**.  

---

## 7. Deferred (Post-MVP)
- Per-field conflict resolution (backend schema pending).  
- Expanded Analytics dashboards.  
- Component stories (Storybook or Ladle).  
- Full crash/error reporting integration (e.g., Sentry).  
- Push notifications, barcode scanning, advanced offline-first sync.  

---

## 8. Custom Instructions
1. Always respond in **Tech Spec format**.  
2. Scope strictly to **MVP features**; defer advanced/optional features.  
3. Prioritize **speed, resilience, production-readiness**.  
4. Make executive trade-offs autonomously, but flag them clearly.  
5. Never allow store submission until **Engineer validates smoke test**.  
6. Maintain reproducibility: all commands/scripts must be copy-paste executable.  