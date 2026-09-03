// hooks/useAttendance.js
// Custom hook for attendance management

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/api/client';

export function useAttendance(sessionId) {
  const [attendance, setAttendance] = useState({});
  const [roster, setRoster] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    late: 0,
    absent: 0,
    excused: 0,
    awaiting: 0,
    attended: 0,
    percentage: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Recalculate summary stats
  const calculateStats = (membersList) => {
    let present = 0, late = 0, absent = 0, excused = 0, awaiting = 0;
    membersList.forEach(m => {
      if (m.status === 'present') present++;
      else if (m.status === 'late') late++;
      else if (m.status === 'absent') absent++;
      else if (m.status === 'excused') excused++;
      else awaiting++;
    });
    const total = membersList.length;
    const attended = present + late;
    const percentage = total > 0 ? Math.round((attended / total) * 100) : 0;
    return { total, present, late, absent, excused, awaiting, attended, percentage };
  };

  // Fetch attendance for a session
  const fetchSessionAttendance = useCallback(async (sid = sessionId) => {
    if (!sid) {
      setAttendance({});
      setRoster([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/attendance/session/${sid}`);
      const membersList = response.data.members || response.data.roster || [];
      
      const attendanceMap = {};
      membersList.forEach(member => {
        attendanceMap[member.id || member.member_id] = {
          status: member.status,
          check_in_time: member.check_in_time,
          notes: member.notes,
          attendance_id: member.attendance_id
        };
      });
      
      setAttendance(attendanceMap);
      setRoster(membersList);
      setStats(response.data.statistics || response.data.stats || calculateStats(membersList));
    } catch (err) {
      console.error('Failed to fetch attendance:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchSessionAttendance(sessionId);
  }, [sessionId, fetchSessionAttendance]);

  // Record or update attendance (single status tap)
  const recordAttendance = useCallback(async (record) => {
    const memberId = record.member_id || record.id;
    const currentSid = record.session_id || sessionId;

    // Optimistically update local state
    setAttendance(prev => ({
      ...prev,
      [memberId]: {
        status: record.status,
        check_in_time: (record.status === 'present' || record.status === 'late') ? new Date().toISOString() : null,
        notes: record.notes
      }
    }));

    setRoster(prevRoster => {
      const updated = prevRoster.map(m => {
        if (m.id === memberId || m.member_id === memberId) {
          return {
            ...m,
            status: record.status,
            check_in_time: (record.status === 'present' || record.status === 'late') ? new Date().toISOString() : null,
            notes: record.notes !== undefined ? record.notes : m.notes
          };
        }
        return m;
      });
      setStats(calculateStats(updated));
      return updated;
    });

    try {
      const response = await apiClient.post('/attendance', {
        member_id: memberId,
        session_id: currentSid,
        status: record.status,
        notes: record.notes,
        check_in_time: record.check_in_time
      });
      return response.data;
    } catch (err) {
      console.error('Failed to record attendance:', err);
      setError(err.message);
      fetchSessionAttendance(currentSid);
      throw err;
    }
  }, [sessionId, fetchSessionAttendance]);

  // Mark status helper (matching MemberCard contract)
  const markStatus = useCallback(async (memberId, targetSessionId, status, notes = null) => {
    return recordAttendance({
      member_id: memberId,
      session_id: targetSessionId,
      status,
      notes
    });
  }, [recordAttendance]);

  // Bulk update attendance
  const bulkUpdateAttendance = useCallback(async (records, sid = sessionId) => {
    try {
      const response = await apiClient.post('/attendance/bulk', {
        session_id: sid,
        records
      });
      
      await fetchSessionAttendance(sid);
      return response.data;
    } catch (err) {
      console.error('Failed to bulk update attendance:', err);
      setError(err.message);
      throw err;
    }
  }, [sessionId, fetchSessionAttendance]);

  const markAllPresent = useCallback(async (sid = sessionId) => {
    return bulkUpdateAttendance(null, sid);
  }, [bulkUpdateAttendance, sessionId]);

  return {
    attendance,
    roster,
    stats,
    loading,
    error,
    recordAttendance,
    markStatus,
    bulkUpdateAttendance,
    markAllPresent,
    fetchSessionAttendance,
    setAttendance,
    setRoster
  };
}

export default useAttendance;
