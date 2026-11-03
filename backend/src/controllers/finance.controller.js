const prisma = require('../config/db');
const { logAudit } = require('../utils/audit');
const { z } = require('zod');

const incomeSchema = z.object({
  date: z.string().or(z.date()),
  businessDivision: z.enum(['construction', 'solar', 'suppliers', 'group']).default('construction'),
  source: z.string().min(2, 'Source is required'),
  customerName: z.string().optional().nullable(),
  amount: z.number().positive('Amount must be positive'),
  paymentMethod: z.enum(['NEFT/RTGS', 'UPI', 'Cheque', 'Cash']).default('UPI'),
  referenceNumber: z.string().optional().nullable(),
  description: z.string().optional().nullable()
});

const expenseSchema = z.object({
  date: z.string().or(z.date()),
  businessDivision: z.enum(['construction', 'solar', 'suppliers', 'group']).default('construction'),
  category: z.string().min(2, 'Category is required'),
  amount: z.number().positive('Amount must be positive'),
  paymentMethod: z.enum(['NEFT/RTGS', 'UPI', 'Cheque', 'Cash']).default('UPI'),
  paidTo: z.string().optional().nullable(),
  referenceNumber: z.string().optional().nullable(),
  description: z.string().optional().nullable()
});

/**
 * Get Financial Summary (Today's income, expenses, profit, division breakdown)
 */
async function getFinancialSummary(req, res) {
  try {
    const { division } = req.query;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const baseWhere = { deletedAt: null };
    if (division && division !== 'all') {
      baseWhere.businessDivision = division;
    }

    const [todayIncomes, todayExpenses, allIncomes, allExpenses] = await Promise.all([
      prisma.income.findMany({
        where: {
          ...baseWhere,
          date: { gte: startOfToday, lte: endOfToday }
        }
      }),
      prisma.expense.findMany({
        where: {
          ...baseWhere,
          date: { gte: startOfToday, lte: endOfToday }
        }
      }),
      prisma.income.findMany({ where: baseWhere }),
      prisma.expense.findMany({ where: baseWhere })
    ]);

    const todayIncomeTotal = todayIncomes.reduce((sum, item) => sum + (item.amount || 0), 0);
    const todayExpenseTotal = todayExpenses.reduce((sum, item) => sum + (item.amount || 0), 0);
    const todayProfit = todayIncomeTotal - todayExpenseTotal;

    const totalIncome = allIncomes.reduce((sum, item) => sum + (item.amount || 0), 0);
    const totalExpenses = allExpenses.reduce((sum, item) => sum + (item.amount || 0), 0);
    const netProfit = totalIncome - totalExpenses;

    return res.json({
      success: true,
      summary: {
        todayIncome: todayIncomeTotal,
        todayExpenses: todayExpenseTotal,
        todayProfit,
        totalIncome,
        totalExpenses,
        netProfit
      }
    });
  } catch (error) {
    console.error('Financial Summary Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to calculate financial summary' });
  }
}

/**
 * Get income records
 */
async function getIncomes(req, res) {
  try {
    const { division, search } = req.query;
    const where = { deletedAt: null };
    if (division && division !== 'all') where.businessDivision = division;
    if (search) {
      where.OR = [
        { source: { contains: search } },
        { customerName: { contains: search } },
        { referenceNumber: { contains: search } }
      ];
    }

    const incomes = await prisma.income.findMany({
      where,
      orderBy: { date: 'desc' }
    });

    return res.json({ success: true, count: incomes.length, incomes });
  } catch (error) {
    console.error('Get Incomes Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to retrieve income records' });
  }
}

/**
 * Create income record
 */
async function createIncome(req, res) {
  try {
    const parse = incomeSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: 'ValidationError', message: parse.error.errors[0]?.message });

    const income = await prisma.income.create({
      data: {
        ...parse.data,
        date: new Date(parse.data.date)
      }
    });

    await logAudit({
      actorUserId: req.user.id,
      action: 'INCOME_CREATE',
      entityType: 'Income',
      entityId: income.id,
      afterJson: income,
      req
    });

    return res.status(201).json({ success: true, income });
  } catch (error) {
    console.error('Create Income Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to create income record' });
  }
}

/**
 * Soft-delete income with mandatory audit reason
 */
async function deleteIncome(req, res) {
  try {
    const { id } = req.params;
    const reason = req.body?.reason || 'Record cancelled by administrator';

    const existing = await prisma.income.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'NotFound', message: 'Income record not found' });

    const updated = await prisma.income.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date()
      }
    });

    await logAudit({
      actorUserId: req.user.id,
      action: 'INCOME_DELETE_SOFT',
      entityType: 'Income',
      entityId: id,
      beforeJson: existing,
      afterJson: { deleted: true, reason },
      req
    });

    return res.json({ success: true, message: 'Income record soft-deleted with audit trail.' });
  } catch (error) {
    console.error('Delete Income Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to delete income' });
  }
}

/**
 * Get expense records
 */
async function getExpenses(req, res) {
  try {
    const { division, category, search } = req.query;
    const where = { deletedAt: null };
    if (division && division !== 'all') where.businessDivision = division;
    if (category && category !== 'all') where.category = category;
    if (search) {
      where.OR = [
        { category: { contains: search } },
        { paidTo: { contains: search } },
        { description: { contains: search } }
      ];
    }

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { date: 'desc' }
    });

    return res.json({ success: true, count: expenses.length, expenses });
  } catch (error) {
    console.error('Get Expenses Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to retrieve expenses' });
  }
}

/**
 * Create expense record
 */
async function createExpense(req, res) {
  try {
    const parse = expenseSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: 'ValidationError', message: parse.error.errors[0]?.message });

    const expense = await prisma.expense.create({
      data: {
        ...parse.data,
        date: new Date(parse.data.date)
      }
    });

    await logAudit({
      actorUserId: req.user.id,
      action: 'EXPENSE_CREATE',
      entityType: 'Expense',
      entityId: expense.id,
      afterJson: expense,
      req
    });

    return res.status(201).json({ success: true, expense });
  } catch (error) {
    console.error('Create Expense Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to create expense record' });
  }
}

/**
 * Soft-delete expense with mandatory audit reason
 */
async function deleteExpense(req, res) {
  try {
    const { id } = req.params;
    const reason = req.body?.reason || 'Record cancelled by administrator';

    const existing = await prisma.expense.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'NotFound', message: 'Expense record not found' });

    const updated = await prisma.expense.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date()
      }
    });

    await logAudit({
      actorUserId: req.user.id,
      action: 'EXPENSE_DELETE_SOFT',
      entityType: 'Expense',
      entityId: id,
      beforeJson: existing,
      afterJson: { deleted: true, reason },
      req
    });

    return res.json({ success: true, message: 'Expense record soft-deleted with audit trail.' });
  } catch (error) {
    console.error('Delete Expense Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to delete expense' });
  }
}

module.exports = {
  getFinancialSummary,
  getIncomes,
  createIncome,
  deleteIncome,
  getExpenses,
  createExpense,
  deleteExpense
};
