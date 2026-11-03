const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/permissions');

router.use(authenticate);

router.get('/', authorize('settings', 'read'), settingsController.getSettings);
router.put('/', authorize('settings', 'update'), settingsController.updateSetting);
router.post('/', authorize('settings', 'update'), settingsController.updateSetting);
router.post('/reset-demo', authorize('settings', 'update'), settingsController.resetDemoData);

module.exports = router;
