const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@yourdomain.com';

export const sendAdminAlert = async (subject, message) => {
  if (!ADMIN_EMAIL) {
    console.log(`[ALERT] ${subject}: ${message}`);
    return;
  }
  console.log(`[ALERT] Would email ${ADMIN_EMAIL}: ${subject}`);
};

export const formatAdminUrl = (path) => `${FRONTEND_URL}/admin/${path}`;
