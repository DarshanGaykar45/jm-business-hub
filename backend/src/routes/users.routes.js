const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/permissions');

router.use(authenticate);

router.get('/', authorize('users', 'read'), usersController.getUsers);
router.post('/', authorize('users', 'create'), usersController.createUser);
router.patch('/:id/status', authorize('users', 'update'), usersController.toggleUserStatus);
router.get('/audit-logs', authorize('audit_logs', 'read'), usersController.getAuditLogs);

module.exports = router;
