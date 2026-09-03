import React, { useState, useEffect } from 'react';
import PublicYouthWebsite from './components/PublicYouthWebsite';
import LoginPage from './components/LoginPage';
import AdminPortal from './components/AdminPortal';
import MediaExecutivePortal from './components/MediaExecutivePortal';
import RecordsExecutivePortal from './components/RecordsExecutivePortal';
import RegistrationForm from './components/RegistrationForm';
import SessionModal from './components/SessionModal';
import AccountSettingsModal from './components/AccountSettingsModal';
import { useAttendance } from './hooks/useAttendance';
import { useMembers } from './hooks/useMembers';
import { useSessions } from './hooks/useSessions';
import { ShieldCheck, LogOut, ArrowLeft, Eye, Users, Flame, Sparkles, ExternalLink, Key } from 'lucide-react';

export default function App() {
  // Navigation Modes: 'public' | 'login' | 'dashboard' | 'register_public'
  const [viewMode, setViewMode] = useState('public');
  const [currentUser, setCurrentUser] = useState(null);

  // Clean and ensure no residual dark mode classes exist
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');
    try {
      localStorage.removeItem('church_theme');
    } catch (e) {}
  }, []);

  // Supervisor Inspection Mode (When Super Admin inspects Media or Records workspaces in Read-Only + Comment mode)
  const [inspectedPortal, setInspectedPortal] = useState(null); // null | 'media' | 'records'

  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [masterViewTab, setMasterViewTab] = useState('admin'); // 'admin' | 'media' | 'records'

  // Custom data hooks
  const {
    sessions,
    activeSession,
    setActiveSession,
    fetchSessions,
    createSession,
  } = useSessions();

  const {
    members,
    groups,
    fetchMembers,
    registerMember,
    deleteMember,
  } = useMembers();

  const {
    roster,
    stats,
    loading: attendanceLoading,
    error: attendanceError,
    fetchSessionAttendance,
    markStatus,
    markAllPresent,
  } = useAttendance();

  // Load saved session user if exists
  useEffect(() => {
    const savedUser = localStorage.getItem('authUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
      } catch (e) {}
    }
  }, []);

  // Fetch session attendance on session change
  useEffect(() => {
    if (activeSession?.id) {
      fetchSessionAttendance(activeSession.id);
    }
  }, [activeSession?.id, fetchSessionAttendance]);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setViewMode('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setCurrentUser(null);
    setInspectedPortal(null);
    setViewMode('public');
  };

  return (
    <div className="min-h-screen bg-mint-50/30 text-darkcyan-950 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* ========================================================================= */}
      {/* 1. PUBLIC YOUTH PORTAL (THE CONSUMER WEBSITE) */}
      {/* ========================================================================= */}
      {viewMode === 'public' && (
        <PublicYouthWebsite
          onOpenLogin={() => setViewMode('login')}
          onOpenRegisterModal={() => setViewMode('register_public')}
        />
      )}

      {/* ========================================================================= */}
      {/* 2. PUBLIC REGISTRATION / ENROLLMENT FORM */}
      {/* ========================================================================= */}
      {viewMode === 'register_public' && (
        <div className="min-h-screen bg-mint-50/40 p-4 sm:p-8 flex flex-col justify-center items-center">
          <div className="max-w-4xl w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 border border-tealblue-100">
            <div className="flex items-center justify-between border-b border-tealblue-100 pb-4">
              <div>
                <h2 className="text-2xl font-black text-darkcyan-950">Join Grace Community Youth Ministry</h2>
                <p className="text-xs text-darkcyan-700">Fill in your information to be enrolled in our youth registry</p>
              </div>
              <button
                onClick={() => setViewMode('public')}
                className="text-xs font-bold text-darkcyan-700 hover:text-darkcyan-950"
              >
                ✕ Back to Public Site
              </button>
            </div>

            <RegistrationForm
              members={members}
              youthGroups={groups}
              onRegisterMember={registerMember}
              onDeleteMember={deleteMember}
              onRefresh={fetchMembers}
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. DEDICATED LOGIN SCREEN */}
      {/* ========================================================================= */}
      {viewMode === 'login' && (
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onBackToPublic={() => setViewMode('public')}
        />
      )}

      {/* ========================================================================= */}
      {/* 4. AUTHENTICATED ROLE-BASED DASHBOARDS */}
      {/* ========================================================================= */}
      {viewMode === 'dashboard' && currentUser && (
        <div className="min-h-screen bg-gradient-to-b from-[#f0fdf9] via-[#f0f7fb] to-[#e8f4fa] text-darkcyan-950 flex flex-col">
          {/* Executive Header Bar */}
          <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md text-darkcyan-950 border-b border-tealblue-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                {/* Brand & Workspace Title */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-mint-400 flex items-center justify-center text-white font-black shadow-md shadow-brand-500/20">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm sm:text-base text-darkcyan-950">IGNITE Executive Hub</span>
                      {inspectedPortal && (
                        <span className="bg-amber-500/20 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                          <Eye className="w-3 h-3" /> Inspecting {inspectedPortal.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-darkcyan-700 block truncate font-medium">
                      {currentUser.title || (currentUser.role_id === 1 ? 'Super Administrator' : currentUser.role_id === 2 ? 'Media Lead' : 'Records Secretary')} • {currentUser.first_name} {currentUser.last_name}
                    </span>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2">
                  {inspectedPortal && (
                    <button
                      onClick={() => setInspectedPortal(null)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Admin Panel</span>
                    </button>
                  )}

                  {/* Account & Security Settings */}
                  <button
                    onClick={() => setIsAccountModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-mint-50 hover:bg-mint-100 text-darkcyan-900 text-xs font-bold rounded-xl border border-tealblue-200 transition-colors shadow-sm"
                    title="Change password, update email or username"
                  >
                    <Key className="w-3.5 h-3.5 text-brand-600" />
                    <span className="hidden sm:inline">Account & Security</span>
                  </button>

                  <a
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-mint-50 hover:bg-mint-100 text-darkcyan-800 hover:text-darkcyan-900 text-xs font-bold rounded-xl border border-tealblue-200 transition-colors shadow-sm"
                    title="Open public website in a new tab"
                  >
                    <span>View Public Website</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                  </a>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white text-xs font-bold rounded-xl border border-rose-200 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Dynamic Role-Based Content Area */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 space-y-6">
            {/* If Admin is inspecting a specific workspace in Supervisory Mode */}
            {inspectedPortal === 'media' && (
              <MediaExecutivePortal
                currentUser={currentUser}
                isSupervisorMode={true}
              />
            )}

            {inspectedPortal === 'records' && (
              <RecordsExecutivePortal
                currentUser={currentUser}
                isSupervisorMode={true}
                youthGroups={groups}
                sessions={sessions}
                activeSession={activeSession}
                setActiveSession={setActiveSession}
                roster={roster}
                stats={stats}
                loading={attendanceLoading}
                error={attendanceError}
                onStatusChange={markStatus}
                onMarkAllPresent={markAllPresent}
                onRefresh={() => activeSession && fetchSessionAttendance(activeSession.id)}
                members={members}
                onRegisterMember={registerMember}
                onDeleteMember={deleteMember}
                onRefreshMembers={fetchMembers}
                onOpenNewSessionModal={() => setIsSessionModalOpen(true)}
              />
            )}

            {/* Normal Role Views */}
            {!inspectedPortal && (
              <>
                {/* ROLE 1: 👑 Super Administrator */}
                {currentUser.role_id === 1 && (
                  <AdminPortal
                    youthGroups={groups}
                    onOpenNewSessionModal={() => setIsSessionModalOpen(true)}
                    onInspectPortal={(portalType) => setInspectedPortal(portalType)}
                  />
                )}

                {/* ROLE 2: 📸 Media & Creative Executive */}
                {currentUser.role_id === 2 && (
                  <MediaExecutivePortal
                    currentUser={currentUser}
                    isSupervisorMode={false}
                  />
                )}

                {/* ROLE 3 & 4: 📋 Records & Attendance Secretary / Volunteer */}
                {(currentUser.role_id === 3 || currentUser.role_id === 4) && (
                  <RecordsExecutivePortal
                    currentUser={currentUser}
                    isSupervisorMode={false}
                    youthGroups={groups}
                    sessions={sessions}
                    activeSession={activeSession}
                    setActiveSession={setActiveSession}
                    roster={roster}
                    stats={stats}
                    loading={attendanceLoading}
                    error={attendanceError}
                    onStatusChange={markStatus}
                    onMarkAllPresent={markAllPresent}
                    onRefresh={() => activeSession && fetchSessionAttendance(activeSession.id)}
                    members={members}
                    onRegisterMember={registerMember}
                    onDeleteMember={deleteMember}
                    onRefreshMembers={fetchMembers}
                    onOpenNewSessionModal={() => setIsSessionModalOpen(true)}
                  />
                )}

                {/* ROLE 5: 👁️ Observer / Council Member */}
                {currentUser.role_id === 5 && !currentUser.is_master && currentUser.email !== 'babayaga@local' && (
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-tealblue-100 shadow-sm transition-colors">
                      <h3 className="text-xl font-bold text-darkcyan-950">Church Council & Observer Dashboard</h3>
                      <p className="text-xs text-darkcyan-700">Read-only oversight of youth attendance and open financial records.</p>
                    </div>
                    <RecordsExecutivePortal
                      currentUser={currentUser}
                      isSupervisorMode={true}
                      youthGroups={groups}
                      sessions={sessions}
                      activeSession={activeSession}
                      setActiveSession={setActiveSession}
                      roster={roster}
                      stats={stats}
                      loading={attendanceLoading}
                      members={members}
                      onRefresh={() => activeSession && fetchSessionAttendance(activeSession.id)}
                      onRefreshMembers={fetchMembers}
                    />
                  </div>
                )}

                {/* ROLE 6 & MASTER KEY: 🛡️ System Master Key Troubleshooter (babayaga@local) */}
                {(currentUser.role_id === 6 || currentUser.is_master || currentUser.email === 'babayaga@local') && (
                  <div className="space-y-6">
                    {/* Master Diagnostic Header Bar */}
                    <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-white">System Master Key</span>
                            <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                              Read-Only Observer Console
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">
                            Troubleshooting active • Inspecting all present & future executive roles assigned by the Administrator
                          </p>
                        </div>
                      </div>

                      {/* Perspective Switcher */}
                      <div className="flex items-center gap-1.5 bg-slate-800/90 p-1.5 rounded-2xl border border-slate-700">
                        <button
                          onClick={() => setMasterViewTab('admin')}
                          className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                            masterViewTab === 'admin'
                              ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                              : 'text-slate-300 hover:text-white'
                          }`}
                        >
                          👑 Admin View
                        </button>
                        <button
                          onClick={() => setMasterViewTab('media')}
                          className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                            masterViewTab === 'media'
                              ? 'bg-cyan-500 text-white shadow-md font-extrabold'
                              : 'text-slate-300 hover:text-white'
                          }`}
                        >
                          📸 Media View
                        </button>
                        <button
                          onClick={() => setMasterViewTab('records')}
                          className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                            masterViewTab === 'records'
                              ? 'bg-emerald-500 text-white shadow-md font-extrabold'
                              : 'text-slate-300 hover:text-white'
                          }`}
                        >
                          📋 Records View
                        </button>
                      </div>
                    </div>

                    {/* View based on selected role perspective in read-only observation mode */}
                    {masterViewTab === 'admin' && (
                      <AdminPortal
                        youthGroups={groups}
                        isReadOnly={true}
                        onOpenNewSessionModal={() => {}}
                        onInspectPortal={(portalType) => setMasterViewTab(portalType)}
                      />
                    )}

                    {masterViewTab === 'media' && (
                      <MediaExecutivePortal
                        currentUser={currentUser}
                        isSupervisorMode={true}
                      />
                    )}

                    {masterViewTab === 'records' && (
                      <RecordsExecutivePortal
                        currentUser={currentUser}
                        isSupervisorMode={true}
                        youthGroups={groups}
                        sessions={sessions}
                        activeSession={activeSession}
                        setActiveSession={setActiveSession}
                        roster={roster}
                        stats={stats}
                        loading={attendanceLoading}
                        members={members}
                        onRefresh={() => activeSession && fetchSessionAttendance(activeSession.id)}
                        onRefreshMembers={fetchMembers}
                      />
                    )}
                  </div>
                )}
              </>
            )}
          </main>

          {/* Create Session Modal */}
          <SessionModal
            isOpen={isSessionModalOpen}
            onClose={() => setIsSessionModalOpen(false)}
            onCreateSession={createSession}
            youthGroups={groups}
          />

          {/* My Account & Security Settings Modal */}
          <AccountSettingsModal
            isOpen={isAccountModalOpen}
            onClose={() => setIsAccountModalOpen(false)}
            currentUser={currentUser}
            onUserUpdated={(updatedUser) => {
              setCurrentUser(updatedUser);
            }}
          />
        </div>
      )}
    </div>
  );
}
