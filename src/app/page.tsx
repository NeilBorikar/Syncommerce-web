'use client';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { api } from '@/lib/api';
import { SalesReport } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Package, Users, FileText, Download } from 'lucide-react';

export default function Dashboard() {
  const { user, businessId } = useAuth();
  const [report, setReport] = useState<SalesReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (businessId) {
      loadDashboard();
    }
  }, [businessId]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      // Dummy date range for now
      const today = new Date().toISOString().split('T')[0];
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const data = await api.getSalesReport(businessId!, thirtyDaysAgo, today);
      setReport(data);
    } catch (error) {
      console.error("Failed to load dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data if API doesn't return anything yet for visual richness
  const chartData = [
    { name: 'Mon', sales: 4000, profit: 2400 },
    { name: 'Tue', sales: 3000, profit: 1398 },
    { name: 'Wed', sales: 2000, profit: 9800 },
    { name: 'Thu', sales: 2780, profit: 3908 },
    { name: 'Fri', sales: 1890, profit: 4800 },
    { name: 'Sat', sales: 2390, profit: 3800 },
    { name: 'Sun', sales: 3490, profit: 4300 },
  ];

  if (loading) return <div className="h-full flex items-center justify-center"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Welcome back, {user?.name.split(' ')[0]}
          </h1>
          <p className="text-muted mt-1">Here is what's happening with your store today.</p>
        </div>
        <button className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg font-medium">
          <Download size={18} />
          Export Report
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value="₹124,500" trend="+14.5%" icon={TrendingUp} color="blue" />
        <StatCard title="Total Orders" value="456" trend="+5.2%" icon={FileText} color="purple" />
        <StatCard title="Customers" value="2,400" trend="+12.1%" icon={Users} color="green" />
        <StatCard title="Products" value="142" trend="-2.4%" icon={Package} color="orange" />
      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-6">Revenue Overview</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(20,24,32,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">Top Products</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
                  <Package size={20} className="text-blue-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">Premium Widget {i}</h4>
                  <p className="text-xs text-muted">14{i} sales</p>
                </div>
                <div className="font-semibold">
                  ₹{(450 * i).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend, icon: Icon, color }: any) {
  const isPositive = trend.startsWith('+');
  
  const colorMap: any = {
    blue: 'from-blue-500 to-blue-600 shadow-blue-500/20',
    purple: 'from-purple-500 to-purple-600 shadow-purple-500/20',
    green: 'from-emerald-500 to-emerald-600 shadow-emerald-500/20',
    orange: 'from-orange-500 to-orange-600 shadow-orange-500/20',
  };

  return (
    <div className="glass glass-hover rounded-2xl p-6 relative overflow-hidden group">
      <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/5 blur-2xl group-hover:bg-white/10 transition-colors"></div>
      
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-muted text-sm font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-bold">{value}</h3>
        </div>
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorMap[color]} shadow-lg flex items-center justify-center`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <span className={`text-xs font-semibold px-2 py-1 rounded-md ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
          {trend}
        </span>
        <span className="text-xs text-muted">vs last month</span>
      </div>
    </div>
  );
}
