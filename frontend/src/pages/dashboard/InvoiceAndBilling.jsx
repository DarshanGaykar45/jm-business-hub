import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useBusinessDivision } from '../../context/BusinessDivisionContext';
import api from '../../api/client';
import { useToast } from '../../components/Toast';
import { Receipt, Plus, Search, Printer, DollarSign, CheckCircle2, IndianRupee } from 'lucide-react';
import Modal from '../../components/Modal';

export default function InvoiceAndBilling() {
  const { currentDivision } = useBusinessDivision();
  const toast = useToast();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState(null);

  const [paymentData, setPaymentData] = useState({
    amount: 10000,
    paymentMethod: 'UPI',
    referenceNo: '',
    notes: 'Payment received via phone/QR'
  });

  useEffect(() => {
    fetchInvoices();
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
            Track receivables, outstanding pending balances, and record customer payments.
          </p>
        </div>
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
              ) : invoices.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-500">No invoices issued yet.</td></tr>
              ) : (
                invoices.map((inv) => (
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
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
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
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
                <p className="text-xs text-slate-600">Shriram Chowk, Pathre Budruk, Tal. Sinnar, Dist. Nashik</p>
                <p className="text-xs text-slate-600">GSTIN: [[GSTIN_PENDING]]</p>
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
                  <span className="font-mono text-emerald-600">₹{previewInvoice.total.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Amount Paid:</span>
                  <span className="font-mono">₹{previewInvoice.amountPaid.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-bold text-amber-600">
                  <span>Pending Due:</span>
                  <span className="font-mono">₹{previewInvoice.amountPending.toLocaleString('en-IN')}</span>
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
