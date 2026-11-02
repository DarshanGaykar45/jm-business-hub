const prisma = require('../config/db');
const companyConfig = require('../config/company.config');
const { z } = require('zod');

const leadSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'),
  email: z.string().email().optional().or(z.literal('')),
  division: z.enum(['construction', 'solar', 'suppliers', 'group']).default('construction'),
  requirement: z.string().min(3, 'Requirement details must be at least 3 characters'),
  preferredTime: z.string().optional(),
  source: z.string().default('Website Lead Form')
});

/**
 * Handle public lead submission
 */
async function submitLead(req, res) {
  try {
    const parseResult = leadSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'ValidationError',
        message: parseResult.error.errors[0]?.message || 'Invalid lead data',
        details: parseResult.error.errors
      });
    }

    const { name, phone, email, division, requirement, preferredTime, source } = parseResult.data;

    // Create lead in database
    const lead = await prisma.lead.create({
      data: {
        name,
        phone,
        email: email || null,
        businessDivision: division,
        requirement,
        preferredTime: preferredTime || null,
        source: source || 'Website Modal',
        status: 'NEW'
      }
    });

    // Auto-create notification for admin/manager
    await prisma.notification.create({
      data: {
        title: `New Lead: ${name} (${division.toUpperCase()})`,
        message: `${name} requested: "${requirement}". Phone: ${phone}`,
        type: 'LEAD_FOLLOWUP',
        businessDivision: division,
        linkUrl: `/dashboard/leads`
      }
    }).catch(err => console.error('Failed to create lead notification:', err));

    return res.status(201).json({
      success: true,
      message: 'Thank you for reaching out to Jay Malhar Udyog Samuha! Our team will contact you shortly.',
      lead: {
        id: lead.id,
        name: lead.name,
        division: lead.businessDivision,
        status: lead.status
      }
    });
  } catch (error) {
    console.error('Lead Submission Error:', error);
    return res.status(500).json({
      error: 'ServerError',
      message: 'Could not process lead request. Please call us directly.'
    });
  }
}

/**
 * Get public stats (fleet, solar installed, regions)
 */
async function getPublicStats(req, res) {
  try {
    const [equipmentCount, customerCount, projectCount] = await Promise.all([
      prisma.equipment.count({ where: { deletedAt: null } }),
      prisma.customer.count({ where: { deletedAt: null } }),
      prisma.project.count({ where: { deletedAt: null } })
    ]);

    return res.json({
      success: true,
      stats: {
        equipmentFleet: equipmentCount || 12,
        solarInstalledKW: 450,
        completedProjects: projectCount || 85,
        satisfiedClients: customerCount || 150,
        regionsServed: "Nashik, Sinnar, Sangamner & surrounding Maharashtra"
      }
    });
  } catch (error) {
    console.error('Public Stats Error:', error);
    return res.json({
      success: true,
      stats: {
        equipmentFleet: 12,
        solarInstalledKW: 450,
        completedProjects: 85,
        satisfiedClients: 150,
        regionsServed: "Nashik, Sinnar, Sangamner & surrounding Maharashtra"
      }
    });
  }
}

/**
 * Get company details
 */
function getCompanyInfo(req, res) {
  return res.json({
    success: true,
    company: companyConfig
  });
}

module.exports = {
  submitLead,
  getPublicStats,
  getCompanyInfo
};
