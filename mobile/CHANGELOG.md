## 1.0.0-rc.2 - 2025-09-14
- Added placeholder icons and splash; wired build scripts.
- Circuit breaker + banner; DEV diagnostics; API safeguards.
- Home quick actions + connection status.
- EmptyState component + rollback aria-live announcement.
- Privacy Policy page and links.
 - Deterministic Capacitor assets pipeline (assets/icon.png, assets/splash.png); added build:android:all.
 - Removed vestigial capacitor.assets.json; Settings shows version/build; Diagnostics gated to DEV.
 - Added smoke CSV fixture (fixtures/smoke/products-sample.csv).
 - Git hygiene to ignore generated platform assets; added pre-build one-liner.
 - Android release signing template (build.gradle + android/gradle.properties.example) and iOS Signing Quick Start docs; Smoke CSV path pinned in Runbook.
# Changelog

## 1.0.0-rc.1 - 2025-09-14
- Retry queue hardened (retain failures, online auto-flush, toasts/haptics).
- Settings gate UX polished with deep-link banner.
- Added Android/iOS platform projects; build runbook created.
- Store metadata checklist added; telemetry logs gated under DEV.
- Version bump and rc:check script (typecheck + lint).
