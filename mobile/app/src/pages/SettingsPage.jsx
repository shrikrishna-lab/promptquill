import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.mobile';
import { Settings, Crown, Key, CreditCard, HelpCircle, User, Shield, ExternalLink, Check, X, ChevronRight, Zap, Mail, Bell, Lightbulb, Folder, Gift, BarChart2, Edit3 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { startProSubscription } from '../lib/pro';
import toast from 'react-hot-toast';

// Whitelisted admin emails (env var fallback for guaranteed admin access)
const WHITELISTED_ADMIN_EMAILS = import.meta.env.VITE_ADMIN_EMAILS ? import.meta.env.VITE_ADMIN_EMAILS.split(',') : [];

const SettingsPage = ({ session, profile }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('account');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [groqKey, setGroqKey] = useState('');
  const [openrouterKey, setOpenrouterKey] = useState('');
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const [billingToggle, setBillingToggle] = useState('monthly');
  const [processingPayment, setProcessingPayment] = useState(false);

  const isPro = profile?.is_pro || profile?.tier === 'pro' || false;
  const isAdmin = profile?.role === 'ADMIN' || WHITELISTED_ADMIN_EMAILS.includes(session?.user?.email?.toLowerCase());

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || profile.email?.split('@')[0] || '');
    }
    loadUserProfile();
    loadApiKeys();
  }, [profile]);

  const loadApiKeys = () => {
    const saved_groq = localStorage.getItem('prompt_os_groq_key') || '';
    const saved_openrouter = localStorage.getItem('prompt_os_openrouter_key') || '';
    setGroqKey(saved_groq);
    setOpenrouterKey(saved_openrouter);
  };

  const saveApiKeys = () => {
    localStorage.setItem('prompt_os_groq_key', groqKey);
    localStorage.setItem('prompt_os_openrouter_key', openrouterKey);
    setApiKeySaved(true);
    setTimeout(() => setApiKeySaved(false), 2000);
  };

  const loadUserProfile = async () => {
    const { data } = await supabase.from('user_profiles').select('*').eq('user_id', session.user.id).single();
    if (data) {
      setDisplayName(data.username || '');
      setBio(data.bio || '');
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    await supabase.from('user_profiles').upsert({
      user_id: session.user.id,
      username: displayName,
      bio
    }, { onConflict: 'user_id' });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: <User size={16} /> },
    { id: 'plan', label: 'Plan & Billing', icon: <CreditCard size={16} /> },
    ...(isPro ? [{ id: 'api', label: 'API Config', icon: <Key size={16} /> }] : []),
    { id: 'support', label: 'Support', icon: <HelpCircle size={16} /> },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin', icon: <Shield size={16} /> }] : []),
  ];

  const proFeatures = [
    { name: 'Unlimited Generations', desc: 'No daily limit on prompt creation' },
    { name: 'Priority AI Models', desc: 'Access faster, higher-quality models' },
    { name: 'PDF & Cursor Export', desc: 'Export briefs in multiple formats' },
    { name: 'Full Community Access', desc: 'Post, fork, and roast ideas' },
    { name: 'Reddit Pain Finder', desc: 'Full 3-point validation analysis' },
    { name: 'Unlimited History', desc: 'Access all past sessions forever' },
    { name: 'Clean Share Cards', desc: 'No watermark on shared cards' },
    { name: 'Pro Badge', desc: 'Stand out in the community' },
    { name: 'Early Access', desc: 'First to try new features' },
    { name: 'Validate Tab', desc: 'Market size, competitors, validation data' },
  ];

  return (
    <>
    <div className="mobile-hide" style={{ minHeight: '100vh', backgroundColor: '#080808', color: '#fff', display: 'flex' }}>
      {/* Sidebar */}
      <div style={{ width: '260px', backgroundColor: '#0a0a0a', borderRight: '1px solid #1a1a1a', padding: '24px 16px', position: 'fixed', top: 0, left: 0, height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Settings size={20} color="#a3e635" />
          <h1 style={{ fontSize: '18px', fontWeight: '900' }}>Settings</h1>
        </div>
        <p style={{ fontSize: '11px', color: '#555', marginBottom: '32px' }}>{session?.user?.email}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px',
              fontSize: '13px', fontWeight: '600', textAlign: 'left', cursor: 'pointer', transition: '0.2s',
              backgroundColor: activeTab === t.id ? 'rgba(163,230,53,0.06)' : 'transparent',
              color: activeTab === t.id ? '#fff' : '#666',
              border: activeTab === t.id ? '1px solid rgba(163,230,53,0.15)' : '1px solid transparent'
            }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <button onClick={() => navigate('/ai')} style={{ padding: '12px', backgroundColor: '#111', border: '1px solid #222', borderRadius: '10px', color: '#888', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
          ← Back to App
        </button>
      </div>

      {/* Main */}
      <div style={{ flex: 1, marginLeft: '260px', padding: '40px' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>

          {/* ─── ACCOUNT ─── */}
          {activeTab === 'account' && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '8px' }}>Account</h2>
              <p style={{ color: '#555', fontSize: '13px', marginBottom: '32px' }}>Manage your profile and preferences</p>

              <div style={{ backgroundColor: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
                <label style={{ fontSize: '11px', fontWeight: '800', color: '#555', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>EMAIL</label>
                <p style={{ fontSize: '15px', fontWeight: '600', marginBottom: '24px' }}>{session?.user?.email}</p>

                <label style={{ fontSize: '11px', fontWeight: '800', color: '#555', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>DISPLAY NAME</label>
                <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', backgroundColor: '#111', border: '1px solid #222', borderRadius: '10px', color: '#fff', fontSize: '14px', outline: 'none', marginBottom: '20px', boxSizing: 'border-box' }} />

                <label style={{ fontSize: '11px', fontWeight: '800', color: '#555', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>BIO</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
                  style={{ width: '100%', padding: '12px 16px', backgroundColor: '#111', border: '1px solid #222', borderRadius: '10px', color: '#fff', fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />

                <button onClick={saveProfile} disabled={saving} style={{
                  marginTop: '20px', padding: '12px 24px', backgroundColor: saved ? '#22c55e' : '#a3e635',
                  border: 'none', borderRadius: '10px', color: '#000', fontSize: '13px', fontWeight: '800', cursor: 'pointer'
                }}>
                  {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Changes'}
                </button>
              </div>

              {/* Plan badge */}
              <div style={{ backgroundColor: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '16px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#555', letterSpacing: '1px' }}>CURRENT PLAN</span>
                  <div style={{ fontSize: '20px', fontWeight: '900', marginTop: '8px', color: isPro ? '#a3e635' : '#fff' }}>
                    {isPro ? '⚡ Pro Plan' : 'Basic (Free)'}
                  </div>
                </div>
                {!isPro && (
                  <button onClick={() => setActiveTab('plan')} style={{
                    padding: '10px 20px', backgroundColor: 'rgba(163,230,53,0.1)', border: '1px solid #a3e635',
                    borderRadius: '10px', color: '#a3e635', fontSize: '12px', fontWeight: '800', cursor: 'pointer'
                  }}>
                    Upgrade →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ─── PLAN & BILLING ─── */}
          {activeTab === 'plan' && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '8px' }}>Plan & Billing</h2>
              <p style={{ color: '#555', fontSize: '13px', marginBottom: '32px' }}>Manage your subscription</p>

              {isPro ? (
                <div style={{ backgroundColor: 'rgba(109,40,217,0.05)', border: '1px solid #6d28d9', borderRadius: '20px', padding: '32px', textAlign: 'center' }}>
                  <Crown size={40} color="#a3e635" style={{ marginBottom: '16px' }} />
                  <h3 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '8px' }}>You're on Pro! 🎉</h3>
                  <p style={{ color: '#888', fontSize: '14px' }}>You have access to all premium features.</p>
                </div>
              ) : (
                <div>
                  {/* Upgrade card */}
                  <div style={{ backgroundColor: '#0d0d0d', border: '1px solid rgba(163,230,53,0.2)', borderRadius: '20px', padding: '32px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                      <Zap size={24} color="#a3e635" />
                      <h3 style={{ fontSize: '20px', fontWeight: '900' }}>Upgrade to <span style={{ color: '#a3e635' }}>Pro</span></h3>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '28px' }}>
                      {proFeatures.map((f, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                          <Check size={14} color="#a3e635" style={{ marginTop: '2px', flexShrink: 0 }} />
                          <div>
                            <span style={{ fontSize: '12px', fontWeight: '700', color: '#fff' }}>{f.name}</span>
                            <p style={{ fontSize: '10px', color: '#555', margin: '2px 0 0' }}>{f.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Billing Toggle */}
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', justifyContent: 'center' }}>
                      <button
                        onClick={() => setBillingToggle('monthly')}
                        style={{
                          padding: '10px 20px',
                          borderRadius: '8px',
                          border: billingToggle === 'monthly' ? '1px solid #a3e635' : '1px solid #333',
                          backgroundColor: billingToggle === 'monthly' ? 'rgba(163,230,53,0.1)' : '#0d0d0d',
                          color: billingToggle === 'monthly' ? '#a3e635' : '#666',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          transition: '0.2s'
                        }}
                      >
                        Monthly
                      </button>
                      <button
                        onClick={() => setBillingToggle('yearly')}
                        style={{
                          padding: '10px 20px',
                          borderRadius: '8px',
                          border: billingToggle === 'yearly' ? '1px solid #a3e635' : '1px solid #333',
                          backgroundColor: billingToggle === 'yearly' ? 'rgba(163,230,53,0.1)' : '#0d0d0d',
                          color: billingToggle === 'yearly' ? '#a3e635' : '#666',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          transition: '0.2s'
                        }}
                      >
                        Yearly (Save 30%)
                      </button>
                    </div>

                    {/* Pricing Display */}
                    <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                      <div style={{ fontSize: '32px', fontWeight: '900', color: '#a3e635' }}>
                        ₹{billingToggle === 'monthly' ? '499' : '4,199'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        per {billingToggle === 'monthly' ? 'month' : 'year'}
                      </div>
                    </div>

                    {/* Payment Button */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px', minHeight: '48px' }}>
                      <button
                        onClick={async () => {
                          setProcessingPayment(true);
                          try {
                            await startProSubscription(
                              billingToggle,
                              session?.user?.id,
                              session?.user?.email,
                              profile?.full_name || 'User',
                              async () => {
                                console.log('✅ Payment callback triggered');
                                toast.success('Payment successful! You are now Pro 🎉');
                                
                                // Wait 2 seconds for backend webhook to complete
                                console.log('⏳ Waiting 2 seconds for backend processing...');
                                await new Promise(resolve => setTimeout(resolve, 2000));
                                
                                // Hard refresh to get latest profile from database
                                console.log('🔄 Refreshing page to show Pro status...');
                                window.location.href = window.location.pathname + '?tab=plan&refresh=' + Date.now();
                              },
                              (err) => {
                                console.error('❌ Payment error:', err);
                                toast.error(err.message || 'Payment failed');
                                setProcessingPayment(false);
                              }
                            );
                          } catch (err) {
                            console.error('❌ Payment exception:', err);
                            toast.error(err.message || 'Payment error');
                            setProcessingPayment(false);
                          }
                        }}
                        disabled={processingPayment}
                        style={{
                          width: '100%',
                          padding: '14px',
                          borderRadius: '12px',
                          border: 'none',
                          backgroundColor: processingPayment ? '#555' : '#a3e635',
                          color: processingPayment ? '#aaa' : '#000',
                          fontSize: '14px',
                          fontWeight: '700',
                          cursor: processingPayment ? 'not-allowed' : 'pointer',
                          transition: '0.2s'
                        }}
                      >
                        {processingPayment ? 'Processing...' : 'Upgrade Now'}
                      </button>
                    </div>

                    <p style={{ textAlign: 'center', fontSize: '11px', color: '#444', marginTop: '16px' }}>
                      Secure payment • Cancel anytime
                    </p>
                  </div>

                  {/* Or use existing pricing page */}
                  <button onClick={() => navigate('/pricing')} style={{
                    width: '100%', padding: '14px', backgroundColor: '#111', border: '1px solid #222',
                    borderRadius: '12px', color: '#888', fontSize: '13px', fontWeight: '700', cursor: 'pointer', textAlign: 'center'
                  }}>
                    Compare Plans in Detail →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ─── API CONFIG (Pro Only) ─── */}
          {activeTab === 'api' && isPro && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '8px' }}>API Configuration</h2>
              <p style={{ color: '#555', fontSize: '13px', marginBottom: '32px' }}>Configure your custom AI provider keys for priority model access</p>

              <div style={{ backgroundColor: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '16px', padding: '24px' }}>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: '#555', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>GROQ API KEY</label>
                  <input type="password" placeholder="sk-..." value={groqKey} onChange={e => setGroqKey(e.target.value)}
                    style={{ width: '100%', padding: '12px 16px', backgroundColor: '#111', border: '1px solid #222', borderRadius: '10px', color: '#fff', fontSize: '13px', outline: 'none', fontFamily: 'monospace', boxSizing: 'border-box' }} />
                  <p style={{ fontSize: '10px', color: '#444', marginTop: '6px' }}>Get key from <a href="https://console.groq.com" target="_blank" rel="noreferrer" style={{ color: '#a3e635' }}>console.groq.com</a></p>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: '#555', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>OPENROUTER API KEY</label>
                  <input type="password" placeholder="sk-..." value={openrouterKey} onChange={e => setOpenrouterKey(e.target.value)}
                    style={{ width: '100%', padding: '12px 16px', backgroundColor: '#111', border: '1px solid #222', borderRadius: '10px', color: '#fff', fontSize: '13px', outline: 'none', fontFamily: 'monospace', boxSizing: 'border-box' }} />
                  <p style={{ fontSize: '10px', color: '#444', marginTop: '6px' }}>Get key from <a href="https://openrouter.ai" target="_blank" rel="noreferrer" style={{ color: '#a3e635' }}>openrouter.ai</a></p>
                </div>

                <button onClick={saveApiKeys} style={{
                  width: '100%', padding: '12px 16px', backgroundColor: apiKeySaved ? '#4ade80' : '#a3e635', color: apiKeySaved ? '#0d0d0d' : '#000',
                  fontSize: '13px', fontWeight: '700', borderRadius: '10px', border: 'none', cursor: 'pointer', transition: '0.2s'
                }}>
                  {apiKeySaved ? '✓ Saved' : 'Save API Keys'}
                </button>
              </div>
            </div>
          )}

          {/* ─── SUPPORT ─── */}
          {activeTab === 'support' && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '8px' }}>Support</h2>
              <p style={{ color: '#555', fontSize: '13px', marginBottom: '32px' }}>Get help or report issues</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <button onClick={() => navigate('/support')} style={{
                  padding: '24px', backgroundColor: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '16px',
                  color: '#fff', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>📩 Submit a Ticket</div>
                    <div style={{ fontSize: '12px', color: '#555' }}>Report bugs, request features, or ask questions</div>
                  </div>
                  <ChevronRight size={18} color="#555" />
                </button>

                <button onClick={() => navigate('/support')} style={{
                  padding: '24px', backgroundColor: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '16px',
                  color: '#fff', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>📋 View My Tickets</div>
                    <div style={{ fontSize: '12px', color: '#555' }}>Check status of your support requests</div>
                  </div>
                  <ChevronRight size={18} color="#555" />
                </button>

                <div style={{ padding: '24px', backgroundColor: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '16px' }}>
                  <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>📧 Email Us</div>
                  <div style={{ fontSize: '12px', color: '#555' }}>promptquill.support@gmail.com • We respond within 24 hours</div>
                </div>
              </div>
            </div>
          )}

          {/* ─── ADMIN ─── */}
          {activeTab === 'admin' && isAdmin && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '8px' }}>Admin Access</h2>
              <p style={{ color: '#555', fontSize: '13px', marginBottom: '32px' }}>Quick access to admin tools</p>

              <button onClick={() => navigate('/admin')} style={{
                width: '100%', padding: '24px', backgroundColor: 'rgba(163,230,53,0.05)', border: '1px solid rgba(163,230,53,0.2)',
                borderRadius: '16px', color: '#fff', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: '800', marginBottom: '4px' }}>🛡️ Open Admin Panel</div>
                  <div style={{ fontSize: '12px', color: '#555' }}>User mgmt, tickets, analytics, settings & more</div>
                </div>
                <ChevronRight size={18} color="#a3e635" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>

    {/* Mobile UI Override */}
    <div className="mobile-only" style={{ backgroundColor: '#050505', minHeight: '100vh', width: '100%', paddingBottom: '120px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 24px 0 24px' }}>
        <button style={{ background: 'none', border: 'none', color: '#888', padding: 0 }}>
          <Settings size={24} />
        </button>
        <button style={{ background: 'none', border: 'none', color: '#888', padding: 0 }}>
          <Bell size={24} />
        </button>
      </div>

      {/* Profile Header */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px', marginBottom: '32px' }}>
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          {/* Gradient Ring */}
          <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'linear-gradient(135deg, #a3e635, #db2777)', padding: '3px' }}>
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: '#222', border: '3px solid #050505', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', fontWeight: '900', color: '#fff' }}>
              {displayName ? displayName.charAt(0).toUpperCase() : session?.user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
          {/* Edit Badge */}
          <div style={{ position: 'absolute', bottom: 0, right: 0, width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#111', border: '2px solid #050505', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <Edit3 size={14} />
          </div>
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 4px 0', color: '#fff' }}>{displayName || session?.user?.email?.split('@')[0] || 'User'}</h2>
        <p style={{ margin: 0, color: '#666', fontSize: '13px', fontWeight: '500' }}>{session?.user?.email || ''}</p>
      </div>

      {/* Stats Cards Row */}
      <div style={{ display: 'flex', gap: '12px', padding: '0 24px', marginBottom: '32px', overflowX: 'auto', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
        <div style={{ flex: '1 0 auto', backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '100px' }}>
          <Lightbulb size={20} color="#eab308" />
          <div>
            <div style={{ color: '#fff', fontSize: '16px', fontWeight: '800' }}>{profile?.total_prompts || 0}</div>
            <div style={{ color: '#666', fontSize: '12px', fontWeight: '600' }}>Prompts</div>
          </div>
        </div>
        <div style={{ flex: '1 0 auto', backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '100px' }}>
          <Folder size={20} color="#3b82f6" />
          <div>
            <div style={{ color: '#fff', fontSize: '16px', fontWeight: '800' }}>{profile?.total_shipped || 0}</div>
            <div style={{ color: '#666', fontSize: '12px', fontWeight: '600' }}>Shipped</div>
          </div>
        </div>
        <div style={{ flex: '1 0 auto', backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '100px' }}>
          <Zap size={20} color="#a3e635" />
          <div>
            <div style={{ color: '#fff', fontSize: '16px', fontWeight: '800' }}>{isPro ? 'Pro' : 'Basic'}</div>
            <div style={{ color: '#666', fontSize: '12px', fontWeight: '600' }}>Plan</div>
          </div>
        </div>
      </div>

      {/* Menu List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 24px' }}>
        {[
          { icon: <User size={20} color="#fff" />, label: 'Edit Profile', action: () => { setActiveTab('profile'); window.scrollTo({ top: 0, behavior: 'smooth' }); } },
          { icon: <CreditCard size={20} color="#fff" />, label: 'Plan & Billing', action: () => navigate('/pricing') },
          { icon: <BarChart2 size={20} color="#fff" />, label: 'Usage', action: () => { setActiveTab('usage'); window.scrollTo({ top: 0, behavior: 'smooth' }); } },
          { icon: <Settings size={20} color="#fff" />, label: 'Settings', action: () => { setActiveTab('general'); window.scrollTo({ top: 0, behavior: 'smooth' }); } },
          { icon: <HelpCircle size={20} color="#fff" />, label: 'Help & Support', action: () => navigate('/support') },
          { icon: <Gift size={20} color="#fff" />, label: 'Refer & Earn', badge: 'NEW', action: () => navigate('/referral') }
        ].map((item, i) => (
          <button key={i} onClick={item.action} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', backgroundColor: '#0d0d0d', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', width: '100%', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.icon}
              </div>
              <span style={{ color: '#e5e5e5', fontSize: '15px', fontWeight: '600' }}>{item.label}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {item.badge && (
                <span style={{ backgroundColor: 'rgba(163,230,53,0.15)', color: '#a3e635', padding: '4px 8px', borderRadius: '99px', fontSize: '10px', fontWeight: '800' }}>
                  {item.badge}
                </span>
              )}
              <ChevronRight size={18} color="#666" />
            </div>
          </button>
        ))}
      </div>
    </div>
    </>
  );
};

export default SettingsPage;
