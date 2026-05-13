import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, MessageSquare, Eye, ChevronUp, Pin, Lock, Clock, Plus, X, Send, Hash, Shield, Crown, Flame, TrendingUp, AlertCircle, Trophy, Star, Award, User } from 'lucide-react';
import SEO from '../components/SEO';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const ForumPage = () => {
const RoleBadge = ({ author }) => {
  if (!author) return null;
  if (author.role?.toUpperCase() === 'ADMIN') return <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '9px', fontWeight: '900', background: '#ef4444', color: '#000', letterSpacing: '1px', textTransform: 'uppercase' }}><Shield size={10} style={{ marginRight: '3px', verticalAlign: 'middle' }} />ADMIN</span>;
  if (author.is_pro) return <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '9px', fontWeight: '900', background: '#7B2FFF', color: '#fff', letterSpacing: '1px', textTransform: 'uppercase' }}><Crown size={10} style={{ marginRight: '3px', verticalAlign: 'middle' }} />PRO</span>;
  return null;
};

  const navigate = useNavigate();
  const [view, setView] = useState('categories'); // 'categories' | 'threads' | 'thread' | 'profile'
  const [categories, setCategories] = useState([]);
  const [threads, setThreads] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [currentThread, setCurrentThread] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Active Category filter
  const [activeDepartment, setActiveDepartment] = useState('ALL');

  // Create thread modal
  const [showNewThread, setShowNewThread] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newTags, setNewTags] = useState('');
  const [newCatId, setNewCatId] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingThread, setEditingThread] = useState(null);
  const [editingPost, setEditingPost] = useState(null);

  // Reply
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);

  // User profile
  const [profile, setProfile] = useState(null);
  const [viewProfileData, setViewProfileData] = useState(null);

  const getHeaders = async () => {
    return {
      'Content-Type': 'application/json'
    };
  };

  useEffect(() => {
    supabase.from('profiles').select('role, is_pro, email, avatar_url, subscription_end_date, tier, subscription_status').eq('id', '00000000-0000-0000-0000-000000000000').single().then(({ data }) => {
      if (data) setProfile(data);
    });
  }, []);

  useEffect(() => {
    if (showNewThread) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showNewThread]);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND}/api/forum/categories`);
      const data = await res.json();
      setCategories(data.categories || []);

      const bRes = await fetch(`${BACKEND}/api/forum/leaderboard`);
      if (bRes.ok) {
        const bdata = await bRes.json();
        setLeaderboard(bdata.leaderboard || []);
      }
    } catch (err) { console.error('Forum categories error:', err); }
    setLoading(false);
  }, []);

  // Fetch threads
  const fetchThreads = useCallback(async (catId, sortBy = 'newest', pg = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND}/api/forum/threads?category_id=${catId}&sort=${sortBy}&page=${pg}&limit=20`);
      const data = await res.json();
      setThreads(data.threads || []);
      setTotal(data.total || 0);
    } catch (err) { console.error('Forum threads error:', err); }
    setLoading(false);
  }, []);

  // Fetch single thread
  const fetchThread = useCallback(async (threadId) => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND}/api/forum/threads/${threadId}`);
      const data = await res.json();
      setCurrentThread(data.thread);
      setPosts(data.posts || []);
      if (data.category) setCurrentCategory(data.category);
    } catch (err) { console.error('Forum thread error:', err); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  useEffect(() => {
    if (view !== 'thread' || !currentThread?.id) return undefined;
    const channel = supabase.channel(`forum-thread-${currentThread.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'forum_posts', filter: `thread_id=eq.${currentThread.id}` }, () => {
        fetchThread(currentThread.id);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'forum_threads', filter: `id=eq.${currentThread.id}` }, () => {
        fetchThread(currentThread.id);
      })
      .subscribe();
    const poll = setInterval(() => fetchThread(currentThread.id), 15000);
    return () => {
      clearInterval(poll);
      supabase.removeChannel(channel);
    };
  }, [view, currentThread?.id, fetchThread]);

  useEffect(() => {
    if (view !== 'threads' || !currentCategory?.id) return undefined;
    const channel = supabase.channel(`forum-category-${currentCategory.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'forum_threads', filter: `category_id=eq.${currentCategory.id}` }, () => {
        fetchThreads(currentCategory.id, sort, page);
        fetchCategories();
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [view, currentCategory?.id, sort, page, fetchThreads, fetchCategories]);

  const openCategory = (cat) => {
    setCurrentCategory(cat);
    setView('threads');
    setPage(1);
    fetchThreads(cat.id, sort, 1);
  };

  const openThread = (thread) => {
    setCurrentThread(thread);
    setView('thread');
    fetchThread(thread.id);
  };

  const openProfile = async (userId) => {
    setLoading(true);
    setView('profile');
    try {
      const res = await fetch(`${BACKEND}/api/forum/user/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setViewProfileData(data);
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const goBack = () => {
    if (view === 'thread') {
      setView('threads');
      if (currentCategory) fetchThreads(currentCategory.id, sort, page);
    } else if (view === 'profile' || view === 'threads') {
      setView('categories');
      setCurrentCategory(null);
    } else {
      navigate(-1);
    }
  };

  // Create thread
  const handleCreateThread = async () => {
    if (!newTitle.trim() || !newBody.trim()) return;
    setCreating(true);
    try {
      const headers = await getHeaders();
      const catId = newCatId || currentCategory?.id;
      const res = await fetch(`${BACKEND}/api/forum/threads`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: newTitle.trim(),
          body: newBody.trim(),
          category_id: catId,
          tags: newTags ? newTags.split(',').map(t => t.trim()).filter(Boolean) : []
        })
      });
      const data = await res.json();
      if (data.error) { alert(data.error); }
      else {
        setShowNewThread(false);
        setNewTitle(''); setNewBody(''); setNewTags('');
        if (data.thread) {
          setThreads(prev => [data.thread, ...prev.filter(t => t.id !== data.thread.id)]);
          openThread(data.thread);
        } else if (currentCategory) fetchThreads(currentCategory.id, sort, page);
      }
    } catch (err) { console.error('Create thread error:', err); }
    setCreating(false);
  };

  // Reply to thread
  const handleReply = async () => {
    if (!replyText.trim() || !currentThread) return;
    setReplying(true);
    try {
      const headers = await getHeaders();
      const res = await fetch(`${BACKEND}/api/forum/posts`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ thread_id: currentThread.id, body: replyText.trim() })
      });
      const data = await res.json();
      if (data.error) alert(data.error);
      else {
        const optimisticPost = data.post || {
          id: `local-${Date.now()}`,
          body: replyText.trim(),
          created_at: new Date().toISOString(),
          upvotes: 0,
          author: profile || { email: 'demo@example.com' }
        };
        setReplyText('');
        setPosts(prev => [...prev, optimisticPost]);
        setCurrentThread(prev => prev ? { ...prev, reply_count: (prev.reply_count || 0) + 1 } : prev);
        fetchThread(currentThread.id);
      }
    } catch (err) { console.error('Reply error:', err); }
    setReplying(false);
  };

  // Upvote thread
  const handleUpvoteThread = async (threadId) => {
    try {
      const headers = await getHeaders();
      await fetch(`${BACKEND}/api/forum/threads/${threadId}/upvote`, { method: 'POST', headers });
      if (view === 'thread') fetchThread(threadId);
      else if (currentCategory) fetchThreads(currentCategory.id, sort, page);
    } catch (err) { console.error('Upvote error:', err); }
  };

  // Upvote post
  const handleUpvotePost = async (postId) => {
    try {
      const headers = await getHeaders();
      await fetch(`${BACKEND}/api/forum/posts/${postId}/upvote`, { method: 'POST', headers });
      if (currentThread) fetchThread(currentThread.id);
    } catch (err) { console.error('Upvote post error:', err); }
  };

  // Delete thread (admin)
  const handleDeleteThread = async (threadId) => {
    if (!confirm('Delete this thread?')) return;
    try {
      const headers = await getHeaders();
      await fetch(`${BACKEND}/api/forum/threads/${threadId}`, { method: 'DELETE', headers });
      if (view === 'thread') goBack();
      else if (currentCategory) fetchThreads(currentCategory.id, sort, page);
    } catch (err) { console.error('Delete error:', err); }
  };

  // Pin/Lock thread (admin)
  const handleTogglePin = async (threadId, isPinned) => {
    try {
      const headers = await getHeaders();
      await fetch(`${BACKEND}/api/forum/threads/${threadId}`, {
        method: 'PUT', headers,
        body: JSON.stringify({ is_pinned: !isPinned })
      });
      if (currentThread) fetchThread(threadId);
      else if (currentCategory) fetchThreads(currentCategory.id, sort, page);
    } catch (err) { console.error('Pin error:', err); }
  };

  const handleToggleLock = async (threadId, isLocked) => {
    try {
      const headers = await getHeaders();
      await fetch(`${BACKEND}/api/forum/threads/${threadId}`, {
        method: 'PUT', headers,
        body: JSON.stringify({ is_locked: !isLocked })
      });
      if (currentThread) fetchThread(threadId);
    } catch (err) { console.error('Lock error:', err); }
  };

  const handleAdminThreadAction = async (thread, action, extra = {}) => {
    if (!isAdmin) return;
    try {
      const headers = await getHeaders();
      const res = await fetch(`${BACKEND}/api/forum/admin/threads/${thread.id}/action`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ action, ...extra })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Action failed');
      setEditingThread(null);
      if (view === 'thread') {
        if (action === 'hide' || action === 'delete') goBack();
        else fetchThread(thread.id);
      } else if (currentCategory) {
        fetchThreads(currentCategory.id, sort, page);
      }
    } catch (err) {
      alert(err.message || 'Forum admin action failed');
    }
  };

  const handleEditPost = async () => {
    if (!editingPost?.body?.trim()) return;
    try {
      const headers = await getHeaders();
      const res = await fetch(`${BACKEND}/api/forum/posts/${editingPost.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ body: editingPost.body.trim() })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to update reply');
      setEditingPost(null);
      if (currentThread) fetchThread(currentThread.id);
    } catch (err) {
      alert(err.message || 'Failed to update reply');
    }
  };

  const isAdmin = false;
  const hasActiveSub = (profile?.tier === 'pro' && profile?.subscription_status === 'active' && profile?.subscription_end_date && new Date(profile.subscription_end_date) > new Date());
  const isProActive = profile?.is_pro || hasActiveSub || isAdmin;
  const subEnd = profile?.subscription_end_date ? new Date(profile.subscription_end_date).getTime() : 0;
  const isGracePeriod = !isProActive && subEnd > 0 && ((Date.now() - subEnd) < 7 * 24 * 60 * 60 * 1000);
  const isBasicUser = !isProActive && !isGracePeriod;

  const getCategoryAccess = (cat) => {
    const roleReq = cat.role_required?.toUpperCase() || '';
    if (roleReq === 'ADMIN' && !isAdmin) return 'locked';
    if (roleReq === 'PRO') {
      if (isProActive) return 'full';
      if (isGracePeriod) return 'read-only';
      return 'locked';
    }
    return 'full';
  };

  const getUsername = (author) => author?.email?.split('@')[0] || 'Anonymous';
  const timeAgo = (date) => {
    const s = Math.floor((Date.now() - new Date(date)) / 1000);
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  };

  const cardVideos = [
    'https://assets.mixkit.co/videos/preview/mixkit-abstract-technology-connection-lines-loop-27402-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-3d-abstract-fluid-movement-41155-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-ink-swirling-in-water-238-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-waves-of-iridescent-colors-loop-42861-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-purple-and-blue-neon-liquid-animation-7690-large.mp4'
  ];

  return (
    <>
      <SEO title="Forums — PromptQuill Community" description="Join the PromptQuill community forums. Discuss AI prompts, share strategies, get feedback, and connect with builders." />
      <div onMouseMove={e => {
        document.documentElement.style.setProperty('--g-x', `${e.clientX}px`);
        document.documentElement.style.setProperty('--g-y', `${e.clientY}px`);
      }} style={{ minHeight: '100vh', backgroundColor: '#000', color: '#fff', fontFamily: 'Inter, system-ui, sans-serif', position: 'relative' }}>

        {/* GenZ Brutal Global Background */}
        <div className="brutal-bg"></div>

        <style>{`
          @keyframes forumFadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes textReveal { 
            0% { opacity: 0; transform: translateY(40px) skewY(2deg); filter: blur(10px); } 
            100% { opacity: 1; transform: translateY(0) skewY(0); filter: blur(0); } 
          }
          @keyframes marqueeScroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @keyframes spinSticker {
            100% { transform: rotate(360deg); }
          }
          
          .forum-fade { animation: forumFadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          
          /* Brutal Background */
          .brutal-bg {
            position: fixed; inset: 0; z-index: 0;
            background-color: #09090b;
            background-image: radial-gradient(#333 1px, transparent 1px);
            background-size: 30px 30px;
          }

          /* GenZ Brutalist Hero */
          .forum-awwward-hero {
            position: relative; padding: 140px 0 80px; display: flex; flex-direction: column; align-items: center; text-align: center; z-index: 10;
          }
          .hero-mask-text {
            font-size: clamp(4rem, 10vw, 10rem); font-weight: 900; line-height: 0.85; letter-spacing: -6px; color: #fff;
            text-shadow: 6px 6px 0px #ff00ff, 12px 12px 0px #ccff00;
            transform: rotate(-2deg); margin: 0 0 40px 0; font-family: 'Inter', sans-serif;
            animation: textReveal 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .crazy-font { font-family: 'Courier New', Courier, monospace; color: #ccff00; -webkit-text-stroke: 3px #000; text-shadow: 6px 6px 0px #ff00ff; }
          .hero-subtitle-glass {
            font-size: 16px; color: #fff; background: #000; padding: 12px 24px; border: 2px solid #fff; border-radius: 99px;
            box-shadow: 4px 4px 0px #ccff00; font-weight: 900; transform: rotate(2deg); max-width: 500px;
            animation: textReveal 1.5s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards;
            opacity: 0;
          }
          .floating-sticker {
            position: absolute; font-size: 60px; filter: drop-shadow(4px 4px 0px #000); animation: spinSticker 15s linear infinite; z-index: 20;
          }

          /* Brutalist Cards */
          .bento-grid {
            display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 40px; padding: 20px 0 80px; z-index: 10; position: relative;
          }
          .bento-card {
            background: #111;
            border: 4px solid #fff;
            border-radius: 16px;
            padding: 32px;
            transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
            position: relative;
            cursor: pointer;
            box-shadow: 10px 10px 0px #ccff00;
            display: flex; flex-direction: column; justify-content: space-between; min-height: 300px;
          }
          /* Dynamic Utpatang Rotations */
          .bento-card:nth-child(even) { transform: rotate(2deg); box-shadow: -10px 10px 0px #ff00ff; }
          .bento-card:nth-child(odd) { transform: rotate(-2deg); }
          .bento-card:hover {
            transform: translate(-5px, -5px) rotate(0deg);
            border-color: #ccff00;
            box-shadow: 15px 15px 0px #fff;
          }
          .bento-card:nth-child(even):hover { border-color: #ff00ff; box-shadow: -15px 15px 0px #fff; }
          .cat-icon-wrap {
            width: 70px; height: 70px; border-radius: 50%; background: #000; border: 3px solid #ccff00; display: flex; align-items: center; justify-content: center; font-size: 32px; margin-bottom: 30px; transition: 0.3s; box-shadow: 4px 4px 0px #ff00ff;
          }
          .bento-card:hover .cat-icon-wrap { transform: scale(1.2) rotate(15deg); border-color: #ff00ff; box-shadow: 4px 4px 0px #ccff00; }
          .card-content { height: 100%; display: flex; flex-direction: column; }

          /* Spatial Thread Rows */
          .thread-row {
            background: rgba(15,15,15,0.5);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255,255,255,0.05);
            border-radius: 24px;
            padding: 24px 28px;
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            display: flex;
            gap: 20px;
            align-items: center;
            position: relative;
            overflow: hidden;
            cursor: pointer;
            margin-bottom: 12px;
          }
          .thread-row::after {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent);
            transform: translateX(-100%);
            transition: 0.6s;
          }
          .thread-row:hover::after { transform: translateX(100%); }
          .thread-row:hover {
            background: rgba(20,20,20,0.8);
            border-color: rgba(255,255,255,0.15);
            transform: translateY(-2px) scale(1.01);
            box-shadow: 0 15px 35px rgba(0,0,0,0.6), 0 0 20px rgba(255,255,255,0.02);
          }
          .thread-stats-pill {
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.05);
            border-radius: 99px;
            padding: 6px 12px;
            display: flex; align-items: center; gap: 6px;
            font-size: 11px; font-weight: 700; color: #888;
            transition: 0.3s;
          }
          .thread-row:hover .thread-stats-pill {
            background: rgba(255,255,255,0.08); color: #fff;
          }

          /* Button */
          .forum-glass-btn {
            background: rgba(255,255,255,0.03);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.1);
            color: #fff; padding: 10px 20px; border-radius: 12px;
            font-size: 13px; font-weight: 700; display: flex; align-items: center; gap: 8px;
            cursor: pointer; transition: all 0.3s;
          }
          .forum-glass-btn:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.2); transform: translateY(-2px); }
          .forum-glass-btn.primary { background: #A8FF3E; color: #000; border-color: #A8FF3E; }
          .forum-glass-btn.primary:hover { background: #96e833; border-color: #96e833; box-shadow: 0 0 20px rgba(168,255,62,0.3); }

          /* Generic Form elements */
          .forum-input, .forum-textarea {
            width: 100%; padding: 16px 20px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1);
            border-radius: 16px; color: #fff; font-size: 14px; outline: none; transition: border-color 0.3s;
          }
          .forum-input:focus, .forum-textarea:focus { border-color: #A8FF3E; background: rgba(0,0,0,0.5); }
          
          /* ── Mobile Responsive Rules ── */
          @media (max-width: 768px) {
            .mobile-hide { display: none !important; }
            .main-grid-responsive { grid-template-columns: 1fr !important; gap: 24px !important; }
            .bento-grid { grid-template-columns: 1fr !important; gap: 20px !important; }
            .bento-card { transform: none !important; box-shadow: 6px 6px 0px #ccff00 !important; }
            .bento-card:nth-child(even) { transform: none !important; box-shadow: -6px 6px 0px #ff00ff !important; }
            .forum-awwward-hero { padding: 100px 20px 60px !important; }
            .hero-mask-text { letter-spacing: -3px !important; }
            .thread-row { padding: 16px !important; gap: 12px !important; }
            .forum-header-bar { padding: 16px 16px !important; }
            .forum-header-bar h1 { font-size: 14px !important; }
            .forum-header-title-badge { display: none !important; }
            .forum-header-actions .forum-glass-btn:not(.primary) { display: none !important; }
            .forum-header-actions .forum-glass-btn.primary { padding: 8px 14px !important; font-size: 12px !important; }
          }
        `}</style>

        {/* Floating Header */}
        <div className="forum-header-bar" style={{ position: 'sticky', top: 0, zIndex: 100, background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)', padding: '24px 40px', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0 }}>
              <button onClick={goBack} style={{ color: '#fff', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', padding: '10px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.3s', flexShrink: 0 }} className="forum-glass-btn-icon"><ArrowLeft size={18} /></button>
              <h1 style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '-0.5px', margin: 0, color: '#ccff00', textTransform: 'uppercase', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {view === 'categories' ? 'FORUM CULT //' : view === 'threads' ? currentCategory?.name : currentThread?.title?.substring(0, 30) + '...'}
              </h1>
              {view === 'categories' && <span className="forum-header-title-badge" style={{ padding: '4px 12px', background: 'rgba(168,255,62,0.1)', border: '1px solid rgba(168,255,62,0.2)', borderRadius: '99px', fontSize: '10px', fontWeight: '800', color: '#A8FF3E', flexShrink: 0 }}>EARLY ACCESS</span>}
            </div>
            <div className="forum-header-actions" style={{ display: 'flex', gap: '12px', flexShrink: 0 }}>
              {view === 'threads' && getCategoryAccess(currentCategory) === 'full' && (
                <button className="forum-glass-btn primary" onClick={() => { setNewCatId(currentCategory?.id || ''); setShowNewThread(true); }}>
                  <Plus size={16} /> New Thread
                </button>
              )}
              <button onClick={() => navigate('/ai')} className="forum-glass-btn">Dashboard</button>
            </div>
          </div>
        </div>


        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>

          {/* ═══════════ CATEGORIES VIEW ═══════════ */}
          {view === 'categories' && (
            <div className="forum-fade">
              <div className="forum-awwward-hero">
                <div style={{ position: 'absolute', top: '10px', width: '200%', display: 'flex', fontSize: '24px', fontWeight: 900, color: '#ccff00', textTransform: 'uppercase', animation: 'marqueeScroll 10s linear infinite', whiteSpace: 'nowrap', fontFamily: 'monospace', opacity: 0.8, mixBlendMode: 'difference', zIndex: 0, pointerEvents: 'none' }}>
                  <span>WTF IS A NORMAL FORUM? • SPIT YOUR BEST PROMPTS • GET ROASTED • GET NOTICED • WTF IS A NORMAL FORUM? • SPIT YOUR BEST PROMPTS • GET ROASTED • GET NOTICED • </span>
                </div>
                <h1 className="hero-mask-text">
                  FORUM <br /> <span className="crazy-font">CULT //</span>
                </h1>
                <p className="hero-subtitle-glass">Join the brightest minds in generative AI. Explore workflows, debate startup ideas, and push the boundaries of PromptQuill together.</p>
                <div className="floating-sticker" style={{ top: '10%', right: '15%' }}>👽</div>
                <div className="floating-sticker" style={{ bottom: '15%', left: '10%', animationDirection: 'reverse' }}>🔥</div>
                <div className="floating-sticker" style={{ top: '40%', left: '5%', filter: 'saturate(2)', fontSize: '40px' }}>⚡️</div>
              </div>

              {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '32px', paddingBottom: '80px' }}>
                  <div className="bento-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', padding: 0 }}>
                    {[1, 2, 3, 4, 5, 6].map(i => <div key={i} style={{ height: '220px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px' }} className="skeleton" />)}
                  </div>
                  <div style={{ height: '500px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px' }} className="skeleton mobile-hide" />
                </div>
              ) : categories.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '100px 0' }}>
                  <AlertCircle size={48} color="#333" style={{ marginBottom: '20px' }} />
                  <p style={{ color: '#fff', fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px' }}>The void is empty.</p>
                  <p style={{ color: '#666', fontSize: '15px', marginTop: '8px' }}>Categories are being initialized. Check back shortly.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '40px', paddingBottom: '80px', alignItems: 'start' }} className="main-grid-responsive">

                  {/* Left Column: Categories */}
                  <div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingBottom: '16px', marginBottom: '24px' }} className="sort-row">
                      {['ALL', 'PRO FORUM', 'PUBLIC', 'OFFICIAL', 'SUPPORT', 'ELITE LOUNGE'].map(dept => (
                        <button key={dept} onClick={() => setActiveDepartment(dept)} style={{ padding: '8px 20px', borderRadius: '99px', fontSize: '12px', fontWeight: '800', background: activeDepartment === dept ? 'rgba(255,255,255,0.1)' : 'transparent', color: activeDepartment === dept ? '#fff' : '#666', border: '1px solid', borderColor: activeDepartment === dept ? 'rgba(255,255,255,0.2)' : 'transparent', cursor: 'pointer', whiteSpace: 'nowrap', transition: '0.3s' }}>
                          {dept}
                        </button>
                      ))}
                    </div>

                    <div className="bento-grid" style={{ padding: 0 }} onMouseMove={e => {
                      for (const card of document.querySelectorAll('.bento-card')) {
                        const rect = card.getBoundingClientRect(), x = e.clientX - rect.left, y = e.clientY - rect.top;
                        card.style.setProperty('--mouse-x', `${x}px`);
                        card.style.setProperty('--mouse-y', `${y}px`);
                      }
                    }}>
                      {categories.filter(c => {
                        if (activeDepartment === 'ALL') return true;
                        if (activeDepartment === 'OFFICIAL') return (c.role_required?.toUpperCase() === 'ADMIN') || c.slug.includes('announcement');
                        if (activeDepartment === 'SUPPORT') return c.slug.includes('support') || c.slug.includes('bug');
                        if (activeDepartment === 'ELITE LOUNGE') return (c.role_required?.toUpperCase() === 'TOP_100');
                        if (activeDepartment === 'PRO FORUM') return (c.role_required?.toUpperCase() === 'PRO');
                        return !c.role_required && !c.slug.includes('support') && !c.slug.includes('announcement');
                      }).map((cat, i) => {
                        const access = getCategoryAccess(cat);
                        // Hide internal admin categories if not admin
                        if (access === 'locked' && (cat.role_required?.toUpperCase() === 'ADMIN')) return null;

                        return (
                          <div key={cat.id} className="bento-card" onClick={() => { if (access !== 'locked') openCategory(cat); }} style={{ animationDelay: `${i * 0.1}s`, animation: 'forumFadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards', opacity: 0 }}>
                            <div className="card-content" style={{ filter: access === 'locked' ? 'blur(10px) grayscale(1)' : 'none', opacity: access === 'locked' ? 0.5 : 1, transition: '0.3s' }}>
                              <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <div className="cat-icon-wrap" style={{ color: cat.color || '#fff' }}>{cat.icon || '💬'}</div>
                                  <div style={{ display: 'flex', gap: '6px' }}>
                                    {(cat.role_required?.toUpperCase() === 'PRO') && <span style={{ fontSize: '9px', color: '#fff', background: '#7B2FFF', padding: '4px 10px', borderRadius: '4px', fontWeight: '900', letterSpacing: '1px' }}><Crown size={10} style={{ marginRight: '4px', verticalAlign: '-1px' }} />PRO ONLY</span>}
                                    {(cat.role_required?.toUpperCase() === 'ADMIN') && <span style={{ fontSize: '9px', color: '#000', background: '#eab308', padding: '4px 10px', borderRadius: '4px', fontWeight: '900', letterSpacing: '1px' }}><Shield size={10} style={{ marginRight: '4px', verticalAlign: '-1px' }} />OFFICIAL</span>}
                                    {access === 'read-only' && <span style={{ fontSize: '9px', color: '#000', background: '#f59e0b', padding: '4px 10px', borderRadius: '4px', fontWeight: '900', letterSpacing: '1px' }}><Clock size={10} style={{ marginRight: '4px', verticalAlign: '-1px' }} />EXPIRED PRO</span>}
                                  </div>
                                </div>
                                <h3 style={{ fontSize: '26px', fontWeight: '900', letterSpacing: '-0.5px', margin: '0 0 12px 0', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{cat.name}</h3>
                                <p style={{ color: '#ccc', fontSize: '15px', lineHeight: '1.6', margin: 0, textShadow: '0 2px 5px rgba(0,0,0,0.8)' }}>{cat.description}</p>
                              </div>

                              <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#eee', fontSize: '13px', fontWeight: '800', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                                  <MessageSquare size={14} /> {cat.thread_count} discussions
                                </div>
                                <div style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: '800', opacity: 0.8, transition: '0.3s' }} className="explore-btn">
                                  Explore <ArrowRight size={14} />
                                </div>
                              </div>
                            </div>

                            {/* LOCK OVERLAY GLITCH */}
                            {access === 'locked' && (
                              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)' }}>
                                <div style={{ background: '#000', padding: '16px', borderRadius: '50%', marginBottom: '16px', border: '1px solid #ef4444', color: '#ef4444', boxShadow: '0 0 30px #ef4444' }}>
                                  <Lock size={28} />
                                </div>
                                <span style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '4px', color: '#ef4444', textTransform: 'uppercase', textShadow: '0 0 10px #ef4444' }}>Locked</span>
                                <span style={{ fontSize: '12px', color: '#fff', marginTop: '6px', fontWeight: '800', letterSpacing: '1px' }}>REQUIRES PRO PLAN</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: Leaderboard */}
                  <div className="mobile-hide" style={{ position: 'sticky', top: '120px' }}>
                    <div style={{ background: 'rgba(10,10,10,0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '32px', backdropFilter: 'blur(20px)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <div style={{ padding: '10px', background: 'rgba(255,180,0,0.1)', borderRadius: '12px', color: '#FFB400' }}><Trophy size={20} /></div>
                        <h3 style={{ fontSize: '18px', fontWeight: '900', margin: 0 }}>Hall of Fame</h3>
                      </div>

                      {(!leaderboard || leaderboard.length === 0) ? (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: '#555', fontSize: '13px', fontWeight: '700' }}>No top users yet.</div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          {(leaderboard || []).slice(0, 10).map((user, i) => (
                            <div key={user.id} onClick={() => openProfile(user.id)} style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer', padding: '8px', borderRadius: '12px', transition: '0.3s' }} className="leaderboard-item">
                              <div style={{ width: '24px', fontSize: '14px', fontWeight: '900', color: i < 3 ? '#FFB400' : '#444', textAlign: 'center' }}>
                                #{i + 1}
                              </div>
                              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#1a1a1a', border: i < 3 ? '1px solid rgba(255,180,0,0.3)' : '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '800', color: '#888' }}>
                                {user.username.charAt(0).toUpperCase()}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '14px', fontWeight: '800', color: '#ccc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.username}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#A8FF3E', fontWeight: '700' }}>
                                  <Star size={10} /> {user.popularity || 0} Rep
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {(leaderboard && leaderboard.length > 10) && (
                        <button style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', color: '#888', fontWeight: '700', fontSize: '12px', marginTop: '24px', cursor: 'pointer', transition: '0.3s' }} className="view-all-btn">
                          View Complete Leaderboard
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══════════ THREADS VIEW ═══════════ */}
          {view === 'threads' && (
            <div className="forum-fade" style={{ maxWidth: '1000px', margin: '0 auto', padding: '60px 0' }}>
              <div style={{ marginBottom: '40px', paddingBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '24px' }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '16px', padding: '8px 16px', borderRadius: '99px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: '18px' }}>{currentCategory?.icon}</span>
                    <span style={{ fontSize: '12px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', color: currentCategory?.color || '#A8FF3E' }}>{currentCategory?.name}</span>
                  </div>
                  <h2 style={{ fontSize: '36px', fontWeight: '900', letterSpacing: '-1px', margin: '0 0 12px 0' }}>Discussions</h2>
                  <p style={{ color: '#888', fontSize: '15px', maxWidth: '600px', margin: 0, lineHeight: '1.5' }}>{currentCategory?.description}</p>
                </div>

                <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.3)', padding: '6px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  {['newest', 'popular', 'active'].map(s => (
                    <button key={s} onClick={() => { setSort(s); setPage(1); fetchThreads(currentCategory.id, s, 1); }}
                      style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: '700', background: sort === s ? 'rgba(255,255,255,0.1)' : 'transparent', color: sort === s ? '#fff' : '#666', border: 'none', cursor: 'pointer', textTransform: 'capitalize', transition: '0.3s' }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[1, 2, 3, 4, 5].map(i => <div key={i} style={{ height: '90px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px' }} className="skeleton" />)}
                </div>
              ) : threads.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '100px 0', background: 'rgba(10,10,10,0.5)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <MessageSquare size={48} color="#333" style={{ marginBottom: '20px' }} />
                  <p style={{ color: '#fff', fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>Quiet in here.</p>
                  <p style={{ color: '#666', fontSize: '14px', marginBottom: '24px' }}>Be the first to spark a conversation.</p>
                  {getCategoryAccess(currentCategory) === 'full' && <button className="forum-glass-btn primary" onClick={() => { setNewCatId(currentCategory?.id || ''); setShowNewThread(true); }} style={{ margin: '0 auto' }}><Plus size={16} /> Start Discussion</button>}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {(threads || []).map((t, i) => (
                    <div key={t.id} className="thread-row" onClick={() => openThread(t)} style={{ opacity: 0, animation: `forumFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.05}s forwards` }}>

                      {/* Voting side */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', minWidth: '40px', zIndex: 2 }}>
                        <button onClick={(e) => { e.stopPropagation(); handleUpvoteThread(t.id); }} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', color: '#fff', cursor: 'pointer', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.3s' }} className="upvote-btn"><ChevronUp size={16} /></button>
                        <span style={{ fontSize: '14px', fontWeight: '900', color: '#fff' }}>{t.upvotes || 0}</span>
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0, zIndex: 2 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                          {t.is_pinned && <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: '800', border: '1px solid rgba(245,158,11,0.3)', padding: '2px 8px', borderRadius: '4px', background: 'rgba(245,158,11,0.1)' }}><Pin size={10} /> PINNED</span>}
                          {t.is_locked && <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: '800', border: '1px solid rgba(239,68,68,0.3)', padding: '2px 8px', borderRadius: '4px', background: 'rgba(239,68,68,0.1)' }}><Lock size={10} /> LOCKED</span>}
                          <h3 style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.3px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</h3>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '13px', color: '#888', fontWeight: '600' }}>by <span style={{ color: '#ccc' }}>{getUsername(t.author)}</span></span>
                          <RoleBadge author={t.author} />
                          <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }}></span>
                          <span style={{ fontSize: '12px', color: '#666', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} />{timeAgo(t.created_at)}</span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', zIndex: 2 }}>
                        <div className="thread-stats-pill">
                          <MessageSquare size={14} />{t.reply_count || 0}
                        </div>
                        <div className="thread-stats-pill mobile-hide">
                          <Eye size={14} />{t.views || 0}
                        </div>
                        {isAdmin && (
                          <div style={{ display: 'flex', gap: '6px', marginLeft: '12px', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '12px', flexWrap: 'wrap' }} onClick={e => e.stopPropagation()}>
                            <button onClick={() => handleAdminThreadAction(t, t.is_pinned ? 'unpin' : 'pin')} style={{ background: '#111', border: '1px solid #222', color: '#f59e0b', cursor: 'pointer', padding: '5px 7px', borderRadius: '6px', fontSize: '10px', fontWeight: '800' }}>{t.is_pinned ? 'Unpin' : 'Pin'}</button>
                            <button onClick={() => handleAdminThreadAction(t, t.is_locked ? 'unlock' : 'lock')} style={{ background: '#111', border: '1px solid #222', color: '#ef4444', cursor: 'pointer', padding: '5px 7px', borderRadius: '6px', fontSize: '10px', fontWeight: '800' }}>{t.is_locked ? 'Unlock' : 'Lock'}</button>
                            <button onClick={() => setEditingThread(t)} style={{ background: '#111', border: '1px solid #222', color: '#60a5fa', cursor: 'pointer', padding: '5px 7px', borderRadius: '6px', fontSize: '10px', fontWeight: '800' }}>Edit</button>
                            <button onClick={() => handleAdminThreadAction(t, 'hide')} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', cursor: 'pointer', padding: '5px 7px', borderRadius: '6px', fontSize: '10px', fontWeight: '800' }}>Hide</button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {total > 20 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '40px' }}>
                  <button disabled={page <= 1} onClick={() => { setPage(p => p - 1); fetchThreads(currentCategory.id, sort, page - 1); }} className="forum-glass-btn" style={{ opacity: page <= 1 ? 0.3 : 1 }}>← Prev</button>
                  <span style={{ padding: '10px 16px', color: '#888', fontSize: '13px', fontWeight: '800' }}>{page} / {Math.ceil(total / 20)}</span>
                  <button disabled={page * 20 >= total} onClick={() => { setPage(p => p + 1); fetchThreads(currentCategory.id, sort, page + 1); }} className="forum-glass-btn" style={{ opacity: page * 20 >= total ? 0.3 : 1 }}>Next →</button>
                </div>
              )}
            </div>
          )}

          {/* ═══════════ SINGLE THREAD VIEW ═══════════ */}
          {view === 'thread' && currentThread && (
            <div className="forum-fade">
              {/* Thread Header / OP */}
              <div className="thread-header-card" style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '20px', padding: '32px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  {currentThread.is_pinned && <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: '800', background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}>📌 PINNED</span>}
                  {currentThread.is_locked && <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: '800', background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>🔒 LOCKED</span>}
                  <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: '700', background: `${currentCategory?.color || '#A8FF3E'}15`, color: currentCategory?.color || '#A8FF3E', border: `1px solid ${currentCategory?.color || '#A8FF3E'}30` }}><Hash size={10} style={{ marginRight: '3px', verticalAlign: 'middle' }} />{currentCategory?.name}</span>
                </div>
                <h1 className="thread-head-title" style={{ fontSize: '26px', fontWeight: '900', marginBottom: '16px', letterSpacing: '-0.5px', lineHeight: '1.3' }}>{currentThread.title}</h1>
                <div style={{ fontSize: '15px', color: '#bbb', lineHeight: '1.7', whiteSpace: 'pre-wrap', marginBottom: '24px' }}>{currentThread.body}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #1a1a1a', paddingTop: '16px', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '800', color: '#666' }}>{getUsername(currentThread.author)?.[0]?.toUpperCase()}</div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#ccc' }}>{getUsername(currentThread.author)}</span>
                        <RoleBadge author={currentThread.author} />
                      </div>
                      <span style={{ fontSize: '11px', color: '#444' }}>{timeAgo(currentThread.created_at)} · {currentThread.views || 0} views</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button onClick={() => handleUpvoteThread(currentThread.id)} className="forum-btn" style={{ background: '#111', color: '#888', border: '1px solid #222', padding: '8px 14px' }}><ChevronUp size={16} /> {currentThread.upvotes || 0}</button>
                    {isAdmin && (
                      <>
                        <button onClick={() => handleTogglePin(currentThread.id, currentThread.is_pinned)} className="forum-btn" style={{ background: currentThread.is_pinned ? 'rgba(245,158,11,0.15)' : '#111', color: currentThread.is_pinned ? '#f59e0b' : '#555', border: '1px solid #222', padding: '8px' }}><Pin size={16} /></button>
                        <button onClick={() => handleToggleLock(currentThread.id, currentThread.is_locked)} className="forum-btn" style={{ background: currentThread.is_locked ? 'rgba(239,68,68,0.15)' : '#111', color: currentThread.is_locked ? '#ef4444' : '#555', border: '1px solid #222', padding: '8px' }}><Lock size={16} /></button>
                        <button onClick={() => setEditingThread(currentThread)} className="forum-btn" style={{ background: '#111', color: '#60a5fa', border: '1px solid #222', padding: '8px 12px', fontSize: '11px' }}>Edit</button>
                        <button onClick={() => handleAdminThreadAction(currentThread, 'hide')} className="forum-btn" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', padding: '8px 12px', fontSize: '11px' }}>Hide</button>
                        <button onClick={() => handleDeleteThread(currentThread.id)} className="forum-btn" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', padding: '8px' }}><X size={16} /></button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Replies */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#555', letterSpacing: '1px', marginBottom: '16px' }}>{posts.length} REPLIES</h3>
                {loading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[1, 2, 3].map(i => <div key={i} style={{ height: '100px', background: '#0a0a0a', borderRadius: '14px' }} className="skeleton" />)}
                  </div>
                ) : posts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#333', fontSize: '14px' }}>No replies yet. Start the conversation!</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {(posts || []).map((p, i) => (
                      <div key={p.id} className="post-card" style={{ opacity: 0, animation: `forumFadeIn 0.3s ease-out ${i * 0.05}s forwards` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800', color: '#666' }}>{getUsername(p.author)?.[0]?.toUpperCase()}</div>
                            <span style={{ fontSize: '13px', fontWeight: '700', color: '#ccc' }}>{getUsername(p.author)}</span>
                            <RoleBadge author={p.author} />
                            <span style={{ fontSize: '11px', color: '#444' }}>{timeAgo(p.created_at)}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <button onClick={() => handleUpvotePost(p.id)} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '700' }}><ChevronUp size={14} /> {p.upvotes || 0}</button>
                            {isAdmin && <button onClick={() => setEditingPost(p)} style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', padding: '4px', fontSize: '11px', fontWeight: '800' }}>Edit</button>}
                            {isAdmin && <button onClick={async () => { const headers = await getHeaders(); await fetch(`${BACKEND}/api/forum/posts/${p.id}`, { method: 'DELETE', headers }); fetchThread(currentThread.id); }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}><X size={14} /></button>}
                          </div>
                        </div>
                        <div style={{ fontSize: '14px', color: '#bbb', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>{p.body}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reply Box */}
              {getCategoryAccess(currentCategory) === 'read-only' ? (
                <div style={{ textAlign: 'center', padding: '24px', background: 'linear-gradient(90deg, rgba(245,158,11,0.05), transparent)', borderLeft: '2px solid #f59e0b', borderRadius: '0 16px 16px 0', color: '#f59e0b', fontSize: '14px', fontWeight: '800' }}>
                  <Clock size={16} style={{ marginRight: '8px', verticalAlign: '-3px' }} />
                  Your Pro plan has expired. Please renew to post replies in the Pro Forum.
                </div>
              ) : !currentThread.is_locked ? (
                <div className="reply-box" style={{ background: 'linear-gradient(135deg, #0a0a0a, #050505)', borderTop: '2px solid rgba(168,255,62,0.2)', borderLeft: '1px solid rgba(255,255,255,0.05)', borderRight: '1px solid rgba(255,255,255,0.05)', borderRadius: '0 24px 0 24px', padding: '32px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: '900', color: '#888', letterSpacing: '2px', marginBottom: '16px', textTransform: 'uppercase' }}>Your Reply</h4>
                  <textarea className="forum-textarea" value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Write your reply..." style={{ borderRadius: '12px' }} />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                    <button onClick={handleReply} disabled={!replyText.trim() || replying} className="forum-btn" style={{ background: replyText.trim() ? '#A8FF3E' : '#222', color: replyText.trim() ? '#000' : '#555', cursor: replyText.trim() ? 'pointer' : 'not-allowed', padding: '12px 24px', fontWeight: '900' }}><Send size={16} /> {replying ? 'Posting...' : 'Post Reply'}</button>
                  </div>
                </div>
              ) : currentThread.is_locked ? (
                <div style={{ textAlign: 'center', padding: '24px', background: 'linear-gradient(90deg, rgba(239,68,68,0.05), transparent)', borderLeft: '2px solid #ef4444', borderRadius: '0 16px 16px 0', color: '#ef4444', fontSize: '14px', fontWeight: '800' }}><Lock size={16} style={{ marginRight: '8px', verticalAlign: '-3px' }} />This thread has been locked by a moderator.</div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '12px' }}>
                  <p style={{ color: '#555', fontSize: '13px', fontWeight: '700' }}>Sign in to join the conversation</p>
                </div>
              )}
            </div>
          )}

          {/* ═══════════ USER PROFILE VIEW ═══════════ */}
          {view === 'profile' && viewProfileData && (
            <div className="forum-fade" style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 0' }}>
              <div style={{ background: 'rgba(20,20,20,0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px', padding: '40px', backdropFilter: 'blur(20px)', position: 'relative', overflow: 'hidden', textAlign: 'center', marginBottom: '40px' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '120px', background: 'linear-gradient(to bottom, rgba(168,255,62,0.1), transparent)' }}></div>

                <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#1a1a1a', border: '2px solid rgba(168,255,62,0.3)', margin: '0 auto 20px', position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', fontWeight: '900', color: '#888' }}>
                  {viewProfileData.profile.username.charAt(0).toUpperCase()}
                </div>

                <h2 style={{ fontSize: '32px', fontWeight: '900', margin: '0 0 12px 0', position: 'relative', zIndex: 2 }}>{viewProfileData.profile.username}</h2>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '32px', position: 'relative', zIndex: 2 }}>
                  <RoleBadge author={viewProfileData.profile} />
                  <span style={{ background: 'rgba(255,180,0,0.1)', color: '#FFB400', border: '1px solid rgba(255,180,0,0.2)', padding: '4px 12px', borderRadius: '99px', fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Star size={12} /> {viewProfileData.profile.popularity} Reputation
                  </span>
                  <span style={{ background: 'rgba(255,255,255,0.05)', color: '#aaa', border: '1px solid rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: '99px', fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} /> Joined {timeAgo(viewProfileData.profile.created_at)}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', position: 'relative', zIndex: 2 }}>
                  <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.02)' }}>
                    <MessageSquare size={24} color="#555" style={{ margin: '0 auto 12px' }} />
                    <div style={{ fontSize: '24px', fontWeight: '900', color: '#fff' }}>{viewProfileData.profile.threadCount}</div>
                    <div style={{ fontSize: '12px', color: '#888', fontWeight: '700' }}>Threads Created</div>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.02)' }}>
                    <Send size={24} color="#555" style={{ margin: '0 auto 12px' }} />
                    <div style={{ fontSize: '24px', fontWeight: '900', color: '#fff' }}>{viewProfileData.profile.postCount}</div>
                    <div style={{ fontSize: '12px', color: '#888', fontWeight: '700' }}>Replies Posted</div>
                  </div>
                </div>
              </div>

              <h3 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '24px', paddingLeft: '12px', borderLeft: '4px solid #A8FF3E' }}>Recent Threads</h3>

              {(!viewProfileData.recentThreads || viewProfileData.recentThreads.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '40px', background: 'rgba(10,10,10,0.4)', borderRadius: '20px' }}>
                  <p style={{ color: '#555', fontWeight: '700' }}>No recent threads.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {(viewProfileData.recentThreads || []).map(t => (
                    <div key={t.id} onClick={() => openThread(t)} className="thread-row" style={{ padding: '20px' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: '16px', fontWeight: '800', margin: '0 0 8px 0' }}>{t.title}</h4>
                        <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#666', fontWeight: '600' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {timeAgo(t.created_at)}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#A8FF3E' }}><ChevronUp size={12} /> {t.upvotes || 0}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MessageSquare size={12} /> {t.reply_count || 0}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ═══════════ NEW THREAD MODAL ═══════════ */}
        {editingThread && (
          <div onClick={() => setEditingThread(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.86)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
            <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '680px', background: '#0d0d0d', border: '1px solid #222', borderRadius: '24px', padding: '32px', maxHeight: '90vh', overflow: 'auto' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '20px' }}>Edit Thread</h2>
              <input className="forum-input" value={editingThread.title || ''} onChange={e => setEditingThread({ ...editingThread, title: e.target.value })} placeholder="Thread title" style={{ marginBottom: '14px' }} />
              <textarea className="forum-textarea" value={editingThread.body || ''} onChange={e => setEditingThread({ ...editingThread, body: e.target.value })} placeholder="Thread body" style={{ minHeight: '180px', marginBottom: '14px' }} />
              <select value={editingThread.category_id || currentCategory?.id || ''} onChange={e => setEditingThread({ ...editingThread, category_id: e.target.value })} className="forum-input" style={{ marginBottom: '20px' }}>
                {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setEditingThread(null)} className="forum-btn" style={{ flex: 1, justifyContent: 'center', background: '#111', color: '#888', border: '1px solid #222' }}>Cancel</button>
                <button onClick={() => handleAdminThreadAction(editingThread, 'edit', { title: editingThread.title, body: editingThread.body, category_id: editingThread.category_id })} className="forum-btn" style={{ flex: 1, justifyContent: 'center', background: '#A8FF3E', color: '#000' }}>Save</button>
              </div>
            </div>
          </div>
        )}

        {editingPost && (
          <div onClick={() => setEditingPost(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.86)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
            <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '560px', background: '#0d0d0d', border: '1px solid #222', borderRadius: '24px', padding: '32px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '20px' }}>Edit Reply</h2>
              <textarea className="forum-textarea" value={editingPost.body || ''} onChange={e => setEditingPost({ ...editingPost, body: e.target.value })} style={{ minHeight: '180px', marginBottom: '20px' }} />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setEditingPost(null)} className="forum-btn" style={{ flex: 1, justifyContent: 'center', background: '#111', color: '#888', border: '1px solid #222' }}>Cancel</button>
                <button onClick={handleEditPost} className="forum-btn" style={{ flex: 1, justifyContent: 'center', background: '#A8FF3E', color: '#000' }}>Save</button>
              </div>
            </div>
          </div>
        )}

        {showNewThread && (
          <div onClick={() => setShowNewThread(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '20px' }}>
            <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '600px', background: '#0d0d0d', border: '1px solid #222', borderRadius: '24px', padding: '36px', maxHeight: '90vh', overflow: 'auto' }} className="forum-fade forum-modal-inner">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: '900' }}>Start a Discussion</h2>
                <button onClick={() => setShowNewThread(false)} style={{ background: '#111', border: '1px solid #222', borderRadius: '10px', padding: '8px', cursor: 'pointer', color: '#888' }}><X size={18} /></button>
              </div>

              {categories.length > 1 && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#555', marginBottom: '8px', letterSpacing: '0.5px' }}>CATEGORY</label>
                  <select value={newCatId} onChange={e => setNewCatId(e.target.value)} className="forum-input" style={{ cursor: 'pointer' }}>
                    {(categories || []).filter(c => getCategoryAccess(c) !== 'locked').map(c => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.name} {(c.role_required?.toUpperCase() === 'PRO') ? '(PRO)' : ''}
                      </option>
                    ))}
                  </select>
                  {(categories || []).some(c => getCategoryAccess(c) === 'locked' && c.role_required?.toUpperCase() === 'PRO') && (
                    <p style={{ marginTop: '8px', fontSize: '11px', color: '#f59e0b', fontWeight: '700' }}>
                      Some Pro categories are hidden because this account does not have active Pro access.
                    </p>
                  )}
                </div>
              )}

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#555', marginBottom: '8px', letterSpacing: '0.5px' }}>TITLE</label>
                <input className="forum-input" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="What's on your mind?" maxLength={200} />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#555', marginBottom: '8px', letterSpacing: '0.5px' }}>BODY</label>
                <textarea className="forum-textarea" value={newBody} onChange={e => setNewBody(e.target.value)} placeholder="Share your thoughts, questions, or ideas in detail..." style={{ minHeight: '150px' }} />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#555', marginBottom: '8px', letterSpacing: '0.5px' }}>TAGS <span style={{ color: '#333' }}>(optional, comma-separated)</span></label>
                <input className="forum-input" value={newTags} onChange={e => setNewTags(e.target.value)} placeholder="e.g. startup, feedback, question" />
              </div>

              <button onClick={handleCreateThread} disabled={!newTitle.trim() || !newBody.trim() || creating} className="forum-btn" style={{ width: '100%', justifyContent: 'center', background: (newTitle.trim() && newBody.trim()) ? '#A8FF3E' : '#222', color: (newTitle.trim() && newBody.trim()) ? '#000' : '#555', padding: '14px', fontSize: '15px' }}>
                {creating ? 'Creating...' : 'Post Discussion'}
              </button>
            </div>
          </div>
        )}

        {/* Mobile Floating Action Button for New Thread */}
          {(view === 'threads' || view === 'categories') && (
          <button
            onClick={() => {
              if (view === 'threads' && currentCategory) {
                setNewCatId(currentCategory.id);
              } else if (categories.length > 0) {
                setNewCatId(categories.filter(c => getCategoryAccess(c) !== 'locked')[0]?.id || '');
              }
              setShowNewThread(true);
            }}
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#A8FF3E',
              color: '#000',
              border: 'none',
              cursor: 'pointer',
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(168,255,62,0.4)',
              zIndex: 200,
              transition: 'all 0.3s'
            }}
            className="mobile-fab-btn"
          >
            <Plus size={24} strokeWidth={3} />
          </button>
        )}
        <style>{`
          @media (max-width: 768px) {
            .mobile-fab-btn { display: flex !important; }
          }
        `}</style>
      </div>
    </>
  );
};

export default ForumPage;

