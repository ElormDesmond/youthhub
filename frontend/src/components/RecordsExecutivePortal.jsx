import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, Users, UserPlus, BarChart3, 
  MessageSquare, Sparkles, Check, AlertCircle, Eye, RefreshCw,
  FileSpreadsheet, PieChart as PieIcon, Upload
} from 'lucide-react';
import CheckInDashboard from './CheckInDashboard';
import RegistrationForm from './RegistrationForm';
import ReportsTab from './ReportsTab';
import SessionSelector from './SessionSelector';
import RosterBatchImporter from './RosterBatchImporter';
import { PieChart, MetricBar } from './VisualCharts';
import apiClient from '../api/client';

export default function RecordsExecutivePortal({
  currentUser,
  isSupervisorMode = false,
  youthGroups = [],
  sessions = [],
  activeSession,
  setActiveSession,
  roster = [],
  stats = {},
  loading = false,
  error = null,
  onStatusChange,
  onMarkAllPresent,
  onRefresh,
  members = [],
  onRegisterMember,
  onDeleteMember,
  onRefreshMembers,
  onOpenNewSessionModal,
}) {
  const [activeTab, setActiveTab] = useState('checkin'); // 'checkin' | 'directory' | 'visual_analytics' | 'reports'
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [notification, setNotification] = useState(null);
  const [isBatchImporterOpen, setIsBatchImporterOpen] = useState(false);

  const loadComments = async () => {
    try {
      const res = await apiClient.get('/admin/comments?portal_section=records');
      setComments(res.data.comments || []);
    } catch (err) {
      console.error('Failed to load supervisor comments:', err);
    }
  };

  useEffect(() => {
    loadComments();
  }, []);

  const showNotice = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handlePostSupervisorComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    try {
      await apiClient.post('/admin/comments', {
        portal_section: 'records',
        comment_text: newCommentText.trim(),
      });
      setNewCommentText('');
      showNotice('Supervisor comment logged for Records Team!');
      loadComments();
    } catch (err) {
      showNotice(err.message || 'Failed to log comment', 'error');
    }
  };

  // Pie chart data for current session attendance
  const attendancePieData = [
    { label: 'Present', value: stats.present || 0, color: '#16a34a' },
    { label: 'Late', value: stats.late || 0, color: '#f59e0b' },
    { label: 'Absent', value: stats.absent || 0, color: '#e11d48' },
    { label: 'Excused', value: stats.excused || 0, color: '#8b5cf6' },
    { label: 'Awaiting', value: stats.awaiting || 0, color: '#94a3b8' },
  ];

  // Youth Group member distribution
  const groupDistribution = youthGroups.map((g, idx) => {
    const count = members.filter((m) => m.youth_group_id === g.id).length;
    const colors = ['#0284c7', '#16a34a', '#8b5cf6', '#ea580c'];
    return {
      label: g.name.split('(')[0].trim(),
      value: count,
      color: colors[idx % colors.length],
    };
  });

  return (
    <div className="space-y-6">
      {/* Supervisor Mode Banner */}
      {isSupervisorMode && (
        <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-purple-950 border-2 border-amber-400 p-5 rounded-3xl text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xl animate-pulse">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black flex-shrink-0 shadow-lg shadow-amber-400/30">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm sm:text-base text-amber-300 block">
                👑 Super Admin Supervisory Inspection Mode (Read-Only)
              </span>
              <span className="text-xs text-slate-300">
                You are auditing the Records & Attendance Desk. You can review roll-calls and leave notes below without altering live data.
              </span>
            </div>
          </div>
          <span className="px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/40 rounded-full text-xs font-bold whitespace-nowrap">
            Audit Active
          </span>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 ${notification.type === 'error' ? 'bg-rose-50 text-rose-800' : 'bg-emerald-50 text-emerald-800'}`}>
          <Check className="w-5 h-5" />
          <span className="text-xs font-bold">{notification.msg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white text-darkcyan-950 rounded-3xl p-6 border border-tealblue-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm transition-colors">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-mint-400 flex items-center justify-center text-white font-black shadow-lg shadow-brand-500/25 flex-shrink-0">
            <ClipboardCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">Records & Attendance Executive Workspace</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-mint-100 text-darkcyan-800 border border-mint-200">
                Kasoa Branch Secretariat
              </span>
            </div>
            <p className="text-xs text-darkcyan-700">
              Live roll-call, Excel/Image roster auto-import, Visual Pie Charts & member registry.
            </p>
          </div>
        </div>

        {/* Action Tabs + Batch Importer Button */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {!isSupervisorMode && (
            <button
              onClick={() => setIsBatchImporterOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Import Excel/Image Roster</span>
            </button>
          )}

          <div className="flex items-center gap-1 bg-mint-50/70 p-1 rounded-xl border border-tealblue-100">
            <button
              onClick={() => setActiveTab('checkin')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'checkin'
                  ? 'bg-brand-600 text-white shadow-sm font-extrabold'
                  : 'text-darkcyan-800 hover:text-darkcyan-950'
              }`}
            >
              Roll-Call
            </button>
            <button
              onClick={() => setActiveTab('visual_analytics')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'visual_analytics'
                  ? 'bg-brand-600 text-white shadow-sm font-extrabold'
                  : 'text-darkcyan-800 hover:text-darkcyan-950'
              }`}
            >
              Visual Charts
            </button>
            <button
              onClick={() => setActiveTab('directory')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'directory'
                  ? 'bg-brand-600 text-white shadow-sm font-extrabold'
                  : 'text-darkcyan-800 hover:text-darkcyan-950'
              }`}
            >
              Directory ({members.length})
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'reports'
                  ? 'bg-brand-600 text-white shadow-sm font-extrabold'
                  : 'text-darkcyan-800 hover:text-darkcyan-950'
              }`}
            >
              CSV Logs
            </button>
          </div>
        </div>
      </div>

      {/* Session Selector */}
      {activeTab === 'checkin' && (
        <SessionSelector
          sessions={sessions}
          activeSession={activeSession}
          onSelectSession={setActiveSession}
          onOpenNewSessionModal={isSupervisorMode ? null : onOpenNewSessionModal}
        />
      )}

      {/* Subtab 1: Check-in Dashboard */}
      {activeTab === 'checkin' && (
        <CheckInDashboard
          activeSession={activeSession}
          roster={roster}
          stats={stats}
          loading={loading}
          error={error}
          onStatusChange={isSupervisorMode ? () => {} : onStatusChange}
          onMarkAllPresent={isSupervisorMode ? () => {} : onMarkAllPresent}
          onRefresh={onRefresh}
          youthGroups={youthGroups}
        />
      )}

      {/* ========================================================================= */}
      {/* 📊 SUBTAB 2: VISUAL REPRESENTATION & PIE CHARTS */}
      {/* ========================================================================= */}
      {activeTab === 'visual_analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Live Attendance Distribution Pie Chart */}
            <div className="bg-white rounded-3xl p-6 border border-tealblue-100 shadow-sm space-y-4 transition-colors">
              <div className="border-b border-tealblue-100 pb-3">
                <h3 className="font-bold text-darkcyan-950 text-base">Current Roll-Call Status Distribution</h3>
                <p className="text-xs text-darkcyan-700">Live breakdown for session: {activeSession?.title || 'Sunday Service'}</p>
              </div>
              <PieChart
                data={attendancePieData}
                size={190}
                strokeWidth={30}
                centerLabel={`${stats.percentage || 0}%`}
                centerSubtext="Turnout"
              />
            </div>

            {/* Youth Class & Group Distribution Pie Chart */}
            <div className="bg-white rounded-3xl p-6 border border-tealblue-100 shadow-sm space-y-4 transition-colors">
              <div className="border-b border-tealblue-100 pb-3">
                <h3 className="font-bold text-darkcyan-950 text-base">Enrolled Youth by Age Group</h3>
                <p className="text-xs text-darkcyan-700">Distribution across Junior, Teen & Young Adults</p>
              </div>
              <PieChart
                data={groupDistribution}
                size={190}
                strokeWidth={30}
                centerLabel={`${members.length}`}
                centerSubtext="Total Youth"
              />
            </div>
          </div>
        </div>
      )}

      {/* Subtab 3: Member Directory */}
      {activeTab === 'directory' && (
        <RegistrationForm
          members={members}
          youthGroups={youthGroups}
          onRegisterMember={isSupervisorMode ? () => {} : onRegisterMember}
          onDeleteMember={isSupervisorMode ? () => {} : onDeleteMember}
          onRefresh={onRefreshMembers}
        />
      )}

      {/* Subtab 4: Reports & CSV */}
      {activeTab === 'reports' && (
        <ReportsTab youthGroups={youthGroups} />
      )}

      {/* 💬 Supervisory Comments Board */}
      <div className="bg-white rounded-3xl p-6 border border-tealblue-100 text-darkcyan-950 space-y-4 shadow-sm transition-colors">
        <div className="flex items-center gap-3 pb-3 border-b border-tealblue-100">
          <MessageSquare className="w-5 h-5 text-amber-500" />
          <div>
            <h4 className="font-bold text-darkcyan-950 text-sm">Lead Pastor Supervisory Feedback & Audit Notes</h4>
            <p className="text-xs text-darkcyan-700">Communication board between Administration and Records Desk</p>
          </div>
        </div>

        <div className="space-y-2.5 max-h-48 overflow-y-auto">
          {comments.length === 0 ? (
            <p className="text-xs text-darkcyan-600 italic">No supervisory feedback logged yet.</p>
          ) : (
            comments.map((com) => (
              <div key={com.id} className="p-3 bg-mint-50/40 border border-tealblue-100 rounded-2xl text-xs space-y-1">
                <div className="flex justify-between text-darkcyan-700 font-bold text-[10px]">
                  <span>From: Mr. Kinsley (Youth President)</span>
                  <span>{new Date(com.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-darkcyan-950 leading-relaxed font-medium">"{com.comment_text}"</p>
              </div>
            ))
          )}
        </div>

        {isSupervisorMode && (
          <form onSubmit={handlePostSupervisorComment} className="pt-2 flex gap-2">
            <input
              type="text"
              required
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Leave supervisory feedback or follow-up note for the Records Secretary..."
              className="flex-1 px-4 py-2.5 text-xs bg-mint-50/40 border border-tealblue-200 rounded-xl text-darkcyan-950 focus:outline-none focus:border-brand-500"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
            >
              Send Comment
            </button>
          </form>
        )}
      </div>

      {/* Batch Importer Modal */}
      <RosterBatchImporter
        isOpen={isBatchImporterOpen}
        onClose={() => setIsBatchImporterOpen(false)}
        youthGroups={youthGroups}
        onImportSuccess={() => {
          if (onRefreshMembers) onRefreshMembers();
        }}
      />
    </div>
  );
}
