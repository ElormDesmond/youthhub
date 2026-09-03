import React, { useState } from 'react';
import { ShieldCheck, User, Mail, Lock, Key, X, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';
import apiClient from '../api/client';

export default function AccountSettingsModal({ isOpen, onClose, currentUser, onUserUpdated }) {
  if (!isOpen || !currentUser) return null;

  const [firstName, setFirstName] = useState(currentUser.first_name || '');
  const [lastName, setLastName] = useState(currentUser.last_name || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [username, setUsername] = useState(currentUser.username || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword && newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim().toLowerCase(),
        username: username.trim() ? username.trim().toLowerCase() : null
      };

      if (newPassword) {
        payload.new_password = newPassword;
        if (currentPassword) {
          payload.current_password = currentPassword;
        }
      }

      const res = await apiClient.put('/auth/profile', payload);
      if (res.data.success) {
        setSuccess('Account and security credentials updated successfully!');
        if (res.data.token) {
          localStorage.setItem('authToken', res.data.token);
          localStorage.setItem('authUser', JSON.stringify(res.data.user));
        }
        if (onUserUpdated) {
          onUserUpdated(res.data.user);
        }
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (err) {
      console.error('Update profile error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to update account credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="bg-white border border-tealblue-100 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 p-2 text-darkcyan-600 hover:text-darkcyan-950 hover:bg-mint-50 rounded-xl transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-tealblue-100 pb-4">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-mint-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-darkcyan-950">My Account & Security</h3>
            <p className="text-xs text-darkcyan-600">
              Customize your login email, username, or change your password
            </p>
          </div>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
            <Check className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Names */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-darkcyan-800 mb-1">
                First Name
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 bg-mint-50/40 border border-tealblue-200 rounded-xl text-darkcyan-950 text-xs focus:outline-none focus:border-brand-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-darkcyan-800 mb-1">
                Last Name
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 bg-mint-50/40 border border-tealblue-200 rounded-xl text-darkcyan-950 text-xs focus:outline-none focus:border-brand-500 font-medium"
              />
            </div>
          </div>

          {/* Email & Username */}
          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-darkcyan-800 mb-1">
                Account Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-darkcyan-600 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-mint-50/40 border border-tealblue-200 rounded-xl text-darkcyan-950 text-xs focus:outline-none focus:border-brand-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-darkcyan-800 mb-1">
                Custom Username (Optional for Login)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-darkcyan-600 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. kinsley or youthleader"
                  className="w-full pl-9 pr-3 py-2 bg-mint-50/40 border border-tealblue-200 rounded-xl text-darkcyan-950 text-xs focus:outline-none focus:border-brand-500 font-medium"
                />
              </div>
              <span className="text-[10px] text-darkcyan-600 mt-1 block">
                You can use either this username or your email to sign in.
              </span>
            </div>
          </div>

          {/* Password Change Section */}
          <div className="pt-3 border-t border-tealblue-100 space-y-3">
            <h4 className="text-xs font-bold text-darkcyan-950 uppercase tracking-wider">
              Change Password (Leave blank to keep current)
            </h4>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-darkcyan-800 mb-1">
                Current Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-darkcyan-600 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password to verify"
                  className="w-full pl-9 pr-9 py-2 bg-mint-50/40 border border-tealblue-200 rounded-xl text-darkcyan-950 text-xs focus:outline-none focus:border-brand-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-darkcyan-600 hover:text-darkcyan-900"
                >
                  {showCurrentPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-darkcyan-800 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    className="w-full px-3 py-2 bg-mint-50/40 border border-tealblue-200 rounded-xl text-darkcyan-950 text-xs focus:outline-none focus:border-brand-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-darkcyan-600 hover:text-darkcyan-900"
                  >
                    {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-darkcyan-800 mb-1">
                  Confirm Password
                </label>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-3 py-2 bg-mint-50/40 border border-tealblue-200 rounded-xl text-darkcyan-950 text-xs focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-2 border-t border-tealblue-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-darkcyan-700 hover:bg-mint-50 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-600/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Saving Changes...' : 'Save & Update Credentials'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
