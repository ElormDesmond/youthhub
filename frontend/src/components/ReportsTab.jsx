import React, { useState, useEffect } from 'react';
import { Download, BarChart2, TrendingUp, Users, Calendar, Award, AlertTriangle } from 'lucide-react';
import apiClient from '../api/client';

export default function ReportsTab({ youthGroups = [] }) {
  const [memberReports, setMemberReports] = useState([]);
  const [sessionReports, setSessionReports] = useState([]);
  const [groupReports, setGroupReports] = useState([]);
  const [activeSubTab, setActiveSubTab] = useState('members');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [membersRes, sessionsRes, groupsRes] = await Promise.all([
        apiClient.get(`/reports/attendance-by-member${selectedGroup ? `?group_id=${selectedGroup}` : ''}`),
        apiClient.get(`/reports/attendance-by-session${selectedGroup ? `?group_id=${selectedGroup}` : ''}`),
        apiClient.get('/reports/group-summary'),
      ]);

      setMemberReports(membersRes.data.reports || []);
      setSessionReports(sessionsRes.data.reports || []);
      setGroupReports(groupsRes.data.groups || []);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [selectedGroup]);

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const url = `${apiClient.defaults.baseURL}/reports/export-csv${selectedGroup ? `?group_id=${selectedGroup}` : ''}`;
      window.open(url, '_blank');
    } catch (err) {
      console.error('Failed to export CSV:', err);
    } finally {
      setExporting(false);
    }
  };

  // Aggregated Overall Stats
  const totalActiveMembers = memberReports.length;
  const avgAttendanceRate =
    totalActiveMembers > 0
      ? Math.round(
          memberReports.reduce((acc, curr) => acc + curr.attendance_percentage, 0) / totalActiveMembers
        )
      : 0;

  const consistentCount = memberReports.filter((m) => m.attendance_percentage >= 80).length;
  const atRiskCount = memberReports.filter((m) => m.attendance_percentage < 50).length;

  return (
    <div className="space-y-6">
      {/* 📊 Top Summary KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-tealblue-100 shadow-sm flex items-center gap-4 transition-colors">
          <div className="p-3 bg-mint-100 rounded-2xl text-brand-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-darkcyan-700 uppercase tracking-wider">Total Members</span>
            <h3 className="text-2xl font-black text-darkcyan-950">{totalActiveMembers}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-tealblue-100 shadow-sm flex items-center gap-4 transition-colors">
          <div className="p-3 bg-mint-100 rounded-2xl text-brand-600">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-darkcyan-700 uppercase tracking-wider">Avg Attendance Rate</span>
            <h3 className="text-2xl font-black text-darkcyan-950">{avgAttendanceRate}%</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-tealblue-100 shadow-sm flex items-center gap-4 transition-colors">
          <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-darkcyan-700 uppercase tracking-wider">Consistent (&gt;80%)</span>
            <h3 className="text-2xl font-black text-amber-600">{consistentCount}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-tealblue-100 shadow-sm flex items-center gap-4 transition-colors">
          <div className="p-3 bg-rose-50 rounded-2xl text-rose-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-darkcyan-700 uppercase tracking-wider">Needs Follow-Up (&lt;50%)</span>
            <h3 className="text-2xl font-black text-rose-600">{atRiskCount}</h3>
          </div>
        </div>
      </div>

      {/* Control Strip: Subtabs, Filter & Export */}
      <div className="bg-white rounded-2xl p-4 border border-tealblue-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors">
        {/* Subtabs */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto bg-mint-50/70 p-1 rounded-xl border border-tealblue-100">
          <button
            onClick={() => setActiveSubTab('members')}
            className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeSubTab === 'members'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-darkcyan-800 hover:text-darkcyan-950'
            }`}
          >
            Member Attendance
          </button>
          <button
            onClick={() => setActiveSubTab('sessions')}
            className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeSubTab === 'sessions'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-darkcyan-800 hover:text-darkcyan-950'
            }`}
          >
            Session History
          </button>
          <button
            onClick={() => setActiveSubTab('groups')}
            className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeSubTab === 'groups'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-darkcyan-800 hover:text-darkcyan-950'
            }`}
          >
            Group Breakdown
          </button>
        </div>

        {/* Group Filter & CSV Export */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="text-xs px-3 py-2 bg-mint-50/40 border border-tealblue-200 rounded-xl font-semibold text-darkcyan-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Youth Groups</option>
            {youthGroups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleExportCsv}
            disabled={exporting}
            className="touch-target flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{exporting ? 'Exporting...' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* 📋 Subtab 1: Member Consistency Table */}
      {activeSubTab === 'members' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-tealblue-100 shadow-sm overflow-hidden transition-colors">
          <h3 className="font-bold text-darkcyan-950 text-base mb-4">Member Attendance Consistency</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-darkcyan-800">
              <thead className="bg-mint-50 text-darkcyan-800 uppercase font-bold text-[10px] tracking-wider border-y border-tealblue-100">
                <tr>
                  <th className="py-3 px-4">Youth Member</th>
                  <th className="py-3 px-4">Group</th>
                  <th className="py-3 px-4 text-center">Present</th>
                  <th className="py-3 px-4 text-center">Late</th>
                  <th className="py-3 px-4 text-center">Absent</th>
                  <th className="py-3 px-4 text-center">Rate</th>
                  <th className="py-3 px-4">Consistency Tier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-tealblue-50">
                {memberReports.map((member) => (
                  <tr key={member.id} className="hover:bg-mint-50/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-darkcyan-950">
                      {member.first_name} {member.last_name}
                    </td>
                    <td className="py-3.5 px-4 text-darkcyan-600">{member.group_name || 'General'}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-brand-600">{member.present_count}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-amber-600">{member.late_count}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-rose-600">{member.absent_count}</td>
                    <td className="py-3.5 px-4 text-center font-black text-darkcyan-950">
                      {member.attendance_percentage}%
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                          member.attendance_percentage >= 80
                            ? 'bg-mint-100 text-brand-700 border-mint-200'
                            : member.attendance_percentage >= 50
                            ? 'bg-amber-100 text-amber-800 border-amber-200'
                            : 'bg-rose-100 text-rose-800 border-rose-200'
                        }`}
                      >
                        {member.consistency_tier}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 📅 Subtab 2: Session-by-Session History */}
      {activeSubTab === 'sessions' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-tealblue-100 shadow-sm overflow-hidden transition-colors">
          <h3 className="font-bold text-darkcyan-950 text-base mb-4">Historical Session Turnout</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-darkcyan-800">
              <thead className="bg-mint-50 text-darkcyan-800 uppercase font-bold text-[10px] tracking-wider border-y border-tealblue-100">
                <tr>
                  <th className="py-3 px-4">Session Date</th>
                  <th className="py-3 px-4">Event Title</th>
                  <th className="py-3 px-4">Target Group</th>
                  <th className="py-3 px-4 text-center">Present</th>
                  <th className="py-3 px-4 text-center">Late</th>
                  <th className="py-3 px-4 text-center">Absent</th>
                  <th className="py-3 px-4 text-center">Turnout Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-tealblue-50">
                {sessionReports.map((session) => (
                  <tr key={session.id} className="hover:bg-mint-50/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-darkcyan-800">{session.session_date}</td>
                    <td className="py-3.5 px-4 font-bold text-darkcyan-950">{session.title}</td>
                    <td className="py-3.5 px-4 text-darkcyan-600">{session.group_name || 'All Ministry'}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-brand-600">{session.present_count}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-amber-600">{session.late_count}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-rose-600">{session.absent_count}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-black text-brand-600">{session.attendance_percentage}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 👥 Subtab 3: Group Summaries */}
      {activeSubTab === 'groups' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {groupReports.map((grp) => (
            <div key={grp.id} className="bg-white rounded-3xl p-5 border border-tealblue-100 shadow-sm space-y-3 transition-colors">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-darkcyan-950 text-lg">{grp.name}</h4>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-mint-100 text-darkcyan-800 border border-mint-200">
                  Ages {grp.age_min}-{grp.age_max}
                </span>
              </div>
              <div className="space-y-1.5 text-xs text-darkcyan-700">
                <div className="flex justify-between">
                  <span>Enrolled Members:</span>
                  <span className="font-bold text-darkcyan-950">{grp.active_members}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Sessions:</span>
                  <span className="font-bold text-darkcyan-950">{grp.total_sessions}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Check-Ins:</span>
                  <span className="font-bold text-brand-600">{grp.total_attendances}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
