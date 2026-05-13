# Frontend - React Application

This directory contains the Prompt Quill web application built with React 19 and Vite.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:3001)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## 🚀 Full Setup Guide

### Option 1: Frontend Only
```bash
cd frontend
npm install
npm run dev
```
✅ Frontend runs on `http://localhost:3001`

### Option 2: Full Stack (Frontend + Backend)

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Access the application:**
- 🌐 Frontend: `http://localhost:3001`
- 🔌 Backend API: `http://localhost:5000`

### Production Build
```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview

# Deploy dist/ folder to your hosting platform
```

## 📁 Structure

```
frontend/
├── src/
│   ├── pages/              # Page components
│   │   ├── Welcome.jsx
│   │   ├── Dashboard.jsx
│   │   ├── BlogPage.jsx
│   │   ├── CommunityFeed.jsx
│   │   ├── SettingsPage.jsx
│   │   ├── PricingPage.jsx
│   │   └── ...
│   ├── components/         # Reusable components
│   │   ├── Sidebar.jsx
│   │   ├── TopBar.jsx
│   │   ├── BottomInput.jsx
│   │   └── ...
│   ├── lib/                # Utilities and services
│   │   ├── supabase.js    # Supabase client
│   │   ├── ai.js          # AI/LLM utilities
│   │   ├── credits.js     # Credit system
│   │   ├── pro.js         # Pro features
│   │   ├── utils.js       # Helper functions
│   │   └── useFeatureFlags.js
│   ├── assets/             # Static assets
│   ├── App.jsx             # Main app component with routing
│   ├── main.jsx            # Entry point
│   ├── App.css             # Global styles
│   └── index.css
├── public/                 # Static files
├── vite.config.js          # Vite configuration
├── eslint.config.js        # Linting rules
├── package.json            # Dependencies
├── .env                    # Environment variables
└── index.html              # HTML template
```

## 🔧 Configuration

### Environment Variables (.env)

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_BACKEND_URL=
VITE_APP_URL=
```

### Vite Config

- **Port**: 3001 (configurable in vite.config.js)
- **React Plugin**: Active for JSX compilation
- **Build Output**: `dist/` directory

## 📦 Key Dependencies

- **React** 19.2.4 - UI framework
- **React Router** 7.13.2 - Routing
- **Supabase** 2.101.1 - Backend services
- **Lucide React** 1.7.0 - Icons
- **Canvas Confetti** 1.9.4 - Animations
- **html2canvas** 1.4.1 - Export to PNG
- **jsPDF** 4.2.1 - PDF generation

## 🎨 Styling

- Vanilla CSS (no CSS-in-JS framework)
- Global styles in `App.css` and `index.css`
- Component-level CSS imported as needed

## 🔐 Authentication

- Managed through Supabase Auth
- Session persistence with env credentials

## 🤖 AI Integration

- Multi-provider failover in `lib/ai.js`
- Supported providers: Groq, Gemini, OpenRouter
- Auto-rotation on rate limits or failures

## 💳 Credits System

- Tracked in `lib/credits.js`
- Real-time updates via Supabase Realtime
- Dashboard displays current usage

## 🚀 Deployment

The frontend is optimized for static hosting (Netlify, Vercel, GitHub Pages):

```bash
npm run build
# Deploy the 'dist' folder
```

Note: Update your vite.config.js base URL for subdirectory deployments.

---
**Last Updated:** April 6, 2026
