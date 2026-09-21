const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const dashboardController = require('../controllers/dashboard.controller');

// All dashboard routes require authentication
router.use(authenticate);

router.get('/summary', dashboardController.getSummary);

module.exports = router;
