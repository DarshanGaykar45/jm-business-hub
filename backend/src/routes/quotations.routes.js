const express = require('express');
const router = express.Router();
const quotationsController = require('../controllers/quotations.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/permissions');

router.use(authenticate);

router.get('/', authorize('quotations', 'read'), quotationsController.getQuotations);
router.post('/', authorize('quotations', 'create'), quotationsController.createQuotation);
router.put('/:id', authorize('quotations', 'update'), quotationsController.updateQuotation);
router.delete('/:id', authorize('quotations', 'delete'), quotationsController.deleteQuotation);
router.post('/:id/convert-to-invoice', authorize('invoices', 'create'), quotationsController.convertToInvoice);

module.exports = router;
