const express = require('express');
const router = express.Router();
const projectsController = require('../controllers/projects.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/permissions');

router.use(authenticate);

router.get('/', authorize('projects', 'read'), projectsController.getProjects);
router.get('/:id', authorize('projects', 'read'), projectsController.getProjectById);
router.post('/', authorize('projects', 'create'), projectsController.createProject);
router.put('/:id', authorize('projects', 'update'), projectsController.updateProject);
router.delete('/:id', authorize('projects', 'delete'), projectsController.deleteProject);

module.exports = router;
