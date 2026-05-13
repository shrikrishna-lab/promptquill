# Prompter Backend

Backend API for the Prompter application built with Express and Supabase.

## Project Structure

```
backend/
├── src/
│   ├── index.js           # Application entry point
│   ├── config/            # Configuration files
│   │   ├── database.js    # Supabase client setup
│   │   └── env.js         # Environment variables
│   ├── routes/            # API route handlers
│   ├── controllers/       # Business logic controllers
│   ├── middleware/        # Express middleware
│   └── utils/             # Utility functions
├── .env.example           # Environment variables template
├── package.json           # Dependencies and scripts
└── README.md              # This file
```

## Setup

1. Copy `.env.example` to `.env` and fill in your Supabase credentials:
   ```bash
   cp .env.example .env
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

## 🚀 Quick Start Commands

### Development Mode (with auto-reload)
```bash
cd backend
npm install
npm run dev
```
✅ Server runs on `http://localhost:5000`  
✅ Watches for file changes automatically

### Production Mode
```bash
cd backend
npm start
```

## Running Both Frontend & Backend

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Access the application:**
- 🌐 Frontend: `http://localhost:3001`
- 🔌 Backend API: `http://localhost:5000`

## Available Scripts

- `npm run dev` - Start development server with auto-reload
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## API Endpoints

- `GET /api/health` - Health check endpoint

(Add more endpoints as you develop)

## Environment Variables

Required variables in `.env`:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_KEY` - Your Supabase API key
- `PORT` - Server port (default: 3000)

## Database

Database schemas and migrations are located in the `database/` directory at the project root.
