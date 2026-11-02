const prisma = require('../config/db');
const { logAudit } = require('../utils/audit');
const { z } = require('zod');

const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().positive(),
  unit: z.string().min(1),
  unitPrice: z.number().min(0)
});

const invoiceSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  businessDivision: z.enum(['construction', 'solar', 'suppliers', 'group']).default('construction'),
  date: z.string().or(z.date()),
  dueDate: z.string().or(z.date()).optional().nullable(),
  taxRate: z.number().min(0).default(18),
  discount: z.number().min(0).default(0),
  notes: z.string().optional().nullable(),
  items: z.array(invoiceItemSchema).min(1, 'At least one line item is required')
});

async function getInvoices(req, res) {
  try {
    const { division, status, search } = req.query;
    const where = { deletedAt: null };
    if (division && division !== 'all') where.businessDivision = division;
    if (status && status !== 'all') where.paymentStatus = status;
    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search } },
        { customer: { name: { contains: search } } }
      ];
    }

    const invoices = await prisma.invoice.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: true,
        items: true,
        payments: { orderBy: { paymentDate: 'desc' } }
      }
    });

    const enriched = invoices.map(inv => ({
      ...inv,
      amountPending: Math.max(0, (inv.total || 0) - (inv.amountPaid || 0))
    }));

    return res.json({ success: true, count: enriched.length, invoices: enriched });
  } catch (error) {
    console.error('Get Invoices Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to retrieve invoices' });
  }
}

async function createInvoice(req, res) {
  try {
    const parse = invoiceSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: 'ValidationError', message: parse.error.errors[0]?.message });

    const data = parse.data;
    const prefixMap = {
      construction: 'CONST',
      solar: 'SOLAR',
      suppliers: 'SUPPL',
      group: 'JM'
    };
    const prefix = prefixMap[data.businessDivision] || 'JM';
    const invCount = await prisma.invoice.count({ where: { businessDivision: data.businessDivision } });
    const invoiceNumber = `${prefix}-INV-${1001 + invCount}`;

    let subtotal = 0;
    const calculatedItems = data.items.map(item => {
      const lineTotal = item.quantity * item.unitPrice;
      subtotal += lineTotal;
      return {
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        lineTotal
      };
    });

    const taxAmount = (subtotal * (data.taxRate || 0)) / 100;
    const total = Math.max(0, subtotal + taxAmount - (data.discount || 0));

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        customerId: data.customerId,
        businessDivision: data.businessDivision,
        date: new Date(data.date),
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        taxRate: data.taxRate,
        taxAmount,
        discount: data.discount,
        total,
        amountPaid: 0,
        paymentStatus: 'Pending',
        notes: data.notes || null,
        items: { create: calculatedItems }
      },
      include: { customer: true, items: true }
    });

    await logAudit({
      actorUserId: req.user.id,
      action: 'INVOICE_CREATE',
      entityType: 'Invoice',
      entityId: invoice.id,
      afterJson: invoice,
      req
    });

    return res.status(201).json({
      success: true,
      invoice: {
        ...invoice,
        amountPending: invoice.total
      }
    });
  } catch (error) {
    console.error('Create Invoice Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to create invoice' });
  }
}

async function recordPayment(req, res) {
  try {
    const { id } = req.params;
    const { amount, paymentMethod, referenceNo, notes } = req.body;
    const payAmount = parseFloat(amount);

    if (isNaN(payAmount) || payAmount <= 0) {
      return res.status(400).json({ error: 'ValidationError', message: 'Payment amount must be greater than 0' });
    }

    const invoice = await prisma.invoice.findUnique({ where: { id } });
    if (!invoice) return res.status(404).json({ error: 'NotFound', message: 'Invoice not found' });

    const newAmountPaid = (invoice.amountPaid || 0) + payAmount;
    const newStatus = newAmountPaid >= invoice.total ? 'Paid' : 'Partially Paid';

    const [payment, updatedInv] = await prisma.$transaction([
      prisma.payment.create({
        data: {
          invoiceId: id,
          amount: payAmount,
          paymentDate: new Date(),
          paymentMethod: paymentMethod || 'UPI',
          referenceNo: referenceNo || null,
          notes: notes || null
        }
      }),
      prisma.invoice.update({
        where: { id },
        data: {
          amountPaid: newAmountPaid,
          paymentStatus: newStatus,
          updatedAt: new Date()
        },
        include: { customer: true, items: true, payments: true }
      })
    ]);

    await logAudit({
      actorUserId: req.user.id,
      action: 'INVOICE_PAYMENT_RECORD',
      entityType: 'Invoice',
      entityId: id,
      beforeJson: { amountPaid: invoice.amountPaid, status: invoice.paymentStatus },
      afterJson: { amountPaid: newAmountPaid, status: newStatus, payment },
      req
    });

    return res.json({
      success: true,
      message: 'Payment recorded successfully',
      payment,
      invoice: {
        ...updatedInv,
        amountPending: Math.max(0, updatedInv.total - updatedInv.amountPaid)
      }
    });
  } catch (error) {
    console.error('Record Payment Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to record payment' });
  }
}

module.exports = {
  getInvoices,
  createInvoice,
  recordPayment
};
