import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useBusinessDivision } from '../../context/BusinessDivisionContext';
import api from '../../api/client';
import { useToast } from '../../components/Toast';
import { Wrench, Plus, Search, CheckCircle, AlertCircle, IndianRupee } from 'lucide-react';
import Modal from '../../components/Modal';

export default function EquipmentManagement() {
  const { currentDivision } = useBusinessDivision();
  const toast = useToast();

  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    equipmentId: '',
    category: 'Compactor',
    businessDivision: 'construction',
    status: 'Available',
    rentalRatePerDay: 1500,
    condition: 'Excellent',
    notes: ''
  });

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
      fetchEquipment();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add equipment');
    }
  };

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
            Tamping rammers, vibratory plate compactors, road rollers, and excavators.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center gap-2 text-sm shadow-lg shadow-amber-500/20 transition active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Register Equipment</span>
        </button>
      </div>

      {/* Fleet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 text-center py-12 text-slate-500">Loading equipment fleet...</div>
        ) : equipment.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-slate-500">No equipment in registry.</div>
        ) : (
          equipment.map((eq) => (
            <div key={eq.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
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
                {eq.notes && <p className="text-xs text-slate-400 leading-relaxed">{eq.notes}</p>}

                {eq.rentals && eq.rentals.length > 0 && (
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                    <span className="text-slate-500 block">Currently Hired By:</span>
                    <span className="text-white font-bold">{eq.rentals[0]?.customer?.name || 'Client'}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 block">Daily Tariff</span>
                  <span className="font-mono font-bold text-amber-400 text-base">₹{eq.rentalRatePerDay}/day</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Equipment Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Register Equipment">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Equipment Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Tamping Rammer"
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
                placeholder="e.g. TR-002"
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
                <option value="Rammer">Rammer</option>
                <option value="Roller">Roller</option>
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
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm shadow-md">Save Machine</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
