# MVP Feature Summary & Checklist (with completion markers)

## Feature Summary (implemented so far)
- **Core Setup**
  - [x] React + Vite app scaffolded with Capacitor for Android/iOS builds.
  - [x] Ionic Router wired for native navigation and gestures (iOS back swipe, Android back handling).
  - [x] Tailwind CSS integrated with Ionic CSS import order corrected.
  - [x] Haptics and splash screen configured; retry queue and offline outbox added.

- **Settings**
  - [x] Settings page with Zod validation for API base URL, credentials, and default store ID.
  - [x] Test Connection feature implemented.
  - [x] Preferences persistence for settings and store selection.

- **Catalog**
  - [x] Product table with inline editing for stock, price, name, SKU.
  - [x] Draft buffer with **batch save** via sticky bottom Action Bar.
  - [x] Review Drawer to preview edits before save, with undo/reset options.
  - [x] Conflict diff UI scaffolded: per-row diff with Use Server / Keep Local & Retry.
  - [x] Store-switch guard modal: prompts Save/Discard when dirty.
  - [x] Keyboard-aware sticky Action Bar; FAB placement adjusted.
  - [x] Event bus for updates (rollback reconciliation, Jump-to-row focus).
  - [x] Accessibility: aria-live region announces batch save results; focus management for Jump actions.

- **CSV**
  - [x] CSV upload flow with validation, error reporting, and Apply mode.
  - [x] Progress polling and status reporting with error CSV download.

- **History**
  - [x] Infinite scroll History view with diffs and rollback stubs.
  - [x] Rollback API wired (stub initially, later reconciles Catalog row).
  - [x] Rollback emits event → Catalog reconciles instantly, highlights row.
  - [x] History entries can be marked “Reverted”; Hide Reverted toggle added.

- **Analytics**
  - [x] Basic Analytics tab scaffolded with loading/error polish and summary stub.

- **Polish & Performance**
  - [x] Skeleton loaders for Catalog and History lists.
  - [x] Performance sampling hooks (scroll FPS, edit repaint timing) in dev-only.
  - [x] Accessibility polish: labels for key controls, screen reader focus handling.
  - [x] Haptics aligned for Save, Error, Conflict, Rollback, Jump actions.

- **Build & Tooling**
  - [x] Build scripts added: `cap:sync`, `cap:android`, `cap:ios`.
  - [x] Internal smoke test flow defined (Settings → Catalog → CSV → History → Analytics).
  - [x] Dev-only logs guarded for production.

---

## MVP Checklist (remaining for release readiness)
1. [ ] **Integrate final backend conflict schema** — required to ensure conflict resolution reflects actual server logic (prevents silent overwrites).  
2. [ ] **Integrate final backend rollback schema** — needed for accurate multi-field reconciliation and version control.  
3. [ ] **Implement Settings gate** — block Catalog/CSV/History access until base URL + credentials validated, prevents failed calls on first run.  
4. [ ] **Finalize Analytics summary cards** — minimum viable stats to complete navigation tab, avoids an empty screen.  
5. [ ] **Prepare Android/iOS release builds** — generate APK/AAB + TestFlight with icons, splash, and version numbers for distribution.  
6. [ ] **Store readiness items** — app name, bundle ID, privacy policy URL, placeholder icons/splash if final assets not ready.  
7. [ ] **Run end-to-end device smoke test** — confirm Settings → Catalog batch save → conflict handling → CSV upload → History rollback flow on real devices.  
8. [ ] **Log P0/P1 issues only** — validate functional correctness and performance (<50ms repaint, smooth scroll) to clear release gate.  

## Acceptance
- With the checklist completed, app is **deployable to Play Store and App Store** as a working MVP with core catalog management, rollback, CSV handling, and multi-store support.