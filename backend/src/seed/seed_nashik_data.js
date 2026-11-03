const prisma = require('../config/db');

async function seedNashikData() {
  console.log('🌟 Seeding authentic Nashik Region data for all JM Business Hub modules...');

  // 1. EMPLOYEES (Nashik personnel)
  console.log('... Seeding Nashik Employees');
  const employeesData = [
    {
      employeeId: 'JM-EMP-101',
      name: 'Sachin Bhausaheb Patil',
      phone: '9822451020',
      address: 'Shriram Chowk, Pathre Budruk, Tal. Sinnar, Dist. Nashik',
      role: 'Site Supervisor',
      department: 'Operations',
      businessDivision: 'construction',
      joiningDate: new Date('2023-03-15'),
      salary: 28000,
      dailyWage: 950,
      status: 'Active',
      isDemo: true
    },
    {
      employeeId: 'JM-EMP-102',
      name: 'Ganesh Digambar Shinde',
      phone: '9423187654',
      address: 'Panchavati, Near Ramkund, Nashik',
      role: 'Solar Technician & Installer',
      department: 'Solar Tech',
      businessDivision: 'solar',
      joiningDate: new Date('2023-06-01'),
      salary: 24000,
      dailyWage: 850,
      status: 'Active',
      isDemo: true
    },
    {
      employeeId: 'JM-EMP-103',
      name: 'Balasaheb Dnyaneshwar Jadhav',
      phone: '9096547260',
      address: 'Ambad MIDC, Near XLO Point, Nashik',
      role: 'Heavy Machinery Operator',
      department: 'Operations',
      businessDivision: 'construction',
      joiningDate: new Date('2022-11-10'),
      salary: 26000,
      dailyWage: 900,
      status: 'Active',
      isDemo: true
    },
    {
      employeeId: 'JM-EMP-104',
      name: 'Nitin Raghunath Deshmukh',
      phone: '9158494138',
      address: 'Satpur Colony, Trimbak Road, Nashik',
      role: 'Logistics Fleet Driver',
      department: 'Logistics',
      businessDivision: 'suppliers',
      joiningDate: new Date('2024-01-05'),
      salary: 22000,
      dailyWage: 750,
      status: 'Active',
      isDemo: true
    }
  ];

  const employees = [];
  for (const emp of employeesData) {
    const existing = await prisma.employee.findUnique({ where: { employeeId: emp.employeeId } });
    if (existing) {
      const updated = await prisma.employee.update({ where: { employeeId: emp.employeeId }, data: emp });
      employees.push(updated);
    } else {
      const created = await prisma.employee.create({ data: emp });
      employees.push(created);
    }
  }

  // 2. CUSTOMERS (Nashik clients & contractors)
  console.log('... Seeding Nashik Customers');
  const customersData = [
    {
      name: 'Nashik Builders & Infrastructure Pvt Ltd',
      phone: '9890123456',
      email: 'projects@nashikbuilders.in',
      address: 'Plot No. 42, Satpur MIDC Industrial Area, Nashik - 422007',
      businessDivision: 'construction',
      customerType: 'Contractor',
      notes: 'Leading commercial contractor in Nashik. Hires road rollers and compactors for MIDC projects.',
      isDemo: true
    },
    {
      name: 'Godavari Agro Cold Storage & Warehousing',
      phone: '9765432100',
      email: 'contact@godavariagro.com',
      address: 'Nashik-Dindori Road, Near Janori Air Cargo Hub, Dindori, Nashik - 422206',
      businessDivision: 'solar',
      customerType: 'Commercial',
      notes: 'Installed 25kW rooftop solar plant with MSEDCL net metering and subsidy.',
      isDemo: true
    },
    {
      name: 'Patil Infrastructure & Developers Sinnar',
      phone: '9422789012',
      email: 'patil.infra.sinnar@gmail.com',
      address: 'Ghoti-Sinnar Highway, Near Shriram Chowk, Sinnar, Nashik - 422103',
      businessDivision: 'suppliers',
      customerType: 'Contractor',
      notes: 'Bulk purchaser of blue metal aggregates and washed quarry sand.',
      isDemo: true
    },
    {
      name: 'Dr. Anand M. Kulkarni',
      phone: '9823055441',
      email: 'dr.anand.kulkarni@gmail.com',
      address: 'Bungalow No. 12, Suyojit Baugh, Gangapur Road, Nashik - 422005',
      businessDivision: 'solar',
      customerType: 'Individual',
      notes: 'Residential 5kW on-grid solar installation with PM Surya Ghar subsidy.',
      isDemo: true
    }
  ];

  const customers = [];
  for (const cust of customersData) {
    const existing = await prisma.customer.findFirst({ where: { phone: cust.phone, deletedAt: null } });
    if (existing) {
      const updated = await prisma.customer.update({ where: { id: existing.id }, data: cust });
      customers.push(updated);
    } else {
      const created = await prisma.customer.create({ data: cust });
      customers.push(created);
    }
  }

  // 3. LEADS (Nashik incoming inquiries)
  console.log('... Seeding Nashik Leads');
  const leadsData = [
    {
      name: 'Sunil Vasantrao Gite',
      phone: '9850112233',
      email: 'sunilgite.nsk@gmail.com',
      businessDivision: 'solar',
      requirement: 'PM Surya Ghar 3kW Rooftop Solar System for bungalow in Panchavati, Nashik.',
      preferredTime: 'Morning 10 AM',
      source: 'Solar Calculator',
      status: 'NEW',
      notes: 'Interested in getting 78,000 subsidy and rooftop survey this weekend.',
      isDemo: true
    },
    {
      name: 'Kapse Construction Sinnar',
      phone: '9420334455',
      email: 'kapse.sinnar@gmail.com',
      businessDivision: 'construction',
      requirement: 'Need 10-Ton Heavy Soil Compactor on rent for 7 days for warehouse foundation at Musalgaon MIDC.',
      preferredTime: 'Evening 4 PM',
      source: 'Rent Equipment Modal',
      status: 'CONTACTED',
      notes: 'Quoted daily rate ₹3,500/day. Waiting for site readiness.',
      isDemo: true
    },
    {
      name: 'Mhatre Agro Industries Dindori',
      phone: '9822667788',
      email: 'mhatreagro@yahoo.com',
      businessDivision: 'solar',
      requirement: '15kW Commercial Grid-Tie Solar Setup for grape cold storage plant at Dindori.',
      preferredTime: 'Afternoon 2 PM',
      source: 'Website Form',
      status: 'QUOTED',
      notes: 'Quotation sent via WhatsApp and email. Follow up on Tuesday.',
      isDemo: true
    },
    {
      name: 'Rohan Deshpande (Architect)',
      phone: '9158990011',
      email: 'rohan.architect@rediffmail.com',
      businessDivision: 'suppliers',
      requirement: 'Requirement of 80 Brass Crushed Washed Sand and 40 Tons 20mm Blue Metal for villa project on Gangapur Road.',
      preferredTime: 'Anytime',
      source: 'Material Estimator',
      status: 'WON',
      notes: 'Converted to regular material supply order for Jay Malhar Quarry unit.',
      isDemo: true
    }
  ];

  await prisma.lead.deleteMany({ where: { isDemo: true } });
  const leads = [];
  for (const ld of leadsData) {
    const created = await prisma.lead.create({ data: ld });
    leads.push(created);
  }

  // 4. PROJECTS (Nashik locations)
  console.log('... Seeding Nashik Projects');
  const projectsData = [
    {
      name: 'Musalgaon MIDC Industrial Sub-base Compaction',
      businessDivision: 'construction',
      customerId: customers[0].id,
      location: 'Plot D-14, Musalgaon MIDC, Sinnar, Nashik',
      startDate: new Date('2026-02-10'),
      deadline: new Date('2026-04-30'),
      budget: 350000,
      amountReceived: 210000,
      progress: 65,
      status: 'Ongoing',
      materialsUsed: 'De-watered soil, GSB material, 10T Compactor, 3T Tandem Roller deployed.',
      notes: 'Warehouse plinth and internal roadway compaction for engineering unit.',
      isDemo: true
    },
    {
      name: 'Gangapur Road 20kW Rooftop Solar Installation',
      businessDivision: 'solar',
      customerId: customers[3].id,
      location: 'Suyojit Baugh, Gangapur Road, Nashik',
      startDate: new Date('2026-01-20'),
      deadline: new Date('2026-03-25'),
      budget: 185000,
      amountReceived: 140000,
      progress: 85,
      status: 'Ongoing',
      materialsUsed: 'Tata Power Mono PERC 545W Panels (28 units), Microtek 15kW Inverter, GI Structure.',
      notes: 'Net-metering inspection scheduled with MSEDCL Nashik West division.',
      isDemo: true
    },
    {
      name: 'Samruddhi Expressway Approach Road Material Dispatch',
      businessDivision: 'suppliers',
      customerId: customers[2].id,
      location: 'Pathre-Ghoti Interchange, Tal. Sinnar, Nashik',
      startDate: new Date('2026-01-05'),
      deadline: new Date('2026-03-10'),
      budget: 480000,
      amountReceived: 480000,
      progress: 100,
      status: 'Completed',
      materialsUsed: '250 Tons of 20mm & 40mm blue metal aggregate dispatched via tipper trucks.',
      notes: 'Project fully delivered and payment cleared via NEFT.',
      isDemo: true
    },
    {
      name: 'Ambad Industrial Estate Workshop Ground Preparation',
      businessDivision: 'construction',
      customerId: customers[1].id,
      location: 'MIDC Ambad, Near Garware Point, Nashik',
      startDate: new Date('2026-02-28'),
      deadline: new Date('2026-04-15'),
      budget: 120000,
      amountReceived: 40000,
      progress: 25,
      status: 'Planned',
      materialsUsed: 'Tamping rammers and plate compactor reserved for mobilization.',
      notes: 'Awaiting client foundation marking completion.',
      isDemo: true
    }
  ];

  await prisma.projectEmployee.deleteMany({});
  await prisma.project.deleteMany({ where: { isDemo: true } });
  const projects = [];
  for (const proj of projectsData) {
    const created = await prisma.project.create({ data: proj });
    projects.push(created);
  }

  // 5. INVENTORY ITEMS (Nashik quarry & solar materials)
  console.log('... Seeding Nashik Inventory');
  const inventoryData = [
    {
      name: '20mm Blue Metal Basalt Aggregate',
      category: 'Aggregates',
      businessDivision: 'suppliers',
      quantity: 185,
      unit: 'Tons',
      purchasePrice: 420,
      sellingPrice: 650,
      supplier: 'Jay Malhar Crusher & Quarry Unit, Pathre, Sinnar',
      minStockLevel: 40,
      isDemo: true
    },
    {
      name: 'Crushed Washed Sand (VSI Quality)',
      category: 'Sand',
      businessDivision: 'suppliers',
      quantity: 92,
      unit: 'Brass',
      purchasePrice: 2800,
      sellingPrice: 3800,
      supplier: 'Jay Malhar Sand Washing Plant, Sinnar',
      minStockLevel: 20,
      isDemo: true
    },
    {
      name: 'Tata Power 545W Mono PERC Solar Panels',
      category: 'Solar Panels',
      businessDivision: 'solar',
      quantity: 48,
      unit: 'Units',
      purchasePrice: 10800,
      sellingPrice: 13500,
      supplier: 'Tata Power Solar Regional Depot, Satpur, Nashik',
      minStockLevel: 15,
      isDemo: true
    },
    {
      name: 'Microtek 5kVA Grid-Tie Solar Inverter (3-Phase)',
      category: 'Inverters',
      businessDivision: 'solar',
      quantity: 6,
      unit: 'Units',
      purchasePrice: 38000,
      sellingPrice: 48000,
      supplier: 'Microtek Authorized Distributor, Nashik Road',
      minStockLevel: 3,
      isDemo: true
    }
  ];

  await prisma.inventoryTransaction.deleteMany({ where: { isDemo: true } });
  await prisma.inventoryItem.deleteMany({ where: { isDemo: true } });
  const inventoryItems = [];
  for (const item of inventoryData) {
    const created = await prisma.inventoryItem.create({ data: item });
    inventoryItems.push(created);

    // Initial stock receipt transaction
    await prisma.inventoryTransaction.create({
      data: {
        inventoryItemId: created.id,
        type: 'STOCK_IN',
        quantity: created.quantity,
        balanceBefore: 0,
        balanceAfter: created.quantity,
        reason: 'Initial Nashik Quarry batch receipt & verification',
        referenceType: 'SUPPLY_INTAKE',
        performedBy: 'Owner (Darshan)',
        isDemo: true
      }
    });
  }

  // 6. EQUIPMENT (Machinery Fleet)
  console.log('... Seeding Nashik Equipment Fleet');
  const equipmentData = [
    {
      name: 'Heavy Vibratory Soil Compactor 10 Ton',
      equipmentId: 'JM-CMP-001',
      category: 'Compactor',
      businessDivision: 'construction',
      status: 'Available',
      rentalRatePerDay: 3500,
      purchaseDate: new Date('2022-04-10'),
      condition: 'Excellent',
      notes: 'Equipped with water sprinkler system and dual vibration amplitude for road base & MIDC plinths.',
      isDemo: true
    },
    {
      name: 'Vibratory Tandem Road Roller 3 Ton',
      equipmentId: 'JM-ROL-002',
      category: 'Roller',
      businessDivision: 'construction',
      status: 'Rented',
      rentalRatePerDay: 2200,
      purchaseDate: new Date('2023-01-15'),
      condition: 'Good',
      notes: 'Currently on site at Musalgaon MIDC, Sinnar. Smooth drum asphalt & gravel finish.',
      isDemo: true
    },
    {
      name: 'Heavy Duty Tamping Rammer 75kg (Honda Engine)',
      equipmentId: 'JM-RAM-003',
      category: 'Rammer',
      businessDivision: 'construction',
      status: 'Available',
      rentalRatePerDay: 800,
      purchaseDate: new Date('2023-08-20'),
      condition: 'Excellent',
      notes: 'High compaction force for trenches, pipeline backfill, and building foundation corners.',
      isDemo: true
    },
    {
      name: 'Vibratory Plate Compactor 5.5 HP',
      equipmentId: 'JM-PLT-004',
      category: 'Compactor',
      businessDivision: 'construction',
      status: 'Available',
      rentalRatePerDay: 700,
      purchaseDate: new Date('2024-02-12'),
      condition: 'Good',
      notes: 'Used for paver blocks, sub-base levelling and residential parking flooring in Nashik.',
      isDemo: true
    }
  ];

  await prisma.rental.deleteMany({ where: { isDemo: true } });
  await prisma.equipment.deleteMany({ where: { isDemo: true } });
  const equipment = [];
  for (const eq of equipmentData) {
    const created = await prisma.equipment.create({ data: eq });
    equipment.push(created);
  }

  // 7. RENTALS (Active and past rentals)
  console.log('... Seeding Nashik Rentals');
  const rentalsData = [
    {
      equipmentId: equipment[1].id, // Roller
      customerId: customers[0].id, // Nashik Builders
      rentalStart: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      expectedReturn: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      rentalAmount: 19800,
      depositAmount: 10000,
      paymentStatus: 'Partially Paid',
      notes: 'Hired for Musalgaon MIDC warehouse parking layer compaction. Operator provided by JM.',
      isDemo: true
    },
    {
      equipmentId: equipment[2].id, // Rammer
      customerId: customers[2].id, // Patil Infra Sinnar
      rentalStart: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      expectedReturn: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      actualReturn: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      rentalAmount: 4000,
      depositAmount: 5000,
      paymentStatus: 'Paid',
      conditionOnReturn: 'Good',
      notes: 'Returned in clean condition, full payment received via UPI.',
      isDemo: true
    }
  ];

  for (const r of rentalsData) {
    await prisma.rental.create({ data: r });
  }

  // 8. VEHICLES & FLEET (Nashik MH-15 registered)
  console.log('... Seeding Nashik Logistics Vehicles');
  const vehiclesData = [
    {
      registrationNo: 'MH-15-EG-4521',
      type: 'Tipper Truck (10 Wheeler)',
      driverName: 'Nitin Raghunath Deshmukh',
      businessDivision: 'suppliers',
      lastServiceDate: new Date('2026-02-15'),
      nextServiceDate: new Date('2026-05-15'),
      maintenanceStatus: 'Operational',
      isDemo: true
    },
    {
      registrationNo: 'MH-15-GV-8832',
      type: 'Dumper Truck (Heavy Duty)',
      driverName: 'Kailas Tukaram Shinde',
      businessDivision: 'suppliers',
      lastServiceDate: new Date('2026-01-28'),
      nextServiceDate: new Date('2026-04-28'),
      maintenanceStatus: 'Operational',
      isDemo: true
    },
    {
      registrationNo: 'MH-15-BX-1120',
      type: 'Pickup Truck (Mahindra Bolero Maxi)',
      driverName: 'Sandip Vitthal Gaikwad',
      businessDivision: 'construction',
      lastServiceDate: new Date('2026-02-02'),
      nextServiceDate: new Date('2026-06-02'),
      maintenanceStatus: 'Operational',
      isDemo: true
    }
  ];

  await prisma.vehicleExpense.deleteMany({ where: { isDemo: true } });
  await prisma.vehicle.deleteMany({ where: { isDemo: true } });
  const vehicles = [];
  for (const v of vehiclesData) {
    const created = await prisma.vehicle.create({ data: v });
    vehicles.push(created);

    // Seed realistic vehicle fuel and service expenses
    await prisma.vehicleExpense.create({
      data: {
        vehicleId: created.id,
        type: 'Fuel',
        amount: 4500,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        description: 'Diesel 50 Litres from HPCL Pump, Shriram Chowk, Sinnar',
        isDemo: true
      }
    });

    await prisma.vehicleExpense.create({
      data: {
        vehicleId: created.id,
        type: 'Maintenance',
        amount: 1850,
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        description: 'Brake pad adjustment & greasing at Satpur MIDC auto workshop',
        isDemo: true
      }
    });
  }

  // 9. INCOME & EXPENSE LEDGER (Nashik finance)
  console.log('... Seeding Nashik Financial Ledger');
  const incomesData = [
    {
      date: new Date(),
      businessDivision: 'construction',
      source: 'Equipment Rental Advance',
      customerName: 'Nashik Builders & Infrastructure Pvt Ltd',
      amount: 10000,
      paymentMethod: 'NEFT/RTGS',
      referenceNumber: 'HDFC202603038842',
      description: 'Advance payment for Road Roller hire at Musalgaon MIDC site',
      isDemo: true
    },
    {
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      businessDivision: 'solar',
      source: 'Solar Project Milestone 2',
      customerName: 'Dr. Anand M. Kulkarni',
      amount: 65000,
      paymentMethod: 'UPI',
      referenceNumber: 'UPI/604588210394/GPay',
      description: 'Rooftop structure and panel mounting completion milestone',
      isDemo: true
    },
    {
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      businessDivision: 'suppliers',
      source: 'Stone Aggregate Supply Batch',
      customerName: 'Patil Infrastructure & Developers Sinnar',
      amount: 48000,
      paymentMethod: 'Cheque',
      referenceNumber: 'CHQ-004521-SBI-SINNAR',
      description: 'Supply of 65 Tons 20mm blue metal basalt stone to bypass road',
      isDemo: true
    }
  ];

  const expensesData = [
    {
      date: new Date(),
      businessDivision: 'suppliers',
      category: 'Fuel & Logistics',
      amount: 6350,
      paymentMethod: 'UPI',
      paidTo: 'HP Petrol Pump, Sinnar Bypass',
      referenceNumber: 'UPI/HPCL/901239',
      description: 'Diesel fill for Tipper MH-15-EG-4521 aggregate delivery trip',
      isDemo: true
    },
    {
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      businessDivision: 'construction',
      category: 'Equipment Maintenance',
      amount: 3200,
      paymentMethod: 'Cash',
      paidTo: 'Shree Ganesh Engineering Satpur',
      referenceNumber: 'BILL-4412',
      description: 'Replacement of air filter and hydraulic oil for 10T Compactor',
      isDemo: true
    },
    {
      date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      businessDivision: 'solar',
      category: 'Raw Materials',
      amount: 38000,
      paymentMethod: 'NEFT/RTGS',
      paidTo: 'Microtek Solar Distribution Nashik',
      referenceNumber: 'AXISRTGS202611094',
      description: 'Purchase of 5kVA Grid-Tie Inverters for Gangapur Road project',
      isDemo: true
    }
  ];

  await prisma.income.deleteMany({ where: { isDemo: true } });
  await prisma.expense.deleteMany({ where: { isDemo: true } });
  for (const inc of incomesData) await prisma.income.create({ data: inc });
  for (const exp of expensesData) await prisma.expense.create({ data: exp });

  // 10. QUOTATIONS & INVOICES (Nashik billing)
  console.log('... Seeding Nashik Quotations & Invoices');
  await prisma.payment.deleteMany({ where: { isDemo: true } });
  await prisma.invoiceItem.deleteMany({});
  await prisma.invoice.deleteMany({ where: { isDemo: true } });
  await prisma.quotationItem.deleteMany({});
  await prisma.quotation.deleteMany({ where: { isDemo: true } });

  // Quotation 1
  const quote1 = await prisma.quotation.create({
    data: {
      quotationNumber: 'CONST-Q-1001',
      customerId: customers[0].id,
      businessDivision: 'construction',
      date: new Date('2026-02-15'),
      validUntil: new Date('2026-03-31'),
      taxRate: 18,
      taxAmount: 5040,
      discount: 1000,
      grandTotal: 32040,
      terms: 'Rate includes operator fuel and site mobilization in Sinnar/Satpur MIDC. Payment: 50% advance.',
      status: 'Sent',
      isDemo: true,
      items: {
        create: [
          { description: 'Heavy Vibratory Soil Compactor 10T (7 Days Hire)', quantity: 7, unit: 'Day', unitPrice: 3500, lineTotal: 24500 },
          { description: 'Equipment Mobilization & Transport to Musalgaon MIDC', quantity: 1, unit: 'Trip', unitPrice: 3500, lineTotal: 3500 }
        ]
      }
    }
  });

  // Quotation 2 (Solar)
  const quote2 = await prisma.quotation.create({
    data: {
      quotationNumber: 'SOLAR-Q-1002',
      customerId: customers[1].id,
      businessDivision: 'solar',
      date: new Date('2026-02-20'),
      validUntil: new Date('2026-04-10'),
      taxRate: 12,
      taxAmount: 28800,
      discount: 5000,
      grandTotal: 263800,
      terms: 'Includes PM Surya Ghar subsidy processing with MSEDCL Nashik division and 5-year warranty.',
      status: 'Accepted',
      isDemo: true,
      items: {
        create: [
          { description: 'Tata Power 545W Mono PERC Solar Modules (28 Nos)', quantity: 28, unit: 'Unit', unitPrice: 5800, lineTotal: 162400 },
          { description: 'Microtek 15kW 3-Phase Grid-Tie Inverter', quantity: 1, unit: 'Unit', unitPrice: 55000, lineTotal: 55000 },
          { description: 'Hot-dip Galvanized Structure, Earthing & Lightning Arrester', quantity: 1, unit: 'Set', unitPrice: 22600, lineTotal: 22600 }
        ]
      }
    }
  });

  // Invoice 1
  const inv1 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'CONST-INV-1001',
      customerId: customers[0].id,
      businessDivision: 'construction',
      date: new Date('2026-02-25'),
      dueDate: new Date('2026-03-25'),
      taxRate: 18,
      taxAmount: 5040,
      discount: 1000,
      total: 32040,
      amountPaid: 15000,
      paymentStatus: 'Partially Paid',
      convertedFromQuotationId: quote1.id,
      notes: 'Partial payment ₹15,000 received via IMPS. Balance pending on completion.',
      isDemo: true,
      items: {
        create: [
          { description: 'Heavy Vibratory Soil Compactor 10T Rental', quantity: 7, unit: 'Day', unitPrice: 3500, lineTotal: 24500 },
          { description: 'Site Delivery & Transportation Charges (Nashik)', quantity: 1, unit: 'Trip', unitPrice: 3500, lineTotal: 3500 }
        ]
      },
      payments: {
        create: [
          {
            amount: 15000,
            paymentDate: new Date('2026-02-26'),
            paymentMethod: 'UPI',
            referenceNo: 'UPI/HDFC/60224190',
            notes: 'Advance booking token',
            isDemo: true
          }
        ]
      }
    }
  });

  // Invoice 2
  const inv2 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'SUPPL-INV-1002',
      customerId: customers[2].id,
      businessDivision: 'suppliers',
      date: new Date('2026-02-28'),
      dueDate: new Date('2026-03-15'),
      taxRate: 5,
      taxAmount: 2250,
      discount: 0,
      total: 47250,
      amountPaid: 47250,
      paymentStatus: 'Paid',
      notes: 'Full payment received against delivery of 65 Tons aggregate.',
      isDemo: true,
      items: {
        create: [
          { description: '20mm Basalt Aggregate (High Strength Quarry Batch)', quantity: 65, unit: 'Tons', unitPrice: 650, lineTotal: 42250 },
          { description: 'Tipper Freight & Unloading at Sinnar Site', quantity: 1, unit: 'Batch', unitPrice: 2750, lineTotal: 2750 }
        ]
      },
      payments: {
        create: [
          {
            amount: 47250,
            paymentDate: new Date('2026-03-01'),
            paymentMethod: 'NEFT/RTGS',
            referenceNo: 'RTGS/SBI/NASHIK/009124',
            notes: 'Full settlement',
            isDemo: true
          }
        ]
      }
    }
  });

  // 11. APPOINTMENTS & SITE VISITS (Nashik field locations)
  console.log('... Seeding Nashik Appointments');
  const appointmentsData = [
    {
      title: 'Musalgaon MIDC Site Soil Density Inspection',
      type: 'Site Visit',
      businessDivision: 'construction',
      dateTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      location: 'Plot D-14, Musalgaon MIDC, Sinnar',
      contactPerson: 'Er. Sandeep Patil (Project Engg)',
      contactPhone: '9890123456',
      assignedEmployeeId: employees[0].id,
      status: 'Scheduled',
      notes: 'Perform core cutter test after 8 passes of 10T Vibratory Compactor.',
      isDemo: true
    },
    {
      title: 'Gangapur Road Rooftop Solar Shadow Analysis Survey',
      type: 'Site Visit',
      businessDivision: 'solar',
      dateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      location: 'Suyojit Baugh, Gangapur Road, Nashik',
      contactPerson: 'Dr. Anand Kulkarni',
      contactPhone: '9823055441',
      assignedEmployeeId: employees[1].id,
      status: 'Scheduled',
      notes: 'Measure terrace parapet height and 3D shadow mapping for optimum tilt angle.',
      isDemo: true
    },
    {
      title: 'Satpur MIDC Road Roller Delivery & Handover',
      type: 'Equipment Delivery',
      businessDivision: 'construction',
      dateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      location: 'Plot 42, Satpur MIDC, Near Siemens, Nashik',
      contactPerson: 'Mahesh Bhamare (Site Incharge)',
      contactPhone: '9422789012',
      assignedEmployeeId: employees[2].id,
      status: 'Scheduled',
      notes: 'Deliver 3T Tandem Roller with operator checklist and diesel gauge receipt.',
      isDemo: true
    },
    {
      title: 'MSEDCL Net-Metering Joint Inspection (Nashik Circle)',
      type: 'Client Meeting',
      businessDivision: 'solar',
      dateTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      location: 'MSEDCL Division Office, Sharanpur Road, Nashik',
      contactPerson: 'Shri Deshpande (Assistant Engineer)',
      contactPhone: '9420011223',
      assignedEmployeeId: employees[1].id,
      status: 'Completed',
      notes: 'Bi-directional meter sanctioned and grid synchronization certificate signed.',
      isDemo: true
    }
  ];

  await prisma.appointment.deleteMany({ where: { isDemo: true } });
  for (const apt of appointmentsData) {
    await prisma.appointment.create({ data: apt });
  }

  // 12. TASKS & DAILY PLANNER (Nashik operations)
  console.log('... Seeding Nashik Operational Tasks');
  const tasksData = [
    {
      title: 'Service & Grease 10T Heavy Compactor (JM-CMP-001)',
      description: 'Check engine oil grade 15W40, clean air filter canister, and test exciter vibratory clutch at Pathre yard.',
      businessDivision: 'construction',
      employeeId: employees[2].id,
      projectId: projects[0].id,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      priority: 'High',
      status: 'In Progress',
      isDemo: true
    },
    {
      title: 'Deliver 25 Tons Blue Metal to Musalgaon MIDC Site',
      description: 'Load from Sinnar Quarry via Tipper MH-15-EG-4521. Obtain weight slip from Dharamkanta scale.',
      businessDivision: 'suppliers',
      employeeId: employees[3].id,
      projectId: projects[0].id,
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      priority: 'Urgent',
      status: 'Pending',
      isDemo: true
    },
    {
      title: 'Complete Solar Inverter Earthing Pit at Gangapur Road',
      description: 'Install chemical earthing electrodes and test earth resistance < 2 ohms before MSEDCL inspection.',
      businessDivision: 'solar',
      employeeId: employees[1].id,
      projectId: projects[1].id,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      priority: 'Medium',
      status: 'Pending',
      isDemo: true
    },
    {
      title: 'Collect Rental Security Deposit Cheque from Ambad Contractor',
      description: 'Collect signed contract copy and ₹10,000 security deposit from Nashik Builders office.',
      businessDivision: 'construction',
      employeeId: employees[0].id,
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      priority: 'Medium',
      status: 'Completed',
      isDemo: true
    }
  ];

  await prisma.task.deleteMany({ where: { isDemo: true } });
  // Find owner id for assignment
  const ownerUser = await prisma.user.findFirst({ where: { role: { name: 'Owner' } } });
  for (const t of tasksData) {
    await prisma.task.create({
      data: {
        ...t,
        assignedToUserId: ownerUser ? ownerUser.id : (await prisma.user.findFirst()).id
      }
    });
  }

  // 13. DOCUMENTS (Nashik licenses and certifications)
  console.log('... Seeding Nashik Document Vault');
  const documentsData = [
    {
      originalName: 'GST_Registration_Certificate_Nashik_Circle.pdf',
      storedFilename: 'gst_certificate_nashik_2026.bin',
      mimeType: 'application/pdf',
      sizeBytes: 45200,
      category: 'GST',
      businessDivision: 'group',
      uploadedBy: 'Owner (Darshan)',
      isDemo: true
    },
    {
      originalName: 'Sinnar_Quarry_Mining_Environmental_Clearance.pdf',
      storedFilename: 'sinnar_quarry_clearance_2026.bin',
      mimeType: 'application/pdf',
      sizeBytes: 89400,
      category: 'Licences',
      businessDivision: 'suppliers',
      uploadedBy: 'Owner (Darshan)',
      isDemo: true
    },
    {
      originalName: 'MSEDCL_Solar_Net_Metering_Sanction_Gangapur.pdf',
      storedFilename: 'msedcl_solar_sanction_gangapur.bin',
      mimeType: 'application/pdf',
      sizeBytes: 32100,
      category: 'Contracts',
      businessDivision: 'solar',
      uploadedBy: 'Sachin Patil',
      isDemo: true
    },
    {
      originalName: 'Heavy_Machinery_Fleet_Insurance_Nashik_2026_27.pdf',
      storedFilename: 'machinery_insurance_fleet_2026.bin',
      mimeType: 'application/pdf',
      sizeBytes: 67800,
      category: 'Vehicle',
      businessDivision: 'construction',
      uploadedBy: 'Owner (Darshan)',
      isDemo: true
    }
  ];

  await prisma.document.deleteMany({ where: { isDemo: true } });
  for (const doc of documentsData) {
    await prisma.document.create({ data: doc });
  }

  // 14. NOTIFICATIONS (Nashik real-time operational alerts)
  console.log('... Seeding Nashik Operational Notifications');
  const notificationsData = [
    {
      title: 'New Solar Subsidy Inquiry from Gangapur Road',
      message: 'Sunil Vasantrao Gite submitted a 3kW PM Surya Ghar enquiry for residential bungalow in Nashik.',
      type: 'LEAD_FOLLOWUP',
      businessDivision: 'solar',
      isRead: false,
      isDemo: true
    },
    {
      title: 'Low Stock Alert: Tata Power Solar Panels',
      message: 'Only 48 units remaining in inventory. Minimum reorder threshold is 15 units. Check Satpur supplier.',
      type: 'LOW_STOCK',
      businessDivision: 'solar',
      isRead: false,
      isDemo: true
    },
    {
      title: 'Upcoming Machinery Return in 4 Days',
      message: 'Vibratory Tandem Roller (JM-ROL-002) is due for return from Musalgaon MIDC site on 7th March.',
      type: 'EQUIPMENT_RETURN',
      businessDivision: 'construction',
      isRead: false,
      isDemo: true
    },
    {
      title: 'Site Visit Scheduled Today in Sinnar',
      message: 'Musalgaon MIDC Site Soil Density Inspection assigned to Sachin Patil at 10:00 AM.',
      type: 'SYSTEM',
      businessDivision: 'construction',
      isRead: true,
      isDemo: true
    }
  ];

  await prisma.notification.deleteMany({ where: { isDemo: true } });
  for (const n of notificationsData) {
    await prisma.notification.create({ data: n });
  }

  console.log('✅ ALL SECTIONS SEEDED WITH 2-4 AUTHENTIC NASHIK REGION RECORDS SUCCESSFULLY!');
}

seedNashikData()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });

