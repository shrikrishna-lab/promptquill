<div align="center">
  <br>
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=32&duration=2000&pause=500&color=A3E635&center=true&vCenter=true&width=500&lines=PromptQuill;AI+Brief+Generator;Open+Source;Self-Hosted" alt="Typing SVG" />
  <br><br>
  <p><strong>Turn any idea into a complete strategic brief in seconds.</strong><br>
  <em>Open source · Self-hosted · Free forever · Your data stays yours</em></p>
  <br>
  <p>
    <a href="https://github.com/shrikrishna-lab/promptquill/stargazers"><img src="https://img.shields.io/github/stars/shrikrishna-lab/promptquill?style=for-the-badge&logo=github&color=A3E635" alt="Stars"></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-8B5CF6?style=for-the-badge" alt="License"></a>
    <a href="https://nodejs.org"><img src="https://img.shields.io/badge/Node-%3E%3D18-22C55E?style=for-the-badge&logo=node.js" alt="Node"></a>
    <a href="https://react.dev"><img src="https://img.shields.io/badge/React-18-3B82F6?style=for-the-badge&logo=react" alt="React"></a>
    <br>
    <img src="https://img.shields.io/badge/self--hosted-yes-06B6D4?style=for-the-badge" alt="Self-Hosted">
    <img src="https://img.shields.io/badge/16_AI_Providers-available-EC4899?style=for-the-badge" alt="Providers">
    <img src="https://img.shields.io/badge/telemetry-none-F59E0B?style=for-the-badge" alt="No Telemetry">
  </p>
  <br>
</div>

---

https://github.com/user-attachments/assets/6e1e5ef2-1e6f-4bcf-857a-8f7a987e8679

---

## ✦ Introduction

**PromptQuill** is an open-source AI brief generator. You type any idea — a startup concept, a software feature, a content campaign — and it returns a **complete, structured strategic brief with fifteen analysis sections** in seconds.

The application is **fully self-hosted**: it connects only to your own Supabase database, uses your own AI provider keys, and stores nothing on any shared infrastructure. **No paid plans. No subscriptions. No telemetry.** Every instance runs independently and privately.

Built for founders validating ideas, developers planning features, content strategists building campaigns, researchers organizing thoughts — anyone who needs to move from a rough concept to a structured plan quickly.

---

## ✦ Features

### 📋 Brief Generation
- **15-tab strategic briefs** — Executive summary, problem statement, target market, competitive landscape, technical architecture, feature roadmap, go-to-market strategy, revenue model, team plan, risk analysis, financial projections, launch timeline, success metrics, investor narrative, and immediate next steps.
- **6 AI modes** — Startup, Coding, Content, Creative, General, and Startup Lite. Each with a specialized system prompt.
- **2 personality styles** — Bot (structured, analytical, data-driven) or Human (conversational, advisory).
- **Persistent history** — Every brief saved to your own database. Browse, revisit, and share.

### 🤖 AI Provider System
- **16 supported providers** — OpenAI, Anthropic, xAI (Grok), Google Gemini, Groq, Mistral AI, DeepSeek, Cohere, Perplexity AI, Moonshot AI, Cerebras, OpenRouter, Cloudflare Workers AI, NVIDIA NIM, Ollama, and LM Studio.
- **Automatic rotation & failover** — If one provider fails or hits a rate limit, the system tries the next available.
- **Free tier operation** — Multiple providers offer free tiers. Run PromptQuill without spending on AI inference.
- **Real-time provider badge** — See which provider is active during generation.

### 🌐 Community
- **Optional public sharing** — Mark briefs as public within your installation.
- **Community feed** — Browse shared briefs from other users, filtered by mode.

### 🔒 Security
- **No hardcoded credentials** — Every URL, key, and connection is user-supplied through environment variables.
- **Keys in your database only** — API keys stored in your own Supabase, never returned to the frontend.
- **Row-level security** — Enforced on all database tables.
- **Zero telemetry** — No external network calls beyond your configured providers and your own Supabase.

