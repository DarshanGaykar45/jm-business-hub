const express = require('express');
const router = express.Router();
const employeesController = require('../controllers/employees.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/permissions');

router.use(authenticate);

router.get('/', authorize('employees', 'read'), employeesController.getEmployees);
router.get('/:id', authorize('employees', 'read'), employeesController.getEmployeeById);
router.post('/', authorize('employees', 'create'), employeesController.createEmployee);
router.put('/:id', authorize('employees', 'update'), employeesController.updateEmployee);
router.patch('/:id/deactivate', authorize('employees', 'delete'), employeesController.deactivateEmployee);
router.delete('/:id', authorize('employees', 'delete'), employeesController.deactivateEmployee);

module.exports = router;
