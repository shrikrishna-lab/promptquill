# Setup Guide

## Prerequisites

- **Node.js** 18 or later
- **npm** (comes with Node.js)
- A **Supabase** account (free tier works perfectly)
- At least one **AI provider API key** (free options below)

---

## Step 1: Clone the Repository

```bash
git clone https://github.com/shrikrishna-lab/promptquill
cd promptquill
```

## Step 2: Configure Environment Variables

```bash
cp .env.example .env
```

Open `.env` in your editor — you'll fill in your Supabase credentials and at least one AI provider key.

## Step 3: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up / sign in
2. Click **New project**
3. Enter your project name (e.g., "promptquill")
4. Set a secure database password
5. Choose a region close to you
6. Click **Create new project** and wait ~2 minutes

Once created, go to **Project Settings → API** and copy:
- **Project URL** → this is your `VITE_SUPABASE_URL` and `SUPABASE_URL`
- **anon public key** → this is your `VITE_SUPABASE_ANON_KEY`
- **service_role key** → this is your `SUPABASE_SERVICE_KEY`

## Step 4: Fill in Supabase Values in .env

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIs...
```

## Step 5: Get an AI Provider Key (Choose One)

### Groq (Recommended — 14,400 requests/day free)

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up and generate an API key
3. Add to `.env`: `GROQ_KEY_1=gsk_...`

### Google Gemini (1,500 requests/day free)

1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Get an API key
3. Add to `.env`: `GEMINI_API_KEY=AIza...`

### Cerebras (Free tier)

1. Go to [cloud.cerebras.ai](https://cloud.cerebras.ai)
2. Sign up and get your key
3. Add to `.env`: `CEREBRAS_KEY=...`

### OpenRouter (Free models available)

1. Go to [openrouter.ai](https://openrouter.ai)
2. Sign up and generate a key
3. Add to `.env`: `OPENROUTER_API_KEY=sk-or-...`

### Cloudflare Workers AI (10,000 requests/day free)

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Get your API key and Account ID
3. Add to `.env`: `CF_API_KEY=...` and `CF_ACCOUNT_ID=...`

> You only need **one** provider to start. Multiple providers enable auto-rotation and fallback.

## Step 6: Install Dependencies

```bash
npm install
```

## Step 7: Run the Development Server

```bash
npm run dev
```

This starts both the frontend (Vite dev server) and backend (Express) concurrently.

## Step 8: Complete the Setup Wizard

1. Open your browser to **http://localhost:5173**
2. You'll see a setup wizard guiding you through final configuration
3. Verify your Supabase connection
4. Test your AI provider key
5. You're ready to create briefs!

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `SupabaseError: Invalid API key` | Double-check your anon key and URL in `.env`. Make sure there are no extra spaces or quotes. |
| `fetch failed` or `ECONNREFUSED` | Ensure the backend is running on port 5000. Check `npm run dev` output for errors. |
| AI provider returns 401 | Verify your API key is correct and has not expired. Check the provider's console. |
| `concurrently` not found | Run `npm install` again. If missing, install globally: `npm install -g concurrently` |
| Port already in use | Kill the process on port 5173 (frontend) or 5000 (backend). Or change ports in `.env`. |
| Blank page on load | Open browser dev tools (F12). Check the console for errors. Common cause: missing Supabase env vars. |
| `Module not found` errors | Delete `node_modules` and run `npm install` again. |
