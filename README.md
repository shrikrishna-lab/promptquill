# PromptQuill

> Turn any idea into a complete strategic brief in seconds.  
> Open source. Self-hosted. Free forever. Your data stays yours.

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)
[![Self-Hosted](https://img.shields.io/badge/self--hosted-yes-blue)](https://github.com/shrikrishna-lab/promptquill)
[![Open Source](https://img.shields.io/badge/open--source-true-purple)](https://github.com/shrikrishna-lab/promptquill)

</div>

<p align="center">
  <img src="docs/screenshots/generator.png" alt="PromptQuill brief generator" width="600">
  <br>
  <em>Type an idea → get a complete 15-tab strategic brief in seconds.</em>
</p>

---

## Introduction

PromptQuill is an open-source AI brief generator. You type any idea — a startup concept, a software feature, a content campaign — and it returns a complete, structured strategic brief with fifteen analysis sections in seconds. The application is fully self-hosted: it connects only to your own Supabase database, uses your own AI provider keys, and stores nothing on any shared infrastructure. There are no paid plans, no subscriptions, and no telemetry. Every instance runs independently and privately.

PromptQuill is designed for founders validating ideas, developers planning features, content strategists building campaigns, researchers organizing thoughts, and anyone who needs to move from a rough concept to a structured plan quickly.

---

## Features

### Brief Generation

- **15-tab strategic briefs.** Every brief covers executive summary, problem statement, target market, competitive landscape, technical architecture, feature roadmap, go-to-market strategy, revenue model, team plan, risk analysis, financial projections, launch timeline, success metrics, investor narrative, and immediate next steps.
- **6 AI modes.** Startup, Coding, Content, Creative, General, and Startup Lite. Each mode uses a specialized system prompt tailored to its domain.
- **2 personality styles.** Bot delivers structured, analytical, data-driven output. Human uses a conversational, advisory tone.
- **Live streaming.** Content appears as it generates. You do not wait for the full response.
- **Persistent history.** Every brief is saved to your own database. You can browse, revisit, and share them.

### AI Provider System

- **16 supported providers.** OpenAI, Anthropic, xAI (Grok), Google Gemini, Groq, Mistral AI, DeepSeek, Cohere, Perplexity AI, Moonshot AI, Cerebras, OpenRouter, Cloudflare Workers AI, NVIDIA NIM, Ollama, and LM Studio.
- **Automatic rotation and failover.** If one provider fails or hits a rate limit, the system tries the next available provider. No generation is lost.
- **Free tier operation.** Every supported provider offers a free tier. You can run PromptQuill without spending anything on AI inference.
- **Real-time provider visibility.** A badge shows which provider is active during generation.

### Community

- **Optional public sharing.** Briefs can be marked public within your installation.
- **Community feed.** Browse publicly shared briefs from other users of your instance, filtered by AI mode.

### Setup and Self-Hosting

- **Clone and run.** Clone the repo, install dependencies, and start the application.
- **Guided setup wizard.** A 6-step wizard handles database connection, AI key configuration, and table creation on first run.
- **Your infrastructure.** Every component runs on your own Supabase project and your own machine. There is no central server.

### Security

- **No hardcoded credentials.** Every URL, key, and connection string is user-supplied through environment variables.
- **Keys in your database only.** API keys are stored in your own Supabase database and are never returned to the frontend.
- **Row-level security.** All database tables have RLS policies enforced.
- **Zero telemetry.** The application makes no external network calls beyond your configured AI providers and your own Supabase project.

---

## Installation

### Requirements

Before installing, you need:

- **Node.js 18 or higher.** Download from nodejs.org or install via your system package manager.
- **A Supabase account (free).** Sign up at supabase.com and create a new project. The free tier is sufficient.
- **At least one AI provider API key.** All five supported providers offer free tiers. Groq is recommended for first-time setup because it offers 14,400 free requests per day with the fastest response times. Sign up at console.groq.com and generate an API key.

### Quick Start

```bash
git clone https://github.com/shrikrishna-lab/promptquill.git
cd promptquill
cp .env.example .env
npm install
npm run dev
```

After running `npm run dev`, open the URL shown in your terminal (typically http://localhost:3001). The setup wizard will guide you through connecting your Supabase database and adding your first AI provider key.

---

## Free AI Provider Keys

| Provider | Free Tier Limit | Best For | Sign Up |
|---|---|---|---|
| Groq | 14,400 requests/day | Speed | console.groq.com |
| Google Gemini | 1,500 requests/day | Output quality | aistudio.google.com |
| Cerebras | Free tier | Fast inference | cloud.cerebras.ai |
| OpenRouter | Free models | Model variety | openrouter.ai |
| Cloudflare Workers AI | 10,000 requests/day | Reliability | dash.cloudflare.com |

You only need one provider key to get started. Adding more providers improves reliability through automatic failover.

---

## Usage

### Startup Mode

Optimized for evaluating new business ideas and investment opportunities.

**Best used for:** Validating a startup concept before building it. Preparing for a pitch meeting. Structuring a business plan for the first time. Assessing market viability of an idea.

**Example input:** "A food delivery app for college students in India that delivers snacks from local hostels and dorms."

**What the output covers:** Executive summary, problem statement, target market and personas, competitive landscape, revenue model, financial projections, investor narrative.

### Coding Mode

Optimized for planning software projects and technical features.

**Best used for:** Designing a new feature or service. Planning a system architecture. Preparing a technical roadmap for a sprint or quarter. Evaluating technology choices and trade-offs.

**Example input:** "A real-time collaborative code editor with built-in AI pair programming and terminal sharing."

**What the output covers:** Technical architecture, feature roadmap, risk analysis, team and hiring plan, launch timeline.

### Content Mode

Optimized for developing content strategies and marketing campaigns.

**Best used for:** Planning a content calendar for a blog or social channel. Developing a brand voice and positioning. Structuring a product launch campaign. Building a distribution strategy for organic growth.

**Example input:** "A weekly newsletter for indie hackers about building AI-powered SaaS products."

**What the output covers:** Target market, go-to-market strategy, revenue model, success metrics and KPIs, immediate next steps.

### Creative Mode

Optimized for brainstorming creative concepts and artistic direction.

**Best used for:** Developing a brand identity or visual direction. Planning a creative campaign. Generating concepts for a design project. Exploring narrative and storytelling angles.

**Example input:** "An interactive art installation in a public park that uses wind data to generate poetry."

**What the output covers:** Executive summary, competitive landscape (creative context), risk analysis, launch timeline, immediate next steps.

### General Mode

Optimized for analyzing any idea from multiple angles without domain specialization.

**Best used for:** Quick idea validation when you are not sure which mode fits. Exploring a concept from business, technical, and creative perspectives simultaneously. Getting a structured overview of a vague or early-stage idea.

**Example input:** "A mobile app that connects travelers with local chefs for home-cooked meals."

**What the output covers:** All fifteen tabs, with balanced depth across every section.

### Startup Lite Mode

Optimized for rapid idea validation with concise output.

**Best used for:** Fast, repeated ideation sessions. Testing many ideas quickly to identify the most promising ones. Getting a structured overview without committing to a full brief. Teaching or workshop settings where multiple examples are needed.

**Example input:** "A subscription box for rare spices delivered monthly."

**What the output covers:** All fifteen tabs, each 100 to 150 words, focused on the most critical insight per section.

### Personality Styles

**Bot personality** produces structured, analytical output with clear headers, bullet points, and data-driven recommendations. It reads like a professional consulting report. Use Bot when you need a formal, directly scannable brief for stakeholders or documentation.

**Human personality** uses a conversational, advisory tone with personal language ("you", "your"). It reads like advice from an experienced mentor. Use Human when you are exploring an idea for yourself and want a more engaging, readable brief that feels like a discussion rather than a report.

---

## Commands

| Command | Description |
|---|---|
| `npm run dev` | Starts both frontend and backend development servers. Frontend runs on port 3001, backend on port 5000. |
| `npm run dev:frontend` | Starts only the frontend development server. |
| `npm run dev:backend` | Starts only the backend API server. |
| `npm install` | Installs all dependencies across both frontend and backend. |
| `npm run build` | Compiles the frontend for production deployment. Output goes to the `dist` folder. |
| `npm run publish:github` | Runs the automated GitHub publishing script for publishing forks. |

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Yes | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Your Supabase anonymous key |
| `VITE_BACKEND_URL` | Yes | URL where the backend server is running |
| `SUPABASE_URL` | Yes | Supabase project URL for the backend connection |
| `SUPABASE_SERVICE_KEY` | Yes | Supabase service role key for database table creation |
| `GROQ_KEY_1` | No | Groq API key |
| `GEMINI_API_KEY` | No | Google Gemini API key |
| `CEREBRAS_KEY` | No | Cerebras API key |
| `OPENROUTER_API_KEY` | No | OpenRouter API key |
| `CF_API_KEY` | No | Cloudflare Workers AI API key |
| `CF_ACCOUNT_ID` | No | Cloudflare account ID |
| `PORT` | No | Backend server port (default: 5000) |
| `NODE_ENV` | No | Environment mode (default: development) |

At least one AI provider key is required. All others are optional.

---

## Your Data and Privacy

PromptQuill connects only to the Supabase project you create. No data is sent to any central server. Your API keys are stored in your own database and are never returned to the frontend or logged by the application.

There is no analytics, no telemetry, and no phone-home mechanism. The application makes no network calls beyond the AI providers you configure and your own Supabase project. The original developers have zero access to your data, your keys, or your instance.

Every installation is fully independent and private. What you generate stays on your infrastructure.

---

## Contributing

### How to Contribute

Fork the repository, create a branch for your change, make your changes, and submit a pull request. The maintainers review pull requests and provide feedback before merging.

### Contribution Guidelines

- Follow the existing code style and patterns used throughout the project.
- Write clear commit messages that describe what changed and why.
- Submit one feature or fix per pull request.
- Test your changes before submitting.
- Update documentation if your change affects how the application is used or configured.

### Good First Issues

Issues labeled "good first issue" on GitHub are suitable for first-time contributors. Comment on the issue before starting work to let others know you are working on it and to avoid duplicate effort.

### Reporting Bugs

When reporting a bug, include the steps to reproduce the issue, what you expected to happen versus what actually happened, your Node.js version and operating system, and any relevant error messages. Open a GitHub issue with this information.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite |
| Backend | Node.js, Express |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| AI Providers | 16 providers: OpenAI, Anthropic, xAI (Grok), Google Gemini, Groq, Mistral AI, DeepSeek, Cohere, Perplexity AI, Moonshot AI, Cerebras, OpenRouter, Cloudflare Workers AI, NVIDIA NIM, Ollama, LM Studio |

---

## License

MIT License. Free to use, modify, and distribute. See the [LICENSE](LICENSE) file for the full terms.

---

<p align="center">
  Built with care by the open-source community.<br>
  <a href="https://github.com/shrikrishna-lab/promptquill">GitHub</a><br>
  Star this repo if PromptQuill helped you ⭐
</p>
