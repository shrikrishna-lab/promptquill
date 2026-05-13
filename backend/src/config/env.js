export default {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY,
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  FROM_EMAIL: process.env.FROM_EMAIL || 'noreply@yourdomain.com',
  SUPPORT_EMAIL: process.env.SUPPORT_EMAIL || 'support@yourdomain.com',
};
