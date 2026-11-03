const express = require('express');
const router = express.Router();
const tasksController = require('../controllers/tasks.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', tasksController.getTasks);
router.post('/', tasksController.createTask);
router.put('/:id', tasksController.updateTask);
router.patch('/:id', tasksController.updateTask);
router.patch('/:id/status', tasksController.updateTaskStatus);
router.delete('/:id', tasksController.deleteTask);

module.exports = router;
