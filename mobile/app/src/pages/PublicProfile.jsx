import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.mobile';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, GitBranch, ExternalLink, Globe, Zap, ChevronUp, Award } from 'lucide-react';
import PageLoadingSkeleton from '../components/PageLoadingSkeleton';
import { AchievementBadges } from '../components/AchievementBadges';
import { getUnlockedAchievements } from '../lib/achievements';

const PublicProfile = ({ session }) => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchProfile(); }, [username]);

  const fetchProfile = async () => {
    setLoading(true);
    const { data: prof } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('username', username)
      .maybeSingle();

    if (prof) {
      setProfile(prof);
      let query = supabase.from('sessions').select('*')
        .eq('user_id', prof.user_id)
        .eq('is_public', true)
        .eq('is_buried', false)
        .order('created_at', { ascending: false });

      if (filter !== 'all') query = query.eq('mode', filter.toUpperCase());
      const { data: sessionsData } = await query.limit(50);
      setIdeas(sessionsData || []);
    }
    setLoading(false);
  };

  useEffect(() => { if (profile) fetchProfile(); }, [filter]);

  const modeColors = { STARTUP: '#f97316', CODING: '#3b82f6', CONTENT: '#22c55e', GENERAL: '#6b7280' };

  // Calculate achievements for profile display
  const userStats = {
    totalPrompts: profile?.total_prompts || 0,
    bestScore: 10,
    modeCounts: { STARTUP: 1, CODING: 1, CONTENT: 1, GENERAL: 1 },
    publicIdeas: ideas.length,
    topUpvotes: profile?.max_upvotes || 0,
    totalUpvotes: profile?.total_upvotes || 0,
    creditsSpent: 0,
    streak: 0,
    referralCount: 0,
    joinedAt: profile?.joined_at
  };
  const unlockedAchievements = profile ? getUnlockedAchievements(userStats) : [];

  if (loading) return (
    <PageLoadingSkeleton variant="page" />
  );

  if (!profile) return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#080808', color: '#fff' }}>
      <h1 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '16px' }}>User not found</h1>
      <button onClick={() => navigate('/')} style={{ padding: '12px 24px', backgroundColor: '#111', border: '1px solid #222', borderRadius: '12px', color: '#fff', fontWeight: '700' }}>Go Home</button>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#080808', color: '#fff' }}>
      {/* Nav */}
      <div style={{ padding: '24px 40px', display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid #111' }}>
        <button onClick={() => navigate(-1)} style={{ color: '#888', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ArrowLeft size={20} /></button>
        <span style={{ fontSize: '14px', fontWeight: '700', color: '#555' }}>@{username}</span>
      </div>

      {/* Profile Header */}
      <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', marginBottom: '40px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#a3e635', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: '900', color: '#000', flexShrink: 0 }}>
            {profile.username?.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: '900' }}>@{profile.username}</h1>
              {profile.total_shipped > 0 && <span style={{ padding: '3px 10px', backgroundColor: 'rgba(109, 40, 217, 0.1)', border: '1px solid #6d28d9', borderRadius: '99px', fontSize: '10px', fontWeight: '800', color: '#a78bfa' }}>BUILDER</span>}
            </div>
            {profile.bio && <p style={{ color: '#888', fontSize: '14px', lineHeight: '1.6', marginBottom: '16px' }}>{profile.bio}</p>}
            <div style={{ display: 'flex', gap: '16px' }}>
              {profile.twitter && <a href={`https://twitter.com/${profile.twitter}`} target="_blank" rel="noreferrer" style={{ color: '#555', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}><ExternalLink size={14} /> @{profile.twitter}</a>}
              {profile.github && <a href={`https://github.com/${profile.github}`} target="_blank" rel="noreferrer" style={{ color: '#555', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}><GitBranch size={14} /> {profile.github}</a>}
              {profile.website && <a href={profile.website} target="_blank" rel="noreferrer" style={{ color: '#555', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}><Globe size={14} /> Website</a>}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '48px' }}>
          {[
            { label: 'PROMPTS', value: profile.total_prompts || 0 },
            { label: 'PUBLIC', value: ideas.length },
            { label: 'SHIPPED', value: profile.total_shipped || 0 },
            { label: 'JOINED', value: profile.joined_at ? new Date(profile.joined_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'N/A' },
          ].map((s, i) => (
            <div key={i} style={{ padding: '24px', backgroundColor: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '20px', textAlign: 'center', transition: '0.3s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#333'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#1a1a1a'}
            >
              <div style={{ fontSize: '24px', fontWeight: '900', marginBottom: '8px' }}>{s.value}</div>
              <div style={{ fontSize: '10px', fontWeight: '800', color: '#555', letterSpacing: '2px', textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Achievements Section */}
        {unlockedAchievements.length > 0 && (
          <div style={{ marginBottom: '48px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <Award size={24} color="#a3e635" />
              <h2 style={{ fontSize: '16px', fontWeight: '900' }}>Achievements ({unlockedAchievements.length})</h2>
            </div>
            <AchievementBadges
              achievements={unlockedAchievements}
              size="md"
              layout="grid"
              maxDisplay={12}
            />
          </div>
        )}

        {/* Filter */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {['all', 'startup', 'coding', 'content'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '8px 16px', borderRadius: '99px', fontSize: '12px', fontWeight: '700', backgroundColor: filter === f ? '#1a1a1a' : 'transparent', color: filter === f ? '#fff' : '#555', border: filter === f ? '1px solid #333' : '1px solid transparent', textTransform: 'capitalize' }}>
              {f}
            </button>
          ))}
        </div>

        {/* Ideas Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {ideas.map(idea => {
            const parsed = (() => { try { return JSON.parse(idea.final_prompt); } catch { return null; } })();
            return (
              <div key={idea.id} onClick={() => navigate(`/shared/${idea.id}`)} style={{ padding: '28px', backgroundColor: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '20px', cursor: 'pointer', transition: '0.2s', position: 'relative', overflow: 'hidden' }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = modeColors[idea.mode] || '#333';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#1a1a1a';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', paddingRight: '40px' }}>{idea.title}</h3>
                  {parsed?.score && (
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px', position: 'absolute', top: '28px', right: '28px' }}>
                      <span style={{ fontSize: '24px', fontWeight: '900', color: parsed.score >= 8 ? '#a3e635' : parsed.score >= 5 ? '#eab308' : '#ef4444' }}>{parsed.score}</span>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: '#555' }}>/10</span>
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', backgroundColor: `${modeColors[idea.mode] || '#6b7280'}1a`, color: modeColors[idea.mode] || '#888', border: `1px solid ${modeColors[idea.mode] || '#6b7280'}33` }}>{idea.mode}</span>
                  <span style={{ fontSize: '12px', color: '#555', fontWeight: '600' }}>{new Date(idea.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#666', fontWeight: '800' }}><ChevronUp size={14} color="#a3e635" /> {idea.upvotes || 0}</span>
                </div>
              </div>
            );
          })}
          {ideas.length === 0 && <p style={{ textAlign: 'center', color: '#333', padding: '40px' }}>No public ideas yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