---

<img width="1883" height="914" alt="image" src="https://github.com/user-attachments/assets/ad304ed9-9cdc-40b2-b347-4c3aa0ffd4ad" />




## ✦ Quick Start

```bash
# Clone the repository
git clone https://github.com/shrikrishna-lab/promptquill.git
cd promptquill

# Set up environment
cp .env.example .env

# Install dependencies
npm install

# Start the application (frontend + backend)
npm run dev
```

Open **http://localhost:3001** in your browser. The setup wizard will guide you through connecting your Supabase database and adding your first AI provider key. You'll be generating briefs in under 5 minutes.

---

## ✦ Setup Guide

### 1. Get Your Supabase Credentials

Create a free account at [supabase.com](https://supabase.com) and start a new project. Once created, go to **Project Settings → API** and copy:

| Field | Where to Find It |
|---|---|
| **Project URL** | Project Settings → API → Project URL |
| **Anon Key** | Project Settings → API → anon public key |
| **Service Key** | Project Settings → API → service_role key (for table creation) |
| **Database Password** | Project Settings → Database → Password (for auto table creation) |

### 2. Get at Least One AI Provider Key

Sign up at any of these providers and generate an API key:

| Provider | Free Limit | Sign Up |
|---|---|---|
| Groq | 14,400 req/day | [console.groq.com](https://console.groq.com) |
| Google Gemini | 1,500 req/day | [aistudio.google.com](https://aistudio.google.com) |

You only need **one** key to get started. Groq is recommended — it's fast and generous.

### 3. Run the Setup Wizard

Start the app with `npm run dev`, open **http://localhost:3001**, and click **Get Started**. The wizard has 3 steps:

**Step 1 — Connect Supabase:** Enter your Project URL, Anon Key, and Service Key. Click **Test Connection** to verify. Optionally enter your Database Password for auto table creation.

**Step 2 — Add AI Keys:** Enter your API key(s) for your chosen provider(s). Click **Test** next to each key to verify.

**Step 3 — Database Setup:** Click **Run Setup** to create the required tables. If auto-creation isn't available (common with default Supabase projects), click **Skip** — the app works without saved tables.

### 4. Database Setup Options

**Option A — Auto-create (requires database password):** Enter your Supabase database password (Project Settings → Database → Password). Click **Test** to verify it works. Then click **Run Setup** — tables are created automatically.

**Option B — Manual SQL:** Click **Skip** during setup, then open your Supabase Dashboard → **SQL Editor** and paste the schema SQL shown in the wizard. Tables created, click **Next** on refresh.

**Option C — Skip entirely:** The app works without database tables. Generated briefs won't be saved, but you can still generate and view them.

---

<img width="1246" height="561" alt="image" src="https://github.com/user-attachments/assets/fdb6bd23-4083-4765-849e-7b86b778276b" />


## ✦ 16 AI Providers

<table>
  <thead>
    <tr>
      <th>Provider</th>
      <th>Type</th>
      <th>Best For</th>
      <th>Sign Up</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>🧠 <strong>OpenAI</strong></td><td>Cloud · Paid</td><td>General purpose, code, reasoning</td><td><a href="https://platform.openai.com">platform.openai.com</a></td></tr>
    <tr><td>🎭 <strong>Anthropic (Claude)</strong></td><td>Cloud · Paid</td><td>Analysis, coding, long context</td><td><a href="https://console.anthropic.com">console.anthropic.com</a></td></tr>
    <tr><td>💚 <strong>xAI (Grok)</strong></td><td>Cloud · Paid</td><td>Reasoning, code</td><td><a href="https://console.x.ai">console.x.ai</a></td></tr>
    <tr><td>🔵 <strong>Google Gemini</strong></td><td>Cloud · Free tier</td><td>Speed, output quality</td><td><a href="https://aistudio.google.com">aistudio.google.com</a></td></tr>
    <tr><td>🟢 <strong>Groq</strong></td><td>Cloud · Free tier</td><td>Speed, open models</td><td><a href="https://console.groq.com">console.groq.com</a></td></tr>
    <tr><td>🟠 <strong>Mistral AI</strong></td><td>Cloud · Free tier</td><td>Multilingual, code</td><td><a href="https://console.mistral.ai">console.mistral.ai</a></td></tr>
    <tr><td>🔮 <strong>DeepSeek</strong></td><td>Cloud · Free tier</td><td>Code, reasoning</td><td><a href="https://platform.deepseek.com">platform.deepseek.com</a></td></tr>
    <tr><td>🌿 <strong>Cohere</strong></td><td>Cloud · Paid</td><td>RAG, embeddings</td><td><a href="https://dashboard.cohere.com">dashboard.cohere.com</a></td></tr>
    <tr><td>🔍 <strong>Perplexity AI</strong></td><td>Cloud · Paid</td><td>Search, research</td><td><a href="https://docs.perplexity.ai">docs.perplexity.ai</a></td></tr>
    <tr><td>🌙 <strong>Moonshot AI (Kimi)</strong></td><td>Cloud · Paid</td><td>Chinese language, long context</td><td><a href="https://platform.moonshot.cn">platform.moonshot.cn</a></td></tr>
    <tr><td>⚡ <strong>Cerebras</strong></td><td>Cloud · Free tier</td><td>Fast inference</td><td><a href="https://cloud.cerebras.ai">cloud.cerebras.ai</a></td></tr>
    <tr><td>🔄 <strong>OpenRouter</strong></td><td>Cloud · Free tier</td><td>Model variety</td><td><a href="https://openrouter.ai">openrouter.ai</a></td></tr>
    <tr><td>☁️ <strong>Cloudflare Workers AI</strong></td><td>Cloud · Free tier</td><td>Edge deployment</td><td><a href="https://dash.cloudflare.com">dash.cloudflare.com</a></td></tr>
    <tr><td>🟩 <strong>NVIDIA NIM</strong></td><td>Cloud · Free tier</td><td>Enterprise models</td><td><a href="https://build.nvidia.com">build.nvidia.com</a></td></tr>
    <tr><td>🦙 <strong>Ollama</strong></td><td>Local · Free</td><td>Private, offline</td><td><a href="https://ollama.com">ollama.com</a></td></tr>
    <tr><td>💻 <strong>LM Studio</strong></td><td>Local · Free</td><td>Private, offline</td><td><a href="https://lmstudio.ai">lmstudio.ai</a></td></tr>
  </tbody>
</table>

> You only need **one** provider key to get started. Adding more improves reliability through automatic failover.

---

## ✦ Usage

### 🚀 Startup Mode
Optimized for evaluating new business ideas and investment opportunities.

**Best used for:** Validating a startup concept. Preparing for a pitch. Structuring a business plan. Assessing market viability.

**Example input:** *"A food delivery app for college students in India that delivers snacks from local hostels and dorms."*

### 💻 Coding Mode
Optimized for planning software projects and technical features.

**Best used for:** Designing new features. Planning system architecture. Preparing technical roadmaps. Evaluating technology choices.

**Example input:** *"A real-time collaborative code editor with built-in AI pair programming and terminal sharing."*

### 📝 Content Mode
Optimized for developing content strategies and marketing campaigns.

**Best used for:** Planning content calendars. Developing brand voice. Structuring product launches. Building distribution strategies.

**Example input:** *"A weekly newsletter for indie hackers about building AI-powered SaaS products."*

### 🎨 Creative Mode
Optimized for brainstorming creative concepts and artistic direction.

**Best used for:** Developing brand identity. Planning creative campaigns. Generating design concepts. Exploring narrative angles.

**Example input:** *"An interactive art installation in a public park that uses wind data to generate poetry."*

### ⚡ General Mode
Optimized for analyzing any idea from multiple angles without domain specialization.

**Best used for:** Quick idea validation. Multi-angle exploration. Getting structured overviews of vague ideas.

**Example input:** *"A mobile app that connects travelers with local chefs for home-cooked meals."*

### 🔍 Startup Lite Mode
Optimized for rapid idea validation with concise, punchy output.

**Best used for:** Fast ideation sessions. Testing many ideas quickly. Teaching and workshop settings.

**Example input:** *"A subscription box for rare spices delivered monthly."*

### 🧠 Personality Styles

| Style | Description | Best For |
|---|---|---|
| **Bot** 🤖 | Structured, analytical output with headers, bullet points, and data-driven recommendations | Formal briefs, stakeholder presentations, documentation |
| **Human** 🗣️ | Conversational, advisory tone using personal language ("you", "your") | Personal exploration, brainstorming, mentoring scenarios |

---

## ✦ Commands

| Command | Description |
|---|---|
| `npm run dev` | Starts both frontend (`:3001`) and backend (`:5000`) development servers |
| `npm run dev:frontend` | Starts only the frontend development server |
| `npm run dev:backend` | Starts only the backend API server |
| `npm install` | Installs all dependencies across frontend and backend |
| `npm run build` | Compiles the frontend for production deployment |
| `npm run publish:github` | Runs the automated GitHub publishing script |

---

## ✦ Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | ✅ Yes | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | ✅ Yes | Your Supabase anonymous key |
| `VITE_BACKEND_URL` | ✅ Yes | Backend server URL |
| `SUPABASE_URL` | ✅ Yes | Supabase URL for backend connection |
| `SUPABASE_SERVICE_KEY` | ✅ Yes | Supabase service role key |
| `PORT` | ❌ No | Backend port (default: 5000) |
| `NODE_ENV` | ❌ No | Environment mode (default: development) |

> AI provider keys are set through the **setup wizard** and stored in your own database. You do not need to add them to `.env`.

---

## ✦ Your Data & Privacy

PromptQuill connects only to the **Supabase project you create**. No data is sent to any central server. Your API keys are stored in your own database and are never returned to the frontend.

**There is no analytics, no telemetry, and no phone-home mechanism.** The application makes no network calls beyond the AI providers you configure and your own Supabase project. The original developers have zero access to your data, your keys, or your instance.

**Every installation is fully independent and private.** What you generate stays on your infrastructure.

---

## ✦ Contributing

1. **Fork** the repository
2. **Create a branch** for your change
3. **Make your changes** — one feature or fix per branch
4. **Test** your changes before submitting
5. **Submit a pull request** with a clear description

**Reporting bugs?** Include steps to reproduce, expected vs actual behavior, Node.js version, OS, and relevant error messages.

---

## ✦ Tech Stack

<div align="center">

| Layer | Technology |
|---|---|
| **Frontend** | <img src="https://img.shields.io/badge/React-18-3B82F6?logo=react"> <img src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite"> |
| **Backend** | <img src="https://img.shields.io/badge/Node.js-Express-22C55E?logo=nodedotjs"> |
| **Database** | <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase"> |
| **AI Providers** | <img src="https://img.shields.io/badge/16-Providers-A3E635"> |

</div>

---

## ✦ License

<div align="center">

**MIT License** — Free to use, modify, and distribute.

[![License: MIT](https://img.shields.io/badge/License-MIT-8B5CF6?style=for-the-badge)](LICENSE)

---

<p>
  <a href="https://github.com/shrikrishna-lab/promptquill">
    <img src="https://img.shields.io/badge/GitHub-shrikrishna--lab/promptquill-181717?style=for-the-badge&logo=github" alt="GitHub">
  </a>
  <br><br>
  <strong>⭐ Star this repo if PromptQuill helped you ⭐</strong><br>
  <em>Built with care by the open-source community</em>
</p>

</div>
