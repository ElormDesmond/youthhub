import React from 'react';
import { Users, CheckCircle2, UserPlus, BarChart3, Calendar, ShieldCheck } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, activeSession, onOpenNewSessionModal }) {
  const churchName = import.meta.env.VITE_CHURCH_NAME || 'Grace Community Church Youth Ministry';

  const navItems = [
    { id: 'checkin', label: 'Roll Call / Check-In', icon: CheckCircle2 },
    { id: 'register', label: 'Member Registry', icon: UserPlus },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'admin', label: 'Admin & Database', icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-tealblue-100 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Church Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-mint-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-darkcyan-950 text-lg leading-tight">Youth Attendance</span>
                <span className="bg-mint-100 text-darkcyan-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-mint-200">Live</span>
              </div>
              <p className="text-xs text-darkcyan-700 hidden sm:block truncate max-w-xs">{churchName}</p>
            </div>
          </div>

          {/* Active Session Indicator Pill */}
          {activeSession && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-tealblue-50/80 rounded-full border border-tealblue-200/70 text-xs">
              <Calendar className="w-3.5 h-3.5 text-brand-600" />
              <span className="font-semibold text-darkcyan-900">{activeSession.title}</span>
              <span className="text-darkcyan-400">•</span>
              <span className="text-darkcyan-700">{activeSession.session_date}</span>
            </div>
          )}

          {/* Desktop Navigation Tabs */}
          <nav className="hidden sm:flex items-center gap-1 bg-mint-50/70 p-1.5 rounded-2xl border border-tealblue-100">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/25'
                      : 'text-darkcyan-800 hover:text-darkcyan-950 hover:bg-mint-100/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-darkcyan-600'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Sticky Bottom Tab Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-tealblue-100 px-2 py-2 flex justify-around items-center shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[11px] font-bold transition-all ${
                isActive ? 'text-brand-600' : 'text-darkcyan-700 hover:text-darkcyan-950'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span>{item.id === 'checkin' ? 'Check-In' : item.id === 'register' ? 'Register' : item.id === 'reports' ? 'Reports' : 'Admin'}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
