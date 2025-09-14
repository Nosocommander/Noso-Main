# Store Metadata Checklist

- App Name: Noso Woo (from `capacitor.config.ts`)
- Bundle ID: com.noso.woo (from `capacitor.config.ts`)
- Icons: Placeholder needed (Android mipmap, iOS AppIcon). Provide 1024px source and generate sets.
- Splash: Placeholder needed. Provide 2732x2732 source with safe zone; generate sets.
- Privacy Policy URL: TEMP https://example.com/privacy (replace before public submission).
- Versioning: Set app version (e.g., 1.0.0) and build numbers per platform.
- SplashScreen hide: Verified calling `SplashScreen.hide()` on app ready in `src/main.tsx`.
- Haptics: Used in `App.tsx`, `CatalogPage.tsx`, `HistoryPage.tsx`.
- Share capability: Dependency present; usage optional for MVP.

Action Items
- [ ] Add icon and splash source assets; generate platform-specific resources.
- [ ] Replace privacy policy URL with real URL.
- [ ] Update package/app version and changelog.
