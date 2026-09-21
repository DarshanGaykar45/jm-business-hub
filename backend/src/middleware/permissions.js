/**
 * Central Permission Matrix and RBAC Middleware
 * 
 * Enforces role boundaries server-side:
 * - Owner: Full access to everything
 * - Manager: Operations, employees, projects, inventory, CRM, tasks. NO user management, NO salaries, NO full financials.
 * - Accountant: Income, expenses, quotations, invoices, payments, financial reports. NO employee editing, NO user management.
 * - Employee / Site Supervisor: Own assigned tasks and projects, limited view. NO financials, NO pricing.
 */

const ROLE_PERMISSIONS = {
  Owner: {
    users: ['create', 'read', 'update', 'delete', 'manage'],
    financials: ['create', 'read', 'update', 'delete', 'manage'],
    employees: ['create', 'read', 'update', 'delete', 'view_salary'],
    projects: ['create', 'read', 'update', 'delete'],
    customers: ['create', 'read', 'update', 'delete'],
    leads: ['create', 'read', 'update', 'delete'],
    inventory: ['create', 'read', 'update', 'delete', 'view_pricing'],
    equipment: ['create', 'read', 'update', 'delete'],
    rentals: ['create', 'read', 'update', 'delete'],
    quotations: ['create', 'read', 'update', 'delete'],
    invoices: ['create', 'read', 'update', 'delete'],
    documents: ['create', 'read', 'update', 'delete'],
    reports: ['read', 'export'],
    settings: ['read', 'update'],
    audit_logs: ['read']
  },
  Manager: {
    users: [],
    financials: [],
    employees: ['create', 'read', 'update'], // Note: view_salary is strictly excluded
    projects: ['create', 'read', 'update'],
    customers: ['create', 'read', 'update', 'delete'],
    leads: ['create', 'read', 'update', 'delete'],
    inventory: ['create', 'read', 'update', 'view_pricing'],
    equipment: ['create', 'read', 'update'],
    rentals: ['create', 'read', 'update'],
    quotations: ['read'],
    invoices: ['read'],
    documents: ['create', 'read'],
    reports: ['read_operations'], // operational reports only
    settings: ['read'],
    audit_logs: []
  },
  Accountant: {
    users: [],
    financials: ['create', 'read', 'update', 'delete'],
    employees: ['read', 'view_salary'], // read for payroll
    projects: ['read'],
    customers: ['read'],
    leads: ['read'],
    inventory: ['read', 'view_pricing'],
    equipment: ['read'],
    rentals: ['read'],
    quotations: ['create', 'read', 'update'],
    invoices: ['create', 'read', 'update'],
    documents: ['create', 'read'],
    reports: ['read', 'export'], // full financial reports
    settings: ['read'],
    audit_logs: []
  },
  Employee: {
    users: [],
    financials: [],
    employees: [],
    projects: ['read_assigned'],
    customers: ['read_limited'],
    leads: [],
    inventory: ['read_stock'], // stock level without pricing
    equipment: ['read'],
    rentals: [],
    quotations: [],
    invoices: [],
    documents: ['read_assigned'],
    reports: [],
    settings: [],
    audit_logs: []
  }
};

/**
 * Middleware factory to enforce resource and action permissions
 * @param {string} resource - e.g. 'financials', 'users', 'inventory'
 * @param {string} action - e.g. 'create', 'read', 'update', 'delete', 'view_salary'
 */
function authorize(resource, action) {
  return (req, res, next) => {
    const user = req.user;
    if (!user || !user.role) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required to access this resource.'
      });
    }

    const roleName = user.role.name || user.role;
    const permissionsForRole = ROLE_PERMISSIONS[roleName];

    if (!permissionsForRole) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Role '${roleName}' has no defined system permissions.`
      });
    }

    const allowedActions = permissionsForRole[resource] || [];

    // 'manage' grants all actions on that resource
    if (allowedActions.includes('manage') || allowedActions.includes(action)) {
      return next();
    }

    return res.status(403).json({
      error: 'Forbidden',
      message: `Permission denied. Role '${roleName}' is not authorized to '${action}' on '${resource}'.`
    });
  };
}

module.exports = {
  ROLE_PERMISSIONS,
  authorize
};
