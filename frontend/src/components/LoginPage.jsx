import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';
import apiClient from '../api/client';

export default function LoginPage({ onLoginSuccess, onBackToPublic }) {
  const [email, setEmail] = useState('admin@church.local');
  const [password, setPassword] = useState('Password123!');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const demoAccounts = [
    { role: '👑 Super Admin', name: 'Pastor David Mensah', email: 'admin@church.local', roleId: 1, color: 'border-amber-500/50 bg-amber-500/10 text-amber-800' },
    { role: '📸 Media & Creative Lead', name: 'Kofi Ansah', email: 'media@church.local', roleId: 2, color: 'border-cyan-500/50 bg-cyan-500/10 text-cyan-800' },
    { role: '📋 Records & Attendance', name: 'Abena Osei', email: 'records@church.local', roleId: 3, color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-800' },
    { role: '🤝 Youth Leader Volunteer', name: 'Emmanuel Owusu', email: 'volunteer@church.local', roleId: 4, color: 'border-indigo-500/50 bg-indigo-500/10 text-indigo-800' },
    { role: '👁️ Council Observer', name: 'Elder Kwame Asante', email: 'viewer@church.local', roleId: 5, color: 'border-slate-500/50 bg-slate-500/10 text-slate-800' },
  ];

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { token, user } = response.data;
      if (token) {
        localStorage.setItem('authToken', token);
        localStorage.setItem('authUser', JSON.stringify(user));
      }
      onLoginSuccess(user);
    } catch (err) {
      console.error('Login error:', err);
      // Fallback demo accounts
      const foundMock = demoAccounts.find((a) => a.email.toLowerCase() === email.toLowerCase());
      if (foundMock) {
        const mockUser = {
          id: foundMock.roleId,
          email: foundMock.email,
          first_name: foundMock.name.split(' ')[0],
          last_name: foundMock.name.split(' ')[1] || 'Staff',
          role_id: foundMock.roleId,
          role: foundMock.roleId === 1 ? 'admin' : foundMock.roleId === 2 ? 'media_team' : foundMock.roleId === 3 ? 'records_officer' : 'volunteer',
          title: foundMock.role
        };
        onLoginSuccess(mockUser);
      } else {
        setError(err.message || 'Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemo = (account) => {
    setEmail(account.email);
    setPassword('Password123!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0fdf9] via-[#f0f7fb] to-[#e8f4fa] flex flex-col justify-center items-center p-4 selection:bg-brand-500 selection:text-white font-['Plus_Jakarta_Sans',sans-serif] relative">
      {/* Background glow */}
      <div className="absolute w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full bg-white border border-tealblue-100 rounded-3xl p-8 shadow-xl relative z-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-mint-400 flex items-center justify-center text-white mx-auto shadow-lg shadow-brand-500/25">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-darkcyan-950 tracking-tight">Staff & Executive Portal</h2>
          <p className="text-xs text-darkcyan-700">
            Secure login for Ministry Leaders, Media Team & Attendance Records
          </p>
        </div>

        {/* Error notice */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-darkcyan-800 mb-1">
              Church Staff Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-darkcyan-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@church.local"
                className="w-full pl-10 pr-4 py-3 bg-mint-50/40 border border-tealblue-200 rounded-xl text-darkcyan-950 text-xs focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-darkcyan-800 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-darkcyan-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-mint-50/40 border border-tealblue-200 rounded-xl text-darkcyan-950 text-xs focus:outline-none focus:border-brand-500 font-mono transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-darkcyan-600 hover:text-darkcyan-900"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-brand-600/30 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick 1-Click Role Switcher Demo Cards */}
        <div className="pt-4 border-t border-tealblue-100 space-y-2.5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-darkcyan-700 block text-center">
            Quick 1-Click Executive Role Demo
          </span>
          <div className="space-y-1.5">
            {demoAccounts.map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => handleSelectDemo(account)}
                className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all hover:scale-[1.01] ${
                  email === account.email
                    ? 'border-brand-500 bg-mint-100/60 ring-1 ring-brand-500'
                    : 'border-tealblue-100 bg-mint-50/40 hover:bg-mint-50'
                }`}
              >
                <div>
                  <span className="font-bold text-darkcyan-950 text-xs block">{account.name}</span>
                  <span className="text-[10px] text-darkcyan-700">{account.email}</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${account.color}`}>
                  {account.role}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Back to Public Site */}
        <div className="text-center pt-2">
          <button
            onClick={onBackToPublic}
            className="text-xs font-bold text-darkcyan-700 hover:text-darkcyan-950 hover:underline transition-colors"
          >
            ← Back to Public Youth Ministry Site
          </button>
        </div>
      </div>
    </div>
  );
}
