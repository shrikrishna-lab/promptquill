# Deployment Guide

## Frontend Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Set build command: `npm run build:frontend`
3. Set output directory: `frontend/dist`
4. Add environment variables from `frontend/.env`
5. Deploy!

### Other Options

- Netlify
- GitHub Pages
- Firebase Hosting

## Backend Deployment

### Railway / Render / Heroku

1. Connect repository
2. Set build command: `npm install && npm run build:backend`
3. Set start command: `npm run start --workspace=backend`
4. Set environment variables from `backend/.env`
5. Deploy!

## Database

Supabase is cloud-hosted, no deployment needed. Manage through Supabase dashboard.

## Environment Variables

Ensure all environment variables are set in your deployment platform:

**Frontend:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_KEY`

**Backend:**
- `SUPABASE_URL`
- `SUPABASE_KEY`
- `NODE_ENV`
- `PORT`

## Monitoring

- Check backend logs in your hosting platform
- Monitor Supabase logs in dashboard
- Set up error tracking (e.g., Sentry)
