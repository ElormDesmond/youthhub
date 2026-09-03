import React, { useState } from 'react';
import { UserPlus, Search, Phone, Mail, Shield, Check, Trash2, Edit2, AlertCircle } from 'lucide-react';

export default function RegistrationForm({
  members = [],
  youthGroups = [],
  loading,
  onRegisterMember,
  onDeleteMember,
  onRefresh,
}) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    date_of_birth: '',
    gender: 'M',
    guardian_name: '',
    guardian_phone: '',
    guardian_email: '',
    youth_group_id: '',
    notes: '',
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.first_name || !formData.last_name) {
      setErrorMessage('First name and last name are required');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const payload = {
      ...formData,
      youth_group_id: formData.youth_group_id ? parseInt(formData.youth_group_id, 10) : null,
    };

    const res = await onRegisterMember(payload);
    setSubmitting(false);

    if (res.success) {
      setSuccessMessage(`Successfully enrolled ${formData.first_name} ${formData.last_name}!`);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        date_of_birth: '',
        gender: 'M',
        guardian_name: '',
        guardian_phone: '',
        guardian_email: '',
        youth_group_id: '',
        notes: '',
      });
      setTimeout(() => setSuccessMessage(null), 5000);
    } else {
      setErrorMessage(res.error || 'Failed to register youth member');
    }
  };

  const filteredMembers = members.filter((m) => {
    const fullName = `${m.first_name || ''} ${m.last_name || ''}`.toLowerCase();
    const phone = (m.phone_number || '').toLowerCase();
    const matchesSearch = !searchTerm || fullName.includes(searchTerm.toLowerCase()) || phone.includes(searchTerm.toLowerCase());
    const matchesGroup = !selectedGroup || m.youth_group_id === parseInt(selectedGroup, 10);
    return matchesSearch && matchesGroup;
  });

  return (
    <div className="space-y-6">
      {/* Top Notification Alerts */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 shadow-sm animate-in fade-in">
          <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="text-sm font-semibold">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center gap-3 shadow-sm animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span className="text-sm font-semibold">{errorMessage}</span>
        </div>
      )}

      {/* Grid: Registration Form (Left) & Active Youth Roster (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 📝 Enrollment Form */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border border-tealblue-100 shadow-sm transition-colors">
          <div className="flex items-center gap-3 pb-4 border-b border-tealblue-100">
            <div className="p-2.5 bg-mint-100 rounded-xl text-brand-600">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-darkcyan-950">Youth Enrollment</h3>
              <p className="text-xs text-darkcyan-700">Add a new member to the church register</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-darkcyan-800 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="e.g. Samuel"
                  className="w-full px-3 py-2 text-sm bg-mint-50/40 border border-tealblue-200 rounded-xl text-darkcyan-950 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-darkcyan-800 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  placeholder="e.g. Mensah"
                  className="w-full px-3 py-2 text-sm bg-mint-50/40 border border-tealblue-200 rounded-xl text-darkcyan-950 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Date of Birth & Gender */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-darkcyan-800 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-mint-50/40 border border-tealblue-200 rounded-xl text-darkcyan-950 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-darkcyan-800 mb-1">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-mint-50/40 border border-tealblue-200 rounded-xl text-darkcyan-950 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
              </div>
            </div>

            {/* Phone & Email */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-darkcyan-800 mb-1">
                  Member Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3 py-2 text-sm bg-mint-50/40 border border-tealblue-200 rounded-xl text-darkcyan-950 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-darkcyan-800 mb-1">
                  Youth Group
                </label>
                <select
                  value={formData.youth_group_id}
                  onChange={(e) => setFormData({ ...formData, youth_group_id: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-mint-50/40 border border-tealblue-200 rounded-xl text-darkcyan-950 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="">General / Unassigned</option>
                  {youthGroups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} (Ages {g.age_min}-{g.age_max})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Guardian Information Section */}
            <div className="pt-2 border-t border-tealblue-100">
              <span className="text-[11px] font-bold text-darkcyan-600 uppercase tracking-widest block mb-2">
                Parent / Guardian Contact
              </span>
              <div className="space-y-2.5">
                <div>
                  <input
                    type="text"
                    value={formData.guardian_name}
                    onChange={(e) => setFormData({ ...formData, guardian_name: e.target.value })}
                    placeholder="Guardian Full Name"
                    className="w-full px-3 py-2 text-sm bg-mint-50/40 border border-tealblue-200 rounded-xl text-darkcyan-950 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <input
                    type="tel"
                    value={formData.guardian_phone}
                    onChange={(e) => setFormData({ ...formData, guardian_phone: e.target.value })}
                    placeholder="Guardian Phone *"
                    className="w-full px-3 py-2 text-sm bg-mint-50/40 border border-tealblue-200 rounded-xl text-darkcyan-950 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                  <input
                    type="email"
                    value={formData.guardian_email}
                    onChange={(e) => setFormData({ ...formData, guardian_email: e.target.value })}
                    placeholder="Guardian Email"
                    className="w-full px-3 py-2 text-sm bg-mint-50/40 border border-tealblue-200 rounded-xl text-darkcyan-950 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-darkcyan-800 mb-1">
                Notes / Talents / Medical Info
              </label>
              <textarea
                rows="2"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Choir member, allergy notes, etc."
                className="w-full px-3 py-2 text-sm bg-mint-50/40 border border-tealblue-200 rounded-xl text-darkcyan-950 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="touch-target w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl shadow-md shadow-brand-600/25 transition-all active:scale-98 disabled:opacity-50"
            >
              {submitting ? 'Registering...' : 'Register Youth Member'}
            </button>
          </form>
        </div>

        {/* 📋 Registered Members Roster Table */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-6 border border-tealblue-100 shadow-sm flex flex-col transition-colors">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-tealblue-100">
            <div>
              <h3 className="text-lg font-bold text-darkcyan-950">Member Directory ({members.length})</h3>
              <p className="text-xs text-darkcyan-700">All registered youth in ministry database</p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-darkcyan-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search youth by name..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-mint-50/40 border border-tealblue-200 rounded-xl text-darkcyan-950 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Group Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-3 text-xs">
            <button
              onClick={() => setSelectedGroup('')}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all ${
                !selectedGroup
                  ? 'bg-brand-600 text-white font-bold shadow-sm'
                  : 'bg-mint-100 text-darkcyan-800 hover:bg-mint-200 border border-tealblue-100'
              }`}
            >
              All Groups ({members.length})
            </button>
            {youthGroups.map((g) => (
              <button
                key={g.id}
                onClick={() => setSelectedGroup(g.id.toString())}
                className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  selectedGroup === g.id.toString()
                    ? 'bg-brand-600 text-white font-bold shadow-sm'
                    : 'bg-mint-100 text-darkcyan-800 hover:bg-mint-200 border border-tealblue-100'
                }`}
              >
                {g.name}
              </button>
            ))}
          </div>

          {/* Member List */}
          <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[550px] pr-1">
            {filteredMembers.length === 0 ? (
              <div className="text-center py-12 text-darkcyan-600 text-sm">
                No members found matching your search.
              </div>
            ) : (
              filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="p-3.5 rounded-2xl border border-tealblue-100 hover:border-tealblue-300 bg-mint-50/40 hover:bg-white transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-mint-100 text-brand-700 border border-tealblue-200 font-bold text-xs flex items-center justify-center flex-shrink-0">
                      {`${member.first_name[0] || ''}${member.last_name[0] || ''}`.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-darkcyan-950 text-sm truncate">
                          {member.first_name} {member.last_name}
                        </span>
                        {member.youth_group_name && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-mint-100 text-darkcyan-800 border border-tealblue-200">
                            {member.youth_group_name}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-darkcyan-600 flex items-center gap-3 mt-0.5">
                        {member.phone_number && <span>📱 {member.phone_number}</span>}
                        {member.guardian_name && <span>🛡️ {member.guardian_name}</span>}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to deactivate ${member.first_name} ${member.last_name}?`)) {
                        onDeleteMember(member.id);
                      }
                    }}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Deactivate Member"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
