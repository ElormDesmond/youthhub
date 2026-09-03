// hooks/useMembers.js
// Custom hook for member management

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/api/client';

export function useMembers(groupId = null) {
  const [members, setMembers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch youth groups list
  const fetchGroups = useCallback(async () => {
    try {
      const response = await apiClient.get('/members/groups/list');
      setGroups(response.data.data || response.data.groups || []);
    } catch (err) {
      console.error('Failed to fetch youth groups:', err);
    }
  }, []);

  // Fetch members for a group or all members
  const fetchMembers = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      let url = '/members?status=active';
      const targetGroup = filters.group_id !== undefined ? filters.group_id : groupId;
      if (targetGroup) {
        url += `&group_id=${targetGroup}`;
      }
      if (filters.search) {
        url += `&search=${encodeURIComponent(filters.search)}`;
      }
      
      const response = await apiClient.get(url);
      const memberList = response.data.data || response.data.members || [];
      setMembers(memberList);
      return memberList;
    } catch (err) {
      console.error('Failed to fetch members:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchMembers();
    fetchGroups();
  }, [fetchMembers, fetchGroups]);

  // Create new member
  const createMember = useCallback(async (memberData) => {
    try {
      const response = await apiClient.post('/members', memberData);
      const newMember = response.data.data || response.data.member;
      setMembers(prev => [...prev, newMember]);
      return { success: true, member: newMember, data: newMember };
    } catch (err) {
      console.error('Failed to create member:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  // Update member
  const updateMember = useCallback(async (memberId, updates) => {
    try {
      const response = await apiClient.put(`/members/${memberId}`, updates);
      const updated = response.data.data || response.data.member;
      setMembers(prev =>
        prev.map(m => m.id === memberId ? updated : m)
      );
      return { success: true, member: updated, data: updated };
    } catch (err) {
      console.error('Failed to update member:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  // Delete member (soft delete)
  const deleteMember = useCallback(async (memberId) => {
    try {
      await apiClient.delete(`/members/${memberId}`);
      setMembers(prev => prev.filter(m => m.id !== memberId));
      return { success: true };
    } catch (err) {
      console.error('Failed to delete member:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  return {
    members,
    groups,
    loading,
    error,
    createMember,
    registerMember: createMember,
    updateMember,
    deleteMember,
    fetchMembers,
    fetchGroups,
    setMembers
  };
}

export default useMembers;
