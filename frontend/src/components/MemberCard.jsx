import React, { useState } from 'react';
import { Phone, ShieldAlert, Check, Clock, X, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

const STATUS_CONFIG = {
  present: {
    label: 'Present',
    icon: Check,
    activeBg: 'bg-emerald-600 text-white shadow-emerald-500/25',
    inactiveBg: 'bg-mint-50/70 text-darkcyan-800 hover:bg-emerald-50 hover:text-emerald-700',
    border: 'border-emerald-500',
    pill: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  late: {
    label: 'Late',
    icon: Clock,
    activeBg: 'bg-amber-500 text-white shadow-amber-500/25',
    inactiveBg: 'bg-mint-50/70 text-darkcyan-800 hover:bg-amber-50 hover:text-amber-700',
    border: 'border-amber-500',
    pill: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  absent: {
    label: 'Absent',
    icon: X,
    activeBg: 'bg-rose-600 text-white shadow-rose-500/25',
    inactiveBg: 'bg-mint-50/70 text-darkcyan-800 hover:bg-rose-50 hover:text-rose-700',
    border: 'border-rose-500',
    pill: 'bg-rose-100 text-rose-800 border-rose-200',
  },
  excused: {
    label: 'Excused',
    icon: AlertCircle,
    activeBg: 'bg-indigo-600 text-white shadow-indigo-500/25',
    inactiveBg: 'bg-mint-50/70 text-darkcyan-800 hover:bg-indigo-50 hover:text-indigo-700',
    border: 'border-indigo-500',
    pill: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  },
};

export default function MemberCard({ member, sessionId, onStatusChange }) {
  const [showDetails, setShowDetails] = useState(false);
  const [notes, setNotes] = useState(member.notes || '');
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  const currentStatus = member.status || 'awaiting';
  const activeConfig = STATUS_CONFIG[currentStatus];

  const handleStatusClick = (statusKey) => {
    // If already this status, clicking again toggles to awaiting or keeps
    const targetStatus = currentStatus === statusKey ? 'awaiting' : statusKey;
    onStatusChange(member.member_id, sessionId, targetStatus, notes);
  };

  const handleNotesSave = () => {
    onStatusChange(member.member_id, sessionId, currentStatus, notes);
    setIsEditingNotes(false);
  };

  // Generate initials for avatar
  const initials = `${(member.first_name || '')[0] || ''}${(member.last_name || '')[0] || ''}`.toUpperCase();

  return (
    <div
      className={`bg-white rounded-2xl p-4 border transition-all duration-200 shadow-sm ${
        currentStatus === 'present'
          ? 'border-brand-300 bg-mint-50/40 ring-1 ring-brand-500/30'
          : currentStatus === 'late'
          ? 'border-amber-300 bg-amber-50/30 ring-1 ring-amber-500/30'
          : currentStatus === 'absent'
          ? 'border-rose-300 bg-rose-50/20 ring-1 ring-rose-500/20'
          : currentStatus === 'excused'
          ? 'border-indigo-300 bg-indigo-50/30 ring-1 ring-indigo-500/30'
          : 'border-tealblue-100 hover:border-tealblue-300'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left: Avatar & Member Info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-full bg-mint-100 text-darkcyan-900 border border-tealblue-200 font-black text-sm flex items-center justify-center flex-shrink-0 shadow-inner">
            {initials || 'Y'}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-darkcyan-950 text-base leading-tight truncate">
                {member.first_name} {member.last_name}
              </h4>
              {member.youth_group_name && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-mint-50 text-darkcyan-800 border border-mint-200">
                  {member.youth_group_name}
                </span>
              )}
            </div>

            {/* Subtitle / Details */}
            <div className="flex items-center gap-2 mt-1 text-xs text-darkcyan-700">
              {member.phone_number ? (
                <a
                  href={`tel:${member.phone_number}`}
                  className="flex items-center gap-1 hover:text-brand-600 font-medium"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Phone className="w-3 h-3" />
                  <span>{member.phone_number}</span>
                </a>
              ) : (
                <span>No direct phone</span>
              )}
              {currentStatus !== 'awaiting' && activeConfig && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${activeConfig.pill}`}>
                  {activeConfig.label}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Toggle Details Dropdown */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="p-1.5 text-darkcyan-600 hover:text-darkcyan-900 rounded-lg hover:bg-mint-50 transition-colors"
          title="Toggle Details"
        >
          {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Touch-Optimized 1-Tap Status Action Buttons */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mt-3.5">
        {Object.entries(STATUS_CONFIG).map(([statusKey, config]) => {
          const Icon = config.icon;
          const isSelected = currentStatus === statusKey;
          return (
            <button
              key={statusKey}
              onClick={() => handleStatusClick(statusKey)}
              className={`touch-target flex flex-col sm:flex-row items-center justify-center gap-1 py-2 sm:py-2.5 px-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 active:scale-95 ${
                isSelected ? `${config.activeBg} shadow-md` : `${config.inactiveBg} border border-tealblue-100`
              }`}
            >
              <Icon className={`w-4 h-4 ${isSelected ? 'stroke-[2.5]' : ''}`} />
              <span>{config.label}</span>
            </button>
          );
        })}
      </div>

      {/* Collapsible Details & Guardian Info */}
      {showDetails && (
        <div className="mt-3 pt-3 border-t border-tealblue-100 text-xs text-darkcyan-700 space-y-2 bg-mint-50/40 p-3 rounded-xl transition-colors">
          {member.guardian_name && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-darkcyan-700 font-medium">
                <ShieldAlert className="w-3.5 h-3.5 text-brand-600" />
                <span>Guardian:</span>
              </div>
              <div className="font-semibold text-darkcyan-950">
                {member.guardian_name} {member.guardian_phone && `(${member.guardian_phone})`}
              </div>
            </div>
          )}

          {member.check_in_time && (
            <div className="flex items-center justify-between text-darkcyan-700">
              <span>Checked in at:</span>
              <span className="font-medium text-darkcyan-950">
                {new Date(member.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}

          {/* Notes / Reason field */}
          <div className="pt-1">
            {isEditingNotes ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Reason for late/absence..."
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-tealblue-200 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white text-darkcyan-950"
                />
                <button
                  onClick={handleNotesSave}
                  className="px-2.5 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-bold text-xs shadow-sm transition-colors"
                >
                  Save
                </button>
              </div>
            ) : (
              <div
                onClick={() => setIsEditingNotes(true)}
                className="cursor-pointer text-darkcyan-700 hover:text-darkcyan-950 italic flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-tealblue-100"
              >
                <span>{notes || 'Click to add check-in note / excuse reason...'}</span>
                <span className="text-[10px] font-semibold text-brand-600 not-italic">Edit</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
