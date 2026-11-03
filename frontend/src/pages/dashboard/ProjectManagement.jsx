import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useBusinessDivision } from '../../context/BusinessDivisionContext';
import api from '../../api/client';
import { useToast } from '../../components/Toast';
import { FolderKanban, Plus, Search, MapPin, Calendar, Users, IndianRupee, Trash2, Edit2, CheckCircle2 } from 'lucide-react';
import Modal from '../../components/Modal';

export default function ProjectManagement() {
  const { currentDivision } = useBusinessDivision();
  const toast = useToast();

  const [projects, setProjects] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const initialForm = {
    name: '',
    businessDivision: 'construction',
    customerId: '',
    location: 'Nashik, Maharashtra',
    startDate: new Date().toISOString().split('T')[0],
    deadline: '',
    budget: 150000,
    amountReceived: 50000,
    progress: 25,
    status: 'Ongoing',
    materialsUsed: '',
    notes: ''
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchProjects();
    fetchCustomers();
  }, [currentDivision, search]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = {};
      if (currentDivision !== 'all') params.division = currentDivision;
      if (search) params.search = search;
      const res = await api.get('/projects', { params });
      setProjects(res.data.projects || []);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers');
      setCustomers(res.data.customers || []);
      if (res.data.customers?.length > 0 && !formData.customerId) {
        setFormData(prev => ({ ...prev, customerId: res.data.customers[0].id }));
      }
    } catch (e) {
      // non-blocking
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', {
        ...formData,
        budget: Number(formData.budget),
        amountReceived: Number(formData.amountReceived),
        progress: Number(formData.progress)
      });
      toast.success('Project created successfully!');
      setIsAddModalOpen(false);
      setFormData(initialForm);
      fetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    }
  };

  const handleEditClick = (proj) => {
    setSelectedProject(proj);
    setFormData({
      name: proj.name,
      businessDivision: proj.businessDivision,
      customerId: proj.customerId,
      location: proj.location || '',
      startDate: proj.startDate ? proj.startDate.split('T')[0] : '',
      deadline: proj.deadline ? proj.deadline.split('T')[0] : '',
      budget: proj.budget || 0,
      amountReceived: proj.amountReceived || 0,
      progress: proj.progress || 0,
      status: proj.status || 'Ongoing',
      materialsUsed: proj.materialsUsed || '',
      notes: proj.notes || ''
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedProject) return;
    try {
      await api.put(`/projects/${selectedProject.id}`, {
        ...formData,
        budget: Number(formData.budget),
        amountReceived: Number(formData.amountReceived),
        progress: Number(formData.progress)
      });
      toast.success('Project details updated successfully!');
      setIsEditModalOpen(false);
      setSelectedProject(null);
      setFormData(initialForm);
      fetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update project');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete project "${name}"?`)) return;
    try {
      await api.delete(`/projects/${id}`);
      toast.success(`Project "${name}" deleted.`);
      fetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete project');
    }
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Project Management — JM Business Hub</title>
      </Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-amber-400" />
            <span>Project Management</span>
          </h1>
          <p className="text-sm text-slate-400">
            Track site compaction contracts, solar rooftop installations, and bulk material projects across Nashik.
          </p>
        </div>

        <button
          onClick={() => { setFormData(initialForm); setIsAddModalOpen(true); }}
          className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl flex items-center gap-2 text-sm shadow-lg shadow-amber-500/20 transition active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by project name, location, customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition"
          />
        </div>
        <div className="text-xs text-slate-400 font-medium">
          Total: <span className="text-white font-bold">{projects.length}</span> projects
        </div>
      </div>

      {/* Projects Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 text-center py-12 text-slate-500">Loading project records...</div>
        ) : projects.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-slate-500">No active projects found. Click "New Project" to add.</div>
        ) : (
          projects.map((proj) => (
            <div key={proj.id} className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 space-y-4 shadow-xl flex flex-col justify-between transition">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded uppercase bg-slate-800 text-amber-400 border border-slate-700">
                    {proj.businessDivision}
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    proj.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : proj.status === 'Ongoing' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  }`}>
                    {proj.status}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white leading-snug">{proj.name}</h3>

                <div className="text-xs text-slate-400 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span>{proj.location}</span>
                  </div>
                  <div>Client: <span className="text-white font-semibold">{proj.customer?.name || 'Walk-in Client'}</span></div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1 pt-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Progress</span>
                    <span className="text-amber-400 font-bold">{proj.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${proj.progress}%` }}
                    />
                  </div>
                </div>

                {/* Budget & Pending */}
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-500 block">Total Budget</span>
                    <span className="font-mono font-bold text-white">₹{(proj.budget || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Pending</span>
                    <span className="font-mono font-bold text-amber-400">₹{(proj.amountPending || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 text-[11px] text-slate-500 flex justify-between items-center border-t border-slate-800/80">
                <span>Start: {new Date(proj.startDate).toLocaleDateString('en-IN')}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditClick(proj)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition"
                    title="Edit Project"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(proj.id, proj.name)}
                    className="p-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-300 border border-red-800/40 rounded-lg transition"
                    title="Delete Project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Project Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create New Project">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Project Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Musalgaon MIDC Industrial Sub-base Compaction"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Customer *</label>
              <select
                required
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Division *</label>
              <select
                value={formData.businessDivision}
                onChange={(e) => setFormData({ ...formData, businessDivision: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="construction">Construction Equipments</option>
                <option value="solar">Solar Division</option>
                <option value="suppliers">Suppliers & Traders</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Nashik Site Location *</label>
              <input
                type="text"
                required
                placeholder="e.g. Musalgaon MIDC, Sinnar, Nashik"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Planned">Planned</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Total Budget (₹) *</label>
              <input
                type="number"
                required
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Amount Received (₹)</label>
              <input
                type="number"
                value={formData.amountReceived}
                onChange={(e) => setFormData({ ...formData, amountReceived: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Progress (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm hover:bg-slate-700 transition">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm shadow-md transition">Create Project</button>
          </div>
        </form>
      </Modal>

      {/* Edit Project Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit Project: ${selectedProject?.name}`}>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Project Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Nashik Site Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Planned">Planned</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Total Budget (₹)</label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Amount Received (₹)</label>
              <input
                type="number"
                value={formData.amountReceived}
                onChange={(e) => setFormData({ ...formData, amountReceived: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Progress (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Materials Deployed & Site Notes</label>
            <textarea
              rows={2}
              value={formData.materialsUsed}
              onChange={(e) => setFormData({ ...formData, materialsUsed: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm hover:bg-slate-700 transition">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm shadow-md transition">Save Changes</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
