const express = require('express');
const router = express.Router();
const vehiclesController = require('../controllers/vehicles.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/permissions');

router.use(authenticate);

router.get('/', authorize('equipment', 'read'), vehiclesController.getVehicles);
router.post('/', authorize('equipment', 'create'), vehiclesController.createVehicle);
router.post('/:id/expenses', authorize('financials', 'create'), vehiclesController.logVehicleExpense);

module.exports = router;
