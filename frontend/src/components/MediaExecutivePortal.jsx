import React, { useState, useEffect } from 'react';
import { 
  Camera, Video, Calendar, Plus, Trash2, Megaphone, 
  MessageSquare, Sparkles, Check, AlertCircle, Link as LinkIcon, RefreshCw, Eye,
  PieChart as PieIcon
} from 'lucide-react';
import { PieChart, MetricBar } from './VisualCharts';
import apiClient from '../api/client';

export default function MediaExecutivePortal({ currentUser, isSupervisorMode = false, supervisorComments = [], onAddSupervisorComment }) {
  const [activeTab, setActiveTab] = useState('gallery'); // 'gallery' | 'timeline' | 'announcements' | 'visual_charts'
  const [gallery, setGallery] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [comments, setComments] = useState(supervisorComments);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Form states
  const [showAddMediaModal, setShowAddMediaModal] = useState(false);
  const [mediaForm, setMediaForm] = useState({
    title: '',
    description: '',
    media_type: 'image',
    media_url: '',
    video_embed_url: '',
    tags: 'Worship',
    event_date: new Date().toISOString().slice(0, 10),
  });

  const [showEventModal, setShowEventModal] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    session_date: new Date().toISOString().slice(0, 10),
    session_time: '18:30:00',
    location: 'Main Sanctuary Hall',
    session_type: 'worship_night',
    banner_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=60',
    expected_attendance: 50,
  });

  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    category: 'announcement',
    image_url: '',
  });

  const [newCommentText, setNewCommentText] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [galRes, sessRes, annRes, comRes] = await Promise.all([
        apiClient.get('/media/gallery'),
        apiClient.get('/sessions'),
        apiClient.get('/admin/announcements'),
        apiClient.get('/admin/comments?portal_section=media'),
      ]);
      setGallery(galRes.data.gallery || []);
      setSessions(sessRes.data.data || sessRes.data.sessions || []);
      setAnnouncements(annRes.data.announcements || []);
      setComments(comRes.data.comments || []);
    } catch (err) {
      console.error('Failed to load media data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showNotice = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Add Gallery Item
  const handleAddMedia = async (e) => {
    e.preventDefault();
    if (isSupervisorMode) return;
    try {
      await apiClient.post('/media/gallery', mediaForm);
      showNotice('Photo / Video added to public gallery!');
      setShowAddMediaModal(false);
      setMediaForm({
        title: '',
        description: '',
        media_type: 'image',
        media_url: '',
        video_embed_url: '',
        tags: 'Worship',
        event_date: new Date().toISOString().slice(0, 10),
      });
      loadData();
    } catch (err) {
      showNotice(err.message || 'Failed to add media', 'error');
    }
  };

  const handleDeleteMedia = async (id) => {
    if (isSupervisorMode) return;
    if (!confirm('Delete this gallery item?')) return;
    try {
      await apiClient.delete(`/media/gallery/${id}`);
      showNotice('Media item removed');
      loadData();
    } catch (err) {
      showNotice(err.message || 'Failed to delete media', 'error');
    }
  };

  // Create Event / Session
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (isSupervisorMode) return;
    try {
      await apiClient.post('/sessions', eventForm);
      showNotice('Event published to 2026 Yearly Timeline!');
      setShowEventModal(false);
      loadData();
    } catch (err) {
      showNotice(err.message || 'Failed to create event', 'error');
    }
  };

  // Publish Announcement
  const handlePublishAnnouncement = async (e) => {
    e.preventDefault();
    if (isSupervisorMode) return;
    try {
      await apiClient.post('/admin/announcements', announcementForm);
      showNotice('Announcement published to public website!');
      setShowAnnouncementModal(false);
      loadData();
    } catch (err) {
      showNotice(err.message || 'Failed to publish announcement', 'error');
    }
  };

  // Submit Supervisor Comment
  const handlePostSupervisorComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    try {
      await apiClient.post('/admin/comments', {
        portal_section: 'media',
        comment_text: newCommentText.trim(),
      });
      setNewCommentText('');
      showNotice('Supervisor comment sent to Media Team!');
      loadData();
    } catch (err) {
      showNotice(err.message || 'Failed to log comment', 'error');
    }
  };

  // Visual pie data for media assets
  const photosCount = gallery.filter((g) => g.media_type === 'image').length;
  const videosCount = gallery.filter((g) => g.media_type === 'video').length;
  const flyersCount = announcements.length;
  const bannersCount = sessions.filter((s) => s.banner_url).length;

  const mediaPieData = [
    { label: 'Event Photos', value: photosCount, color: '#06b6d4' },
    { label: 'Video Reels', value: videosCount, color: '#ec4899' },
    { label: 'News Flyers', value: flyersCount, color: '#f59e0b' },
    { label: 'Event Banners', value: bannersCount, color: '#8b5cf6' },
  ];

  return (
    <div className="space-y-6">
      {/* Supervisor Mode Banner */}
      {isSupervisorMode && (
        <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-purple-950 border-2 border-amber-400 p-5 rounded-3xl text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xl animate-pulse">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black flex-shrink-0 shadow-lg shadow-amber-400/30">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm sm:text-base text-amber-300 block">
                👑 Super Admin Supervisory Inspection Mode (Read-Only)
              </span>
              <span className="text-xs text-slate-300">
                You are auditing the Media & Creative Workspace. You can review photos, videos and schedule, and leave notes below without altering live data.
              </span>
            </div>
          </div>
          <span className="px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/40 rounded-full text-xs font-bold whitespace-nowrap">
            Audit Active
          </span>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 ${notification.type === 'error' ? 'bg-rose-50 text-rose-800' : 'bg-emerald-50 text-emerald-800'}`}>
          <Check className="w-5 h-5" />
          <span className="text-xs font-bold">{notification.msg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white text-darkcyan-950 rounded-3xl p-6 border border-tealblue-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm transition-colors">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-darkcyan-700 to-tealblue-500 flex items-center justify-center text-white font-black shadow-lg shadow-darkcyan-700/25 flex-shrink-0">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">Media & Creative Executive Workspace</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-tealblue-100 text-darkcyan-800 border border-tealblue-200">
                Media Team Portal
              </span>
            </div>
            <p className="text-xs text-darkcyan-700">
              Manage public gallery, upload retreat photos, video reels, and schedule event dates.
            </p>
          </div>
        </div>

        {/* Action Tabs */}
        <div className="flex items-center gap-1.5 bg-mint-50/70 p-1 rounded-xl border border-tealblue-100">
          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'gallery'
                ? 'bg-brand-600 text-white shadow-sm font-extrabold'
                : 'text-darkcyan-800 hover:text-darkcyan-950'
            }`}
          >
            Photos & Videos ({gallery.length})
          </button>
          <button
            onClick={() => setActiveTab('visual_charts')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'visual_charts'
                ? 'bg-brand-600 text-white shadow-sm font-extrabold'
                : 'text-darkcyan-800 hover:text-darkcyan-950'
            }`}
          >
            Media Charts
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'timeline'
                ? 'bg-brand-600 text-white shadow-sm font-extrabold'
                : 'text-darkcyan-800 hover:text-darkcyan-950'
            }`}
          >
            Event Timeline ({sessions.length})
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'announcements'
                ? 'bg-brand-600 text-white shadow-sm font-extrabold'
                : 'text-darkcyan-800 hover:text-darkcyan-950'
            }`}
          >
            News & Devotionals ({announcements.length})
          </button>
        </div>
      </div>

      {/* SUBTAB 1: GALLERY & MEDIA UPLOADER */}
      {activeTab === 'gallery' && (
        <div className="bg-white rounded-3xl p-6 border border-tealblue-100 shadow-sm space-y-4 transition-colors">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-tealblue-100">
            <div>
              <h3 className="font-bold text-darkcyan-950 text-lg">Public Photo & Video Gallery</h3>
              <p className="text-xs text-darkcyan-700">Add media links that show on the public youth website.</p>
            </div>
            {!isSupervisorMode && (
              <button
                onClick={() => setShowAddMediaModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add Photo / Video Link</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {gallery.map((item) => (
              <div key={item.id} className="rounded-2xl border border-tealblue-100 overflow-hidden bg-mint-50/40 flex flex-col justify-between transition-colors">
                <div className="h-44 w-full bg-slate-200 relative overflow-hidden">
                  <img src={item.media_url} alt={item.title} className="w-full h-full object-cover" />
                  <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900/80 text-white uppercase backdrop-blur-sm">
                    {item.media_type} • {item.tags}
                  </span>
                </div>
                <div className="p-4 space-y-1">
                  <h4 className="font-bold text-darkcyan-950 text-sm leading-snug">{item.title}</h4>
                  <p className="text-xs text-darkcyan-700 line-clamp-2">{item.description}</p>
                </div>
                <div className="px-4 py-2.5 bg-white border-t border-tealblue-100 text-xs text-darkcyan-600 flex justify-between items-center">
                  <span>{item.event_date}</span>
                  {!isSupervisorMode && (
                    <button
                      onClick={() => handleDeleteMedia(item.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📊 SUBTAB 2: VISUAL MEDIA ASSET CHARTS */}
      {/* ========================================================================= */}
      {activeTab === 'visual_charts' && (
        <div className="bg-white rounded-3xl p-6 border border-tealblue-100 shadow-sm space-y-6 transition-colors">
          <div className="border-b border-tealblue-100 pb-3">
            <h3 className="font-bold text-darkcyan-950 text-base">Media Assets & Content Distribution</h3>
            <p className="text-xs text-darkcyan-700">Visual breakdown of photos, videos, flyers and event banners published</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <PieChart
              data={mediaPieData}
              size={200}
              strokeWidth={32}
              centerLabel={`${gallery.length + announcements.length}`}
              centerSubtext="Media Assets"
            />

            <div className="space-y-4 bg-mint-50/50 p-6 rounded-2xl border border-mint-200/80 transition-colors">
              <h4 className="font-bold text-darkcyan-950 text-sm">Media Production Targets</h4>
              <MetricBar label="Retreat Photos & Highlights" value={photosCount} max={20} color="bg-darkcyan-600" />
              <MetricBar label="Video Reels & Sermon Clips" value={videosCount} max={10} color="bg-brand-500" />
              <MetricBar label="Weekly News & Flyers" value={flyersCount} max={15} color="bg-amber-500" />
              <MetricBar label="Event Banner Artwork" value={bannersCount} max={10} color="bg-tealblue-500" />
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: EVENT TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="bg-white rounded-3xl p-6 border border-tealblue-100 shadow-sm space-y-4 transition-colors">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-tealblue-100">
            <div>
              <h3 className="font-bold text-darkcyan-950 text-lg">Yearly Event Schedule & Timeline</h3>
              <p className="text-xs text-darkcyan-700">Dates set here immediately appear on the public interactive timeline.</p>
            </div>
            {!isSupervisorMode && (
              <button
                onClick={() => setShowEventModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Schedule New Event/Date</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {sessions.map((s) => (
              <div key={s.id} className="p-4 rounded-2xl border border-tealblue-100 bg-mint-50/40 flex items-center justify-between gap-4 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="text-center p-2.5 bg-white rounded-xl border border-tealblue-200 min-w-[70px]">
                    <span className="text-xs font-black text-brand-600 block">{s.session_date}</span>
                    <span className="text-[10px] text-darkcyan-700 font-bold">{s.session_time || '10:00 AM'}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-darkcyan-950 text-sm">{s.title}</h4>
                    <p className="text-xs text-darkcyan-700 line-clamp-1">{s.description}</p>
                    <span className="text-[10px] text-cyan-700 font-bold uppercase">{s.session_type} • {s.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 4: NEWS & DEVOTIONALS */}
      {activeTab === 'announcements' && (
        <div className="bg-white rounded-3xl p-6 border border-tealblue-100 shadow-sm space-y-4 transition-colors">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-tealblue-100">
            <div>
              <h3 className="font-bold text-darkcyan-950 text-lg">Public Announcements & Devotionals</h3>
              <p className="text-xs text-darkcyan-600">Publish news, weekly scriptures, and event flyers.</p>
            </div>
            {!isSupervisorMode && (
              <button
                onClick={() => setShowAnnouncementModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Publish Update</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {announcements.map((ann) => (
              <div key={ann.id} className="p-5 rounded-2xl border border-tealblue-100 bg-slate-50/60 space-y-2 transition-colors">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-darkcyan-800 uppercase">
                  {ann.category}
                </span>
                <h4 className="font-bold text-darkcyan-950 text-base">{ann.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{ann.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 💬 SUPERVISORY AUDIT & COMMENTS BOARD */}
      <div className="bg-white rounded-3xl p-6 border border-tealblue-100 text-darkcyan-950 space-y-4 shadow-sm transition-colors">
        <div className="flex items-center gap-3 pb-3 border-b border-tealblue-100">
          <MessageSquare className="w-5 h-5 text-amber-500" />
          <div>
            <h4 className="font-bold text-darkcyan-950 text-sm">Lead Pastor Supervisory Feedback & Guidance</h4>
            <p className="text-xs text-darkcyan-600">Communication board between Administration and Media Team</p>
          </div>
        </div>

        <div className="space-y-2.5 max-h-48 overflow-y-auto">
          {comments.length === 0 ? (
            <p className="text-xs text-darkcyan-600 italic">No supervisory comments yet.</p>
          ) : (
            comments.map((com) => (
              <div key={com.id} className="p-3 bg-slate-50 border border-tealblue-100 rounded-2xl text-xs space-y-1">
                <div className="flex justify-between text-darkcyan-600 font-bold text-[10px]">
                  <span>From: Mr. Kinsley (Youth President)</span>
                  <span>{new Date(com.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-slate-800 leading-relaxed font-medium">"{com.comment_text}"</p>
              </div>
            ))
          )}
        </div>

        {isSupervisorMode && (
          <form onSubmit={handlePostSupervisorComment} className="pt-2 flex gap-2">
            <input
              type="text"
              required
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Leave supervisory feedback or task for the Media Team..."
              className="flex-1 px-4 py-2.5 text-xs bg-mint-50/70 border border-tealblue-100 rounded-xl text-darkcyan-950 focus:outline-none focus:border-brand-500"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
            >
              Send Comment
            </button>
          </form>
        )}
      </div>

      {/* Modal: Add Media */}
      {showAddMediaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-tealblue-100 transition-colors">
            <h3 className="font-bold text-darkcyan-950 text-base">Add Photo or Video Link</h3>
            <form onSubmit={handleAddMedia} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={mediaForm.title}
                  onChange={(e) => setMediaForm({ ...mediaForm, title: e.target.value })}
                  placeholder="e.g. Worship Night Highlights"
                  className="w-full px-3 py-2 text-xs border border-tealblue-200 rounded-xl bg-white text-darkcyan-950"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Media Type</label>
                  <select
                    value={mediaForm.media_type}
                    onChange={(e) => setMediaForm({ ...mediaForm, media_type: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-tealblue-200 rounded-xl bg-white text-darkcyan-950"
                  >
                    <option value="image">Photo / Image</option>
                    <option value="video">Video Reel (YouTube/Vimeo)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Tag Category</label>
                  <input
                    type="text"
                    value={mediaForm.tags}
                    onChange={(e) => setMediaForm({ ...mediaForm, tags: e.target.value })}
                    placeholder="Worship, Camp, etc."
                    className="w-full px-3 py-2 text-xs border border-tealblue-200 rounded-xl bg-white text-darkcyan-950"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Image / Thumbnail URL *</label>
                <input
                  type="url"
                  required
                  value={mediaForm.media_url}
                  onChange={(e) => setMediaForm({ ...mediaForm, media_url: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 text-xs border border-tealblue-200 rounded-xl bg-white text-darkcyan-950"
                />
              </div>

              {mediaForm.media_type === 'video' && (
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">YouTube Video Link</label>
                  <input
                    type="url"
                    value={mediaForm.video_embed_url}
                    onChange={(e) => setMediaForm({ ...mediaForm, video_embed_url: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3 py-2 text-xs border border-tealblue-200 rounded-xl bg-white text-darkcyan-950"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Description</label>
                <textarea
                  rows="2"
                  value={mediaForm.description}
                  onChange={(e) => setMediaForm({ ...mediaForm, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-tealblue-200 rounded-xl bg-white text-darkcyan-950"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-tealblue-100">
                <button type="button" onClick={() => setShowAddMediaModal(false)} className="px-4 py-2 text-xs font-semibold text-darkcyan-700 hover:text-slate-900">Cancel</button>
                <button type="submit" className="px-5 py-2 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl shadow-md transition-all active:scale-95">Add to Gallery</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Schedule Event */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-tealblue-100 transition-colors">
            <h3 className="font-bold text-darkcyan-950 text-base">Schedule New Event on Timeline</h3>
            <form onSubmit={handleCreateEvent} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  placeholder="e.g. Praise & Acoustic Night"
                  className="w-full px-3 py-2 text-xs border border-tealblue-200 rounded-xl bg-white text-darkcyan-950"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={eventForm.session_date}
                    onChange={(e) => setEventForm({ ...eventForm, session_date: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-tealblue-200 rounded-xl bg-white text-darkcyan-950"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Time</label>
                  <input
                    type="time"
                    value={eventForm.session_time}
                    onChange={(e) => setEventForm({ ...eventForm, session_time: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-tealblue-200 rounded-xl bg-white text-darkcyan-950"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Location / Venue</label>
                <input
                  type="text"
                  value={eventForm.location}
                  onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                  placeholder="e.g. Youth Chapel"
                  className="w-full px-3 py-2 text-xs border border-tealblue-200 rounded-xl bg-white text-darkcyan-950"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Banner Image URL</label>
                <input
                  type="url"
                  value={eventForm.banner_url}
                  onChange={(e) => setEventForm({ ...eventForm, banner_url: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-tealblue-200 rounded-xl bg-white text-darkcyan-950"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Event Description</label>
                <textarea
                  rows="2"
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-tealblue-200 rounded-xl bg-white text-darkcyan-950"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-tealblue-100">
                <button type="button" onClick={() => setShowEventModal(false)} className="px-4 py-2 text-xs font-semibold text-darkcyan-700 hover:text-slate-900">Cancel</button>
                <button type="submit" className="px-5 py-2 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl shadow-md transition-all active:scale-95">Publish to Timeline</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
