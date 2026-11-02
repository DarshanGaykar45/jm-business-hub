const prisma = require('../config/db');

/**
 * Monthly Financial Trends & Breakdown
 */
async function getFinancialReport(req, res) {
  try {
    const { division } = req.query;
    const where = { deletedAt: null };
    if (division && division !== 'all') where.businessDivision = division;

    const [incomes, expenses] = await Promise.all([
      prisma.income.findMany({ where, orderBy: { date: 'asc' } }),
      prisma.expense.findMany({ where, orderBy: { date: 'asc' } })
    ]);

    // Aggregate by Month (e.g. "2026-08", "2026-09")
    const monthMap = {};
    incomes.forEach(inc => {
      const d = new Date(inc.date);
      const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthMap[m]) monthMap[m] = { month: m, income: 0, expense: 0, profit: 0 };
      monthMap[m].income += inc.amount || 0;
    });

    expenses.forEach(exp => {
      const d = new Date(exp.date);
      const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthMap[m]) monthMap[m] = { month: m, income: 0, expense: 0, profit: 0 };
      monthMap[m].expense += exp.amount || 0;
    });

    const monthlyTrends = Object.values(monthMap).map(item => ({
      ...item,
      profit: item.income - item.expense
    })).sort((a, b) => a.month.localeCompare(b.month));

    return res.json({ success: true, monthlyTrends });
  } catch (error) {
    console.error('Financial Report Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to generate financial report' });
  }
}

/**
 * Lead Conversion Funnel
 */
async function getLeadFunnel(req, res) {
  try {
    const { division } = req.query;
    const where = { deletedAt: null };
    if (division && division !== 'all') where.businessDivision = division;

    const leads = await prisma.lead.findMany({ where });
    const total = leads.length || 1;

    const stages = {
      NEW: leads.filter(l => l.status === 'NEW').length,
      CONTACTED: leads.filter(l => l.status === 'CONTACTED').length,
      QUOTED: leads.filter(l => l.status === 'QUOTED').length,
      WON: leads.filter(l => l.status === 'WON').length,
      LOST: leads.filter(l => l.status === 'LOST').length
    };

    const funnel = [
      { stage: 'New Leads', count: stages.NEW, percentage: Math.round((stages.NEW / total) * 100) },
      { stage: 'Contacted', count: stages.CONTACTED, percentage: Math.round((stages.CONTACTED / total) * 100) },
      { stage: 'Quoted', count: stages.QUOTED, percentage: Math.round((stages.QUOTED / total) * 100) },
      { stage: 'Won / Customer', count: stages.WON, percentage: Math.round((stages.WON / total) * 100) },
      { stage: 'Lost / Closed', count: stages.LOST, percentage: Math.round((stages.LOST / total) * 100) }
    ];

    return res.json({ success: true, totalLeads: leads.length, funnel, stages });
  } catch (error) {
    console.error('Lead Funnel Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to generate lead funnel report' });
  }
}

/**
 * Inventory Valuation & Stock Turnover
 */
async function getInventoryReport(req, res) {
  try {
    const { division } = req.query;
    const where = { deletedAt: null };
    if (division && division !== 'all') where.businessDivision = division;

    const items = await prisma.inventoryItem.findMany({ where });

    let totalValuation = 0;
    let totalSellingValue = 0;
    let lowStockCount = 0;

    items.forEach(item => {
      totalValuation += item.quantity * (item.purchasePrice || 0);
      totalSellingValue += item.quantity * (item.sellingPrice || 0);
      if (item.quantity <= item.minStockLevel) lowStockCount++;
    });

    return res.json({
      success: true,
      totalItems: items.length,
      totalValuation,
      totalSellingValue,
      projectedMargin: totalSellingValue - totalValuation,
      lowStockCount
    });
  } catch (error) {
    console.error('Inventory Report Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to generate inventory report' });
  }
}

module.exports = {
  getFinancialReport,
  getLeadFunnel,
  getInventoryReport
};
