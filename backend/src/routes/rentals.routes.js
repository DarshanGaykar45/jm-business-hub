const express = require('express');
const router = express.Router();
const rentalsController = require('../controllers/rentals.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/permissions');

router.use(authenticate);

router.get('/', authorize('rentals', 'read'), rentalsController.getRentals);
router.post('/', authorize('rentals', 'create'), rentalsController.createRental);
router.put('/:id', authorize('rentals', 'update'), rentalsController.updateRental);
router.patch('/:id', authorize('rentals', 'update'), rentalsController.updateRental);
router.patch('/:id/return', authorize('rentals', 'update'), rentalsController.recordReturn);
router.patch('/:id/payment', authorize('rentals', 'update'), rentalsController.updateRentalPayment);
router.delete('/:id', authorize('rentals', 'delete'), rentalsController.deleteRental);

module.exports = router;
