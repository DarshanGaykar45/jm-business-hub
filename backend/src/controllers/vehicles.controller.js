const prisma = require('../config/db');
const { logAudit } = require('../utils/audit');
const { z } = require('zod');

const vehicleSchema = z.object({
  registrationNo: z.string().min(3, 'Registration number is required'),
  type: z.string().min(2, 'Vehicle type is required'),
  driverName: z.string().optional().nullable(),
  businessDivision: z.enum(['construction', 'solar', 'suppliers', 'group']).default('suppliers'),
  lastServiceDate: z.string().or(z.date()).optional().nullable(),
  nextServiceDate: z.string().or(z.date()).optional().nullable(),
  maintenanceStatus: z.enum(['Operational', 'In Service', 'Standby']).default('Operational')
});

async function getVehicles(req, res) {
  try {
    const { division, status } = req.query;
    const where = { deletedAt: null };
    if (division && division !== 'all') where.businessDivision = division;
    if (status && status !== 'all') where.maintenanceStatus = status;

    const vehicles = await prisma.vehicle.findMany({
      where,
      orderBy: { registrationNo: 'asc' },
      include: {
        expenses: {
          take: 5,
          orderBy: { date: 'desc' }
        }
      }
    });

    return res.json({ success: true, count: vehicles.length, vehicles });
  } catch (error) {
    console.error('Get Vehicles Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to retrieve vehicles' });
  }
}

async function createVehicle(req, res) {
  try {
    const parse = vehicleSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: 'ValidationError', message: parse.error.errors[0]?.message });

    const vehicle = await prisma.vehicle.create({
      data: {
        ...parse.data,
        lastServiceDate: parse.data.lastServiceDate ? new Date(parse.data.lastServiceDate) : null,
        nextServiceDate: parse.data.nextServiceDate ? new Date(parse.data.nextServiceDate) : null
      }
    });

    await logAudit({
      actorUserId: req.user.id,
      action: 'VEHICLE_CREATE',
      entityType: 'Vehicle',
      entityId: vehicle.id,
      afterJson: vehicle,
      req
    });

    return res.status(201).json({ success: true, vehicle });
  } catch (error) {
    console.error('Create Vehicle Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to create vehicle' });
  }
}

async function logVehicleExpense(req, res) {
  try {
    const { id } = req.params;
    const { type, amount, date, description } = req.body;

    const expense = await prisma.vehicleExpense.create({
      data: {
        vehicleId: id,
        type: type || 'Fuel',
        amount: parseFloat(amount),
        date: date ? new Date(date) : new Date(),
        description: description || null
      }
    });

    return res.status(201).json({ success: true, expense });
  } catch (error) {
    console.error('Log Vehicle Expense Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to log vehicle expense' });
  }
}

/**
 * Update vehicle details
 */
async function updateVehicle(req, res) {
  try {
    const { id } = req.params;
    const existing = await prisma.vehicle.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'NotFound', message: 'Vehicle not found' });

    const updated = await prisma.vehicle.update({
      where: { id },
      data: {
        ...req.body,
        registrationNo: req.body.registrationNo ? req.body.registrationNo.toUpperCase() : undefined,
        lastServiceDate: req.body.lastServiceDate ? new Date(req.body.lastServiceDate) : undefined,
        nextServiceDate: req.body.nextServiceDate ? new Date(req.body.nextServiceDate) : undefined,
        updatedAt: new Date()
      }
    });

    await logAudit({
      actorUserId: req.user.id,
      action: 'VEHICLE_UPDATE',
      entityType: 'Vehicle',
      entityId: id,
      beforeJson: existing,
      afterJson: updated,
      req
    });

    return res.json({ success: true, vehicle: updated });
  } catch (error) {
    console.error('Update Vehicle Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to update vehicle' });
  }
}

/**
 * Delete vehicle (Soft-delete)
 */
async function deleteVehicle(req, res) {
  try {
    const { id } = req.params;
    const existing = await prisma.vehicle.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'NotFound', message: 'Vehicle not found' });

    await prisma.vehicle.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    await logAudit({
      actorUserId: req.user.id,
      action: 'VEHICLE_DELETE',
      entityType: 'Vehicle',
      entityId: id,
      beforeJson: existing,
      req
    });

    return res.json({ success: true, message: 'Vehicle deleted from logistics fleet' });
  } catch (error) {
    console.error('Delete Vehicle Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to delete vehicle' });
  }
}

/**
 * Delete vehicle expense
 */
async function deleteVehicleExpense(req, res) {
  try {
    const { expenseId } = req.params;
    await prisma.vehicleExpense.delete({ where: { id: expenseId } });
    return res.json({ success: true, message: 'Expense record deleted' });
  } catch (error) {
    console.error('Delete Vehicle Expense Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to delete expense' });
  }
}

module.exports = {
  getVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  logVehicleExpense,
  deleteVehicleExpense
};
