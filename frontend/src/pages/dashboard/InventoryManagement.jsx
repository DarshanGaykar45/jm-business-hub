import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useBusinessDivision } from '../../context/BusinessDivisionContext';
import api from '../../api/client';
import { useToast } from '../../components/Toast';
import { Package, Plus, ArrowDownLeft, ArrowUpRight, Sliders, History, AlertTriangle, Search } from 'lucide-react';
import Modal from '../../components/Modal';

export default function InventoryManagement() {
  const { currentDivision } = useBusinessDivision();
  const toast = useToast();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isStockInModalOpen, setIsStockInModalOpen] = useState(false);
  const [isStockOutModalOpen, setIsStockOutModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);
  const [txns, setTxns] = useState([]);
  const [actionQty, setActionQty] = useState(10);
  const [actionReason, setActionReason] = useState('');

  const [newItem, setNewItem] = useState({
    name: '',
    category: 'Aggregates',
    businessDivision: 'suppliers',
    quantity: 50,
    unit: 'Tons',
    purchasePrice: 1800,
    sellingPrice: 2400,
    supplier: 'Jay Malhar Quarry Unit',
    minStockLevel: 10
  });

  useEffect(() => {
    fetchInventory();
  }, [currentDivision, search, lowStockOnly]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const params = {};
      if (currentDivision !== 'all') params.division = currentDivision;
      if (search) params.search = search;
      if (lowStockOnly) params.lowStock = 'true';
      const res = await api.get('/inventory', { params });
      setItems(res.data.items || []);
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/inventory', {
        ...newItem,
        quantity: Number(newItem.quantity),
        purchasePrice: Number(newItem.purchasePrice),
        sellingPrice: Number(newItem.sellingPrice),
        minStockLevel: Number(newItem.minStockLevel)
      });
      toast.success('Inventory item created successfully!');
      setIsAddModalOpen(false);
      fetchInventory();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create inventory item');
    }
  };

  const handleStockIn = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;
    try {
      await api.post(`/inventory/${selectedItem.id}/stock-in`, {
        quantity: Number(actionQty),
        reason: actionReason || 'Stock In Purchase Receipt'
      });
      toast.success(`Received ${actionQty} ${selectedItem.unit} of ${selectedItem.name}`);
      setIsStockInModalOpen(false);
      fetchInventory();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Stock-in failed');
    }
  };

  const handleStockOut = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;
    try {
      await api.post(`/inventory/${selectedItem.id}/stock-out`, {
        quantity: Number(actionQty),
        reason: actionReason || 'Stock Out Dispatch'
      });
      toast.success(`Dispatched ${actionQty} ${selectedItem.unit} of ${selectedItem.name}`);
      setIsStockOutModalOpen(false);
      fetchInventory();
    } catch (err) {
      // Handles 400 negative stock guard
      const msg = err.response?.data?.message || 'Stock-out rejected';
      toast.error(msg);
    }
  };

  const handleAdjust = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;
    try {
      await api.post(`/inventory/${selectedItem.id}/adjust`, {
        newQuantity: Number(actionQty),
        reason: actionReason
      });
      toast.success(`Quantity for ${selectedItem.name} updated to ${actionQty} ${selectedItem.unit}`);
      setIsAdjustModalOpen(false);
      fetchInventory();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Manual adjust failed');
    }
  };

  const openHistory = async (item) => {
    setSelectedItem(item);
    setIsHistoryModalOpen(true);
    try {
      const res = await api.get(`/inventory/${item.id}/transactions`);
      setTxns(res.data.transactions || []);
    } catch (e) {
      toast.error('Failed to load transaction history');
    }
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Inventory Management — JM Business Hub</title>
      </Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-amber-400" />
            <span>Inventory & Stock Management</span>
          </h1>
          <p className="text-sm text-slate-400">
            Quarry aggregates, sand, solar modules, inverters, and machine replacement components.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center gap-2 text-sm shadow-lg shadow-amber-500/20 transition active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Stock Item</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search items by name, category, supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        <div className="flex items-center gap-3 text-xs">
          <button
            onClick={() => setLowStockOnly(!lowStockOnly)}
            className={`px-3 py-1.5 rounded-lg border font-bold flex items-center gap-1.5 transition ${
              lowStockOnly
                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Low Stock Filter</span>
          </button>
          <span className="text-slate-500">Total: <strong className="text-white">{items.length}</strong> items</span>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Item Name & Category</th>
                <th className="px-6 py-4">Division</th>
                <th className="px-6 py-4">Current Stock</th>
                <th className="px-6 py-4">Buy / Sell Rate</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">Loading inventory items...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">No inventory items found.</td></tr>
              ) : (
                items.map((item) => {
                  const isLow = item.quantity <= item.minStockLevel;
                  return (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition">
                      <td className="px-6 py-4">
                        <div className="font-bold text-white text-base">{item.name}</div>
                        <div className="text-xs text-slate-500">{item.category} • Supplier: {item.supplier || 'In-House'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="capitalize text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {item.businessDivision}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-mono font-bold text-white text-base">
                          {item.quantity} <span className="text-xs font-normal text-slate-400">{item.unit}</span>
                        </div>
                        <div className="text-[11px] text-slate-500">Min: {item.minStockLevel} {item.unit}</div>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono">
                        <div>Buy: ₹{(item.purchasePrice || 0).toLocaleString('en-IN')}</div>
                        <div className="text-emerald-400">Sell: ₹{(item.sellingPrice || 0).toLocaleString('en-IN')}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          isLow
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {isLow ? 'LOW STOCK' : 'IN STOCK'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => { setSelectedItem(item); setActionQty(10); setIsStockInModalOpen(true); }}
                          className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 rounded-lg text-xs font-bold transition"
                          title="Stock In (Receive)"
                        >
                          + In
                        </button>
                        <button
                          onClick={() => { setSelectedItem(item); setActionQty(5); setIsStockOutModalOpen(true); }}
                          className="px-2.5 py-1 bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/30 rounded-lg text-xs font-bold transition"
                          title="Stock Out (Issue / Sell)"
                        >
                          - Out
                        </button>
                        <button
                          onClick={() => { setSelectedItem(item); setActionQty(item.quantity); setIsAdjustModalOpen(true); }}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                          title="Manual Adjust"
                        >
                          <Sliders className="w-3.5 h-3.5 inline" />
                        </button>
                        <button
                          onClick={() => openHistory(item)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                          title="History"
                        >
                          <History className="w-3.5 h-3.5 inline" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock In Modal */}
      <Modal isOpen={isStockInModalOpen} onClose={() => setIsStockInModalOpen(false)} title={`Stock In: ${selectedItem?.name}`}>
        <form onSubmit={handleStockIn} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Quantity to Receive ({selectedItem?.unit}) *
            </label>
            <input
              type="number"
              required
              min={1}
              value={actionQty}
              onChange={(e) => setActionQty(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Reason / Purchase Reference</label>
            <input
              type="text"
              placeholder="e.g. Purchase order delivery from quarry"
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setIsStockInModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm">Receive Stock</button>
          </div>
        </form>
      </Modal>

      {/* Stock Out Modal (STRICT NEGATIVE CHECK) */}
      <Modal isOpen={isStockOutModalOpen} onClose={() => setIsStockOutModalOpen(false)} title={`Stock Out: ${selectedItem?.name}`}>
        <form onSubmit={handleStockOut} className="space-y-4">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400">Available in stock: </span>
            <span className="font-mono font-bold text-white">{selectedItem?.quantity} {selectedItem?.unit}</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Quantity to Dispatch ({selectedItem?.unit}) *
            </label>
            <input
              type="number"
              required
              min={1}
              value={actionQty}
              onChange={(e) => setActionQty(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Dispatch Reason / Customer</label>
            <input
              type="text"
              placeholder="e.g. Dispatch for site foundation contractor"
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setIsStockOutModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-sm">Dispatch</button>
          </div>
        </form>
      </Modal>

      {/* Adjust Modal */}
      <Modal isOpen={isAdjustModalOpen} onClose={() => setIsAdjustModalOpen(false)} title={`Manual Adjust: ${selectedItem?.name}`}>
        <form onSubmit={handleAdjust} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">New Verified Quantity *</label>
            <input
              type="number"
              required
              min={0}
              value={actionQty}
              onChange={(e) => setActionQty(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Mandatory Audit Reason *</label>
            <textarea
              required
              rows={2}
              placeholder="e.g. Physical inventory count correction after monthly yard audit"
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setIsAdjustModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-sm">Confirm Adjustment</button>
          </div>
        </form>
      </Modal>

      {/* Transaction History Modal */}
      <Modal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} title={`Stock History: ${selectedItem?.name}`}>
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {txns.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">No transactions recorded yet.</div>
          ) : (
            txns.map((t) => (
              <div key={t.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className={`font-bold uppercase px-2 py-0.5 rounded text-[10px] ${
                    t.type === 'STOCK_IN' ? 'bg-emerald-500/20 text-emerald-400'
                    : t.type === 'STOCK_OUT' ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-purple-500/20 text-purple-400'
                  }`}>
                    {t.type}
                  </span>
                  <p className="text-slate-300 mt-1">{t.reason}</p>
                  <div className="text-[10px] text-slate-500">By: {t.performedBy} • {new Date(t.createdAt).toLocaleString('en-IN')}</div>
                </div>
                <div className="text-right font-mono">
                  <div className="font-bold text-white text-sm">
                    {t.type === 'STOCK_IN' ? `+${t.quantity}` : t.type === 'STOCK_OUT' ? `-${t.quantity}` : `${t.quantity}`}
                  </div>
                  <div className="text-[10px] text-slate-400">{t.balanceBefore} ➔ {t.balanceAfter}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>

      {/* Add Item Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Inventory Item">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Item Name *</label>
              <input
                type="text"
                required
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Category *</label>
              <input
                type="text"
                required
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Division</label>
              <select
                value={newItem.businessDivision}
                onChange={(e) => setNewItem({ ...newItem, businessDivision: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="suppliers">Suppliers</option>
                <option value="solar">Solar</option>
                <option value="construction">Construction</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Initial Quantity *</label>
              <input
                type="number"
                required
                min={0}
                value={newItem.quantity}
                onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Unit of Measure *</label>
              <input
                type="text"
                required
                value={newItem.unit}
                onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Purchase Price (₹)</label>
              <input
                type="number"
                value={newItem.purchasePrice}
                onChange={(e) => setNewItem({ ...newItem, purchasePrice: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Selling Price (₹)</label>
              <input
                type="number"
                value={newItem.sellingPrice}
                onChange={(e) => setNewItem({ ...newItem, sellingPrice: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Min Stock Threshold</label>
              <input
                type="number"
                value={newItem.minStockLevel}
                onChange={(e) => setNewItem({ ...newItem, minStockLevel: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm shadow-md">Add Item</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
