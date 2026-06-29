'use client';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { api } from '@/lib/api';
import { SalesReport } from '@/lib/types';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, ShoppingCart, DollarSign, Users, Trophy, Download } from 'lucide-react';

export default function ReportsPage() {
  const { businessId } = useAuth();
  const [report, setReport] = useState<SalesReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [from, setFrom] = useState(() => new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [to, setTo] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => { if (businessId) loadReport(); }, [businessId]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const data = await api.getSalesReport(businessId!, from, to);
      setReport(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const topProductsChart = report?.top_products?.map(p => ({ name: p.name.substring(0, 12), revenue: p.revenue, qty: p.quantity })) || [];
  const empChart = report?.employee_performance?.map(e => ({ name: e.name.split(' ')[0], bills: e.bills_created, sales: e.sales_generated })) || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Reports</h1>
          <p className="text-muted mt-1">Sales & performance analytics</p>
        </div>
      </div>

      {/* Date Filter */}
      <div className="glass rounded-2xl p-5 flex flex-wrap gap-4 items-end">
        <div>
          <label className="text-xs text-muted font-medium mb-1.5 block">From</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="glass rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
        </div>
        <div>
          <label className="text-xs text-muted font-medium mb-1.5 block">To</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} className="glass rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
        </div>
        <button onClick={loadReport} disabled={loading} className="btn-primary px-5 py-2 rounded-xl text-sm font-medium">
          {loading ? 'Loading...' : 'Generate Report'}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : !report ? (
        <div className="glass rounded-2xl p-16 text-center">
          <TrendingUp size={40} className="text-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No report data yet</h3>
          <p className="text-muted text-sm">Generate a report for the selected date range.</p>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Sales', value: `₹${report.total_sales?.toLocaleString() || 0}`, icon: DollarSign, color: 'from-green-500 to-emerald-600', glow: 'shadow-green-500/20' },
              { label: 'Total Orders', value: report.total_orders || 0, icon: ShoppingCart, color: 'from-blue-500 to-blue-600', glow: 'shadow-blue-500/20' },
              { label: 'Total Profit', value: `₹${report.total_profit?.toLocaleString() || 0}`, icon: TrendingUp, color: 'from-purple-500 to-purple-600', glow: 'shadow-purple-500/20' },
              { label: 'GST Collected', value: `₹${report.gst_total?.toLocaleString() || 0}`, icon: Users, color: 'from-orange-500 to-orange-600', glow: 'shadow-orange-500/20' },
            ].map(card => (
              <div key={card.label} className="glass rounded-2xl p-5">
                <div className="flex justify-between items-start mb-3">
                  <p className="text-muted text-xs font-medium">{card.label}</p>
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${card.color} shadow-lg ${card.glow} flex items-center justify-center`}>
                    <card.icon size={16} className="text-white" />
                  </div>
                </div>
                <p className="text-2xl font-bold">{card.value}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          {topProductsChart.length > 0 && (
            <div className="glass rounded-2xl p-6">
              <h3 className="font-semibold mb-5 flex items-center gap-2"><Trophy size={16} className="text-yellow-400" /> Top Products by Revenue</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProductsChart} margin={{ left: -15 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                    <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(20,24,32,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} itemStyle={{ color: '#fff' }} />
                    <Bar dataKey="revenue" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
                    <defs>
                      <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Employee Performance */}
          {empChart.length > 0 && (
            <div className="glass rounded-2xl p-6">
              <h3 className="font-semibold mb-5 flex items-center gap-2"><Users size={16} className="text-blue-400" /> Employee Performance</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      {['Employee', 'Bills Created', 'Sales Generated', 'Avg Bill Value'].map(h => (
                        <th key={h} className="text-left py-3 px-3 text-muted font-medium text-xs uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {report.employee_performance?.map((e, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 px-3 font-medium">{e.name}</td>
                        <td className="py-3 px-3 text-blue-400">{e.bills_created}</td>
                        <td className="py-3 px-3 text-green-400">₹{e.sales_generated?.toLocaleString()}</td>
                        <td className="py-3 px-3">₹{e.avg_bill?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
