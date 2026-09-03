import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Users, DollarSign, Image, Video, Sparkles, ChevronRight,
  Heart, Share2, MapPin, Clock, ArrowRight, ShieldCheck, CheckCircle2,
  ExternalLink, Play, MessageSquare, AlertCircle, Phone, Mail, Instagram,
  Youtube, Send, Filter, Compass, Flame, TrendingUp, Bell, Smartphone,
  BookOpen, Wine, Coffee, Award, Target, BellRing, Check, Info, CheckCheck
} from 'lucide-react';
import MoMoPaymentModal from './MoMoPaymentModal';
import { PieChart, MetricBar } from './VisualCharts';
import apiClient from '../api/client';

export default function PublicYouthWebsite({ onOpenLogin, onOpenRegisterModal }) {
  const [activeSection, setActiveSection] = useState('home'); // 'home' | 'timeline' | 'gallery' | 'transparency' | 'news' | 'contact'
  const [sessions, setSessions] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [sundayService, setSundayService] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [duesSummary, setDuesSummary] = useState(null);
  const [duesList, setDuesList] = useState([]);
  const [selectedTag, setSelectedTag] = useState('All');
  const [selectedMediaItem, setSelectedMediaItem] = useState(null);
  
  // Payment Modal & Notification Drawer
  const [isMoMoModalOpen, setIsMoMoModalOpen] = useState(false);
  const [selectedPaymentCampaign, setSelectedPaymentCampaign] = useState(null);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushNotice, setPushNotice] = useState(null);

  // 🔔 Read Notifications Tracking (Persisted in localStorage)
  const [readNotifIds, setReadNotifIds] = useState(() => {
    try {
      const saved = localStorage.getItem('gec_read_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleMarkAsRead = (id) => {
    setReadNotifIds((prev) => {
      if (prev.includes(id)) return prev;
      const updated = [...prev, id];
      try {
        localStorage.setItem('gec_read_notifications', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleMarkAllAsRead = () => {
    const allIds = notifications.map((n) => n.id);
    setReadNotifIds(allIds);
    try {
      localStorage.setItem('gec_read_notifications', JSON.stringify(allIds));
    } catch (e) {}
  };

  const unreadCount = notifications.filter((n) => !readNotifIds.includes(n.id)).length;

  const [loading, setLoading] = useState(true);

  // Fallback high-res church images if an announcement lacks one
  const fallbackImages = [
    'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=60'
  ];

  // Guaranteed default announcements with rich placeholder images
  const defaultAnnouncements = [
    {
      id: 1,
      title: 'Youth Mountain Retreat 2026 Registration Open',
      content: 'Registration is officially open for the 2026 Youth Camp Retreat. Join over 80 youth members for a weekend of prayer warfare, outdoor challenges, and life transformation. Secure your camping spot now!',
      category: 'event',
      image_url: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&auto=format&fit=crop&q=60',
      posted_by_first_name: 'Pastor David',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      title: 'Weekly Devotional: Walking in Divine Purpose',
      content: 'Memory Verse: 1 Timothy 4:12 - "Don\'t let anyone look down on you because you are young, but set an example for the believers in speech, in conduct, in love, in faith and in purity." Let this guide your week in school and workplace!',
      category: 'devotional',
      image_url: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800&auto=format&fit=crop&q=60',
      posted_by_first_name: 'Pastor David',
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      title: 'Kasoa Community Outreach & Street Missions',
      content: 'Join the Youth Welfare & Outreach Team this Saturday at 2:00 PM at Kasoa New Market. We will distribute food packages, pray for families, and share the gospel. Volunteers meet in the main hall at 1:30 PM.',
      category: 'outreach',
      image_url: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&auto=format&fit=crop&q=60',
      posted_by_first_name: 'Pastor David',
      created_at: new Date().toISOString()
    },
    {
      id: 4,
      title: 'Youth Choir Auditions & Sound Team Recruitment',
      content: 'Do you have a passion for singing, playing keyboards, drums, or operating audiovisual systems? The media and choir team is recruiting new energetic youth for the upcoming praise night.',
      category: 'announcement',
      image_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=60',
      posted_by_first_name: 'Kofi Ansah',
      created_at: new Date().toISOString()
    }
  ];

  // Load public data
  useEffect(() => {
    const fetchPublicData = async () => {
      setLoading(true);
      try {
        const [sessRes, galRes, annRes, duesRes, servRes, notifRes] = await Promise.all([
          apiClient.get('/sessions'),
          apiClient.get('/media/gallery'),
          apiClient.get('/admin/announcements'),
          apiClient.get('/finance/dues'),
          apiClient.get('/services'),
          apiClient.get('/notifications'),
        ]);
        setSessions(sessRes.data.data || sessRes.data.sessions || []);
        setGallery(galRes.data.gallery || []);
        setAnnouncements(annRes.data.announcements || []);
        setDuesSummary(duesRes.data.summary || null);
        setDuesList(duesRes.data.dues || []);
        setSundayService(servRes.data.service || null);
        setNotifications(notifRes.data.notifications || []);
      } catch (err) {
        console.error('Failed to load public portal data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicData();
  }, []);

  const upcomingSessions = sessions.filter((s) => new Date(s.session_date) >= new Date(Date.now() - 86400000));
  const nextEvent = upcomingSessions[0] || sessions[0];
  const activeAnnouncements = (announcements && announcements.length > 0) ? announcements : defaultAnnouncements;

  const galleryTags = ['All', 'Worship', 'Camp', 'Outreach', 'Drama', 'YoungAdults'];
  const filteredGallery = selectedTag === 'All' ? gallery : gallery.filter((item) => item.tags?.includes(selectedTag));

  const handleOpenMoMo = (campaign = null) => {
    setSelectedPaymentCampaign(campaign);
    setIsMoMoModalOpen(true);
  };

  // Browser Push Notification Request
  const handleEnablePushNotifications = async () => {
    if (!('Notification' in window)) {
      setPushNotice('Push notifications are not supported in this browser.');
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setPushEnabled(true);
        setPushNotice('✅ Push notifications enabled! You will receive Tuesday reminders & Sunday service alerts.');
        new Notification('Global Evangelical Church Youth', {
          body: 'Notifications activated! You will receive weekly reminders and news updates.',
          icon: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=128&auto=format&fit=crop&q=60'
        });
      } else {
        setPushNotice('⚠️ Notification permission was denied in browser settings.');
      }
    } catch (e) {
      setPushNotice('Could not request notification permissions.');
    }
    setTimeout(() => setPushNotice(null), 5000);
  };

  // Transparency Pie Chart Data
  const transparencyPieData = duesSummary ? [
    { label: 'Funds Received', value: duesSummary.total_collected || 0, formattedValue: `GHS ${duesSummary.total_collected}`, color: '#10b981' },
    { label: 'Funds Disbursed', value: duesSummary.total_disbursed || 0, formattedValue: `GHS ${duesSummary.total_disbursed}`, color: '#f59e0b' },
    { label: 'Net In Treasury', value: Math.max(duesSummary.net_balance || 0, 0), formattedValue: `GHS ${duesSummary.net_balance}`, color: '#06b6d4' },
  ] : [];

  return (
    <div className="min-h-screen bg-mint-50/20 text-darkcyan-950 font-['Plus_Jakarta_Sans',sans-serif] selection:bg-brand-500 selection:text-white">
      {/* 🧭 Public Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-tealblue-100 shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-3 sm:gap-4">
            {/* Logo & Church Name */}
            <div
              onClick={() => setActiveSection('home')}
              className="flex items-center gap-3 cursor-pointer group flex-shrink-0"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-brand-600 via-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform flex-shrink-0">
                <Flame className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse text-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-xs sm:text-base md:text-lg text-darkcyan-950 tracking-tight">
                    GLOBAL EVANGELICAL CHURCH <span className="text-brand-600 font-black">YOUTH</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-amber-700 font-extrabold uppercase tracking-widest bg-amber-50 px-2 py-0.5 rounded-full border border-amber-300 w-fit">
                    Kasoa Branch
                  </span>
                  <span className="text-[10px] text-darkcyan-700 hidden md:inline">• With a Mission, Vision & Difference</span>
                </div>
              </div>
            </div>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden xl:flex items-center gap-1 bg-mint-50/80 p-1.5 rounded-2xl border border-tealblue-100">
              {[
                { id: 'home', label: 'Home' },
                { id: 'timeline', label: 'Event Timeline' },
                { id: 'gallery', label: 'Media Gallery' },
                { id: 'transparency', label: 'Open Transparency' },
                { id: 'news', label: 'News & Devotionals' },
                { id: 'contact', label: 'Contact' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id)}
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${
                    activeSection === tab.id
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                      : 'text-darkcyan-800 hover:text-darkcyan-950 hover:bg-mint-100/70'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Action Buttons: MoMo Pay + Reminders + Login */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {/* MoMo Fast Pay */}
              <button
                onClick={() => handleOpenMoMo({ title: 'Monthly Youth Dues', category: 'dues', defaultAmount: '50' })}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black rounded-xl shadow-md shadow-amber-400/20 transition-all active:scale-95 whitespace-nowrap"
              >
                <Smartphone className="w-4 h-4" />
                <span className="hidden sm:inline">MoMo Pay</span>
                <span className="sm:hidden">Pay</span>
              </button>

              {/* 🔔 Notification Bell with Dynamic Unread Count (disappears when 0) */}
              <button
                onClick={() => setShowNotificationDrawer(!showNotificationDrawer)}
                className={`relative p-2.5 rounded-xl border transition-all ${
                  showNotificationDrawer
                    ? 'bg-brand-600 text-white border-brand-500 shadow-md shadow-brand-500/25'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-tealblue-100'
                }`}
                title="Active Reminders & Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center animate-pulse shadow-md border-2 border-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              <button
                onClick={onOpenLogin}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold rounded-xl border border-tealblue-100 transition-all whitespace-nowrap"
              >
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                <span>Staff Portal</span>
              </button>
            </div>
          </div>
        </div>

        {/* 🔔 VERTICAL NOTIFICATION & REMINDER DRAWER */}
        {showNotificationDrawer && (
          <div className="max-w-2xl mx-auto px-4 py-4 animate-in slide-in-from-top-3">
            <div className="bg-white border border-tealblue-100 rounded-3xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-tealblue-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-500">
                    <BellRing className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-extrabold text-darkcyan-950">Youth Alerts & Reminders</h4>
                      {unreadCount > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 text-[10px] font-extrabold border border-rose-500/30">
                          {unreadCount} Unread
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-extrabold border border-emerald-500/30 flex items-center gap-1">
                          <Check className="w-3 h-3" /> All Read
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-darkcyan-600">Scheduled reminders for Global Evangelical Youth (Kasoa)</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-xs font-bold text-brand-600 hover:underline px-2 py-1 rounded-lg hover:bg-brand-50 flex items-center gap-1"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Mark all as read</span>
                    </button>
                  )}
                  <button
                    onClick={() => setShowNotificationDrawer(false)}
                    className="text-xs text-slate-400 hover:text-slate-700 p-1"
                  >
                    ✕ Close
                  </button>
                </div>
              </div>

              {/* Push Permission Toggle Button */}
              <div className="p-3.5 rounded-2xl bg-brand-50 border border-brand-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-darkcyan-950 block">Turn On Phone & Desktop Push Notifications</span>
                  <p className="text-[11px] text-brand-700">
                    Get Tuesday fellowship alerts and Saturday service reminders directly on your phone home screen!
                  </p>
                </div>
                <button
                  onClick={handleEnablePushNotifications}
                  className="px-3.5 py-2 bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 whitespace-nowrap"
                >
                  {pushEnabled ? '✓ Notifications Active' : '🔔 Turn On Alerts'}
                </button>
              </div>

              {pushNotice && (
                <div className="p-2.5 bg-slate-100 text-amber-700 text-xs rounded-xl border border-tealblue-100">
                  {pushNotice}
                </div>
              )}

              {/* VERTICAL Alert Feed with Click-to-Read & Decrementing Count */}
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-500 italic text-center py-4">No active reminders currently scheduled.</p>
                ) : (
                  notifications.map((n) => {
                    const isRead = readNotifIds.includes(n.id);
                    return (
                      <div
                        key={n.id}
                        onClick={() => handleMarkAsRead(n.id)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                          isRead
                            ? 'bg-slate-50/70 border-tealblue-100 opacity-80 hover:opacity-100'
                            : 'bg-white border-brand-300 shadow-sm hover:border-brand-500 ring-1 ring-brand-500/10'
                        }`}
                      >
                        <div className={`p-2 rounded-xl flex-shrink-0 mt-0.5 ${
                          isRead
                            ? 'bg-slate-200/80 text-slate-400'
                            : 'bg-amber-100 text-amber-500 animate-pulse'
                        }`}>
                          <Clock className="w-4 h-4" />
                        </div>
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs ${isRead ? 'font-medium text-darkcyan-700' : 'font-extrabold text-darkcyan-950'}`}>
                                {n.title}
                              </span>
                              {!isRead && (
                                <span className="w-2 h-2 rounded-full bg-brand-500 inline-block animate-ping" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-brand-600 uppercase">
                                {n.reminder_type ? n.reminder_type.replace(/_/g, ' ') : 'ALERT'}
                              </span>
                              {isRead ? (
                                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5" title="Read">
                                  <Check className="w-3 h-3" /> Read
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMarkAsRead(n.id);
                                  }}
                                  className="text-[10px] font-bold text-brand-600 hover:underline bg-brand-50 px-2 py-0.5 rounded-md transition-colors"
                                >
                                  Mark read
                                </button>
                              )}
                            </div>
                          </div>
                          <p className={`text-xs leading-relaxed ${isRead ? 'text-darkcyan-600' : 'text-slate-700'}`}>
                            {n.message}
                          </p>
                          <div className="text-[10px] text-slate-400 pt-0.5 flex items-center justify-between">
                            <span>Scheduled Time: <strong className="text-darkcyan-700">{n.target_time}</strong></span>
                            {!isRead && (
                              <span className="text-brand-600 font-bold text-[10px]">Click to mark as read</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Navigation Pill Bar */}
        <div className="xl:hidden flex items-center justify-between overflow-x-auto px-4 py-2.5 bg-white/95 border-t border-tealblue-100 text-xs gap-2 transition-colors">
          {[
            { id: 'home', label: 'Home' },
            { id: 'timeline', label: 'Timeline' },
            { id: 'gallery', label: 'Gallery' },
            { id: 'transparency', label: 'Transparency' },
            { id: 'news', label: 'News' },
            { id: 'contact', label: 'Contact' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-all ${
                activeSection === tab.id ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 🚀 TAB 1: HOME & HERO SECTION */}
      {/* ========================================================================= */}
      {activeSection === 'home' && (
        <div className="space-y-16 pb-20">
          {/* Hero Section */}
          <section className="relative overflow-hidden pt-10 pb-16 sm:pt-16 sm:pb-24">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
              {/* Church Pillar Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-300 text-brand-700 text-xs font-extrabold shadow-sm transition-colors">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Global Evangelical Church • Kasoa Branch Youth Ministry</span>
              </div>

              {/* Enhanced Hero Headline */}
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-darkcyan-950 tracking-tight max-w-4xl mx-auto leading-[1.15] transition-colors">
                Raising a Generation of{' '}
                <span
                  className="font-black inline-block transition-transform hover:scale-105"
                  style={{ color: '#ea580c', textShadow: '0 0 24px rgba(234, 88, 12, 0.35)' }}
                >
                  Unshakable Faith,
                </span>{' '}
                Vision & Excellence in Christ.
              </h1>

              <p className="text-sm sm:text-base text-darkcyan-700 max-w-2xl mx-auto leading-relaxed transition-colors">
                Welcome to the youth family of Global Evangelical Church, Kasoa. Connect with passionate worship, dynamic discipleship, weekly fellowship, and active community outreach.
              </p>

              {/* 🌟 3-PART YOUTH MOTTO BANNER */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto pt-2">
                <div className="p-3.5 rounded-2xl bg-mint-50 border border-mint-200 shadow-sm flex items-center justify-center gap-2 transition-colors">
                  <Target className="w-4 h-4 text-darkcyan-700 flex-shrink-0" />
                  <span className="font-black text-xs sm:text-sm text-darkcyan-900 tracking-wide uppercase">
                    Youth! - With a Mission
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-tealblue-50 border border-tealblue-200 shadow-sm flex items-center justify-center gap-2 transition-colors">
                  <Compass className="w-4 h-4 text-tealblue-700 flex-shrink-0" />
                  <span className="font-black text-xs sm:text-sm text-darkcyan-900 tracking-wide uppercase">
                    Youth! - With a Vision
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 shadow-sm flex items-center justify-center gap-2 transition-colors">
                  <Award className="w-4 h-4 text-amber-700 flex-shrink-0" />
                  <span className="font-black text-xs sm:text-sm text-amber-900 tracking-wide uppercase">
                    Youth! - With a Difference
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={onOpenRegisterModal}
                  className="w-full sm:w-auto px-8 py-4 bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-brand-600/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  <span>Join Our Youth Family</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleOpenMoMo({ title: 'Monthly Youth Dues', category: 'dues', defaultAmount: '50' })}
                  className="w-full sm:w-auto px-8 py-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-amber-400/25 transition-all flex items-center justify-center gap-2"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Pay Dues / Donate via MoMo</span>
                </button>
              </div>
            </div>
          </section>

          {/* ⛪ SUNDAY SERVICE UPDATES (WAITING OR ACTIVE JOINT/TWO SERVICE) */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-tealblue-100 shadow-md space-y-6 relative overflow-hidden transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-tealblue-100 pb-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-brand-600" />
                  <h3 className="text-lg font-black text-darkcyan-950">Sunday Service Updates</h3>
                </div>
                {sundayService?.is_communion_sunday ? (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-black uppercase">
                    <Wine className="w-4 h-4 text-rose-600 animate-bounce" />
                    <span>🍷 Holy Communion Sunday</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-mint-100 text-brand-700 border border-mint-200 text-xs font-bold uppercase">
                    <span>Divine Worship Service</span>
                  </div>
                )}
              </div>

              {!sundayService ? (
                <div className="p-8 text-center bg-mint-50/40 rounded-2xl border border-tealblue-100 text-darkcyan-700 text-xs font-semibold">
                  ⏳ Waiting for Administration to post details for this upcoming Sunday's service...
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Joint Service Mode */}
                  {sundayService.service_mode === 'joint_service' ? (
                    <div className="p-6 rounded-2xl bg-mint-50/40 border border-tealblue-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
                      <div className="space-y-1">
                        <span className="text-[10px] font-extrabold text-amber-700 uppercase tracking-widest block">
                          Combined Congregation
                        </span>
                        <h4 className="text-xl font-black text-darkcyan-950">{sundayService.joint_service_title || 'Joint Covenant Service'}</h4>
                        <p className="text-xs text-darkcyan-700">All ministries & youth gathering together in the main sanctuary.</p>
                      </div>
                      <div className="px-5 py-3 rounded-xl bg-brand-50 border border-brand-200 text-brand-700 font-mono font-black text-sm flex items-center gap-2 whitespace-nowrap">
                        <Clock className="w-4 h-4 text-brand-600" />
                        <span>{sundayService.joint_service_time || '8:30 AM - 12:30 PM'}</span>
                      </div>
                    </div>
                  ) : (
                    /* Two Services Mode */
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-5 rounded-2xl bg-mint-50/40 border border-tealblue-100 space-y-1.5 transition-colors">
                        <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest block">1st Morning Service</span>
                        <h4 className="text-base font-black text-darkcyan-950">{sundayService.first_service_title}</h4>
                        <div className="text-xs font-bold text-darkcyan-700 flex items-center gap-1.5 font-mono pt-1">
                          <Clock className="w-3.5 h-3.5 text-brand-600" /> {sundayService.first_service_time}
                        </div>
                      </div>

                      <div className="p-5 rounded-2xl bg-mint-50/40 border border-tealblue-100 space-y-1.5 transition-colors">
                        <span className="text-[10px] font-bold text-brand-700 uppercase tracking-widest block">2nd Empowerment Service</span>
                        <h4 className="text-base font-black text-darkcyan-950">{sundayService.second_service_title}</h4>
                        <div className="text-xs font-bold text-darkcyan-700 flex items-center gap-1.5 font-mono pt-1">
                          <Clock className="w-3.5 h-3.5 text-brand-600" /> {sundayService.second_service_time}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Weekly Theme */}
                  <div className="p-4 rounded-2xl bg-mint-50 border border-mint-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs transition-colors">
                    <div>
                      <span className="text-[10px] font-bold text-brand-700 uppercase tracking-widest block">Theme of the Week:</span>
                      <strong className="text-darkcyan-950 text-sm font-black tracking-wide">"{sundayService.service_theme}"</strong>
                    </div>
                    <span className="text-brand-700 font-semibold">Scripture: {sundayService.scripture_reading}</span>
                  </div>

                  {sundayService.announcements_note && (
                    <p className="text-xs text-darkcyan-700 pt-1">
                      <strong className="text-darkcyan-900">Pastor's Note:</strong> {sundayService.announcements_note}
                    </p>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* 🎯 MISSION & VISION STATEMENTS */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl p-8 border border-tealblue-100 shadow-md space-y-3 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-brand-50 text-brand-600 rounded-2xl">
                    <Target className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-darkcyan-950">Our Youth Mission</h3>
                </div>
                <p className="text-xs sm:text-sm text-darkcyan-700 leading-relaxed">
                  "To raise a generation of Spirit-filled, empowered Christian youth committed to holy living, aggressive kingdom evangelism, leadership excellence, and transformative community impact in Kasoa and beyond."
                </p>
              </div>

              <div className="bg-white rounded-3xl p-8 border border-tealblue-100 shadow-md space-y-3 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                    <Compass className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-darkcyan-950">Our Youth Vision</h3>
                </div>
                <p className="text-xs sm:text-sm text-darkcyan-700 leading-relaxed">
                  "Building vibrant, Christ-centered young disciples equipped with godly character, academic & career excellence, and unshakable faith to impact the global church."
                </p>
              </div>
            </div>
          </section>

          {/* 📰 LATEST NEWS & UPDATES (WITH PICTURES ALWAYS DISPLAYED) */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs uppercase font-bold text-brand-600 tracking-wider">Church Youth Pulse</span>
                <h2 className="text-2xl sm:text-3xl font-black text-darkcyan-950">News, Updates & Devotionals</h2>
              </div>
              <button
                onClick={() => setActiveSection('news')}
                className="text-xs font-bold text-darkcyan-600 hover:text-slate-900 flex items-center gap-1"
              >
                <span>View All Updates</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {activeAnnouncements.slice(0, 3).map((item, idx) => (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl border border-tealblue-100 overflow-hidden hover:border-brand-500/50 transition-all flex flex-col justify-between group shadow-sm"
                >
                  <div>
                    {/* Placeholder picture container with camera badge */}
                    <div className="h-48 w-full overflow-hidden bg-slate-100 relative">
                      <img
                        src={item.image_url || fallbackImages[idx % fallbackImages.length]}
                        alt={item.title}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = fallbackImages[idx % fallbackImages.length];
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-900/80 text-amber-300 uppercase tracking-wider backdrop-blur-sm border border-slate-700/60">
                        {item.category ? item.category.replace('_', ' ') : 'CHURCH UPDATE'}
                      </span>
                      <span className="absolute bottom-3 right-3 text-[9px] font-bold px-2 py-0.5 rounded-md bg-slate-900/75 text-slate-200 backdrop-blur-sm flex items-center gap-1">
                        <Image className="w-3 h-3 text-amber-400" />
                        <span>Update Photo</span>
                      </span>
                    </div>

                    <div className="p-6">
                      <h4 className="font-bold text-darkcyan-950 text-lg leading-snug">{item.title}</h4>
                      <p className="text-xs text-darkcyan-700 mt-2 line-clamp-3 leading-relaxed">{item.content}</p>
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-slate-50 border-t border-tealblue-100 text-xs text-darkcyan-600 flex justify-between">
                    <span>By {item.posted_by_first_name || 'Pastor David'}</span>
                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 💰 DUES & FUNDRAISING (WITH MOMO BUTTONS) */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-xs uppercase font-bold text-amber-600 tracking-wider">MoMo Contributions & Giving</span>
                <h2 className="text-2xl sm:text-3xl font-black text-darkcyan-950">Active Dues & Fundraising Campaigns</h2>
              </div>
              <button
                onClick={() => handleOpenMoMo({ title: 'Special Youth Offering / Donation', category: 'fundraising', defaultAmount: '50' })}
                className="text-xs font-bold text-amber-600 hover:text-amber-500 flex items-center gap-1"
              >
                <span>Make Custom Donation</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {duesList.slice(0, 3).map((item) => (
                <div key={item.id} className="bg-white rounded-3xl p-6 border border-tealblue-100 flex flex-col justify-between space-y-4 shadow-sm transition-colors">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 uppercase">
                      {item.category.replace('_', ' ')}
                    </span>
                    <h4 className="font-bold text-darkcyan-950 text-lg">{item.title}</h4>
                    <p className="text-xs text-darkcyan-700 leading-relaxed line-clamp-2">{item.purpose}</p>

                    <div className="pt-2">
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-darkcyan-600">Target: GHS {item.amount_target}</span>
                        <span className="text-emerald-600">Raised: GHS {item.amount_collected}</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-500 rounded-full"
                          style={{ width: `${Math.min(Math.round((item.amount_collected / (item.amount_target || 1)) * 100), 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenMoMo({ title: item.title, category: item.category, defaultAmount: '50' })}
                    className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Pay with MoMo (MTN/Telecel/AT)</span>
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📅 TAB 2: YEARLY EVENT TIMELINE */}
      {/* ========================================================================= */}
      {activeSection === 'timeline' && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">Global Evangelical Church Kasoa</span>
            <h2 className="text-3xl sm:text-4xl font-black text-darkcyan-950 mt-1">2026 Yearly Event Timeline</h2>
          </div>

          <div className="relative border-l-2 border-tealblue-100 ml-4 sm:ml-32 space-y-8 pl-6 sm:pl-8">
            {sessions.map((sess) => (
              <div key={sess.id} className="relative bg-white rounded-3xl p-6 border border-tealblue-100 shadow-md transition-colors">
                <div className="absolute -left-[31px] sm:-left-[39px] top-6 w-5 h-5 rounded-full bg-brand-500 border-4 border-white"></div>
                <div className="hidden sm:block absolute -left-36 top-6 text-right w-24">
                  <span className="text-xs font-black text-brand-600 block">{sess.session_date}</span>
                  <span className="text-[10px] text-darkcyan-600 font-bold uppercase">{sess.session_time || '10:00 AM'}</span>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                  {sess.banner_url && (
                    <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0">
                      <img src={sess.banner_url} alt={sess.title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="space-y-2 flex-1">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200 uppercase">
                      {sess.session_type}
                    </span>
                    <h3 className="text-xl font-bold text-darkcyan-950">{sess.title}</h3>
                    <p className="text-xs text-darkcyan-700 leading-relaxed">{sess.description}</p>
                    <div className="flex items-center gap-4 text-xs text-darkcyan-600 pt-2">
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-brand-600" /> {sess.location}</span>
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-emerald-600" /> ~{sess.expected_attendance} Expected</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 📸 TAB 3: MEDIA GALLERY */}
      {/* ========================================================================= */}
      {activeSection === 'gallery' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">Visual Moments</span>
            <h2 className="text-3xl sm:text-4xl font-black text-darkcyan-950 mt-1">Youth Media Gallery & Videos</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGallery.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedMediaItem(item)}
                className="bg-white rounded-3xl overflow-hidden border border-tealblue-100 cursor-pointer group shadow-sm transition-all hover:border-brand-500/50"
              >
                <div className="h-60 w-full overflow-hidden bg-slate-100 relative">
                  <img src={item.media_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-900/80 text-white">
                    {item.tags}
                  </span>
                </div>
                <div className="p-5">
                  <h4 className="font-bold text-darkcyan-950 text-base">{item.title}</h4>
                  <p className="text-xs text-darkcyan-700 mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 📊 TAB 4: OPEN TRANSPARENCY (WITH VISUAL PIE CHART) */}
      {/* ========================================================================= */}
      {activeSection === 'transparency' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">Financial Integrity & Open Ledger</span>
            <h2 className="text-3xl sm:text-4xl font-black text-darkcyan-950 mt-1">Ministry Transparency Portal</h2>
          </div>

          {/* Visual Pie Chart & Summary Card */}
          {duesSummary && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Visual SVG Pie Chart */}
              <div className="bg-white rounded-3xl p-6 border border-tealblue-100 flex flex-col justify-center items-center shadow-md transition-colors">
                <h4 className="text-xs font-bold uppercase tracking-wider text-darkcyan-700 mb-4 text-center">
                  Funds Collected vs Disbursed vs Balance
                </h4>
                <PieChart
                  data={transparencyPieData}
                  size={190}
                  strokeWidth={30}
                  centerLabel={`GHS ${duesSummary.net_balance}`}
                  centerSubtext="In Treasury"
                />
              </div>

              {/* KPI Summary Cards */}
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white border border-tealblue-100 p-6 rounded-3xl space-y-1 shadow-sm transition-colors">
                  <span className="text-xs font-bold text-darkcyan-600 uppercase">Target Levies / Dues</span>
                  <div className="text-3xl font-black text-darkcyan-950">GHS {duesSummary.total_target}</div>
                  <span className="text-[11px] text-slate-500">Across all 2026 youth campaigns</span>
                </div>

                <div className="bg-white border border-tealblue-100 p-6 rounded-3xl space-y-1 shadow-sm transition-colors">
                  <span className="text-xs font-bold text-emerald-600 uppercase">Total Received via MoMo</span>
                  <div className="text-3xl font-black text-emerald-600">GHS {duesSummary.total_collected}</div>
                  <span className="text-[11px] text-emerald-600">{duesSummary.funding_progress}% of target achieved</span>
                </div>

                <div className="bg-white border border-tealblue-100 p-6 rounded-3xl space-y-1 shadow-sm transition-colors">
                  <span className="text-xs font-bold text-amber-600 uppercase">Total Funds Disbursed</span>
                  <div className="text-3xl font-black text-amber-600">GHS {duesSummary.total_disbursed}</div>
                  <span className="text-[11px] text-darkcyan-600">For retreat logistics, sound & snacks</span>
                </div>

                <div className="bg-white border border-tealblue-100 p-6 rounded-3xl space-y-1 shadow-sm transition-colors">
                  <span className="text-xs font-bold text-cyan-600 uppercase">Current Treasury Balance</span>
                  <div className="text-3xl font-black text-darkcyan-950">GHS {duesSummary.net_balance}</div>
                  <span className="text-[11px] text-cyan-600">Available in youth account</span>
                </div>
              </div>
            </div>
          )}

          {/* Dues & Levies Ledger Table */}
          <div className="bg-white rounded-3xl p-6 border border-tealblue-100 overflow-x-auto shadow-md space-y-4 transition-colors">
            <h3 className="font-bold text-darkcyan-950 text-base">Campaign Details & Ledger</h3>
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase border-b border-tealblue-100">
                <tr>
                  <th className="py-3 px-4">Fund Title</th>
                  <th className="py-3 px-4">Target (GHS)</th>
                  <th className="py-3 px-4">Collected</th>
                  <th className="py-3 px-4">Disbursed</th>
                  <th className="py-3 px-4">Purpose</th>
                  <th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {duesList.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4 font-bold text-darkcyan-950">{d.title}</td>
                    <td className="py-4 px-4">GHS {d.amount_target}</td>
                    <td className="py-4 px-4 font-bold text-emerald-600">GHS {d.amount_collected}</td>
                    <td className="py-4 px-4 font-semibold text-amber-600">GHS {d.amount_disbursed}</td>
                    <td className="py-4 px-4 text-darkcyan-700 max-w-xs">{d.purpose}</td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleOpenMoMo({ title: d.title, category: d.category, defaultAmount: '50' })}
                        className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-lg shadow-sm"
                      >
                        Pay MoMo
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 📰 TAB 5: NEWS & DEVOTIONALS (FULL PICTURES DISPLAYED) */}
      {/* ========================================================================= */}
      {activeSection === 'news' && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">Faith & Updates</span>
            <h2 className="text-3xl sm:text-4xl font-black text-darkcyan-950 mt-1">News, Devotions & Word</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeAnnouncements.map((ann, idx) => (
              <div key={ann.id} className="bg-white rounded-3xl overflow-hidden border border-tealblue-100 shadow-md flex flex-col justify-between transition-colors">
                <div>
                  {/* Full image display with camera badge & error fallback */}
                  <div className="h-60 w-full overflow-hidden bg-slate-100 relative">
                    <img
                      src={ann.image_url || fallbackImages[idx % fallbackImages.length]}
                      alt={ann.title}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = fallbackImages[idx % fallbackImages.length];
                      }}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-900/80 text-amber-300 uppercase tracking-wider backdrop-blur-sm border border-slate-700/60">
                      {ann.category ? ann.category.replace('_', ' ') : 'DEVOTIONAL'}
                    </span>
                    <span className="absolute bottom-3 right-3 text-[9px] font-bold px-2.5 py-1 rounded-md bg-slate-900/75 text-slate-200 backdrop-blur-sm flex items-center gap-1">
                      <Image className="w-3 h-3 text-amber-400" />
                      <span>Church News Photo</span>
                    </span>
                  </div>

                  <div className="p-6 space-y-2">
                    <h3 className="text-xl font-bold text-darkcyan-950">{ann.title}</h3>
                    <p className="text-xs text-darkcyan-700 leading-relaxed whitespace-pre-line">{ann.content}</p>
                  </div>
                </div>

                <div className="px-6 py-4 bg-slate-50 border-t border-tealblue-100 text-xs text-darkcyan-600 flex justify-between">
                  <span>Author: {ann.posted_by_first_name || 'Pastor David'}</span>
                  <span>{new Date(ann.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 📞 TAB 6: CONTACT */}
      {/* ========================================================================= */}
      {activeSection === 'contact' && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">Connect With Us</span>
            <h2 className="text-3xl sm:text-4xl font-black text-darkcyan-950 mt-1">Global Evangelical Church (Kasoa)</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl p-8 border border-tealblue-100 space-y-6 shadow-md transition-colors">
              <h3 className="text-xl font-bold text-darkcyan-950">Youth Ministry Secretariat</h3>
              <div className="space-y-4 text-xs text-slate-700">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-brand-600 flex-shrink-0" />
                  <span>Global Evangelical Church, Kasoa Tollbooth Highway Junction, Kasoa, Ghana</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-brand-600 flex-shrink-0" />
                  <span>Sunday Services: 7:00 AM & 9:30 AM | Tuesday Fellowship: 6:30 PM</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-brand-600 flex-shrink-0" />
                  <span>+233 (024) 412-3456 / +233 (055) 523-4567</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-tealblue-100 shadow-md transition-colors">
              <h3 className="text-xl font-bold text-darkcyan-950 mb-4">Send a Prayer Request</h3>
              <form onSubmit={(e) => { e.preventDefault(); alert('Prayer request received by Kasoa Youth Pastor!'); }} className="space-y-4">
                <input type="text" required placeholder="Your Name" className="w-full px-4 py-3 text-xs bg-slate-50 border border-tealblue-100 rounded-xl text-darkcyan-950 focus:outline-none focus:border-brand-500" />
                <input type="tel" required placeholder="Phone Number (e.g. 024 XXX XXXX)" className="w-full px-4 py-3 text-xs bg-slate-50 border border-tealblue-100 rounded-xl text-darkcyan-950 focus:outline-none focus:border-brand-500" />
                <textarea rows="3" required placeholder="Prayer Request or Message..." className="w-full px-4 py-3 text-xs bg-slate-50 border border-tealblue-100 rounded-xl text-darkcyan-950 focus:outline-none focus:border-brand-500"></textarea>
                <button type="submit" className="w-full py-3.5 bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all active:scale-95">
                  Submit Prayer Request
                </button>
              </form>
            </div>
          </div>
        </section>
      )}

      {/* MoMo Payment Checkout Modal */}
      <MoMoPaymentModal
        isOpen={isMoMoModalOpen}
        onClose={() => setIsMoMoModalOpen(false)}
        initialCampaign={selectedPaymentCampaign}
      />

      {/* Lightbox / Video Modal */}
      {selectedMediaItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 border border-tealblue-100 space-y-4 shadow-2xl transition-colors">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-darkcyan-950 text-lg">{selectedMediaItem.title}</h3>
              <button onClick={() => setSelectedMediaItem(null)} className="text-darkcyan-600 hover:text-slate-900 font-bold text-sm">✕ Close</button>
            </div>
            <div className="max-h-[400px] w-full rounded-2xl overflow-hidden bg-black flex items-center justify-center">
              <img src={selectedMediaItem.media_url} alt={selectedMediaItem.title} className="max-h-[400px] object-contain" />
            </div>
            <p className="text-xs text-darkcyan-700">{selectedMediaItem.description}</p>
          </div>
        </div>
      )}

      {/* 👣 Footer */}
      <footer className="bg-mint-50/70 border-t border-tealblue-100 pt-16 pb-12 mt-20 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-12 border-b border-tealblue-200/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-mint-400 flex items-center justify-center text-white font-black shadow-md shadow-brand-500/20">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-darkcyan-950 text-base block">Global Evangelical Church Youth</span>
                <span className="text-[11px] text-amber-600 font-bold uppercase">Kasoa Branch</span>
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs font-semibold text-darkcyan-800 flex-wrap justify-center">
              <button onClick={() => setActiveSection('home')} className="hover:text-darkcyan-950">Home</button>
              <button onClick={() => setActiveSection('timeline')} className="hover:text-darkcyan-950">Timeline</button>
              <button onClick={() => setActiveSection('gallery')} className="hover:text-darkcyan-950">Gallery</button>
              <button onClick={() => setActiveSection('transparency')} className="hover:text-darkcyan-950">Transparency</button>
              <button onClick={() => setActiveSection('contact')} className="hover:text-darkcyan-950">Contact</button>
              <button onClick={onOpenLogin} className="text-amber-600 hover:text-amber-500 font-bold">Leader Login</button>
            </div>
          </div>

          <div className="pt-8 text-center text-xs text-darkcyan-700 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p>© 2026 Global Evangelical Church Youth Ministry (Kasoa Branch). All rights reserved.</p>
            <p className="font-bold text-darkcyan-800">Youth! - With a Mission, a Vision, and a Difference.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
