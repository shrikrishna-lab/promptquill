import express from 'express';
console.log('🚀 [INDEX_STARTUP_' + new Date().getTime() + '] Server is starting RIGHT NOW with fresh code!');
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { createClient } from '@supabase/supabase-js';
import { setupRoutes } from './routes/index.js';
import { errorHandler, limitRequests } from './middleware/index.js';
import { securityHeaders } from './middleware/securityHeaders.js';
import { globalLimiter, aiGenerationLimiter, webhookLimiter, authLimiter, adminLimiter } from './middleware/rateLimiter.js';
import { wsManager } from './utils/websocket.js';
import { providerLogger } from './utils/aiRouter.js';
import { initializeCronJobs, stopAllCronJobs } from './utils/cronJobs.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(securityHeaders); // Security headers (helmet)
// Strict CORS whitelist — only production domain + local dev allowed
const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3001',
  'http://localhost:3000',
  'http://localhost:3002',
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow server-to-server requests (no origin header)
    if (!origin) {
      callback(null, true);
      return;
    }
    
    if (ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`🚫 CORS blocked request from: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}));
// Allow larger payloads for multimodal image uploads (base64 can be large)
app.use(express.json({ limit: '12mb' }));
app.use(express.urlencoded({ limit: '12mb', extended: true }));

// Rate limiting middleware
app.use(globalLimiter); // Global: 100 req/min per IP

// Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;

// Try to load runtime config from setup wizard
let runtimeConfig = {};
try {
  const fs = await import('fs');
  const path = await import('path');
  const runtimePath = path.join(process.cwd(), 'config', 'runtime.json');
  if (fs.existsSync(runtimePath)) {
    runtimeConfig = JSON.parse(fs.readFileSync(runtimePath, 'utf8'));
    console.log('[Runtime] Loaded config from setup wizard');
    // Use runtime config as fallback for env vars
    process.env.SUPABASE_URL = process.env.SUPABASE_URL || runtimeConfig.supabaseUrl;
    process.env.SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || runtimeConfig.supabaseServiceKey;
    process.env.FRONTEND_URL = process.env.FRONTEND_URL || runtimeConfig.frontendUrl;
    // Set provider keys
    if (runtimeConfig.providers) {
      for (const [provider, key] of Object.entries(runtimeConfig.providers)) {
        if (key) {
          const envName = provider === 'groq' ? 'GROQ_KEY_1' : provider === 'cfApiKey' ? 'CF_API_KEY' : `${provider.toUpperCase()}_KEY`;
          process.env[envName] = process.env[envName] || key;
        }
      }
    }
  }
} catch (e) {
  // runtime.json doesn't exist yet - normal for first run
}

const supabaseUrlFinal = process.env.SUPABASE_URL;
const supabaseKeyFinal = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;

let supabase;
if (!supabaseUrlFinal || !supabaseKeyFinal) {
  console.warn('⚠️ No Supabase credentials in .env or setup config. Run the setup wizard.');
  supabase = createClient('https://placeholder.supabase.co', 'placeholder');
} else {
  supabase = createClient(supabaseUrlFinal, supabaseKeyFinal);
}
app.locals.supabase = supabase;

// Setup routes
setupRoutes(app);

// Error handling middleware (must be last)
app.use(errorHandler);

// Create HTTP server and attach WebSocket
const server = http.createServer(app);

// Initialize WebSocket manager
wsManager.initialize(server, providerLogger);

// Initialize cron jobs for subscription management
console.log('🚀 Initializing background tasks...');
initializeCronJobs(supabase, {
  subscriptionCheckInterval: 6 * 60 * 60 * 1000 // Check every 6 hours
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n🛑 SIGTERM received - shutting down gracefully...');
  stopAllCronJobs();
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n🛑 SIGINT received - shutting down gracefully...');
  stopAllCronJobs();
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`🔌 WebSocket server available at ws://localhost:${PORT}/ws`);
});
