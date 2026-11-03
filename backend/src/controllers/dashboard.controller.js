const prisma = require('../config/db');

/**
 * GET /api/dashboard/summary
 * Returns aggregated dashboard metrics, filtered by division if provided.
 * All totals computed server-side from real data.
 */
async function getSummary(req, res, next) {
  try {
    const division = req.query.division;
    const divFilter = division ? { businessDivision: division } : {};

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dateFilter = {
      date: { gte: today, lt: tomorrow }
    };

    // Run all queries in parallel for speed
    const [
      todayIncomeResult,
      todayExpenseResult,
      totalEmployees,
      activeProjects,
      completedProjects,
      lowStockItems,
      equipmentRented,
      overdueRentals,
      upcomingMeetings,
      newLeadsToday,
      pendingInvoices,
    ] = await Promise.all([
      // Today's income
      prisma.income.aggregate({
        where: { ...divFilter, ...dateFilter, deletedAt: null },
        _sum: { amount: true }
      }),

      // Today's expenses
      prisma.expense.aggregate({
        where: { ...divFilter, ...dateFilter, deletedAt: null },
        _sum: { amount: true }
      }),

      // Total active employees
      prisma.employee.count({
        where: { ...divFilter, status: 'Active', deletedAt: null }
      }),

      // Active projects (Planned + Ongoing)
      prisma.project.count({
        where: { ...divFilter, status: { in: ['Planned', 'Ongoing'] }, deletedAt: null }
      }),

      // Completed projects
      prisma.project.count({
        where: { ...divFilter, status: 'Completed', deletedAt: null }
      }),

      // Low-stock items (quantity <= minStockLevel)
      prisma.inventoryItem.findMany({
        where: { ...divFilter, deletedAt: null },
        select: { quantity: true, minStockLevel: true }
      }),

      // Equipment currently rented
      prisma.equipment.count({
        where: { ...divFilter, status: 'Rented', deletedAt: null }
      }),

      // Overdue rentals (expectedReturn < now AND actualReturn is null)
      prisma.rental.count({
        where: {
          ...(division ? { equipment: { businessDivision: division } } : {}),
          expectedReturn: { lt: new Date() },
          actualReturn: null,
          deletedAt: null
        }
      }),

      // Upcoming meetings (next 7 days)
      prisma.appointment.count({
        where: {
          ...divFilter,
          dateTime: { gte: new Date(), lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
          status: { not: 'Cancelled' }
        }
      }),

      // New leads today
      prisma.lead.count({
        where: {
          ...divFilter,
          status: 'NEW',
          createdAt: { gte: today, lt: tomorrow },
          deletedAt: null
        }
      }),

      // Pending invoices (unpaid)
      prisma.invoice.count({
        where: {
          ...divFilter,
          paymentStatus: { in: ['Pending', 'Partially Paid'] },
          deletedAt: null
        }
      }),
    ]);

    const todayIncome = todayIncomeResult._sum.amount || 0;
    const todayExpenses = todayExpenseResult._sum.amount || 0;
    const lowStockCount = Array.isArray(lowStockItems)
      ? lowStockItems.filter(item => item.quantity <= item.minStockLevel).length
      : 0;

    res.json({
      todayIncome,
      todayExpenses,
      profitLoss: todayIncome - todayExpenses,
      totalEmployees,
      activeProjects,
      completedProjects,
      lowStockItems: lowStockCount,
      equipmentRented,
      overdueRentals,
      upcomingMeetings,
      newLeadsToday,
      pendingOrders: pendingInvoices,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getSummary };
