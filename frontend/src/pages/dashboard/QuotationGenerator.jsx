import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useBusinessDivision } from '../../context/BusinessDivisionContext';
import api from '../../api/client';
import { useToast } from '../../components/Toast';
import { FileText, Plus, Search, Trash2, Printer, ArrowRight, CheckCircle2, IndianRupee } from 'lucide-react';
import Modal from '../../components/Modal';

export default function QuotationGenerator() {
  const { currentDivision } = useBusinessDivision();
  const toast = useToast();

  const [quotations, setQuotations] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [previewQuote, setPreviewQuote] = useState(null);

  const [formData, setFormData] = useState({
    customerId: '',
    businessDivision: 'construction',
    date: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    taxRate: 18,
    discount: 0,
    terms: 'Valid for 15 days. Payment: 50% advance, balance upon completion.',
    items: [
      { description: 'Tamping Rammer (TR-001) Rental', quantity: 3, unit: 'Days', unitPrice: 1200 }
    ]
  });

  useEffect(() => {
    fetchQuotations();
    fetchCustomers();
  }, [currentDivision]);

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const params = {};
      if (currentDivision !== 'all') params.division = currentDivision;
      const res = await api.get('/quotations', { params });
      setQuotations(res.data.quotations || []);
    } catch (err) {
      console.error('Failed to load quotations:', err);
      toast.error('Failed to load quotations');
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
    } catch (e) {}
  };

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unit: 'Units', unitPrice: 1000 }]
    }));
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...formData.items];
    updated[index][field] = field === 'quantity' || field === 'unitPrice' ? Number(value) : value;
    setFormData({ ...formData, items: updated });
  };

  const subtotal = formData.items.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unitPrice || 0)), 0);
  const taxAmount = (subtotal * (formData.taxRate || 0)) / 100;
  const grandTotal = Math.max(0, subtotal + taxAmount - (formData.discount || 0));

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/quotations', formData);
      toast.success('Quotation generated successfully!');
      setIsAddModalOpen(false);
      fetchQuotations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create quotation');
    }
  };

  const handleConvertToInvoice = async (quoteId) => {
    try {
      const res = await api.post(`/quotations/${quoteId}/convert-to-invoice`);
      toast.success(res.data.message || 'Quotation converted to Invoice!');
      fetchQuotations();
    } catch (err) {
      toast.error('Failed to convert quotation');
    }
  };

  const handleDeleteQuotation = async (id, quotationNumber) => {
    if (!window.confirm(`Are you sure you want to delete quotation ${quotationNumber}?`)) return;
    try {
      await api.delete(`/quotations/${id}`);
      toast.success(`Quotation ${quotationNumber} deleted successfully.`);
      fetchQuotations();
    } catch (err) {
      toast.error('Failed to delete quotation');
    }
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Quotation Generator — JM Business Hub</title>
      </Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-amber-400" />
            <span>Quotation Generator</span>
          </h1>
          <p className="text-sm text-slate-400">
            Generate formal estimates, calculate GST, print/preview PDFs, and convert to invoices in one click.
          </p>
        </div>

        <button
          onClick={() => { fetchCustomers(); setIsAddModalOpen(true); }}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center gap-2 text-sm shadow-lg shadow-amber-500/20 transition active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Quotation</span>
        </button>
      </div>

      {/* Quotations List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Quote Number</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Division</th>
                <th className="px-6 py-4">Date / Validity</th>
                <th className="px-6 py-4">Grand Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-500">Loading quotations...</td></tr>
              ) : quotations.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-500">No quotations generated yet.</td></tr>
              ) : (
                quotations.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-800/30 transition">
                    <td className="px-6 py-4 font-mono font-bold text-amber-400 text-base">
                      {q.quotationNumber}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-white">{q.customer?.name}</div>
                      <div className="text-xs font-mono text-slate-500">{q.customer?.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="capitalize text-xs font-semibold px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {q.businessDivision}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono">
                      <div>Date: {new Date(q.date).toLocaleDateString('en-IN')}</div>
                      <div className="text-slate-500">Valid: {new Date(q.validUntil).toLocaleDateString('en-IN')}</div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-white text-base">
                      ₹{(q.grandTotal || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        q.status === 'Converted' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                      }`}>
                        {q.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => setPreviewQuote(q)}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
                        title="Print Preview"
                      >
                        <Printer className="w-3.5 h-3.5 inline mr-1" />
                        <span>Print</span>
                      </button>
                      {q.status !== 'Converted' && (
                        <button
                          onClick={() => handleConvertToInvoice(q.id)}
                          className="px-3 py-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 rounded-lg text-xs font-bold transition"
                        >
                          Convert to Invoice
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteQuotation(q.id, q.quotationNumber)}
                        className="p-1.5 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 rounded-lg transition inline-flex items-center"
                        title="Delete Quotation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Quotation Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Generate Formal Quotation">
        <form onSubmit={handleCreate} className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Customer / Client *</label>
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
              <label className="block text-xs font-medium text-slate-400 mb-1">Division</label>
              <select
                value={formData.businessDivision}
                onChange={(e) => setFormData({ ...formData, businessDivision: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="construction">Construction Equipments</option>
                <option value="solar">Sundatta Renewables</option>
                <option value="suppliers">Suppliers & Traders</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Valid Until</label>
              <input
                type="date"
                required
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Line Items</span>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
              >
                + Add Item
              </button>
            </div>

            {formData.items.map((item, idx) => (
              <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 grid grid-cols-12 gap-2 items-center">
                <div className="col-span-5">
                  <input
                    type="text"
                    required
                    placeholder="Description / Product"
                    value={item.description}
                    onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="text"
                    value={item.unit}
                    onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    min={0}
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div className="col-span-1 text-center">
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="text-red-400 hover:text-red-300 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Taxes & Totals */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">GST Tax Rate (%)</label>
              <input
                type="number"
                value={formData.taxRate}
                onChange={(e) => setFormData({ ...formData, taxRate: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Discount (₹)</label>
              <input
                type="number"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal:</span>
              <span className="font-mono text-white">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>GST ({formData.taxRate}%):</span>
              <span className="font-mono text-white">₹{taxAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-white pt-1 border-t border-slate-800">
              <span>Grand Total:</span>
              <span className="font-mono text-amber-400">₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm shadow-md">Create Quotation</button>
          </div>
        </form>
      </Modal>

      {/* Printable Preview Modal */}
      {previewQuote && (
        <Modal isOpen={!!previewQuote} onClose={() => setPreviewQuote(null)} title={`Quotation: ${previewQuote.quotationNumber}`}>
          <div className="space-y-6 text-slate-800 bg-white p-8 rounded-xl print:m-0" id="quotation-print-sheet">
            <div className="flex justify-between items-start border-b border-slate-200 pb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-950">Jay Malhar Udyog Samuha</h2>
                <p className="text-xs text-slate-600">Shriram Chowk, Pathre Budruk, Tal. Sinnar, Dist. Nashik</p>
                <p className="text-xs text-slate-600">Phone: 9096547260 / 9158494138</p>
              </div>
              <div className="text-right">
                <span className="text-lg font-black font-mono text-amber-600">{previewQuote.quotationNumber}</span>
                <p className="text-xs text-slate-500">Date: {new Date(previewQuote.date).toLocaleDateString('en-IN')}</p>
                <p className="text-xs text-slate-500">Valid Until: {new Date(previewQuote.validUntil).toLocaleDateString('en-IN')}</p>
              </div>
            </div>

            <div>
              <span className="text-xs uppercase font-bold text-slate-400">Quotation For:</span>
              <h4 className="text-lg font-bold text-slate-900">{previewQuote.customer?.name}</h4>
              <p className="text-xs text-slate-600">Phone: {previewQuote.customer?.phone}</p>
              <p className="text-xs text-slate-600">{previewQuote.customer?.address || 'Site Location'}</p>
            </div>

            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 uppercase">
                <tr>
                  <th className="p-3">Description</th>
                  <th className="p-3">Qty</th>
                  <th className="p-3">Rate</th>
                  <th className="p-3 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {previewQuote.items?.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-3 font-semibold text-slate-900">{item.description}</td>
                    <td className="p-3">{item.quantity} {item.unit}</td>
                    <td className="p-3">₹{item.unitPrice.toLocaleString('en-IN')}</td>
                    <td className="p-3 text-right font-mono font-bold">₹{item.lineTotal.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end pt-2">
              <div className="w-64 space-y-1.5 text-xs">
                <div className="flex justify-between font-bold text-slate-900 text-sm border-t border-slate-300 pt-2">
                  <span>Grand Total:</span>
                  <span className="font-mono text-amber-600">₹{previewQuote.grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {previewQuote.terms && (
              <div className="p-3 bg-slate-50 rounded border border-slate-200 text-[11px] text-slate-600">
                <strong>Terms & Conditions:</strong> {previewQuote.terms}
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print to PDF / Paper</span>
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
