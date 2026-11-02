const prisma = require('../config/db');
const companyConfig = require('../config/company.config');
const { logAudit } = require('../utils/audit');

async function getDivisions(req, res) {
  try {
    const dbDivisions = await prisma.setting.findUnique({
      where: { key: 'custom_divisions' }
    });

    if (dbDivisions && dbDivisions.valueJson) {
      try {
        const parsed = JSON.parse(dbDivisions.valueJson);
        return res.json({ success: true, divisions: parsed });
      } catch (e) {
        // fallback to companyConfig
      }
    }

    return res.json({ success: true, divisions: companyConfig.divisions });
  } catch (error) {
    console.error('Get Divisions Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to retrieve divisions' });
  }
}

async function updateDivisions(req, res) {
  try {
    const { divisions } = req.body;
    if (!Array.isArray(divisions)) {
      return res.status(400).json({ error: 'ValidationError', message: 'Divisions array is required' });
    }

    await prisma.setting.upsert({
      where: { key: 'custom_divisions' },
      update: { valueJson: JSON.stringify(divisions), updatedAt: new Date() },
      create: { key: 'custom_divisions', valueJson: JSON.stringify(divisions), category: 'Company' }
    });

    await logAudit({
      actorUserId: req.user.id,
      action: 'DIVISIONS_UPDATE',
      entityType: 'BusinessDivision',
      entityId: 'All',
      afterJson: divisions,
      req
    });

    return res.json({ success: true, message: 'Business divisions updated successfully', divisions });
  } catch (error) {
    console.error('Update Divisions Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to update divisions' });
  }
}

module.exports = {
  getDivisions,
  updateDivisions
};
