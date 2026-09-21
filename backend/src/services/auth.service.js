const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require('../config/db');
const env = require('../config/env');
const { logAudit } = require('../utils/audit');
const { ROLE_PERMISSIONS } = require('../middleware/permissions');

// Dummy bcrypt hash for constant-time comparison when user is not found
const DUMMY_HASH = '$2a$12$KBcT35rE80GkOeVJ2mQJ1OqF3cQW2U1Z1Q7bH3O6B6F4b8C2D5E1G';

const BCRYPT_SALT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRY = '1h'; // 1 hour
const REFRESH_TOKEN_EXPIRY_DAYS = 7; // 7 days

/**
 * Generate Access and Refresh Tokens
 */
function generateTokens(user) {
  const accessToken = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role.name,
      division: user.businessDivision
    },
    env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );

  const rawRefreshToken = crypto.randomBytes(40).toString('hex');
  const refreshTokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');

  return { accessToken, rawRefreshToken, refreshTokenHash };
}

/**
 * Login Service
 */
async function loginUser({ email, password, req }) {
  const normalizedEmail = email.toLowerCase().trim();

  // Find user with role
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: { role: true }
  });

  // Check account lockout
  if (user && user.lockoutUntil && user.lockoutUntil > new Date()) {
    await logAudit({
      action: 'LOGIN_BLOCKED_LOCKOUT',
      entityType: 'User',
      entityId: user.id,
      req
    });
    const error = new Error('Account temporarily locked due to multiple failed attempts. Please try again later.');
    error.statusCode = 423;
    throw error;
  }

  // Constant-time comparison: compare password against real hash or dummy hash
  const targetHash = user ? user.passwordHash : DUMMY_HASH;
  const isMatch = await bcrypt.compare(password, targetHash);

  if (!user || !isMatch) {
    if (user) {
      const attempts = user.failedLoginAttempts + 1;
      let lockoutUntil = null;
      if (attempts >= 5) {
        // Lock for 15 minutes
        lockoutUntil = new Date(Date.now() + 15 * 60 * 1000);
      }
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: attempts,
          lockoutUntil
        }
      });
    }

    await logAudit({
      actorUserId: user?.id || null,
      action: 'LOGIN_FAILURE',
      entityType: 'User',
      entityId: user?.id || null,
      beforeJson: { email: normalizedEmail, reason: 'Invalid credentials' },
      req
    });

    // Generic error message per security specification
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error('This account has been deactivated. Please contact administrator.');
    error.statusCode = 403;
    throw error;
  }

  // Generate tokens
  const { accessToken, rawRefreshToken, refreshTokenHash } = generateTokens(user);

  // Store refresh session in DB
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  await prisma.userSession.create({
    data: {
      userId: user.id,
      refreshTokenHash,
      ipAddress: req?.ip || null,
      userAgent: req?.headers['user-agent'] || null,
      expiresAt
    }
  });

  // Reset failed login counter and update lastLoginAt
  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: 0,
      lockoutUntil: null,
      lastLoginAt: new Date()
    }
  });

  // Audit login success
  await logAudit({
    actorUserId: user.id,
    action: 'LOGIN_SUCCESS',
    entityType: 'User',
    entityId: user.id,
    req
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role.name,
      businessDivision: user.businessDivision,
      isDemo: user.isDemo,
      permissions: ROLE_PERMISSIONS[user.role.name] || {}
    },
    accessToken,
    rawRefreshToken
  };
}

/**
 * Logout Service
 */
async function logoutUser({ userId, rawRefreshToken, req }) {
  if (rawRefreshToken) {
    const refreshTokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');
    await prisma.userSession.updateMany({
      where: {
        userId,
        refreshTokenHash,
        revokedAt: null
      },
      data: {
        revokedAt: new Date()
      }
    });
  }

  await logAudit({
    actorUserId: userId,
    action: 'LOGOUT',
    entityType: 'User',
    entityId: userId,
    req
  });

  return { success: true };
}

/**
 * Register User (Owner-Only)
 */
async function registerUser({ actorUserId, data, req }) {
  const existing = await prisma.user.findUnique({
    where: { email: data.email }
  });

  if (existing) {
    const error = new Error('An account with this email address already exists.');
    error.statusCode = 409;
    throw error;
  }

  const role = await prisma.role.findUnique({
    where: { id: data.roleId }
  });

  if (!role) {
    const error = new Error('Specified role does not exist.');
    error.statusCode = 400;
    throw error;
  }

  const passwordHash = await bcrypt.hash(data.password, BCRYPT_SALT_ROUNDS);

  const newUser = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      name: data.name,
      phone: data.phone || null,
      roleId: role.id,
      businessDivision: data.businessDivision || null,
      isDemo: !!data.isDemo
    },
    include: { role: true }
  });

  await logAudit({
    actorUserId,
    action: 'USER_CREATE',
    entityType: 'User',
    entityId: newUser.id,
    afterJson: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: role.name
    },
    req
  });

  return {
    id: newUser.id,
    email: newUser.email,
    name: newUser.name,
    role: newUser.role.name,
    businessDivision: newUser.businessDivision,
    createdAt: newUser.createdAt
  };
}

/**
 * Public Signup Service - Registers real user and logs them in
 */
async function signupUser({ name, email, password, phone, roleName = 'Owner', businessDivision = null, req }) {
  const normalizedEmail = email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail }
  });

  if (existing) {
    const error = new Error('An account with this email address already exists.');
    error.statusCode = 409;
    throw error;
  }

  // Find or default role
  let role = await prisma.role.findUnique({
    where: { name: roleName || 'Owner' }
  });

  if (!role) {
    role = await prisma.role.findFirst();
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

  const newUser = await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash,
      name: name.trim(),
      phone: phone ? phone.trim() : null,
      roleId: role.id,
      businessDivision: businessDivision || null,
      isDemo: false
    },
    include: { role: true }
  });

  // Generate tokens and log them in directly
  const { accessToken, rawRefreshToken, refreshTokenHash } = generateTokens(newUser);

  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  await prisma.userSession.create({
    data: {
      userId: newUser.id,
      refreshTokenHash,
      ipAddress: req?.ip || null,
      userAgent: req?.headers['user-agent'] || null,
      expiresAt
    }
  });

  await logAudit({
    actorUserId: newUser.id,
    action: 'USER_SIGNUP',
    entityType: 'User',
    entityId: newUser.id,
    afterJson: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: role.name
    },
    req
  });

  return {
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      phone: newUser.phone,
      role: newUser.role.name,
      businessDivision: newUser.businessDivision,
      isDemo: false,
      permissions: ROLE_PERMISSIONS[newUser.role.name] || {}
    },
    accessToken,
    rawRefreshToken
  };
}

module.exports = {
  loginUser,
  logoutUser,
  registerUser,
  signupUser,
  BCRYPT_SALT_ROUNDS
};

