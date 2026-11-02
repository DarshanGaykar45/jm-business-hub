import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '../../api/client';
import { useToast } from '../../components/Toast';
import {
  Building2, Save, CheckCircle2, RefreshCw, Palette, Layers,
  Wrench, Sun, Truck, Info
} from 'lucide-react';
import Badge from '../../components/Badge';

export default function BusinessDivisionMgmt() {
  const toast = useToast();

  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDivisions();
  }, []);

  const fetchDivisions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/divisions');
      setDivisions(res.data.divisions || []);
    } catch (err) {
      console.error('Failed to load divisions:', err);
      toast.error('Failed to load business division profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (index, field, value) => {
    setDivisions(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/divisions', { divisions });
      toast.success('Business division configurations updated successfully!');
    } catch (err) {
      toast.error('Failed to update business divisions');
    } finally {
      setSaving(false);
    }
  };

  const getDivisionIcon = (key) => {
    switch (key) {
      case 'construction':
        return <Wrench className="w-5 h-5 text-amber-400" />;
      case 'solar':
        return <Sun className="w-5 h-5 text-amber-400" />;
      default:
        return <Truck className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Helmet>
        <title>Business Divisions Management | JM Business Hub</title>
      </Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Business Divisions Management</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Configure branding, division taglines, themes, and operational division profiles under Jay Malhar Samuha.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-navy-950 font-semibold rounded-xl text-sm shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading divisions configuration...</div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {divisions.map((div, idx) => (
              <div
                key={div.key || idx}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-slate-700 transition-all"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-slate-800 border border-slate-700">
                      {getDivisionIcon(div.key)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{div.shortName || div.name}</h3>
                      <span className="text-[10px] text-slate-500 font-mono">{div.key}</span>
                    </div>
                  </div>
                  <span
                    className="w-4 h-4 rounded-full border border-slate-700 flex-shrink-0"
                    style={{ backgroundColor: div.color || '#f59e0b' }}
                  />
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Division Full Name</label>
                    <input
                      type="text"
                      value={div.name || ''}
                      onChange={(e) => handleFieldChange(idx, 'name', e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Display Short Name</label>
                    <input
                      type="text"
                      value={div.shortName || ''}
                      onChange={(e) => handleFieldChange(idx, 'shortName', e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Tagline</label>
                    <textarea
                      rows={2}
                      value={div.tagline || ''}
                      onChange={(e) => handleFieldChange(idx, 'tagline', e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Accent Theme Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={div.color || '#f59e0b'}
                        onChange={(e) => handleFieldChange(idx, 'color', e.target.value)}
                        className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={div.color || '#f59e0b'}
                        onChange={(e) => handleFieldChange(idx, 'color', e.target.value)}
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono uppercase focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-400" />
              Changes saved here propagate immediately across dashboard filter headers and document letterheads.
            </span>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-navy-950 font-semibold rounded-lg transition-colors"
            >
              {saving ? 'Saving...' : 'Apply Division Updates'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
