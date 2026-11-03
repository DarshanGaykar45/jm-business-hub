import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useBusinessDivision } from '../../context/BusinessDivisionContext';
import api from '../../api/client';
import { useToast } from '../../components/Toast';
import { Sun, Plus, Search, Phone, Calendar, ArrowRight, CheckCircle2, UserPlus, MessageSquare, Trash2, Clock, MapPin } from 'lucide-react';
import Modal from '../../components/Modal';

export default function LeadManagement() {
  const { currentDivision } = useBusinessDivision();
  const toast = useToast();

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  const initialAddForm = {
    name: '',
    phone: '',
    email: '',
    businessDivision: 'solar',
    requirement: '',
    preferredTime: 'Morning 10 AM',
    source: 'Direct Phone Inquiry',
    status: 'NEW',
    notes: 'Inquiry from Nashik area'
  };

  const [newLeadData, setNewLeadData] = useState(initialAddForm);
  const [updateStatus, setUpdateStatus] = useState('CONTACTED');
  const [updateNotes, setUpdateNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  useEffect(() => {
    fetchLeads();
  }, [currentDivision, search, statusFilter]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = {};
      if (currentDivision !== 'all') params.division = currentDivision;
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;
      const res = await api.get('/leads', { params });
      setLeads(res.data.leads || []);
    } catch (err) {
      console.error('Failed to fetch leads:', err);
      toast.error('Failed to load leads CRM');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();
    try {
      await api.post('/leads', newLeadData);
      toast.success('New customer lead registered successfully!');
      setIsAddModalOpen(false);
      setNewLeadData(initialAddForm);
      fetchLeads();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create lead');
    }
  };

  const handleOpenUpdate = (lead) => {
    setSelectedLead(lead);
    setUpdateStatus(lead.status);
    setUpdateNotes(lead.notes || '');
    setFollowUpDate(lead.followUpDate ? lead.followUpDate.split('T')[0] : '');
    setIsUpdateModalOpen(true);
  };

  const handleSaveUpdate = async (e) => {
    e.preventDefault();
    if (!selectedLead) return;
    try {
      await api.put(`/leads/${selectedLead.id}`, {
        status: updateStatus,
        notes: updateNotes,
        followUpDate: followUpDate || null
      });
      toast.success('Lead updated successfully!');
      setIsUpdateModalOpen(false);
      fetchLeads();
    } catch (err) {
      toast.error('Could not update lead');
    }
  };

  const handleConvert = async (leadId) => {
    try {
      const res = await api.post(`/leads/${leadId}/convert`);
      toast.success(res.data.message || 'Lead converted to customer successfully!');
      fetchLeads();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to convert lead');
    }
  };

  const handleDeleteLead = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete lead from "${name}"?`)) return;
    try {
      await api.delete(`/leads/${id}`);
      toast.success('Lead deleted successfully');
      fetchLeads();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete lead');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'NEW':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">NEW INQUIRY</span>;
      case 'CONTACTED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">CONTACTED</span>;
      case 'QUOTED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">QUOTED</span>;
      case 'WON':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">WON / CUSTOMER</span>;
      case 'LOST':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/30">LOST</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-300">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Leads CRM — JM Business Hub</title>
      </Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sun className="w-6 h-6 text-amber-400" />
            <span>Leads & Inquiry CRM</span>
          </h1>
          <p className="text-sm text-slate-400">
            Real-time inquiries captured across Nashik, Sinnar, Satpur, and Gangapur Road.
          </p>
        </div>

        <button
          onClick={() => { setNewLeadData(initialAddForm); setIsAddModalOpen(true); }}
          className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl flex items-center gap-2 text-sm shadow-lg shadow-amber-500/20 transition active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Lead</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search leads by client name, phone, requirement..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Statuses</option>
            <option value="NEW">New Inquiries</option>
            <option value="CONTACTED">Contacted</option>
            <option value="QUOTED">Quoted</option>
            <option value="WON">Won / Customer</option>
            <option value="LOST">Lost</option>
          </select>
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">
            Total: <strong className="text-white">{leads.length}</strong> leads
          </span>
        </div>
      </div>

      {/* Leads List / Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-slate-500 bg-slate-900/60 rounded-2xl border border-slate-800">
            Loading leads...
          </div>
        ) : leads.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-slate-900/60 rounded-2xl border border-slate-800">
            No leads found for this query. Click "Add New Lead" above to create one.
          </div>
        ) : (
          leads.map((lead) => (
            <div
              key={lead.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 shadow-xl transition space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center font-bold text-amber-400">
                    {lead.name[0]?.toUpperCase() || 'L'}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base leading-tight">{lead.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span className="capitalize text-amber-300 font-semibold">{lead.businessDivision}</span>
                      <span>•</span>
                      <span>Source: {lead.source || 'Website'}</span>
                      <span>•</span>
                      <span>{new Date(lead.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {getStatusBadge(lead.status)}
                </div>
              </div>

              {/* Requirement & Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="md:col-span-2 space-y-2">
                  <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80">
                    <span className="text-slate-500 font-semibold block mb-1">Requirement:</span>
                    <p className="text-slate-200 text-sm leading-relaxed">{lead.requirement}</p>
                  </div>
                  {lead.notes && (
                    <p className="text-slate-400 italic">Notes: {lead.notes}</p>
                  )}
                </div>

                <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 space-y-2 font-mono">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Phone className="w-3.5 h-3.5 text-amber-400" />
                    <a href={`tel:${lead.phone}`} className="hover:underline font-bold text-white">{lead.phone}</a>
                  </div>
                  {lead.email && (
                    <div className="truncate text-slate-400">{lead.email}</div>
                  )}
                  {lead.preferredTime && (
                    <div className="text-[11px] text-slate-500">Pref. Time: {lead.preferredTime}</div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenUpdate(lead)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                    <span>Update Status & Notes</span>
                  </button>

                  {lead.status !== 'WON' && (
                    <button
                      onClick={() => handleConvert(lead.id)}
                      className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Convert to Customer</span>
                    </button>
                  )}
                </div>

                <button
                  onClick={() => handleDeleteLead(lead.id, lead.name)}
                  className="p-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-300 border border-red-800/40 rounded-lg transition"
                  title="Delete Lead"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Lead Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Register Customer Lead">
        <form onSubmit={handleCreateLead} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Customer Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Sunil Vasantrao Gite"
                value={newLeadData.name}
                onChange={(e) => setNewLeadData({ ...newLeadData, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                placeholder="e.g. 9850112233"
                value={newLeadData.phone}
                onChange={(e) => setNewLeadData({ ...newLeadData, phone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
              <input
                type="email"
                placeholder="sunil@example.com"
                value={newLeadData.email}
                onChange={(e) => setNewLeadData({ ...newLeadData, email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Business Division</label>
              <select
                value={newLeadData.businessDivision}
                onChange={(e) => setNewLeadData({ ...newLeadData, businessDivision: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="solar">Sundatta Renewables (Solar)</option>
                <option value="construction">Construction Equipment</option>
                <option value="suppliers">Suppliers & Traders</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Inquiry / Requirement Details *</label>
            <textarea
              rows={3}
              required
              placeholder="e.g. PM Surya Ghar 3kW solar installation at Gangapur Road, Nashik."
              value={newLeadData.requirement}
              onChange={(e) => setNewLeadData({ ...newLeadData, requirement: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Lead Source</label>
              <input
                type="text"
                placeholder="e.g. Direct Call, WhatsApp, Site Visit"
                value={newLeadData.source}
                onChange={(e) => setNewLeadData({ ...newLeadData, source: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Initial Status</label>
              <select
                value={newLeadData.status}
                onChange={(e) => setNewLeadData({ ...newLeadData, status: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="NEW">NEW</option>
                <option value="CONTACTED">CONTACTED</option>
                <option value="QUOTED">QUOTED</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm shadow-md transition"
            >
              Save Lead
            </button>
          </div>
        </form>
      </Modal>

      {/* Update Status Modal */}
      <Modal isOpen={isUpdateModalOpen} onClose={() => setIsUpdateModalOpen(false)} title={`Update Lead: ${selectedLead?.name}`}>
        <form onSubmit={handleSaveUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
            <select
              value={updateStatus}
              onChange={(e) => setUpdateStatus(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            >
              <option value="NEW">NEW</option>
              <option value="CONTACTED">CONTACTED</option>
              <option value="QUOTED">QUOTED</option>
              <option value="WON">WON</option>
              <option value="LOST">LOST</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Follow-up Date</label>
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Follow-up Notes / Remarks</label>
            <textarea
              rows={3}
              value={updateNotes}
              onChange={(e) => setUpdateNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 resize-none"
              placeholder="Record discussion details with customer..."
            />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsUpdateModalOpen(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm shadow-md transition"
            >
              Update Lead
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
