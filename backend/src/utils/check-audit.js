const prisma = require('../config/db');

async function main() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  console.log(`\nAudit Logs Recorded (${logs.length}):`);
  for (const log of logs) {
    console.log(`[${log.action}] on [${log.entityType}] by User [${log.actorUserId || 'Anonymous'}] at ${log.createdAt.toISOString()}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
