import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useBusinessDivision } from '../../context/BusinessDivisionContext';
import api from '../../api/client';
import { useToast } from '../../components/Toast';
import { Sun, Search, Phone, Calendar, ArrowRight, CheckCircle2, UserPlus, MessageSquare } from 'lucide-react';
import Modal from '../../components/Modal';

export default function LeadManagement() {
  const { currentDivision } = useBusinessDivision();
  const toast = useToast();

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLead, setSelectedLead] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
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
      await api.patch(`/leads/${selectedLead.id}`, {
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
            Real-time inquiries captured from the public website, calculators, and rental modals.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search leads by customer name, phone, requirement..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1 overflow-x-auto text-xs">
          {['all', 'NEW', 'CONTACTED', 'QUOTED', 'WON', 'LOST'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                statusFilter === st
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Lead Name & Phone</th>
                <th className="px-6 py-4">Division & Source</th>
                <th className="px-6 py-4">Requirement Details</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date & Follow Up</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">Loading leads...</td></tr>
              ) : leads.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">No leads found.</td></tr>
              ) : (
                leads.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-800/30 transition">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white text-base">{l.name}</div>
                      <div className="font-mono text-xs text-amber-400 mt-0.5">{l.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="capitalize text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {l.businessDivision}
                      </span>
                      <div className="text-[11px] text-slate-500 mt-1">{l.source}</div>
                    </td>
                    <td className="px-6 py-4 max-w-xs text-xs text-slate-300">
                      <p className="line-clamp-2">{l.requirement}</p>
                      {l.preferredTime && (
                        <div className="text-[10px] text-slate-500 mt-1">Pref: {l.preferredTime}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        l.status === 'NEW' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30 animate-pulse'
                        : l.status === 'WON' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : l.status === 'QUOTED' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                        : l.status === 'CONTACTED' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : 'bg-red-500/10 text-red-400 border border-red-500/30'
                      }`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-400">
                      <div>Rec: {new Date(l.createdAt).toLocaleDateString('en-IN')}</div>
                      {l.followUpDate && (
                        <div className="text-amber-400 font-bold">F/U: {new Date(l.followUpDate).toLocaleDateString('en-IN')}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenUpdate(l)}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
                      >
                        Update
                      </button>
                      {l.status !== 'WON' && (
                        <button
                          onClick={() => handleConvert(l.id)}
                          className="px-3 py-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 rounded-lg text-xs font-bold transition"
                          title="Convert to Customer"
                        >
                          Convert to Client
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Update Lead Modal */}
      <Modal isOpen={isUpdateModalOpen} onClose={() => setIsUpdateModalOpen(false)} title="Update Lead Lifecycle">
        <form onSubmit={handleSaveUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Lead Status</label>
            <select
              value={updateStatus}
              onChange={(e) => setUpdateStatus(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            >
              <option value="NEW">NEW</option>
              <option value="CONTACTED">CONTACTED</option>
              <option value="QUOTED">QUOTED</option>
              <option value="WON">WON (Won Contract)</option>
              <option value="LOST">LOST (Closed)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Next Follow-up Date</label>
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Internal Conversation Notes</label>
            <textarea
              rows={3}
              value={updateNotes}
              onChange={(e) => setUpdateNotes(e.target.value)}
              placeholder="e.g. Spoke with client, site survey scheduled for Friday morning."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsUpdateModalOpen(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm shadow-md"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
