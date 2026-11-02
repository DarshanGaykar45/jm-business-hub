const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipment.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/permissions');

router.use(authenticate);

router.get('/', authorize('equipment', 'read'), equipmentController.getEquipment);
router.post('/', authorize('equipment', 'create'), equipmentController.createEquipment);
router.put('/:id', authorize('equipment', 'update'), equipmentController.updateEquipment);

module.exports = router;
