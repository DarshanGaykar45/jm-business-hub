const prisma = require('../config/db');
const { logAudit } = require('../utils/audit');
const { z } = require('zod');

const equipmentSchema = z.object({
  name: z.string().min(2, 'Equipment name is required'),
  equipmentId: z.string().min(2, 'Equipment code is required'),
  category: z.string().min(2, 'Category is required'),
  businessDivision: z.enum(['construction', 'solar', 'suppliers', 'group']).default('construction'),
  status: z.enum(['Available', 'Rented', 'Maintenance', 'Unavailable']).default('Available'),
  rentalRatePerDay: z.number().min(0).default(0),
  purchaseDate: z.string().or(z.date()).optional().nullable(),
  condition: z.enum(['Excellent', 'Good', 'Needs Service']).default('Good'),
  notes: z.string().optional().nullable()
});

async function getEquipment(req, res) {
  try {
    const { division, status, category } = req.query;
    const where = { deletedAt: null };
    if (division && division !== 'all') where.businessDivision = division;
    if (status && status !== 'all') where.status = status;
    if (category && category !== 'all') where.category = category;

    const equipment = await prisma.equipment.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        rentals: {
          where: { actualReturn: null },
          include: { customer: true },
          take: 1
        }
      }
    });

    return res.json({ success: true, count: equipment.length, equipment });
  } catch (error) {
    console.error('Get Equipment Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to retrieve equipment' });
  }
}

async function createEquipment(req, res) {
  try {
    const parse = equipmentSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'ValidationError', message: parse.error.errors[0]?.message });
    }

    const item = await prisma.equipment.create({
      data: {
        ...parse.data,
        purchaseDate: parse.data.purchaseDate ? new Date(parse.data.purchaseDate) : null
      }
    });

    await logAudit({
      actorUserId: req.user.id,
      action: 'EQUIPMENT_CREATE',
      entityType: 'Equipment',
      entityId: item.id,
      afterJson: item,
      req
    });

    return res.status(201).json({ success: true, equipment: item });
  } catch (error) {
    console.error('Create Equipment Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to create equipment' });
  }
}

async function updateEquipment(req, res) {
  try {
    const { id } = req.params;
    const existing = await prisma.equipment.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'NotFound', message: 'Equipment not found' });

    const updated = await prisma.equipment.update({
      where: { id },
      data: {
        ...req.body,
        purchaseDate: req.body.purchaseDate ? new Date(req.body.purchaseDate) : undefined,
        updatedAt: new Date()
      }
    });

    await logAudit({
      actorUserId: req.user.id,
      action: 'EQUIPMENT_UPDATE',
      entityType: 'Equipment',
      entityId: id,
      beforeJson: existing,
      afterJson: updated,
      req
    });

    return res.json({ success: true, equipment: updated });
  } catch (error) {
    console.error('Update Equipment Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to update equipment' });
  }
}

module.exports = {
  getEquipment,
  createEquipment,
  updateEquipment
};
