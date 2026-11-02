const express = require('express');
const router = express.Router();
const quotationsController = require('../controllers/quotations.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/permissions');

router.use(authenticate);

router.get('/', authorize('quotations', 'read'), quotationsController.getQuotations);
router.post('/', authorize('quotations', 'create'), quotationsController.createQuotation);
router.post('/:id/convert-to-invoice', authorize('invoices', 'create'), quotationsController.convertToInvoice);

module.exports = router;
