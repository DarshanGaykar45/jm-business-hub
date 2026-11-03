import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useBusinessDivision } from '../../context/BusinessDivisionContext';
import api from '../../api/client';
import { useToast } from '../../components/Toast';
import { Receipt, Plus, Search, Printer, DollarSign, CheckCircle2, IndianRupee, Trash2, X } from 'lucide-react';
import Modal from '../../components/Modal';

export default function InvoiceAndBilling() {
  const { currentDivision } = useBusinessDivision();
  const toast = useToast();

  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState(null);
  const [search, setSearch] = useState('');

  const [paymentData, setPaymentData] = useState({
    amount: 10000,
    paymentMethod: 'UPI',
    referenceNo: '',
    notes: 'Payment received via phone/QR'
  });

  const [createFormData, setCreateFormData] = useState({
    customerId: '',
    businessDivision: currentDivision !== 'all' ? currentDivision : 'construction',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    taxRate: 18,
    discount: 0,
    notes: 'Payment due within 15 days. Jay Malhar Udyog Samuha, Sinnar, Nashik.',
    items: [
      { description: 'Crushed Stone Aggregate 20mm Supply (Nashik Site)', quantity: 15, unit: 'Brass', unitPrice: 3400 }
    ]
  });

  useEffect(() => {
    fetchInvoices();
    fetchCustomers();
  }, [currentDivision]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const params = {};
      if (currentDivision !== 'all') params.division = currentDivision;
      const res = await api.get('/invoices', { params });
      setInvoices(res.data.invoices || []);
    } catch (err) {
      console.error('Failed to load invoices:', err);
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers');
      const custs = res.data.customers || [];
      setCustomers(custs);
      if (custs.length > 0 && !createFormData.customerId) {
        setCreateFormData(prev => ({ ...prev, customerId: custs[0].id }));
      }
    } catch (e) {
      console.error('Failed to load customers:', e);
    }
  };

  const handleAddItem = () => {
    setCreateFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unit: 'Units', unitPrice: 1000 }]
    }));
  };

  const handleRemoveItem = (index) => {
    if (createFormData.items.length <= 1) return;
    setCreateFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...createFormData.items];
    updated[index][field] = field === 'quantity' || field === 'unitPrice' ? Number(value) : value;
    setCreateFormData({ ...createFormData, items: updated });
  };

  const calculateSubtotal = () => {
    return createFormData.items.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unitPrice || 0)), 0);
  };
  const subtotal = calculateSubtotal();
  const taxAmount = (subtotal * (createFormData.taxRate || 0)) / 100;
  const grandTotal = Math.max(0, subtotal + taxAmount - (createFormData.discount || 0));

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    if (!createFormData.customerId) {
      toast.error('Please select a customer');
      return;
    }
    try {
      await api.post('/invoices', createFormData);
      toast.success('Tax Invoice issued successfully!');
      setIsCreateModalOpen(false);
      fetchInvoices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create invoice');
    }
  };

  const handleDeleteInvoice = async (id, invoiceNumber) => {
    if (!window.confirm(`Are you sure you want to cancel and delete invoice ${invoiceNumber}?`)) return;
    try {
      await api.delete(`/invoices/${id}`);
      toast.success(`Invoice ${invoiceNumber} cancelled and removed.`);
      fetchInvoices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete invoice');
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    try {
      await api.post(`/invoices/${selectedInvoice.id}/payment`, {
        ...paymentData,
        amount: Number(paymentData.amount)
      });
      toast.success('Payment recorded successfully!');
      setIsPaymentModalOpen(false);
      fetchInvoices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record payment');
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const q = search.toLowerCase();
    return inv.invoiceNumber?.toLowerCase().includes(q) ||
      inv.customer?.name?.toLowerCase().includes(q) ||
      inv.businessDivision?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Invoices & Billing — JM Business Hub</title>
      </Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Receipt className="w-6 h-6 text-amber-400" />
            <span>Tax Invoices & Billing</span>
          </h1>
          <p className="text-sm text-slate-400">
            Track receivables, outstanding pending balances, GST invoicing, and customer payments across Nashik region.
          </p>
        </div>

        <button
          onClick={() => { fetchCustomers(); setIsCreateModalOpen(true); }}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center gap-2 text-sm shadow-lg shadow-amber-500/20 transition active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Invoice</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search invoice number, client..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Invoice Number</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Division</th>
                <th className="px-6 py-4">Total Amount</th>
                <th className="px-6 py-4">Paid / Pending</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-500">Loading invoices...</td></tr>
              ) : filteredInvoices.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-500">No invoices found.</td></tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/30 transition">
                    <td className="px-6 py-4 font-mono font-bold text-amber-400 text-base">
                      {inv.invoiceNumber}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-white">{inv.customer?.name}</div>
                      <div className="text-xs font-mono text-slate-500">{inv.customer?.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="capitalize text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {inv.businessDivision}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-white text-base">
                      ₹{(inv.total || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono">
                      <div className="text-emerald-400 font-bold">Paid: ₹{(inv.amountPaid || 0).toLocaleString('en-IN')}</div>
                      <div className="text-amber-400 font-bold">Due: ₹{(inv.amountPending || 0).toLocaleString('en-IN')}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        inv.paymentStatus === 'Paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : inv.paymentStatus === 'Partially Paid' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : 'bg-red-500/10 text-red-400 border border-red-500/30'
                      }`}>
                        {inv.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => setPreviewInvoice(inv)}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition"
                        title="Print / View"
                      >
                        <Printer className="w-3.5 h-3.5 inline mr-1" />
                        <span>Print</span>
                      </button>
                      {inv.paymentStatus !== 'Paid' && (
                        <button
                          onClick={() => {
                            setSelectedInvoice(inv);
                            setPaymentData({ ...paymentData, amount: inv.amountPending });
                            setIsPaymentModalOpen(true);
                          }}
                          className="px-3 py-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 rounded-lg text-xs font-bold transition"
                        >
                          Record Payment
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteInvoice(inv.id, inv.invoiceNumber)}
                        className="p-1.5 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 rounded-lg transition inline-flex items-center"
                        title="Cancel & Delete Invoice"
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

      {/* Create Invoice Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Issue Tax Invoice">
        <form onSubmit={handleCreateInvoice} className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Customer / Client *</label>
              <select
                required
                value={createFormData.customerId}
                onChange={(e) => setCreateFormData({ ...createFormData, customerId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.phone || c.city || 'Nashik'})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Business Division</label>
              <select
                value={createFormData.businessDivision}
                onChange={(e) => setCreateFormData({ ...createFormData, businessDivision: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="construction">Jay Malhar Construction Equipments</option>
                <option value="solar">Sundatta Renewables</option>
                <option value="suppliers">Jay Malhar Suppliers & Traders</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Invoice Date</label>
              <input
                type="date"
                required
                value={createFormData.date}
                onChange={(e) => setCreateFormData({ ...createFormData, date: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Due Date</label>
              <input
                type="date"
                value={createFormData.dueDate}
                onChange={(e) => setCreateFormData({ ...createFormData, dueDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-wider text-amber-400">Line Items & Billables</label>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Item
              </button>
            </div>

            {createFormData.items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 p-2 bg-slate-950 rounded-xl border border-slate-800 items-center">
                <div className="col-span-12 sm:col-span-5">
                  <input
                    type="text"
                    required
                    placeholder="Item description (e.g. 20mm Blue Metal Supply)"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div className="col-span-4 sm:col-span-2">
                  <input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div className="col-span-4 sm:col-span-2">
                  <input
                    type="text"
                    placeholder="Unit (Brass/Days/Sets)"
                    value={item.unit}
                    onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div className="col-span-3 sm:col-span-2">
                  <input
                    type="number"
                    min="0"
                    placeholder="Rate ₹"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div className="col-span-1 text-right">
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                    disabled={createFormData.items.length <= 1}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing summary */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">GST Tax Rate (%)</label>
              <input
                type="number"
                value={createFormData.taxRate}
                onChange={(e) => setCreateFormData({ ...createFormData, taxRate: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Discount (₹)</label>
              <input
                type="number"
                value={createFormData.discount}
                onChange={(e) => setCreateFormData({ ...createFormData, discount: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal:</span>
              <span className="font-mono text-white">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>GST ({createFormData.taxRate}%):</span>
              <span className="font-mono text-white">₹{taxAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-amber-400 pt-1 border-t border-slate-800">
              <span>Grand Total:</span>
              <span className="font-mono">₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Terms & Notes</label>
            <textarea
              rows={2}
              value={createFormData.notes}
              onChange={(e) => setCreateFormData({ ...createFormData, notes: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition"
            >
              Generate Tax Invoice
            </button>
          </div>
        </form>
      </Modal>

      {/* Record Payment Modal */}
      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title={`Record Payment: ${selectedInvoice?.invoiceNumber}`}>
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs flex justify-between">
            <span className="text-slate-400">Total Outstanding Balance:</span>
            <span className="font-mono font-bold text-amber-400 text-sm">₹{selectedInvoice?.amountPending?.toLocaleString('en-IN')}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Amount Received (₹) *</label>
              <input
                type="number"
                required
                min={1}
                max={selectedInvoice?.amountPending}
                value={paymentData.amount}
                onChange={(e) => setPaymentData({ ...paymentData, amount: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Payment Method</label>
              <select
                value={paymentData.paymentMethod}
                onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="UPI">UPI</option>
                <option value="NEFT/RTGS">NEFT / RTGS</option>
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">UPI Ref / Cheque No.</label>
            <input
              type="text"
              placeholder="e.g. UPI-2026-987654"
              value={paymentData.referenceNo}
              onChange={(e) => setPaymentData({ ...paymentData, referenceNo: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm">Save Payment</button>
          </div>
        </form>
      </Modal>

      {/* Invoice Printable View */}
      {previewInvoice && (
        <Modal isOpen={!!previewInvoice} onClose={() => setPreviewInvoice(null)} title={`Tax Invoice: ${previewInvoice.invoiceNumber}`}>
          <div className="space-y-6 text-slate-800 bg-white p-8 rounded-xl print:m-0" id="invoice-print-sheet">
            <div className="flex justify-between items-start border-b border-slate-200 pb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-950">Jay Malhar Udyog Samuha</h2>
                <p className="text-xs text-slate-600">Shriram Chowk, Pathre Budruk, Tal. Sinnar, Dist. Nashik - 422102</p>
                <p className="text-xs text-slate-600">GSTIN: 27AABPJ9876C1Z5 | Ph: +91 98220 12345</p>
              </div>
              <div className="text-right">
                <span className="text-lg font-black font-mono text-emerald-600">{previewInvoice.invoiceNumber}</span>
                <p className="text-xs text-slate-500">Invoice Date: {new Date(previewInvoice.date).toLocaleDateString('en-IN')}</p>
              </div>
            </div>

            <div>
              <span className="text-xs uppercase font-bold text-slate-400">Billed To:</span>
              <h4 className="text-lg font-bold text-slate-900">{previewInvoice.customer?.name}</h4>
              <p className="text-xs text-slate-600">Phone: {previewInvoice.customer?.phone}</p>
              <p className="text-xs text-slate-600">{previewInvoice.customer?.address || 'Site'}</p>
            </div>

            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 uppercase">
                <tr>
                  <th className="p-3">Item Description</th>
                  <th className="p-3">Qty</th>
                  <th className="p-3">Rate</th>
                  <th className="p-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {previewInvoice.items?.map((item, idx) => (
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
                  <span className="font-mono text-emerald-600">₹{previewInvoice.total?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Amount Paid:</span>
                  <span className="font-mono">₹{previewInvoice.amountPaid?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-bold text-amber-600">
                  <span>Pending Due:</span>
                  <span className="font-mono">₹{previewInvoice.amountPending?.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print Tax Invoice</span>
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
