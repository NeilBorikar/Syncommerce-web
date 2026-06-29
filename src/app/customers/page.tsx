'use client';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { api } from '@/lib/api';
import { Customer } from '@/lib/types';
import { Search, Download, Phone, Mail, MapPin, ShoppingBag, Star, Users } from 'lucide-react';

export default function CustomersPage() {
  const { businessId } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Customer | null>(null);

  useEffect(() => { if (businessId) loadCustomers(); }, [businessId]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await api.getCustomers(businessId!);
      setCustomers(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const topCustomers = [...customers].sort((a, b) => b.total_spend - a.total_spend).slice(0, 3);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Customers</h1>
          <p className="text-muted mt-1">{customers.length} customers total</p>
        </div>
        <button onClick={() => api.exportCustomers(businessId!).then(d => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([d])); a.download = 'customers.xlsx'; a.click(); })} className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-white/10 hover:bg-white/10 text-sm font-medium transition-all">
          <Download size={16} /> Export
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Customers', value: customers.length, color: 'text-blue-400' },
          { label: 'Total Revenue', value: `₹${customers.reduce((s, c) => s + c.total_spend, 0).toLocaleString()}`, color: 'text-green-400' },
          { label: 'Total Orders', value: customers.reduce((s, c) => s + c.bill_count, 0), color: 'text-purple-400' },
          { label: 'Avg Spend', value: customers.length ? `₹${Math.round(customers.reduce((s, c) => s + c.total_spend, 0) / customers.length).toLocaleString()}` : '₹0', color: 'text-orange-400' },
        ].map(s => (
          <div key={s.label} className="glass rounded-2xl p-4">
            <p className="text-muted text-xs font-medium mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Top Customers */}
      {topCustomers.length > 0 && (
        <div className="glass rounded-2xl p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Star size={16} className="text-yellow-400" /> Top Customers</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {topCustomers.map((c, i) => (
              <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${i === 0 ? 'bg-yellow-500/20 text-yellow-400' : i === 1 ? 'bg-gray-400/20 text-gray-300' : 'bg-orange-700/20 text-orange-500'}`}>
                  #{i + 1}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="font-medium text-sm truncate">{c.name}</p>
                  <p className="text-muted text-xs">₹{c.total_spend.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, phone, or email..." className="w-full glass rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center">
          <Users size={40} className="text-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No customers yet</h3>
          <p className="text-muted text-sm">Customers are auto-added when you create bills for them.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(customer => (
            <button key={customer.id} onClick={() => setSelected(customer)} className="glass glass-hover rounded-2xl p-5 text-left border border-white/5 w-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-blue-500/20 flex items-center justify-center text-lg font-bold text-green-400">
                  {customer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold">{customer.name}</h3>
                  <p className="text-muted text-xs">{customer.phone}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-2.5 rounded-xl bg-white/5">
                  <p className="text-muted text-xs mb-0.5">Total Spend</p>
                  <p className="font-semibold text-green-400">₹{customer.total_spend.toLocaleString()}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5">
                  <p className="text-muted text-xs mb-0.5">Orders</p>
                  <p className="font-semibold">{customer.bill_count}</p>
                </div>
              </div>
              {customer.favorite_items?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {customer.favorite_items.slice(0, 2).map((fi, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400">{fi.name}</span>
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Customer Detail Drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelected(null)}>
          <div className="w-full max-w-sm glass border-l border-white/10 h-full overflow-y-auto p-6 animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">Customer Details</h2>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-white/10 rounded-xl text-muted">✕</button>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-blue-500/20 flex items-center justify-center text-2xl font-bold text-green-400 mb-4">
              {selected.name.charAt(0).toUpperCase()}
            </div>
            <h3 className="text-xl font-bold mb-1">{selected.name}</h3>
            <div className="space-y-3 text-sm text-muted mt-4">
              {selected.phone && <div className="flex items-center gap-2"><Phone size={15} />{selected.phone}</div>}
              {selected.email && <div className="flex items-center gap-2"><Mail size={15} />{selected.email}</div>}
              {selected.billing_address && <div className="flex items-center gap-2"><MapPin size={15} />{selected.billing_address}</div>}
            </div>
            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="p-3 rounded-xl bg-white/5 text-center">
                <p className="text-muted text-xs mb-1">Total Spend</p>
                <p className="text-green-400 font-bold">₹{selected.total_spend.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 text-center">
                <p className="text-muted text-xs mb-1">Bills</p>
                <p className="font-bold">{selected.bill_count}</p>
              </div>
            </div>
            {selected.favorite_items?.length > 0 && (
              <div className="mt-6">
                <h4 className="text-xs text-muted uppercase font-medium tracking-wider mb-3">Favourite Items</h4>
                <div className="space-y-2">
                  {selected.favorite_items.map((fi, i) => (
                    <div key={i} className="flex justify-between items-center p-2 rounded-lg bg-white/5">
                      <span className="text-sm">{fi.name}</span>
                      <span className="text-xs text-purple-400">{fi.count}x</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
