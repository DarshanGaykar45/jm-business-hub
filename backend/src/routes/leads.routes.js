const express = require('express');
const router = express.Router();
const leadsController = require('../controllers/leads.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/permissions');

router.use(authenticate);

router.get('/', authorize('leads', 'read'), leadsController.getLeads);
router.post('/', authorize('leads', 'create'), leadsController.createLead);
router.put('/:id', authorize('leads', 'update'), leadsController.updateLead);
router.patch('/:id', authorize('leads', 'update'), leadsController.updateLead);
router.delete('/:id', authorize('leads', 'delete'), leadsController.deleteLead);
router.post('/:id/convert', authorize('leads', 'update'), leadsController.convertLeadToCustomer);

module.exports = router;
