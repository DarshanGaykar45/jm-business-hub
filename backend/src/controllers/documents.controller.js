const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const prisma = require('../config/db');
const { logAudit } = require('../utils/audit');

const STORAGE_DIR = path.join(__dirname, '../../storage/private-documents');

// Ensure directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

/**
 * Get all document metadata
 */
async function getDocuments(req, res) {
  try {
    const { division, category } = req.query;
    const where = { deletedAt: null };
    if (division && division !== 'all') where.businessDivision = division;
    if (category && category !== 'all') where.category = category;

    const documents = await prisma.document.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ success: true, count: documents.length, documents });
  } catch (error) {
    console.error('Get Documents Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to retrieve documents' });
  }
}

/**
 * Upload a document metadata / file
 */
async function createDocument(req, res) {
  try {
    const { originalName, category, businessDivision, mimeType, sizeBytes, relatedEntityType, relatedEntityId, sampleContent } = req.body;

    const storedFilename = `${uuidv4()}.bin`;
    const fullPath = path.join(STORAGE_DIR, storedFilename);

    // Write file content safely outside web root
    fs.writeFileSync(fullPath, sampleContent || `Jay Malhar Secure Document: ${originalName}\nCreated at: ${new Date().toISOString()}`);

    const doc = await prisma.document.create({
      data: {
        originalName: originalName || 'Untitled Document.pdf',
        storedFilename,
        mimeType: mimeType || 'application/pdf',
        sizeBytes: parseInt(sizeBytes) || 1024,
        category: category || 'Contracts',
        businessDivision: businessDivision || 'group',
        relatedEntityType: relatedEntityType || null,
        relatedEntityId: relatedEntityId || null,
        uploadedBy: req.user.name || req.user.email
      }
    });

    await logAudit({
      actorUserId: req.user.id,
      action: 'DOCUMENT_UPLOAD',
      entityType: 'Document',
      entityId: doc.id,
      afterJson: { id: doc.id, name: doc.originalName },
      req
    });

    return res.status(201).json({ success: true, document: doc });
  } catch (error) {
    console.error('Create Document Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to create document record' });
  }
}

/**
 * Securely stream document after auth & permission checks
 */
async function downloadDocument(req, res) {
  try {
    const { id } = req.params;
    const doc = await prisma.document.findUnique({ where: { id } });

    if (!doc || doc.deletedAt) {
      return res.status(404).json({ error: 'NotFound', message: 'Document not found or inaccessible.' });
    }

    const filePath = path.join(STORAGE_DIR, doc.storedFilename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'FileNotFound', message: 'Physical file not found in secure vault.' });
    }

    await logAudit({
      actorUserId: req.user.id,
      action: 'DOCUMENT_DOWNLOAD',
      entityType: 'Document',
      entityId: id,
      afterJson: { name: doc.originalName },
      req
    });

    res.setHeader('Content-Type', doc.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${doc.originalName}"`);
    return fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    console.error('Download Document Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to stream document' });
  }
}

/**
 * Delete document (Soft-delete)
 */
async function deleteDocument(req, res) {
  try {
    const { id } = req.params;
    const existing = await prisma.document.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'NotFound', message: 'Document not found' });

    await prisma.document.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    await logAudit({
      actorUserId: req.user.id,
      action: 'DOCUMENT_DELETE',
      entityType: 'Document',
      entityId: id,
      beforeJson: existing,
      req
    });

    return res.json({ success: true, message: 'Document removed from secure vault' });
  } catch (error) {
    console.error('Delete Document Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to delete document' });
  }
}

module.exports = {
  getDocuments,
  createDocument,
  downloadDocument,
  deleteDocument
};
