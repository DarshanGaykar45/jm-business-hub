import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useBusinessDivision } from '../../context/BusinessDivisionContext';
import api from '../../api/client';
import { useToast } from '../../components/Toast';
import {
  FolderLock, Upload, Download, Trash2, Search, FileText,
  FileCheck, Shield, File, Filter, Plus, Clock, HardDrive
} from 'lucide-react';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import Badge from '../../components/Badge';
import StatCard from '../../components/StatCard';

const CATEGORIES = [
  'Contracts',
  'Compliance',
  'Quotations',
  'Invoices',
  'Technical',
  'Vehicle',
  'Identity'
];

export default function DocumentVault() {
  const { currentDivision } = useBusinessDivision();
  const toast = useToast();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [deleteDocId, setDeleteDocId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [uploadData, setUploadData] = useState({
    originalName: '',
    category: 'Contracts',
    businessDivision: currentDivision !== 'all' ? currentDivision : 'group',
    mimeType: 'application/pdf',
    sampleContent: ''
  });

  useEffect(() => {
    fetchDocuments();
  }, [currentDivision]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (currentDivision !== 'all') params.division = currentDivision;
      const res = await api.get('/documents', { params });
      setDocuments(res.data.documents || []);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const sizeBytes = uploadData.sampleContent ? uploadData.sampleContent.length : 2048;
      await api.post('/documents', {
        ...uploadData,
        sizeBytes
      });
      toast.success('Document uploaded securely to private vault!');
      setIsUploadModalOpen(false);
      setUploadData({
        originalName: '',
        category: 'Contracts',
        businessDivision: currentDivision !== 'all' ? currentDivision : 'group',
        mimeType: 'application/pdf',
        sampleContent: ''
      });
      fetchDocuments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload document');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = async (doc) => {
    try {
      toast.info(`Preparing ${doc.originalName}...`);
      const response = await api.get(`/documents/${doc.id}/download`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: doc.mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.originalName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Download started');
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Failed to download document');
    }
  };

  const handleDelete = async () => {
    if (!deleteDocId) return;
    try {
      await api.delete(`/documents/${deleteDocId}`);
      toast.success('Document deleted successfully');
      setDeleteDocId(null);
      fetchDocuments();
    } catch (err) {
      toast.error('Failed to delete document');
    }
  };

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.originalName.toLowerCase().includes(search.toLowerCase()) ||
      (doc.uploadedBy && doc.uploadedBy.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = categoryFilter === 'all' || doc.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const totalSize = documents.reduce((acc, d) => acc + (d.sizeBytes || 0), 0);
  const formattedSize = (totalSize / 1024).toFixed(1) + ' KB';

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Document Vault | JM Business Hub</title>
      </Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Secure Document Vault</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Encrypted, role-restricted repository for legal deeds, permits, tax registrations, and warranties.
          </p>
        </div>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-navy-950 font-semibold rounded-xl text-sm shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
        >
          <Upload className="w-4 h-4" />
          Upload Document
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Documents"
          value={documents.length}
          subtitle="Vault files"
          icon={FolderLock}
          trend={0}
        />
        <StatCard
          title="Contracts & Deeds"
          value={documents.filter(d => d.category === 'Contracts').length}
          subtitle="Agreements & MoUs"
          icon={FileCheck}
          trend={0}
        />
        <StatCard
          title="Compliance & Tax"
          value={documents.filter(d => d.category === 'Compliance').length}
          subtitle="GST, PAN, RERA & Permits"
          icon={Shield}
          trend={0}
        />
        <StatCard
          title="Vault Storage"
          value={formattedSize}
          subtitle="Encrypted partition"
          icon={HardDrive}
          trend={0}
        />
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents or uploaders..."
            className="w-full bg-slate-800/80 border border-slate-700/80 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-800/80 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-400">Loading vault documents...</div>
        ) : filteredDocs.length === 0 ? (
          <div className="text-center py-16">
            <FolderLock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-300">No documents found</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              Store business contracts, equipment registration papers, and solar subsidies safely.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-xs text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-3.5">Document Name</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Division</th>
                  <th className="px-6 py-3.5">Size</th>
                  <th className="px-6 py-3.5">Uploaded By</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-amber-400" />
                      </div>
                      <span className="truncate max-w-[220px]">{doc.originalName}</span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="info">{doc.category}</Badge>
                    </td>
                    <td className="px-6 py-4 text-xs capitalize text-slate-400">
                      {doc.businessDivision}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-400">
                      {formatFileSize(doc.sizeBytes)}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {doc.uploadedBy || 'System'}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDownload(doc)}
                          className="p-1.5 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-lg transition-colors"
                          title="Download Document"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteDocId(doc.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="Delete Document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Document to Vault"
      >
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Document Title / File Name *</label>
            <input
              type="text"
              required
              value={uploadData.originalName}
              onChange={(e) => setUploadData({ ...uploadData, originalName: e.target.value })}
              placeholder="e.g. GST-Registration-Nashik.pdf"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
              <select
                value={uploadData.category}
                onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Business Division</label>
              <select
                value={uploadData.businessDivision}
                onChange={(e) => setUploadData({ ...uploadData, businessDivision: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="group">Group Corporate (All)</option>
                <option value="construction">Jay Malhar Construction</option>
                <option value="solar">Sundatta Renewables</option>
                <option value="suppliers">Jay Malhar Traders</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Document Content / Certificate Details</label>
            <textarea
              rows={4}
              value={uploadData.sampleContent}
              onChange={(e) => setUploadData({ ...uploadData, sampleContent: e.target.value })}
              placeholder="Paste text contents, legal terms, registration numbers, or certificate notes..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono text-xs"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Note: Files are stored outside the public web root in encrypted backend vault storage.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(false)}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-navy-950 font-semibold rounded-lg text-sm transition-colors"
            >
              {submitting ? 'Uploading...' : 'Upload to Vault'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={!!deleteDocId}
        onClose={() => setDeleteDocId(null)}
        onConfirm={handleDelete}
        title="Delete Document"
        message="Are you sure you want to delete this document from the vault? This action cannot be undone."
      />
    </div>
  );
}
