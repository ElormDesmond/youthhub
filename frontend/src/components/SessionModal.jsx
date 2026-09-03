import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, Tag } from 'lucide-react';

export default function SessionModal({ isOpen, onClose, onCreateSession, youthGroups = [] }) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [formData, setFormData] = useState({
    title: 'Sunday Youth Service',
    session_date: todayStr,
    session_time: '10:30:00',
    location: 'Main Youth Chapel',
    session_type: 'service',
    youth_group_id: '',
    description: '',
    expected_attendance: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.session_date) {
      setError('Please provide a title and session date');
      return;
    }
    setLoading(true);
    setError(null);

    const payload = {
      ...formData,
      youth_group_id: formData.youth_group_id ? parseInt(formData.youth_group_id, 10) : null,
      expected_attendance: formData.expected_attendance ? parseInt(formData.expected_attendance, 10) : null,
    };

    const res = await onCreateSession(payload);
    setLoading(false);
    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'Failed to create session');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-tealblue-100 relative transition-colors">
        <div className="flex items-center justify-between pb-4 border-b border-tealblue-100">
          <div>
            <h3 className="text-lg font-bold text-darkcyan-950">Create New Session</h3>
            <p className="text-xs text-darkcyan-700">Schedule a new youth service, bible study, or event date</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-darkcyan-400 hover:text-darkcyan-700 rounded-lg hover:bg-mint-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-darkcyan-800 uppercase tracking-wider mb-1">
              Session Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Sunday Youth Service, Friday Fellowship"
              className="w-full px-3 py-2 text-sm bg-mint-50/40 border border-tealblue-200 rounded-xl text-darkcyan-950 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-darkcyan-800 uppercase tracking-wider mb-1">
                Date *
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={formData.session_date}
                  onChange={(e) => setFormData({ ...formData, session_date: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-mint-50/40 border border-tealblue-200 rounded-xl text-darkcyan-950 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-darkcyan-800 uppercase tracking-wider mb-1">
                Time
              </label>
              <input
                type="time"
                value={formData.session_time}
                onChange={(e) => setFormData({ ...formData, session_time: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-mint-50/40 border border-tealblue-200 rounded-xl text-darkcyan-950 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-darkcyan-800 uppercase tracking-wider mb-1">
                Session Type
              </label>
              <select
                value={formData.session_type}
                onChange={(e) => setFormData({ ...formData, session_type: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-tealblue-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none bg-mint-50/40 text-darkcyan-950"
              >
                <option value="service">Sunday Service</option>
                <option value="bible_study">Bible Study</option>
                <option value="meeting">Youth Meeting</option>
                <option value="camp">Youth Camp</option>
                <option value="trip">Outreach / Mission Trip</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-darkcyan-800 uppercase tracking-wider mb-1">
                Youth Group
              </label>
              <select
                value={formData.youth_group_id}
                onChange={(e) => setFormData({ ...formData, youth_group_id: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-tealblue-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none bg-mint-50/40 text-darkcyan-950"
              >
                <option value="">All Youth Groups</option>
                {youthGroups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} (Ages {g.age_min}-{g.age_max})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-darkcyan-800 uppercase tracking-wider mb-1">
              Location / Venue
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g. Main Hall, Fellowship Room 2"
              className="w-full px-3 py-2 text-sm bg-mint-50/40 border border-tealblue-200 rounded-xl text-darkcyan-950 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-darkcyan-800 uppercase tracking-wider mb-1">
              Description / Theme
            </label>
            <textarea
              rows="2"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Topic or notes for this session..."
              className="w-full px-3 py-2 text-sm bg-mint-50/40 border border-tealblue-200 rounded-xl text-darkcyan-950 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            ></textarea>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-tealblue-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-darkcyan-700 hover:text-darkcyan-950 hover:bg-mint-50 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-md shadow-brand-600/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
