# PromptQuill Store Submission Checklist

## Google Play Store

- [ ] Build signed AAB from `/mobile/android`.
- [ ] Confirm target SDK is API 34 or newer. Current generated config targets API 35.
- [ ] Manual action: create/upload Android signing key in Play Console or GitHub Actions secrets.
- [ ] Manual action: configure Play Billing products matching `VITE_IAP_*` IDs.
- [ ] Manual action: add license tester Gmail accounts for sandbox purchases.
- [ ] Manual action: publish privacy policy URL.
- [ ] Manual action: complete Data Safety form for Supabase auth, AI generation, analytics/logs, push notifications, and payments.
- [ ] Store listing title: PromptQuill.
- [ ] Store listing short description: AI prompt generator and prompt engineering workspace.
- [ ] Store listing long description: Explain generation modes, saved history, collaboration/community features, subscriptions, and credits.
- [ ] Screenshots: phone 1080x1920.
- [ ] Screenshots: tablet 1200x1920.
- [ ] Feature graphic: 1024x500.

## Apple App Store

- [ ] Build/archive from `/mobile/ios` in Xcode.
- [ ] Manual action: register Bundle ID `com.example.app` in Apple Developer portal.
- [ ] Manual action: enable Associated Domains if universal links are added later.
- [ ] Manual action: enable In-App Purchase capability in Xcode Signing & Capabilities.
- [ ] Manual action: configure StoreKit products matching `VITE_IAP_*` IDs.
- [ ] Manual action: create App Store Connect app record.
- [ ] Export compliance: HTTPS only, `ITSAppUsesNonExemptEncryption` is set to `false` in `Info.plist`.
- [ ] Age rating: likely 4+, verify AI/community content answers.
- [ ] Review notes: mention AI-generated prompt content, Supabase auth, and in-app subscription/credit products.
- [ ] Screenshots: 6.9-inch display.
- [ ] Screenshots: 6.5-inch display.
