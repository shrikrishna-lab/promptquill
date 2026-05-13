import React, { useState, useEffect } from 'react';
import { ThumbsUp, Share2, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import FullPageLoadingScreen from '../components/FullPageLoadingScreen';

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000000';

const PromptBattle = () => {
  const [battles, setBattles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userVotes, setUserVotes] = useState({});
  const [notification, setNotification] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [battleTitle, setBattleTitle] = useState('');
  const [battleDescription, setBattleDescription] = useState('');
  const [promptA, setPromptA] = useState('');
  const [promptB, setPromptB] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBattles();
  }, []);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  };

  const fetchBattles = async () => {
    try {
      const { data, error } = await supabase
        .from('prompt_battles')
        .select(`
          id, title, description, prompt_a, prompt_b, 
          votes_a, votes_b, created_at, user_id
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching battles:', error);
        showNotification('❌ Failed to load battles');
        setBattles([]);
      } else {
        const battlesData = data || [];
        const battleIds = battlesData.map((b) => b.id);
        if (battleIds.length > 0) {
          const { data: votesData } = await supabase
            .from('prompt_battle_votes')
            .select('battle_id, vote')
            .in('battle_id', battleIds);
          const tally = {};
          (votesData || []).forEach((v) => {
            if (!tally[v.battle_id]) tally[v.battle_id] = { a: 0, b: 0 };
            if (v.vote === 'a') tally[v.battle_id].a += 1;
            if (v.vote === 'b') tally[v.battle_id].b += 1;
          });
          setBattles(battlesData.map((b) => ({
            ...b,
            votes_a: tally[b.id]?.a ?? b.votes_a ?? 0,
            votes_b: tally[b.id]?.b ?? b.votes_b ?? 0
          })));
        } else {
          setBattles(battlesData);
        }
      }
      setLoading(false);

      // Fetch user's votes
      const { data: votes, error: votesError } = await supabase
          .from('prompt_battle_votes')
          .select('battle_id, vote')
          .eq('voter_id', DEMO_USER_ID);

        if (!votesError && votes) {
          const voteMap = {};
          votes.forEach(v => {
            voteMap[v.battle_id] = v.vote;
          });
          setUserVotes(voteMap);
        }
    } catch (err) {
      console.error('Error in fetchBattles:', err);
      setBattles([]);
      setLoading(false);
    }
  };

  const handleCreateBattle = async () => {
    if (!promptA.trim() || !promptB.trim()) {
      showNotification('❌ Both prompts are required');
      return;
    }

    setCreateLoading(true);
    try {
      const { error } = await supabase
        .from('prompt_battles')
        .insert([{
          user_id: DEMO_USER_ID,
          title: battleTitle.trim(),
          description: battleDescription.trim(),
          prompt_a: promptA,
          prompt_b: promptB,
          votes_a: 0,
          votes_b: 0
        }]);

      if (error) {
        console.error('Error creating battle:', error);
        showNotification('❌ Failed to create battle');
        return;
      }

      showNotification('⚔️ Battle created! Let the voting begin!');
      setBattleTitle('');
      setBattleDescription('');
      setPromptA('');
      setPromptB('');
      setCreateModalOpen(false);
      fetchBattles();
    } catch (err) {
      console.error('Error creating battle:', err);
      showNotification('❌ Failed to create battle');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleVote = async (battleId, vote) => {

    try {
      // Check if user already voted
      const { data: existing, error: checkError } = await supabase
        .from('prompt_battle_votes')
        .select('id')
        .eq('battle_id', battleId)
        .eq('voter_id', DEMO_USER_ID)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing vote:', checkError);
        showNotification('❌ Failed to check vote');
        return;
      }

      if (existing) {
        // Update vote
        const { error: updateError } = await supabase
          .from('prompt_battle_votes')
          .update({ vote })
          .eq('id', existing.id)
          .eq('voter_id', DEMO_USER_ID);

        if (updateError) {
          console.error('Error updating vote:', updateError);
          showNotification('❌ Failed to change vote');
          return;
        }
        showNotification('✅ Vote changed!');
      } else {
        // Insert new vote
        const { error: insertError } = await supabase
          .from('prompt_battle_votes')
          .insert([{
            battle_id: battleId,
            voter_id: DEMO_USER_ID,
            vote
          }]);

        if (insertError) {
          console.error('Error inserting vote:', insertError);
          showNotification('❌ Failed to submit vote');
          return;
        }
        showNotification('⚔️ Vote submitted!');
      }

      setUserVotes({ ...userVotes, [battleId]: vote });
      fetchBattles(); // Refresh vote counts
    } catch (err) {
      console.error('Error voting:', err);
      showNotification('❌ Failed to vote');
    }
  };

  const handleShareBattle = async (battle) => {
    const url = `${window.location.origin}/prompt-battle#${battle.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: battle.title || 'Prompt Battle', text: battle.description || 'Vote this battle on PromptQuill', url });
        return;
      } catch {
        // fallback
      }
    }
    await navigator.clipboard.writeText(url);
    showNotification('🔗 Battle link copied');
  };

  if (loading) {
    return (
      <FullPageLoadingScreen
        title="Loading Battles"
        subtitle="Epic prompt matchups loading..."
        spinnerVariant="dots"
        messages={[
          "⚔️  Fetching battles",
          "🗳️  Loading votes",
          "⚡ Get ready to vote!"
        ]}
        icon="⚔️"
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff' }}>
      {/* Notification Toast */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          backgroundColor: '#059669',
          color: '#fff',
          padding: '16px 24px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <CheckCircle size={20} />
          <span style={{ fontWeight: '600' }}>{notification}</span>
        </div>
      )}
        <div style={{ padding: '48px 24px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <h1 style={{ fontSize: '48px', fontWeight: '900', marginBottom: '12px', letterSpacing: '-2px' }}>
                ⚔️ <span style={{ color: '#ef4444' }}>Prompt</span> Battle
              </h1>
              <p style={{ fontSize: '16px', color: '#888', maxWidth: '600px', margin: '0 auto' }}>
                Vote on competing prompts, discover brilliant ideas, and help the community find the best solutions.
              </p>
            </div>

            {/* Create Battle Button */}
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <button onClick={() => setCreateModalOpen(true)} style={{ 
                padding: '14px 32px', 
                backgroundColor: '#a3e635', 
                color: '#000', 
                border: 'none', 
                borderRadius: '12px', 
                fontWeight: '800',
                fontSize: '14px', 
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#b8f635';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#a3e635';
                e.target.style.transform = 'translateY(0)';
              }}
              >
                ⚔️ Create Battle
              </button>
            </div>

            {battles.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '120px 20px' }}>
                <div style={{ fontSize: '64px', marginBottom: '24px' }}>⚔️</div>
                <p style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>No Battles Yet</p>
                <p style={{ fontSize: '14px', color: '#888', marginBottom: '32px' }}>
                  Be the first to create a prompt battle!
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {battles.map(battle => {
                  const totalVotes = (battle.votes_a || 0) + (battle.votes_b || 0);
                  const percentA = totalVotes > 0 ? ((battle.votes_a || 0) / totalVotes) * 100 : 50;
                  const userVote = userVotes[battle.id];

                  return (
                    <div key={battle.id} style={{
                      background: 'linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      borderRadius: '16px',
                      padding: '32px',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                      e.currentTarget.style.boxShadow = '0 0 20px rgba(239, 68, 68, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    >
                      {/* Battle Header */}
                      <div style={{ marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '12px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                          <span>{battle.title || 'Untitled Battle'}</span>
                          <button onClick={() => handleShareBattle(battle)} style={{ background: 'none', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#888', cursor: 'pointer', padding: '6px 10px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700 }}>
                            <Share2 size={14} /> Share
                          </button>
                        </h2>
                        <p style={{ fontSize: '14px', color: '#888', lineHeight: '1.6' }}>
                          {battle.description}
                        </p>
                      </div>

                      {/* Battle Options */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
                        {/* Option A */}
                        <div
                          onClick={() => handleVote(battle.id, 'a')}
                          style={{
                            background: userVote === 'a' 
                              ? 'linear-gradient(135deg, #a3e635, #b8f635)' 
                              : 'rgba(163, 230, 53, 0.05)',
                            border: '2px solid ' + (userVote === 'a' 
                              ? '#a3e635' 
                              : 'rgba(163, 230, 53, 0.2)'),
                            borderRadius: '16px',
                            padding: '24px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            color: userVote === 'a' ? '#000' : '#fff'
                          }}
                          onMouseEnter={(e) => {
                            if (userVote !== 'a') {
                              e.currentTarget.style.background = 'rgba(163, 230, 53, 0.1)';
                              e.currentTarget.style.borderColor = 'rgba(163, 230, 53, 0.4)';
                              e.currentTarget.style.transform = 'translateY(-4px)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (userVote !== 'a') {
                              e.currentTarget.style.background = 'rgba(163, 230, 53, 0.05)';
                              e.currentTarget.style.borderColor = 'rgba(163, 230, 53, 0.2)';
                              e.currentTarget.style.transform = 'translateY(0)';
                            }
                          }}
                        >
                          <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '16px', opacity: 0.7 }}>
                            ⚡ Option A
                          </div>
                          <p style={{ fontSize: '15px', lineHeight: '1.6', marginBottom: '20px', fontWeight: '500' }}>
                            {battle.prompt_a}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ fontSize: '20px', fontWeight: '900' }}>
                              {battle.votes_a || 0} votes
                            </div>
                            <ThumbsUp size={22} fill={userVote === 'a' ? 'currentColor' : 'none'} />
                          </div>
                        </div>

                        {/* Option B */}
                        <div
                          onClick={() => handleVote(battle.id, 'b')}
                          style={{
                            background: userVote === 'b' 
                              ? 'linear-gradient(135deg, #ef4444, #ff5555)' 
                              : 'rgba(239, 68, 68, 0.05)',
                            border: '2px solid ' + (userVote === 'b' 
                              ? '#ef4444' 
                              : 'rgba(239, 68, 68, 0.2)'),
                            borderRadius: '16px',
                            padding: '24px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            color: userVote === 'b' ? '#fff' : '#fff'
                          }}
                          onMouseEnter={(e) => {
                            if (userVote !== 'b') {
                              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
                              e.currentTarget.style.transform = 'translateY(-4px)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (userVote !== 'b') {
                              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)';
                              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
                              e.currentTarget.style.transform = 'translateY(0)';
                            }
                          }}
                        >
                          <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '16px', opacity: 0.7 }}>
                            🔥 Option B
                          </div>
                          <p style={{ fontSize: '15px', lineHeight: '1.6', marginBottom: '20px', fontWeight: '500' }}>
                            {battle.prompt_b}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ fontSize: '20px', fontWeight: '900' }}>
                              {battle.votes_b || 0} votes
                            </div>
                            <ThumbsUp size={22} fill={userVote === 'b' ? 'currentColor' : 'none'} />
                          </div>
                        </div>
                      </div>

                      {/* Vote Progress Bar */}
                      {totalVotes > 0 && (
                        <div>
                          <div style={{ display: 'flex', height: '10px', borderRadius: '8px', overflow: 'hidden', background: '#222', marginBottom: '16px' }}>
                            <div style={{
                              width: percentA + '%',
                              background: '#a3e635',
                              transition: 'width 0.4s ease'
                            }} />
                            <div style={{
                              width: (100 - percentA) + '%',
                              background: '#ef4444',
                              transition: 'width 0.4s ease'
                            }} />
                          </div>
                          <div style={{ fontSize: '13px', color: '#888', textAlign: 'center', fontWeight: '600' }}>
                            {totalVotes} votes • {Math.round(percentA)}% vs {Math.round(100 - percentA)}%
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      {/* Create Battle Modal */}
      {createModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)',
            border: '1px solid rgba(163, 230, 53, 0.2)',
            borderRadius: '20px',
            padding: '40px',
            maxWidth: '500px',
            width: '90%',
            animation: 'popIn 0.3s ease-out'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#fff', margin: 0 }}>
                ⚔️ Create Battle
              </h2>
              <button onClick={() => setCreateModalOpen(false)} style={{
                background: 'none',
                border: 'none',
                color: '#888',
                cursor: 'pointer',
                fontSize: '28px',
                padding: 0,
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                ✕
              </button>
            </div>

            <p style={{ color: '#888', fontSize: '14px', marginBottom: '32px', margin: '0 0 32px 0' }}>
              Create a prompt battle with two competing options. Community members will vote on their favorite!
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Prompt A */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#fff', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Battle Title
                </label>
                <input
                  value={battleTitle}
                  onChange={(e) => setBattleTitle(e.target.value)}
                  placeholder="e.g., Best onboarding prompt for SaaS app"
                  style={{ width: '100%', padding: '12px', background: '#111', border: '1px solid #222', borderRadius: '12px', color: '#fff', fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#aaa', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Description (optional)
                </label>
                <textarea
                  value={battleDescription}
                  onChange={(e) => setBattleDescription(e.target.value)}
                  placeholder="Give voters context..."
                  rows={2}
                  style={{ width: '100%', padding: '12px', background: '#111', border: '1px solid #222', borderRadius: '12px', color: '#fff', fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>
              {/* Prompt A */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#a3e635', marginBottom: '8px', textTransform: 'uppercase' }}>
                  ⚡ Option A (Prompt)
                </label>
                <textarea 
                  value={promptA}
                  onChange={(e) => setPromptA(e.target.value)}
                  placeholder="Enter the first prompt..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(163, 230, 53, 0.05)',
                    border: '1px solid rgba(163, 230, 53, 0.2)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                    minHeight: '100px',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Prompt B */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#ef4444', marginBottom: '8px', textTransform: 'uppercase' }}>
                  🔥 Option B (Prompt)
                </label>
                <textarea 
                  value={promptB}
                  onChange={(e) => setPromptB(e.target.value)}
                  placeholder="Enter the second prompt..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(239, 68, 68, 0.05)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                    minHeight: '100px',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '24px' }}>
                <button onClick={() => setCreateModalOpen(false)} style={{
                  padding: '12px 24px',
                  backgroundColor: '#222',
                  color: '#fff',
                  border: '1px solid #333',
                  borderRadius: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#333';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#222';
                }}
                >
                  Cancel
                </button>
                <button onClick={handleCreateBattle} disabled={createLoading || !battleTitle.trim() || !promptA.trim() || !promptB.trim()} style={{
                  padding: '12px 24px',
                  backgroundColor: (createLoading || !battleTitle.trim() || !promptA.trim() || !promptB.trim()) ? '#888' : '#a3e635',
                  color: '#000',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: '700',
                  cursor: (createLoading || !battleTitle.trim() || !promptA.trim() || !promptB.trim()) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!createLoading) {
                    e.target.style.backgroundColor = '#b8f635';
                    e.target.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!createLoading) {
                    e.target.style.backgroundColor = '#a3e635';
                    e.target.style.transform = 'translateY(0)';
                  }
                }}
                >
                  {createLoading ? '⏳ Creating...' : '⚔️ Create Battle'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes popIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default PromptBattle;
