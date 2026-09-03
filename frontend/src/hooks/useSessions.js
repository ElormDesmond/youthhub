// hooks/useSessions.js
// Custom hook for session management

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/api/client';

export function useSessions(initialFilters = {}) {
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSessions = useCallback(async (filters = initialFilters) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams(filters);
      const response = await apiClient.get(`/sessions?${params.toString()}`);
      const sessionList = response.data.data || response.data.sessions || [];
      setSessions(sessionList);
      
      if (sessionList.length > 0) {
        setActiveSession((prev) => {
          if (!prev) return sessionList[0];
          const exists = sessionList.find((s) => s.id === prev.id);
          return exists || sessionList[0];
        });
      }
      return sessionList;
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Create new session
  const createSession = useCallback(async (sessionData) => {
    try {
      const response = await apiClient.post('/sessions', sessionData);
      const newSession = response.data.data || response.data.session;
      setSessions(prev => [newSession, ...prev]);
      setActiveSession(newSession);
      return { success: true, session: newSession, data: newSession };
    } catch (err) {
      console.error('Failed to create session:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  // Update session
  const updateSession = useCallback(async (sessionId, updates) => {
    try {
      const response = await apiClient.put(`/sessions/${sessionId}`, updates);
      const updated = response.data.data || response.data.session;
      setSessions(prev =>
        prev.map(s => s.id === sessionId ? updated : s)
      );
      if (activeSession?.id === sessionId) {
        setActiveSession(updated);
      }
      return { success: true, session: updated, data: updated };
    } catch (err) {
      console.error('Failed to update session:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [activeSession]);

  // Delete session
  const deleteSession = useCallback(async (sessionId) => {
    try {
      await apiClient.delete(`/sessions/${sessionId}`);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      return { success: true };
    } catch (err) {
      console.error('Failed to delete session:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  // Get session summary
  const getSessionSummary = useCallback(async (sessionId) => {
    try {
      const response = await apiClient.get(`/sessions/${sessionId}/summary`);
      return response.data.data || response.data.summary;
    } catch (err) {
      console.error('Failed to get session summary:', err);
      throw err;
    }
  }, []);

  return {
    sessions,
    activeSession,
    setActiveSession,
    loading,
    error,
    fetchSessions,
    createSession,
    updateSession,
    deleteSession,
    getSessionSummary,
    setSessions,
  };
}

export default useSessions;
