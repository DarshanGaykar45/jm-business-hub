const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reports.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/permissions');

router.use(authenticate);

router.get('/financial', authorize('reports', 'read'), reportsController.getFinancialReport);
router.get('/lead-funnel', authorize('reports', 'read'), reportsController.getLeadFunnel);
router.get('/inventory', authorize('reports', 'read'), reportsController.getInventoryReport);

module.exports = router;
