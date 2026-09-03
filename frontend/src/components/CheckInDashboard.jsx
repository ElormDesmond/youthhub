import React, { useState, useEffect } from 'react';
import { Search, CheckCircle2, UserCheck, AlertTriangle, Users, Sparkles, Filter, RefreshCw } from 'lucide-react';
import MemberCard from './MemberCard';

export default function CheckInDashboard({
  activeSession,
  roster = [],
  stats,
  loading,
  error,
  onStatusChange,
  onMarkAllPresent,
  onRefresh,
  youthGroups = [],
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter roster locally based on search, group, and status
  const filteredRoster = roster.filter((m) => {
    const fullName = `${m.first_name || ''} ${m.last_name || ''}`.toLowerCase();
    const phone = (m.phone_number || '').toLowerCase();
    const matchesSearch = !searchTerm || fullName.includes(searchTerm.toLowerCase()) || phone.includes(searchTerm.toLowerCase());

    const matchesGroup = !selectedGroup || m.youth_group_id === parseInt(selectedGroup, 10);

    let matchesStatus = true;
    if (statusFilter === 'present') matchesStatus = m.status === 'present';
    else if (statusFilter === 'late') matchesStatus = m.status === 'late';
    else if (statusFilter === 'absent') matchesStatus = m.status === 'absent';
    else if (statusFilter === 'excused') matchesStatus = m.status === 'excused';
    else if (statusFilter === 'awaiting') matchesStatus = !m.status || m.status === 'awaiting';

    return matchesSearch && matchesGroup && matchesStatus;
  });

  const percentage = stats?.percentage || 0;
  const circumference = 2 * Math.PI * 38;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  if (!activeSession) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800">No Active Session Selected</h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
          Select an existing session from the dropdown above or create a new one to begin roll call.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* 📊 Live Statistics & Progress Ring Card */}
      <div className="bg-white text-darkcyan-950 rounded-3xl p-5 sm:p-6 shadow-sm border border-tealblue-100 transition-colors">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left: Key Metrics Grid */}
          <div className="w-full md:w-2/3">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs uppercase tracking-widest font-bold text-brand-600">Live Attendance Roster</span>
                <h2 className="text-xl sm:text-2xl font-black text-darkcyan-950">{activeSession.title}</h2>
              </div>
              <button
                onClick={onRefresh}
                className="p-2 text-darkcyan-600 hover:text-darkcyan-900 hover:bg-mint-50 rounded-xl transition-all"
                title="Refresh Roster"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-500' : ''}`} />
              </button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 sm:gap-3">
              <div className="bg-mint-50/60 border border-mint-200/80 p-2.5 sm:p-3 rounded-2xl text-center">
                <span className="block text-[11px] font-bold text-darkcyan-700 uppercase">Enrolled</span>
                <span className="text-lg sm:text-2xl font-black text-darkcyan-950">{stats.total}</span>
              </div>

              <div className="bg-mint-100/80 border border-mint-300 p-2.5 sm:p-3 rounded-2xl text-center">
                <span className="block text-[11px] font-bold text-brand-700 uppercase">Present</span>
                <span className="text-lg sm:text-2xl font-black text-brand-700">{stats.present}</span>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-2.5 sm:p-3 rounded-2xl text-center">
                <span className="block text-[11px] font-bold text-amber-700 uppercase">Late</span>
                <span className="text-lg sm:text-2xl font-black text-amber-700">{stats.late}</span>
              </div>

              <div className="bg-rose-50 border border-rose-200 p-2.5 sm:p-3 rounded-2xl text-center">
                <span className="block text-[11px] font-bold text-rose-700 uppercase">Absent</span>
                <span className="text-lg sm:text-2xl font-black text-rose-700">{stats.absent}</span>
              </div>

              <div className="bg-tealblue-50/60 border border-tealblue-200/80 p-2.5 sm:p-3 rounded-2xl text-center col-span-3 sm:col-span-1">
                <span className="block text-[11px] font-bold text-darkcyan-700 uppercase">Awaiting</span>
                <span className="text-lg sm:text-2xl font-black text-darkcyan-800">{stats.awaiting}</span>
              </div>
            </div>
          </div>

          {/* Right: Circular Progress Percentage Ring */}
          <div className="flex items-center gap-5 bg-mint-50/50 p-4 rounded-2xl border border-mint-200/70 w-full md:w-auto justify-center">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 96 96">
                <circle
                  cx="48"
                  cy="48"
                  r="38"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-mint-200"
                  fill="transparent"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="38"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="text-brand-500 transition-all duration-500 ease-out"
                  fill="transparent"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-2xl font-black text-darkcyan-950 leading-none">{percentage}%</span>
                <span className="block text-[9px] font-bold text-darkcyan-700 uppercase mt-0.5">Rate</span>
              </div>
            </div>

            <div className="text-left">
              <div className="text-xs font-semibold text-darkcyan-700">Total Attended</div>
              <div className="text-xl font-bold text-darkcyan-950">{stats.attended} / {stats.total}</div>
              <button
                onClick={() => onMarkAllPresent(activeSession.id)}
                className="mt-2 text-xs font-bold text-brand-600 hover:text-brand-500 flex items-center gap-1 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Mark All Present</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 🔍 Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-tealblue-100 shadow-sm space-y-3 transition-colors">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-darkcyan-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search member name or phone..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-mint-50/40 border border-tealblue-200 rounded-xl text-darkcyan-950 focus:ring-2 focus:ring-brand-500 focus:outline-none placeholder:text-darkcyan-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-darkcyan-600 hover:text-darkcyan-900 font-semibold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Group Filter Dropdown */}
          <div className="sm:w-56">
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full py-2.5 px-3 text-sm bg-mint-50/40 border border-tealblue-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none font-medium text-darkcyan-900"
            >
              <option value="">All Youth Groups</option>
              {youthGroups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: `All (${roster.length})` },
            { id: 'awaiting', label: `Awaiting (${stats.awaiting})` },
            { id: 'present', label: `Present (${stats.present})` },
            { id: 'late', label: `Late (${stats.late})` },
            { id: 'absent', label: `Absent (${stats.absent})` },
            { id: 'excused', label: `Excused (${stats.excused})` },
          ].map((chip) => (
            <button
              key={chip.id}
              onClick={() => setStatusFilter(chip.id)}
              className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-all ${
                statusFilter === chip.id
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-mint-50 text-darkcyan-800 hover:bg-mint-100 border border-tealblue-100'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* 📋 Member Roster Grid */}
      {filteredRoster.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 border border-tealblue-100 text-center shadow-sm transition-colors">
          <UserCheck className="w-10 h-10 text-darkcyan-300 mx-auto mb-2" />
          <h4 className="font-bold text-darkcyan-900 text-base">No Members Match Filter</h4>
          <p className="text-xs text-darkcyan-600 mt-1">
            Try adjusting your search keywords or status filter options.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredRoster.map((member) => (
            <MemberCard
              key={member.member_id}
              member={member}
              sessionId={activeSession.id}
              onStatusChange={onStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}
