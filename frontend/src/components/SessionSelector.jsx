import React from 'react';
import { Calendar, Plus, MapPin, Clock, Users } from 'lucide-react';

export default function SessionSelector({
  sessions = [],
  activeSession,
  onSelectSession,
  onOpenNewSessionModal,
}) {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-tealblue-100 shadow-sm transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Dropdown & Selector */}
        <div className="flex items-center gap-3 flex-1">
          <div className="p-2.5 bg-mint-100 rounded-xl text-brand-600 border border-tealblue-200 flex-shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-darkcyan-700 mb-0.5">
              Select Session / Event
            </label>
            <select
              value={activeSession ? activeSession.id : ''}
              onChange={(e) => {
                const selected = sessions.find((s) => s.id === parseInt(e.target.value, 10));
                if (selected) onSelectSession(selected);
              }}
              className="w-full bg-mint-50/40 border border-tealblue-200 font-bold text-darkcyan-950 text-sm sm:text-base rounded-xl px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:outline-none truncate"
            >
              {sessions.length === 0 ? (
                <option value="">No sessions scheduled</option>
              ) : (
                sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} — {s.session_date} {s.youth_group_name ? `(${s.youth_group_name})` : ''}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Right: Add Session Action Button */}
        {onOpenNewSessionModal && (
          <button
            onClick={onOpenNewSessionModal}
            className="touch-target flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold rounded-xl shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Session</span>
          </button>
        )}
      </div>

      {/* Active Session Metadata Strip */}
      {activeSession && (
        <div className="mt-4 pt-3.5 border-t border-tealblue-100 flex items-center gap-4 flex-wrap text-xs text-darkcyan-700">
          <div className="flex items-center gap-1.5 font-medium">
            <Clock className="w-3.5 h-3.5 text-brand-600" />
            <span>Time: {activeSession.session_time || '10:00 AM'}</span>
          </div>
          {activeSession.location && (
            <div className="flex items-center gap-1.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-brand-600" />
              <span>{activeSession.location}</span>
            </div>
          )}
          {activeSession.youth_group_name && (
            <div className="flex items-center gap-1.5 font-medium">
              <Users className="w-3.5 h-3.5 text-brand-600" />
              <span>Target: {activeSession.youth_group_name}</span>
            </div>
          )}
          {activeSession.description && (
            <div className="text-darkcyan-800 italic max-w-md truncate">
              "{activeSession.description}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
