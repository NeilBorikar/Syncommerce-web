'use client';
import React, { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Building2, User, Lock, Bell, Shield, LogOut, ChevronRight } from 'lucide-react';

export default function SettingsPage() {
  const { user, business, logoutUser, logoutBusiness } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'workspace' | 'security'>('profile');
  const [saved, setSaved] = useState(false);

  const showSaved = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'workspace', label: 'Workspace', icon: Building2 },
    { id: 'security', label: 'Security', icon: Shield },
  ] as const;

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Settings</h1>
        <p className="text-muted mt-1">Manage your profile and workspace preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 glass rounded-2xl p-1.5 w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-gradient-to-r from-blue-600/30 to-purple-600/30 text-white border border-blue-500/30' : 'text-muted hover:text-white'}`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="space-y-4 animate-fade-in">
          <div className="glass rounded-2xl p-6">
            <h3 className="font-semibold mb-5">Your Profile</h3>
            <div className="flex items-center gap-5 mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center text-3xl font-bold text-blue-400">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold">{user?.name}</h2>
                <p className="text-muted text-sm">{user?.email}</p>
                <span className={`text-xs px-2.5 py-0.5 rounded-full mt-1 inline-block ${user?.role === 'owner' ? 'bg-yellow-500/10 text-yellow-400' : user?.role === 'manager' ? 'bg-blue-500/10 text-blue-400' : 'bg-green-500/10 text-green-400'}`}>
                  {user?.role}
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted font-medium mb-1.5 block">Display Name</label>
                <input defaultValue={user?.name} className="w-full glass rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
              </div>
              <div>
                <label className="text-xs text-muted font-medium mb-1.5 block">Email (read-only)</label>
                <input defaultValue={user?.email} readOnly className="w-full glass rounded-xl py-2.5 px-4 text-sm opacity-50 cursor-not-allowed" />
              </div>
            </div>
            <button onClick={showSaved} className="btn-primary mt-5 px-5 py-2.5 rounded-xl text-sm font-medium">
              {saved ? '✓ Saved!' : 'Save Changes'}
            </button>
          </div>

          {/* Account Actions */}
          <div className="glass rounded-2xl p-6">
            <h3 className="font-semibold mb-4">Account Actions</h3>
            <div className="space-y-3">
              <button onClick={logoutUser} className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-yellow-500/5 border border-yellow-500/10 group transition-all">
                <div className="flex items-center gap-3 text-yellow-400">
                  <LogOut size={18} />
                  <div className="text-left">
                    <p className="font-medium text-sm">Switch User</p>
                    <p className="text-xs text-muted">Go back to employee selection</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-muted group-hover:text-white" />
              </button>
              <button onClick={logoutBusiness} className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-red-500/5 border border-red-500/10 group transition-all">
                <div className="flex items-center gap-3 text-red-400">
                  <Building2 size={18} />
                  <div className="text-left">
                    <p className="font-medium text-sm">Switch Workspace</p>
                    <p className="text-xs text-muted">Log out of this business entirely</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-muted group-hover:text-white" />
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'workspace' && (
        <div className="space-y-4 animate-fade-in">
          <div className="glass rounded-2xl p-6">
            <h3 className="font-semibold mb-5">Workspace Info</h3>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-blue-500/20 flex items-center justify-center">
                <Building2 size={28} className="text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{business?.name || 'Your Business'}</h2>
                <p className="text-muted text-sm">{business?.email}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted font-medium mb-1.5 block">Business Name</label>
                <input defaultValue={business?.name} className="w-full glass rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
              </div>
              <div>
                <label className="text-xs text-muted font-medium mb-1.5 block">Business Email (read-only)</label>
                <input defaultValue={business?.email} readOnly className="w-full glass rounded-xl py-2.5 px-4 text-sm opacity-50 cursor-not-allowed" />
              </div>
              <div>
                <label className="text-xs text-muted font-medium mb-1.5 block">Address</label>
                <textarea defaultValue={business?.address || ''} rows={2} className="w-full glass rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none" />
              </div>
            </div>
            <button onClick={showSaved} className="btn-primary mt-5 px-5 py-2.5 rounded-xl text-sm font-medium">
              {saved ? '✓ Saved!' : 'Update Workspace'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-4 animate-fade-in">
          <div className="glass rounded-2xl p-6">
            <h3 className="font-semibold mb-5">Change Password</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted font-medium mb-1.5 block">Current Password</label>
                <input type="password" placeholder="••••••••" className="w-full glass rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
              </div>
              <div>
                <label className="text-xs text-muted font-medium mb-1.5 block">New Password</label>
                <input type="password" placeholder="Min. 6 characters" className="w-full glass rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
              </div>
              <div>
                <label className="text-xs text-muted font-medium mb-1.5 block">Confirm New Password</label>
                <input type="password" placeholder="Re-enter new password" className="w-full glass rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
              </div>
            </div>
            <button onClick={showSaved} className="btn-primary mt-5 px-5 py-2.5 rounded-xl text-sm font-medium">
              {saved ? '✓ Updated!' : 'Update Password'}
            </button>
          </div>

          <div className="glass rounded-2xl p-6">
            <h3 className="font-semibold mb-2 flex items-center gap-2"><Lock size={16} className="text-muted" /> Session Info</h3>
            <p className="text-muted text-sm mb-4">Your access token is stored securely in your browser's local storage and persists until you manually log out.</p>
            <div className="p-3 rounded-xl bg-white/5 font-mono text-xs text-muted break-all">
              {typeof window !== 'undefined' ? localStorage.getItem('token')?.substring(0, 60) + '...' : 'Loading...'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
