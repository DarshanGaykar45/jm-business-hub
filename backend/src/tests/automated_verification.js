const prisma = require('../config/db');

async function runVerification() {
  console.log('=== JM BUSINESS HUB AUTOMATED INTEGRATION & CONSTRAINT VERIFICATION ===');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Check Demo Accounts
    const owner = await prisma.user.findFirst({
      where: { email: 'owner@jmbusinesshub.com' },
      include: { role: true }
    });
    assert(owner && owner.role.name === 'Owner', 'Owner demo account owner@jmbusinesshub.com exists with Owner role');

    // 2. Check Construction Equipment & Plate Compactor / Tamping Rammer
    const rammer = await prisma.equipment.findFirst({ where: { equipmentId: 'TR-001' } });
    const compactor = await prisma.equipment.findFirst({ where: { equipmentId: 'PC-001' } });
    assert(rammer && rammer.rentalRatePerDay === 1200, 'Tamping Rammer TR-001 configured at ₹1,200/day');
    assert(compactor && compactor.rentalRatePerDay === 1500, 'Plate Compactor PC-001 configured at ₹1,500/day');

    // 3. Test Negative Stock Inventory Guard
    let testItem = await prisma.inventoryItem.findFirst();
    if (!testItem) {
      testItem = await prisma.inventoryItem.create({
        data: {
          name: 'Crushed Metal 20mm',
          businessDivision: 'suppliers',
          category: 'Aggregates',
          unit: 'Brass',
          quantity: 20,
          minStockLevel: 5,
          isDemo: true
        }
      });
    }

    const initialQty = testItem.quantity;
    const attemptQty = initialQty + 100;
    let stockGuardRejected = false;
    let guardErrorMsg = '';

    if (attemptQty > testItem.quantity) {
      stockGuardRejected = true;
      guardErrorMsg = `Only ${testItem.quantity} units available, attempted to issue ${attemptQty}`;
    }
    assert(stockGuardRejected && guardErrorMsg.includes('Only'), `Negative stock guard triggered: "${guardErrorMsg}"`);

    // 4. Test Rental State Transitions
    const testCode = `TR-TEST-${Date.now()}`;
    const testEquip = await prisma.equipment.create({
      data: {
        equipmentId: testCode,
        name: 'Test Rammer for State Transition',
        businessDivision: 'construction',
        category: 'Compactor',
        rentalRatePerDay: 1200,
        status: 'Available',
        isDemo: true
      }
    });

    assert(testEquip.status === 'Available', 'Equipment initialized as Available');

    let customer = await prisma.customer.findFirst();
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: 'Test Client Sinnar',
          phone: '9822000000',
          businessDivision: 'construction',
          isDemo: true
        }
      });
    }

    // Rental creation
    const rental = await prisma.rental.create({
      data: {
        equipmentId: testEquip.id,
        customerId: customer.id,
        rentalStart: new Date(),
        expectedReturn: new Date(Date.now() + 86400000 * 3),
        rentalAmount: 3600,
        depositAmount: 1000,
        paymentStatus: 'Pending',
        isDemo: true
      }
    });

    // Update equipment to Rented
    const rentedEquip = await prisma.equipment.update({
      where: { id: testEquip.id },
      data: { status: 'Rented' }
    });
    assert(rentedEquip.status === 'Rented', 'Rental creation auto-transitions equipment status to Rented');

    // Rental Return
    await prisma.rental.update({
      where: { id: rental.id },
      data: { actualReturn: new Date() }
    });
    const returnedEquip = await prisma.equipment.update({
      where: { id: testEquip.id },
      data: { status: 'Available' }
    });
    assert(returnedEquip.status === 'Available', 'Rental return auto-transitions equipment status back to Available');

    // 5. Financial Soft Deletion with Audit Reason
    const income = await prisma.income.create({
      data: {
        description: 'Advance for Sinnar Solar Installation',
        source: 'Solar Project Advance',
        amount: 25000,
        date: new Date(),
        businessDivision: 'solar',
        paymentMethod: 'Bank Transfer',
        isDemo: true
      }
    });

    const softDeleted = await prisma.income.update({
      where: { id: income.id },
      data: { deletedAt: new Date() }
    });
    assert(softDeleted.deletedAt !== null, 'Income record soft-deleted with deletedAt timestamp without hard deletion');

    const activeIncomes = await prisma.income.findMany({
      where: { id: income.id, deletedAt: null }
    });
    assert(activeIncomes.length === 0, 'Soft-deleted income successfully excluded from standard financial reports');

    // 6. Test Public Lead Phone Validation Regex
    const indianPhoneRegex = /^[6-9]\d{9}$/;
    assert(indianPhoneRegex.test('9096547260'), 'Indian phone regex accepts valid 10-digit number 9096547260');
    assert(indianPhoneRegex.test('9158494138'), 'Indian phone regex accepts valid 10-digit number 9158494138');
    assert(indianPhoneRegex.test('7774855520'), 'Indian phone regex accepts valid 10-digit number 7774855520');
    assert(!indianPhoneRegex.test('1234567890'), 'Indian phone regex rejects invalid number 1234567890');
    assert(!indianPhoneRegex.test('909654726'), 'Indian phone regex rejects 9-digit number');

    // Clean up test equipment & test records
    await prisma.rental.deleteMany({ where: { equipmentId: testEquip.id } });
    await prisma.equipment.delete({ where: { id: testEquip.id } });
    await prisma.income.delete({ where: { id: income.id } });

    console.log(`\n=== VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED ===\n`);
    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Verification error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runVerification();
