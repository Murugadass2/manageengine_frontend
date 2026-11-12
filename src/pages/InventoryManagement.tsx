import React, { useState, useEffect } from 'react';
import { inventoryApi } from '../services/api';
import { InventoryItem } from '../types';
import { Boxes, Plus, ArrowDownLeft, ArrowUpRight, AlertTriangle, CheckCircle, Package } from 'lucide-react';

export const InventoryManagement: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [adjustType, setAdjustType] = useState<'STOCK_IN' | 'STOCK_OUT'>('STOCK_IN');
  const [adjustQty, setAdjustQty] = useState('10');
  const [adjustNotes, setAdjustNotes] = useState('');

  // Add Item Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [itemCode, setItemCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('IT');
  const [stockQuantity, setStockQuantity] = useState('50');
  const [minLevel, setMinLevel] = useState('20');
  const [supplier, setSupplier] = useState('');

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const data = await inventoryApi.getAll();
      setItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !adjustQty) return;
    try {
      await inventoryApi.adjustStock(selectedItem.id, {
        type: adjustType,
        quantity: parseInt(adjustQty),
        notes: adjustNotes || 'Routine stock operation',
      });
      setShowAdjustModal(false);
      setAdjustNotes('');
      loadInventory();
    } catch (err: any) {
      alert(err.message || 'Stock adjustment failed');
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemCode || !name) return;
    try {
      await inventoryApi.create({
        itemCode,
        name,
        category,
        stockQuantity: parseInt(stockQuantity),
        minLevel: parseInt(minLevel),
        supplier,
      });
      setShowAddModal(false);
      setItemCode('');
      setName('');
      loadInventory();
    } catch (err: any) {
      alert('Error creating inventory item. Code must be unique.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-serif font-bold text-navy-950 tracking-wide">
            Inventory & Spare Parts
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track hotel consumables, replacement hardware, maintenance parts, and stock thresholds
          </p>
        </div>
        <button
          onClick={() => {
            const nextCode = `INV-${(1001 + items.length).toString()}`;
            setItemCode(nextCode);
            setShowAddModal(true);
          }}
          className="px-4 py-2 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Item</span>
        </button>
      </div>

      {/* Inventory Table (Matching Mockup Panel 8: Inventory) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-bold">Item Code</th>
                <th className="py-3 px-4 font-bold">Item Name</th>
                <th className="py-3 px-4 font-bold">Category</th>
                <th className="py-3 px-4 font-bold">Stock</th>
                <th className="py-3 px-4 font-bold">Min Level</th>
                <th className="py-3 px-4 font-bold">Supplier</th>
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 font-bold">Adjust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-navy-950">{item.itemCode}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                        <Package className="w-3.5 h-3.5" />
                      </div>
                      <span>{item.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">{item.category}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-navy-950">
                    {item.stockQuantity} {item.unit}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-500">{item.minLevel} {item.unit}</td>
                  <td className="py-3.5 px-4 text-slate-600">{item.supplier || 'Hotel Stores'}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        item.status === 'IN_STOCK'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : item.status === 'LOW_STOCK'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-rose-100 text-rose-700 border border-rose-300'
                      }`}
                    >
                      {item.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setShowAdjustModal(true);
                      }}
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-gold-50 hover:text-gold-700 text-slate-700 font-bold text-xs transition-colors"
                    >
                      Stock In / Out
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Adjust Stock */}
      {showAdjustModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-navy-950 mb-1">Adjust Inventory Stock</h3>
            <p className="text-xs text-slate-500 mb-4">
              {selectedItem.name} (Current: {selectedItem.stockQuantity} {selectedItem.unit})
            </p>
            <form onSubmit={handleAdjustSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Transaction Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType('STOCK_IN')}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all flex items-center justify-center gap-1.5 ${
                      adjustType === 'STOCK_IN'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                    <span>Stock In (Receipt)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('STOCK_OUT')}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all flex items-center justify-center gap-1.5 ${
                      adjustType === 'STOCK_OUT'
                        ? 'bg-rose-600 text-white border-rose-600 shadow'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>Stock Out (Issue)</span>
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Remarks / Reference</label>
                <input
                  type="text"
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  placeholder="e.g. Issued for Room 205 maintenance work"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-navy-900 text-gold-400 font-bold text-xs rounded-lg"
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Item */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-navy-950 mb-1">Add New Inventory Item</h3>
            <p className="text-xs text-slate-500 mb-4">Register spare part or consumable item</p>
            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Item Code</label>
                <input
                  type="text"
                  value={itemCode}
                  onChange={(e) => setItemCode(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono font-bold"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Item Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Cat6 Network Cable (10m)"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-medium"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="IT">IT Support</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="ELECTRICAL">Electrical</option>
                    <option value="PLUMBING">Plumbing</option>
                    <option value="HOUSEKEEPING">Housekeeping</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Initial Stock</label>
                  <input
                    type="number"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Min Alert Level</label>
                  <input
                    type="number"
                    value={minLevel}
                    onChange={(e) => setMinLevel(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Supplier</label>
                  <input
                    type="text"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    placeholder="e.g. Schneider Electric"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-navy-900 text-gold-400 font-bold text-xs rounded-lg"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
