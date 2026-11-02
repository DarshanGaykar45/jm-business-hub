const express = require('express');
const router = express.Router();
const divisionsController = require('../controllers/divisions.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/permissions');

router.get('/', divisionsController.getDivisions);
router.put('/', authenticate, authorize('settings', 'update'), divisionsController.updateDivisions);

module.exports = router;
