const prisma = require('../config/db');
const { logAudit } = require('../utils/audit');
const { z } = require('zod');

const appointmentSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  type: z.enum(['Site Visit', 'Client Meeting', 'Solar Installation', 'Equipment Delivery', 'Team Sync']).default('Site Visit'),
  businessDivision: z.enum(['construction', 'solar', 'suppliers', 'group']).default('construction'),
  dateTime: z.string().or(z.date()),
  location: z.string().min(2, 'Location is required'),
  contactPerson: z.string().optional().nullable(),
  contactPhone: z.string().optional().nullable(),
  assignedEmployeeId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum(['Scheduled', 'Completed', 'Rescheduled', 'Cancelled']).default('Scheduled')
});

async function getAppointments(req, res) {
  try {
    const { division, upcoming } = req.query;
    const where = {};
    if (division && division !== 'all') where.businessDivision = division;

    if (upcoming === 'true') {
      const now = new Date();
      const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      where.dateTime = { gte: now, lte: in7Days };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      orderBy: { dateTime: 'asc' },
      include: {
        assignedEmployee: {
          select: { id: true, name: true, phone: true }
        }
      }
    });

    return res.json({ success: true, count: appointments.length, appointments });
  } catch (error) {
    console.error('Get Appointments Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to retrieve appointments' });
  }
}

async function createAppointment(req, res) {
  try {
    const parse = appointmentSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: 'ValidationError', message: parse.error.errors[0]?.message });

    const data = parse.data;
    const appointment = await prisma.appointment.create({
      data: {
        title: data.title,
        type: data.type,
        businessDivision: data.businessDivision,
        dateTime: new Date(data.dateTime),
        location: data.location,
        contactPerson: data.contactPerson || null,
        contactPhone: data.contactPhone || null,
        assignedEmployeeId: data.assignedEmployeeId ? data.assignedEmployeeId : null,
        notes: data.notes || null,
        status: data.status || 'Scheduled'
      },
      include: { assignedEmployee: true }
    });

    await logAudit({
      actorUserId: req.user.id,
      action: 'APPOINTMENT_CREATE',
      entityType: 'Appointment',
      entityId: appointment.id,
      afterJson: appointment,
      req
    });

    return res.status(201).json({ success: true, appointment });
  } catch (error) {
    console.error('Create Appointment Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to create appointment' });
  }
}

async function updateAppointment(req, res) {
  try {
    const { id } = req.params;
    const existing = await prisma.appointment.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'NotFound', message: 'Appointment not found' });

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        ...req.body,
        dateTime: req.body.dateTime ? new Date(req.body.dateTime) : undefined,
        updatedAt: new Date()
      },
      include: { assignedEmployee: true }
    });

    return res.json({ success: true, appointment: updated });
  } catch (error) {
    console.error('Update Appointment Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to update appointment' });
  }
}

/**
 * Delete appointment
 */
async function deleteAppointment(req, res) {
  try {
    const { id } = req.params;
    const existing = await prisma.appointment.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'NotFound', message: 'Appointment not found' });

    await prisma.appointment.delete({ where: { id } });

    await logAudit({
      actorUserId: req.user.id,
      action: 'APPOINTMENT_DELETE',
      entityType: 'Appointment',
      entityId: id,
      beforeJson: existing,
      req
    });

    return res.json({ success: true, message: 'Appointment cancelled and removed' });
  } catch (error) {
    console.error('Delete Appointment Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to delete appointment' });
  }
}

module.exports = {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment
};
