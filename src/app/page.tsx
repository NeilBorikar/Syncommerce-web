'use client';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { api } from '@/lib/api';
import { SalesReport } from '@/lib/types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Package, Users, FileText, Download, RefreshCw, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const { user, businessId } = useAuth();
  const [report, setReport] = useState<SalesReport | null>(null);
  const [inventory, setInventory] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  useEffect(() => {
    if (businessId) loadDashboard();
  }, [businessId]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const [reportData, inventoryData, customerData] = await Promise.allSettled([
        api.getSalesReport(businessId!, thirtyDaysAgo, today),
        api.getInventory(businessId!),
        api.getCustomers(businessId!),
      ]);

      if (reportData.status === 'fulfilled') setReport(reportData.value);
      if (inventoryData.status === 'fulfilled') setInventory(inventoryData.value);
      if (customerData.status === 'fulfilled') setCustomers(customerData.value);
    } catch (e: any) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Build chart data from top products or fallback to empty
  const chartData = report?.top_products?.slice(0, 7).map((p, i) => ({
    name: p.name.substring(0, 8),
    revenue: p.revenue,
    qty: p.quantity,
  })) || [];

  const totalRevenue = report?.total_sales ?? 0;
  const totalOrders = report?.total_orders ?? 0;
  const totalProfit = report?.total_profit ?? 0;
  const totalProducts = inventory.length;
  const totalCustomers = customers.length;
  const lowStock = inventory.filter(i => i.quantity <= (i.low_stock_threshold ?? 10)).length;

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-muted text-sm">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-muted mt-1">
            Here's what's happening with your store — last 30 days.
          </p>
        </div>
        <button
          onClick={loadDashboard}
          className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-white/10 hover:bg-white/10 text-sm font-medium transition-all"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle size={18} />
          {error} — Some data may not be available yet. Try refreshing.
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={`₹${totalRevenue.toLocaleString()}`}
          sub="Last 30 days"
          icon={TrendingUp}
          color="blue"
          empty={totalRevenue === 0}
        />
        <StatCard
          title="Total Orders"
          value={totalOrders.toLocaleString()}
          sub="Last 30 days"
          icon={FileText}
          color="purple"
          empty={totalOrders === 0}
        />
        <StatCard
          title="Customers"
          value={totalCustomers.toLocaleString()}
          sub="All time"
          icon={Users}
          color="green"
          empty={totalCustomers === 0}
        />
        <StatCard
          title="Products"
          value={totalProducts.toLocaleString()}
          sub={lowStock > 0 ? `${lowStock} low stock` : 'All stocked'}
          icon={Package}
          color={lowStock > 0 ? "orange" : "teal"}
          empty={totalProducts === 0}
        />
      </div>

      {/* Charts + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-1">Revenue by Top Products</h3>
          <p className="text-muted text-xs mb-6">Last 30 days performance</p>
          {chartData.length === 0 ? (
            <div className="h-[280px] flex flex-col items-center justify-center text-muted gap-3">
              <TrendingUp size={36} className="opacity-30" />
              <p className="text-sm">No sales data yet — create your first bill!</p>
            </div>
          ) : (
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                  <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(20,24,32,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">Top Products</h3>
          {report?.top_products && report.top_products.length > 0 ? (
            <div className="space-y-3">
              {report.top_products.slice(0, 5).map((p, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-blue-400">#{i + 1}</span>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h4 className="font-medium text-sm truncate">{p.name}</h4>
                    <p className="text-xs text-muted">{p.quantity} sold</p>
                  </div>
                  <div className="font-semibold text-sm text-green-400 flex-shrink-0">
                    ₹{p.revenue?.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-muted gap-3">
              <Package size={32} className="opacity-30" />
              <p className="text-sm text-center">No sales yet. Start creating bills!</p>
            </div>
          )}
        </div>
      </div>

      {/* Employee Performance */}
      {report?.employee_performance && report.employee_performance.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">Employee Performance</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {report.employee_performance.slice(0, 6).map((emp, i) => (
              <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/30 flex items-center justify-center font-bold text-sm">
                    {emp.name.charAt(0).toUpperCase()}
                  </div>
                  <p className="font-medium text-sm truncate">{emp.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-muted mb-0.5">Bills</p>
                    <p className="font-semibold text-blue-400">{emp.bills_created}</p>
                  </div>
                  <div>
                    <p className="text-muted mb-0.5">Sales</p>
                    <p className="font-semibold text-green-400">₹{emp.sales_generated?.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Low Stock Alert */}
      {lowStock > 0 && (
        <div className="glass rounded-2xl p-5">
          <h3 className="font-semibold mb-3 text-yellow-400 flex items-center gap-2">
            <Package size={18} /> Low Stock Items
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {inventory
              .filter(i => i.quantity <= (i.low_stock_threshold ?? 10))
              .slice(0, 6)
              .map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/10">
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted">{item.category || 'Uncategorized'}</p>
                  </div>
                  <span className="text-yellow-400 font-bold text-sm">{item.quantity} left</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, sub, icon: Icon, color, empty }: any) {
  const colorMap: any = {
    blue: { grad: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/20', glow: 'bg-blue-500/5' },
    purple: { grad: 'from-purple-500 to-purple-600', shadow: 'shadow-purple-500/20', glow: 'bg-purple-500/5' },
    green: { grad: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-500/20', glow: 'bg-emerald-500/5' },
    orange: { grad: 'from-orange-500 to-orange-600', shadow: 'shadow-orange-500/20', glow: 'bg-orange-500/5' },
    teal: { grad: 'from-teal-500 to-teal-600', shadow: 'shadow-teal-500/20', glow: 'bg-teal-500/5' },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <div className={`glass glass-hover rounded-2xl p-6 relative overflow-hidden group border border-white/5`}>
      <div className={`absolute inset-0 ${c.glow} opacity-0 group-hover:opacity-100 transition-opacity`} />
      <div className="flex justify-between items-start mb-4 relative">
        <div>
          <p className="text-muted text-sm font-medium mb-1">{title}</p>
          <h3 className={`text-3xl font-bold ${empty ? 'text-muted' : ''}`}>{value}</h3>
        </div>
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${c.grad} shadow-lg ${c.shadow} flex items-center justify-center flex-shrink-0`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
      <p className="text-xs text-muted relative">{sub}</p>
    </div>
  );
}
