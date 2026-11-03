const express = require('express');
const router = express.Router();
const invoicesController = require('../controllers/invoices.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/permissions');

router.use(authenticate);

router.get('/', authorize('invoices', 'read'), invoicesController.getInvoices);
router.post('/', authorize('invoices', 'create'), invoicesController.createInvoice);
router.put('/:id', authorize('invoices', 'update'), invoicesController.updateInvoice);
router.delete('/:id', authorize('invoices', 'delete'), invoicesController.deleteInvoice);
router.post('/:id/payment', authorize('invoices', 'update'), invoicesController.recordPayment);

module.exports = router;
