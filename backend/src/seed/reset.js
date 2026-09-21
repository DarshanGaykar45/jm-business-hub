const prisma = require('../config/db');
const { logAudit } = require('../utils/audit');

async function reset() {
  console.log('⚠️ Starting JM Business Hub Reset (Removing demo records)...');

  // Delete all demo data across tables
  const deleteTx = await prisma.$transaction([
    prisma.inventoryTransaction.deleteMany({ where: { isDemo: true } }),
    prisma.inventoryItem.deleteMany({ where: { isDemo: true } }),
    prisma.rental.deleteMany({ where: { isDemo: true } }),
    prisma.equipment.deleteMany({ where: { isDemo: true } }),
    prisma.projectEmployee.deleteMany({}),
    prisma.task.deleteMany({ where: { isDemo: true } }),
    prisma.project.deleteMany({ where: { isDemo: true } }),
    prisma.payment.deleteMany({ where: { isDemo: true } }),
    prisma.invoiceItem.deleteMany({}),
    prisma.invoice.deleteMany({ where: { isDemo: true } }),
    prisma.quotationItem.deleteMany({}),
    prisma.quotation.deleteMany({ where: { isDemo: true } }),
    prisma.lead.deleteMany({ where: { isDemo: true } }),
    prisma.customer.deleteMany({ where: { isDemo: true } }),
    prisma.employee.deleteMany({ where: { isDemo: true } }),
    prisma.appointment.deleteMany({ where: { isDemo: true } }),
    prisma.vehicleExpense.deleteMany({ where: { isDemo: true } }),
    prisma.vehicle.deleteMany({ where: { isDemo: true } }),
    prisma.income.deleteMany({ where: { isDemo: true } }),
    prisma.expense.deleteMany({ where: { isDemo: true } }),
    prisma.document.deleteMany({ where: { isDemo: true } }),
    prisma.notification.deleteMany({ where: { isDemo: true } }),
    prisma.userSession.deleteMany({}),
    prisma.user.deleteMany({ where: { isDemo: true } })
  ]);

  await logAudit({
    action: 'DEMO_DATA_RESET',
    entityType: 'System',
    entityId: 'reset_script',
    afterJson: { resetAt: new Date().toISOString() }
  });

  console.log('✅ Demo records successfully cleaned up.');
}

reset()
  .catch((e) => {
    console.error('❌ Reset failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
