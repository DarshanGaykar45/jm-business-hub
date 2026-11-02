const prisma = require('../config/db');
const { logAudit } = require('../utils/audit');
const { z } = require('zod');

const projectSchema = z.object({
  name: z.string().min(2, 'Project name is required'),
  businessDivision: z.enum(['construction', 'solar', 'suppliers', 'group']).default('construction'),
  customerId: z.string().min(1, 'Customer is required'),
  location: z.string().min(2, 'Location is required'),
  startDate: z.string().or(z.date()),
  deadline: z.string().or(z.date()).optional().nullable(),
  budget: z.number().min(0).default(0),
  amountReceived: z.number().min(0).default(0),
  progress: z.number().min(0).max(100).default(0),
  status: z.enum(['Planned', 'Ongoing', 'On Hold', 'Completed', 'Cancelled']).default('Planned'),
  materialsUsed: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  assignedEmployeeIds: z.array(z.string()).optional()
});

/**
 * Get all projects with server-side amountPending computation
 */
async function getProjects(req, res) {
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
        { name: { contains: search } },
        { location: { contains: search } },
        { customer: { name: { contains: search } } }
      ];
    }

    const projects = await prisma.project.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: { id: true, name: true, phone: true }
        },
        assignedEmployees: {
          include: {
            employee: {
              select: { id: true, name: true, role: true }
            }
          }
        },
        tasks: {
          select: { id: true, title: true, status: true, priority: true }
        }
      }
    });

    const enriched = projects.map(p => ({
      ...p,
      amountPending: Math.max(0, (p.budget || 0) - (p.amountReceived || 0))
    }));

    return res.json({ success: true, count: enriched.length, projects: enriched });
  } catch (error) {
    console.error('Get Projects Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to retrieve projects' });
  }
}

/**
 * Get single project
 */
async function getProjectById(req, res) {
  try {
    const { id } = req.params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        customer: true,
        assignedEmployees: {
          include: { employee: true }
        },
        tasks: true
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'NotFound', message: 'Project not found' });
    }

    const enriched = {
      ...project,
      amountPending: Math.max(0, (project.budget || 0) - (project.amountReceived || 0))
    };

    return res.json({ success: true, project: enriched });
  } catch (error) {
    console.error('Get Project Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to get project details' });
  }
}

/**
 * Create project
 */
async function createProject(req, res) {
  try {
    const parse = projectSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'ValidationError', message: parse.error.errors[0]?.message });
    }

    const data = parse.data;
    const project = await prisma.project.create({
      data: {
        name: data.name,
        businessDivision: data.businessDivision,
        customerId: data.customerId,
        location: data.location,
        startDate: new Date(data.startDate),
        deadline: data.deadline ? new Date(data.deadline) : null,
        budget: data.budget,
        amountReceived: data.amountReceived,
        progress: data.progress,
        status: data.status,
        materialsUsed: data.materialsUsed || null,
        notes: data.notes || null,
        assignedEmployees: data.assignedEmployeeIds && data.assignedEmployeeIds.length > 0 ? {
          create: data.assignedEmployeeIds.map(empId => ({
            employeeId: empId
          }))
        } : undefined
      },
      include: {
        customer: true,
        assignedEmployees: { include: { employee: true } }
      }
    });

    await logAudit({
      actorUserId: req.user.id,
      action: 'PROJECT_CREATE',
      entityType: 'Project',
      entityId: project.id,
      afterJson: project,
      req
    });

    return res.status(201).json({
      success: true,
      project: {
        ...project,
        amountPending: Math.max(0, project.budget - project.amountReceived)
      }
    });
  } catch (error) {
    console.error('Create Project Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to create project' });
  }
}

/**
 * Update project
 */
async function updateProject(req, res) {
  try {
    const { id } = req.params;
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'NotFound', message: 'Project not found' });
    }

    const { assignedEmployeeIds, ...rest } = req.body;

    const updated = await prisma.project.update({
      where: { id },
      data: {
        ...rest,
        startDate: rest.startDate ? new Date(rest.startDate) : undefined,
        deadline: rest.deadline ? new Date(rest.deadline) : undefined,
        updatedAt: new Date()
      },
      include: {
        customer: true,
        assignedEmployees: { include: { employee: true } }
      }
    });

    // Update assigned employees if provided
    if (Array.isArray(assignedEmployeeIds)) {
      await prisma.projectEmployee.deleteMany({ where: { projectId: id } });
      if (assignedEmployeeIds.length > 0) {
        await prisma.projectEmployee.createMany({
          data: assignedEmployeeIds.map(empId => ({
            projectId: id,
            employeeId: empId
          }))
        });
      }
    }

    await logAudit({
      actorUserId: req.user.id,
      action: 'PROJECT_UPDATE',
      entityType: 'Project',
      entityId: id,
      beforeJson: existing,
      afterJson: updated,
      req
    });

    return res.json({
      success: true,
      project: {
        ...updated,
        amountPending: Math.max(0, updated.budget - updated.amountReceived)
      }
    });
  } catch (error) {
    console.error('Update Project Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to update project' });
  }
}

/**
 * Soft-delete project
 */
async function deleteProject(req, res) {
  try {
    const { id } = req.params;
    await prisma.project.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    await logAudit({
      actorUserId: req.user.id,
      action: 'PROJECT_DELETE',
      entityType: 'Project',
      entityId: id,
      req
    });

    return res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete Project Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to delete project' });
  }
}

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
};
