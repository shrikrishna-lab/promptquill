import React, { useState, useEffect } from 'react';
import { TrendingUp, Zap, Users, Trophy, Calendar, Flame, Star, Award, Target } from 'lucide-react';
import { supabase } from '../lib/supabase.mobile';
import { useNavigate } from 'react-router-dom';
import PageLoadingSkeleton from '../components/PageLoadingSkeleton';
import { AchievementShowcase } from '../components/AchievementBadges';
import { getUnlockedAchievements, getNextAchievement, ACHIEVEMENTS } from '../lib/achievements';

const ScoreCardPage = ({ session }) => {
  const [scoreData, setScoreData] = useState({
    totalPrompts: 0,
    totalCreditsSpent: 0,
    totalCreditsEarned: 0,
    streak: 0,
    level: 1,
    experiencePoints: 0,
    favoriteCategory: '',
    accuracy: 0,
    referralCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (session?.user) {
      fetchScoreData();
    } else {
      setLoading(false);
    }
  }, [session]);

  const fetchScoreData = async () => {
    try {
      // Get prompt generation stats through sessions (versions have session_id, not user_id)
      const { data: sessions, error: sessionsError } = await supabase
        .from('sessions')
        .select('id, prompt_versions(id, version_number, score)')
        .eq('user_id', session.user.id);

      let totalPrompts = 0;
      if (sessionsError) {
        console.error('Error fetching sessions:', sessionsError);
      } else if (sessions?.length > 0) {
        // Count total versions across all sessions
        totalPrompts = sessions.reduce((sum, s) => sum + (s.prompt_versions?.length || 0), 0);
      }

      // Get user credits
      const { data: credits, error: creditsError } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (creditsError) {
        console.error('Error fetching credits:', creditsError);
      }

      // Get referral stats
      const { data: referrals, error: referralsError } = await supabase
        .from('referrals')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (referralsError) {
        console.error('Error fetching referrals:', referralsError);
      }

      // Calculate level based on prompts
      const level = Math.floor((totalPrompts || 0) / 10) + 1;
      const streak = calculateStreak(sessions || []);

      setScoreData({
        totalPrompts: totalPrompts || 0,
        totalCreditsSpent: credits?.total_spent || 0,
        totalCreditsEarned: credits?.total_earned || 0,
        streak,
        level,
        experiencePoints: (totalPrompts || 0) * 10,
        favoriteCategory: 'Marketing', // Can be enhanced
        accuracy: 85, // Placeholder
        referralCount: referrals?.total_referred || 0
      });

      // Calculate achievements using comprehensive system
      const userStats = {
        totalPrompts: totalPrompts || 0,
        bestScore: 10,
        modeCounts: { STARTUP: 1, CODING: 1, CONTENT: 1, GENERAL: 1 },
        publicIdeas: 0,
        topUpvotes: 0,
        totalUpvotes: 0,
        creditsSpent: credits?.total_spent || 0,
        streak,
        referralCount: referrals?.total_referred || 0,
        joinedAt: new Date().toISOString()
      };
      const unlockedAchs = getUnlockedAchievements(userStats);
      setAchievements(unlockedAchs);

      setLoading(false);
    } catch (err) {
      console.error('Error fetching score data:', err);
      setLoading(false);
    }
  };

  const calculateStreak = (sessions) => {
    if (!sessions || sessions.length === 0) return 0;
    
    // Flatten sessions to get all creation dates
    const sessionDates = sessions
      .map(s => ({ created_at: s.created_at }))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    if (sessionDates.length === 0) return 0;
    
    let streak = 0;
    for (let i = 0; i < sessionDates.length; i++) {
      const sessionDate = new Date(sessionDates[i].created_at).toDateString();
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - i);
      
      if (sessionDate !== expectedDate.toDateString()) {
        break;
      }
      streak++;
    }
    
    return streak;
  };

  if (loading) {
    return <PageLoadingSkeleton variant="page" />;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', paddingBottom: '120px' }}>
      {!session?.user ? (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '80px', marginBottom: '24px' }}>🏆</div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '12px' }}>Score Card</h1>
            <p style={{ color: '#888', fontSize: '14px', marginBottom: '32px', maxWidth: '300px', margin: '0 auto 32px' }}>
              Sign in to view your PromptQuill achievements and stats.
            </p>
            <button onClick={() => navigate('/')} style={{ padding: '14px 32px', backgroundColor: '#a3e635', color: '#000', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' }}>
              Sign In
            </button>
          </div>
        </div>
      ) : (
        <div style={{ padding: '48px 24px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <h1 style={{ fontSize: '48px', fontWeight: '900', marginBottom: '12px', letterSpacing: '-2px' }}>
                🏆 <span style={{ color: '#facc15' }}>Score</span> Card
              </h1>
              <p style={{ fontSize: '16px', color: '#888', maxWidth: '600px', margin: '0 auto' }}>
                Your creative journey and achievements at a glance
              </p>
            </div>

            {/* Level & XP Section - Premium Card */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(163, 230, 53, 0.15) 0%, rgba(250, 204, 21, 0.1) 100%)',
              border: '2px solid rgba(163, 230, 53, 0.3)',
              borderRadius: '20px',
              padding: '40px',
              marginBottom: '40px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Background glow */}
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at top right, rgba(163, 230, 53, 0.1), transparent)', pointerEvents: 'none' }} />
              
              <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '32px', marginBottom: '32px' }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: '800', color: '#a3e635', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>
                      🎯 Level
                    </div>
                    <div style={{ fontSize: '56px', fontWeight: '900', color: '#fff' }}>
                      {scoreData.level}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: '800', color: '#facc15', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>
                      ⭐ Experience Points
                    </div>
                    <div style={{ fontSize: '48px', fontWeight: '900', color: '#facc15' }}>
                      {scoreData.experiencePoints}
                    </div>
                    <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>XP</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: '800', color: '#a3e635', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>
                      📈 Progress
                    </div>
                    <div style={{ fontSize: '36px', fontWeight: '900', color: '#fff' }}>
                      {Math.floor((scoreData.experiencePoints % 100) / 100 * 100)}%
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div style={{ height: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(163, 230, 53, 0.2)' }}>
                    <div style={{
                      height: '100%',
                      width: Math.floor((scoreData.experiencePoints % 100) / 100 * 100) + '%',
                      background: 'linear-gradient(90deg, #a3e635, #facc15)',
                      transition: 'width 0.4s ease'
                    }} />
                  </div>
                  <div style={{ fontSize: '11px', color: '#888', marginTop: '8px', textAlign: 'right' }}>
                    Next Level: {100 - Math.floor((scoreData.experiencePoints % 100) / 100 * 100)}% remaining
                  </div>
                </div>
              </div>
            </div>

            {/* Main Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '40px' }}>
              
              {/* Prompts Created */}
              <div style={{
                background: 'linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)',
                border: '1px solid rgba(163, 230, 53, 0.2)',
                borderRadius: '16px',
                padding: '28px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(163, 230, 53, 0.5)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(163, 230, 53, 0.15)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(163, 230, 53, 0.2)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '800', color: '#a3e635', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    💡 Prompts
                  </span>
                  <Zap size={20} color="#a3e635" />
                </div>
                <div style={{ fontSize: '42px', fontWeight: '900', color: '#fff', marginBottom: '8px' }}>
                  {scoreData.totalPrompts}
                </div>
                <div style={{ fontSize: '12px', color: '#888' }}>
                  Total created
                </div>
              </div>

              {/* Streak */}
              <div style={{
                background: 'linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)',
                border: '1px solid rgba(255, 107, 107, 0.2)',
                borderRadius: '16px',
                padding: '28px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 107, 107, 0.5)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 107, 107, 0.15)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 107, 107, 0.2)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '800', color: '#ff6b6b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    🔥 Streak
                  </span>
                  <Flame size={20} color="#ff6b6b" />
                </div>
                <div style={{ fontSize: '42px', fontWeight: '900', color: '#fff', marginBottom: '8px' }}>
                  {scoreData.streak}
                </div>
                <div style={{ fontSize: '12px', color: '#888' }}>
                  Days in a row
                </div>
              </div>

              {/* Credits Earned */}
              <div style={{
                background: 'linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                borderRadius: '16px',
                padding: '28px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(99, 102, 241, 0.15)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.2)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '800', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    💰 Earned
                  </span>
                  <TrendingUp size={20} color="#6366f1" />
                </div>
                <div style={{ fontSize: '42px', fontWeight: '900', color: '#fff', marginBottom: '8px' }}>
                  {scoreData.totalCreditsEarned}
                </div>
                <div style={{ fontSize: '12px', color: '#888' }}>
                  Credits earned
                </div>
              </div>

              {/* Referrals */}
              <div style={{
                background: 'linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)',
                border: '1px solid rgba(29, 161, 242, 0.2)',
                borderRadius: '16px',
                padding: '28px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(29, 161, 242, 0.5)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(29, 161, 242, 0.15)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(29, 161, 242, 0.2)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '800', color: '#1da1f2', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    👥 Referrals
                  </span>
                  <Users size={20} color="#1da1f2" />
                </div>
                <div style={{ fontSize: '42px', fontWeight: '900', color: '#fff', marginBottom: '8px' }}>
                  {scoreData.referralCount}
                </div>
                <div style={{ fontSize: '12px', color: '#888' }}>
                  Total referred
                </div>
              </div>

              {/* Spent */}
              <div style={{
                background: 'linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)',
                border: '1px solid rgba(37, 211, 102, 0.2)',
                borderRadius: '16px',
                padding: '28px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(37, 211, 102, 0.5)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(37, 211, 102, 0.15)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(37, 211, 102, 0.2)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '800', color: '#25d366', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    📊 Spent
                  </span>
                  <Calendar size={20} color="#25d366" />
                </div>
                <div style={{ fontSize: '42px', fontWeight: '900', color: '#fff', marginBottom: '8px' }}>
                  {scoreData.totalCreditsSpent}
                </div>
                <div style={{ fontSize: '12px', color: '#888' }}>
                  Credits used
                </div>
              </div>

              {/* Achievements */}
              <div style={{
                background: 'linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)',
                border: '1px solid rgba(250, 204, 21, 0.2)',
                borderRadius: '16px',
                padding: '28px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(250, 204, 21, 0.5)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(250, 204, 21, 0.15)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(250, 204, 21, 0.2)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '800', color: '#facc15', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    🏆 Achs
                  </span>
                  <Trophy size={20} color="#facc15" />
                </div>
                <div style={{ fontSize: '42px', fontWeight: '900', color: '#fff', marginBottom: '8px' }}>
                  {achievements.filter(a => a.unlocked).length}/{achievements.length}
                </div>
                <div style={{ fontSize: '12px', color: '#888' }}>
                  Unlocked
                </div>
              </div>
            </div>

            {/* Achievements Section */}
            <div style={{
              background: 'linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)',
              border: '1px solid rgba(250, 204, 21, 0.2)',
              borderRadius: '20px',
              padding: '40px'
            }}>
              <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span>🏆 Achievements</span>
                <span style={{ fontSize: '18px', color: '#facc15' }}>({achievements.length}/{Object.keys(ACHIEVEMENTS).length})</span>
              </h2>

              <AchievementShowcase 
                achievements={achievements}
                totalAchievements={Object.keys(ACHIEVEMENTS).length}
                nextAchievement={getNextAchievement({
                  totalPrompts: scoreData.totalPrompts,
                  bestScore: 10,
                  modeCounts: { STARTUP: 1, CODING: 1, CONTENT: 1, GENERAL: 1 },
                  publicIdeas: 0,
                  topUpvotes: 0,
                  totalUpvotes: 0,
                  creditsSpent: scoreData.totalCreditsSpent,
                  streak: scoreData.streak,
                  referralCount: scoreData.referralCount,
                  joinedAt: new Date().toISOString(),
                  unlockedCount: achievements.length
                })}
              />
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ScoreCardPage;
