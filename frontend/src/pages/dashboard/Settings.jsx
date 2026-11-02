import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '../../api/client';
import { useToast } from '../../components/Toast';
import {
  Settings as SettingsIcon, Building, Percent, Sun, FileText,
  AlertTriangle, Save, RefreshCw, CheckCircle2, RotateCcw
} from 'lucide-react';
import ConfirmDialog from '../../components/ConfirmDialog';

export default function Settings() {
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Form states
  const [companyInfo, setCompanyInfo] = useState({
    name: 'Jay Malhar Udyog Samuha',
    tagline: 'Building Stronger Foundations. Empowering Greener Futures.',
    proprietor: 'Santosh Vaman Satav',
    headOffice: 'Shriram Chowk, Pathre Budruk, Tal. Sinnar, Dist. Nashik',
    phone1: '9096547260',
    phone2: '9158494138',
    phone3: '7774855520',
    email: 'info@jmbusinesshub.com'
  });

  const [billingConfig, setBillingConfig] = useState({
    taxRate: 18,
    quotationPrefix: 'CONST-Q',
    invoicePrefix: 'CONST-INV'
  });

  const [solarConfig, setSolarConfig] = useState({
    subsidy1kW: 30000,
    subsidy2kW: 60000,
    subsidy3kWPlus: 78000,
    dailyUnitsPerKW: 4.5,
    defaultTariff: 8.5
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/settings');
      const s = res.data.settings || {};
      if (s.companyInfo) {
        setCompanyInfo(prev => ({
          ...prev,
          name: s.companyInfo.groupName || s.companyInfo.name || prev.name,
          tagline: s.companyInfo.tagline || prev.tagline,
          headOffice: s.companyInfo.headOffice || prev.headOffice,
          phone1: s.companyInfo.phones?.[0] || prev.phone1,
          phone2: s.companyInfo.phones?.[1] || prev.phone2,
          email: s.companyInfo.email || prev.email
        }));
      }
      if (s.taxRate !== undefined) setBillingConfig(prev => ({ ...prev, taxRate: s.taxRate }));
      if (s.quotationPrefix) setBillingConfig(prev => ({ ...prev, quotationPrefix: s.quotationPrefix }));
      if (s.invoicePrefix) setBillingConfig(prev => ({ ...prev, invoicePrefix: s.invoicePrefix }));
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCompany = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/settings', {
        key: 'companyInfo',
        value: companyInfo,
        category: 'Company'
      });
      toast.success('Company profile updated successfully!');
    } catch (err) {
      toast.error('Failed to save company settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBilling = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await Promise.all([
        api.post('/settings', { key: 'taxRate', value: Number(billingConfig.taxRate), category: 'Billing' }),
        api.post('/settings', { key: 'quotationPrefix', value: billingConfig.quotationPrefix, category: 'Billing' }),
        api.post('/settings', { key: 'invoicePrefix', value: billingConfig.invoicePrefix, category: 'Billing' })
      ]);
      toast.success('Billing parameters updated successfully!');
    } catch (err) {
      toast.error('Failed to save billing configurations');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSolar = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/settings', {
        key: 'solarConfig',
        value: solarConfig,
        category: 'Solar'
      });
      toast.success('Solar subsidy & generation metrics saved!');
    } catch (err) {
      toast.error('Failed to save solar configurations');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDemo = async () => {
    setResetting(true);
    try {
      await api.post('/settings/reset-demo');
      toast.success('Demo transactions, orders, and test leads purged successfully.');
      setIsResetConfirmOpen(false);
    } catch (err) {
      toast.error('Failed to purge demo data');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Helmet>
        <title>System Settings | JM Business Hub</title>
      </Helmet>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">System & Company Settings</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Configure business metadata, GST defaults, Surya Ghar subsidy parameters, and database states.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading system configurations...</div>
      ) : (
        <div className="space-y-6">
          {/* Company Profile Settings */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <Building className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-base font-bold text-white">Company Identity & Location</h3>
                <p className="text-xs text-slate-400">Displayed across all official customer estimates and tax invoices.</p>
              </div>
            </div>

            <form onSubmit={handleSaveCompany} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Business Group Name</label>
                  <input
                    type="text"
                    value={companyInfo.name}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Proprietor Name</label>
                  <input
                    type="text"
                    value={companyInfo.proprietor}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, proprietor: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Head Office Address</label>
                <input
                  type="text"
                  value={companyInfo.headOffice}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, headOffice: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Primary Phone</label>
                  <input
                    type="text"
                    value={companyInfo.phone1}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, phone1: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Secondary Phone</label>
                  <input
                    type="text"
                    value={companyInfo.phone2}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, phone2: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Direct Contact</label>
                  <input
                    type="text"
                    value={companyInfo.phone3}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, phone3: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-navy-950 font-semibold rounded-lg text-sm transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save Company Identity
                </button>
              </div>
            </form>
          </div>

          {/* Tax & Billing Settings */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <Percent className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-base font-bold text-white">Tax & Document Sequence</h3>
                <p className="text-xs text-slate-400">Automated serial numbering and statutory GST rates.</p>
              </div>
            </div>

            <form onSubmit={handleSaveBilling} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Standard GST (%)</label>
                  <input
                    type="number"
                    value={billingConfig.taxRate}
                    onChange={(e) => setBillingConfig({ ...billingConfig, taxRate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Quotation Prefix</label>
                  <input
                    type="text"
                    value={billingConfig.quotationPrefix}
                    onChange={(e) => setBillingConfig({ ...billingConfig, quotationPrefix: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Invoice Prefix</label>
                  <input
                    type="text"
                    value={billingConfig.invoicePrefix}
                    onChange={(e) => setBillingConfig({ ...billingConfig, invoicePrefix: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-navy-950 font-semibold rounded-lg text-sm transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save Billing Rules
                </button>
              </div>
            </form>
          </div>

          {/* PM Surya Ghar Subsidy Settings */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <Sun className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-base font-bold text-white">Sundatta Solar Subsidy Matrix (PM Surya Ghar)</h3>
                <p className="text-xs text-slate-400">Direct-benefit subsidy calculations used in client quotations.</p>
              </div>
            </div>

            <form onSubmit={handleSaveSolar} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">1 kW Subsidy (₹)</label>
                  <input
                    type="number"
                    value={solarConfig.subsidy1kW}
                    onChange={(e) => setSolarConfig({ ...solarConfig, subsidy1kW: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">2 kW Subsidy (₹)</label>
                  <input
                    type="number"
                    value={solarConfig.subsidy2kW}
                    onChange={(e) => setSolarConfig({ ...solarConfig, subsidy2kW: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">3 kW - 10 kW Cap (₹)</label>
                  <input
                    type="number"
                    value={solarConfig.subsidy3kWPlus}
                    onChange={(e) => setSolarConfig({ ...solarConfig, subsidy3kWPlus: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-navy-950 font-semibold rounded-lg text-sm transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save Subsidy Matrix
                </button>
              </div>
            </form>
          </div>

          {/* Danger Zone: Demo Data Purge */}
          <div className="bg-rose-950/20 border border-rose-900/40 rounded-2xl p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-rose-400 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                  Demo Data Flush (Danger Zone)
                </h3>
                <p className="text-xs text-rose-300/80 mt-1 max-w-xl">
                  Permanently purge all preloaded demo inquiries, test invoices, sample rentals, and dummy income entries while preserving users, company configurations, and machinery catalogs.
                </p>
              </div>
              <button
                onClick={() => setIsResetConfirmOpen(true)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl text-xs transition-colors flex items-center gap-1.5 flex-shrink-0"
              >
                <RotateCcw className="w-4 h-4" />
                Purge Demo Records
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Reset Dialog */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleResetDemo}
        title="Confirm Purge of Demo Data"
        message="Are you completely sure? This will delete all demo flagged quotations, invoices, rentals, and transactions. Production users and equipment will remain untouched."
      />
    </div>
  );
}
