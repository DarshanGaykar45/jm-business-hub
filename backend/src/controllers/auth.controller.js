const authService = require('../services/auth.service');
const env = require('../config/env');
const { ROLE_PERMISSIONS } = require('../middleware/permissions');

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/'
};

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const { user, accessToken, rawRefreshToken } = await authService.loginUser({
      email,
      password,
      req
    });

    // Set httpOnly cookies
    res.cookie('accessToken', accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 60 * 60 * 1000 // 1 hour
    });

    res.cookie('refreshToken', rawRefreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      message: 'Login successful.',
      user
    });
  } catch (error) {
    next(error);
  }
}

async function logout(req, res, next) {
  try {
    const userId = req.user?.id;
    const rawRefreshToken = req.cookies?.refreshToken;

    if (userId) {
      await authService.logoutUser({ userId, rawRefreshToken, req });
    }

    res.clearCookie('accessToken', COOKIE_OPTIONS);
    res.clearCookie('refreshToken', COOKIE_OPTIONS);

    res.json({
      message: 'Logged out successfully.'
    });
  } catch (error) {
    next(error);
  }
}

async function getCurrentUser(req, res) {
  // req.user is set by authenticate middleware
  res.json({
    user: {
      ...req.user,
      role: req.user.role.name || req.user.role,
      permissions: ROLE_PERMISSIONS[req.user.role.name || req.user.role] || {}
    }
  });
}

async function register(req, res, next) {
  try {
    const actorUserId = req.user.id;
    const createdUser = await authService.registerUser({
      actorUserId,
      data: req.body,
      req
    });

    res.status(201).json({
      message: 'User created successfully.',
      user: createdUser
    });
  } catch (error) {
    next(error);
  }
}

async function signup(req, res, next) {
  try {
    const { name, email, password, phone, role, businessDivision } = req.body;
    const { user, accessToken, rawRefreshToken } = await authService.signupUser({
      name,
      email,
      password,
      phone,
      roleName: role,
      businessDivision,
      req
    });

    res.cookie('accessToken', accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 60 * 60 * 1000 // 1 hour
    });

    res.cookie('refreshToken', rawRefreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      message: 'Account created successfully.',
      user
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  login,
  logout,
  getCurrentUser,
  register,
  signup
};

