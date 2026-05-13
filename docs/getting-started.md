# Project Documentation

## Getting Started

This project is organized as a monorepo with Frontend, Backend, and Database components.

### Quick Start

1. **Frontend**: React + Vite application
2. **Backend**: Express.js API server
3. **Database**: Supabase with PostgreSQL

See the respective README files in each directory for detailed setup instructions.

## Architecture Overview

```
┌─────────────────────────────────────────┐
│         Frontend (React + Vite)         │
│         (Port 3001)                     │
└──────────────────┬──────────────────────┘
                   │
              HTTP/HTTPS
                   │
┌──────────────────▼──────────────────────┐
│        Backend (Express.js)             │
│        (Port 3000)                      │
└──────────────────┬──────────────────────┘
                   │
              Supabase Client
                   │
┌──────────────────▼──────────────────────┐
│     Database (Supabase PostgreSQL)      │
│     (Cloud Hosted)                      │
└─────────────────────────────────────────┘
```

## Environment Setup

1. Copy `.env.example` in both `frontend/` and `backend/` directories
2. Fill in your Supabase credentials
3. Install dependencies in each directory
4. Start development servers

## Dev Scripts

From root directory:
- `npm run dev` - Start frontend + backend
- `npm run dev:frontend` - Start only frontend
- `npm run dev:backend` - Start only backend
- `npm run build` - Build all
- `npm run lint` - Lint all
