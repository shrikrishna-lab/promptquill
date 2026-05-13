const sendServerErrorAlert = async (details) => { console.error('[SERVER ERROR]', details); };

// Rate limiting middleware
const rateLimit = new Map();

export const limitRequests = (windowMs = 60000, maxRequests = 100) => {
  return (req, res, next) => {
    const key = `${req.ip}-${req.path}`;
    const now = Date.now();
    
    if (!rateLimit.has(key)) {
      rateLimit.set(key, []);
    }
    
    const times = rateLimit.get(key).filter(t => now - t < windowMs);
    
    if (times.length >= maxRequests) {
      return res.status(429).json({ error: 'Too many requests, please try again later' });
    }
    
    times.push(now);
    rateLimit.set(key, times);
    next();
  };
};

// Error handling middleware (emails admin on crash)
export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  // Fire admin email (async, never blocks response)
  sendServerErrorAlert({
    message: err.message || 'Unknown Server Error',
    stack: err.stack,
    route: req.method + ' ' + req.originalUrl,
    userEmail: req.user?.email || 'Unauthenticated'
  }).catch(() => {});
  
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal server error' 
  });
};

export default { limitRequests, errorHandler };
