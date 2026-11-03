const prisma = require('../config/db');
const { logAudit } = require('../utils/audit');
const { z } = require('zod');

const itemSchema = z.object({
  name: z.string().min(2, 'Item name is required'),
  category: z.string().min(2, 'Category is required'),
  businessDivision: z.enum(['construction', 'solar', 'suppliers', 'group']).default('suppliers'),
  quantity: z.number().min(0, 'Quantity cannot be negative').default(0),
  unit: z.string().min(1, 'Unit is required'),
  purchasePrice: z.number().min(0).default(0),
  sellingPrice: z.number().min(0).default(0),
  supplier: z.string().optional().nullable(),
  minStockLevel: z.number().min(0).default(10)
});

/**
 * Get all inventory items with division and low-stock filter
 */
async function getInventory(req, res) {
  try {
    const { division, category, lowStock, search } = req.query;

    const where = { deletedAt: null };
    if (division && division !== 'all') {
      where.businessDivision = division;
    }
    if (category && category !== 'all') {
      where.category = category;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { supplier: { contains: search, mode: 'insensitive' } }
      ];
    }

    let items = await prisma.inventoryItem.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        transactions: {
          take: 5,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (lowStock === 'true') {
      items = items.filter(item => item.quantity <= item.minStockLevel);
    }

    return res.json({ success: true, count: items.length, items });
  } catch (error) {
    console.error('Get Inventory Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to retrieve inventory items' });
  }
}

/**
 * Add new inventory item
 */
async function createInventoryItem(req, res) {
  try {
    const parse = itemSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'ValidationError', message: parse.error.errors[0]?.message });
    }

    const data = parse.data;
    const item = await prisma.inventoryItem.create({
      data: {
        name: data.name,
        category: data.category,
        businessDivision: data.businessDivision,
        quantity: data.quantity,
        unit: data.unit,
        purchasePrice: data.purchasePrice,
        sellingPrice: data.sellingPrice,
        supplier: data.supplier || null,
        minStockLevel: data.minStockLevel
      }
    });

    // Record initial stock transaction
    if (data.quantity > 0) {
      await prisma.inventoryTransaction.create({
        data: {
          inventoryItemId: item.id,
          type: 'STOCK_IN',
          quantity: data.quantity,
          balanceBefore: 0,
          balanceAfter: data.quantity,
          reason: 'Initial Stock Setup',
          performedBy: req.user.name || req.user.email
        }
      });
    }

    await logAudit({
      actorUserId: req.user.id,
      action: 'INVENTORY_CREATE',
      entityType: 'InventoryItem',
      entityId: item.id,
      afterJson: item,
      req
    });

    return res.status(201).json({ success: true, item });
  } catch (error) {
    console.error('Create Inventory Item Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to create inventory item' });
  }
}

/**
 * Stock In (Receive stock)
 */
async function stockIn(req, res) {
  try {
    const { id } = req.params;
    const { quantity, reason, referenceId } = req.body;
    const qty = parseFloat(quantity);

    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ error: 'ValidationError', message: 'Quantity must be greater than 0' });
    }

    const item = await prisma.inventoryItem.findUnique({ where: { id } });
    if (!item) {
      return res.status(404).json({ error: 'NotFound', message: 'Item not found' });
    }

    const newBalance = item.quantity + qty;

    const [updatedItem, txn] = await prisma.$transaction([
      prisma.inventoryItem.update({
        where: { id },
        data: {
          quantity: newBalance,
          updatedAt: new Date()
        }
      }),
      prisma.inventoryTransaction.create({
        data: {
          inventoryItemId: id,
          type: 'STOCK_IN',
          quantity: qty,
          balanceBefore: item.quantity,
          balanceAfter: newBalance,
          reason: reason || 'Stock In Purchase Receipt',
          referenceType: 'PURCHASE_RECEIPT',
          referenceId: referenceId || null,
          performedBy: req.user.name || req.user.email
        }
      })
    ]);

    await logAudit({
      actorUserId: req.user.id,
      action: 'INVENTORY_STOCK_IN',
      entityType: 'InventoryItem',
      entityId: id,
      beforeJson: { quantity: item.quantity },
      afterJson: { quantity: newBalance },
      req
    });

    return res.json({ success: true, item: updatedItem, transaction: txn });
  } catch (error) {
    console.error('Stock In Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to record stock in' });
  }
}

/**
 * Stock Out (Issue/Sell)
 * STRICT NEGATIVE GUARD: Must reject if requested > available with 400 error!
 */
