const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/permissions');
const { authRateLimiter } = require('../middleware/rateLimit');
const { validate } = require('../middleware/validate');
const { loginSchema, registerUserSchema } = require('../validators/auth.validator');

// Public Auth Endpoints
router.post(
  '/login',
  authRateLimiter,
  validate(loginSchema),
  authController.login
);

// Protected Auth Endpoints
router.post(
  '/logout',
  authenticate,
  authController.logout
);

router.get(
  '/me',
  authenticate,
  authController.getCurrentUser
);

// User Registration - Strictly Owner only
router.post(
  '/register',
  authenticate,
  authorize('users', 'create'),
  validate(registerUserSchema),
  authController.register
);

module.exports = router;
