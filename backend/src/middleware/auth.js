const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const env = require('../config/env');

/**
 * Authentication Middleware
 * Validates JWT access token from httpOnly cookies or Authorization header.
 * Attaches validated user and role to req.user.
 */
async function authenticate(req, res, next) {
  try {
    let token = null;

    // 1. Prefer httpOnly cookie
    if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    } 
    // 2. Fallback to Authorization Bearer header
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.substring(7);
    }

    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No active session or authentication token found.'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'TokenExpired',
          message: 'Session has expired. Please refresh or log in again.'
        });
      }
      return res.status(401).json({
        error: 'InvalidToken',
        message: 'Invalid session token.'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        role: {
          select: { id: true, name: true }
        }
      }
    });

    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'The user account associated with this session no longer exists.'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        error: 'AccountDeactivated',
        message: 'This account has been deactivated. Please contact the administrator.'
      });
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role, // { id, name }
      businessDivision: user.businessDivision,
      isDemo: user.isDemo
    };

    next();
  } catch (error) {
    console.error('Authentication Error:', error);
    return res.status(500).json({
      error: 'InternalServerError',
      message: 'Authentication check failed.'
    });
  }
}

module.exports = {
  authenticate
};
