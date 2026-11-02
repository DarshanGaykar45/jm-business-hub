const express = require('express');
const router = express.Router();
const financeController = require('../controllers/finance.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/permissions');

router.use(authenticate);

router.get('/summary', authorize('financials', 'read'), financeController.getFinancialSummary);

router.get('/income', authorize('financials', 'read'), financeController.getIncomes);
router.post('/income', authorize('financials', 'create'), financeController.createIncome);
router.delete('/income/:id', authorize('financials', 'delete'), financeController.deleteIncome);

router.get('/expenses', authorize('financials', 'read'), financeController.getExpenses);
router.post('/expenses', authorize('financials', 'create'), financeController.createExpense);
router.delete('/expenses/:id', authorize('financials', 'delete'), financeController.deleteExpense);

module.exports = router;
