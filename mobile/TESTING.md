# PromptQuill Mobile Testing Protocol

## Build Smoke Test

1. Run `npm run mobile:build` from the repo root.
2. Confirm output is written to `/dist-mobile`.
3. Confirm Capacitor sync completes for `/mobile/android` and `/mobile/ios`.
4. Confirm `/frontend` still builds/deploys independently from its original workspace.

## Auth Flow On Real Device

1. Install Android debug build first.
2. Test email signup.
3. Test email login.
4. Test Google OAuth.
5. Confirm redirect returns through `promptquill://auth/callback`.
6. Confirm the app lands on `#/auth/callback` and then resolves the session.
7. Repeat on iOS simulator and then a physical iPhone.

## Supabase Realtime

1. Log in on two devices with test accounts.
2. Open screens that subscribe to announcements, feature flags, support tickets, or collaboration data.
3. Change data from Supabase dashboard.
4. Confirm WebSocket updates arrive without app reload.
5. Background and foreground the app, then confirm subscriptions reconnect.

## AI Generation End To End

1. Sign in with a free test account.
2. Generate in General mode.
3. Generate in Coding mode.
4. Confirm credit usage updates.
5. Confirm generated sessions save to history.
6. Confirm backend calls use `VITE_BACKEND_URL=https://your-backend-url.com`.

## Payments Sandbox

Android:

1. Manual action: create matching Play Billing products in Play Console.
2. Manual action: add test accounts under License testing.
3. Install from an internal testing track.
4. Purchase monthly Pro.
5. Purchase yearly Pro.
6. Purchase each credit pack.
7. Confirm `/api/iap/verify` receives transaction payloads when backend support is added.

iOS:

1. Manual action: add In-App Purchase capability in Xcode.
2. Manual action: create matching StoreKit products in App Store Connect.
3. Test with StoreKit local config first.
4. Test with App Store sandbox tester on device.
5. Confirm subscription restore behavior before review submission.

## Deep Links

Android:

1. Run `adb shell am start -W -a android.intent.action.VIEW -d "promptquill://auth/callback?code=test" com.example.app`.
2. Confirm app opens and routes to `#/auth/callback`.

iOS:

1. Run `xcrun simctl openurl booted "promptquill://auth/callback?code=test"`.
2. Confirm app opens and routes to `#/auth/callback`.

## Offline State

1. Log in, then enable airplane mode.
2. Confirm generation shows a network failure state.
3. Confirm saved local UI state does not crash.
4. Disable airplane mode.
5. Confirm Supabase session refresh and realtime reconnect.

## Push Notifications

1. Manual action: configure FCM for Android and APNs for iOS.
2. Request notification permission on first eligible screen.
3. Send a test notification.
4. Confirm foreground presentation.
5. Confirm background tap opens the app.

## Web Regression Guard

1. Confirm no files under `/frontend` changed.
2. Run the existing frontend build from `/frontend`.
3. Visit the Vercel deployment and test login, dashboard, generation, pricing, and mobile web layout.
4. Confirm the root workflow still does not trigger mobile builds on `main`.
