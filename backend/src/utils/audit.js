const prisma = require('../config/db');

/**
 * Append-only Audit Logger
 * Records critical actions, actor ID, IP, user-agent, and before/after states.
 */
async function logAudit({
  actorUserId = null,
  action,
  entityType,
  entityId = null,
  beforeJson = null,
  afterJson = null,
  req = null
}) {
  try {
    const ipAddress = req ? (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || req.ip || null) : null;
    const userAgent = req ? (req.headers['user-agent'] || null) : null;

    await prisma.auditLog.create({
      data: {
        actorUserId,
        action,
        entityType,
        entityId: entityId ? String(entityId) : null,
        beforeJson: beforeJson ? (typeof beforeJson === 'string' ? beforeJson : JSON.stringify(beforeJson)) : null,
        afterJson: afterJson ? (typeof afterJson === 'string' ? afterJson : JSON.stringify(afterJson)) : null,
        ipAddress: ipAddress ? String(ipAddress) : null,
        userAgent: userAgent ? String(userAgent).substring(0, 255) : null
      }
    });
  } catch (error) {
    // Non-blocking error logging so primary business actions don't fail if audit fails
    console.error('Audit Log Insertion Failed:', error);
  }
}

module.exports = {
  logAudit
};
