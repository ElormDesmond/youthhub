import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Users, Megaphone, Database, Plus, Trash2, Edit3, 
  Image, Calendar, Check, AlertCircle, RefreshCw, Key, FileText, HardDrive,
  Eye, DollarSign, ArrowRight, UserCheck, MessageSquare, Clock, Wine, BookOpen,
  Bell, Smartphone, PieChart as PieIcon, Lock
} from 'lucide-react';
import { PieChart, MetricBar } from './VisualCharts';
import apiClient from '../api/client';

export default function AdminPortal({ youthGroups = [], onOpenNewSessionModal, onInspectPortal, isReadOnly = false }) {
  const [activeAdminSection, setActiveAdminSection] = useState('users'); // 'users' | 'supervision' | 'services' | 'reminders' | 'finance' | 'database'
  const [staffUsers, setStaffUsers] = useState([]);
  const [dbOverview, setDbOverview] = useState(null);
  const [duesList, setDuesList] = useState([]);
  const [payments, setPayments] = useState([]);
  const [sundayService, setSundayService] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Form states: Add Role-Based User with Auto-Generated Credentials
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    first_name: '',
    last_name: '',
    title: 'Youth Executive',
    email: '',
    username: '',
    password: 'Password123!',
    role_id: 2,
    permissions: 'media,events,announcements',
  });
  const [createdCredentials, setCreatedCredentials] = useState(null);

  // Form states: Sunday Service Schedule
  const [serviceForm, setServiceForm] = useState({
    service_date: new Date().toISOString().slice(0, 10),
    service_mode: 'two_services', // 'two_services' | 'joint_service'
    first_service_title: '1st Morning Worship Service',
    first_service_time: '7:00 AM - 9:00 AM',
    second_service_title: '2nd Empowerment & Youth Service',
    second_service_time: '9:30 AM - 12:00 PM',
    joint_service_title: 'Joint Covenant Service',
    joint_service_time: '8:30 AM - 12:30 PM',
    is_communion_sunday: 1,
    service_theme: 'Walking in Divine Purpose & Excellence',
    scripture_reading: '1 Timothy 4:12',
    announcements_note: 'Holy Communion will be administered in both services.',
  });

  // Notification Engine Edit & Create states
  const [editingNotifId, setEditingNotifId] = useState(null);
  const [editNotifForm, setEditNotifForm] = useState({
    title: '',
    first_reminder_time: '06:00 AM',
    last_reminder_time: '05:00 PM',
    message: '',
    reminder_type: 'event_alert',
    channel: 'all'
  });
  const [showAddNotifModal, setShowAddNotifModal] = useState(false);
  const [newNotifForm, setNewNotifForm] = useState({
    title: '',
    first_reminder_time: '06:00 AM',
    last_reminder_time: '05:00 PM',
    message: '',
    reminder_type: 'event_alert',
    channel: 'all'
  });

  // Form states: Create Dues/Levy Campaign
  const [showAddDuesModal, setShowAddDuesModal] = useState(false);
  const [duesForm, setDuesForm] = useState({
    title: '',
    category: 'monthly_dues',
    amount_target: 2000,
    amount_collected: 0,
    amount_disbursed: 0,
    purpose: '',
    period: 'September 2026',
    status: 'open',
  });

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [usersRes, dbRes, duesRes, servRes, notifRes, payRes] = await Promise.all([
        apiClient.get('/admin/users'),
        apiClient.get('/admin/db-overview'),
        apiClient.get('/finance/dues'),
        apiClient.get('/services'),
        apiClient.get('/notifications'),
        apiClient.get('/payments'),
      ]);
      setStaffUsers(usersRes.data.users || []);
      setDbOverview(dbRes.data.database || null);
      setDuesList(duesRes.data.dues || []);
      if (servRes.data.service) {
        setSundayService(servRes.data.service);
        setServiceForm(servRes.data.service);
      }
      setNotifications(notifRes.data.notifications || []);
      setPayments(payRes.data.payments || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const showNotice = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Create User with Role & Generated Credentials
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await apiClient.post('/admin/users', newUserForm);
      setCreatedCredentials(res.data.generated_credentials);
      showNotice(`Role-based account created for ${newUserForm.first_name}!`);
      loadAdminData();
    } catch (err) {
      showNotice(err.response?.data?.error || err.message || 'Failed to create role-based account', 'error');
    }
  };

  const handleUpdateRole = async (userId, newRoleId) => {
    try {
      await apiClient.put(`/admin/users/${userId}/role`, { role_id: parseInt(newRoleId, 10) });
      showNotice('Role updated successfully');
      loadAdminData();
    } catch (err) {
      showNotice(err.response?.data?.error || err.message || 'Failed to update role', 'error');
    }
  };

  const handleDeleteUser = async (userId, name) => {
    if (!confirm(`Are you sure you want to remove staff member ${name}?`)) return;
    try {
      await apiClient.delete(`/admin/users/${userId}`);
      showNotice('Staff member removed');
      loadAdminData();
    } catch (err) {
      showNotice(err.response?.data?.error || err.message || 'Failed to delete user', 'error');
    }
  };

  // Save Sunday Service Order & Communion
  const handleSaveSundayService = async (e) => {
    e.preventDefault();
    try {
      await apiClient.put('/services', serviceForm);
      showNotice('Sunday service order and Communion status updated live on public website!');
      loadAdminData();
    } catch (err) {
      showNotice(err.response?.data?.error || err.message || 'Failed to update Sunday service', 'error');
    }
  };

  // Notification Engine Handlers
  const handleStartEditNotif = (n) => {
    setEditingNotifId(n.id);
    setEditNotifForm({
      title: n.title || n.event_name || '',
      first_reminder_time: n.first_reminder_time || n.target_time || '06:00 AM',
      last_reminder_time: n.last_reminder_time || '05:00 PM',
      message: n.message || '',
      reminder_type: n.reminder_type || 'event_alert',
      channel: n.channel || 'all'
    });
  };

  const handleCancelEditNotif = () => {
    setEditingNotifId(null);
  };

  const handleSaveEditNotif = async (id) => {
    try {
      await apiClient.put(`/notifications/${id}`, {
        title: editNotifForm.title,
        event_name: editNotifForm.title,
        first_reminder_time: editNotifForm.first_reminder_time,
        last_reminder_time: editNotifForm.last_reminder_time,
        target_time: editNotifForm.first_reminder_time,
        message: editNotifForm.message,
        description: editNotifForm.message,
        reminder_type: editNotifForm.reminder_type,
        channel: editNotifForm.channel
      });
      showNotice('Automated notification alert updated successfully!');
      setEditingNotifId(null);
      loadAdminData();
    } catch (err) {
      showNotice(err.response?.data?.error || err.message || 'Failed to update reminder', 'error');
    }
  };

  const handleDeleteNotif = async (id, title) => {
    if (!confirm(`Delete reminder "${title}"?`)) return;
    try {
      await apiClient.delete(`/notifications/${id}`);
      showNotice('Notification alert removed');
      loadAdminData();
    } catch (err) {
      showNotice(err.response?.data?.error || err.message || 'Failed to delete notification', 'error');
    }
  };

  const handleCreateNotif = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/notifications', {
        title: newNotifForm.title,
        event_name: newNotifForm.title,
        first_reminder_time: newNotifForm.first_reminder_time,
        last_reminder_time: newNotifForm.last_reminder_time,
        target_time: newNotifForm.first_reminder_time,
        message: newNotifForm.message,
        description: newNotifForm.message,
        reminder_type: newNotifForm.reminder_type,
        channel: newNotifForm.channel
      });
      showNotice('New scheduled event reminder created & broadcasted!');
      setShowAddNotifModal(false);
      setNewNotifForm({
        title: '',
        first_reminder_time: '06:00 AM',
        last_reminder_time: '05:00 PM',
        message: '',
        reminder_type: 'event_alert',
        channel: 'all'
      });
      loadAdminData();
    } catch (err) {
      showNotice(err.response?.data?.error || err.message || 'Failed to create reminder', 'error');
    }
  };

  // Sync Weekly Reminders
  const handleSyncWeeklyReminders = async () => {
    try {
      await apiClient.post('/notifications/sync-weekly', {});
      showNotice('Monday youth alert, Tuesday 5pm call & Saturday service alerts synchronized!');
      loadAdminData();
    } catch (err) {
      showNotice(err.response?.data?.error || err.message || 'Failed to sync reminders', 'error');
    }
  };

  // Create Dues Campaign
  const handleCreateDues = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/finance/dues', duesForm);
      showNotice('Financial transparency campaign published!');
      setShowAddDuesModal(false);
      loadAdminData();
    } catch (err) {
      showNotice(err.message || 'Failed to create dues campaign', 'error');
    }
  };

  // Visual Chart Data: Roles Distribution
  const roleChartData = [
    { label: 'Administrators', value: staffUsers.filter((u) => u.role_id === 1).length, color: '#f59e0b' },
    { label: 'Media Team', value: staffUsers.filter((u) => u.role_id === 2).length, color: '#06b6d4' },
    { label: 'Records Desk', value: staffUsers.filter((u) => u.role_id === 3).length, color: '#16a34a' },
    { label: 'Volunteers', value: staffUsers.filter((u) => u.role_id === 4).length, color: '#8b5cf6' },
    { label: 'Council Viewers', value: staffUsers.filter((u) => u.role_id === 5).length, color: '#64748b' },
  ];

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      {notification && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 shadow-sm ${notification.type === 'error' ? 'bg-rose-50 text-rose-800' : 'bg-emerald-50 text-emerald-800'}`}>
          <Check className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-semibold">{notification.msg}</span>
        </div>
      )}

      {/* 👑 Super Admin Hub Header */}
      <div className="bg-white text-darkcyan-950 rounded-3xl p-6 border border-tealblue-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm transition-colors">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-black shadow-lg flex-shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">Global Evangelical Church Youth (Kasoa) — Admin Center</h2>
              <span className="bg-amber-400/20 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-amber-400/40">
                Master Admin
              </span>
            </div>
            <p className="text-xs text-darkcyan-700">
              Role Generator, Sunday Service & Communion Control, Automated Reminders & Visual Analytics
            </p>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-1 bg-mint-50/80 p-1 rounded-xl flex-wrap">
          {[
            { id: 'users', label: 'Staff & Roles', icon: Users },
            { id: 'supervision', label: 'Supervisor Audit', icon: Eye },
            { id: 'services', label: 'Sunday Services', icon: Wine },
            { id: 'reminders', label: 'Reminders & Alerts', icon: Bell },
            { id: 'finance', label: 'Dues & MoMo', icon: DollarSign },
            { id: 'database', label: 'Database Health', icon: Database },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeAdminSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveAdminSection(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 shadow-sm font-extrabold'
                    : 'text-darkcyan-700 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 👥 SECTION 1: STAFF & ROLE-BASED ACCESS CONTROL (RBAC) */}
      {/* ========================================================================= */}
      {activeAdminSection === 'users' && (
        <div className="bg-white rounded-3xl p-6 border border-tealblue-100 shadow-sm space-y-6 transition-colors">
          {isReadOnly && (
            <div className="p-3 bg-amber-500/15 border border-amber-500/30 rounded-2xl flex items-center gap-2 text-amber-900 text-xs font-bold mb-3">
              <Eye className="w-4 h-4 text-amber-700 flex-shrink-0" />
              <span>Master Troubleshooter Observation Mode: You have full read-only visibility into all present and future executive accounts.</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-tealblue-100">
            <div>
              <h3 className="font-bold text-darkcyan-950 text-lg">Staff & Role-Based Access Control (RBAC)</h3>
              <p className="text-xs text-darkcyan-600">
                Generate dedicated role accounts with titles and default login credentials. Staff can update their password and username upon signing in.
              </p>
            </div>
            {!isReadOnly && (
              <button
                onClick={() => { setShowAddUserModal(true); setCreatedCredentials(null); }}
                className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Generate Role-Based User</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2 overflow-x-auto">
              <table className="w-full text-left text-xs text-darkcyan-800">
                <thead className="bg-mint-50/70 text-slate-700 uppercase font-bold text-[10px] tracking-wider border-y border-tealblue-100">
                  <tr>
                    <th className="py-3 px-3">Executive</th>
                    <th className="py-3 px-3">Title</th>
                    <th className="py-3 px-3">Role</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-tealblue-50">
                  {staffUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-darkcyan-950 flex items-center gap-1.5">
                          <span>{user.first_name} {user.last_name}</span>
                          {user.id === 1 && (
                            <span className="text-[9px] bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.5 rounded-full border border-amber-300">
                              👑 Youth President
                            </span>
                          )}
                          {user.id === 99 && (
                            <span className="text-[9px] bg-slate-900 text-amber-400 font-extrabold px-1.5 py-0.5 rounded-full border border-amber-500/40">
                              🛡️ Master Key
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-darkcyan-600 font-mono">
                          {user.email} {user.username ? `• @${user.username}` : ''}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-semibold text-darkcyan-700">{user.title || 'Leader'}</td>
                      <td className="py-3 px-3">
                        <select
                          value={user.role_id}
                          onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                          disabled={isReadOnly || user.id === 1 || user.id === 99}
                          className="text-xs font-bold px-2 py-1 rounded-xl border border-tealblue-200 bg-white text-darkcyan-950 disabled:opacity-75 disabled:cursor-not-allowed"
                        >
                          <option value={1}>👑 Admin (Lead)</option>
                          <option value={2}>📸 Media & Creative</option>
                          <option value={3}>📋 Records & Attendance</option>
                          <option value={4}>🤝 Volunteer Youth Leader</option>
                          <option value={5}>👁️ Observer / Council Member</option>
                          {user.id === 99 && <option value={6}>🛡️ Master Troubleshooter</option>}
                        </select>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {!isReadOnly && user.id !== 1 && user.id !== 99 && (
                          <button
                            onClick={() => handleDeleteUser(user.id, `${user.first_name} ${user.last_name}`)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                            title="Remove staff access"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Visual Staff Distribution Pie Chart */}
            <div className="p-5 rounded-2xl bg-mint-50/70 border border-tealblue-100 transition-colors">
              <h4 className="text-xs font-bold text-darkcyan-800 uppercase mb-2">Executive Roles Breakdown</h4>
              <PieChart data={roleChartData} size={150} strokeWidth={24} centerLabel={`${staffUsers.length}`} centerSubtext="Staff" />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🔍 SECTION 2: EXECUTIVE SUPERVISOR & AUDIT MODE */}
      {/* ========================================================================= */}
      {activeAdminSection === 'supervision' && (
        <div className="bg-white rounded-3xl p-6 border border-tealblue-100 shadow-sm space-y-6 transition-colors">
          <div className="pb-4 border-b border-tealblue-100">
            <h3 className="font-bold text-darkcyan-950 text-lg">Executive Supervisor & Non-Destructive Audit Portal</h3>
            <p className="text-xs text-darkcyan-600">
              Inspect Media & Records workspaces in <strong>Read-Only Mode</strong> and leave supervisory guidance without altering live data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 rounded-3xl border border-cyan-200 bg-cyan-50/40 space-y-3 transition-colors">
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-cyan-100 text-cyan-800 uppercase">
                Media Team Portal
              </span>
              <h4 className="text-lg font-bold text-darkcyan-950">Media & Creative Team Workspace</h4>
              <p className="text-xs text-darkcyan-700">
                Inspect gallery photos, YouTube videos, and yearly timeline dates set by Kofi Ansah.
              </p>
              <button
                onClick={() => onInspectPortal('media')}
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Eye className="w-4 h-4" />
                <span>Inspect Media Workspace & Leave Comments</span>
              </button>
            </div>

            <div className="p-6 rounded-3xl border border-emerald-200 bg-emerald-50/40 space-y-3 transition-colors">
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                Records Desk Portal
              </span>
              <h4 className="text-lg font-bold text-darkcyan-950">Records & Attendance Secretary Workspace</h4>
              <p className="text-xs text-darkcyan-700">
                Inspect live roll-calls, member registrations, and CSV analytics managed by Abena Osei.
              </p>
              <button
                onClick={() => onInspectPortal('records')}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Eye className="w-4 h-4" />
                <span>Inspect Records Workspace & Leave Comments</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ⛪ SECTION 3: SUNDAY SERVICE & COMMUNION CONTROLLER */}
      {/* ========================================================================= */}
      {activeAdminSection === 'services' && (
        <div className="bg-white rounded-3xl p-6 border border-tealblue-100 shadow-sm space-y-6 transition-colors">
          <div className="pb-4 border-b border-tealblue-100">
            <h3 className="font-bold text-darkcyan-950 text-lg">Sunday Service Schedule & Holy Communion Setup</h3>
            <p className="text-xs text-darkcyan-600">
              Configure morning/afternoon service times, joint service mode (single time setting: 8:30 AM - 12:30 PM), and communion status visible on the public website.
            </p>
          </div>

          <form onSubmit={handleSaveSundayService} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-darkcyan-700 block mb-1">Service Mode</label>
                <select
                  value={serviceForm.service_mode}
                  onChange={(e) => setServiceForm({ ...serviceForm, service_mode: e.target.value })}
                  className="w-full p-2.5 text-xs border border-tealblue-200 rounded-xl bg-white text-darkcyan-950 font-bold"
                >
                  <option value="two_services">Two Services (Morning & 2nd Service)</option>
                  <option value="joint_service">Joint Combined Service (Single Service)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-darkcyan-700 block mb-1">Holy Communion Sunday 🍷</label>
                <select
                  value={serviceForm.is_communion_sunday ? '1' : '0'}
                  onChange={(e) => setServiceForm({ ...serviceForm, is_communion_sunday: e.target.value === '1' ? 1 : 0 })}
                  className={`w-full p-2.5 text-xs border rounded-xl font-bold ${
                    serviceForm.is_communion_sunday
                      ? 'bg-rose-50 border-rose-300 text-rose-800'
                      : 'bg-white border-tealblue-200 text-darkcyan-950'
                  }`}
                >
                  <option value="1">🍷 YES - Holy Communion Sunday</option>
                  <option value="0">NO - Regular Worship Service</option>
                </select>
              </div>
            </div>

            {/* If Joint Service: SHOW ONLY ONE FIELD for time setting */}
            {serviceForm.service_mode === 'joint_service' ? (
              <div>
                <label className="text-xs font-bold text-amber-700 block mb-1">
                  Joint Service Time (Only 1 Setting Required) *
                </label>
                <input
                  type="text"
                  required
                  value={serviceForm.joint_service_time || '8:30 AM - 12:30 PM'}
                  onChange={(e) => setServiceForm({ ...serviceForm, joint_service_time: e.target.value })}
                  placeholder="e.g. 8:30 AM - 12:30 PM"
                  className="w-full p-3 text-xs border-2 border-amber-400 bg-amber-50/40 rounded-xl font-bold text-darkcyan-950"
                />
              </div>
            ) : (
              /* Two Services Mode: Show 1st and 2nd Service Times */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-darkcyan-700 block mb-1">1st Morning Service Times</label>
                  <input
                    type="text"
                    value={serviceForm.first_service_time}
                    onChange={(e) => setServiceForm({ ...serviceForm, first_service_time: e.target.value })}
                    className="w-full p-2.5 text-xs border border-tealblue-200 rounded-xl font-semibold bg-white text-darkcyan-950"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-darkcyan-700 block mb-1">2nd Youth Service Times</label>
                  <input
                    type="text"
                    value={serviceForm.second_service_time}
                    onChange={(e) => setServiceForm({ ...serviceForm, second_service_time: e.target.value })}
                    className="w-full p-2.5 text-xs border border-tealblue-200 rounded-xl font-semibold bg-white text-darkcyan-950"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-darkcyan-800 block mb-1">Weekly Theme of the Word</label>
              <input
                type="text"
                value={serviceForm.service_theme}
                onChange={(e) => setServiceForm({ ...serviceForm, service_theme: e.target.value })}
                className="w-full p-2.5 text-xs border border-tealblue-200 rounded-xl font-black text-darkcyan-950 bg-mint-50/40"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-darkcyan-800 block mb-1">Pastor's Bulletin Note</label>
              <input
                type="text"
                value={serviceForm.announcements_note || ''}
                onChange={(e) => setServiceForm({ ...serviceForm, announcements_note: e.target.value })}
                placeholder="e.g. Holy Communion will be administered in both services."
                className="w-full p-2.5 text-xs border border-tealblue-200 rounded-xl bg-mint-50/40 text-darkcyan-950"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all active:scale-95"
            >
              Update Sunday Service Schedule Live
            </button>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🔔 SECTION 4: EDITABLE MULTI-CHANNEL NOTIFICATION ENGINE */}
      {/* ========================================================================= */}
      {activeAdminSection === 'reminders' && (
        <div className="bg-white rounded-3xl p-6 border border-tealblue-100 shadow-sm space-y-6 transition-colors">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-tealblue-100">
            <div>
              <h3 className="font-bold text-darkcyan-950 text-lg">Automated Multi-Channel Notification Engine</h3>
              <p className="text-xs text-darkcyan-600">
                Configure event alerts, 1st & final reminder times, and description broadcasts across public feeds and SMS/WhatsApp.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddNotifModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Scheduled Event Alert</span>
              </button>
              <button
                onClick={handleSyncWeeklyReminders}
                className="flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Broadcast / Sync</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notifications.map((n) => {
              const isEditing = editingNotifId === n.id;
              return (
                <div
                  key={n.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isEditing
                      ? 'border-brand-500 bg-brand-50/20 shadow-md ring-2 ring-brand-500/30'
                      : 'border-tealblue-100 bg-mint-50/70 space-y-3'
                  }`}
                >
                  {isEditing ? (
                    /* 📝 Inline Edit Form */
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-brand-200">
                        <span className="text-xs font-black text-brand-700 uppercase tracking-wider">
                          Edit Scheduled Reminder #{n.id}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">Live Editor</span>
                      </div>

                      {/* Event Field */}
                      <div>
                        <label className="text-[11px] font-bold text-darkcyan-800 block mb-1">
                          Event Title / Alert Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={editNotifForm.title}
                          onChange={(e) => setEditNotifForm({ ...editNotifForm, title: e.target.value })}
                          placeholder="e.g. Tuesday Youth Fellowship"
                          className="w-full px-3 py-2 text-xs border border-tealblue-200 rounded-xl bg-white text-darkcyan-950 font-bold"
                        />
                      </div>

                      {/* Two Time Fields: 1st Reminder & Last Reminder */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] font-bold text-darkcyan-800 block mb-1">
                            1st Reminder Time *
                          </label>
                          <input
                            type="text"
                            required
                            value={editNotifForm.first_reminder_time}
                            onChange={(e) => setEditNotifForm({ ...editNotifForm, first_reminder_time: e.target.value })}
                            placeholder="e.g. 06:00 AM"
                            className="w-full px-3 py-2 text-xs border border-tealblue-200 rounded-xl bg-white text-darkcyan-950 font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-darkcyan-800 block mb-1">
                            Last Reminder / Final Call *
                          </label>
                          <input
                            type="text"
                            required
                            value={editNotifForm.last_reminder_time}
                            onChange={(e) => setEditNotifForm({ ...editNotifForm, last_reminder_time: e.target.value })}
                            placeholder="e.g. 05:00 PM"
                            className="w-full px-3 py-2 text-xs border border-tealblue-200 rounded-xl bg-white text-darkcyan-950 font-mono"
                          />
                        </div>
                      </div>

                      {/* Description Field */}
                      <div>
                        <label className="text-[11px] font-bold text-darkcyan-800 block mb-1">
                          Alert Description & Message *
                        </label>
                        <textarea
                          rows={3}
                          required
                          value={editNotifForm.message}
                          onChange={(e) => setEditNotifForm({ ...editNotifForm, message: e.target.value })}
                          placeholder="Broadcast message sent to youth members..."
                          className="w-full px-3 py-2 text-xs border border-tealblue-200 rounded-xl bg-white text-darkcyan-950 leading-relaxed"
                        ></textarea>
                      </div>

                      {/* Channel */}
                      <div>
                        <label className="text-[11px] font-bold text-darkcyan-800 block mb-1">
                          Delivery Channel
                        </label>
                        <select
                          value={editNotifForm.channel}
                          onChange={(e) => setEditNotifForm({ ...editNotifForm, channel: e.target.value })}
                          className="w-full px-3 py-2 text-xs border border-tealblue-200 rounded-xl bg-white text-darkcyan-950 font-semibold"
                        >
                          <option value="all">All Channels (In-App Drawer, SMS, WhatsApp)</option>
                          <option value="in_app">In-App Notification Drawer Only</option>
                          <option value="sms_hubtel">SMS (Hubtel Gateway)</option>
                          <option value="whatsapp">WhatsApp Community</option>
                        </select>
                      </div>

                      {/* Action buttons */}
                      <div className="flex justify-end gap-2 pt-2 border-t border-brand-200">
                        <button
                          type="button"
                          onClick={handleCancelEditNotif}
                          className="px-3 py-1.5 text-xs font-semibold text-darkcyan-700 hover:text-slate-900"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEditNotif(n.id)}
                          className="px-4 py-1.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-md transition-all active:scale-95"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* 📋 Display Card */
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-bold text-darkcyan-950 text-sm block">
                            {n.title || n.event_name}
                          </span>
                          <span className="text-[10px] bg-brand-100 text-brand-800 font-bold px-2 py-0.5 rounded-full inline-block mt-1">
                            {n.reminder_type || 'Event Alert'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleStartEditNotif(n)}
                            className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all"
                            title="Edit Event & Reminder Times"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteNotif(n.id, n.title)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            title="Delete Alert"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-darkcyan-700 leading-relaxed">{n.message}</p>

                      <div className="p-2.5 rounded-xl bg-white border border-tealblue-100 text-[11px] grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">1st Reminder</span>
                          <span className="font-mono font-bold text-slate-800">
                            {n.first_reminder_time || n.target_time || '06:00 AM'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Last Reminder (Final)</span>
                          <span className="font-mono font-bold text-amber-600">
                            {n.last_reminder_time || '05:00 PM'}
                          </span>
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-400 pt-1 flex justify-between items-center">
                        <span className="capitalize">Channel: {n.channel || 'all'}</span>
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                          Active in Drawer
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 💰 SECTION 5: FINANCIAL & MOMO LEDGER */}
      {/* ========================================================================= */}
      {activeAdminSection === 'finance' && (
        <div className="bg-white rounded-3xl p-6 border border-tealblue-100 shadow-sm space-y-6 transition-colors">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-tealblue-100">
            <div>
              <h3 className="font-bold text-darkcyan-950 text-lg">Financial Dues, Campaigns & MoMo Transactions</h3>
              <p className="text-xs text-darkcyan-600">
                Log and monitor Mobile Money payments received for dues, levies and fundraising.
              </p>
            </div>
            <button
              onClick={() => setShowAddDuesModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Create Dues / Fundraising Campaign</span>
            </button>
          </div>

          {/* MoMo Transactions Table */}
          <div>
            <h4 className="font-bold text-darkcyan-950 text-sm mb-3">Live Mobile Money Payment Transactions (Hubtel Ledger)</h4>
            <div className="overflow-x-auto border border-tealblue-100 rounded-2xl">
              <table className="w-full text-left text-xs text-darkcyan-800">
                <thead className="bg-mint-50/70 text-slate-700 font-bold uppercase text-[10px] border-b border-tealblue-100">
                  <tr>
                    <th className="py-2.5 px-3">Transaction ID</th>
                    <th className="py-2.5 px-3">Payer Name</th>
                    <th className="py-2.5 px-3">Phone</th>
                    <th className="py-2.5 px-3">Network</th>
                    <th className="py-2.5 px-3">Purpose</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-tealblue-50">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-mono text-[11px] font-bold text-darkcyan-800">{p.transaction_id}</td>
                      <td className="py-3 px-3 font-bold text-darkcyan-950">{p.payer_name}</td>
                      <td className="py-3 px-3 font-mono">{p.payer_phone}</td>
                      <td className="py-3 px-3 font-bold text-darkcyan-800">{p.network}</td>
                      <td className="py-3 px-3 text-darkcyan-700 max-w-xs truncate">{p.campaign_title}</td>
                      <td className="py-3 px-3 font-black text-emerald-600">GHS {p.amount}</td>
                      <td className="py-3 px-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 💾 SECTION 6: SECURE DATABASE HEALTH (PATH SCRAMBLED FOR SECURITY) */}
      {/* ========================================================================= */}
      {activeAdminSection === 'database' && (
        <div className="bg-white rounded-3xl p-6 border border-tealblue-100 shadow-sm space-y-6 transition-colors">
          <div className="flex items-center justify-between pb-4 border-b border-tealblue-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-darkcyan-950 text-lg">Encrypted Database Health & Diagnostics</h3>
                <p className="text-xs text-darkcyan-600">Live storage diagnostics and relational table counts (Encrypted Storage)</p>
              </div>
            </div>
            <button onClick={loadAdminData} className="p-2 text-darkcyan-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {dbOverview && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-mint-50/70 border border-tealblue-100">
                <span className="text-[11px] font-bold text-darkcyan-600 uppercase">Engine Driver</span>
                <div className="text-lg font-black text-darkcyan-950 capitalize mt-1">{dbOverview.driver}</div>
                <span className="text-[10px] text-emerald-600 font-semibold">● {dbOverview.status}</span>
              </div>

              <div className="p-4 rounded-2xl bg-mint-50/70 border border-tealblue-100">
                <span className="text-[11px] font-bold text-darkcyan-600 uppercase">File Size</span>
                <div className="text-lg font-black text-darkcyan-950 mt-1">{dbOverview.file_size}</div>
                <span className="text-[10px] text-slate-400">WAL Mode Optimized for 400+ Users</span>
              </div>

              {/* Scrambled Security Vault Token (Disk Path hidden for security) */}
              <div className="p-4 rounded-2xl bg-mint-50/60 text-darkcyan-950 border border-tealblue-200/80 sm:col-span-2 space-y-1 transition-colors">
                <div className="flex items-center gap-1.5 text-brand-600 font-mono text-[10px] uppercase font-bold">
                  <Lock className="w-3 h-3" />
                  <span>Encrypted Storage Vault ID</span>
                </div>
                <div className="text-xs font-mono text-darkcyan-900 truncate bg-white p-2 rounded-lg border border-tealblue-200">
                  SECURE_VAULT_AES256://gec_kasoa_db_cluster_vault_01.wal
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal: Generate Role User */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-tealblue-100 transition-colors">
            <h3 className="text-lg font-bold text-darkcyan-950">Generate Role-Based Access User</h3>
            {createdCredentials ? (
              <div className="p-4 bg-mint-50/70 border border-mint-200 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-brand-700 font-bold text-sm">
                  <Check className="w-5 h-5 text-brand-600" />
                  <span>Role-Based Executive Account Created!</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-tealblue-200 text-xs font-mono space-y-1.5 text-darkcyan-950">
                  <div><strong>Staff Email:</strong> {createdCredentials.email}</div>
                  {createdCredentials.username && <div><strong>Username:</strong> @{createdCredentials.username}</div>}
                  <div><strong>Default Password:</strong> {createdCredentials.temporary_password}</div>
                </div>
                <p className="text-[11px] text-darkcyan-700 leading-normal">
                  🔒 Hand these initial credentials to the staff member. They will be able to customize their password, email, or username via <strong>Account & Security</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => { setShowAddUserModal(false); setCreatedCredentials(null); }}
                  className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateUser} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-darkcyan-800 block mb-1">First Name *</label>
                    <input
                      type="text"
                      required
                      value={newUserForm.first_name}
                      onChange={(e) => setNewUserForm({ ...newUserForm, first_name: e.target.value })}
                      placeholder="e.g. Kofi"
                      className="w-full px-3 py-2 text-xs border border-tealblue-200 rounded-xl bg-mint-50/40 text-darkcyan-950"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-darkcyan-800 block mb-1">Last Name *</label>
                    <input
                      type="text"
                      required
                      value={newUserForm.last_name}
                      onChange={(e) => setNewUserForm({ ...newUserForm, last_name: e.target.value })}
                      placeholder="e.g. Ansah"
                      className="w-full px-3 py-2 text-xs border border-tealblue-200 rounded-xl bg-mint-50/40 text-darkcyan-950"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-darkcyan-800 block mb-1">Staff Email *</label>
                    <input
                      type="email"
                      required
                      value={newUserForm.email}
                      onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                      placeholder="kofi@church.local"
                      className="w-full px-3 py-2 text-xs border border-tealblue-200 rounded-xl bg-mint-50/40 text-darkcyan-950"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-darkcyan-800 block mb-1">Username (Optional)</label>
                    <input
                      type="text"
                      value={newUserForm.username}
                      onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value })}
                      placeholder="e.g. kofimedia"
                      className="w-full px-3 py-2 text-xs border border-tealblue-200 rounded-xl bg-mint-50/40 text-darkcyan-950"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-darkcyan-800 block mb-1">Ministry Title *</label>
                  <input
                    type="text"
                    required
                    value={newUserForm.title}
                    onChange={(e) => setNewUserForm({ ...newUserForm, title: e.target.value })}
                    placeholder="e.g. Lead Sound Engineer"
                    className="w-full px-3 py-2 text-xs border border-tealblue-200 rounded-xl bg-mint-50/40 text-darkcyan-950"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-darkcyan-800 block mb-1">Default Password *</label>
                  <input
                    type="text"
                    required
                    value={newUserForm.password}
                    onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-tealblue-200 rounded-xl bg-mint-50/40 text-darkcyan-950 font-mono"
                  />
                  <span className="text-[10px] text-darkcyan-600 block mt-0.5">
                    Default password given to the staff member. They can change it upon logging in.
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-darkcyan-800 block mb-1">Access Role *</label>
                  <select
                    value={newUserForm.role_id}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role_id: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 text-xs border border-tealblue-200 rounded-xl bg-mint-50/40 text-darkcyan-950"
                  >
                    <option value={2}>📸 Media & Creative Lead</option>
                    <option value={3}>📋 Records & Attendance Secretary</option>
                    <option value={4}>🤝 Volunteer Youth Leader</option>
                    <option value={5}>👁️ Observer / Council Member</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-tealblue-100">
                  <button type="button" onClick={() => setShowAddUserModal(false)} className="px-4 py-2 text-xs font-semibold text-darkcyan-700 hover:text-darkcyan-950">Cancel</button>
                  <button type="submit" className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-md transition-all active:scale-95">Generate Account</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal: Add Dues Campaign */}
      {showAddDuesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-tealblue-100 transition-colors">
            <h3 className="text-lg font-bold text-darkcyan-950">Create Dues or Fundraising Project</h3>
            <form onSubmit={handleCreateDues} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-darkcyan-800 block mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={duesForm.title}
                  onChange={(e) => setDuesForm({ ...duesForm, title: e.target.value })}
                  placeholder="e.g. Youth Sound System Project"
                  className="w-full px-3 py-2 text-xs border border-tealblue-200 rounded-xl bg-mint-50/40 text-darkcyan-950"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-darkcyan-800 block mb-1">Target (GHS) *</label>
                <input
                  type="number"
                  required
                  value={duesForm.amount_target}
                  onChange={(e) => setDuesForm({ ...duesForm, amount_target: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-tealblue-200 rounded-xl bg-mint-50/40 text-darkcyan-950"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-darkcyan-800 block mb-1">Purpose / Details</label>
                <textarea
                  rows="2"
                  value={duesForm.purpose}
                  onChange={(e) => setDuesForm({ ...duesForm, purpose: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-tealblue-200 rounded-xl bg-mint-50/40 text-darkcyan-950"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-tealblue-100">
                <button type="button" onClick={() => setShowAddDuesModal(false)} className="px-4 py-2 text-xs font-semibold text-darkcyan-700 hover:text-darkcyan-950">Cancel</button>
                <button type="submit" className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-md transition-all active:scale-95">Publish Campaign</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🔔 Modal: Add New Scheduled Event Alert */}
      {showAddNotifModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-tealblue-100 transition-colors">
            <div className="flex justify-between items-center pb-2 border-b border-tealblue-100">
              <h3 className="text-lg font-bold text-darkcyan-950">Create & Schedule Event Alert</h3>
              <button onClick={() => setShowAddNotifModal(false)} className="text-darkcyan-400 hover:text-darkcyan-700 text-sm font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateNotif} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-darkcyan-800 block mb-1">
                  Event Title / Alert Name *
                </label>
                <input
                  type="text"
                  required
                  value={newNotifForm.title}
                  onChange={(e) => setNewNotifForm({ ...newNotifForm, title: e.target.value })}
                  placeholder="e.g. Youth Camp Countdown or Tuesday Fellowship"
                  className="w-full px-3 py-2 text-xs border border-tealblue-200 rounded-xl bg-mint-50/40 text-darkcyan-950 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-darkcyan-800 block mb-1">
                    1st Reminder Time *
                  </label>
                  <input
                    type="text"
                    required
                    value={newNotifForm.first_reminder_time}
                    onChange={(e) => setNewNotifForm({ ...newNotifForm, first_reminder_time: e.target.value })}
                    placeholder="e.g. 06:00 AM"
                    className="w-full px-3 py-2 text-xs border border-tealblue-200 rounded-xl bg-mint-50/40 text-darkcyan-950 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-darkcyan-800 block mb-1">
                    Last Reminder / Final Call *
                  </label>
                  <input
                    type="text"
                    required
                    value={newNotifForm.last_reminder_time}
                    onChange={(e) => setNewNotifForm({ ...newNotifForm, last_reminder_time: e.target.value })}
                    placeholder="e.g. 05:00 PM"
                    className="w-full px-3 py-2 text-xs border border-tealblue-200 rounded-xl bg-mint-50/40 text-darkcyan-950 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-darkcyan-800 block mb-1">
                  Description & Message *
                </label>
                <textarea
                  rows={3}
                  required
                  value={newNotifForm.message}
                  onChange={(e) => setNewNotifForm({ ...newNotifForm, message: e.target.value })}
                  placeholder="Detailed notification message sent to youth members..."
                  className="w-full px-3 py-2 text-xs border border-tealblue-200 rounded-xl bg-mint-50/40 text-darkcyan-950 leading-relaxed"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-darkcyan-800 block mb-1">
                    Reminder Category
                  </label>
                  <select
                    value={newNotifForm.reminder_type}
                    onChange={(e) => setNewNotifForm({ ...newNotifForm, reminder_type: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-tealblue-200 rounded-xl bg-mint-50/40 text-darkcyan-950"
                  >
                    <option value="monday_tuesday_meeting">Monday Youth Reminder</option>
                    <option value="tuesday_5pm_alert">Tuesday Final Call</option>
                    <option value="saturday_6pm_service">Saturday Service Alert</option>
                    <option value="event_week_prior">Event 7-Day Alert</option>
                    <option value="event_3days_prior">Event 3-Day Alert</option>
                    <option value="event_morning">Event Morning Alert</option>
                    <option value="custom_alert">Custom Special Event Alert</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-darkcyan-800 block mb-1">
                    Channel
                  </label>
                  <select
                    value={newNotifForm.channel}
                    onChange={(e) => setNewNotifForm({ ...newNotifForm, channel: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-tealblue-200 rounded-xl bg-mint-50/40 text-darkcyan-950"
                  >
                    <option value="all">All Channels (Drawer + SMS + WhatsApp)</option>
                    <option value="in_app">In-App Drawer Only</option>
                    <option value="sms_hubtel">SMS Gateway</option>
                    <option value="whatsapp">WhatsApp Community</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-tealblue-100">
                <button
                  type="button"
                  onClick={() => setShowAddNotifModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-darkcyan-700 hover:text-darkcyan-950"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-md transition-all active:scale-95"
                >
                  Create & Schedule Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
