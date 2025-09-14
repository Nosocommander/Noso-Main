# Deployment Readiness Status Matrix

| Spec Item | Implemented? | Verified on Device? | Notes |
|---|---|---|---|
| Functional: Settings gate blocks misconfigured access; persists credentials and default store | Yes | Pending | `useSettingsGate` redirects to `/settings`; `settings.ts` persists via Preferences; copy could be polished. |
| Functional: Catalog supports inline edits, batch save, undo all | Yes | Pending | `CatalogTable`, `CatalogActionBar`, `useCatalogBatch`; undo all via `clearAll`. |
| Functional: Review Drawer shows diffs before save | Yes | Pending | `CatalogReviewDrawer` displays diffs. |
| Functional: Conflicts: Use Server + Keep Local & Retry paths work | Partial | Pending | UI present; single-row retry implemented; needs backend schema validation. |
| Functional: History rollback updates Catalog immediately; entries marked Reverted | Yes | Pending | `HistoryPage` emits updates and focus; marks `reverted`; API wired. |
| Functional: CSV validate + error CSV download + apply with progress | Yes | Pending | `CsvPage` validate/apply; status polling; errors CSV download. |
| Functional: Store switching works with dirty state guard modal | Yes | Pending | Guard via confirm in `App.tsx`; toast + haptics applied. |
| Performance: Scroll ≈60fps on mid-tier Android/iPhone | N/A code (instrumented) | Pending | `useScrollFps` dev-only logs FPS. Validate on device. |
| Performance: Edit repaint ≤50ms | N/A code (instrumented) | Pending | `useEditRepaintMetric` dev-only logs repaint ms. Validate on device. |
| Performance: Memoization applied if metrics exceed thresholds | Partial | Pending | `CatalogTable` memoized; further memoization if needed. |
| Resilience: Offline save → batch queued → retry succeeds on reconnect | Partial | Pending | `retryQueue` implemented, `enqueueMutation` used; flush handler is no-op; needs real flush integration and failure retention. |
| Resilience: Network interruption during CSV apply recovers or reports error gracefully | Yes | Pending | Error handling and toasts in `CsvPage`. |
| Resilience: App resumes with dirty state preserved and prompts triggered | Yes | Pending | Dirty map persisted to `localStorage`; leave prompt active. |
| Accessibility & UX: aria-live announces save results | Yes | Pending | `#aria-live-region` updated after batch save. |
| Accessibility & UX: Focus + highlight after Jump to row | Yes | Pending | Implemented in `CatalogPage` via `emitCatalogFocus`. |
| Accessibility & UX: Keyboard does not obscure Action Bar | Yes | Pending | `useKeyboard` adjusts `CatalogActionBar` bottom inset. |
| Refinement: Conflict/rollback parsing finalize or fallback | Partial | Pending | Safe per-row fallback implemented; finalize when backend ready. |
| Refinement: Settings gate copy and UX polish | Partial | Pending | Copy is functional but terse; add guidance. |
| Refinement: Minimal Analytics (summary cards only) | Yes | Pending | `AnalyticsPage` renders 4 summary cards; backend endpoint optional. |
| Refinement: Store metadata (name, ID, icons/splash, privacy URL) | Partial | Pending | `capacitor.config.ts` set; need icons/splash assets and privacy URL doc. |
| Release: Backend contracts integrated or fallback documented | Partial | Pending | Contracts mirrored in `api.ts`; fallback noted. |
| Release: Android/iOS builds distributed | No | No | To produce via Capacitor builds (AAB/APK, TestFlight). |
| Release: Smoke test recorded; P0/P1 list with fixes | No | No | To execute post-build. |
| Release: Native features verified: splash, haptics, share, retry queue | Partial | Pending | Splash hide on load, haptics used, share dep present, retry queue needs flush handler. |
| Release: Version set and changelog drafted | Partial | Pending | Set version in `package.json` and changelog. |
