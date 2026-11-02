const express = require('express');
const router = express.Router();
const leadsController = require('../controllers/leads.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/permissions');

router.use(authenticate);

router.get('/', authorize('leads', 'read'), leadsController.getLeads);
router.patch('/:id', authorize('leads', 'update'), leadsController.updateLead);
router.post('/:id/convert', authorize('leads', 'update'), leadsController.convertLeadToCustomer);

module.exports = router;
