import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useBusinessDivision } from '../../context/BusinessDivisionContext';
import api from '../../api/client';
import { useToast } from '../../components/Toast';
import { Wrench, Plus, Search, CheckCircle, AlertCircle, IndianRupee, Trash2, Edit2, ShieldCheck, Tag } from 'lucide-react';
import Modal from '../../components/Modal';

export default function EquipmentManagement() {
  const { currentDivision } = useBusinessDivision();
  const toast = useToast();

  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEquip, setSelectedEquip] = useState(null);

  const initialForm = {
    name: '',
    equipmentId: '',
    category: 'Compactor',
    businessDivision: 'construction',
    status: 'Available',
    rentalRatePerDay: 2000,
    condition: 'Excellent',
    notes: 'Maintained at Jay Malhar Sinnar workshop'
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchEquipment();
  }, [currentDivision]);

  const fetchEquipment = async () => {
    setLoading(true);
    try {
      const res = await api.get('/equipment');
      setEquipment(res.data.equipment || []);
    } catch (err) {
      console.error('Failed to load equipment:', err);
      toast.error('Failed to load equipment');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/equipment', {
        ...formData,
        rentalRatePerDay: Number(formData.rentalRatePerDay)
      });
      toast.success('Equipment registered in fleet!');
      setIsAddModalOpen(false);
      setFormData(initialForm);
      fetchEquipment();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add equipment');
    }
  };

  const handleEditClick = (eq) => {
    setSelectedEquip(eq);
    setFormData({
      name: eq.name,
      equipmentId: eq.equipmentId,
      category: eq.category,
      businessDivision: eq.businessDivision || 'construction',
      status: eq.status,
      rentalRatePerDay: eq.rentalRatePerDay,
      condition: eq.condition,
      notes: eq.notes || ''
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedEquip) return;
    try {
      await api.put(`/equipment/${selectedEquip.id}`, {
        ...formData,
        rentalRatePerDay: Number(formData.rentalRatePerDay)
      });
      toast.success('Equipment specifications updated successfully!');
      setIsEditModalOpen(false);
      setSelectedEquip(null);
      setFormData(initialForm);
      fetchEquipment();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update equipment');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove machine "${name}" from the fleet?`)) return;
    try {
      await api.delete(`/equipment/${id}`);
      toast.success(`Machine "${name}" removed from registry.`);
      fetchEquipment();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete equipment');
    }
  };

  const filteredEquipment = equipment.filter(eq =>
    eq.name.toLowerCase().includes(search.toLowerCase()) ||
    eq.equipmentId.toLowerCase().includes(search.toLowerCase()) ||
    eq.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Equipment Fleet — JM Business Hub</title>
      </Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Wrench className="w-6 h-6 text-amber-400" />
            <span>Heavy Machinery & Equipment Fleet</span>
          </h1>
          <p className="text-sm text-slate-400">
            Tamping rammers, vibratory plate compactors, road rollers, and excavators in Nashik region.
          </p>
        </div>

        <button
          onClick={() => { setFormData(initialForm); setIsAddModalOpen(true); }}
          className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl flex items-center gap-2 text-sm shadow-lg shadow-amber-500/20 transition active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Equipment</span>
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search fleet by name, machine ID, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition"
          />
        </div>
        <div className="text-xs text-slate-400 font-medium">
          Fleet Count: <strong className="text-white">{equipment.length}</strong> machines
        </div>
      </div>

      {/* Fleet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 text-center py-12 text-slate-500">Loading equipment fleet...</div>
        ) : filteredEquipment.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-slate-500">No equipment in registry. Click "Register New Equipment" to add.</div>
        ) : (
          filteredEquipment.map((eq) => (
            <div key={eq.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl flex flex-col justify-between hover:border-slate-700 transition">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-slate-950 text-amber-400 border border-slate-800">
                    {eq.equipmentId}
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    eq.status === 'Available' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : eq.status === 'Rented' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    : 'bg-red-500/10 text-red-400 border border-red-500/30'
                  }`}>
                    {eq.status}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white">{eq.name}</h3>
                <div className="text-xs text-slate-400">{eq.category} • Condition: <span className="text-slate-200 font-semibold">{eq.condition}</span></div>
                {eq.notes && <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">{eq.notes}</p>}

                {eq.rentals && eq.rentals.length > 0 && (
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                    <span className="text-slate-500 block">Currently Hired By:</span>
                    <span className="text-white font-bold">{eq.rentals[0]?.customer?.name || 'Nashik Client'}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 block">Daily Tariff</span>
                  <span className="font-mono font-bold text-amber-400 text-base">₹{eq.rentalRatePerDay}/day</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditClick(eq)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition"
                    title="Edit Machine Specifications"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(eq.id, eq.name)}
                    className="p-2 bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-300 border border-red-800/40 rounded-lg transition"
                    title="Delete Machine"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Equipment Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Register New Equipment">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Equipment Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Vibratory Soil Compactor 10T"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Machine Code / ID *</label>
              <input
                type="text"
                required
                placeholder="e.g. JM-CMP-005"
                value={formData.equipmentId}
                onChange={(e) => setFormData({ ...formData, equipmentId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Compactor">Compactor</option>
                <option value="Roller">Roller</option>
                <option value="Rammer">Rammer</option>
                <option value="Excavator">Excavator</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Daily Rate (₹) *</label>
              <input
                type="number"
                required
                value={formData.rentalRatePerDay}
                onChange={(e) => setFormData({ ...formData, rentalRatePerDay: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Condition</label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option>Excellent</option>
                <option>Good</option>
                <option>Needs Service</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Initial Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Available">Available</option>
                <option value="Rented">Rented</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Division</label>
              <select
                value={formData.businessDivision}
                onChange={(e) => setFormData({ ...formData, businessDivision: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="construction">Construction Equipment</option>
                <option value="solar">Solar Division</option>
                <option value="suppliers">Suppliers Division</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Technical Specifications / Notes</label>
            <textarea
              rows={2}
              placeholder="e.g. Engine model, fuel capacity, deployment location in Sinnar..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm hover:bg-slate-700 transition">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm shadow-md transition">Save Machine</button>
          </div>
        </form>
      </Modal>

      {/* Edit Equipment Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit Machine: ${selectedEquip?.name}`}>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Equipment Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Daily Rate (₹) *</label>
              <input
                type="number"
                required
                value={formData.rentalRatePerDay}
                onChange={(e) => setFormData({ ...formData, rentalRatePerDay: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Available">Available</option>
                <option value="Rented">Rented</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Unavailable">Unavailable</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Condition</label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option>Excellent</option>
                <option>Good</option>
                <option>Needs Service</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Technical Specifications / Notes</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
