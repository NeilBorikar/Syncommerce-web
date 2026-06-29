'use client';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { api } from '@/lib/api';
import { Employee } from '@/lib/types';
import { Plus, Trash2, UserCheck, UserX, Download, Search, Shield, User, Briefcase, X, Mail, Phone, DollarSign, Calendar } from 'lucide-react';

export default function EmployeesPage() {
  const { user, businessId } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const role = user?.role || 'worker';
  const isManagerOrOwner = role === 'manager' || role === 'owner';

  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', role: 'worker',
    salary: '', date_joined: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (businessId) loadEmployees();
  }, [businessId]);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await api.getEmployees(businessId!);
      setEmployees(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.addEmployee({ ...form, salary: parseFloat(form.salary) || 0, business_id: businessId });
      setShowModal(false);
      setForm({ name: '', email: '', password: '', phone: '', role: 'worker', salary: '', date_joined: new Date().toISOString().split('T')[0] });
      loadEmployees();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to add employee');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this employee?')) return;
    try {
      await api.deleteEmployee(id);
      loadEmployees();
    } catch (e) { console.error(e); }
  };

  const roleCanAdd = (targetRole: string) => {
    if (role === 'owner') return true;
    if (role === 'manager' && targetRole === 'worker') return true;
    return false;
  };

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.email.toLowerCase().includes(search.toLowerCase())
  );

  const roleColor: any = {
    owner: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30 text-yellow-400',
    manager: 'from-blue-500/20 to-purple-500/20 border-blue-500/30 text-blue-400',
    worker: 'from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-400',
  };
  const RoleIcon: any = { owner: Shield, manager: Briefcase, worker: User };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Employees</h1>
          <p className="text-muted mt-1">{employees.length} team members</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => api.exportEmployees(businessId!).then(d => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([d])); a.download = 'employees.xlsx'; a.click(); })} className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-white/10 hover:bg-white/10 text-sm font-medium transition-all">
            <Download size={16} /> Export
          </button>
          {isManagerOrOwner && (
            <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm">
              <Plus size={18} /> Add Employee
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search employees..." className="w-full glass rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4"><User size={28} className="text-muted" /></div>
          <h3 className="text-lg font-semibold mb-2">No employees found</h3>
          <p className="text-muted text-sm">{isManagerOrOwner ? 'Add your first employee to get started.' : 'No employees in your team yet.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(emp => {
            const Icon = RoleIcon[emp.role] || User;
            return (
              <div key={emp.id} className="glass glass-hover rounded-2xl p-5 border border-white/5 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-lg font-bold">
                      {emp.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold">{emp.name}</h3>
                      <p className="text-muted text-xs">{emp.email}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-lg bg-gradient-to-r border ${roleColor[emp.role] || 'text-muted'}`}>
                    {emp.role}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-muted mb-4">
                  {emp.phone && <div className="flex items-center gap-2"><Phone size={13} />{emp.phone}</div>}
                  <div className="flex items-center gap-2"><DollarSign size={13} />₹{emp.salary?.toLocaleString()}/mo</div>
                  {emp.date_joined && <div className="flex items-center gap-2"><Calendar size={13} />Joined {new Date(emp.date_joined).toLocaleDateString()}</div>}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${emp.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {emp.status}
                  </span>
                  {isManagerOrOwner && (
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {role === 'owner' && <button onClick={() => handleDelete(emp.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-red-400 transition-colors"><Trash2 size={15} /></button>}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Employee Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass rounded-3xl w-full max-w-md p-7 border border-white/10 shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Add Employee</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-xl"><X size={20} /></button>
            </div>
            {error && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs text-muted font-medium mb-1.5 block">Full Name</label>
                  <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="John Doe" className="w-full glass rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-muted font-medium mb-1.5 block">Email</label>
                  <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="john@company.com" className="w-full glass rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-muted font-medium mb-1.5 block">Password</label>
                  <input required type="password" minLength={6} value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Min. 6 characters" className="w-full glass rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                </div>
                <div>
                  <label className="text-xs text-muted font-medium mb-1.5 block">Role</label>
                  <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="w-full glass rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                    <option value="worker">Worker</option>
                    {role === 'owner' && <option value="manager">Manager</option>}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted font-medium mb-1.5 block">Phone</label>
                  <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91 98765..." className="w-full glass rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                </div>
                <div>
                  <label className="text-xs text-muted font-medium mb-1.5 block">Salary (₹/mo)</label>
                  <input type="number" value={form.salary} onChange={e => setForm({...form, salary: e.target.value})} placeholder="20000" className="w-full glass rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                </div>
                <div>
                  <label className="text-xs text-muted font-medium mb-1.5 block">Date Joined</label>
                  <input type="date" value={form.date_joined} onChange={e => setForm({...form, date_joined: e.target.value})} className="w-full glass rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                </div>
              </div>
              <button type="submit" disabled={submitting} className="w-full btn-primary py-3 rounded-xl font-medium mt-2">
                {submitting ? 'Adding...' : 'Add Employee'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
