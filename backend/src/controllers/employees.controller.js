const prisma = require('../config/db');
const { logAudit } = require('../utils/audit');
const { z } = require('zod');

const employeeSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  address: z.string().optional().nullable(),
  role: z.string().min(2, 'Role/Designation is required'),
  department: z.string().min(2, 'Department is required'),
  businessDivision: z.enum(['construction', 'solar', 'suppliers', 'group']).default('construction'),
  joiningDate: z.string().or(z.date()).optional().nullable().default(() => new Date().toISOString()),
  salary: z.coerce.number().optional().nullable(),
  monthlySalary: z.coerce.number().optional().nullable(),
  dailyWage: z.coerce.number().optional().nullable(),
  status: z.enum(['Active', 'Deactivated', 'On Leave']).default('Active')
});

/**
 * Get all employees with filtering & RBAC salary masking
 */
async function getEmployees(req, res) {
  try {
    const { division, department, status, search } = req.query;
    const userRole = req.user.role.name || req.user.role;

    const where = {};
    if (division && division !== 'all') {
      where.businessDivision = division;
    }
    if (department && department !== 'all') {
      where.department = department;
    }
    if (status && status !== 'all') {
      where.status = status;
    } else {
      where.status = { not: 'Deactivated' }; // Default to active employees
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
        { employeeId: { contains: search } },
        { role: { contains: search } }
      ];
    }

    const employees = await prisma.employee.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { projectAssignments: true, tasks: true }
        }
      }
    });

    // RBAC: Manager and Employee roles cannot see salaries
    const canViewSalary = userRole === 'Owner' || userRole === 'Accountant';
    const sanitized = employees.map(emp => {
      if (!canViewSalary) {
        const { salary, dailyWage, ...rest } = emp;
        return rest;
      }
      return emp;
    });

    return res.json({ success: true, count: sanitized.length, employees: sanitized });
  } catch (error) {
    console.error('Get Employees Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to retrieve employees' });
  }
}

/**
 * Get single employee profile
 */
async function getEmployeeById(req, res) {
  try {
    const { id } = req.params;
    const userRole = req.user.role.name || req.user.role;

    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        projectAssignments: {
          include: { project: true }
        },
        tasks: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        },
        appointments: {
          take: 5,
          orderBy: { dateTime: 'desc' }
        }
      }
    });

    if (!employee) {
      return res.status(404).json({ error: 'NotFound', message: 'Employee not found' });
    }

    const canViewSalary = userRole === 'Owner' || userRole === 'Accountant';
    if (!canViewSalary) {
      delete employee.salary;
      delete employee.dailyWage;
    }

    return res.json({ success: true, employee });
  } catch (error) {
    console.error('Get Employee Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to get employee details' });
  }
}

/**
 * Create new employee
 */
async function createEmployee(req, res) {
  try {
    const parse = employeeSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'ValidationError', message: parse.error.errors[0]?.message });
    }

    const count = await prisma.employee.count();
    const employeeId = `JM-EMP-${String(count + 101).padStart(3, '0')}`;

    const newEmp = await prisma.employee.create({
      data: {
        employeeId,
        name: parse.data.name,
        phone: parse.data.phone,
        address: parse.data.address || null,
        role: parse.data.role,
        department: parse.data.department,
        businessDivision: parse.data.businessDivision,
        joiningDate: new Date(parse.data.joiningDate),
        salary: parse.data.salary ?? parse.data.monthlySalary ?? null,
        dailyWage: parse.data.dailyWage || null,
        status: parse.data.status
      }
    });

    await logAudit({
      actorUserId: req.user.id,
      action: 'EMPLOYEE_CREATE',
      entityType: 'Employee',
      entityId: newEmp.id,
      afterJson: newEmp,
      req
    });

    return res.status(201).json({ success: true, employee: newEmp });
  } catch (error) {
    console.error('Create Employee Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to create employee' });
  }
}

/**
 * Update employee
 */
async function updateEmployee(req, res) {
  try {
    const { id } = req.params;
    const existing = await prisma.employee.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'NotFound', message: 'Employee not found' });
    }

    const updated = await prisma.employee.update({
      where: { id },
      data: {
        ...req.body,
        joiningDate: req.body.joiningDate ? new Date(req.body.joiningDate) : undefined,
        updatedAt: new Date()
      }
    });

    await logAudit({
      actorUserId: req.user.id,
      action: 'EMPLOYEE_UPDATE',
      entityType: 'Employee',
      entityId: id,
      beforeJson: existing,
      afterJson: updated,
      req
    });

    return res.json({ success: true, employee: updated });
  } catch (error) {
    console.error('Update Employee Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to update employee' });
  }
}

/**
 * Soft-deactivate employee (never hard delete)
 */
async function deactivateEmployee(req, res) {
  try {
    const { id } = req.params;
    const existing = await prisma.employee.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'NotFound', message: 'Employee not found' });
    }

    const updated = await prisma.employee.update({
      where: { id },
      data: {
        status: 'Deactivated',
        deletedAt: new Date()
      }
    });

    await logAudit({
      actorUserId: req.user.id,
      action: 'EMPLOYEE_DEACTIVATE',
      entityType: 'Employee',
      entityId: id,
      beforeJson: existing,
      afterJson: updated,
      req
    });

    return res.json({ success: true, message: 'Employee successfully deactivated (soft-delete).' });
  } catch (error) {
    console.error('Deactivate Employee Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to deactivate employee' });
  }
}

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deactivateEmployee
};
