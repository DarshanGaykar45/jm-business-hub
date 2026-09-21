const rateLimit = require('express-rate-limit');
const { logAudit } = require('../utils/audit');

/**
 * Strict Rate Limiter for Authentication endpoints
 * Blocks brute force: 5 attempts per 15 minutes per IP
 */
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 5000 : 20, // generous in dev, strict in prod
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logAudit({
      action: 'RATE_LIMIT_LOCKOUT',
      entityType: 'Authentication',
      entityId: req.body?.email || 'unknown',
      beforeJson: { ip: req.ip, endpoint: req.originalUrl },
      req
    });

    return res.status(429).json({
      error: 'TooManyRequests',
      message: 'Too many login attempts. Please try again after 15 minutes.'
    });
  }
});

module.exports = {
  authRateLimiter
};
