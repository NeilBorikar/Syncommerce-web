'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';
import LoginScreens from './LoginScreens';
import { LayoutDashboard, Users, FileText, Package, BarChart2, Settings, LogOut, Menu, X } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logoutUser, loading } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If not logged in, just render login screens
  if (!user) {
    return <LoginScreens />;
  }

  const role = user.role || 'worker';
  const isManagerOrOwner = role === 'manager' || role === 'owner';

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Bills', path: '/bills', icon: FileText },
    { name: 'Inventory', path: '/inventory', icon: Package },
    { name: 'Customers', path: '/customers', icon: Users },
  ];

  if (isManagerOrOwner) {
    menuItems.push({ name: 'Reports', path: '/reports', icon: BarChart2 });
    menuItems.push({ name: 'Employees', path: '/employees', icon: Users });
  }

  menuItems.push({ name: 'Settings', path: '/settings', icon: Settings });

  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden glass m-4 mb-0 rounded-xl p-4 flex justify-between items-center z-20">
        <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          SynCommerce
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-white/10 rounded-lg">
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-30
        w-64 glass m-4 rounded-2xl flex flex-col
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-[120%] md:translate-x-0'}
      `}>
        <div className="p-6">
          <h2 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
            SynCommerce
          </h2>
          <div className="text-xs text-muted font-medium px-2 py-1 bg-white/5 rounded-md inline-block uppercase tracking-wider">
            {role}
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            
            return (
              <Link 
                key={item.path} 
                href={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive 
                    ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-400 border border-blue-500/30' 
                    : 'text-muted hover:text-white hover:bg-white/5 border border-transparent'}
                `}
              >
                <Icon size={20} className={isActive ? 'text-blue-400' : 'text-muted'} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 mt-auto">
          <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-black/20 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted truncate">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={logoutUser}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 md:pl-4 overflow-y-auto w-full h-screen">
        <div className="animate-fade-in h-full">
          {children}
        </div>
      </main>
      
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
