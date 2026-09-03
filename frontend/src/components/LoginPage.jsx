import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';
import apiClient from '../api/client';

export default function LoginPage({ onLoginSuccess, onBackToPublic }) {
  const [email, setEmail] = useState('admin@church.local');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/auth/login', { email: email.trim(), password });
      const { token, user } = response.data;
      if (token) {
        localStorage.setItem('authToken', token);
        localStorage.setItem('authUser', JSON.stringify(user));
      }
      onLoginSuccess(user);
    } catch (err) {
      console.error('Login error:', err);
      const errMsg = err.response?.data?.error || err.message || 'Invalid email/username or password';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
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
            Secure login for Church Leadership, Ministry Heads & Executives
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
              Staff Email or Username
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-darkcyan-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@church.local or username"
                className="w-full pl-10 pr-4 py-3 bg-mint-50/40 border border-tealblue-200 rounded-xl text-darkcyan-950 text-xs focus:outline-none focus:border-brand-500 transition-colors font-medium"
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
                placeholder="Enter your password"
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

        {/* Super Administrator Info Card (NO password shown) */}
        <div className="p-4 rounded-2xl bg-mint-50/70 border border-tealblue-200/80 space-y-2 text-left">
          <div className="flex items-center gap-1.5 text-xs font-bold text-darkcyan-950">
            <ShieldCheck className="w-4 h-4 text-brand-600" />
            <span>Super Administrator Access</span>
          </div>
          <div className="text-[11px] text-darkcyan-800 space-y-1 pl-5">
            <div>
              <span className="text-darkcyan-600">Assigned To: </span>
              <strong className="text-darkcyan-950">Mr. Kinsley</strong>{' '}
              <span className="text-[10px] bg-brand-100 text-brand-800 font-bold px-1.5 py-0.5 rounded-full">Youth President</span>
            </div>
            <div>
              <span className="text-darkcyan-600">Login Email: </span>
              <code className="font-mono bg-white px-2 py-0.5 rounded border border-tealblue-100 text-brand-700 font-bold">admin@church.local</code>
            </div>
            <p className="text-[10px] text-darkcyan-600 pt-1 leading-normal">
              🔒 Confidential password is provided directly by the System Administrator. Staff roles are managed exclusively inside the executive portal.
            </p>
          </div>
        </div>

        {/* Back to Public Site */}
        <div className="text-center pt-1">
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
