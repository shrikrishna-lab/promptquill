# PromptQuill Mobile Performance Audit

Scope: `/mobile/app/src` only. The original `/frontend` and `/backend` directories were not changed.

## Backdrop Filters And Blur

Findings:

- `mobile/app/src/index.css` uses `--glass-blur: blur(20px)` and multiple `backdrop-filter` rules.
- Inline `backdropFilter` appears in modal, input, dashboard, forum, gallery, notification, and pricing components.
- Large decorative `filter: blur(...)` appears on landing, blog, dashboard, and modal glow elements.

Fix:

- Added `mobile/app/src/styles/mobile-overrides.css`.
- Imported it after the copied app CSS in `mobile/app/src/main.jsx`.
- Runtime classes from `mobile/app/src/lib/platform.mobile.js` disable backdrop filters inside native webviews, especially Android, without editing copied original CSS files.

## Three.js Landing Scene

Finding:

- `mobile/app/src/pages/LandingPage.jsx` previously imported `three` eagerly and rendered a high quality WebGL scene.

Fix:

- Replaced the eager `three` import with `await import('three')` inside the landing visual setup.
- Reduced native webview quality: lower particle count, lower pixel ratio, no antialiasing, low-power WebGL preference, and simpler geometry.
- Kept the route-level lazy loading already present in `mobile/app/src/App.jsx`.

## Lenis Smooth Scroll

Finding:

- `LandingPage.jsx` initialized Lenis for the landing page.

Fix:

- Native Capacitor webviews now skip Lenis entirely and use native scrolling.
- Desktop/mobile web preview can still use Lenis outside native shells.

## GSAP And ScrollTrigger

Finding:

- `LandingPage.jsx` has DOM-dependent ScrollTrigger timelines for pinned sections, horizontal scrolling, and scrubbed transforms.

Fix:

- Native Capacitor webviews now skip those ScrollTrigger timelines.
- Mobile CSS overrides unpin/reset the most expensive animated sections so content remains reachable with native scroll.

## Webview Asset Paths

Finding:

- Copied mobile files contained root-relative public asset references such as `/clay_chars/...`.

Fix:

- Mobile-only references in `LandingPage.jsx`, `AuthModal.jsx`, `pro.js`, `razorpayPayment.js`, and mobile HTML entry files were converted to hash-safe or relative paths.
