const prisma = require('../config/db');
const { logAudit } = require('../utils/audit');
const companyConfig = require('../config/company.config');

async function getSettings(req, res) {
  try {
    const settings = await prisma.setting.findMany();
    const settingsMap = {};
    settings.forEach(s => {
      try {
        settingsMap[s.key] = JSON.parse(s.valueJson);
      } catch (e) {
        settingsMap[s.key] = s.valueJson;
      }
    });

    // Provide default fallback settings if not yet saved in DB
    const defaults = {
      taxRate: 18,
      quotationPrefix: 'CONST-Q',
      invoicePrefix: 'CONST-INV',
      subsidySchemes: companyConfig.divisions.find(d => d.key === 'solar')?.subsidy?.schemes || [],
      solarCoefficients: companyConfig.divisions.find(d => d.key === 'solar')?.subsidy?.generation || [],
      companyInfo: companyConfig
    };

    return res.json({
      success: true,
      settings: { ...defaults, ...settingsMap }
    });
  } catch (error) {
    console.error('Get Settings Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to retrieve settings' });
  }
}

async function updateSetting(req, res) {
  try {
    const { key, value, category } = req.body;
    if (!key) return res.status(400).json({ error: 'ValidationError', message: 'Setting key is required' });

    const valueJson = typeof value === 'string' ? value : JSON.stringify(value);

    const setting = await prisma.setting.upsert({
      where: { key },
      update: { valueJson, updatedAt: new Date() },
      create: {
        key,
        valueJson,
        category: category || 'General'
      }
    });

    await logAudit({
      actorUserId: req.user.id,
      action: 'SETTING_UPDATE',
      entityType: 'Setting',
      entityId: key,
      afterJson: { key, value },
      req
    });

    return res.json({ success: true, setting });
  } catch (error) {
    console.error('Update Setting Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to update setting' });
  }
}

/**
 * Reset Demo Data (Owner only)
 */
async function resetDemoData(req, res) {
  try {
    // Delete only records flagged with isDemo: true
    await prisma.$transaction([
      prisma.notification.deleteMany({ where: { isDemo: true } }),
      prisma.task.deleteMany({ where: { isDemo: true } }),
      prisma.appointment.deleteMany({ where: { isDemo: true } }),
      prisma.payment.deleteMany({ where: { isDemo: true } }),
      prisma.invoiceItem.deleteMany({ where: { invoice: { isDemo: true } } }),
      prisma.invoice.deleteMany({ where: { isDemo: true } }),
      prisma.quotationItem.deleteMany({ where: { quotation: { isDemo: true } } }),
      prisma.quotation.deleteMany({ where: { isDemo: true } }),
      prisma.income.deleteMany({ where: { isDemo: true } }),
      prisma.expense.deleteMany({ where: { isDemo: true } }),
      prisma.rental.deleteMany({ where: { isDemo: true } }),
      prisma.lead.deleteMany({ where: { isDemo: true } }),
      prisma.inventoryTransaction.deleteMany({ where: { isDemo: true } }),
      prisma.inventoryItem.deleteMany({ where: { isDemo: true } }),
      prisma.projectEmployee.deleteMany({ where: { project: { isDemo: true } } }),
      prisma.project.deleteMany({ where: { isDemo: true } }),
      prisma.customer.deleteMany({ where: { isDemo: true } })
    ]);

    await logAudit({
      actorUserId: req.user.id,
      action: 'DEMO_DATA_RESET',
      entityType: 'System',
      entityId: 'AllDemo',
      req
    });

    return res.json({ success: true, message: 'All demo data has been cleaned successfully.' });
  } catch (error) {
    console.error('Demo Data Reset Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to reset demo data' });
  }
}

module.exports = {
  getSettings,
  updateSetting,
  resetDemoData
};
