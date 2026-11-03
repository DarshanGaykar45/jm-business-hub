const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notifications.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', notificationsController.getNotifications);
router.patch('/:id/read', notificationsController.markAsRead);
router.put('/:id/read', notificationsController.markAsRead);
router.post('/mark-all-read', notificationsController.markAllAsRead);
router.post('/read-all', notificationsController.markAllAsRead);
router.delete('/:id', notificationsController.deleteNotification);

module.exports = router;
