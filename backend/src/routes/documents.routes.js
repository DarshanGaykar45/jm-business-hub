const express = require('express');
const router = express.Router();
const documentsController = require('../controllers/documents.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/permissions');

router.use(authenticate);

router.get('/', authorize('documents', 'read'), documentsController.getDocuments);
router.post('/', authorize('documents', 'create'), documentsController.createDocument);
router.get('/:id/download', authorize('documents', 'read'), documentsController.downloadDocument);
router.delete('/:id', authorize('documents', 'delete'), documentsController.deleteDocument);

module.exports = router;
