const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/permissions');

router.use(authenticate);

router.get('/', authorize('inventory', 'read'), inventoryController.getInventory);
router.post('/', authorize('inventory', 'create'), inventoryController.createInventoryItem);
router.put('/:id', authorize('inventory', 'update'), inventoryController.updateInventoryItem);
router.delete('/:id', authorize('inventory', 'delete'), inventoryController.deleteInventoryItem);
router.post('/:id/stock-in', authorize('inventory', 'update'), inventoryController.stockIn);
router.post('/:id/stock-out', authorize('inventory', 'update'), inventoryController.stockOut);
router.post('/:id/adjust', authorize('inventory', 'update'), inventoryController.adjustStock);
router.get('/:id/transactions', authorize('inventory', 'read'), inventoryController.getItemTransactions);

module.exports = router;