async function stockOut(req, res) {
  try {
    const { id } = req.params;
    const { quantity, reason, referenceId } = req.body;
    const qty = parseFloat(quantity);

    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ error: 'ValidationError', message: 'Quantity must be greater than 0' });
    }

    const item = await prisma.inventoryItem.findUnique({ where: { id } });
    if (!item) {
      return res.status(404).json({ error: 'NotFound', message: 'Item not found' });
    }

    // STRICT NEGATIVE STOCK GUARD
    if (item.quantity < qty) {
      return res.status(400).json({
        error: 'NegativeStockError',
        message: `Only ${item.quantity} ${item.unit} available, attempted to issue ${qty} ${item.unit}`,
        availableQuantity: item.quantity,
        requestedQuantity: qty,
        unit: item.unit
      });
    }

    const newBalance = item.quantity - qty;

    const [updatedItem, txn] = await prisma.$transaction([
      prisma.inventoryItem.update({
        where: { id },
        data: {
          quantity: newBalance,
          updatedAt: new Date()
        }
      }),
      prisma.inventoryTransaction.create({
        data: {
          inventoryItemId: id,
          type: 'STOCK_OUT',
          quantity: qty,
          balanceBefore: item.quantity,
          balanceAfter: newBalance,
          reason: reason || 'Stock Out Dispatch',
          referenceType: 'DISPATCH',
          referenceId: referenceId || null,
          performedBy: req.user.name || req.user.email
        }
      })
    ]);

    // Check if low stock threshold reached
    if (newBalance <= item.minStockLevel) {
      await prisma.notification.create({
        data: {
          title: `Low Stock Alert: ${item.name}`,
          message: `Stock level for ${item.name} dropped to ${newBalance} ${item.unit} (Minimum: ${item.minStockLevel})`,
          type: 'LOW_STOCK',
          businessDivision: item.businessDivision,
          linkUrl: '/dashboard/inventory'
        }
      }).catch(err => console.error('Low stock alert error:', err));
    }

    await logAudit({
      actorUserId: req.user.id,
      action: 'INVENTORY_STOCK_OUT',
      entityType: 'InventoryItem',
      entityId: id,
      beforeJson: { quantity: item.quantity },
      afterJson: { quantity: newBalance },
      req
    });

    return res.json({ success: true, item: updatedItem, transaction: txn });
  } catch (error) {
    console.error('Stock Out Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to record stock out' });
  }
}

/**
 * Manual Adjust with mandatory reason
 */
async function adjustStock(req, res) {
  try {
    const { id } = req.params;
    const { newQuantity, reason } = req.body;
    const qty = parseFloat(newQuantity);

    if (isNaN(qty) || qty < 0) {
      return res.status(400).json({ error: 'ValidationError', message: 'New quantity cannot be negative' });
    }
    if (!reason || reason.trim().length < 3) {
      return res.status(400).json({ error: 'ValidationError', message: 'A valid reason for manual adjustment is required' });
    }

    const item = await prisma.inventoryItem.findUnique({ where: { id } });
    if (!item) {
      return res.status(404).json({ error: 'NotFound', message: 'Item not found' });
    }

    const diff = Math.abs(qty - item.quantity);

    const [updatedItem, txn] = await prisma.$transaction([
      prisma.inventoryItem.update({
        where: { id },
        data: {
          quantity: qty,
          updatedAt: new Date()
        }
      }),
      prisma.inventoryTransaction.create({
        data: {
          inventoryItemId: id,
          type: 'ADJUSTMENT',
          quantity: diff,
          balanceBefore: item.quantity,
          balanceAfter: qty,
          reason: `Manual Correction: ${reason}`,
          referenceType: 'MANUAL_ADJUSTMENT',
          performedBy: req.user.name || req.user.email
        }
      })
    ]);

    await logAudit({
      actorUserId: req.user.id,
      action: 'INVENTORY_ADJUST',
      entityType: 'InventoryItem',
      entityId: id,
      beforeJson: { quantity: item.quantity },
      afterJson: { quantity: qty, reason },
      req
    });

    return res.json({ success: true, item: updatedItem, transaction: txn });
  } catch (error) {
    console.error('Adjust Stock Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to adjust stock' });
  }
}

/**
 * Get item transaction history
 */
async function getItemTransactions(req, res) {
  try {
    const { id } = req.params;
    const transactions = await prisma.inventoryTransaction.findMany({
      where: { inventoryItemId: id },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ success: true, count: transactions.length, transactions });
  } catch (error) {
    console.error('Get Item Transactions Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to get transactions' });
  }
}

/**
 * Update inventory item details
 */
async function updateInventoryItem(req, res) {
  try {
    const { id } = req.params;
    const existing = await prisma.inventoryItem.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'NotFound', message: 'Inventory item not found' });

    const updated = await prisma.inventoryItem.update({
      where: { id },
      data: {
        ...req.body,
        quantity: req.body.quantity !== undefined ? Number(req.body.quantity) : existing.quantity,
        purchasePrice: req.body.purchasePrice !== undefined ? Number(req.body.purchasePrice) : existing.purchasePrice,
        sellingPrice: req.body.sellingPrice !== undefined ? Number(req.body.sellingPrice) : existing.sellingPrice,
        minStockLevel: req.body.minStockLevel !== undefined ? Number(req.body.minStockLevel) : existing.minStockLevel,
        updatedAt: new Date()
      }
    });

    await logAudit({
      actorUserId: req.user.id,
      action: 'INVENTORY_UPDATE',
      entityType: 'InventoryItem',
      entityId: id,
      beforeJson: existing,
      afterJson: updated,
      req
    });

    return res.json({ success: true, item: updated });
  } catch (error) {
    console.error('Update Inventory Item Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to update inventory item' });
  }
}

/**
 * Delete inventory item (Soft-delete)
 */
async function deleteInventoryItem(req, res) {
  try {
    const { id } = req.params;
    const existing = await prisma.inventoryItem.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'NotFound', message: 'Inventory item not found' });

    await prisma.inventoryItem.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    await logAudit({
      actorUserId: req.user.id,
      action: 'INVENTORY_DELETE',
      entityType: 'InventoryItem',
      entityId: id,
      beforeJson: existing,
      req
    });

    return res.json({ success: true, message: 'Inventory item removed successfully' });
  } catch (error) {
    console.error('Delete Inventory Item Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to delete inventory item' });
  }
}

module.exports = {
  getInventory,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  stockIn,
  stockOut,
  adjustStock,
  getItemTransactions
};
