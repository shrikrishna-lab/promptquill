import {
  getProfile,
  updateProfile,
  getPrompts,
  createPrompt,
  updatePrompt,
  deletePrompt,
  generatePrompt,
} from '../controllers/index.js';
import emailRoutes from './email.js';
import referralRoutes from './referrals.js';
import featuresRoutes from './features.js';
import aiGenerationRoutes from './aiGeneration.js';
import generateRoute from '../../routes/generate.js';
import briefsRoute from '../../routes/briefs.js';
import communityRoute from '../../routes/community.js';
import settingsRoute from '../../routes/settings.js';
import testRoute from '../../routes/test.js';
import setupRoute from '../../routes/setup.js';
import forumRoutes from './forum.js';
import creditsRoutes from './creditsRoutes.js';
import { getBlogPosts, getBlogPost } from './blog.js';
import providerManager from '../utils/providerManager.js';
import { checkBanStatus } from './adminRoutes.js';
import { limitRequests } from '../middleware/index.js';
import { aiGenerationLimiter, ipAbuseLimiter, webhookLimiter } from '../middleware/rateLimiter.js';
import { createUserReferral } from '../utils/referral.js';

export const setupRoutes = (app) => {
  // Initialize Provider Manager with API keys from environment
  console.log('[Routes] 🤖 Initializing Provider Manager...');
  providerManager.init({
    geminiKey: process.env.VITE_GEMINI_API_KEY_1 || process.env.GEMINI_API_KEY,
    groqKey: process.env.VITE_GROQ_API_KEY_1 || process.env.GROQ_API_KEY,
    openrouterKey: process.env.VITE_OPENROUTER_API_KEY_1 || process.env.OPENROUTER_API_KEY
  });

  // Favicon (browser auto-request, return 204 No Content)
  app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
  });

  // Favicon fallback for other formats (png, svg, etc)
  app.get(['/favicon.png', '/favicon.svg', '/favicon.webp', '/apple-touch-icon.png'], (req, res) => {
    res.status(204).end();
  });

  // Root index route
  app.get('/', (req, res) => {
    res.json({ message: 'Prompter Backend API', status: 'running', docs: '/api/health' });
  });

  // Health check (no auth required)
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend is running' });
  });

  // Set up Supabase client on all /api routes
  app.use('/api/', (req, res, next) => {
    req.supabase = req.app.locals.supabase;
    next();
  });

  // User Profile Routes
  app.get('/api/profile', getProfile);
  app.put('/api/profile', updateProfile);

  /**
   * POST /api/onboard
   * Initialize user account (create referral code, etc)
   */
  app.post('/api/onboard', async (req, res) => {
    try {
      const userId = req.body.userId || '00000000-0000-0000-0000-000000000000';
      const userName = req.body.userName || 'User';

      // Create referral record if doesn't exist
      const { data: existingReferral } = await req.supabase
        .from('referrals')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (!existingReferral) {
        console.log(`📝 Creating referral for ${userName} (${userId})`);
        await createUserReferral(userId, userName, req.supabase);
      }

      // Return the referral code
      const { data: referral } = await req.supabase
        .from('referrals')
        .select('code')
        .eq('user_id', userId)
        .single();

      res.json({ success: true, code: referral?.code });
    } catch (error) {
      console.error('❌ Onboard error:', error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // Prompt Routes
  app.get('/api/prompts', getPrompts);
  app.post('/api/prompts', createPrompt);
  app.put('/api/prompts/:id', updatePrompt);
  app.delete('/api/prompts/:id', deletePrompt);

  // ═══════════════════════════════════════════════════════
  // EMAIL ROUTES (Resend)
  // ═══════════════════════════════════════════════════════
  // Rate limited: 10 requests per minute per IP (prevent spam)
  app.use('/api/email', limitRequests(60000, 10), (req, res, next) => {
    req.supabase = req.app.locals.supabase;
    next();
  }, emailRoutes);

  // ═══════════════════════════════════════════════════════
  // REFERRAL ROUTES
  // ═══════════════════════════════════════════════════════
  app.use('/api/referrals', (req, res, next) => {
    req.supabase = req.app.locals.supabase;
    next();
  }, referralRoutes);

  // ═══════════════════════════════════════════════════════
  // FEATURES ROUTES (Battles, Collab, Achievements, etc)
  // ═══════════════════════════════════════════════════════
  app.use('/api/features', featuresRoutes);

  // ═══════════════════════════════════════════════════════
  // BAN STATUS (kept for auth checks)
  // ═══════════════════════════════════════════════════════
  app.get('/api/auth/ban-status', checkBanStatus);

  // ═══════════════════════════════════════════════════════
  // AI GENERATION ROUTES (Provider management with fallback)
  // ═══════════════════════════════════════════════════════
  // AI Generation limiter: 30 requests/min per authenticated user
  // ipAbuseLimiter: 50 requests/day strictly per IP to prevent "Free Tier Farming" limit bypasses
  app.use('/api/ai', aiGenerationLimiter, ipAbuseLimiter, aiGenerationRoutes);

  // ═══════════════════════════════════════════════════════
  // FORUM ROUTES (Community forums with categories, threads, posts)
  // ═══════════════════════════════════════════════════════
  app.use('/api/forum', (req, res, next) => {
    req.supabase = req.app.locals.supabase;
    next();
  }, forumRoutes);

  // ═══════════════════════════════════════════════════════
  // CREDITS ROUTES
  // ═══════════════════════════════════════════════════════
  app.use('/api/credits', (req, res, next) => {
    req.supabase = req.app.locals.supabase;
    next();
  }, creditsRoutes);

  // ═══════════════════════════════════════════════════════
  // NEW OPEN SOURCE API ROUTES
  // ═══════════════════════════════════════════════════════
  app.use('/api/generate', (req, res, next) => {
    req.supabase = req.app.locals.supabase;
    next();
  }, generateRoute);

  app.use('/api/briefs', (req, res, next) => {
    req.supabase = req.app.locals.supabase;
    next();
  }, briefsRoute);

  app.use('/api/community', (req, res, next) => {
    req.supabase = req.app.locals.supabase;
    next();
  }, communityRoute);

  app.use('/api/settings', (req, res, next) => {
    req.supabase = req.app.locals.supabase;
    next();
  }, settingsRoute);

  app.use('/api/test', (req, res, next) => {
    req.supabase = req.app.locals.supabase;
    next();
  }, testRoute);

  // ═══════════════════════════════════════════════════════
  // SETUP ROUTES (Database initialization)
  // ═══════════════════════════════════════════════════════
  app.use('/api/setup', (req, res, next) => {
    req.supabase = req.app.locals.supabase;
    next();
  }, setupRoute);

  // ═══════════════════════════════════════════════════════
  // BLOG ROUTES (Public blog endpoints)
  // ═══════════════════════════════════════════════════════
  app.get('/api/blog', (req, res, next) => {
    req.supabase = req.app.locals.supabase;
    next();
  }, getBlogPosts);
  
  app.get('/api/blog/:idOrSlug', (req, res, next) => {
    req.supabase = req.app.locals.supabase;
    next();
  }, getBlogPost);

  // ═══════════════════════════════════════════════════════
  // ERROR LOGGING ROUTE
  // ═══════════════════════════════════════════════════════
  app.post('/api/errors', (req, res) => {
    // We can log this to the database, Sentry, or just console
    console.error('Frontend Error Report:', req.body);
    res.json({ success: true, logged: true });
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });
};

export default { setupRoutes };

