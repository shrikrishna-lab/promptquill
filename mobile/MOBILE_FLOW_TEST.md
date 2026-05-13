# PromptQuill Mobile Flow Test

Fresh install test:
- [ ] App opens -> shows onboarding screen 1 (NOT landing page)
- [ ] Swipe through onboarding -> reaches login
- [ ] Skip button works -> goes to login
- [ ] Login with valid credentials -> goes to /app/generate
- [ ] Login with invalid credentials -> shows error IN APP
- [ ] Forgot password -> email sent -> no web redirect
- [ ] Signup -> goes to /app/generate directly
- [ ] Generate a prompt -> works fully inside app
- [ ] Bottom nav works between all tabs
- [ ] Logout -> goes to /login (not web URL)

Returning user test:
- [ ] Close and reopen app -> goes directly to /app/generate
- [ ] No onboarding shown again
- [ ] Session persists across app restarts

Security test:
- [ ] No web URLs appear in address bar (there is no address bar)
- [ ] No Vercel redirects at any point
- [ ] Auth deep link works: promptquill://auth/callback
- [ ] All API calls go to Railway (check network tab in dev)
