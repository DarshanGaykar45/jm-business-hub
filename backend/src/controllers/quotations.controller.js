const prisma = require('../config/db');
const { logAudit } = require('../utils/audit');
const { z } = require('zod');

const quotationItemSchema = z.object({
  description: z.string().min(1, 'Item name is required'),
  quantity: z.number().positive(),
  unit: z.string().min(1),
  unitPrice: z.number().min(0)
});

const quotationSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  businessDivision: z.enum(['construction', 'solar', 'suppliers', 'group']).default('construction'),
  date: z.string().or(z.date()),
  validUntil: z.string().or(z.date()),
  taxRate: z.number().min(0).default(18),
  discount: z.number().min(0).default(0),
  terms: z.string().optional().nullable(),
  items: z.array(quotationItemSchema).min(1, 'At least one line item is required')
});

/**
 * Get all quotations
 */
async function getQuotations(req, res) {
  try {
    const { division, search } = req.query;
    const where = { deletedAt: null };
    if (division && division !== 'all') where.businessDivision = division;
    if (search) {
      where.OR = [
        { quotationNumber: { contains: search } },
        { customer: { name: { contains: search } } }
      ];
    }

    const quotations = await prisma.quotation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: true,
        items: true
      }
    });

    return res.json({ success: true, count: quotations.length, quotations });
  } catch (error) {
    console.error('Get Quotations Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to retrieve quotations' });
  }
}

/**
 * Create quotation with auto-sequence number starting at 1001
 */
async function createQuotation(req, res) {
  try {
    const parse = quotationSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: 'ValidationError', message: parse.error.errors[0]?.message });

    const data = parse.data;
    const prefixMap = {
      construction: 'CONST',
      solar: 'SOLAR',
      suppliers: 'SUPPL',
      group: 'JM'
    };
    const prefix = prefixMap[data.businessDivision] || 'JM';

    // Sequence starting at 1001
    const count = await prisma.quotation.count({ where: { businessDivision: data.businessDivision } });
    const quotationNumber = `${prefix}-Q-${1001 + count}`;

    // Compute line totals and grand totals server-side
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
    const grandTotal = Math.max(0, subtotal + taxAmount - (data.discount || 0));

    const quotation = await prisma.quotation.create({
      data: {
        quotationNumber,
        customerId: data.customerId,
        businessDivision: data.businessDivision,
        date: new Date(data.date),
        validUntil: new Date(data.validUntil),
        taxRate: data.taxRate,
        taxAmount,
        discount: data.discount,
        grandTotal,
        terms: data.terms || null,
        status: 'Sent',
        items: {
          create: calculatedItems
        }
      },
      include: { customer: true, items: true }
    });

    await logAudit({
      actorUserId: req.user.id,
      action: 'QUOTATION_CREATE',
      entityType: 'Quotation',
      entityId: quotation.id,
      afterJson: quotation,
      req
    });

    return res.status(201).json({ success: true, quotation });
  } catch (error) {
    console.error('Create Quotation Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to create quotation' });
  }
}

/**
 * Convert quotation to invoice in ONE click
 */
async function convertToInvoice(req, res) {
  try {
    const { id } = req.params;
    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: { items: true, customer: true }
    });

    if (!quotation) return res.status(404).json({ error: 'NotFound', message: 'Quotation not found' });

    const prefixMap = {
      construction: 'CONST',
      solar: 'SOLAR',
      suppliers: 'SUPPL',
      group: 'JM'
    };
    const prefix = prefixMap[quotation.businessDivision] || 'JM';
    const invCount = await prisma.invoice.count({ where: { businessDivision: quotation.businessDivision } });
    const invoiceNumber = `${prefix}-INV-${1001 + invCount}`;

    // Create Invoice with identical line items and calculate pending
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        customerId: quotation.customerId,
        businessDivision: quotation.businessDivision,
        date: new Date(),
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days default
        taxRate: quotation.taxRate,
        taxAmount: quotation.taxAmount,
        discount: quotation.discount,
        total: quotation.grandTotal,
        amountPaid: 0,
        paymentStatus: 'Pending',
        convertedFromQuotationId: quotation.id,
        notes: `Generated from Quotation ${quotation.quotationNumber}`,
        items: {
          create: quotation.items.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unitPrice,
            lineTotal: item.lineTotal
          }))
        }
      },
      include: { customer: true, items: true }
    });

    // Mark quotation converted
    await prisma.quotation.update({
      where: { id },
      data: { status: 'Converted', updatedAt: new Date() }
    });

    await logAudit({
      actorUserId: req.user.id,
      action: 'QUOTATION_CONVERT_TO_INVOICE',
      entityType: 'Quotation',
      entityId: id,
      afterJson: { quotationId: id, invoiceId: invoice.id },
      req
    });

    return res.status(201).json({
      success: true,
      message: `Quotation converted to Invoice ${invoiceNumber} successfully!`,
      invoice
    });
  } catch (error) {
    console.error('Convert Quotation Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to convert quotation' });
  }
}

module.exports = {
  getQuotations,
  createQuotation,
  convertToInvoice
};
