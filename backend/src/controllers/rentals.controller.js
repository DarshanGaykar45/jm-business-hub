const prisma = require('../config/db');
const { logAudit } = require('../utils/audit');
const { z } = require('zod');

const rentalSchema = z.object({
  equipmentId: z.string().min(1, 'Equipment is required'),
  customerId: z.string().min(1, 'Customer is required'),
  rentalStart: z.string().or(z.date()),
  expectedReturn: z.string().or(z.date()),
  rentalAmount: z.number().min(0).default(0),
  depositAmount: z.number().min(0).default(0),
  paymentStatus: z.enum(['Paid', 'Partially Paid', 'Pending']).default('Pending'),
  notes: z.string().optional().nullable()
});

/**
 * Get all rentals with overdue calculation
 */
async function getRentals(req, res) {
  try {
    const { status, customerId, overdue } = req.query;

    const where = { deletedAt: null };
    if (customerId) {
      where.customerId = customerId;
    }
    if (status && status !== 'all') {
      where.paymentStatus = status;
    }

    const rentals = await prisma.rental.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        equipment: true,
        customer: true
      }
    });

    const now = new Date();
    const enriched = rentals.map(r => {
      const isOverdue = !r.actualReturn && new Date(r.expectedReturn) < now;
      return {
        ...r,
        isOverdue
      };
    });

    const filtered = overdue === 'true' ? enriched.filter(r => r.isOverdue) : enriched;

    return res.json({ success: true, count: filtered.length, rentals: filtered });
  } catch (error) {
    console.error('Get Rentals Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to retrieve rentals' });
  }
}

/**
 * Create rental
 * AUTO-STATUS TRANSITION: Rejects if equipment is not 'Available'. Auto-updates to 'Rented'.
 */
async function createRental(req, res) {
  try {
    const parse = rentalSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'ValidationError', message: parse.error.errors[0]?.message });
    }

    const data = parse.data;

    // Check equipment availability
    const equipment = await prisma.equipment.findUnique({ where: { id: data.equipmentId } });
    if (!equipment) {
      return res.status(404).json({ error: 'NotFound', message: 'Equipment not found' });
    }

    if (equipment.status !== 'Available') {
      return res.status(400).json({
        error: 'EquipmentUnavailable',
        message: `Cannot rent '${equipment.name}'. Current status is '${equipment.status}'. Equipment must be 'Available'.`
      });
    }

    // Atomic transaction: create rental record AND update equipment status to 'Rented'
    const [rental, updatedEquip] = await prisma.$transaction([
      prisma.rental.create({
        data: {
          equipmentId: data.equipmentId,
          customerId: data.customerId,
          rentalStart: new Date(data.rentalStart),
          expectedReturn: new Date(data.expectedReturn),
          rentalAmount: data.rentalAmount,
          depositAmount: data.depositAmount,
          paymentStatus: data.paymentStatus,
          notes: data.notes || null
        },
        include: { equipment: true, customer: true }
      }),
      prisma.equipment.update({
        where: { id: data.equipmentId },
        data: { status: 'Rented', updatedAt: new Date() }
      })
    ]);

    await logAudit({
      actorUserId: req.user.id,
      action: 'RENTAL_CREATE',
      entityType: 'Rental',
      entityId: rental.id,
      afterJson: rental,
      req
    });

    return res.status(201).json({ success: true, rental, equipment: updatedEquip });
  } catch (error) {
    console.error('Create Rental Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to create rental' });
  }
}

/**
 * Record equipment return
 * AUTO-STATUS TRANSITION: Updates equipment status to 'Available' (or 'Maintenance')
 */
async function recordReturn(req, res) {
  try {
    const { id } = req.params;
    const { actualReturn, conditionOnReturn, maintenanceNeeded, notes } = req.body;

    const rental = await prisma.rental.findUnique({
      where: { id },
      include: { equipment: true }
    });

    if (!rental) {
      return res.status(404).json({ error: 'NotFound', message: 'Rental record not found' });
    }

    const nextStatus = maintenanceNeeded ? 'Maintenance' : 'Available';

    const [updatedRental, updatedEquip] = await prisma.$transaction([
      prisma.rental.update({
        where: { id },
        data: {
          actualReturn: actualReturn ? new Date(actualReturn) : new Date(),
          conditionOnReturn: conditionOnReturn || 'Good',
          notes: notes !== undefined ? notes : rental.notes,
          updatedAt: new Date()
        },
        include: { equipment: true, customer: true }
      }),
      prisma.equipment.update({
        where: { id: rental.equipmentId },
        data: {
          status: nextStatus,
          condition: conditionOnReturn || 'Good',
          updatedAt: new Date()
        }
      })
    ]);

    await logAudit({
      actorUserId: req.user.id,
      action: 'RENTAL_RETURN',
      entityType: 'Rental',
      entityId: id,
      afterJson: { rental: updatedRental, equipmentStatus: nextStatus },
      req
    });

    return res.json({
      success: true,
      message: `Equipment returned. Status set to '${nextStatus}'.`,
      rental: updatedRental,
      equipment: updatedEquip
    });
  } catch (error) {
    console.error('Record Return Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to record return' });
  }
}

/**
 * Update rental payment
 */
async function updateRentalPayment(req, res) {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    const updated = await prisma.rental.update({
      where: { id },
      data: { paymentStatus, updatedAt: new Date() },
      include: { equipment: true, customer: true }
    });

    return res.json({ success: true, rental: updated });
  } catch (error) {
    console.error('Update Rental Payment Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to update payment status' });
  }
}

/**
 * Update rental contract details
 */
async function updateRental(req, res) {
  try {
    const { id } = req.params;
    const existing = await prisma.rental.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'NotFound', message: 'Rental record not found' });

    const updated = await prisma.rental.update({
      where: { id },
      data: {
        ...req.body,
        rentalStart: req.body.rentalStart ? new Date(req.body.rentalStart) : undefined,
        expectedReturn: req.body.expectedReturn ? new Date(req.body.expectedReturn) : undefined,
        rentalAmount: req.body.rentalAmount !== undefined ? Number(req.body.rentalAmount) : undefined,
        depositAmount: req.body.depositAmount !== undefined ? Number(req.body.depositAmount) : undefined,
        updatedAt: new Date()
      },
      include: { equipment: true, customer: true }
    });

    await logAudit({
      actorUserId: req.user.id,
      action: 'RENTAL_UPDATE',
      entityType: 'Rental',
      entityId: id,
      beforeJson: existing,
      afterJson: updated,
      req
    });

    return res.json({ success: true, rental: updated });
  } catch (error) {
    console.error('Update Rental Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to update rental' });
  }
}

/**
 * Delete rental (Soft-delete)
 */
async function deleteRental(req, res) {
  try {
    const { id } = req.params;
    const existing = await prisma.rental.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'NotFound', message: 'Rental record not found' });

    // If active rental is deleted, free the equipment back to 'Available'
    if (!existing.actualReturn) {
      await prisma.equipment.update({
        where: { id: existing.equipmentId },
        data: { status: 'Available', updatedAt: new Date() }
      });
    }

    await prisma.rental.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    await logAudit({
      actorUserId: req.user.id,
      action: 'RENTAL_DELETE',
      entityType: 'Rental',
      entityId: id,
      beforeJson: existing,
      req
    });

    return res.json({ success: true, message: 'Rental record deleted successfully' });
  } catch (error) {
    console.error('Delete Rental Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to delete rental' });
  }
}

module.exports = {
  getRentals,
  createRental,
  updateRental,
  deleteRental,
  recordReturn,
  updateRentalPayment
};
