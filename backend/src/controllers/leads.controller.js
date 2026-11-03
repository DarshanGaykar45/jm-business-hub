const prisma = require('../config/db');
const { logAudit } = require('../utils/audit');

/**
 * Get leads with filtering
 */
async function getLeads(req, res) {
  try {
    const { division, status, search } = req.query;

    const where = { deletedAt: null };
    if (division && division !== 'all') {
      where.businessDivision = division;
    }
    if (status && status !== 'all') {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { requirement: { contains: search, mode: 'insensitive' } }
      ];
    }

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        convertedCustomer: {
          select: { id: true, name: true }
        }
      }
    });

    return res.json({ success: true, count: leads.length, leads });
  } catch (error) {
    console.error('Get Leads Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to retrieve leads' });
  }
}

/**
 * Update lead status, notes, or follow up
 */
async function updateLead(req, res) {
  try {
    const { id } = req.params;
    const existing = await prisma.lead.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'NotFound', message: 'Lead not found' });
    }

    const { status, notes, followUpDate, assignedTo } = req.body;

    const updated = await prisma.lead.update({
      where: { id },
      data: {
        status: status || existing.status,
        notes: notes !== undefined ? notes : existing.notes,
        followUpDate: followUpDate ? new Date(followUpDate) : existing.followUpDate,
        assignedTo: assignedTo !== undefined ? assignedTo : existing.assignedTo,
        updatedAt: new Date()
      }
    });

    await logAudit({
      actorUserId: req.user.id,
      action: 'LEAD_UPDATE',
      entityType: 'Lead',
      entityId: id,
      beforeJson: existing,
      afterJson: updated,
      req
    });

    return res.json({ success: true, lead: updated });
  } catch (error) {
    console.error('Update Lead Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to update lead' });
  }
}

/**
 * Convert lead to Customer
 */
async function convertLeadToCustomer(req, res) {
  try {
    const { id } = req.params;
    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) {
      return res.status(404).json({ error: 'NotFound', message: 'Lead not found' });
    }

    // Check if customer already created
    let customer = await prisma.customer.findFirst({
      where: { phone: lead.phone, deletedAt: null }
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: lead.name,
          phone: lead.phone,
          email: lead.email || null,
          businessDivision: lead.businessDivision,
          customerType: req.body.customerType || 'Individual',
          notes: `Converted from lead: ${lead.requirement}`
        }
      });
    }

    // Update lead
    const updatedLead = await prisma.lead.update({
      where: { id },
      data: {
        status: 'WON',
        convertedCustomerId: customer.id,
        updatedAt: new Date()
      }
    });

    await logAudit({
      actorUserId: req.user.id,
      action: 'LEAD_CONVERT_TO_CUSTOMER',
      entityType: 'Lead',
      entityId: id,
      afterJson: { leadId: id, customerId: customer.id },
      req
    });

    return res.json({
      success: true,
      message: `Lead converted to customer successfully!`,
      customer,
      lead: updatedLead
    });
  } catch (error) {
    console.error('Convert Lead Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to convert lead' });
  }
}

/**
 * Create Lead (Admin manual entry)
 */
async function createLead(req, res) {
  try {
    const { name, phone, email, businessDivision, requirement, preferredTime, source, notes, status, followUpDate } = req.body;
    if (!name || !phone || !requirement) {
      return res.status(400).json({ error: 'ValidationError', message: 'Name, phone, and requirement are required' });
    }

    const lead = await prisma.lead.create({
      data: {
        name,
        phone,
        email: email || null,
        businessDivision: businessDivision || 'construction',
        requirement,
        preferredTime: preferredTime || 'Anytime',
        source: source || 'Admin Entry',
        status: status || 'NEW',
        notes: notes || null,
        followUpDate: followUpDate ? new Date(followUpDate) : null
      }
    });

    await logAudit({
      actorUserId: req.user.id,
      action: 'LEAD_CREATE',
      entityType: 'Lead',
      entityId: lead.id,
      afterJson: lead,
      req
    });

    return res.status(201).json({ success: true, lead });
  } catch (error) {
    console.error('Create Lead Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to create lead' });
  }
}

/**
 * Delete Lead (Soft-delete)
 */
async function deleteLead(req, res) {
  try {
    const { id } = req.params;
    const existing = await prisma.lead.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'NotFound', message: 'Lead not found' });
    }

    await prisma.lead.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    await logAudit({
      actorUserId: req.user.id,
      action: 'LEAD_DELETE',
      entityType: 'Lead',
      entityId: id,
      beforeJson: existing,
      req
    });

    return res.json({ success: true, message: 'Lead deleted successfully' });
  } catch (error) {
    console.error('Delete Lead Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to delete lead' });
  }
}

module.exports = {
  getLeads,
  createLead,
  updateLead,
  deleteLead,
  convertLeadToCustomer
};
