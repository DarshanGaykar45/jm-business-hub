const express = require('express');
const router = express.Router();
const publicController = require('../controllers/public.controller');

router.post('/leads', publicController.submitLead);
router.get('/company-info', publicController.getCompanyInfo);
router.get('/stats', publicController.getPublicStats);

module.exports = router;
