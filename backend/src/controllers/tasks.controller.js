const prisma = require('../config/db');
const { logAudit } = require('../utils/audit');
const { z } = require('zod');

const taskSchema = z.object({
  title: z.string().min(2, 'Task title is required'),
  description: z.string().optional().nullable(),
  businessDivision: z.enum(['construction', 'solar', 'suppliers', 'group']).default('construction'),
  assignedToUserId: z.string().optional().nullable(),
  employeeId: z.string().optional().nullable(),
  projectId: z.string().optional().nullable(),
  dueDate: z.string().or(z.date()).optional().nullable(),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']).default('Medium'),
  status: z.enum(['Pending', 'In Progress', 'Completed']).default('Pending')
});

async function getTasks(req, res) {
  try {
    const { division, status, employeeId, projectId } = req.query;
    const user = req.user;
    const userRole = user.role.name || user.role;

    const where = {};
    if (division && division !== 'all') where.businessDivision = division;
    if (status && status !== 'all') where.status = status;
    if (employeeId) where.employeeId = employeeId;
    if (projectId) where.projectId = projectId;

    // If logged in as standard Employee, restrict to tasks assigned to them
    if (userRole === 'Employee') {
      where.OR = [
        { assignedToUserId: user.id },
        { employee: { userId: user.id } }
      ];
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        employee: { select: { id: true, name: true, role: true } },
        project: { select: { id: true, name: true } }
      }
    });

    return res.json({ success: true, count: tasks.length, tasks });
  } catch (error) {
    console.error('Get Tasks Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to retrieve tasks' });
  }
}

async function createTask(req, res) {
  try {
    const parse = taskSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: 'ValidationError', message: parse.error.errors[0]?.message });

    const data = parse.data;
    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description || null,
        businessDivision: data.businessDivision,
        assignedToUserId: data.assignedToUserId || req.user.id,
        employeeId: data.employeeId || null,
        projectId: data.projectId || null,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        priority: data.priority,
        status: data.status
      },
      include: {
        employee: true,
        project: true
      }
    });

    await logAudit({
      actorUserId: req.user.id,
      action: 'TASK_CREATE',
      entityType: 'Task',
      entityId: task.id,
      afterJson: task,
      req
    });

    return res.status(201).json({ success: true, task });
  } catch (error) {
    console.error('Create Task Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to create task' });
  }
}

async function updateTaskStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const task = await prisma.task.update({
      where: { id },
      data: { status, updatedAt: new Date() },
      include: { employee: true, project: true }
    });

    return res.json({ success: true, task });
  } catch (error) {
    console.error('Update Task Status Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to update task status' });
  }
}

async function updateTask(req, res) {
  try {
    const { id } = req.params;
    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'NotFound', message: 'Task not found' });

    const updated = await prisma.task.update({
      where: { id },
      data: {
        ...req.body,
        employeeId: req.body.employeeId ? req.body.employeeId : null,
        projectId: req.body.projectId ? req.body.projectId : null,
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined,
        updatedAt: new Date()
      },
      include: { employee: true, project: true }
    });

    await logAudit({
      actorUserId: req.user.id,
      action: 'TASK_UPDATE',
      entityType: 'Task',
      entityId: id,
      beforeJson: existing,
      afterJson: updated,
      req
    });

    return res.json({ success: true, task: updated });
  } catch (error) {
    console.error('Update Task Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to update task' });
  }
}

async function deleteTask(req, res) {
  try {
    const { id } = req.params;
    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'NotFound', message: 'Task not found' });

    await prisma.task.delete({ where: { id } });

    await logAudit({
      actorUserId: req.user.id,
      action: 'TASK_DELETE',
      entityType: 'Task',
      entityId: id,
      beforeJson: existing,
      req
    });

    return res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete Task Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to delete task' });
  }
}

module.exports = {
  getTasks,
  createTask,
  updateTaskStatus,
  updateTask,
  deleteTask
};
