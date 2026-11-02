const express = require('express');
const router = express.Router();
const tasksController = require('../controllers/tasks.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', tasksController.getTasks);
router.post('/', tasksController.createTask);
router.patch('/:id/status', tasksController.updateTaskStatus);

module.exports = router;
