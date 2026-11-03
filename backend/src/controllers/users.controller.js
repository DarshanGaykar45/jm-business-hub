const bcrypt = require('bcryptjs');
const prisma = require('../config/db');
const { logAudit } = require('../utils/audit');
const { z } = require('zod');

const userCreateSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(10, 'Password must be at least 10 characters'),
  roleName: z.enum(['Owner', 'Manager', 'Accountant', 'Employee']),
  phone: z.string().optional().nullable(),
  businessDivision: z.enum(['construction', 'solar', 'suppliers']).optional().nullable()
});

async function getUsers(req, res) {
  try {
    const users = await prisma.user.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        businessDivision: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        role: { select: { id: true, name: true } }
      }
    });

    return res.json({ success: true, count: users.length, users });
  } catch (error) {
    console.error('Get Users Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to retrieve users' });
  }
}

async function createUser(req, res) {
  try {
    const parse = userCreateSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: 'ValidationError', message: parse.error.errors[0]?.message });

    const { email, name, password, roleName, phone, businessDivision } = parse.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Conflict', message: 'User with this email already exists' });

    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) return res.status(400).json({ error: 'ValidationError', message: 'Invalid role specified' });

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        roleId: role.id,
        phone: phone || null,
        businessDivision: businessDivision || null,
        isActive: true,
        mustChangePassword: true
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: { select: { name: true } },
        isActive: true,
        createdAt: true
      }
    });

    await logAudit({
      actorUserId: req.user.id,
      action: 'USER_CREATE',
      entityType: 'User',
      entityId: user.id,
      afterJson: { email: user.email, role: roleName },
      req
    });

    return res.status(201).json({ success: true, user });
  } catch (error) {
    console.error('Create User Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to create user' });
  }
}

async function toggleUserStatus(req, res) {
  try {
    const { id } = req.params;
    if (id === req.user.id) {
      return res.status(400).json({ error: 'BadRequest', message: 'Cannot deactivate your own active account' });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: 'NotFound', message: 'User not found' });

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive, updatedAt: new Date() },
      select: { id: true, email: true, name: true, isActive: true }
    });

    await logAudit({
      actorUserId: req.user.id,
      action: updated.isActive ? 'USER_ACTIVATE' : 'USER_DEACTIVATE',
      entityType: 'User',
      entityId: id,
      afterJson: { isActive: updated.isActive },
      req
    });

    return res.json({ success: true, user: updated });
  } catch (error) {
    console.error('Toggle User Status Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to update user status' });
  }
}

/**
 * Get Immutable Audit Logs (strictly read-only)
 */
async function getAuditLogs(req, res) {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        actor: { select: { id: true, name: true, email: true } }
      }
    });

    return res.json({ success: true, count: logs.length, logs });
  } catch (error) {
    console.error('Get Audit Logs Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to retrieve audit logs' });
  }
}

/**
 * Delete User (Soft-delete with deletedAt)
 */
async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    if (id === req.user.id) {
      return res.status(400).json({ error: 'BadRequest', message: 'Cannot delete your own active user account' });
    }

    const user = await prisma.user.findUnique({ where: { id }, include: { role: true } });
    if (!user) return res.status(404).json({ error: 'NotFound', message: 'User not found' });

    // Protect primary owner account
    if (user.role.name === 'Owner') {
      const ownerCount = await prisma.user.count({
        where: { role: { name: 'Owner' }, deletedAt: null }
      });
      if (ownerCount <= 1) {
        return res.status(400).json({ error: 'Forbidden', message: 'Cannot delete the only remaining Owner account' });
      }
    }

    await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false }
    });

    await logAudit({
      actorUserId: req.user.id,
      action: 'USER_DELETE',
      entityType: 'User',
      entityId: id,
      beforeJson: { email: user.email, name: user.name },
      req
    });

    return res.json({ success: true, message: 'User account removed successfully' });
  } catch (error) {
    console.error('Delete User Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to delete user' });
  }
}

module.exports = {
  getUsers,
  createUser,
  toggleUserStatus,
  deleteUser,
  getAuditLogs
};
