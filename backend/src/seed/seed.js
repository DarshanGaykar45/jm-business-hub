const bcrypt = require('bcryptjs');
const prisma = require('../config/db');
const { ROLE_PERMISSIONS } = require('../middleware/permissions');
const { logAudit } = require('../utils/audit');

const BCRYPT_SALT_ROUNDS = 12;
const DEMO_PASSWORD = 'DemoPass1234!';

async function seed() {
  console.log('🌱 Starting JM Business Hub Seed Process...');

  // 1. Roles & Permissions
  console.log('... Creating Roles & Permissions');
  const roleNames = ['Owner', 'Manager', 'Accountant', 'Employee'];
  const roleMap = {};

  for (const rName of roleNames) {
    const role = await prisma.role.upsert({
      where: { name: rName },
      update: {},
      create: {
        name: rName,
        description: `System role for ${rName}`,
        isSystem: true
      }
    });
    roleMap[rName] = role;
  }

  // Populate Permissions
  for (const [rName, perms] of Object.entries(ROLE_PERMISSIONS)) {
    const role = roleMap[rName];
    for (const [resource, actions] of Object.entries(perms)) {
      for (const action of actions) {
        const permission = await prisma.permission.upsert({
          where: {
            resource_action: { resource, action }
          },
          update: {},
          create: { resource, action }
        });

        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: role.id,
              permissionId: permission.id
            }
          },
          update: {},
          create: {
            roleId: role.id,
            permissionId: permission.id
          }
        });
      }
    }
  }

  // 2. Demo Users (One per role)
  console.log('... Creating Demo Users (bcrypt cost 12)');
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, BCRYPT_SALT_ROUNDS);

  const demoUsers = [
    {
      email: 'owner@jaymalhar.com',
      name: 'Abhishek Satav (Owner)',
      roleId: roleMap['Owner'].id,
      phone: '9822000001',
      businessDivision: null,
      isDemo: true
    },
    {
      email: 'manager@jaymalhar.com',
      name: 'Vikas Deshmukh (Manager)',
      roleId: roleMap['Manager'].id,
      phone: '9822000002',
      businessDivision: null,
      isDemo: true
    },
    {
      email: 'accountant@jaymalhar.com',
      name: 'Pooja Kulkarni (Accountant)',
      roleId: roleMap['Accountant'].id,
      phone: '9822000003',
      businessDivision: null,
      isDemo: true
    },
    {
      email: 'employee@jaymalhar.com',
      name: 'Ramesh Jadhav (Site Supervisor)',
      roleId: roleMap['Employee'].id,
      phone: '9822000004',
      businessDivision: 'construction',
      isDemo: true
    }
  ];

  const userMap = {};
  for (const u of demoUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        passwordHash,
        name: u.name,
        roleId: u.roleId,
        isDemo: true,
        isActive: true
      },
      create: {
        ...u,
        passwordHash
      }
    });
    userMap[u.email] = user;
    console.log(`    Created user: ${u.email} (${u.name})`);
  }

  // 3. Settings & Coefficients
  console.log('... Seeding System Settings & Solar Coefficients');
  const initialSettings = [
    {
      key: 'solar_calculator_coefficients',
      category: 'SolarCalculator',
      description: 'Coefficients used to calculate system size, generation, and payback period',
      valueJson: JSON.stringify({
        ratePerKwh: 8.5,
        kwhPerKwPerDay: 4.2,
        systemCostPerKw: 56000,
        subsidyRatePct: 40,
        co2SavedPerKwhKg: 0.82,
        annualMaintenancePct: 1.5
      })
    },
    {
      key: 'solar_subsidy_info',
      category: 'SubsidyRules',
      description: 'Official PM Surya Ghar and state solar subsidy schemes information',
      valueJson: JSON.stringify({
        lastUpdated: '2026-08-15',
        centralSchemeName: 'PM Surya Ghar: Muft Bijli Yojana',
        slabs: [
          { capacityRange: 'Up to 2 kW', subsidyAmount: '₹30,000 to ₹60,000 (₹30,000/kW)' },
          { capacityRange: '3 kW and above', subsidyAmount: '₹78,000 maximum' }
        ],
        stateSupport: 'MSEDCL net metering applicable for eligible Maharashtra domestic consumers.',
        officialPortalUrl: 'https://pmsuryaghar.gov.in',
        disclaimer: 'Subsidy figures are indicative and governed by official MNRE/MSEDCL guidelines. Figures are subject to change and site feasibility survey.'
      })
    },
    {
      key: 'billing_prefixes',
      category: 'Invoicing',
      description: 'Sequential prefixes for quotations and invoices per division',
      valueJson: JSON.stringify({
        construction: { quotation: 'JM-CE-Q-', invoice: 'JM-CE-INV-' },
        solar: { quotation: 'SR-Q-', invoice: 'SR-INV-' },
        suppliers: { quotation: 'JM-ST-Q-', invoice: 'JM-ST-INV-' }
      })
    }
  ];

  for (const s of initialSettings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { valueJson: s.valueJson },
      create: s
    });
  }

  // 4. Demo Employees
  console.log('... Seeding Demo Employees');
  const demoEmployees = [
    {
      employeeId: 'JM-EMP-001',
      name: 'Rajesh Patil',
      phone: '9822110001',
      role: 'Site Supervisor',
      department: 'Operations',
      businessDivision: 'construction',
      joiningDate: new Date('2024-01-15'),
      salary: 32000,
      status: 'Active',
      isDemo: true
    },
    {
      employeeId: 'JM-EMP-002',
      name: 'Sunil Shinde',
      phone: '9822110002',
      role: 'Solar Installation Engineer',
      department: 'Solar Tech',
      businessDivision: 'solar',
      joiningDate: new Date('2024-03-01'),
      salary: 38000,
      status: 'Active',
      isDemo: true
    },
    {
      employeeId: 'JM-EMP-003',
      name: 'Ganesh More',
      phone: '9822110003',
      role: 'Logistics & Quarry In-Charge',
      department: 'Logistics',
      businessDivision: 'suppliers',
      joiningDate: new Date('2023-11-10'),
      salary: 30000,
      status: 'Active',
      isDemo: true
    }
  ];

  for (const emp of demoEmployees) {
    await prisma.employee.upsert({
      where: { employeeId: emp.employeeId },
      update: emp,
      create: emp
    });
  }

  // 5. Demo Customers
  console.log('... Seeding Demo Customers');
  const demoCustomers = [
    {
      name: 'Sahyadri Infrastructure Ltd',
      phone: '9822330001',
      email: 'projects@sahyadriinfra.demo',
      address: 'Pune-Bangalore Highway, Maharashtra',
      businessDivision: 'construction',
      customerType: 'Contractor',
      isDemo: true
    },
    {
      name: 'Vidya Vikas Educational Trust',
      phone: '9822330002',
      email: 'trustee@vidyavikas.demo',
      address: 'Satara Road Campus, Maharashtra',
      businessDivision: 'solar',
      customerType: 'Commercial',
      isDemo: true
    },
    {
      name: 'Omkar Builders & Developers',
      phone: '9822330003',
      email: 'purchase@omkarbuilders.demo',
      address: 'Baramati MIDC Phase 2, Maharashtra',
      businessDivision: 'suppliers',
      customerType: 'Contractor',
      isDemo: true
    }
  ];

  const customerMap = {};
  for (const c of demoCustomers) {
    const existing = await prisma.customer.findFirst({
      where: { phone: c.phone }
    });
    if (!existing) {
      const created = await prisma.customer.create({ data: c });
      customerMap[c.name] = created;
    } else {
      customerMap[c.name] = existing;
    }
  }

  // 6. Demo Equipment (Construction Division)
  console.log('... Seeding Demo Equipment');
  const demoEquipments = [
    {
      equipmentId: 'JM-EQ-001',
      name: 'Heavy Soil Compactor 10-Ton',
      category: 'Compactor',
      businessDivision: 'construction',
      status: 'Available',
      rentalRatePerDay: 4500,
      condition: 'Excellent',
      isDemo: true
    },
    {
      equipmentId: 'JM-EQ-002',
      name: 'Vibratory Tandem Roller 3-Ton',
      category: 'Roller',
      businessDivision: 'construction',
      status: 'Available',
      rentalRatePerDay: 3200,
      condition: 'Good',
      isDemo: true
    },
    {
      equipmentId: 'JM-EQ-003',
      name: 'Mini Hydraulic Excavator',
      category: 'Excavator',
      businessDivision: 'construction',
      status: 'Available',
      rentalRatePerDay: 5500,
      condition: 'Excellent',
      isDemo: true
    }
  ];

  for (const eq of demoEquipments) {
    await prisma.equipment.upsert({
      where: { equipmentId: eq.equipmentId },
      update: eq,
      create: eq
    });
  }

  // 7. Demo Inventory Items (Suppliers & Solar)
  console.log('... Seeding Demo Inventory Items');
  const demoItems = [
    {
      name: 'Crushed Stone Aggregate 20mm',
      category: 'Aggregates',
      businessDivision: 'suppliers',
      quantity: 120, // Brass
      unit: 'Brass',
      purchasePrice: 2200,
      sellingPrice: 2800,
      minStockLevel: 20,
      isDemo: true
    },
    {
      name: 'River Washed Sand Grade-A',
      category: 'Sand',
      businessDivision: 'suppliers',
      quantity: 85, // Brass
      unit: 'Brass',
      purchasePrice: 3800,
      sellingPrice: 4600,
      minStockLevel: 15,
      isDemo: true
    },
    {
      name: 'Mono PERC Solar Panel 540W Tier-1',
      category: 'Solar Panels',
      businessDivision: 'solar',
      quantity: 48, // Units
      unit: 'Units',
      purchasePrice: 9800,
      sellingPrice: 12400,
      minStockLevel: 10,
      isDemo: true
    },
    {
      name: 'Solar Grid Inverter 5kW Single Phase',
      category: 'Inverters',
      businessDivision: 'solar',
      quantity: 8, // Units
      unit: 'Units',
      purchasePrice: 34000,
      sellingPrice: 42000,
      minStockLevel: 2,
      isDemo: true
    }
  ];

  for (const item of demoItems) {
    const existing = await prisma.inventoryItem.findFirst({
      where: { name: item.name, businessDivision: item.businessDivision }
    });
    if (!existing) {
      const createdItem = await prisma.inventoryItem.create({ data: item });
      // Create initial stock-in transaction
      await prisma.inventoryTransaction.create({
        data: {
          inventoryItemId: createdItem.id,
          type: 'STOCK_IN',
          quantity: item.quantity,
          balanceBefore: 0,
          balanceAfter: item.quantity,
          reason: 'Initial demo stock inventory intake',
          referenceType: 'SUPPLY_INTAKE',
          performedBy: 'System Seeder',
          isDemo: true
        }
      });
    }
  }

  // Record Audit Log for Seeding
  await logAudit({
    action: 'DEMO_DATA_SEED',
    entityType: 'System',
    entityId: 'seed_script',
    afterJson: { seededAt: new Date().toISOString() }
  });

  console.log('✅ JM Business Hub Seed Complete!');
}

seed()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
