'use client';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { api } from '@/lib/api';
import { InventoryItem } from '@/lib/types';
import { Plus, Search, Download, X, Package, AlertTriangle, Tag, Edit2, Layers } from 'lucide-react';

export default function InventoryPage() {
  const { businessId } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [filterLowStock, setFilterLowStock] = useState(false);

  const [form, setForm] = useState({
    name: '', sku: '', category: '', quantity: '', price: '',
    cost_price: '', selling_price: '', unit: 'pcs', description: '', low_stock_threshold: '10'
  });

  useEffect(() => { if (businessId) loadInventory(); }, [businessId]);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const data = await api.getInventory(businessId!);
      setItems(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true); setError('');
    try {
      const payload = {
        ...form,
        business_id: businessId,
        quantity: parseInt(form.quantity) || 0,
        price: parseFloat(form.price) || 0,
        cost_price: parseFloat(form.cost_price) || 0,
        selling_price: parseFloat(form.selling_price) || 0,
        low_stock_threshold: parseInt(form.low_stock_threshold) || 10,
      };
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://syncommerce.onrender.com/api/v1'}/inventory/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(payload)
      });
      setShowModal(false);
      setForm({ name: '', sku: '', category: '', quantity: '', price: '', cost_price: '', selling_price: '', unit: 'pcs', description: '', low_stock_threshold: '10' });
      loadInventory();
    } catch (err: any) {
      setError('Failed to add item');
    } finally { setSubmitting(false); }
  };

  const lowStockItems = items.filter(i => i.quantity <= (i.low_stock_threshold || 10));
  const filtered = items.filter(i => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase()) || i.category?.toLowerCase().includes(search.toLowerCase()) || i.sku?.toLowerCase().includes(search.toLowerCase());
    return matchSearch && (!filterLowStock || i.quantity <= (i.low_stock_threshold || 10));
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Inventory</h1>
          <p className="text-muted mt-1">{items.length} products tracked</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => api.exportInventory(businessId!).then(d => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([d])); a.download = 'inventory.xlsx'; a.click(); })} className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-white/10 hover:bg-white/10 text-sm font-medium transition-all">
            <Download size={16} /> Export
          </button>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm">
            <Plus size={18} /> Add Item
          </button>
        </div>
      </div>

      {/* Alert for low stock */}
      {lowStockItems.length > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400">
          <AlertTriangle size={20} />
          <span className="text-sm font-medium">{lowStockItems.length} item{lowStockItems.length > 1 ? 's' : ''} running low on stock</span>
          <button onClick={() => setFilterLowStock(!filterLowStock)} className="ml-auto text-xs underline">
            {filterLowStock ? 'Show all' : 'Filter'}
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Products', value: items.length, color: 'text-blue-400' },
          { label: 'Low Stock', value: lowStockItems.length, color: 'text-yellow-400' },
          { label: 'Total Value', value: `₹${items.reduce((s, i) => s + (i.price * i.quantity), 0).toLocaleString()}`, color: 'text-green-400' },
          { label: 'Categories', value: [...new Set(items.map(i => i.category).filter(Boolean))].length, color: 'text-purple-400' },
        ].map(s => (
          <div key={s.label} className="glass rounded-2xl p-4">
            <p className="text-muted text-xs font-medium mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, SKU, or category..." className="w-full glass rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center">
          <Package size={40} className="text-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No items found</h3>
          <p className="text-muted text-sm">Add your first inventory item to get started.</p>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  {['Product', 'SKU', 'Category', 'Qty', 'Price', 'Value', 'Status'].map(h => (
                    <th key={h} className="text-left py-3.5 px-4 text-muted font-medium text-xs uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => {
                  const isLow = item.quantity <= (item.low_stock_threshold || 10);
                  return (
                    <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                            <Package size={16} className="text-blue-400" />
                          </div>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            {item.unit && <p className="text-muted text-xs">per {item.unit}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-muted font-mono text-xs">{item.sku || '—'}</td>
                      <td className="py-3.5 px-4">
                        {item.category ? <span className="px-2 py-0.5 rounded-full bg-white/5 text-xs">{item.category}</span> : '—'}
                      </td>
                      <td className="py-3.5 px-4 font-semibold">{item.quantity}</td>
                      <td className="py-3.5 px-4">₹{item.price?.toLocaleString()}</td>
                      <td className="py-3.5 px-4 font-medium text-green-400">₹{(item.price * item.quantity).toLocaleString()}</td>
                      <td className="py-3.5 px-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${isLow ? 'bg-yellow-500/10 text-yellow-400' : 'bg-green-500/10 text-green-400'}`}>
                          {isLow ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass rounded-3xl w-full max-w-lg p-7 border border-white/10 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Add Inventory Item</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-xl"><X size={20} /></button>
            </div>
            {error && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs text-muted font-medium mb-1.5 block">Product Name *</label>
                  <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Blue T-Shirt" className="w-full glass rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                </div>
                <div>
                  <label className="text-xs text-muted font-medium mb-1.5 block">SKU</label>
                  <input value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} placeholder="SKU-001" className="w-full glass rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                </div>
                <div>
                  <label className="text-xs text-muted font-medium mb-1.5 block">Category</label>
                  <input value={form.category} onChange={e => setForm({...form, category: e.target.value})} placeholder="Electronics" className="w-full glass rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                </div>
                <div>
                  <label className="text-xs text-muted font-medium mb-1.5 block">Quantity *</label>
                  <input required type="number" min="0" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} placeholder="100" className="w-full glass rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                </div>
                <div>
                  <label className="text-xs text-muted font-medium mb-1.5 block">Unit</label>
                  <select value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} className="w-full glass rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                    <option>pcs</option><option>kg</option><option>ltr</option><option>box</option><option>set</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted font-medium mb-1.5 block">Selling Price (₹) *</label>
                  <input required type="number" min="0" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value, selling_price: e.target.value})} placeholder="499" className="w-full glass rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                </div>
                <div>
                  <label className="text-xs text-muted font-medium mb-1.5 block">Cost Price (₹)</label>
                  <input type="number" min="0" step="0.01" value={form.cost_price} onChange={e => setForm({...form, cost_price: e.target.value})} placeholder="300" className="w-full glass rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                </div>
                <div>
                  <label className="text-xs text-muted font-medium mb-1.5 block">Low Stock Alert At</label>
                  <input type="number" min="0" value={form.low_stock_threshold} onChange={e => setForm({...form, low_stock_threshold: e.target.value})} placeholder="10" className="w-full glass rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-muted font-medium mb-1.5 block">Description</label>
                  <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} placeholder="Optional product description..." className="w-full glass rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none" />
                </div>
              </div>
              <button type="submit" disabled={submitting} className="w-full btn-primary py-3 rounded-xl font-medium">
                {submitting ? 'Adding...' : 'Add to Inventory'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
