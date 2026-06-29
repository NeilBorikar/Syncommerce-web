'use client';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { api } from '@/lib/api';
import { Bill, BillItem } from '@/lib/types';
import { Plus, Search, FileText, X, Trash2, ShoppingCart } from 'lucide-react';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'https://syncommerce.onrender.com/api/v1';

export default function BillsPage() {
  const { user, businessId } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  const [form, setForm] = useState({
    customer_name: '', customer_phone: '',
    discount: '0', notes: '', status: 'final' as 'final' | 'draft',
    items: [{ name: '', quantity: 1, price: 0, gst_percent: 0 }] as BillItem[]
  });

  useEffect(() => { if (businessId) loadBills(); }, [businessId]);

  const loadBills = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE}/bills/?business_id=${businessId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setBills(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const subtotal = form.items.reduce((s, i) => s + i.quantity * i.price, 0);
  const discount = parseFloat(form.discount) || 0;
  const total = subtotal - discount;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true); setError('');
    try {
      const payload = {
        business_id: businessId,
        created_by: user?.id,
        customer_name: form.customer_name,
        customer_phone: form.customer_phone,
        items: form.items.filter(i => i.name),
        discount: parseFloat(form.discount) || 0,
        tax: 0,
        total,
        status: form.status,
        notes: form.notes,
      };
      const res = await fetch(`${BASE}/bills/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error((await res.json()).detail);
      setShowModal(false);
      setForm({ customer_name: '', customer_phone: '', discount: '0', notes: '', status: 'final', items: [{ name: '', quantity: 1, price: 0, gst_percent: 0 }] });
      loadBills();
    } catch (err: any) {
      setError(err.message || 'Failed to create bill');
    } finally { setSubmitting(false); }
  };

  const updateItem = (index: number, field: keyof BillItem, value: any) => {
    const updated = [...form.items];
    updated[index] = { ...updated[index], [field]: field === 'name' ? value : Number(value) };
    setForm({ ...form, items: updated });
  };

  const addItem = () => setForm({ ...form, items: [...form.items, { name: '', quantity: 1, price: 0, gst_percent: 0 }] });
  const removeItem = (i: number) => setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) });

  const filtered = bills.filter(b =>
    b.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
    b.customer_phone?.includes(search) ||
    b.id?.includes(search)
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Bills</h1>
          <p className="text-muted mt-1">{bills.length} bills created</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm">
          <Plus size={18} /> New Bill
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Bills', value: bills.length, color: 'text-blue-400' },
          { label: 'Total Revenue', value: `₹${bills.filter(b => b.status === 'final').reduce((s, b) => s + b.total, 0).toLocaleString()}`, color: 'text-green-400' },
          { label: 'Draft Bills', value: bills.filter(b => b.status === 'draft').length, color: 'text-yellow-400' },
        ].map(s => (
          <div key={s.label} className="glass rounded-2xl p-4">
            <p className="text-muted text-xs font-medium mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by customer, phone, or bill ID..." className="w-full glass rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center">
          <FileText size={40} className="text-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No bills yet</h3>
          <p className="text-muted text-sm">Create your first bill to get started.</p>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  {['Bill ID', 'Customer', 'Items', 'Total', 'Status', 'Date'].map(h => (
                    <th key={h} className="text-left py-3.5 px-4 text-muted font-medium text-xs uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(bill => (
                  <tr key={bill.id} onClick={() => setSelectedBill(bill)} className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer">
                    <td className="py-3.5 px-4 font-mono text-xs text-muted">{bill.id?.slice(0, 8)}...</td>
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-medium">{bill.customer_name || 'Walk-in'}</p>
                        {bill.customer_phone && <p className="text-muted text-xs">{bill.customer_phone}</p>}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-muted">{bill.items?.length} items</td>
                    <td className="py-3.5 px-4 font-semibold text-green-400">₹{bill.total?.toLocaleString()}</td>
                    <td className="py-3.5 px-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${bill.status === 'final' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                        {bill.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-muted text-xs">{new Date(bill.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Bill Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass rounded-3xl w-full max-w-2xl p-7 border border-white/10 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2"><ShoppingCart size={20} /> New Bill</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-xl"><X size={20} /></button>
            </div>
            {error && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
            <form onSubmit={handleAdd} className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted font-medium mb-1.5 block">Customer Name</label>
                  <input value={form.customer_name} onChange={e => setForm({...form, customer_name: e.target.value})} placeholder="Walk-in Customer" className="w-full glass rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                </div>
                <div>
                  <label className="text-xs text-muted font-medium mb-1.5 block">Phone</label>
                  <input value={form.customer_phone} onChange={e => setForm({...form, customer_phone: e.target.value})} placeholder="+91 98765..." className="w-full glass rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                </div>
              </div>

              {/* Items */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-xs text-muted font-medium uppercase tracking-wider">Items</label>
                  <button type="button" onClick={addItem} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"><Plus size={13} /> Add Row</button>
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 text-xs text-muted px-1">
                    <span className="col-span-5">Item Name</span><span className="col-span-2">Qty</span><span className="col-span-2">Price</span><span className="col-span-2">GST%</span><span className="col-span-1"></span>
                  </div>
                  {form.items.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2">
                      <input className="col-span-5 glass rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="Item name" value={item.name} onChange={e => updateItem(idx, 'name', e.target.value)} />
                      <input type="number" min="1" className="col-span-2 glass rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} />
                      <input type="number" min="0" className="col-span-2 glass rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="₹" value={item.price || ''} onChange={e => updateItem(idx, 'price', e.target.value)} />
                      <input type="number" min="0" max="28" className="col-span-2 glass rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="%" value={item.gst_percent || ''} onChange={e => updateItem(idx, 'gst_percent', e.target.value)} />
                      <button type="button" onClick={() => removeItem(idx)} className="col-span-1 flex items-center justify-center text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="glass rounded-2xl p-4 space-y-2 text-sm">
                <div className="flex justify-between text-muted"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between items-center">
                  <span className="text-muted">Discount</span>
                  <input type="number" min="0" value={form.discount} onChange={e => setForm({...form, discount: e.target.value})} className="w-24 glass rounded-lg py-1 px-2 text-sm text-right focus:outline-none focus:ring-1 focus:ring-blue-500/50" />
                </div>
                <div className="flex justify-between font-bold text-base border-t border-white/10 pt-2"><span>Total</span><span className="text-green-400">₹{total.toLocaleString()}</span></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted font-medium mb-1.5 block">Status</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value as any})} className="w-full glass rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                    <option value="final">Final</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted font-medium mb-1.5 block">Notes</label>
                  <input value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Optional..." className="w-full glass rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                </div>
              </div>

              <button type="submit" disabled={submitting} className="w-full btn-primary py-3 rounded-xl font-medium">
                {submitting ? 'Creating...' : `Create Bill · ₹${total.toLocaleString()}`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Bill Detail */}
      {selectedBill && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelectedBill(null)}>
          <div className="w-full max-w-sm glass border-l border-white/10 h-full overflow-y-auto p-6 animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">Bill Details</h2>
              <button onClick={() => setSelectedBill(null)} className="p-2 hover:bg-white/10 rounded-xl text-muted">✕</button>
            </div>
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-white/5 text-sm">
                <p className="text-muted text-xs mb-1">Customer</p>
                <p className="font-semibold">{selectedBill.customer_name || 'Walk-in'}</p>
                {selectedBill.customer_phone && <p className="text-muted text-xs">{selectedBill.customer_phone}</p>}
              </div>
              <div className="space-y-2">
                <p className="text-xs text-muted uppercase tracking-wider font-medium">Items</p>
                {selectedBill.items?.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm p-2 rounded-lg bg-white/5">
                    <span>{item.name} × {item.quantity}</span>
                    <span className="font-medium">₹{(item.quantity * item.price).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/10 pt-3 space-y-1 text-sm">
                <div className="flex justify-between text-muted"><span>Discount</span><span>-₹{selectedBill.discount?.toLocaleString()}</span></div>
                <div className="flex justify-between font-bold text-base"><span>Total</span><span className="text-green-400">₹{selectedBill.total?.toLocaleString()}</span></div>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-medium inline-block ${selectedBill.status === 'final' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                {selectedBill.status}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
