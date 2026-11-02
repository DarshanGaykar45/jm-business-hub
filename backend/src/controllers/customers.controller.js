const prisma = require('../config/db');
const { logAudit } = require('../utils/audit');
const { z } = require('zod');

const customerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional().nullable(),
  businessDivision: z.enum(['construction', 'solar', 'suppliers', 'group']).default('construction'),
  customerType: z.enum(['Individual', 'Contractor', 'Commercial', 'Government']).default('Individual'),
  notes: z.string().optional().nullable()
});

/**
 * Get customers with search & division filter
 */
async function getCustomers(req, res) {
  try {
    const { division, type, search } = req.query;

    const where = { deletedAt: null };
    if (division && division !== 'all') {
      where.businessDivision = division;
    }
    if (type && type !== 'all') {
      where.customerType = type;
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } }
      ];
    }

    const customers = await prisma.customer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { projects: true, quotations: true, invoices: true, rentals: true }
        }
      }
    });

    return res.json({ success: true, count: customers.length, customers });
  } catch (error) {
    console.error('Get Customers Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to retrieve customers' });
  }
}

/**
 * Get single customer with complete timeline and relations
 */
async function getCustomerById(req, res) {
  try {
    const { id } = req.params;
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        projects: {
          orderBy: { createdAt: 'desc' }
        },
        quotations: {
          orderBy: { createdAt: 'desc' }
        },
        invoices: {
          orderBy: { createdAt: 'desc' },
          include: { items: true, payments: true }
        },
        rentals: {
          orderBy: { createdAt: 'desc' },
          include: { equipment: true }
        }
      }
    });

    if (!customer) {
      return res.status(404).json({ error: 'NotFound', message: 'Customer not found' });
    }

    return res.json({ success: true, customer });
  } catch (error) {
    console.error('Get Customer Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to get customer details' });
  }
}

/**
 * Create customer
 */
async function createCustomer(req, res) {
  try {
    const parse = customerSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'ValidationError', message: parse.error.errors[0]?.message });
    }

    const customer = await prisma.customer.create({
      data: {
        name: parse.data.name,
        phone: parse.data.phone,
        email: parse.data.email || null,
        address: parse.data.address || null,
        businessDivision: parse.data.businessDivision,
        customerType: parse.data.customerType,
        notes: parse.data.notes || null
      }
    });

    await logAudit({
      actorUserId: req.user.id,
      action: 'CUSTOMER_CREATE',
      entityType: 'Customer',
      entityId: customer.id,
      afterJson: customer,
      req
    });

    return res.status(201).json({ success: true, customer });
  } catch (error) {
    console.error('Create Customer Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to create customer' });
  }
}

/**
 * Update customer
 */
async function updateCustomer(req, res) {
  try {
    const { id } = req.params;
    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'NotFound', message: 'Customer not found' });
    }

    const updated = await prisma.customer.update({
      where: { id },
      data: {
        ...req.body,
        updatedAt: new Date()
      }
    });

    await logAudit({
      actorUserId: req.user.id,
      action: 'CUSTOMER_UPDATE',
      entityType: 'Customer',
      entityId: id,
      beforeJson: existing,
      afterJson: updated,
      req
    });

    return res.json({ success: true, customer: updated });
  } catch (error) {
    console.error('Update Customer Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to update customer' });
  }
}

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer
};
