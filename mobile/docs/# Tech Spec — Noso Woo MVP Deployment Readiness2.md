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

## 2. Implemented Features ✅
- **Settings Gate**  
  - Base URL, API key/secret, default store ID.  
  - Test Connection.  
  - Redirect + banner if not configured.  

- **Catalog**  
  - Inline edits (stock, price, name, SKU).  
  - Variations expand/collapse.  
  - Dirty state buffer.  
  - Sticky Action Bar (pending changes, Review, Save, Undo all).  
  - Batch save API with optimistic reconciliation.  
  - Conflict UI (Use Server / Keep Local & Retry).  
  - Row highlighting + focus after jump.  
  - Dirty guard modal on store switch.  

- **CSV**  
  - Upload, validate, errors CSV download.  
  - Apply mode with polling and progress bar.  

- **History**  
  - Per-store entries with diffs and timestamps.  
  - Rollback → Catalog reconciliation and row highlight.  
  - Entries marked “Reverted”; Hide Reverted toggle.  

- **Analytics**  
  - Summary cards (sales, stock, etc. — stubbed/extendable).  

- **Navigation & UX**  
  - Bottom tab navigation with icons/labels.  
  - Keyboard-aware Action Bar and FAB.  
  - Haptics on Save, Rollback, Store Switch.  
  - A11y: aria-live announcements on save; focus order.  
  - Loading skeletons, empty/error states.  

- **Resilience**  
  - Retry queue for offline batch saves.  
  - Flush on reconnect; failures retained.  
  - Dirty state persisted; prompts on leave/switch.  

- **Performance Tools**  
  - Dev-only perf hooks: scroll FPS, repaint times.  

- **Production Hygiene**  
  - DEV-only logs gated.  
  - Versioning set (`1.0.0-rc.1`).  
  - Changelog created.  
  - Store metadata checklist started.  
  - Privacy policy link stub added.  

---

## 3. Safeguards & Tracking
- Centralized API client (in progress):  
  - Request/response interceptors.  
  - Correlation IDs + idempotency keys.  
  - Telemetry events (`api_req`, `api_res`).  
  - Zod validation on risky endpoints.  
  - Timeout + backoff on GETs.  
  - Circuit breaker for repeated 5xx.  
- Diagnostics screen (DEV): ring buffer of last 50 calls.  
- HTTPS enforcement + auth presence checks.  

---

## 4. Outstanding Requirements (MVP Critical)
- [ ] **Finalize API safeguards**: client wrapper, telemetry, validation, idempotency.  
- [ ] **Home screen**: minimal landing with quick actions, active store, connection status.  
- [ ] **UI polish**: unify error/empty states, confirm spacing/touch targets, aria-live for rollback success.  
- [ ] **Icons/splash placeholders**: required for store submissions.  
- [ ] **Privacy Policy URL**: stub ok now; must resolve.  
- [ ] **Device builds**: Android APK/AAB; iOS TestFlight.  
- [ ] **Smoke test on device**: full run through all flows, 2–3 min video, P0/P1 log.  
- [ ] **P0/P1 triage + fixes** before submission.  

---

## 5. Testing Workflow
**Developer (ChatGPT-5)**  
- Unit & integration tests.  
- Playwright smoke test (mock server).  
- Retry queue + circuit breaker logic.  
- API validation via Zod schemas.  
- CI sanity: `npm run rc:check`.  

**Engineer (You)**  
- Device builds (Android Studio, Xcode).  
- Run smoke test path.  
- Verify haptics, keyboard-aware UI, accessibility.  
- Performance check (scroll ~60fps, repaint <50ms).  
- Log P0/P1 issues.  
- Confirm telemetry/diagnostics works.  

---

## 6. Release Gates 🚦
- ✅ All core features implemented and passing unit/integration tests.  
- ✅ Store metadata + icons/splash present.  
- ✅ Privacy policy link resolves.  
- ✅ API safeguards + telemetry in place.  
- ✅ Device smoke test passes:  
  - No P0 (crash, data loss, blocked save/rollback).  
  - P1s fixed or explicitly deferred.  
- ✅ Engineer sign-off.  
- ✅ Changelog updated.  

Only then → Generate Signed APK/AAB (Android) & Archive/TestFlight (iOS).  

---

## 7. Deferred (Post-MVP)
- Per-field conflict resolution (flag present, backend schema pending).  
- Expanded Analytics dashboards.  
- Storybook/component stories (fixture route is enough for MVP).  
- Full error/crash reporting integration (e.g., Sentry).  
- Push notifications, barcode scanning, advanced offline-first sync.  

---

## 8. Current Status
- **RC 1.0.0-rc.1 ready.**  
- Typecheck + build pass.  
- RC runbook & store metadata docs created.  
- Next step: Engineer executes **device build + smoke test** and reports P0/P1.  
- Developer awaits P0/P1 triage before polishing for store submission.  

---
