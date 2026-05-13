import React, { useState, useEffect } from 'react';
import { Sparkles, Loader, AlertCircle, Crown, Gift, TrendingUp, Clock } from 'lucide-react';
import { getCredits } from '../lib/credits';
import { getReferralCode, copyReferralLink } from '../lib/referral';


const GenerationForm = ({ onGenerate, loading, session, onCreditsInsufficient, credits: propsCredits }) => {
  const [formData, setFormData] = useState({
    idea: '',
    category: 'e-commerce',
    mode: 'GENERAL',
  });
  const [error, setError] = useState(null);
  const [credits, setCredits] = useState(propsCredits ? { ...propsCredits } : null);
  const [isPro, setIsPro] = useState(false);
  const [referralCode, setReferralCode] = useState(null);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [nextReset, setNextReset] = useState(null);
  const [showTopUpModal, setShowTopUpModal] = useState(false);

  // Sync with props credits if provided
  useEffect(() => {
    if (propsCredits) {
      setCredits({ ...propsCredits });
    }
  }, [propsCredits]);

  useEffect(() => {
    if (session?.user?.id && !propsCredits) {
      loadCredits();
      loadReferralCode();
      loadProStatus();
    }
  }, [session, propsCredits]);

  const loadCredits = async () => {
    try {
      const userCredits = await getCredits(session.user.id);
      console.log('✓ Credits loaded:', userCredits);
      setCredits(userCredits);
    } catch (err) {
      console.error('Error loading credits:', err);
      // Fallback
      setCredits({ balance: 100, lastReset: new Date().toISOString() });
    }
  };

  const loadReferralCode = async () => {
    const code = await getReferralCode(session.user.id);
    if (code) setReferralCode(code.code);
  };

  const loadProStatus = async () => {
    // Get pro status from profile
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    try {
      const res = await fetch(`${backendUrl}/api/profile`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setIsPro(data?.is_pro || false);
      }
    } catch (err) {
      console.error('Error loading pro status:', err);
      setIsPro(false);
    }
  };

  // If current mode is Pro-only and user is no longer Pro, switch to GENERAL
  useEffect(() => {
    if (formData.mode === 'STARTUP' && !isPro) {
      setFormData(prev => ({ ...prev, mode: 'GENERAL' }));
    }
  }, [isPro]);

  // Calculate next reset time
  useEffect(() => {
    if (!credits?.lastReset) {
      console.log('📝 No lastReset value, skipping countdown setup:', { credits });
      setNextReset(null);
      return;
    }

    console.log('🔄 Setting up countdown with credits:', credits);

    const calculateNextReset = () => {
      try {
        const lastReset = new Date(credits.lastReset);
        const nextResetTime = new Date(lastReset.getTime() + 24 * 60 * 60 * 1000);
        const now = new Date();
        const diffMs = nextResetTime - now;
        
        console.log('⏱️ Countdown calc:', { lastReset: credits.lastReset, nextResetTime, now: now.toISOString(), diffMs, hours: Math.floor(diffMs / (1000 * 60 * 60)) });
        
        if (diffMs <= 0) {
          // Reset has happened, reload credits and clear timer
          setNextReset(null);
          loadCredits();
          return;
        }

        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
        
        console.log('✅ Countdown updated:', { hours, minutes, seconds });
        setNextReset({ hours, minutes, seconds, raw: diffMs });
      } catch (err) {
        console.error('Error calculating next reset:', err);
        setNextReset(null);
      }
    };

    calculateNextReset();
    const interval = setInterval(calculateNextReset, 1000);
    return () => clearInterval(interval);
  }, [credits?.lastReset]);

  const categories = [
    { id: 'e-commerce', label: '🛒 E-Commerce', desc: 'Online stores, marketplaces' },
    { id: 'saas', label: '📊 SaaS', desc: 'Software services, subscriptions' },
    { id: 'mobile', label: '📱 Mobile', desc: 'Mobile apps, native apps' },
    { id: 'general', label: '⚡ General', desc: 'Any other idea' },
  ];

  const allModes = [
    { id: 'STARTUP', label: '🔒 Startup PRO', desc: 'Deep startup analysis: 10 sections, 25 credits', isPro: true, credits: 25 },
    { id: 'STARTUP_LITE', label: '✨ Startup Lite', desc: 'Preview: Executive summary + problem + revenue, 10 credits', credits: 10 },
    { id: 'CODING', label: '💻 Coding', desc: 'Tech stack, architecture' },
    { id: 'CONTENT', label: '📝 Content', desc: 'Marketing, positioning' },
    { id: 'GENERAL', label: '⚡ General', desc: 'Balanced analysis' },
  ];

  // Filter modes: hide STARTUP for non-Pro users
  const modes = allModes.filter(m => {
    if (m.isPro && !isPro) return false; // Hide Pro modes from non-Pro users
    return true;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.idea.trim()) {
      setError('Please describe your idea');
      return;
    }

    if (formData.idea.trim().length < 10) {
      setError('Please provide at least 10 characters');
      return;
    }

    if (!credits || credits.balance <= 0) {
      onCreditsInsufficient?.(isPro, credits?.balance || 0);
      return;
    }

    onGenerate({
      idea: formData.idea,
      category: formData.category,
      mode: formData.mode,
    });
  };

  const handleCopyReferral = async () => {
    if (referralCode) {
      const result = await copyReferralLink(referralCode);
      if (result.success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  if (!credits) {
    return (
      <div style={{
        width: '100%',
        maxWidth: '900px',
        margin: '0 auto',
        padding: '32px',
        textAlign: 'center',
        color: '#888',
      }}>
        <Loader size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} />
        <p style={{ marginTop: '16px' }}>Loading form...</p>
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      maxWidth: '900px',
      margin: '0 auto',
      backgroundColor: '#111111',
      border: '1px solid #222222',
      borderRadius: '12px',
      padding: '32px',
      color: '#fff',
    }}>
      
      {/* Credits Status Bar */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
        padding: '16px',
        backgroundColor: '#080808',
        borderRadius: '8px',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
          <TrendingUp size={20} style={{ color: '#a3e635' }} />
          <div>
            <div style={{ fontSize: '12px', color: '#666' }}>Credits Available</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#a3e635' }}>
              {credits.balance}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isPro ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#6d28d9' }}>
              <Crown size={18} />
              <span style={{ fontSize: '13px', fontWeight: '600' }}>Pro Plan</span>
            </div>
          ) : (
            <button
              onClick={() => window.location.href = '/pricing'}
              style={{
                padding: '8px 16px',
                backgroundColor: '#6d28d9',
                border: 'none',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: '0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7c3aed'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6d28d9'}
            >
              Upgrade to Pro
            </button>
          )}
        </div>

        <button
          onClick={() => setShowReferralModal(true)}
          style={{
            padding: '8px 16px',
            backgroundColor: 'rgba(163, 230, 53, 0.1)',
            border: '1px solid #a3e635',
            borderRadius: '6px',
            color: '#a3e635',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: '0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(163, 230, 53, 0.2)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(163, 230, 53, 0.1)'}
        >
          <Gift size={16} />
          Refer & Earn
        </button>
      </div>

      {/* Countdown Timer & Top Up Section */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}>
        {/* Countdown Timer - Always show if credits available */}
        {nextReset && (nextReset.raw > 0) && credits?.balance > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 16px',
            backgroundColor: 'rgba(163, 230, 53, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(163, 230, 53, 0.3)',
            flex: 1,
          }}>
            <Clock size={16} color="#a3e635" />
            <div style={{ fontSize: '12px', color: '#a3e635', whiteSpace: 'nowrap' }}>
              <strong>Credits reset in:</strong> {String(nextReset.hours).padStart(2, '0')}:{String(nextReset.minutes).padStart(2, '0')}:{String(nextReset.seconds).padStart(2, '0')}
            </div>
          </div>
        )}

        {/* Top Up Button - Shows when non-Pro credits are 0 */}
        {credits?.balance === 0 && !isPro && (
          <button
            onClick={() => setShowTopUpModal(true)}
            style={{
              padding: '12px 20px',
              backgroundColor: '#ef4444',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: '0.2s',
              flex: 1,
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ff6b6b'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
          >
            💳 Top Up Credits Now
          </button>
        )}
      </div>

      {/* Credit Warnings */}
      {credits?.balance > 0 && credits?.balance <= 5 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 16px',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(239, 68, 68, 0.5)',
          marginBottom: '24px',
        }}>
          <AlertCircle size={16} color="#ef4444" />
          <div style={{ fontSize: '12px', color: '#ef4444' }}>
            <strong>🚨 Almost out of credits!</strong> You have <strong>{credits.balance} {credits.balance === 1 ? 'credit' : 'credits'}</strong> remaining.
          </div>
        </div>
      )}

      {credits?.balance > 5 && credits?.balance <= 20 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 16px',
          backgroundColor: 'rgba(251, 191, 36, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(251, 191, 36, 0.5)',
          marginBottom: '24px',
        }}>
          <AlertCircle size={16} color="#facc15" />
          <div style={{ fontSize: '12px', color: '#facc15' }}>
            <strong>⚠️ Running low on credits!</strong> You have <strong>{credits.balance} credits</strong> left. Consider topping up.
          </div>
        </div>
      )}

      {/* Top Up Modal */}
      {showTopUpModal && !isPro && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: '#111',
            border: '1px solid #222',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
            textAlign: 'center',
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '16px' }}>Top Up Credits</h2>
            <p style={{ fontSize: '14px', color: '#888', marginBottom: '24px' }}>
              Purchase additional credits to continue generating. Get more with Pro Plan!
            </p>
            <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', flexDirection: 'column' }}>
              <a href="/pricing" style={{ display: 'inline-block', padding: '14px 24px', backgroundColor: '#a3e635', color: '#000', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', textAlign: 'center' }}>Upgrade to Pro →</a>
              <button
                onClick={() => setShowTopUpModal(false)}
                style={{
                  padding: '12px',
                  backgroundColor: '#222',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#888',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Referral Modal */}
      {showReferralModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            backgroundColor: '#111111',
            border: '1px solid #222222',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '500px',
            width: '90vw',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Gift size={24} style={{ color: '#a3e635' }} />
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>Refer & Earn Credits</h2>
            </div>

            <p style={{ color: '#888', marginBottom: '24px', lineHeight: '1.6' }}>
              Share your referral code with friends. When they sign up, you both get 25 credits! 🎁
            </p>

            <div style={{
              backgroundColor: '#080808',
              border: '2px solid #a3e635',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <input
                type="text"
                value={referralCode || ''}
                readOnly
                style={{
                  flex: 1,
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#a3e635',
                  fontSize: '18px',
                  fontWeight: '700',
                  outline: 'none',
                }}
              />
              <button
                onClick={handleCopyReferral}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#a3e635',
                  color: '#080808',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
            </div>

            <p style={{ fontSize: '12px', color: '#666', marginBottom: '24px', textAlign: 'center' }}>
              Share: https://promptquill.com?ref={referralCode}
            </p>

            <button
              onClick={() => setShowReferralModal(false)}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#6d28d9',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Error Alert */}
        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            padding: '12px 16px',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start',
            color: '#fca5a5',
          }}>
            <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span style={{ fontSize: '14px' }}>{error}</span>
          </div>
        )}

        {/* Main Input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '14px', fontWeight: '600', color: '#a3e635' }}>
            📝 Describe Your Idea
          </label>
          <textarea
            placeholder="E.g., I want to build an AI-powered personal shopping assistant for indie fashion brands..."
            value={formData.idea}
            onChange={(e) => setFormData({ ...formData, idea: e.target.value })}
            disabled={loading}
            style={{
              width: '100%',
              minHeight: '120px',
              backgroundColor: '#080808',
              border: '1px solid #222222',
              borderRadius: '8px',
              padding: '12px',
              color: '#fff',
              fontSize: '14px',
              fontFamily: 'inherit',
              resize: 'vertical',
              outline: 'none',
              transition: 'all 0.2s',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#6d28d9';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(109, 40, 217, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#222222';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          <div style={{ fontSize: '12px', color: '#666', textAlign: 'right' }}>
            {formData.idea.length} characters
          </div>
        </div>

        {/* Category Selection */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '14px', fontWeight: '600', color: '#a3e635' }}>
            📂 Product Category
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '8px',
          }}>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setFormData({ ...formData, category: cat.id })}
                style={{
                  padding: '12px',
                  backgroundColor: formData.category === cat.id ? '#6d28d9' : '#080808',
                  border: formData.category === cat.id ? '2px solid #a3e635' : '1px solid #222222',
                  borderRadius: '8px',
                  color: '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  if (formData.category !== cat.id) {
                    e.currentTarget.style.borderColor = '#6d28d9';
                  }
                }}
                onMouseLeave={(e) => {
                  if (formData.category !== cat.id) {
                    e.currentTarget.style.borderColor = '#222222';
                  }
                }}
              >
                <div style={{ fontWeight: '600', fontSize: '14px' }}>{cat.label}</div>
                <div style={{ fontSize: '12px', color: '#888' }}>{cat.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Mode Selection */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '14px', fontWeight: '600', color: '#a3e635' }}>
            ⚙️ Generation Mode
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '8px',
          }}>
            {modes.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setFormData({ ...formData, mode: m.id })}
                style={{
                  padding: '12px',
                  backgroundColor: formData.mode === m.id ? '#6d28d9' : '#080808',
                  border: formData.mode === m.id ? '2px solid #a3e635' : '1px solid #222222',
                  borderRadius: '8px',
                  color: '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  if (formData.mode !== m.id) {
                    e.currentTarget.style.borderColor = '#6d28d9';
                  }
                }}
                onMouseLeave={(e) => {
                  if (formData.mode !== m.id) {
                    e.currentTarget.style.borderColor = '#222222';
                  }
                }}
              >
                <div style={{ fontWeight: '600', fontSize: '14px' }}>{m.label}</div>
                <div style={{ fontSize: '12px', color: '#888' }}>{m.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !credits || credits.balance <= 0}
          style={{
            padding: '14px 32px',
            backgroundColor: loading || !credits || credits.balance <= 0 ? '#666' : '#a3e635',
            color: loading || !credits || credits.balance <= 0 ? '#999' : '#080808',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '700',
            fontSize: '15px',
            cursor: loading || !credits || credits.balance <= 0 ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
          onMouseEnter={(e) => {
            if (!loading && credits && credits.balance > 0) {
              e.currentTarget.style.backgroundColor = '#c4e635';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading && credits && credits.balance > 0) {
              e.currentTarget.style.backgroundColor = '#a3e635';
              e.currentTarget.style.transform = 'translateY(0)';
            }
          }}
        >
          {loading ? (
            <>
              <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
              Generating...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Generate Brief
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default GenerationForm;
