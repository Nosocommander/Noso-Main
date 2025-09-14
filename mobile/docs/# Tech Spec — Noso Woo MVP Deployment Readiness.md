# Tech Spec — Noso Woo MVP Deployment Readiness

## Purpose
Noso Woo is a **mobile-first WooCommerce catalog manager** designed for merchants to:
- Rapidly edit product stock, price, name, and SKU on the go.
- Manage variations inline (sizes/colors).
- Perform batch saves (spreadsheet-style) with rollback and conflict handling.
- Upload and validate CSV files for bulk operations.
- View basic analytics and low-stock warnings.
- Switch between multiple stores seamlessly.

## User Intent & Use Cases
- **On-the-go inventory control**: adjust stock after deliveries or sales.
- **Variation editing**: manage SKUs quickly from a mobile device.
- **Bulk imports**: apply changes via CSV with validation feedback.
- **Data safety**: rollback mistakes and resolve conflicts transparently.
- **Quick insight**: basic analytics to inform reordering and stock health.

## Value Proposition
- **Speed**: batch edits and inline changes reduce manual overhead.
- **Reliability**: conflict handling and rollback prevent silent overwrites.
- **Mobility**: optimized for mobile workflows, with native haptics and gestures.
- **Simplicity**: unifies multiple store management in one app.

---

## Architecture Engineer Responsibilities Pre-Release

### Backend Contract Lock-in
- **Conflict schema**: `{ reason, server, local, version/etag }` (per-row acceptable for MVP).
- **Rollback schema**: `{ productId/variationId, fieldsChanged, newValues, version }`.
- **Decision**: if delayed, ship with **per-row conflict resolution** and rollback via event/refetch.

### Device Build & Distribution
- Produce Android APK/AAB and iOS TestFlight builds.
- Ensure production builds are clean (dev logs disabled).

### End-to-End Smoke Test (recorded)
- **Path**: Settings (configure) → Catalog (multi-edit + save + summary + jump) → Conflict resolve → CSV validate/apply → History rollback → Analytics.
- **Acceptance Gates**:
  - No crashes or dead-ends.
  - 60fps scroll, <50ms edit repaint on mid-tier devices.
  - Batch save executes one request per submit; summary + jump functional.
  - Accessibility: aria-live announces batch results; focus + highlight applied to rows.

---

## Testing Requirements

### Functional
- [ ] Settings gate blocks misconfigured access; persists credentials and default store.
- [ ] Catalog supports inline edits, batch save, undo all.
- [ ] Review Drawer shows diffs before save.
- [ ] Conflicts: Use Server + Keep Local & Retry paths work.
- [ ] History rollback updates Catalog immediately; entries marked Reverted.
- [ ] CSV validate + error CSV download + apply with progress.
- [ ] Store switching works with dirty state guard modal.

### Performance
- [ ] Scroll ≈60fps on mid-tier Android/iPhone.
- [ ] Edit repaint ≤50ms.
- [ ] Memoization applied if metrics exceed thresholds.

### Resilience
- [ ] Offline save → batch queued → retry succeeds on reconnect.
- [ ] Network interruption during CSV apply recovers or reports error gracefully.
- [ ] App resumes with dirty state preserved and prompts triggered.

### Accessibility & UX
- [ ] aria-live announces save results.
- [ ] Focus + highlight after Jump to row.
- [ ] Keyboard does not obscure Action Bar.

---

## Refinements & Polishing
1. **Conflict/rollback parsing** — finalize or fallback safe.
2. **Settings gate copy and UX polish**.
3. **Minimal Analytics (summary cards only)**.
4. **Store metadata**: app name, ID, version/build, icons/splash, privacy policy URL.
5. **QA pass**: resolve P0/P1 issues only; defer lower-priority polish.

---

## Release Checklist
- [ ] Backend contracts integrated or safe fallback documented.
- [ ] Android/iOS builds distributed.
- [ ] Smoke test recorded; P0/P1 list with fixes.
- [ ] Store metadata and required assets ready.
- [ ] Native features verified: splash, haptics, share, retry queue.
- [ ] Version set (e.g., 1.0.0) and changelog drafted.

---

## Executive Trade-offs
- **Per-field conflict resolution**: deferred to post-MVP if schema late.
- **Advanced CSV resumable/cancel flows**: post-MVP.
- **Deep analytics/drill-downs**: post-MVP.
