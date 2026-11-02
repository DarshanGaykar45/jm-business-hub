const express = require('express');
const router = express.Router();
const customersController = require('../controllers/customers.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/permissions');

router.use(authenticate);

router.get('/', authorize('customers', 'read'), customersController.getCustomers);
router.get('/:id', authorize('customers', 'read'), customersController.getCustomerById);
router.post('/', authorize('customers', 'create'), customersController.createCustomer);
router.put('/:id', authorize('customers', 'update'), customersController.updateCustomer);

module.exports = router;
