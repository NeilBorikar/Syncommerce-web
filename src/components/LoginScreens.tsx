import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { Building2, User, KeyRound, Mail, ArrowRight, UserPlus, ShieldCheck } from 'lucide-react';

export default function LoginScreens() {
  const { businessToken, user, loginBusiness, registerBusiness, loginUser, usersInBusiness, logoutBusiness } = useAuth();
  
  const [view, setView] = useState<'business_login' | 'business_register' | 'user_login'>('business_login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Business Login State
  const [busEmail, setBusEmail] = useState('');
  const [busPassword, setBusPassword] = useState('');

  // Business Register State
  const [regBusName, setRegBusName] = useState('');
  const [regBusEmail, setRegBusEmail] = useState('');
  const [regBusPassword, setRegBusPassword] = useState('');
  const [regOwnerName, setRegOwnerName] = useState('');
  const [regOwnerEmail, setRegOwnerEmail] = useState('');
  const [regOwnerPassword, setRegOwnerPassword] = useState('');

  // User Login State
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');

  // Determine active view automatically based on auth state
  React.useEffect(() => {
    if (businessToken && !user) {
      setView('user_login');
    }
  }, [businessToken, user]);

  const handleBusinessLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await loginBusiness({ email: busEmail, password: busPassword });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid business credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleBusinessRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await registerBusiness({
        business: {
          name: regBusName,
          email: regBusEmail,
          password: regBusPassword
        },
        owner_name: regOwnerName,
        owner_email: regOwnerEmail,
        owner_password: regOwnerPassword
      });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to register business');
    } finally {
      setLoading(false);
    }
  };

  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await loginUser({ email: userEmail, password: userPassword });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid user credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0A0C10]">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]"></div>

      {/* Header/Nav for unauthenticated state */}
      <div className="absolute top-0 inset-x-0 p-6 flex justify-between items-center z-10">
        <div className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          SynCommerce
        </div>
        {!businessToken && (
          <button 
            onClick={() => setView(view === 'business_login' ? 'business_register' : 'business_login')}
            className="text-sm font-medium text-white/80 hover:text-white transition-colors"
          >
            {view === 'business_login' ? 'Register Business' : 'Sign In'}
          </button>
        )}
      </div>

      <div className="glass w-full max-w-md p-8 rounded-3xl relative z-10 border border-white/10 shadow-2xl">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {view === 'business_login' && (
          <div className="animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-6 mx-auto">
              <Building2 className="text-blue-400" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-center mb-2">Workspace Login</h2>
            <p className="text-muted text-center mb-8 text-sm">Sign in to your business workspace</p>
            
            <form onSubmit={handleBusinessLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted mb-1.5">Business Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                  <input 
                    type="email" 
                    value={busEmail}
                    onChange={(e) => setBusEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="workspace@company.com"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted mb-1.5">Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                  <input 
                    type="password" 
                    value={busPassword}
                    onChange={(e) => setBusPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full btn-primary py-3 rounded-xl font-medium mt-4 flex items-center justify-center gap-2"
              >
                {loading ? 'Authenticating...' : 'Access Workspace'}
                <ArrowRight size={18} />
              </button>
            </form>
          </div>
        )}

        {view === 'business_register' && (
          <div className="animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-blue-500/20 flex items-center justify-center mb-6 mx-auto">
              <UserPlus className="text-green-400" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-center mb-2">Create Workspace</h2>
            <p className="text-muted text-center mb-8 text-sm">Register your business and owner account</p>
            
            <form onSubmit={handleBusinessRegister} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              <div className="space-y-4 pb-4 border-b border-white/10">
                <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Business Details</h3>
                <input type="text" placeholder="Business Name" required value={regBusName} onChange={e=>setRegBusName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4" />
                <input type="email" placeholder="Business Email" required value={regBusEmail} onChange={e=>setRegBusEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4" />
                <input type="password" placeholder="Workspace Password" required minLength={6} value={regBusPassword} onChange={e=>setRegBusPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4" />
              </div>
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-semibold text-purple-400 uppercase tracking-wider">Owner Details</h3>
                <input type="text" placeholder="Owner Name" required value={regOwnerName} onChange={e=>setRegOwnerName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4" />
                <input type="email" placeholder="Owner Email" required value={regOwnerEmail} onChange={e=>setRegOwnerEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4" />
                <input type="password" placeholder="Owner Password" required minLength={6} value={regOwnerPassword} onChange={e=>setRegOwnerPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white py-3 rounded-xl font-medium mt-6 shadow-lg shadow-green-500/20">
                {loading ? 'Creating...' : 'Register Business'}
              </button>
            </form>
          </div>
        )}

        {view === 'user_login' && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-start mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <ShieldCheck className="text-purple-400" size={32} />
              </div>
              <button onClick={logoutBusiness} className="text-xs text-muted hover:text-red-400 transition-colors">
                Switch Workspace
              </button>
            </div>
            <h2 className="text-2xl font-bold mb-2">Who's working?</h2>
            <p className="text-muted mb-8 text-sm">Select your profile to continue</p>
            
            <form onSubmit={handleUserLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted mb-1.5">User Email</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                  <input 
                    type="email" 
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    placeholder="employee@company.com"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted mb-1.5">Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                  <input 
                    type="password" 
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 rounded-xl font-medium mt-4 flex items-center justify-center shadow-lg shadow-purple-500/20"
              >
                {loading ? 'Authenticating...' : 'Login to Profile'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
