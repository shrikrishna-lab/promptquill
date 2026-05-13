import React, { useState, useEffect } from 'react';
import { Copy, Share2, Users, TrendingUp, MessageCircle, X, Award, Zap, CalendarClock } from 'lucide-react';
import { supabase } from '../lib/supabase.mobile';
import FullPageLoadingScreen from '../components/FullPageLoadingScreen';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const ReferralPage = ({ session }) => {
  const [referralCode, setReferralCode] = useState('');
  const [referralLink, setReferralLink] = useState('');
  const [stats, setStats] = useState({ totalReferred: 0, creditsEarned: 0, pendingCredits: 0 });
  const [leaderboard, setLeaderboard] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [copied, setCopied] = useState(false);
  const [referralHistory, setReferralHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [claimLoading, setClaimLoading] = useState(null);

  // Time calculations
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const nextMonth = new Date(currentYear, currentMonth + 1, 1);
  const daysUntilReset = Math.ceil((nextMonth - now) / (1000 * 60 * 60 * 24));

  const monthlyReferrals = (referralHistory || []).filter(ref => {
    const refDate = new Date(ref.signup_at || ref.created_at || ref.referred_at);
    return refDate.getMonth() === currentMonth && refDate.getFullYear() === currentYear;
  });
  
  const monthlyCount = monthlyReferrals.length;

  useEffect(() => {
    if (session?.user) {
      fetchReferralData();
    }
  }, [session]);

  const fetchReferralData = async () => {
    try {
      // Fetch backend stats
      const statsRes = await fetch(`${BACKEND_URL}/api/referrals/my-stats`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      const statsData = await statsRes.json();

      if (statsData.code) {
        setReferralCode(statsData.code);
        setReferralLink(`${window.location.origin}/?ref=${statsData.code}`);
        setStats({
          totalReferred: statsData.total_referred || 0,
          creditsEarned: statsData.total_credits_earned || 0,
          pendingCredits: 0
        });
        setMilestones(statsData.milestones || []);
        
        // Set referral history (even if empty)
        setReferralHistory(statsData.referral_uses || []);
      }

      // Fetch leaderboard
      const leaderboardRes = await fetch(`${BACKEND_URL}/api/referrals/leaderboard?limit=10`);
      const leaderboardData = await leaderboardRes.json();
      setLeaderboard(Array.isArray(leaderboardData) ? leaderboardData : (leaderboardData.data || []));

      setLoading(false);
    } catch (err) {
      console.error('Error fetching referral data:', err);
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareVia = (platform) => {
    const link = `${import.meta.env.VITE_APP_URL || 'https://promptquill.com'}/?ref=${referralCode}`;
    const text = `🚀 Join me on Prompt Quill! Create amazing AI content with unlimited prompts. Sign up via my link to get 20 bonus credits: ${link}`;
    const encodedText = encodeURIComponent(text);
    
    switch(platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodedText}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodedText}`, '_blank');
        break;
      case 'email':
        window.open(`mailto:?subject=Join Prompt Quill&body=${encodedText}`, '_blank');
        break;
      default:
        break;
    }
  };

  const getMilestoneBonus = (level) => {
    const bonusMap = { 1: 100, 5: 300, 10: 700, 25: 2000, 50: 5000, 100: 12000 };
    return bonusMap[level] || 0;
  };

  const handleClaimMilestone = async (level) => {
    if (claimLoading) return;
    setClaimLoading(level);
    try {
      const res = await fetch(`${BACKEND_URL}/api/referrals/claim-milestone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ level })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        alert(`🎉 Successfully claimed ${data.bonus} credits!`);
        fetchReferralData(); // Refresh state
      } else {
        alert(`❌ Failed to claim: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      alert('Network error. Please try again.');
    } finally {
      setClaimLoading(null);
    }
  };

  const getMilestoneDetails = (level) => {
    const isClaimed = milestones.find(m => m.milestone_level === level);
    if (isClaimed) return { status: 'claimed', label: '✓ Claimed' };
    
    if (monthlyCount >= level) {
      // Find the Nth referral to check 15-day expiry
      const sortedThisMonth = [...monthlyReferrals].sort((a, b) => 
        new Date(a.signup_at || a.created_at || a.referred_at) - new Date(b.signup_at || b.created_at || b.referred_at)
      );
      const unlockDate = new Date(sortedThisMonth[level - 1].signup_at || sortedThisMonth[level - 1].created_at || sortedThisMonth[level - 1].referred_at);
      const diffDays = (new Date() - unlockDate) / (1000 * 60 * 60 * 24);
      
      if (diffDays > 15) {
        return { status: 'expired', label: 'Expired (15d limit)' };
      }
      return { status: 'unlocked', label: `Claim ${getMilestoneBonus(level)} Credits` };
    }
    
    return { status: 'locked', label: '🔒 Locked' };
  };

  if (loading) {
    return (
      <FullPageLoadingScreen
        title="Loading Your Referral Data"
        subtitle="Getting your stats and leaderboard position..."
        spinnerVariant="rings"
        messages={[
          "📊 Calculating referral stats",
          "🏆 Fetching leaderboard",
          "💰 Computing rewards"
        ]}
        icon="🎁"
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080808', color: '#fff', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '42px', fontWeight: '900', marginBottom: '12px', letterSpacing: '-1px' }}>
            ✨ Refer & Earn
          </h1>
          <p style={{ fontSize: '16px', color: '#888', maxWidth: '600px', margin: '0 auto' }}>
            Share Prompt Quill with friends and unlock exclusive rewards. Earn credits with every signup, first prompt, and pro upgrade.
          </p>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', borderBottom: '1px solid #222', justifyContent: 'center' }}>
          {['dashboard', 'leaderboard', 'rewards'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '12px 24px',
                background: activeTab === tab ? '#a3e635' : 'transparent',
                color: activeTab === tab ? '#000' : '#888',
                border: 'none',
                borderRadius: '8px 8px 0 0',
                fontWeight: '700',
                cursor: 'pointer',
                transition: '0.2s',
                textTransform: 'capitalize'
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = activeTab === tab ? '#000' : '#888'}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <>
            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '40px' }}>
              <div style={{ background: 'linear-gradient(135deg, #a3e635 0%, #84cc16 100%)', padding: '24px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <Users size={24} color="#000" />
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#000', textTransform: 'uppercase' }}>Referred (This Month)</span>
                </div>
                <div style={{ fontSize: '42px', fontWeight: '900', color: '#000' }}>
                  {monthlyCount}
                </div>
              </div>

              <div style={{ background: 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)', padding: '24px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <Zap size={24} color="#fff" />
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#fff', textTransform: 'uppercase' }}>Credits Earned</span>
                </div>
                <div style={{ fontSize: '42px', fontWeight: '900', color: '#fff' }}>
                  {stats.creditsEarned}
                </div>
              </div>

              <div style={{ background: 'rgba(163, 230, 53, 0.1)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(163, 230, 53, 0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <Award size={24} color="#facc15" />
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#888', textTransform: 'uppercase' }}>Milestones Earned</span>
                </div>
                <div style={{ fontSize: '42px', fontWeight: '900', color: '#a3e635' }}>
                  {milestones.length}
                </div>
              </div>
              
              <div style={{ background: '#111', padding: '24px', borderRadius: '12px', border: '1px solid #333' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <CalendarClock size={24} color="#ff6b6b" />
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#888', textTransform: 'uppercase' }}>Cycle Resets In</span>
                </div>
                <div style={{ fontSize: '42px', fontWeight: '900', color: '#ff6b6b' }}>
                  {daysUntilReset} <span style={{ fontSize: '16px', color: '#888', fontWeight: '600' }}>Days</span>
                </div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Referral credits expire after 30 days</div>
              </div>
            </div>

            {/* Referral Link Section */}
            <div style={{ background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '32px', marginBottom: '40px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px' }}>🔗 Your Referral Link</h2>
              
              {referralCode ? (
                <>
                  {/* Referral Code */}
                  <div style={{ marginBottom: '24px' }}>
                    <p style={{ fontSize: '12px', fontWeight: '700', color: '#888', textTransform: 'uppercase', marginBottom: '8px' }}>Your Code</p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        value={referralCode}
                        readOnly
                        style={{
                          flex: 1,
                          background: '#0d0d0d',
                          border: '1px solid #2a2a2a',
                          borderRadius: '8px',
                          padding: '12px 16px',
                          color: '#a3e635',
                          fontSize: '16px',
                          fontFamily: 'monospace',
                          fontWeight: '700',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>

                  {/* Full Link */}
                  <p style={{ fontSize: '12px', fontWeight: '700', color: '#888', textTransform: 'uppercase', marginBottom: '8px' }}>Full Link</p>
                </>
              ) : (
                <p style={{ color: '#ff6b6b', marginBottom: '24px' }}>Loading referral code...</p>
              )}
              
              <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                <input
                  type="text"
                  value={referralLink}
                  readOnly
                  style={{
                    flex: 1,
                    background: '#0d0d0d',
                    border: '1px solid #2a2a2a',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    color: '#a3e635',
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    outline: 'none'
                  }}
                />
                <button
                  onClick={copyToClipboard}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#a3e635',
                    color: '#000',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 20px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: '0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#ccff00'}
                  onMouseLeave={e => e.currentTarget.style.background = '#a3e635'}
                >
                  <Copy size={18} />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>

              <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px', color: '#888' }}>Share Via</h3>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => shareVia('twitter')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#1DA1F2',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 20px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  <X size={18} />
                  Twitter
                </button>
                <button
                  onClick={() => shareVia('whatsapp')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#25D366',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 20px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  <MessageCircle size={18} />
                  WhatsApp
                </button>
                <button
                  onClick={() => shareVia('email')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#EA4335',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 20px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  📧 Email
                </button>
              </div>
            </div>

            {/* Referral History */}
            {referralHistory && referralHistory.length > 0 ? (
              <div style={{ background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '32px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px' }}>📊 Recent Referrals</h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {(referralHistory || []).slice(0, 5).map(ref => (
                    <div key={ref.id} style={{ background: '#0d0d0d', padding: '16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '4px' }}>
                          {ref.signup_completed ? '✅ Signup Completed' : ref.first_prompt_generated ? '🎨 First Prompt' : ref.pro_upgraded ? '⭐ Pro Upgrade' : '👤 Referred'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {new Date(ref.referred_at || ref.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#a3e635', marginBottom: '4px' }}>
                          Code: {ref.referral_code}
                        </div>
                        <div style={{ fontSize: '12px', color: ref.signup_bonus_credited ? '#a3e635' : '#666' }}>
                          {ref.signup_bonus_credited ? '💰 Bonus Credited' : 'Pending Rewards'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              referralHistory && referralHistory.length === 0 && (
                <div style={{ background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '32px', textAlign: 'center', color: '#666' }}>
                  <p>No referrals yet. Start sharing your link to earn!</p>
                </div>
              )
            )}
          </>
        )}

        {/* LEADERBOARD TAB */}
        {activeTab === 'leaderboard' && (
          <div style={{ background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px' }}>🏆 Top Referrers</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(Array.isArray(leaderboard) && leaderboard.length > 0) ? (leaderboard || []).map((referrer, index) => {
                const medals = ['🥇', '🥈', '🥉'];
                const medal = index < 3 ? medals[index] : '#' + (index + 1);
                return (
                  <div key={referrer.user_id} style={{ background: '#0d0d0d', padding: '20px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ fontSize: '28px', fontWeight: '900', width: '40px' }}>
                        {medal}
                      </div>
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>
                          {referrer.name || 'User #' + referrer.user_id.slice(0, 8)}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          Code: {referrer.code}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '18px', fontWeight: '900', color: '#a3e635', marginBottom: '4px' }}>
                        {referrer.total_referred} people
                      </div>
                      <div style={{ fontSize: '12px', color: '#888' }}>
                        {referrer.total_credits_earned} credits earned
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  Leaderboard coming soon...
                </div>
              )}
            </div>
          </div>
        )}

        {/* REWARDS TAB */}
        {activeTab === 'rewards' && (
          <>
            {/* Reward Structure */}
            <div style={{ background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '32px', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px' }}>💰 Reward Structure</h2>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #222' }}>
                      <th style={{ padding: '12px', textAlign: 'left', color: '#888', fontWeight: '700', fontSize: '12px' }}>EVENT</th>
                      <th style={{ padding: '12px', textAlign: 'center', color: '#a3e635', fontWeight: '700', fontSize: '12px' }}>YOU GET</th>
                      <th style={{ padding: '12px', textAlign: 'center', color: '#a3e635', fontWeight: '700', fontSize: '12px' }}>FRIEND GETS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { event: 'Friend Signs Up', you: '+30', friend: '+20' },
                      { event: 'First Prompt Generated', you: '+10', friend: '+5' },
                      { event: 'Upgrades to Pro', you: '+50', friend: '+20' },
                      { event: 'Active 30 Days', you: '+20', friend: '+10' }
                    ].map((row, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #1a1a1a' }}>
                        <td style={{ padding: '12px', color: '#fff', fontWeight: '600' }}>{row.event}</td>
                        <td style={{ padding: '12px', textAlign: 'center', color: '#a3e635', fontWeight: '700' }}>{row.you}</td>
                        <td style={{ padding: '12px', textAlign: 'center', color: '#a3e635', fontWeight: '700' }}>{row.friend}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Milestones */}
            <div style={{ background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '32px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px' }}>🎯 Milestones</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                {[1, 5, 10, 25, 50, 100].map(level => {
                  const details = getMilestoneDetails(level);
                  const bonus = getMilestoneBonus(level);
                  
                  let bgColor = '#0d0d0d';
                  let borderColor = '#2a2a2a';
                  let titleColor = '#888';
                  
                  if (details.status === 'claimed') {
                    bgColor = 'rgba(163, 230, 53, 0.1)';
                    borderColor = 'rgba(163, 230, 53, 0.3)';
                    titleColor = '#a3e635';
                  } else if (details.status === 'unlocked') {
                    bgColor = 'linear-gradient(135deg, #a3e635 0%, #84cc16 100%)';
                    borderColor = 'transparent';
                    titleColor = '#000';
                  } else if (details.status === 'expired') {
                    bgColor = 'rgba(255, 107, 107, 0.1)';
                    borderColor = 'rgba(255, 107, 107, 0.3)';
                    titleColor = '#ff6b6b';
                  }
                  
                  return (
                    <div key={level} style={{
                      background: bgColor,
                      padding: '20px',
                      borderRadius: '12px',
                      border: `1px solid ${borderColor}`,
                      textAlign: 'center',
                      opacity: details.status === 'locked' ? 0.5 : 1,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}>
                      <div>
                        <div style={{ fontSize: '28px', fontWeight: '900', marginBottom: '8px', color: titleColor }}>
                          {level}
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: '700', color: details.status === 'unlocked' ? '#000' : '#666', marginBottom: '8px', textTransform: 'uppercase' }}>
                          Referrals
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: '800', color: details.status === 'unlocked' ? '#000' : '#666' }}>
                          +{bonus}
                        </div>
                      </div>
                      
                      <div style={{ marginTop: '16px' }}>
                        {details.status === 'unlocked' ? (
                          <button 
                            onClick={() => handleClaimMilestone(level)}
                            disabled={claimLoading === level}
                            style={{
                              width: '100%',
                              padding: '8px',
                              background: '#000',
                              color: '#a3e635',
                              border: 'none',
                              borderRadius: '6px',
                              fontWeight: 'bold',
                              cursor: claimLoading === level ? 'not-allowed' : 'pointer'
                            }}>
                            {claimLoading === level ? 'Claiming...' : details.label}
                          </button>
                        ) : (
                          <div style={{ fontSize: '12px', fontWeight: 'bold', color: titleColor }}>
                            {details.label}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default ReferralPage;
