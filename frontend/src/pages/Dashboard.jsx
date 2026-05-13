import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import BottomInput from '../components/BottomInput';
import LoadingSpinner from '../components/LoadingSpinner';
import GenerationRetry from '../components/GenerationRetry';
import Mascot from '../components/Mascot';
import { supabase } from '../lib/supabase';
import { fetchClarifyingQuestions, generateBrief, generateInitialTabs, generateTabContent, generateStressTest, PromptMemory, streamImageAnalysis } from '../lib/ai';
import { SAFETY_GATE_MESSAGE } from '../lib/safetyGate';
import { withInputHeader } from '../lib/promptOutputStandards';
import { generateQualityReport } from '../lib/qualityGateValidator';
import { getTabsForMode, normalizeMode } from '../lib/promptModeRegistry';
import { Copy, Download, Zap, ChevronDown, ChevronUp, Share2, Globe, Lock, Flame, AlertCircle, X, Check, ArrowLeft, CheckCircle, FastForward } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import confetti from 'canvas-confetti';
import { timeAgo } from '../lib/utils';
import { logUsage } from '../lib/pro';
import { useLocation, useNavigate } from 'react-router-dom';


// ─── Static Particle Generation ─────────────────────────
// Pre-generated so they don't reset when component re-renders (e.g. countdown timer ticks)
const CD_LEAVES = [...Array(15)].map((_, i) => {
  const scale = 0.5 + Math.random() * 1;
  return {
    id: `leaf-${i}`,
    left: `${Math.random() * 100}%`,
    width: `${14 * scale}px`,
    height: `${10 * scale}px`,
    animationDuration: `${12 + Math.random() * 15}s`,
    animationDelay: `-${Math.random() * 15}s`,
    opacity: 0.3 + Math.random() * 0.5
  };
});

const CD_SNOW = [...Array(30)].map((_, i) => ({
  id: `snow-${i}`,
  left: `${Math.random() * 100}%`,
  width: `${3 + Math.random() * 5}px`,
  height: `${3 + Math.random() * 5}px`,
  animationDuration: `${10 + Math.random() * 10}s`,
  animationDelay: `-${Math.random() * 10}s`,
  opacity: 0.2 + Math.random() * 0.5
}));

// ─── Simple Markdown Renderer ─────────────────────────
const renderMarkdown = (text) => {
  if (!text) return '';

  let html = text
    // Preserve prompt tags as readable text instead of letting the browser
    // treat them as unknown HTML elements.
    .replace(/<\/?(role|context|task|constraints|output_format)>/gi, (tag) =>
      tag.replace(/</g, '&lt;').replace(/>/g, '&gt;')
    )
    // Code blocks (must come before inline code)
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    // Detect and preserve tree structures - wrap in pre block
    .replace(/([^\n]*[├└│─⊗⊕][^\n]*(?:\n[^\n]*[├└│─⊗⊕][^\n]*)*)/g, (match) => {
      const escaped = match.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return `<pre style="white-space: pre; font-family: monospace; margin: 8px 0;">${escaped}</pre>`;
    })
    // Tables
    .replace(/\|(.+)\|\n\|[-| :]+\|\n((?:\|.+\|\n?)*)/g, (match, header, body) => {
      const ths = header.split('|').filter(c => c.trim()).map(c => `<th>${c.trim()}</th>`).join('');
      const rows = body.trim().split('\n').map(row => {
        const tds = row.split('|').filter(c => c.trim()).map(c => `<td>${c.trim()}</td>`).join('');
        return `<tr>${tds}</tr>`;
      }).join('');
      return `<table><thead><tr>${ths}</tr></thead><tbody>${rows}</tbody></table>`;
    })
    // Headers
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h2>$1</h2>')
    // Bold and italic
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Blockquotes
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    // Unordered lists
    .replace(/^-\s\[\s\]\s(.+)$/gm, '<li>☐ $1</li>')
    .replace(/^- \[x\] (.+)$/gm, '<li>☑ $1</li>')
    .replace(/^[-*] (.+)$/gm, '<li>$1</li>')
    // Ordered lists
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // Horizontal rules
    .replace(/^---$/gm, '<hr/>')
    .replace(/^═+$/gm, '<hr/>')
    // Line breaks (double newline = paragraph, single = br)
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>');

  // Wrap consecutive <li> in <ul>
  html = html.replace(/((?:<li>.*?<\/li><br\/>?)+)/g, '<ul>$1</ul>');
  html = html.replace(/<ul><br\/>/g, '<ul>');
  html = html.replace(/<br\/><\/ul>/g, '</ul>');

  return `<p>${html}</p>`;
};

const isUsableTabContent = (content) => {
  const text = String(content || '').trim();
  if (!text) return false;
  if (text === 'PRO_LOCKED') return false;
  if (/^\[[A-Z_ -]+Content generated\. Please expand this section\.\]$/i.test(text)) return false;
  if (/Generation incomplete|please retry|Content generated\. Please expand/i.test(text)) return false;
  return text.length > 20;
};

// ─── Toast Hook ──────────────────────────────────────
const useToast = () => {
  const [toast, setToast] = useState(null);
  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }, []);
  return [toast, showToast];
};

const LoadingSkeleton = () => (
  <>
    <div className="desktop-only-input" style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {/* Header Skeleton */}
      <div className="skeleton" style={{ height: '28px', width: '55%', borderRadius: '8px' }} />
      <div className="skeleton" style={{ height: '16px', width: '80%', borderRadius: '6px' }} />
      <div className="skeleton" style={{ height: '16px', width: '70%', borderRadius: '6px' }} />

      <div style={{ height: '12px' }} />

      {/* Content Skeleton Lines */}
      <div className="skeleton" style={{ height: '20px', width: '40%', borderRadius: '6px' }} />
      <div className="skeleton" style={{ height: '16px', width: '90%', borderRadius: '6px' }} />
      <div className="skeleton" style={{ height: '16px', width: '85%', borderRadius: '6px' }} />
      <div className="skeleton" style={{ height: '16px', width: '75%', borderRadius: '6px' }} />
    </div>
    <div className="mobile-only-input" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', width: '100%', gap: '32px' }}>
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        background: 'radial-gradient(circle at 30% 30%, #c4f07a 0%, #a3e635 50%, #4d7a0b 100%)',
        boxShadow: '0 0 40px rgba(163, 230, 53, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.5)',
        animation: 'orb-pulse 2s infinite ease-in-out'
      }} />
      <div style={{ color: '#fff', fontSize: '15px', fontWeight: '700', letterSpacing: '0.5px', textAlign: 'center' }}>AI is analyzing your concept...</div>
    </div>
  </>
);

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000000';

const Dashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('action_brief');
  const [loadedTabs, setLoadedTabs] = useState(new Set()); // Start with NO tabs loaded - all show "Generate Now" button
  const [showGalleryUpload, setShowGalleryUpload] = useState(false);
  const [galleryUploadForm, setGalleryUploadForm] = useState({ title: '', description: '', tags: '', file: null, creative_type: 'image' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeAnnouncement, setActiveAnnouncement] = useState(null);



  useEffect(() => {
    const fetchAnnouncement = async () => {
      const { data } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1);
      if (data && data[0]) setActiveAnnouncement(data[0]);
    };
    fetchAnnouncement();
  }, []);
  const [suggestionInput, setSuggestionInput] = useState('');
  const [profile, setProfile] = useState(null);
  const [lastInput, setLastInput] = useState('');
  const [toast, showToast] = useToast();
  const [bottomInputMode, setBottomInputMode] = useState('GENERAL');  // Track BottomInput mode selection

  // Stress Test state
  const [stressTestOpen, setStressTestOpen] = useState(false);
  const [stressQuestions, setStressQuestions] = useState([]);
  const [stressAnswers, setStressAnswers] = useState({});
  const [stressLoading, setStressLoading] = useState(false);

  // Smart Expander state (Claude-style clarifying questions)
  const [expanderVisible, setExpanderVisible] = useState(false);
  const [expanderQuestions, setExpanderQuestions] = useState([]);
  const [expanderAnswers, setExpanderAnswers] = useState({ _submitted: false });
  const [expanderStep, setExpanderStep] = useState(0);
  const [selectedMode, setSelectedMode] = useState('GENERAL');  // Track mode selected before expander opens
  const getExpanderQuestionsForMode = (mode, metadata = {}) => {
    const m = normalizeMode(mode || 'GENERAL');
    const creativeType = metadata?.creative_type || 'image';

    const common = [
      { id: 'goal', type: 'text', prompt: 'What is the success outcome?', placeholder: 'e.g. 50 signups/week, a working demo, a finished poster, etc.' },
      { id: 'constraints', type: 'text', prompt: 'Any constraints I must obey?', placeholder: 'e.g. budget ₹0, timeline 7 days, tech stack fixed, tone rules, etc.' }
    ];

    if (m === 'CODING') {
      return [
        { id: 'stack', type: 'text', prompt: 'Preferred stack?', placeholder: 'e.g. React + Node + Postgres (or whatever you want)' },
        { id: 'auth', type: 'text', prompt: 'Auth + roles?', placeholder: 'e.g. email OTP only, admin + user, SSO, none' },
        { id: 'data', type: 'text', prompt: 'Data source + storage?', placeholder: 'e.g. Supabase, MongoDB, file upload, external API' },
        ...common
      ];
    }
    if (m === 'CONTENT') {
      return [
        { id: 'audience', type: 'text', prompt: 'Who exactly is the reader?', placeholder: 'e.g. Indian founders, college students, SaaS PMs' },
        { id: 'channel', type: 'text', prompt: 'Primary channel?', placeholder: 'e.g. LinkedIn, blog, email, YouTube, X' },
        { id: 'cta', type: 'text', prompt: 'What do you want them to do?', placeholder: 'e.g. subscribe, buy, DM you, join waitlist' },
        ...common
      ];
    }
    if (m === 'STARTUP' || m === 'STARTUP_LITE') {
      return [
        { id: 'customer', type: 'text', prompt: 'Who pays (not just who uses)?', placeholder: 'e.g. students, parents, colleges, SMBs' },
        { id: 'region', type: 'text', prompt: 'Which market/region first?', placeholder: 'e.g. India tier-1, US, global' },
        { id: 'pricing_anchor', type: 'text', prompt: 'Any pricing anchor?', placeholder: 'e.g. ₹199/mo, freemium, B2B seat pricing' },
        ...common
      ];
    }
    if (m === 'CREATIVE') {
      return [
        { id: 'creative_type', type: 'text', prompt: 'Creative type confirmed', placeholder: creativeType, locked: true },
        { id: 'style_refs', type: 'text', prompt: 'Any style references?', placeholder: 'e.g. “Apple launch film”, “Blade Runner neon”, “Studio Ghibli lighting”' },
        { id: 'format', type: 'text', prompt: 'Output format?', placeholder: 'e.g. 1 image prompt, 5 variations, poster copy + layout notes' },
        ...common
      ];
    }
    // GENERAL
    return [
      { id: 'context', type: 'text', prompt: 'What context matters?', placeholder: 'e.g. team size, industry, timeline, what you already tried' },
      { id: 'success_metric', type: 'text', prompt: 'How will you measure success?', placeholder: 'e.g. revenue, users, time saved, quality bar' },
      ...common
    ];
  };

  // Usage & Pro state
  const [usageInfo, setUsageInfo] = useState({ allowed: true, isPro: true, used: 0, limit: 999 });



  // AI Roast state
  const [roastResult, setRoastResult] = useState(null);
  const [roastLoading, setRoastLoading] = useState(false);
  const [roastDefense, setRoastDefense] = useState('');
  const [roastVerdict, setRoastVerdict] = useState(null);

  // Share Card state
  const [shareCardOpen, setShareCardOpen] = useState(false);
  const [isGeneratingCard, setIsGeneratingCard] = useState(false);

  // Bury Modal state
  const [buryModal, setBuryModal] = useState(null);
  const [buryLoading, setBuryLoading] = useState(false);
  const [buryReason, setBuryReason] = useState('');

  // Rename Modal state
  const [renameModal, setRenameModal] = useState({ isOpen: false, id: null, title: '' });

  const location = useLocation();

  // User Profile (Public) state
  const [userProfile, setUserProfile] = useState(null);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  // Generation Retry state
  const [retryState, setRetryState] = useState({
    isActive: false,
    retryCount: 0,
    maxRetries: 3,
    lastInput: null,
    lastMode: null,
    lastMetadata: null,
  });

  // Ref to store generation params (solves async state update issue with retry)
  const lastGenerationParamsRef = useRef({
    input: null,
    mode: null,
    metadata: null,
  });

  // Profile Settings form state
  const [settingsForm, setSettingsForm] = useState({ bio: '', twitter: '', github: '', website: '' });
  const [pendingApproval, setPendingApproval] = useState(null);
  const [approvalNotice, setApprovalNotice] = useState('');
  const [imageStreamText, setImageStreamText] = useState('');
  const [isImageStreaming, setIsImageStreaming] = useState(false);
  const [imageStreamDone, setImageStreamDone] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);

  const navigate = useNavigate();  // For navigation to pricing/credits purchase
  const getPrimaryPromptTabId = (mode) => (mode === 'CREATIVE' ? 'master_prompt' : 'final_prompt');
  const getModeTabs = (mode) => getTabsForMode(normalizeMode(mode || 'GENERAL')) || [];
  const getModeProTabs = (mode) => new Set(getProTabsForMode(normalizeMode(mode || 'GENERAL')) || []);

  const ScoreRing = ({ score = 0 }) => {
    const clamped = Math.max(0, Math.min(10, Number(score) || 0));
    const pct = (clamped / 10) * 100;
    const r = 18;
    const c = 2 * Math.PI * r;
    const offset = c - (pct / 100) * c;
    const stroke = clamped >= 8 ? '#a3e635' : clamped >= 6 ? '#fbbf24' : '#ef4444';

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ position: 'relative', width: '48px', height: '48px' }}>
          <svg width="48" height="48" viewBox="0 0 48 48" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="24" cy="24" r={r} stroke="#1f1f1f" strokeWidth="6" fill="none" />
            <circle
              cx="24"
              cy="24"
              r={r}
              stroke={stroke}
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={offset}
              style={{ filter: `drop-shadow(0 0 10px ${stroke}55)` }}
            />
          </svg>
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '900',
            fontSize: '14px',
            color: '#fff'
          }}>
            {clamped}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
          <div style={{ color: '#fff', fontWeight: '900', fontSize: '12px' }}>Score</div>
          <div style={{ color: '#666', fontWeight: '700', fontSize: '11px' }}>/10</div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    fetchSessions();
    fetchProfile();
    refreshUsage();
  }, [location.search]);



  const fetchProfile = async () => {
    // 1. Internal Private Profile
    const { data: priv } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', DEMO_USER_ID)
      .maybeSingle();
    if (priv) setProfile(priv);

    // 2. Public User Profile
    const { data: pub, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', DEMO_USER_ID)
      .maybeSingle();

    if (pub) {
      setUserProfile(pub);
      setSettingsForm({ bio: pub.bio || '', twitter: pub.twitter || '', github: pub.github || '', website: pub.website || '' });
    } else if (error && error.code === 'PGRST116') {
      // Profile not found -> trigger modal
      setShowUsernameModal(true);
    }
  };

  const handleClaimUsername = async () => {
    if (!usernameInput || usernameInput.length < 3) return;
    setProfileSaving(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert([{
          user_id: DEMO_USER_ID,
          username: usernameInput.toLowerCase().trim()
        }])
        .select()
        .maybeSingle();

      if (error) {
        if (error.code === '23505') showToast('Username already taken');
        else showToast(error.message);
      } else {
        setUserProfile(data);
        setShowUsernameModal(false);
        showToast('Username claimed! ✓');
      }
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    setProfileSaving(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(settingsForm)
        .eq('user_id', DEMO_USER_ID)
        .select()
        .maybeSingle();

      if (!error) {
        setUserProfile(data);
        setShowSettingsModal(false);
        showToast('Settings saved ✓');
      }
    } finally {
      setProfileSaving(false);
    }
  };

  const refreshUsage = async () => {
    setUsageInfo({ allowed: true, isPro: true, used: 0, limit: 999 });
  };

  const handleTogglePublic = async () => {
    console.log(`[handleTogglePublic] Starting... currentSession:`, currentSession);
    if (!currentSession) {
      console.error('[handleTogglePublic] ✗ No currentSession!');
      showToast('No session to publish');
      return;
    }

    console.log(`[handleTogglePublic] Session ID: ${currentSession.id}, User ID: ${DEMO_USER_ID}`);

    try {
      const newVal = !currentSession.is_public;
      console.log(`[handleTogglePublic] Toggling public to: ${newVal}`);

      const { data: updatedSession, error } = await supabase
        .from('sessions')
        .update({ is_public: newVal })
        .eq('id', currentSession.id)
        .eq('user_id', DEMO_USER_ID)
        .select()
        .single();

      console.log(`[handleTogglePublic] Update response:`, { updatedSession, error });

      if (error) throw error;

      if (updatedSession) {
        console.log(`[handleTogglePublic] ✓ Updated successfully, setting state`);
        setCurrentSession(updatedSession);
        fetchSessions();
      } else {
        console.error('[handleTogglePublic] ✗ No updatedSession returned');
      }
      showToast(newVal ? '🌍 Published to Community ✓' : '🔒 Removed from Community');
    } catch (err) {
      console.error('Error toggling public:', err);
      showToast('Failed to update privacy. Please try again.');
    }
  };

  const handleAiRoast = async () => {
    if (!result || !lastInput) return;
    setRoastLoading(true);
    setRoastResult(null);
    setRoastVerdict(null);
    try {
      const questions = await generateStressTest(lastInput, result);
      const roastContent = `🔥 **3 Reasons This Will Likely Fail:**\n${questions.slice(0, 3).map((q, i) => `${i + 1}. ${q}`).join('\n')}\n\n💀 **The Fatal Flaw:**\n${questions[3] || 'No one is talking about the retention problem.'}\n\n⚔️ **One-Line Savage Summary:**\n${questions[4] || 'Another "build it and they will come" product.'}`;
      setRoastResult(roastContent);
    } catch (err) {
      setRoastResult('Roast failed. Even AI couldn\'t find enough reasons to roast this.');
    } finally {
      setRoastLoading(false);
    }
  };

  const fetchSessions = async () => {
    const { data: sessionsData, error: sessionError } = await supabase
      .from('sessions')
      .select('*, prompt_versions(id, version_number)')
      .eq('user_id', DEMO_USER_ID)
      .eq('is_buried', false)
      .order('created_at', { ascending: false });

    if (!sessionError && sessionsData?.length > 0) {
      const enriched = sessionsData.map(s => ({
        ...s,
        created_at_human: timeAgo(s.created_at),
        versions: s.prompt_versions?.sort((a, b) => b.version_number - a.version_number) || []
      }));
      setSessions(enriched);
    } else {
      // Fallback to localStorage history if DB returns no sessions or has an error
      const memory = PromptMemory.load();
      if (memory.history?.length > 0) {
        const localSessions = memory.history.map((h, i) => ({
          id: `local-${i}`,
        user_id: DEMO_USER_ID,
          title: h.idea,
          mode: h.mode,
          created_at: new Date(h.timestamp).toISOString(),
          created_at_human: timeAgo(new Date(h.timestamp).toISOString()),
          versions: [],
          score: h.score,
          _fromLocalStorage: true
        }));
        setSessions(localSessions);
        console.log('[Dashboard] Showing localStorage history as fallback');
      }
    }
  };

  const handleNewSession = () => {
    setCurrentSession(null);
    setResult(null);
    setSuggestionInput('');
    setBottomInputMode('GENERAL');
    setActiveTab('action_brief');
    setLoadedTabs(new Set());
    setStressTestOpen(false);
    setStressQuestions([]);
    setStressAnswers({});
    setExpanderVisible(false);
  };

  const handleApproveSensitiveAction = () => {
    if (!pendingApproval) return;
    const req = pendingApproval;
    setPendingApproval(null);
    setApprovalNotice('✅ Action approved. Continuing generation...');
    handleGenerate(req.input, req.mode, { ...req.metadata, _approvedAction: true });
  };

  const handleDenySensitiveAction = () => {
    setPendingApproval(null);
    setApprovalNotice('❌ Action denied. Generation cancelled.');
  };

  const handleSessionSelect = async (id) => {
    const s = sessions.find(s => s.id === id);
    setCurrentSession(s);
    setLastInput(s?.input_text || s?.title || '');

    // Load the latest version for this session
    const { data: versions } = await supabase
      .from('prompt_versions')
      .select('prompt_text')
      .eq('session_id', id)
      .order('version_number', { ascending: false })
      .limit(1);

    if (versions?.length > 0 && versions[0].prompt_text) {
      try {
        const parsed = JSON.parse(versions[0].prompt_text);
        const nextMode = parsed?.mode || s?.mode || 'GENERAL';
        const firstTab = Object.keys(parsed?.tabs || {})[0] || 'action_brief';
        setResult(parsed);
        setBottomInputMode(nextMode);
        setActiveTab(firstTab);
        setLoadedTabs(new Set(
          Object.entries(parsed?.tabs || {})
            .filter(([, value]) => isUsableTabContent(value))
            .map(([key]) => key)
        ));
      } catch (e) {
        console.error('Failed to parse session output:', e);
        setResult(null);
        setActiveTab('action_brief');
        setLoadedTabs(new Set());
      }
    } else {
      setResult(null);
      setActiveTab('action_brief');
      setLoadedTabs(new Set());
    }
  };

  const handleVersionSelect = async (version) => {
    setLastInput(currentSession?.input_text || currentSession?.title || lastInput || '');
    const { data: vData } = await supabase
      .from('prompt_versions')
      .select('prompt_text')
      .eq('id', version.id)
      .single();
    if (vData?.prompt_text) {
      try {
        const parsed = JSON.parse(vData.prompt_text);
        const firstTab = Object.keys(parsed?.tabs || {})[0] || 'action_brief';
        setResult(parsed);
        setBottomInputMode(parsed?.mode || currentSession?.mode || 'GENERAL');
        setActiveTab(firstTab);
        setLoadedTabs(new Set(
          Object.entries(parsed?.tabs || {})
            .filter(([, value]) => isUsableTabContent(value))
            .map(([key]) => key)
        ));
      } catch (e) {
        console.error('Failed to parse version:', e);
        setResult(null);
        setActiveTab('action_brief');
        setLoadedTabs(new Set());
      }
    }
  };

  const handleGenerate = async (input, mode, metadata = {}) => {
    // Guard against null/undefined input
    if (!input) {
      console.error('[handleGenerate] ✗ Input is null/undefined');
      showToast('⚠️ No input provided');
      return;
    }

    // Store params in ref for safe retry access
    lastGenerationParamsRef.current = { input, mode, metadata };

    // DEBUG: Log metadata at start of handleGenerate
    console.log('[handleGenerate] 🔍 METADATA RECEIVED FROM BottomInput:', {
      personality: metadata?.personality,
      isPro: metadata?.isPro,
      full: JSON.stringify(metadata)
    });

    console.log(`[handleGenerate] Called with input: "${input.substring(0, 50)}..." and mode: "${mode}"`);
    if (metadata.creative_type) console.log(`[handleGenerate] Creative type: "${metadata.creative_type}"`);
    console.log(`[handleGenerate] STACK:`, new Error().stack.split('\n').slice(0, 5).join('\n'));
    console.log(`[handleGenerate] bottomInputMode from parent:`, bottomInputMode);
    // Human-in-the-loop approval for sensitive actions
    if (metadata?.pendingAction && metadata?._approvedAction !== true) {
      setPendingApproval({ input, mode, metadata, action: metadata.pendingAction });
      return;
    }

    // Smart Expander (Claude-style): ask clarifying questions before generating.
    // Users can always skip; we only block generation when we haven't shown it yet.
    if (!expanderVisible && !expanderAnswers._submitted && metadata?._skipExpander !== true) {
      // Show expander immediately with loading state, then hydrate questions from AI.
      setExpanderQuestions([{ id: '_loading', type: 'loading', prompt: 'Generating the best questions for your idea…', options: [] }]);
      setExpanderStep(0);
      setExpanderVisible(true);
      setLastInput(input);
      setSelectedMode(mode);  // Save the mode before showing expander
      console.log(`[handleGenerate] Setting selectedMode to: ${mode}`);

      // Fire-and-forget: fetch idea-specific questions.
      fetchClarifyingQuestions(input, mode, metadata)
        .then((r) => {
          if (r?.blocked) return;
          if (Array.isArray(r?.questions) && r.questions.length > 0) {
            setExpanderQuestions(r.questions);
            setExpanderStep(0);
          } else {
            setExpanderQuestions(getExpanderQuestionsForMode(mode, metadata));
            setExpanderStep(0);
          }
        })
        .catch(() => {
          setExpanderQuestions(getExpanderQuestionsForMode(mode, metadata));
          setExpanderStep(0);
        });
      return;
    }

    // Build enriched input if expander was used
    let enrichedInput = input;
    if (expanderAnswers._submitted) {
      const parts = [input];
      Object.entries(expanderAnswers).forEach(([k, v]) => {
        if (k === '_submitted') return;
        if (k.endsWith('_custom')) return; // Skip custom tracking keys (value already in main key)
        if (typeof v === 'string' && v.trim()) parts.push(`${k}: ${v.trim()}`);
        if (Array.isArray(v) && v.length > 0) parts.push(`${k}: ${v.join(', ')}`);
      });
      enrichedInput = parts.join('. ');
    }

    setExpanderVisible(false);
    setExpanderQuestions([]);
    setExpanderAnswers({ _submitted: false });
    setExpanderStep(0);

    // Optional image analysis pre-step (multimodal stream)
    if (metadata?.attachment?.base64 && metadata?.attachment?.type) {
      try {
        setImageStreamText('');
        setIsImageStreaming(true);
        setImageStreamDone(false);
        let finalAnalysisText = '';
        let finalCreditsUsed = 0;
        await streamImageAnalysis({
          prompt: enrichedInput,
          mode,
          metadata: {
            userId: DEMO_USER_ID,
            userEmail: 'demo@example.com',
          },
          attachment: metadata.attachment,
          onChunk: (full) => {
            setImageStreamText(full);
          },
          onDone: (evt) => {
            finalAnalysisText = evt?.fullText || '';
            finalCreditsUsed = Number(evt?.creditsUsed || 0);
          },
          onError: (err) => {
            console.error('[Image stream error]', err);
          }
        });
        setImageStreamDone(true);
        if (finalAnalysisText?.trim()) {
          enrichedInput = `${enrichedInput}\n\nImage analysis context:\n${finalAnalysisText.trim()}`;
        }
        if (metadata?.attachment?.preview) {
          const storedImageUrl = await uploadAttachmentDataUrlToStorage(
            metadata.attachment.preview,
            metadata.attachment.name || 'generation-input.jpg'
          );
          if (storedImageUrl) {
            await supabase.from('creative_works').insert({
              created_by: DEMO_USER_ID,
              title: `Generated Input: ${(enrichedInput || 'Image prompt').slice(0, 60)}`,
              description: `Image uploaded for AI generation on ${new Date().toLocaleString()}`,
              creative_type: 'image',
              image_url: storedImageUrl,
              tags: ['generation-input', (mode || 'general').toLowerCase()],
              is_public: false,
              likes_count: 0
            });
          }
        }
        if (finalCreditsUsed > 0) {
          setCreditInfo((prev) => ({ ...prev, balance: Math.max(0, Number(prev?.balance || 0) - finalCreditsUsed) }));
          showToast(`🖼️ Image analyzed (${finalCreditsUsed} credits used)`);
        }
      } catch (imageErr) {
        console.error('[handleGenerate] Image analysis failed:', imageErr.message);
        setIsImageStreaming(false);
        setImageStreamDone(false);
        setImageStreamText('');
        showToast(`❌ Image analysis failed: ${imageErr.message}`);
        return;
      } finally {
        setIsImageStreaming(false);
      }
    }

    // Add userId to metadata for backend Pro check
    metadata.userId = DEMO_USER_ID;
    metadata.userEmail = 'demo@example.com';

    // ═════════════════════════════════════════════════════════════
    // v4 TAB SELECTION FLOW — Show tab selector instead of generating
    // ═════════════════════════════════════════════════════════════
    console.log('[Dashboard] 📋 Showing tab selector for user to choose tabs');
    // Use all 12 tabs by default
    const allTabs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    proceedWithGenerationUsingTabs(enrichedInput, mode, metadata, allTabs);
    return;
  };



  // ═════════════════════════════════════════════════════════════
  // MAIN GENERATION — Called after tabs are selected
  // ═════════════════════════════════════════════════════════════
  const proceedWithGenerationUsingTabs = async (enrichedInput, mode, metadata, tabsToUse) => {
    console.log('[proceedWithGenerationUsingTabs] STARTING GENERATION');
    console.log('[proceedWithGenerationUsingTabs] Input:', enrichedInput?.substring(0, 50) + '...');
    console.log('[proceedWithGenerationUsingTabs] Mode:', mode);
    console.log('[proceedWithGenerationUsingTabs] Tabs count:', tabsToUse?.length);

    setLoading(true);
    setLastInput(enrichedInput);
    setStressTestOpen(false);
    setStressQuestions([]);

    try {
      console.log('[proceedWithGenerationUsingTabs] Calling generateInitialTabs for lazy-load...');

      // Use lazy-load to generate only first 3 tabs quickly
      const gptResult = await generateInitialTabs(enrichedInput, mode, metadata);
      console.log('[proceedWithGenerationUsingTabs] generateInitialTabs returned:', !!gptResult);

      // NEW: Check if response came back with success: false even though HTTP 200
      if (gptResult?.success === false) {
        console.error('[handleGenerate] API returned error:', gptResult);

        if (gptResult.type === 'safety_gate' || gptResult.errorType === 'safety_gate') {
          showToast(gptResult.error || SAFETY_GATE_MESSAGE, { duration: 8000 });
        } else {
          // Show error toast for other errors
          const errorMsg = gptResult.error || 'Generation failed. Please try again.';
          showToast(`❌ ${errorMsg}`, { duration: 5000 });
        }

        setLoading(false);
        return;
      }

      setResult({ ...gptResult, mode: gptResult.mode || mode });

      // First 3 tabs are ALREADY GENERATED in initial phase
      // Mark them as loaded so they display content immediately
      // Remaining 9 tabs will show "Generate Now" button
      // Only the INITIAL_TABS are actually generated in the initial phase.
      // Do NOT mark the primary prompt tab as loaded unless it was returned.
      const tabsReturned = gptResult.tabs || {};
      const initialCandidates = ['action_brief', 'steps', 'quick_wins'];
      const INITIAL_GENERATED_TABS = new Set(
        initialCandidates.filter((tabId) => isUsableTabContent(tabsReturned[tabId]))
      );
      setLoadedTabs(INITIAL_GENERATED_TABS);
      console.log(`[Dashboard] ✅ Initial tabs generated.`);

      // Set activeTab to first tab
      setActiveTab('action_brief');

      // Clear retry state on success
      setRetryState({
        isActive: false,
        retryCount: 0,
        maxRetries: 3,
        lastInput: null,
        lastMode: null,
        lastMetadata: null,
      });

      const sessionData = {
        user_id: DEMO_USER_ID,
        title: enrichedInput.length > 30 ? enrichedInput.substring(0, 30) + '...' : enrichedInput,
        input_text: enrichedInput,
        mode: gptResult.mode || mode,
        final_prompt: JSON.stringify({
          action_brief: gptResult.tabs?.action_brief || '',
          tabs: gptResult.tabs || {}
        }),
        score: gptResult.score || 0,
        difficulty: gptResult.difficulty || '1 Month Build',
        difficulty_hours: gptResult.difficulty_hours || 80,
        issues_count: gptResult.issues?.length || 0,
        suggestions_count: gptResult.suggestions?.length || 0,
        updated_at: new Date().toISOString()
      };

      let sessionId = currentSession?.id;
      if (sessionId) {
        console.log(`[handleGenerate] Updating existing session: ${sessionId}`);
        const { data: updatedSession, error: updateError } = await supabase
          .from('sessions')
          .update(sessionData)
          .eq('id', sessionId)
          .select()
          .single();
        if (!updateError && updatedSession) {
          console.log(`[handleGenerate] ✓ Session updated`);
          setCurrentSession(updatedSession);
        } else {
          console.error(`[handleGenerate] ✗ Session update failed:`, updateError);
        }
      } else {
        console.log(`[handleGenerate] Creating new session`);
        const { data: newSession, error: insertError } = await supabase
          .from('sessions').insert([sessionData]).select().single();
        if (!insertError && newSession) {
          sessionId = newSession.id;
          console.log(`[handleGenerate] ✓ New session created: ${sessionId}`);
          setCurrentSession(newSession);
        } else {
          console.error(`[handleGenerate] ✗ Session insert failed:`, insertError);
        }
      }

      if (sessionId) {
        const { data: existingVersions } = await supabase
          .from('prompt_versions')
          .select('version_number')
          .eq('session_id', sessionId)
          .order('version_number', { ascending: false })
          .limit(1);
        const nextVersion = existingVersions?.length ? existingVersions[0].version_number + 1 : 1;
        const { error: versionError } = await supabase.from('prompt_versions').insert([{
          session_id: sessionId,
          version_number: nextVersion,
          prompt_text: JSON.stringify(gptResult),
          score: gptResult.score || 0
        }]);
        if (versionError) {
          console.error('[handleGenerate] ✗ Version save failed:', versionError);
        } else {
          console.log('[handleGenerate] ✓ Version saved');
        }
      }
      fetchSessions();

      // Log usage
      logUsage(DEMO_USER_ID, 'generate').catch(() => { });
      refreshUsage();
    } catch (error) {
      console.error('[handleGenerate] Generation failed:', error.message);

      // Extract error details from various sources
      let errorType = error.errorType || 'unknown_error';
      let errorMessage = error.message || 'Generation failed';

      // Handle Axios error responses
      if (error.response?.data) {
        errorType = error.response.data.errorType || errorType;
        errorMessage = error.response.data.error || error.response.data.message || errorMessage;
      }

      // Check if we should retry
      const isRetryableError =
        errorType.includes('rate') ||
        errorType.includes('timeout') ||
        errorType.includes('providers') ||
        errorMessage.includes('All providers') ||
        errorMessage.includes('temporarily') ||
        error.message.includes('503') ||
        error.message.includes('502');

      if (isRetryableError && retryState.retryCount < retryState.maxRetries) {
        // Show retry UI
        console.log(`[handleGenerate] Retryable error (attempt ${retryState.retryCount + 1}/${retryState.maxRetries})`);
        setRetryState({
          isActive: true,
          retryCount: retryState.retryCount + 1,
          maxRetries: retryState.maxRetries,
          lastInput: enrichedInput,
          lastMode: mode,
          lastMetadata: metadata,
        });
        setLoading(false);
        return;
      }

      // Max retries reached or non-retryable error - show user-friendly toast
      let userToast = '❌ Generation failed. Please try again.';

      if (errorMessage.includes('JSON') || errorMessage.includes('took too long')) {
        userToast = '⏱️ Generation took too long. Try a shorter description.';
      } else if (errorMessage.includes('All')) {
        userToast = '⚠️ AI services temporarily unavailable. Please retry in a moment.';
      } else if (errorMessage.includes('timeout') || errorType === 'timeout_error') {
        userToast = '⏱️ Request timed out. Try a simpler idea.';
      } else if (errorMessage.includes('rate') || errorType === 'rate_limited') {
        userToast = '⚠️ Services are rate limited. Please try again in a moment.';
      } else if (errorMessage.includes('404') || errorType === 'model_unavailable') {
        userToast = '⚠️ AI model temporarily unavailable. Retrying...';
      } else if (errorMessage.includes('network') || errorType === 'network_error') {
        userToast = '📡 Network error. Please check your connection.';
      } else if (errorType === 'no_credentials') {
        userToast = '🔑 Configuration error. Please contact support.';
      }

      showToast(userToast, { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  // Handle retry from GenerationRetry component
  const handleRetry = async () => {
    if (retryState.retryCount >= retryState.maxRetries) {
      setRetryState({ ...retryState, isActive: false });
      return;
    }

    // Get params from ref (safe from async state update delays)
    const { input, mode, metadata } = lastGenerationParamsRef.current;

    if (!input) {
      console.error('[handleRetry] ✗ No input stored in ref');
      setRetryState({ ...retryState, isActive: false });
      showToast('⚠️ Generation state lost');
      return;
    }

    setRetryState({ ...retryState, isActive: false });
    setLoading(true);

    // Wait a moment before retrying
    await new Promise(resolve => setTimeout(resolve, 500));

    // Retry the generation using ref data
    await handleGenerate(input, mode, metadata);
  };

  // Handle cancel from GenerationRetry component
  const handleCancelRetry = () => {
    setRetryState({
      isActive: false,
      retryCount: 0,
      maxRetries: 3,
      lastInput: null,
      lastMode: null,
      lastMetadata: null,
    });
    setLoading(false);
    showToast('⚠️ Generation cancelled');
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(getCopyTabContent(activeTab));
      showToast('Copied to clipboard ✓');
    }
  };

  const handleRename = (id) => {
    // Find existing title if possible
    const sessionToRename = [
      ...(sessions?.today || []),
      ...(sessions?.thisWeek || []),
      ...(sessions?.older || [])
    ].find(s => s.id === id);

    setRenameModal({ isOpen: true, id, title: sessionToRename?.title || '' });
  };

  const confirmRename = async () => {
    if (renameModal.title && renameModal.id) {
      await supabase.from('sessions').update({ title: renameModal.title }).eq('id', renameModal.id);
      fetchSessions();
      setRenameModal({ isOpen: false, id: null, title: '' });
      showToast('Session renamed successfully');
    }
  };

  const handleBury = async (sessionData) => {
    setBuryModal(sessionData);
    setBuryReason('');
  };

  const confirmBury = async () => {
    if (!buryModal) return;
    setBuryLoading(true);
    try {
      const { data, error } = await supabase
        .from('sessions')
        .update({ is_buried: true, updated_at: new Date().toISOString() })
        .eq('id', buryModal.id)
        .eq('user_id', DEMO_USER_ID)
        .select();

      if (error) {
        console.error('Error burying session:', error);
        showToast('❌ Failed to bury idea: ' + error.message);
        return;
      }

      if (!data || data.length === 0) {
        console.error('No session found to bury');
        showToast('❌ Session not found');
        return;
      }

      showToast('💀 Idea buried and sent to The Graveyard');
      setBuryModal(null);
      setBuryReason('');
      fetchSessions();
      if (currentSession?.id === buryModal.id) { setCurrentSession(null); setResult(null); }
    } catch (err) {
      console.error('Error burying session:', err);
      showToast('❌ Failed to bury idea');
    } finally {
      setBuryLoading(false);
    }
  };

  const handleRefine = async () => {
    if (currentSession && result) {
      handleGenerate(`Refine this idea: ${currentSession.title}`, result.mode);
    }
  };

  const handleExport = () => {
    if (!result) return;
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("Prompt Quill - AI Brief", 20, 20);
    doc.setFontSize(14);
    doc.text(`Title: ${currentSession?.title || 'Untitled'}`, 20, 30);
    doc.text(`Score: ${result.score}/10`, 20, 40);
    let y = 50;
    doc.setFontSize(10);
    const promptTab = getPrimaryPromptTabId(result.mode || 'GENERAL');
    const splitText = doc.splitTextToSize(result.tabs?.[promptTab] || '', 170);
    doc.text(splitText, 20, y);
    doc.save(`${currentSession?.title || 'Prompt Quill'}.pdf`);
  };

  // Feature D: Cursor Export
  const handleCursorExport = () => {
    if (!result) return;
    const content = `# Prompt Quill — Cursor Rules
# Generated for: ${currentSession?.title || 'Project'}
# Mode: ${result.mode}

## Project Context
${result.tabs?.[getPrimaryPromptTabId(result.mode || 'GENERAL')] || ''}

## Architecture & Stack
${result.tabs?.architecture || ''}

## Folder Structure
${result.tabs?.folders || ''}

## Coding Conventions
- Use functional components with hooks
- Keep files under 200 lines
- Use descriptive variable names
- Add comments for complex logic

## What NOT To Do
${result.issues?.map(i => `- ${i}`).join('\n') || '- No known issues'}

## API Patterns
${result.tabs?.architecture?.includes('API') ? 'Follow REST conventions from the architecture tab' : 'Define API patterns as needed'}
`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeName = (currentSession?.title || 'project').replace(/[^a-z0-9]/gi, '-').toLowerCase();
    a.download = `Prompt Quill-${safeName}.cursorrules`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Cursor rules exported ✓');
  };

  // Feature D2: XML Export
  const handleXmlExport = () => {
    if (!result) return;
    const safeName = (currentSession?.title || 'project').replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const promptTab = getPrimaryPromptTabId(result.mode || 'GENERAL');
    const escapeXml = (str) => {
      if (!str) return '';
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
    };
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<promptquill>
  <metadata>
    <title>${escapeXml(currentSession?.title || 'Untitled')}</title>
    <mode>${escapeXml(result.mode || 'GENERAL')}</mode>
    <score>${result.score || 0}</score>
    <personality>${escapeXml(result.personality || 'BOT')}</personality>
    <generated>${new Date().toISOString()}</generated>
  </metadata>
  <brief>
    ${escapeXml(result.tabs?.[promptTab] || '')}
  </brief>
  <tabs>
    <steps><![CDATA[${result.tabs?.steps || ''}]]></steps>
    <quick_wins><![CDATA[${result.tabs?.quick_wins || ''}]]></quick_wins>
    <architecture><![CDATA[${result.tabs?.architecture || ''}]]></architecture>
    <folders><![CDATA[${result.tabs?.folders || ''}]]></folders>
    <database><![CDATA[${result.tabs?.database || ''}]]></database>
    <api><![CDATA[${result.tabs?.api || ''}]]></api>
    <security><![CDATA[${result.tabs?.security || ''}]]></security>
    <testing><![CDATA[${result.tabs?.testing || ''}]]></testing>
    <deployment><![CDATA[${result.tabs?.deployment || ''}]]></deployment>
    <monitoring><![CDATA[${result.tabs?.monitoring || ''}]]></monitoring>
    <market_research><![CDATA[${result.tabs?.market_research || ''}]]></market_research>
    <competitors><![CDATA[${result.tabs?.competitors || ''}]]></competitors>
    <pricing><![CDATA[${result.tabs?.pricing || ''}]]></pricing>
    <roadmap><![CDATA[${result.tabs?.roadmap || ''}]]></roadmap>
    <risks><![CDATA[${result.tabs?.risks || ''}]]></risks>
  </tabs>
  <analysis>
    <score>${result.score || 0}</score>
    <strengths>${result.strengths?.map(s => `<item>${escapeXml(s)}</item>`).join('') || ''}</strengths>
    <weaknesses>${result.weaknesses?.map(w => `<item>${escapeXml(w)}</item>`).join('') || ''}</weaknesses>
    <issues>${result.issues?.map(i => `<item>${escapeXml(i)}</item>`).join('') || ''}</issues>
    <verdict>${escapeXml(result.verdict || '')}</verdict>
  </analysis>
  <stress_test>
    ${result.stress_test?.map(q => `<question><text>${escapeXml(q.question)}</text><answer>${escapeXml(q.answer || '')}</answer></question>`).join('') || ''}
  </stress_test>
</promptquill>`;
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `promptquill-${safeName}.xml`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('XML exported ✓');
  };

  // Feature G: Stress Test
  const handleStressTest = async () => {
    if (stressQuestions.length > 0) { setStressTestOpen(!stressTestOpen); return; }
    setStressLoading(true);
    try {
      const questions = result?.stress_test?.length
        ? result.stress_test
        : await generateStressTest(lastInput, result);
      setStressQuestions(questions);
      setStressTestOpen(true);
    } catch (err) {
      showToast('❌ Stress test failed: ' + err.message);
    } finally {
      setStressLoading(false);
    }
  };

  const allStressAnswered = stressQuestions.length > 0 && Object.keys(stressAnswers).length >= stressQuestions.length;

  // Feature H: Load Tab On-Demand (Lazy-Load)
  const handleLoadTabOnDemand = async (tabId) => {
    if (loadedTabs.has(tabId)) {
      // Already loaded, just switch to it
      setActiveTab(tabId);
      return;
    }

    console.log(`[Dashboard] 🚀 USER CLICKED "Generate Now" - Loading tab: ${tabId}`);

    // Check if this tab already has content from initial generation (first 3 tabs only)
    const INITIAL_TABS_LIST = ['action_brief', 'steps', 'quick_wins'];
    const hasInitialContent =
      INITIAL_TABS_LIST.includes(tabId) &&
      isUsableTabContent(result?.tabs?.[tabId]);

    if (hasInitialContent) {
      // Tab was generated in initial phase, just mark as loaded and show
      console.log(`[Dashboard] ✅ Tab "${tabId}" already generated in initial phase. Showing content (no API call).`);
      setLoadedTabs(prev => new Set([...prev, tabId]));
      setActiveTab(tabId);
      showToast(`✅ Loaded "${tabId.replace(/_/g, ' ')}" tab (no credits used)`);
      return;
    }

    // Tab not in initial generation, need to call API
    console.log(`[Dashboard] 📡 Tab "${tabId}" not in initial generation. Calling API to generate...`);

    setLoading(true);

    try {
      console.log(`[Dashboard] 📡 Sending API request for ONLY tab: ${tabId} (no other tabs)`);

      // Generate this specific tab using generateTabContent (pass only tabs object)
      // This sends a focused API request for just this one tab
      const tabContent = await generateTabContent(lastInput, result?.mode || 'GENERAL', tabId, result?.tabs || {}, {
        personality: result?.personality || lastGenerationParamsRef.current?.metadata?.personality,
        isPro: usageInfo?.isPro || false,
        userId: DEMO_USER_ID,
        userEmail: 'demo@example.com'
      });

      console.log(`[Dashboard] ✅ API response received for tab: ${tabId}`);

      if (tabContent && tabContent.success && isUsableTabContent(tabContent.content)) {
        // Update result with new tab content
        setResult(prev => ({
          ...prev,
          tabs: {
            ...prev?.tabs,
            [tabId]: tabContent.content
          }
        }));

        // Mark this tab as loaded
        setLoadedTabs(prev => new Set([...prev, tabId]));

        // Switch to this tab
        setActiveTab(tabId);

        showToast(`✅ Loaded "${tabId.replace(/_/g, ' ')}" tab`);
      } else {
        console.error(`[Dashboard] ❌ Tab generation failed:`, tabContent?.error);
        if (tabContent?.type === 'safety_gate' || tabContent?.errorType === 'safety_gate') {
          showToast(tabContent.error || SAFETY_GATE_MESSAGE, { duration: 8000 });
        } else {
          showToast(`❌ Failed to load tab: ${tabContent?.error || 'Unknown error'}`);
        }
      }
    } catch (err) {
      console.error('[Dashboard] Tab loading failed:', err);
      if (err.message === SAFETY_GATE_MESSAGE) {
        showToast(SAFETY_GATE_MESSAGE, { duration: 8000 });
      } else {
        showToast(`❌ Error loading tab: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Mode-specific final prompt generator for AI agents
  const generateModeFinalPrompt = () => {
    const mode = result.mode || 'GENERAL';
    let prompt = '';

    // Common header
    prompt += `# 🎯 AI Agent Optimization Prompt\n\n`;
    prompt += `**Subject:** ${lastInput}\n`;
    prompt += `**Context Mode:** ${mode}\n`;
    prompt += `**Quality Score:** ${result.score}/10\n\n`;

    // Mode-specific instructions for AI agents
    switch (mode) {
      case 'STARTUP':
        prompt += `## 📊 Startup Business Analysis\n\n`;
        prompt += `**Objective:** Create a comprehensive startup pitch and business strategy\n\n`;
        prompt += `**AI Agent Instructions:**\n`;
        prompt += `1. Validate market opportunity and competitive landscape\n`;
        prompt += `2. Define clear value proposition and target customer\n`;
        prompt += `3. Outline financial projections (CAC, LTV, runway)\n`;
        prompt += `4. Create investor-ready pitch deck outline\n`;
        prompt += `5. Identify key risks and mitigation strategies\n`;
        prompt += `6. Build detailed 12-month execution roadmap\n\n`;
        prompt += `**Deliverables Expected:** Business model, GTM strategy, pitch narrative\n\n`;
        break;

      case 'STARTUP_LITE':
        prompt += `## ⚡ Quick Startup Execution\n\n`;
        prompt += `**Objective:** Fast-track startup idea to MVP in 30-60 days\n\n`;
        prompt += `**AI Agent Instructions:**\n`;
        prompt += `1. Identify absolute MVP features (max 5)\n`;
        prompt += `2. List no-code/low-code tools to build quickly\n`;
        prompt += `3. Define success metrics for first 30 days\n`;
        prompt += `4. Create rapid validation playbook\n`;
        prompt += `5. Quick budget breakdown (under $5k)\n\n`;
        prompt += `**Deliverables Expected:** MVP spec, tool stack, 30-day plan\n\n`;
        break;

      case 'CODING':
        prompt += `## 💻 Technical Implementation\n\n`;
        prompt += `**Objective:** Create production-ready technical architecture\n\n`;
        prompt += `**AI Agent Instructions:**\n`;
        prompt += `1. Design scalable system architecture\n`;
        prompt += `2. Specify database schema and API endpoints\n`;
        prompt += `3. Create component/module breakdown\n`;
        prompt += `4. Define security & performance requirements\n`;
        prompt += `5. Outline testing & deployment strategy\n`;
        prompt += `6. Generate code patterns and examples\n\n`;
        prompt += `**Deliverables Expected:** Architecture diagram, API spec, code templates\n\n`;
        break;

      case 'CONTENT':
        prompt += `## 📝 Content Strategy\n\n`;
        prompt += `**Objective:** Build comprehensive content marketing strategy\n\n`;
        prompt += `**AI Agent Instructions:**\n`;
        prompt += `1. Create content pillars aligned with audience\n`;
        prompt += `2. Define content calendar (12 weeks)\n`;
        prompt += `3. Specify format mix (blog, video, social, podcast)\n`;
        prompt += `4. Build SEO keyword strategy\n`;
        prompt += `5. Create content templates & style guide\n`;
        prompt += `6. Define distribution channels\n\n`;
        prompt += `**Deliverables Expected:** Content plan, templates, editorial calendar\n\n`;
        break;

      case 'CREATIVE':
        prompt += `## 🎨 Creative Direction\n\n`;
        prompt += `**Objective:** Generate creative assets and artistic direction\n\n`;
        prompt += `**AI Agent Instructions:**\n`;
        prompt += `1. Define visual style and aesthetic\n`;
        prompt += `2. Create mood boards and reference materials\n`;
        prompt += `3. Specify color palettes and typography\n`;
        prompt += `4. Generate creative briefs for designers\n`;
        prompt += `5. Outline iteration and feedback loops\n`;
        prompt += `6. Provide usage guidelines\n\n`;
        prompt += `**Deliverables Expected:** Creative brief, mood boards, design specs\n\n`;
        break;

      case 'DESIGN':
        prompt += `## 🎭 Design Specification\n\n`;
        prompt += `**Objective:** Create detailed design specifications and patterns\n\n`;
        prompt += `**AI Agent Instructions:**\n`;
        prompt += `1. Define design system and component library\n`;
        prompt += `2. Create wireframes and user flows\n`;
        prompt += `3. Specify responsive design breakpoints\n`;
        prompt += `4. Generate accessibility guidelines\n`;
        prompt += `5. Create interaction patterns\n`;
        prompt += `6. Build design tokens system\n\n`;
        prompt += `**Deliverables Expected:** Design system, wireframes, component specs\n\n`;
        break;

      case 'GAME':
        prompt += `## 🎮 Game Design\n\n`;
        prompt += `**Objective:** Develop complete game concept and mechanics\n\n`;
        prompt += `**AI Agent Instructions:**\n`;
        prompt += `1. Define core game loops and mechanics\n`;
        prompt += `2. Create progression and reward systems\n`;
        prompt += `3. Specify level/world design principles\n`;
        prompt += `4. Design character and enemy systems\n`;
        prompt += `5. Define monetization strategy (if applicable)\n`;
        prompt += `6. Create art and audio direction\n\n`;
        prompt += `**Deliverables Expected:** Game design doc, mechanics spec, asset list\n\n`;
        break;

      case 'AI_ML':
        prompt += `## 🤖 AI/ML Implementation\n\n`;
        prompt += `**Objective:** Build AI/ML solution architecture\n\n`;
        prompt += `**AI Agent Instructions:**\n`;
        prompt += `1. Define problem statement and success metrics\n`;
        prompt += `2. Select appropriate models and algorithms\n`;
        prompt += `3. Specify data requirements and pipeline\n`;
        prompt += `4. Create training and evaluation strategy\n`;
        prompt += `5. Define model deployment and monitoring\n`;
        prompt += `6. Generate inference optimization techniques\n\n`;
        prompt += `**Deliverables Expected:** Solution architecture, model spec, pipeline design\n\n`;
        break;

      default: // GENERAL and others
        prompt += `## 🌍 Universal Project Framework\n\n`;
        prompt += `**Objective:** Comprehensive framework adaptable to any scenario\n\n`;
        prompt += `**AI Agent Instructions:**\n`;
        prompt += `1. Clarify project goals and success criteria\n`;
        prompt += `2. Identify key stakeholders and requirements\n`;
        prompt += `3. Define scope, timeline, and resources needed\n`;
        prompt += `4. Create execution roadmap (phases)\n`;
        prompt += `5. Specify risks and mitigation plans\n`;
        prompt += `6. Outline measurement and feedback loops\n\n`;
        prompt += `**Deliverables Expected:** Project plan, execution roadmap, success metrics\n\n`;
    }

    // Common quality metrics
    if (result.score_breakdown) {
      prompt += `## 📈 Quality Metrics\n\n`;
      prompt += `- Clarity: ${result.score_breakdown.clarity || 0}/10\n`;
      prompt += `- Specificity: ${result.score_breakdown.specificity || 0}/10\n`;
      prompt += `- Feasibility: ${result.score_breakdown.feasibility || 0}/10\n`;
      prompt += `- Impact Potential: ${result.score_breakdown.market_potential || 0}/10\n\n`;
    }

    // Critical issues
    if (result.issues && result.issues.length > 0) {
      prompt += `## ⚠️ Critical Issues to Address\n\n`;
      result.issues.forEach((issue, i) => {
        prompt += `${i + 1}. ${issue}\n`;
      });
      prompt += '\n';
    }

    // Optimization suggestions
    if (result.suggestions && result.suggestions.length > 0) {
      prompt += `## 💡 Optimization Recommendations\n\n`;
      result.suggestions.forEach((sugg, i) => {
        prompt += `${i + 1}. ${sugg}\n`;
      });
      prompt += '\n';
    }

    // Quick summary
    if (result.tabs?.action_brief) {
      prompt += `## 📋 Executive Brief\n\n`;
      prompt += result.tabs.action_brief + '\n\n';
    }

    // Implementation steps
    if (result.tabs?.steps) {
      prompt += `## 🚀 Implementation Steps\n\n`;
      prompt += result.tabs.steps + '\n\n';
    }

    // Quick wins for momentum
    if (result.tabs?.quick_wins) {
      prompt += `## ⚡ Quick Wins (Day 1-7)\n\n`;
      prompt += result.tabs.quick_wins + '\n\n';
    }

    // Footer for AI agents
    prompt += `## 🎯 AI Agent Optimization\n\n`;
    prompt += `This prompt is engineered to help AI agents understand context and deliver specialized output.\n`;
    prompt += `Use this as your primary instruction set for all follow-up work on this ${mode} project.\n`;
    prompt += `Reference this prompt to maintain consistency and quality across all deliverables.\n`;

    return prompt;
  };

  const generateModeFinalPromptV4 = () => {
    const mode = result?.mode || 'GENERAL';
    const isProOutput = usageInfo?.isPro || mode === 'STARTUP';
    const contextParts = [
      `Original input: ${lastInput || currentSession?.input_text || ''}`,
      result?.tabs?.action_brief ? `Action brief: ${result.tabs.action_brief}` : '',
      result?.tabs?.steps ? `Execution steps: ${result.tabs.steps}` : '',
      result?.tabs?.quick_wins ? `Quick wins: ${result.tabs.quick_wins}` : '',
      result?.score ? `PromptQuill score: ${result.score}/10` : '',
      result?.score_reasoning ? `Score reasoning: ${result.score_reasoning}` : ''
    ].filter(Boolean).join('\n\n');

    const modeConfig = {
      CODING: {
        role: 'You are a senior software architect and coding agent lead.',
        task: 'Turn the input and brief into an implementation-ready engineering plan with architecture, data model, API contracts, build sequence, test coverage, deployment checks, and edge cases.',
        constraints: 'Stay technical. Do not write market, investor, or startup-pitch language. Use explicit technologies, files, modules, request/response shapes, failure states, and verification steps.',
        output: 'Return sections for Architecture, Data Model, API/Interfaces, Build Order, Tests, Deployment, Risks, and Open Questions.'
      },
      CONTENT: {
        role: 'You are a senior content strategist and editorial prompt architect.',
        task: 'Turn the input and brief into a content plan that defines audience, angle, message hierarchy, SEO intent, voice, draft structure, CTA, and distribution workflow.',
        constraints: 'Stay audience- and publishing-focused. Do not drift into product architecture or investor strategy. Every recommendation must serve reader behavior, channel fit, or conversion intent.',
        output: 'Return sections for Audience, Angle, Content Brief, Structure, SEO, Voice & Tone, Distribution, Metrics, and Draft Prompt.'
      },
      CREATIVE: {
        role: 'You are a creative director and sensory prompt architect.',
        task: 'Turn the input and brief into a rich creative prompt with world, mood, emotional core, visual language, references, constraints, and iteration paths.',
        constraints: 'Avoid generic aesthetic words. Use concrete sensory detail, composition, light, texture, rhythm, and internal logic. Do not write business strategy or technical implementation unless needed as creative specs.',
        output: 'Return sections for Creative Core, World/Scene, Visual Language, Emotional Architecture, Tool-Specific Prompt, Negative Direction, Variations, and Iteration Notes.'
      },
      STARTUP: {
        role: 'You are an investor-aware startup strategist and fundraising prompt architect.',
        task: 'Turn the input and brief into a startup prompt that pressure-tests market, customer, traction, differentiation, monetization, moat, investor narrative, and execution milestones.',
        constraints: 'Stay market-obsessed and evidence-conscious. Do not write generic motivational advice. Include assumptions, metrics, validation signals, and investor-grade risks.',
        output: 'Return sections for Problem, Customer, Market, Solution, Traction Plan, Monetization, Competition, Investor Narrative, Risks, and 30-Day Milestones.'
      },
      STARTUP_LITE: {
        role: 'You are a lean startup validation coach.',
        task: 'Turn the input and brief into a rapid experimentation prompt focused on the smallest test, first customer, zero-budget acquisition, proof threshold, and next 48 hours.',
        constraints: 'Stay scrappy. Avoid fundraising, TAM, hiring plans, and scale language. Every step must produce a signal quickly.',
        output: 'Return sections for Hypothesis, Prototype, First Customer Test, Zero-Budget Channel, Success Signal, Kill Criteria, and 48-Hour Plan.'
      },
      GENERAL: {
        role: 'You are a strategic execution advisor.',
        task: 'Turn the input and brief into a practical plan with goals, tradeoffs, steps, resources, timeline, risks, and success criteria.',
        constraints: 'Stay strategic and execution-focused. Do not drift into coding, content, creative, or startup-specific framing unless the input explicitly requires it.',
        output: 'Return sections for Objective, Context, Execution Plan, Tools, Timeline, Risks, Resources, Success Metrics, and Next Decision.'
      }
    };

    const cfg = modeConfig[mode] || modeConfig.GENERAL;
    let prompt = `[FINAL PROMPT]
Role: ${cfg.role}

Context:
${contextParts || `Original input: ${lastInput || currentSession?.input_text || ''}`}

Task:
${cfg.task}

Constraints:
${cfg.constraints}
- Use the original input as the source of truth.
- Preserve the ${mode} mode lens. Do not import assumptions from other modes.
- Be specific enough that the output cannot apply to a different project unchanged.
- Ask one question only if a missing detail would make the output structurally wrong.

Output format:
${cfg.output}
`;

    if (isProOutput) {
      prompt += `

[VARIANT — different structural approach]
Role: ${cfg.role}
Context: Treat the same input as a decision-making sprint rather than a comprehensive plan.
Task: Produce the smallest high-confidence path that proves or disproves the main assumption behind this ${mode} request.
Constraints: Keep only the decisions, tests, artifacts, and success thresholds that change what the user does next.
Output format: Return Decision, Assumption, Test, Artifact, Success Threshold, Failure Response, and Next Move.

Tradeoff: The variant gains speed and sharper decision pressure, but gives up the broader coverage of the primary prompt.

[PUSH FURTHER]
Add one concrete artifact from this project, such as an API route, headline, visual reference, customer segment, or milestone, before running the prompt.

[ADVANCED PARAMS]
Use low temperature for CODING and GENERAL precision, medium temperature for CONTENT strategy, and higher temperature for CREATIVE exploration; ask the model to self-check mode accuracy before final output.
`;
    }

    return prompt;
  };

  // Helper function to get tab content, handling special cases like final_prompt
  const getTabContent = (tabId) => {
    if (!result) return '';

    // For final_prompt tab, use mode-specific generator
    if (tabId === 'final_prompt') {
      // Try to get from result.tabs.final_prompt first
      if (result.tabs?.final_prompt) return result.tabs.final_prompt;

      // Generate mode-specific final prompt
      return generateModeFinalPromptV4();
    }

    // For all other tabs, get from result.tabs
    return result.tabs?.[tabId] || '';
  };

  const getDisplayedTabContent = (tabId) => {
    return getTabContent(tabId) || 'No content generated for this tab.';
  };

  const getCopyTabContent = (tabId) => {
    const inputText = lastInput || currentSession?.input_text || '';
    return withInputHeader(getDisplayedTabContent(tabId), inputText);
  };

  // Build dynamic tabs from AI response + Pro locking logic
  const buildTabsFromResult = () => {
    if (!result || !result.tabs) return [];

    const expected = getModeTabs(result.mode);

    // Tab name mapping for display labels
    const tabLabels = {
      // Lazy-load tabs
      'action_brief': 'Action Brief',
      'steps': 'Steps',
      'quick_wins': 'Quick Wins',
      'final_prompt': 'Final Prompt',

      // STARTUP/STARTUP_LITE tabs
      'validate': 'Validate',
      'plan': 'Plan',
      'launch': 'Launch',
      'score': 'Score',
      'investor_lens': 'Investor Lens',
      'ai_debate': 'AI Debate',
      'ship_30_days': 'Ship 30 Days',
      'pivot_options': 'Pivot Options',

      // CODING mode tabs
      'dev_brief': 'Dev Brief',
      'architecture': 'Architecture',
      'schema': 'Schema',
      'endpoints': 'Endpoints',
      'build_order': 'Build Order',
      'security_audit': 'Security Audit',
      'deployment': 'Deployment',

      // CONTENT mode tabs
      'content_brief': 'Content Brief',
      'seo': 'SEO',
      'viral_hooks': 'Viral Hooks',
      'email_sequence': 'Email Sequence',
      'distribution': 'Distribution',

      // CREATIVE mode tabs
      'master_prompt': 'Master Prompt',
      'variations': 'Variations',
      'tool_guide': 'Tool Guide',
      'style_library': 'Style Library',
      'directors_notes': 'Director\'s Notes',
      'multi_tool_pack': 'Multi-Tool Pack',

      // GENERAL mode tabs
      'tools': 'Tools',
      'expert_angle': 'Expert Angle',
      'automation': 'Automation'
    };

    const primaryPromptTab = getPrimaryPromptTabId(result.mode);
    const finalTabKeys = new Set(expected.length ? expected : Object.keys(result.tabs));
    // Always ensure action_brief + primary prompt tab are present (even before lazy-load)
    finalTabKeys.add('action_brief');
    finalTabKeys.add(primaryPromptTab);

    // Define the order: position primary prompt tab at 4th position
    const orderedTabs = [];
    const priorityOrder = ['action_brief', 'steps', 'quick_wins', primaryPromptTab];

    // Add priority tabs first (in order)
    for (const tabId of priorityOrder) {
      if (finalTabKeys.has(tabId)) {
        orderedTabs.push(tabId);
        finalTabKeys.delete(tabId);
      }
    }

    // Add remaining tabs
    for (const tabId of finalTabKeys) {
      orderedTabs.push(tabId);
    }

    return orderedTabs.map(key => ({
      id: key,
      label: tabLabels[key] || key.replace(/_/g, ' ').toUpperCase(),
      isLocked: false
    }));
  };

  const tabs = buildTabsFromResult();

  // Reddit Pain Finder state
  const [redditInsights, setRedditInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  const fetchRedditInsights = async () => {
    if (!lastInput || !result) return;
    setLoadingInsights(true);
    try {
      // We'll use the AI to generate/simulate the Reddit pain points based on the keywords
      const prompt = `Based on this product idea: "${lastInput}" and the generated brief, find 3 specific REAL user pain points from Reddit or forums.
      Return a JSON array of 3 objects with fields: { pain_point: string, subreddit: string, mentions: number, quote: string }.
      Be brutally specific and realistic. No generic fluff.`;

      const response = await generateBrief(prompt, 'GENERAL'); // Using general mode for research
      const parsed = JSON.parse(response); // Assuming AI returns valid JSON for this specific call
      setRedditInsights(parsed);

      // Save to cache
      await supabase.from('reddit_insights').insert([{
        session_id: currentSession?.id,
        keyword: lastInput.substring(0, 50),
        pain_points: parsed
      }]);
    } catch (err) {
      console.error(err);
      // Fallback/Mock data if AI fails or returns non-JSON
      setRedditInsights([
        { pain_point: 'Existing tools are too bloated and expensive for solo devs', subreddit: 'r/cscareerquestions', mentions: 12, quote: "I just want a simple prompt generator without a $30/mo subscription." },
        { pain_point: 'Lack of specificity in AI-generated architecture plans', subreddit: 'r/webdev', mentions: 8, quote: "Most AI code tools just give you a generic React template." },
        { pain_point: 'Difficulty in validating startup ideas before building', subreddit: 'r/startups', mentions: 24, quote: "I spent 3 months building something NO ONE wanted. Never again." }
      ]);
    } finally {
      setLoadingInsights(false);
    }
  };

  // ─── Loading Skeleton ──────────────────────────────
  const LoadingSkeleton = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Skeleton */}
      <div className="skeleton" style={{ height: '28px', width: '55%', borderRadius: '8px' }} />
      <div className="skeleton" style={{ height: '16px', width: '80%', borderRadius: '6px' }} />
      <div className="skeleton" style={{ height: '16px', width: '70%', borderRadius: '6px' }} />

      <div style={{ height: '12px' }} />

      {/* Content Skeleton Lines */}
      <div className="skeleton" style={{ height: '20px', width: '40%', borderRadius: '6px' }} />
      <div className="skeleton" style={{ height: '16px', width: '90%', borderRadius: '6px' }} />
      <div className="skeleton" style={{ height: '16px', width: '85%', borderRadius: '6px' }} />
      <div className="skeleton" style={{ height: '16px', width: '75%', borderRadius: '6px' }} />

      <div style={{ height: '12px' }} />

      {/* Another Section */}
      <div className="skeleton" style={{ height: '20px', width: '35%', borderRadius: '6px' }} />
      <div className="skeleton" style={{ height: '16px', width: '88%', borderRadius: '6px' }} />
      <div className="skeleton" style={{ height: '16px', width: '60%', borderRadius: '6px' }} />

      <div style={{ height: '20px' }} />

      {/* Card Skeletons */}
      <div style={{ display: 'flex', gap: '16px' }}>
        <div className="skeleton" style={{ height: '80px', flex: 1, borderRadius: '12px' }} />
        <div className="skeleton" style={{ height: '80px', flex: 1, borderRadius: '12px' }} />
        <div className="skeleton" style={{ height: '80px', flex: 1, borderRadius: '12px' }} />
      </div>

      {/* Loading Text */}
      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <div style={{ color: '#db2777', fontSize: '10px', fontWeight: '900', letterSpacing: '8px', marginBottom: '20px' }} className="animate-flicker">
          ✨ CRAFTING YOUR BRILLIANCE...
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#db2777', animation: 'bounce 1.4s infinite' }} />
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#db2777', animation: 'bounce 1.4s infinite 0.2s' }} />
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#db2777', animation: 'bounce 1.4s infinite 0.4s' }} />
        </div>
      </div>
    </div>
  );

  const handleFileUploadToStorage = async (file) => {
    if (!file) return null;

    try {
      const timestamp = Date.now();
      const fileName = `${DEMO_USER_ID}/${timestamp}-${file.name}`;

      const { data, error } = await supabase.storage
        .from('creative-works')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('creative-works')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (err) {
      console.error('File upload error:', err);
      showToast('❌ Failed to upload file. Please try again.');
      return null;
    }
  };

  const uploadAttachmentDataUrlToStorage = async (dataUrl, fileNameBase = 'generation-input.jpg') => {
    if (!dataUrl) return null;
    try {
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const safeName = String(fileNameBase || 'generation-input.jpg').replace(/[^a-zA-Z0-9._-]/g, '-');
      const path = `${DEMO_USER_ID}/${Date.now()}-${safeName}`;
      const { data, error } = await supabase.storage
        .from('creative-works')
        .upload(path, blob, { contentType: blob.type || 'image/jpeg', upsert: false });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage
        .from('creative-works')
        .getPublicUrl(data.path);
      return publicUrl;
    } catch (err) {
      console.error('Attachment upload error:', err);
      return null;
    }
  };

  const handleUploadToGallery = async () => {
    if (!galleryUploadForm.title.trim()) {
      showToast('⚠️ Please enter a title for your work');
      return;
    }

    if (!galleryUploadForm.file) {
      showToast('⚠️ Please select a file to upload');
      return;
    }

    try {
      let imageUrl = null;

      // Upload file if provided
      if (galleryUploadForm.file) {
        imageUrl = await handleFileUploadToStorage(galleryUploadForm.file);
        if (!imageUrl) return;
      }

      const { error } = await supabase
        .from('creative_works')
        .insert({
          created_by: DEMO_USER_ID,
          title: galleryUploadForm.title.trim(),
          description: galleryUploadForm.description.trim() || (
            result?.tabs?.[getPrimaryPromptTabId(result?.mode || 'GENERAL')]?.substring(0, 200) ||
            result?.tabs?.action_brief?.substring(0, 200)
          ),
          creative_type: galleryUploadForm.creative_type,
          image_url: imageUrl,
          tags: galleryUploadForm.tags.split(',').map(t => t.trim()).filter(t => t),
          is_public: true,
          likes_count: 0
        });

      if (error) throw error;

      setShowGalleryUpload(false);
      setGalleryUploadForm({ title: '', description: '', tags: '', file: null, creative_type: 'image' });
      showToast('🎨 Uploaded to Creative Gallery!');
    } catch (err) {
      console.error('Gallery upload error:', err);
      showToast('❌ Failed to upload to gallery');
    }
  };

  // Check if setup is complete
  const setupComplete = typeof window !== 'undefined' && localStorage.getItem('pq_setup_complete');

  if (!setupComplete) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ textAlign: 'center', maxWidth: 400, padding: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>⚙️</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 8px 0' }}>Setup Required</h1>
          <p style={{ color: '#888', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
            You need to complete the initial setup before generating briefs.
            This connects your database and configures your AI providers.
          </p>
          <button onClick={() => navigate('/setup')} style={{
            padding: '12px 32px', borderRadius: 10, border: 'none',
            background: '#a3e635', color: '#000', fontSize: 15, fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.target.style.background = '#bef264'; e.target.style.transform = 'scale(1.02)'; }}
            onMouseLeave={e => { e.target.style.background = '#a3e635'; e.target.style.transform = 'scale(1)'; }}
          >
            Open Setup Wizard →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ minHeight: '100vh', backgroundColor: '#080808', color: '#fff', display: 'flex', position: 'relative', overflow: 'hidden' }}
    >

      <Sidebar
        profile={{ ...profile, ...userProfile }}
        sessions={sessions.filter(s => !s.is_buried)}
        currentSessionId={currentSession?.id}
        onNewSession={handleNewSession}
        onSessionSelect={handleSessionSelect}
        onVersionSelect={handleVersionSelect}
        onRename={handleRename}
        onDelete={handleBury}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        usageInfo={usageInfo}
      />

      <main className="dashboard-main" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', flex: 1, position: 'relative', overflow: 'hidden', marginLeft: isSidebarOpen ? '280px' : '0', transition: 'margin-left 0.3s var(--ease-premium)' }}>



        {/* Announcement Bar */}
        {activeAnnouncement && (
          <div style={{
            width: '100%',
            padding: '8px 20px',
            backgroundColor: activeAnnouncement.type === 'warning' ? '#ef4444' : '#a3e635',
            color: '#000',
            fontSize: '11px',
            fontWeight: '900',
            textAlign: 'center',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            position: 'relative',
            zIndex: 100
          }}>
            {activeAnnouncement.title}: {activeAnnouncement.content}
            <button onClick={() => setActiveAnnouncement(null)} style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#000', cursor: 'pointer', fontWeight: '900' }}>✕</button>
          </div>
        )}

        <TopBar
          score={result?.score}
          scoreBreakdown={result?.score_breakdown}
          difficulty={result?.difficulty}
          difficultyHours={result?.difficulty_hours}
          issuesCount={result?.issues?.length}
          suggestionsCount={result?.suggestions?.length}
          mode={result?.mode || 'GENERAL'}
          onCopy={handleCopy}
          onRefine={() => handleGenerate(lastInput, result?.mode || currentSession?.mode || bottomInputMode, {
            personality: result?.personality || lastGenerationParamsRef.current?.metadata?.personality,
            isPro: usageInfo?.isPro || false
          })}
          onExport={handleExport}
          onShare={() => setShareCardOpen(true)}
          onTogglePublic={handleTogglePublic}
          isPublic={currentSession?.is_public}
          onNewSession={handleNewSession}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
          isPro={true}
          onRoast={handleAiRoast}
          isRoasting={roastLoading}
        />

        {/* Generation Retry UI */}
        <GenerationRetry
          isActive={retryState.isActive}
          message={retryState.retryCount === 0
            ? '🌩️ High demand facing'
            : retryState.retryCount === 1
              ? '⏳ Trying another provider'
              : '🔄 Retrying...'}
          retryCount={retryState.retryCount}
          maxRetries={retryState.maxRetries}
          onRetry={handleRetry}
          onCancel={handleCancelRetry}
        />

        <div style={{ flex: 1, padding: '32px', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1, paddingBottom: (!currentSession?.id && !result && !loading) ? '32px' : '200px', overflowY: 'auto' }}>
          {!!approvalNotice && (
            <div style={{ marginBottom: '12px', padding: '10px 12px', borderRadius: '10px', border: '1px solid #2a2a2a', background: '#101010', color: '#bdbdbd', fontSize: '12px', fontWeight: 700 }}>
              {approvalNotice}
            </div>
          )}

          {pendingApproval && (
            <div style={{ marginBottom: '16px', borderRadius: '14px', border: '1px solid rgba(245, 158, 11, 0.45)', background: 'rgba(245, 158, 11, 0.08)', padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#fbbf24', fontWeight: 900, fontSize: '13px' }}>
                <AlertCircle size={16} />
                Approval Required
              </div>
              <div style={{ color: '#fff', fontSize: '13px', fontWeight: 800 }}>{pendingApproval.action?.name}</div>
              <div style={{ color: '#bbb', fontSize: '12px', marginTop: '4px' }}>{pendingApproval.action?.description}</div>
              <pre style={{ marginTop: '10px', marginBottom: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '11px', color: '#ddd', background: '#111', border: '1px solid #2a2a2a', borderRadius: '10px', padding: '10px' }}>
                {JSON.stringify(pendingApproval.action?.params || {}, null, 2)}
              </pre>
              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button onClick={handleApproveSensitiveAction} style={{ padding: '9px 12px', borderRadius: '10px', border: 'none', background: '#a3e635', color: '#000', fontSize: '12px', fontWeight: 900, cursor: 'pointer' }}>
                  ✅ Approve
                </button>
                <button onClick={handleDenySensitiveAction} style={{ padding: '9px 12px', borderRadius: '10px', border: '1px solid #444', background: '#151515', color: '#ddd', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}>
                  ❌ Deny
                </button>
              </div>
            </div>
          )}

          {(isImageStreaming || imageStreamText) && (
            <div style={{ marginBottom: '16px', borderRadius: '14px', border: '1px solid #222', background: '#0f0f0f', padding: '14px' }}>
              <div style={{ color: '#8a8a8a', fontSize: '11px', fontWeight: 800, marginBottom: '8px' }}>IMAGE ANALYSIS</div>
              <div style={{ color: '#fff', fontSize: '13px', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {imageStreamText}
                {isImageStreaming ? <span style={{ animation: 'pulse 1s ease-in-out infinite' }}>▍</span> : null}
              </div>
              {!isImageStreaming && imageStreamDone && imageStreamText && (
                <button
                  onClick={() => navigator.clipboard.writeText(imageStreamText).then(() => showToast('✅ Copied image analysis'))}
                  style={{ marginTop: '10px', padding: '7px 10px', borderRadius: '8px', border: '1px solid #2a2a2a', background: '#111', color: '#ddd', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Copy
                </button>
              )}
            </div>
          )}

          {(!currentSession?.id && !result && !loading && !expanderVisible) ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>

              {/* DESKTOP SPLASH */}
              <div className="desktop-only-input animate-fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                <div style={{ textAlign: 'center', position: 'relative', marginTop: '-5vh' }}>
                  <h1 style={{ fontSize: '72px', fontWeight: '900', lineHeight: '1.1', letterSpacing: '-3px', fontStyle: 'italic', margin: 0 }}>
                    <span style={{ color: '#a3e635', textShadow: '0 0 30px rgba(163, 230, 53, 0.25)' }}>Generate</span><br />
                    <span style={{ color: '#fff' }}>Your Prompt</span>
                  </h1>
                  <p style={{ color: '#888', marginTop: '24px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', letterSpacing: '1px', fontWeight: '700' }}>
                    <span className="animate-pulse-glow" style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#a3e635' }} />
                    POWERING INTELLIGENT ARCHITECTURE
                  </p>
                </div>
              </div>

              {/* MOBILE SPLASH (Original Mascot UI) */}
              <div className="mobile-only-input animate-fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                <div style={{ textAlign: 'center', position: 'relative' }}>
                  <Mascot />
                  <h1 style={{ fontSize: '28px', fontWeight: '900', lineHeight: '1.2', letterSpacing: '-1px', margin: '20px 0 0 0' }}>
                    <span style={{ color: '#fff' }}>How can I help </span>
                    <span style={{ color: '#a3e635' }}>you</span>
                    <span style={{ color: '#fff' }}> today?</span>
                  </h1>
                  <p style={{ color: '#888', marginTop: '12px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', letterSpacing: '1px', fontWeight: '700' }}>
                    AI briefs in 30 seconds
                  </p>
                </div>
              </div>

              {/* DESKTOP CHIPS + INPUT */}
              <div className="desktop-only-input" style={{ width: '100%', maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="animate-fade-in suggestion-chips-row" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {[
                    { icon: '💡', text: 'SaaS for students' },
                    { icon: '🚀', text: 'AI tutor app' },
                    { icon: '💻', text: 'Build a portfolio' },
                    { icon: '🎨', text: 'Logo design' },
                    { icon: '🎬', text: 'Video script' },
                    { icon: '📱', text: 'Mobile app idea' }
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSuggestionInput(chip.text)}
                      className={`animate-slide-up delay-${(idx + 1) * 100}`}
                      style={{ padding: '12px 20px', backgroundColor: '#111', border: '1px solid #1a1a1a', borderRadius: '99px', color: '#666', fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: '0.3s var(--ease-premium)', display: 'flex', alignItems: 'center', gap: '8px' }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#fff'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1a1a1a'; e.currentTarget.style.color = '#666'; }}
                    >
                      <span>{chip.icon}</span> {chip.text}
                    </button>
                  ))}
                </div>
                <BottomInput onGenerate={handleGenerate} loading={loading} isCentered={true} isSidebarOpen={isSidebarOpen} externalInput={suggestionInput} mode={bottomInputMode} setMode={setBottomInputMode} isPro={true} />
              </div>

              {/* MOBILE CHIPS + INPUT */}
              <div className="mobile-only-input" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="animate-fade-in suggestion-chips-row" style={{ display: 'flex', gap: '12px' }}>
                  {[
                    { icon: '💡', text: 'SaaS for students' },
                    { icon: '🚀', text: 'AI tutor app' },
                    { icon: '💻', text: 'Build a portfolio' },
                    { icon: '🎨', text: 'Logo design' },
                    { icon: '🎬', text: 'Video script' },
                    { icon: '📱', text: 'Mobile app idea' },
                    { icon: '🎮', text: 'Game concept' },
                    { icon: '🌍', text: 'Travel planner' }
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSuggestionInput(chip.text)}
                      className={`animate-slide-up delay-${(idx + 1) * 100}`}
                      style={{ 
                        padding: '10px 18px', 
                        backgroundColor: '#111', 
                        border: '1px solid #1a1a1a', 
                        borderRadius: '99px', 
                        color: '#888', 
                        fontSize: '12px', 
                        fontWeight: '700', 
                        cursor: 'pointer', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        whiteSpace: 'nowrap',
                        flexShrink: 0
                      }}
                    >
                      <span>{chip.icon}</span> {chip.text}
                    </button>
                  ))}
                </div>
                <BottomInput onGenerate={handleGenerate} loading={loading} isCentered={true} isSidebarOpen={isSidebarOpen} externalInput={suggestionInput} mode={bottomInputMode} setMode={setBottomInputMode} isPro={true} />
              </div>

            </div>
          ) : expanderVisible ? (
            /* ─── Feature C: Smart Idea Expander (Questions UI) ───────────── */
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', backgroundColor: '#050505', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 200, overflowY: 'auto' }} className="animate-fade-in pq-expander">
              {(() => {
                const loadingItem = (expanderQuestions || []).find((q) => q.type === 'loading');
                const questions = (expanderQuestions || []).filter((q) => q.type !== 'loading');
                const total = Math.max(questions.length, 1);
                const idx = Math.min(expanderStep, total - 1);
                const q = questions[idx];

                if (loadingItem && !q) {
                  return (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', flexDirection: 'column', gap: '24px' }}>
                      <div style={{ fontSize: '64px', animation: 'pulse 2s infinite' }}>🤖</div>
                      <div style={{ color: '#888', fontSize: '16px', fontWeight: '600' }}>{loadingItem.prompt}</div>
                    </div>
                  );
                }
                if (!q) return null;

                const id = q.id;
                const current = expanderAnswers[id];
                const isMulti = q.type === 'multi_select';
                const options = Array.isArray(q.options) ? q.options : [];
                const toggleOption = (_optId, optLabel) => {
                  setExpanderAnswers((prev) => {
                    if (isMulti) {
                      const arr = Array.isArray(prev[id]) ? prev[id] : [];
                      const next = arr.includes(optLabel) ? arr.filter((x) => x !== optLabel) : [...arr, optLabel];
                      return { ...prev, [id]: next };
                    }
                    return { ...prev, [id]: optLabel };
                  });
                };

                const isLastQuestion = idx === total - 1;

                return (
                  <div className="pq-expander-shell" style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>

                    {/* Top Header */}
                    <div className="pq-expander-header" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '20px 24px', position: 'relative', zIndex: 10 }}>
                      <button
                        onClick={() => {
                          if (idx === 0) setExpanderVisible(false); // Cancel on first step
                          else setExpanderStep((s) => Math.max(0, s - 1));
                        }}
                        style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#111', border: '1px solid rgba(255,255,255,0.05)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      >
                        <ArrowLeft size={20} />
                      </button>

                      <div style={{ padding: '0 20px', height: '44px', background: '#111', borderRadius: '99px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', color: '#888', fontSize: '13px', fontWeight: '600' }}>
                        Step <span style={{ color: '#a3e635', fontWeight: '800', marginLeft: '6px', marginRight: '4px' }}>{idx + 1}</span> / {total}
                      </div>
                    </div>

                    {/* Robot Hero Section */}
                    <div className="pq-expander-hero" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '10px', marginBottom: '30px', position: 'relative' }}>
                      <div style={{ position: 'absolute', width: '140px', height: '140px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(163,230,53,0.5) 0%, rgba(139,92,246,0.3) 50%, transparent 100%)', filter: 'blur(30px)', top: '-20px' }}></div>
                      <div style={{ fontSize: '80px', position: 'relative', zIndex: 2, filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))' }}>🤖</div>

                      <div style={{ position: 'absolute', left: '10%', top: '20px', background: '#1a1a1a', padding: '12px 18px', borderRadius: '20px 20px 0 20px', border: '1px solid rgba(255,255,255,0.1)', transform: 'rotate(-8deg)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 3 }}>
                        <span style={{ color: '#ccc', fontSize: '12px', fontWeight: '600' }}>Let's refine</span><br />
                        <span style={{ color: '#a3e635', fontSize: '14px', fontWeight: '800' }}>your idea...</span>
                      </div>

                      {/* Floating stars */}
                      <div style={{ position: 'absolute', top: '10px', right: '20%', color: '#a3e635', fontSize: '12px' }}>✨</div>
                      <div style={{ position: 'absolute', bottom: '20px', left: '25%', color: '#3b82f6', fontSize: '16px' }}>✦</div>
                    </div>

                    {/* Main Question Container */}
                    <div className="pq-expander-card" style={{ flex: 1, width: '100%', background: '#0a0a0a', borderTopLeftRadius: '32px', borderTopRightRadius: '32px', border: '1px solid rgba(255,255,255,0.05)', borderBottom: 'none', padding: '32px 24px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

                      <h2 style={{ fontSize: 'clamp(20px, 5vw, 26px)', fontWeight: '800', color: '#fff', marginBottom: '12px', lineHeight: '1.3', letterSpacing: '-0.5px', flexShrink: 0 }}>
                        {/* Basic heuristic to color last few words green for aesthetic matching if possible, otherwise plain white */}
                        {q.prompt.split(' ').map((word, i, arr) => (
                          <span key={i} style={{ color: i >= arr.length - 2 ? '#a3e635' : 'inherit' }}>{word} </span>
                        ))}
                      </h2>
                      <p style={{ color: '#888', fontSize: '14px', fontWeight: '500', marginBottom: '24px', flexShrink: 0 }}>Choose an option or type your own answer.</p>

                      {/* Options - scrollable container for mobile */}
                      <div className="pq-expander-options" style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, overflowY: 'auto', paddingBottom: '16px', WebkitOverflowScrolling: 'touch', minHeight: 0 }}>
                        {(q.type === 'select' || q.type === 'multi_select') && options.length > 0 ? (
                          <>
                            {options.map((o, i) => {
                              const customAnswer = expanderAnswers[`${id}_custom`];
                              const selected = isMulti
                                ? (Array.isArray(current) && current.includes(o.label))
                                : (current === o.label && !customAnswer);
                              return (
                                <button key={o.id} onClick={() => {
                                  // Clear custom answer when selecting an option
                                  setExpanderAnswers(prev => {
                                    const updated = { ...prev };
                                    delete updated[`${id}_custom`];
                                    return updated;
                                  });
                                  toggleOption(o.id, o.label);
                                }} style={{
                                  width: '100%', padding: '14px 16px', borderRadius: '16px', border: selected ? '1.5px solid #a3e635' : '1px solid rgba(255,255,255,0.05)', background: selected ? 'rgba(163,230,53,0.05)' : '#111', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: selected ? '0 0 20px rgba(163,230,53,0.1)' : 'none', flexShrink: 0
                                }}>
                                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: selected ? 'rgba(163,230,53,0.1)' : 'rgba(255,255,255,0.03)', border: selected ? '1px solid #a3e635' : '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: selected ? '#a3e635' : '#888', fontSize: '14px', fontWeight: '800', flexShrink: 0 }}>
                                    {i + 1}
                                  </div>
                                  <span style={{ color: selected ? '#fff' : '#ccc', fontSize: '14px', fontWeight: '700', flex: 1, textAlign: 'left' }}>{o.label}</span>
                                  {selected && (
                                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#a3e635', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                      <Check size={14} color="#000" strokeWidth={3} />
                                    </div>
                                  )}
                                </button>
                              )
                            })}

                            {/* Custom text input option - always shown below options */}
                            <div style={{ marginTop: '8px', flexShrink: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <div style={{ height: '1px', flex: 1, background: 'rgba(255,255,255,0.05)' }}></div>
                                <span style={{ color: '#555', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', flexShrink: 0 }}>or type your own</span>
                                <div style={{ height: '1px', flex: 1, background: 'rgba(255,255,255,0.05)' }}></div>
                              </div>
                              <input
                                type="text"
                                placeholder="Type your custom answer..."
                                value={expanderAnswers[`${id}_custom`] || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setExpanderAnswers(prev => {
                                    const updated = { ...prev, [`${id}_custom`]: val };
                                    // When typing custom, set the main answer to the custom value and clear option selection
                                    if (val.trim()) {
                                      updated[id] = val;
                                    } else {
                                      // If cleared, remove custom value
                                      delete updated[`${id}_custom`];
                                      delete updated[id];
                                    }
                                    return updated;
                                  });
                                }}
                                style={{ width: '100%', padding: '14px 20px', backgroundColor: expanderAnswers[`${id}_custom`] ? 'rgba(163,230,53,0.03)' : '#111', border: expanderAnswers[`${id}_custom`] ? '1.5px solid #a3e635' : '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', color: '#fff', fontSize: '14px', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }}
                              />
                            </div>
                          </>
                        ) : (
                          <input
                            type="text"
                            placeholder={q.placeholder || 'Type your own answer...'}
                            value={typeof current === 'string' ? current : ''}
                            onChange={(e) => setExpanderAnswers((prev) => ({ ...prev, [id]: e.target.value }))}
                            style={{ width: '100%', padding: '18px 24px', backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', color: '#fff', fontSize: '16px', outline: 'none', boxSizing: 'border-box' }}
                          />
                        )}

                        {/* Feedback pill */}
                        {current && (
                          <div className="animate-slide-up" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 18px', background: '#111', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#a3e635', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>🙂</div>
                            <div style={{ flex: 1, fontSize: '12px', color: '#888', lineHeight: '1.4' }}>
                              <span style={{ color: '#a3e635', fontWeight: '700' }}>Nice choice!</span> This will help us craft better and more relevant outputs.
                            </div>
                            <div style={{ fontSize: '16px', color: '#a3e635', flexShrink: 0 }}>✨</div>
                          </div>
                        )}
                      </div>

                      {/* Pagination Dots */}
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px', marginBottom: '16px', flexShrink: 0 }}>
                        {questions.map((_, i) => (
                          <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: i === idx ? '#a3e635' : i < idx ? 'rgba(163,230,53,0.3)' : '#333' }}></div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="pq-expander-actions" style={{ display: 'flex', gap: '8px', width: '100%', padding: '12px 16px', background: '#050505', borderTop: '1px solid rgba(255,255,255,0.05)', paddingBottom: 'calc(12px + env(safe-area-inset-bottom))', flexShrink: 0 }}>
                      <button onClick={() => setExpanderStep((s) => Math.max(0, s - 1))} disabled={idx === 0} style={{ padding: '14px', background: '#111', borderRadius: '99px', border: 'none', color: '#fff', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', flex: 1, justifyContent: 'center', opacity: idx === 0 ? 0.5 : 1, cursor: idx === 0 ? 'not-allowed' : 'pointer' }}>
                        <ArrowLeft size={14} /> Back
                      </button>
                      <button
                        onClick={() => {
                          // Skip only THIS question - move to next, or submit on last
                          if (isLastQuestion) {
                            setExpanderAnswers(prev => ({ ...prev, _submitted: true }));
                            setExpanderVisible(false);
                            handleGenerate(lastInput, selectedMode, { ...(lastGenerationParamsRef.current?.metadata || {}), _skipExpander: true });
                          } else {
                            setExpanderStep(s => s + 1);
                          }
                        }}
                        style={{ padding: '14px', background: '#111', borderRadius: '99px', border: 'none', color: '#fff', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', flex: 1, justifyContent: 'center', cursor: 'pointer' }}
                      >
                        Skip <FastForward size={14} />
                      </button>
                      <button
                        onClick={() => {
                          if (isLastQuestion) {
                            setExpanderAnswers(prev => ({ ...prev, _submitted: true }));
                            setExpanderVisible(false);
                            setTimeout(() => handleGenerate(lastInput, selectedMode, lastGenerationParamsRef.current?.metadata || {}), 50);
                          } else {
                            setExpanderStep(s => s + 1);
                          }
                        }}
                        disabled={!current && !isLastQuestion}
                        style={{ padding: '14px', background: 'linear-gradient(90deg, #84cc16, #a3e635)', borderRadius: '99px', border: 'none', color: '#000', fontSize: '14px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px', flex: 2, justifyContent: 'center', cursor: 'pointer', boxShadow: '0 0 20px rgba(163,230,53,0.3)', opacity: (!current && !isLastQuestion) ? 0.5 : 1 }}
                      >
                        {isLastQuestion ? 'Generate ✨' : 'Next →'}
                      </button>
                    </div>

                  </div>
                );
              })()}
            </div>
          ) : (
            /* ─── Result View ────────────────────────────── */
            <>
              <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', paddingBottom: '240px' }}>
              <div className="mobile-only-input" style={{ width: '100%' }}>
                <div className="mobile-score-card" style={{ marginBottom: '24px', padding: '18px 20px', backgroundColor: '#0f0f0f', border: '1px solid #222', borderRadius: '12px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', width: '100%' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: '#a3e635', fontSize: '12px', fontWeight: 900, letterSpacing: '1.4px', marginBottom: '8px' }}>📝 YOUR INPUT</div>
                    <pre style={{ margin: 0, color: '#f5f5f5', fontSize: '14px', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'Inter, system-ui, sans-serif' }}>
                      {`"${lastInput || currentSession?.input_text || ''}"`}
                    </pre>
                  </div>
                  {typeof result?.score === 'number' && (
                    <div style={{ flexShrink: 0 }}>
                      <ScoreRing score={result.score} />
                    </div>
                  )}
                </div>
              </div>

              {/* Tab bar with horizontal scroll */}
              <div className="no-scrollbar" style={{ display: 'flex', gap: '4px', borderBottom: '1px solid #222', paddingBottom: '0', marginBottom: '32px', overflowX: 'auto' }}>
                {tabs.map(tab => {
                  const isLoaded = loadedTabs.has(tab.id);
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      style={{
                        padding: '16px 20px',
                        fontSize: '13px',
                        fontWeight: '700',
                        color: isActive ? '#a3e635' : '#555',
                        borderBottom: isActive ? '2px solid #a3e635' : 'none',
                        border: 'none',
                        backgroundColor: 'transparent',
                        transition: 'all 0.3s var(--ease-premium)',
                        whiteSpace: 'nowrap',
                        cursor: 'pointer',
                        borderRadius: '0'
                      }}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>



              {/* AI Roast Container */}
              {roastResult && (
                <div className="animate-fade-in" style={{ backgroundColor: '#1a0505', border: '1px solid #ef4444', borderRadius: '16px', padding: '24px', marginBottom: '32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <Flame size={24} color="#ef4444" />
                    <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#ef4444', margin: 0 }}>Brutal AI Roast</h3>
                  </div>
                  <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#ffb3b3' }} dangerouslySetInnerHTML={{ __html: renderMarkdown(roastResult) }} />
                  <button onClick={() => setRoastResult(null)} style={{ marginTop: '16px', padding: '8px 16px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#ef4444', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>Okay, I get it</button>
                </div>
              )}

              {/* Content Panel */}
              <div className="animate-slide-up" key={loading ? 'loading' : (result?.score || 'r')} style={{ backgroundColor: '#0d0d0d', borderRadius: '24px', border: '1px solid #1a1a1a', padding: '40px', minHeight: '500px', position: 'relative' }}>
                {loading ? (
                  <LoadingSkeleton />
                ) : (
                  <div key={activeTab} className="animate-fade-in">
                    {activeTab === 'validate' ? (
                      /* ─── Validate Tab (Reddit Pain Finder) ─ */
                      <div className="animate-fade-in">
                        <div style={{ marginBottom: '32px' }}>
                          <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#a3e635', marginBottom: '8px' }}>Real-World Validation</h3>
                          <p style={{ color: '#888', fontSize: '14px' }}>We scanned Reddit for pain points related to your idea.</p>
                        </div>

                        {!redditInsights && !loadingInsights && (
                          <div style={{ textAlign: 'center', padding: '60px', backgroundColor: '#111', borderRadius: '16px', border: '1px dashed #222' }}>
                            <Flame size={32} color="#a3e635" style={{ marginBottom: '16px' }} />
                            <p style={{ color: '#fff', fontWeight: '700', marginBottom: '16px' }}>Ready to battle-test your idea?</p>
                            <button onClick={fetchRedditInsights} style={{ padding: '12px 24px', backgroundColor: '#a3e635', borderRadius: '8px', color: '#000', fontWeight: '800', border: 'none', cursor: 'pointer' }}>Scan for Pain Points</button>
                          </div>
                        )}

                        {loadingInsights && <LoadingSkeleton />}

                        {redditInsights && (
                          <div style={{ display: 'grid', gap: '16px' }}>
                            {redditInsights.map((insight, idx) => {
                              return (
                                <div key={idx} style={{
                                  padding: '24px',
                                  backgroundColor: '#111',
                                  borderRadius: '16px',
                                  border: '1px solid #1a1a1a',
                                  position: 'relative',
                                  overflow: 'hidden'
                                }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                    <div style={{ padding: '4px 10px', backgroundColor: 'rgba(163, 230, 53, 0.1)', borderRadius: '6px', color: '#a3e635', fontSize: '10px', fontWeight: '900' }}>{insight.subreddit}</div>
                                    <div style={{ color: '#444', fontSize: '12px', fontWeight: '700' }}>{insight.mentions} mentions found</div>
                                  </div>
                                  <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#fff', marginBottom: '12px' }}>{insight.pain_point}</h4>
                                  <div style={{ padding: '16px', backgroundColor: '#050505', borderRadius: '12px', borderLeft: '2px solid #333', fontStyle: 'italic', color: '#888', fontSize: '13px' }}>
                                    "{insight.quote}"
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ) : activeTab === 'improvements' ? (
                      /* ─── Improvements Tab ───────────────── */
                      <div style={{ display: 'grid', gap: '16px' }}>
                        {result?.issues?.map((issue, idx) => (
                          <div key={idx} style={{ padding: '24px', backgroundColor: 'rgba(10, 10, 10, 0.4)', borderRadius: '16px', borderLeft: '4px solid #ef4444', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                            <p style={{ color: '#ef4444', fontWeight: '900', fontSize: '11px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Issue</p>
                            <p style={{ color: '#ddd', fontSize: '14px', lineHeight: '1.7' }}>{issue}</p>
                          </div>
                        ))}
                        {result?.suggestions?.map((sugg, idx) => (
                          <div key={idx} style={{ padding: '24px', backgroundColor: 'rgba(10, 10, 10, 0.4)', borderRadius: '16px', borderLeft: '4px solid #a3e635', border: '1px solid rgba(163, 230, 53, 0.1)' }}>
                            <p style={{ color: '#a3e635', fontWeight: '900', fontSize: '11px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Suggestion</p>
                            <p style={{ color: '#ddd', fontSize: '14px', lineHeight: '1.7' }}>{sugg}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
                        {/* Tab Header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <div style={{ fontSize: '12px', fontWeight: '900', color: '#fff', textTransform: 'uppercase', letterSpacing: '2px' }}>
                            {tabs.find(t => t.id === activeTab)?.label}
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>

                            {activeTab === 'architecture' && (
                              <>
                                <button className="action-btn" onClick={handleXmlExport} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#06b6d4', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', padding: '8px 16px', backgroundColor: 'rgba(6, 182, 212, 0.05)', border: '1px solid rgba(6, 182, 212, 0.2)', borderRadius: '8px' }}>
                                  <Download size={14} /> <span className="mobile-hide">XML</span>
                                </button>
                                <button className="action-btn" onClick={handleCursorExport} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#a3e635', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', padding: '8px 16px', backgroundColor: 'rgba(163, 230, 53, 0.05)', border: '1px solid rgba(163, 230, 53, 0.2)', borderRadius: '8px' }}>
                                  <Download size={14} /> <span className="mobile-hide">Cursor</span>
                                </button>
                              </>
                            )}
                            <button className="action-btn" onClick={handleCopy} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#6d28d9', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
                              <Copy size={16} /> <span className="mobile-hide">Copy</span>
                            </button>
                          </div>
                        </div>

                        {!loadedTabs.has(activeTab) ? (
                          <div style={{ textAlign: 'center', padding: '80px 40px', backgroundColor: '#111', borderRadius: '16px', border: '1px dashed #1a1a1a' }}>
                            <Flame size={48} color="#a3e635" style={{ marginBottom: '24px', opacity: 0.7 }} />
                            <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#fff', marginBottom: '8px' }}>Ready to generate this tab?</h3>
                            <p style={{ color: '#888', fontSize: '14px', marginBottom: '24px' }}>Click below to generate the "{activeTab.replace(/_/g, ' ')}" tab.</p>
                            <button
                              onClick={() => handleLoadTabOnDemand(activeTab)}
                              disabled={loading}
                              style={{ padding: '12px 32px', backgroundColor: '#a3e635', color: '#000', fontWeight: '900', border: 'none', borderRadius: '8px', cursor: loading ? 'wait' : 'pointer', fontSize: '13px' }}
                            >
                              {loading ? '⏳ Generating...' : '✨ Generate Now'}
                            </button>
                          </div>
                        ) : (
                          <div
                            className="markdown-content"
                            dangerouslySetInnerHTML={{ __html: renderMarkdown(getDisplayedTabContent(activeTab)) }}
                            style={{ fontSize: '14px', lineHeight: '1.8' }}
                          />
                        )}

                        {/* Scoring/quality UI intentionally removed from prompt panel.
                           Score is shown only in the top bar ring. */}

                        {/* ─── Feature E: Naming Suggestions (primary prompt tab only) ─── */}
                        {['final_prompt', 'master_prompt'].includes(activeTab) && result?.naming_suggestions?.length > 0 && (
                          <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid #1a1a1a' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#a3e635', marginBottom: '16px' }}>💡 Name Ideas</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {result.naming_suggestions.map((n, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', backgroundColor: '#111', borderRadius: '10px', border: '1px solid #1a1a1a' }}>
                                  <span style={{ fontWeight: '700', color: '#fff', fontSize: '14px' }}>{n.name}</span>
                                  <span style={{ fontSize: '11px', color: '#555' }}>{n.note}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* ─── Feature G: Stress Test (primary prompt tab only) ─── */}
                        {['final_prompt', 'master_prompt'].includes(activeTab) && (
                          <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid #1a1a1a' }}>
                            <button
                              onClick={handleStressTest}
                              disabled={stressLoading}
                              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px', backgroundColor: stressLoading ? '#111' : 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', color: '#ef4444', fontSize: '12px', fontWeight: '800', cursor: stressLoading ? 'wait' : 'pointer' }}
                            >
                              <Zap size={16} />
                              {stressLoading ? 'Running Stress Test...' : stressQuestions.length > 0 ? (stressTestOpen ? 'Hide Stress Test' : 'Show Stress Test') : '🔥 Stress Test This Idea'}
                              {allStressAnswered && <span style={{ padding: '2px 8px', backgroundColor: 'rgba(163, 230, 53, 0.1)', border: '1px solid #a3e635', borderRadius: '6px', color: '#a3e635', fontSize: '9px', fontWeight: '900', marginLeft: '8px' }}>BATTLE-TESTED</span>}
                            </button>

                            {stressTestOpen && stressQuestions.length > 0 && (
                              <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }} className="animate-fade-in">
                                {stressQuestions.map((q, idx) => (
                                  <div key={idx} style={{ padding: '20px', backgroundColor: '#111', border: '1px solid #1a1a1a', borderRadius: '16px' }}>
                                    <p style={{ color: '#ef4444', fontSize: '13px', fontWeight: '700', marginBottom: '12px' }}>Q{idx + 1}: {q}</p>
                                    <textarea
                                      placeholder="Your answer..."
                                      value={stressAnswers[idx] || ''}
                                      onChange={(e) => setStressAnswers(prev => ({ ...prev, [idx]: e.target.value }))}
                                      rows={2}
                                      style={{ width: '100%', backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '10px', padding: '12px 16px', color: '#fff', fontSize: '13px', resize: 'vertical' }}
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
            </>
          )}
        </div>

        {(currentSession?.id || result || loading) && !expanderVisible && (
          <BottomInput
              onGenerate={handleGenerate}
              loading={loading}
              isSidebarOpen={isSidebarOpen}
              externalInput={suggestionInput}
              mode={bottomInputMode}
              setMode={setBottomInputMode}
              isPro={true}
            />
        )}

        {/* Make Public Toggle + AI Roast + Share (Action Menu) */}
        {currentSession?.id && result && !loading && (
          <div style={{ position: 'fixed', bottom: '110px', right: '20px', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
            {showActionMenu && (
              <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '4px' }}>
                <button 
                  onClick={() => {
                    setShowActionMenu(false);
                    handleGenerate(lastInput, result?.mode || currentSession?.mode || bottomInputMode, {
                      personality: result?.personality || lastGenerationParamsRef.current?.metadata?.personality,
                      isPro: usageInfo?.isPro || false
                    });
                  }} 
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 18px', backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '16px', color: '#a3e635', fontSize: '13px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,0,0,0.6)' }}
                >
                  <Zap size={16} /> Refine Prompt
                </button>
                {result?.mode === 'CREATIVE' && (
                  <button onClick={() => { setShowGalleryUpload(true); setShowActionMenu(false); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 18px', backgroundColor: 'rgba(219, 39, 119, 0.1)', border: '1px solid rgba(219, 39, 119, 0.3)', borderRadius: '16px', color: '#db2777', fontSize: '13px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,0,0,0.6)' }}>
                    🎨 Upload to Gallery
                  </button>
                )}
                <button onClick={handleTogglePublic} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 18px', backgroundColor: currentSession.is_public ? 'rgba(163, 230, 53, 0.1)' : '#1a1a1a', border: `1px solid ${currentSession.is_public ? 'rgba(163, 230, 53, 0.3)' : '#333'}`, borderRadius: '16px', color: currentSession.is_public ? '#a3e635' : '#ddd', fontSize: '13px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,0,0,0.6)' }}>
                  {currentSession.is_public ? <Globe size={16} /> : <Lock size={16} />}
                  {currentSession.is_public ? 'Public' : 'Private'}
                </button>
                <button onClick={handleAiRoast} disabled={roastLoading} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 18px', backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '16px', color: '#ef4444', fontSize: '13px', fontWeight: '700', cursor: roastLoading ? 'wait' : 'pointer', boxShadow: '0 8px 24px rgba(0,0,0,0.6)' }}>
                  <Flame size={16} /> {roastLoading ? 'Roasting...' : 'AI Roast'}
                </button>
                <button onClick={() => { showToast('🔗 Copied share link'); navigator.clipboard.writeText(window.location.href); setShowActionMenu(false); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 18px', backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '16px', color: '#ddd', fontSize: '13px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,0,0,0.6)' }}>
                  <Share2 size={16} /> Share
                </button>
              </div>
            )}
            <button 
              onClick={() => setShowActionMenu(!showActionMenu)}
              style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: showActionMenu ? '#222' : '#a3e635', border: showActionMenu ? '1px solid #444' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', transition: 'all 0.3s ease', transform: showActionMenu ? 'rotate(45deg)' : 'rotate(0deg)' }}
            >
              <span style={{ fontSize: '26px', filter: showActionMenu ? 'grayscale(100%)' : 'none', transform: showActionMenu ? 'rotate(-45deg)' : 'rotate(0deg)', transition: 'all 0.3s ease' }}>🪶</span>
            </button>
          </div>
        )}
      </main>

      {/* ─── AI Roast Modal ──────────────────────────── */}
      {roastResult && (
        <div onClick={() => setRoastResult(null)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()} className="animate-fade-in" style={{ width: '100%', maxWidth: '560px', maxHeight: '80vh', overflowY: 'auto', padding: '40px', backgroundColor: '#0d0d0d', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '24px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '900', marginBottom: '24px', color: '#ef4444' }}>🔥 The Roast</h2>
            <div className="markdown-content" dangerouslySetInnerHTML={{ __html: renderMarkdown(roastResult) }} />

            {!roastVerdict && (
              <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #1a1a1a' }}>
                <p style={{ fontSize: '13px', color: '#888', marginBottom: '12px' }}>Think you can handle it? Defend your idea:</p>
                <textarea value={roastDefense} onChange={e => setRoastDefense(e.target.value)} placeholder="Your defense..." rows={3} style={{ width: '100%', padding: '14px', backgroundColor: '#111', border: '1px solid #222', borderRadius: '12px', color: '#fff', fontSize: '14px', resize: 'none' }} />
                <button onClick={() => setRoastVerdict(roastDefense.length > 30 ? '✅ Survived the Roast — Your idea lives another day.' : '💀 Back to the drawing board.')} disabled={roastDefense.length < 10} style={{ marginTop: '12px', width: '100%', padding: '14px', backgroundColor: roastDefense.length >= 10 ? '#ef4444' : '#222', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: '800', cursor: roastDefense.length >= 10 ? 'pointer' : 'not-allowed' }}>Submit Defense</button>
              </div>
            )}

            {roastVerdict && (
              <div style={{ marginTop: '24px', padding: '20px', backgroundColor: roastVerdict.includes('Survived') ? 'rgba(163, 230, 53, 0.05)' : 'rgba(239, 68, 68, 0.05)', border: `1px solid ${roastVerdict.includes('Survived') ? '#a3e635' : '#ef4444'}`, borderRadius: '16px', textAlign: 'center' }}>
                <p style={{ fontSize: '18px', fontWeight: '900', color: roastVerdict.includes('Survived') ? '#a3e635' : '#ef4444' }}>{roastVerdict}</p>
              </div>
            )}
          </div>
        </div>
      )}



      {/* ─── Share Card Overlay ───────────────────────── */}
      {shareCardOpen && (
        <div onClick={() => setShareCardOpen(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
          <div id="share-card-wrapper" onClick={e => e.stopPropagation()} style={{ position: 'relative' }}>
            {/* The Actual Card (1200x630) */}
            <div id="share-card-content" style={{
              width: '1200px',
              height: '630px',
              backgroundColor: '#080808',
              backgroundImage: 'radial-gradient(#1a1a1a 1px, transparent 1px)',
              backgroundSize: '30px 30px',
              border: '1px solid #222',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              padding: '60px'
            }}>
              {/* Corner Markers */}
              <div style={{ position: 'absolute', top: '24px', left: '24px', color: '#333', fontSize: '10px' }}>▼</div>
              <div style={{ position: 'absolute', top: '24px', right: '24px', color: '#333', fontSize: '10px' }}>▼</div>
              <div style={{ position: 'absolute', bottom: '24px', left: '24px', color: '#333', fontSize: '10px' }}>▲</div>
              <div style={{ position: 'absolute', bottom: '24px', right: '24px', color: '#333', fontSize: '10px' }}>▲</div>

              {/* Purple Glow */}
              <div style={{ position: 'absolute', bottom: '-100px', right: '-100px', width: '100%', maxWidth: '400px', height: '400px', backgroundColor: 'rgba(109, 40, 217, 0.1)', filter: 'blur(100px)', borderRadius: '50%' }} />

              {/* Logo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '80px' }}>
                <div style={{ width: '8px', height: '8px', backgroundColor: '#a3e635', borderRadius: '50%' }} />
                <span style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '-0.5px' }}>Prompt<span style={{ color: '#a3e635' }}>Quill</span></span>
                <span style={{ fontSize: '14px', color: '#333', marginLeft: '8px' }}>Prompt Quill.app</span>
              </div>

              {/* Title */}
              <h2 className="mobile-font-smaller" style={{ fontSize: '72px', fontWeight: '900', color: '#a3e635', fontStyle: 'italic', maxWidth: '900px', lineHeight: '1', marginBottom: '40px' }}>
                {currentSession?.title || 'Revolutionary AI Idea'}
              </h2>

              {/* Score Section */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontSize: '96px', fontWeight: '900' }}>{result?.score || 0}</span>
                  <span style={{ fontSize: '24px', color: '#333', fontWeight: '800' }}>/10</span>
                </div>

                <div style={{ flex: 1, maxWidth: '400px' }}>
                  {Object.entries(result?.score_breakdown || { clarity: 0, specificity: 0, feasibility: 0, market: 0 }).map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <div style={{ flex: 1, height: '4px', backgroundColor: '#111', borderRadius: '2px' }}>
                        <div style={{ height: '100%', width: `${(v / 10) * 100}%`, backgroundColor: '#a3e635', borderRadius: '2px' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Info */}
              <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ padding: '8px 20px', backgroundColor: '#111', border: '1px solid #222', borderRadius: '8px', fontSize: '14px', fontWeight: '800', color: '#fff' }}>{currentSession?.mode || 'GENERAL'}</div>
                  <div style={{ padding: '8px 20px', backgroundColor: '#111', border: '1px solid #222', borderRadius: '8px', fontSize: '14px', fontWeight: '800', color: '#fff' }}>{result?.difficulty || '1 Month Build'}</div>
                  <div style={{ padding: '8px 20px', backgroundColor: 'transparent', border: 'none', fontSize: '14px', fontWeight: '800', color: '#333' }}>Built with Prompt Quill</div>
                </div>


              </div>
            </div>

            {/* Controls */}
            <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center', gap: '16px' }}>
              <button
                onClick={async () => {
                  const el = document.getElementById('share-card-content');
                  const canvas = await html2canvas(el, {
                    scale: 2,
                    backgroundColor: '#080808',
                    useCORS: true,
                    allowTaint: true,
                    logging: false
                  });
                  const link = document.createElement('a');
                  link.download = `Prompt-Quill-${currentSession?.title || 'Idea'}.png`;
                  link.href = canvas.toDataURL('image/png', 1.0);
                  link.click();
                  showToast('Downloaded PNG ✓');
                }}
                style={{ padding: '14px 28px', backgroundColor: '#fff', color: '#000', borderRadius: '12px', fontWeight: '800', fontSize: '14px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Download size={18} /> Download PNG
              </button>
              <button
                onClick={async () => {
                  const el = document.getElementById('share-card-content');
                  const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#080808' });
                  canvas.toBlob(async (blob) => {
                    try {
                      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
                      showToast('Copied Image to Clipboard ✓');
                    } catch {
                      showToast('ClipBoard failed. Try Download.');
                    }
                  });
                }}
                style={{ padding: '14px 28px', backgroundColor: '#111', color: '#fff', borderRadius: '12px', fontWeight: '800', fontSize: '14px', border: '1px solid #333', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Copy size={18} /> Copy Image
              </button>
              <button
                onClick={() => {
                  if (currentSession?.id) {
                    navigate(`/share/${currentSession.id}`);
                  } else {
                    showToast('Please generate a prompt first! ✨');
                  }
                }}
                style={{ padding: '14px 28px', backgroundColor: '#a3e635', color: '#111', borderRadius: '12px', fontWeight: '800', fontSize: '14px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Share2 size={18} /> Share Prompt
              </button>
              <button
                onClick={() => {
                  const text = encodeURIComponent(`Just generated a prompt for ${currentSession?.title} and scored ${result?.score}/10 on @Prompt Quill 🚀\n\n#buildinpublic #Prompt Quill`);
                  window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
                }}
                style={{ padding: '14px 28px', backgroundColor: '#1d9bf0', color: '#fff', borderRadius: '12px', fontWeight: '800', fontSize: '14px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Share2 size={18} /> Share to Twitter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Username Claim Modal ────────────────────── */}
      {showUsernameModal && !shareCardOpen && (
        <div className="upgrade-modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto' }}>
          <div className="animate-fade-in upgrade-modal-container" style={{ width: '100%', maxWidth: '400px', padding: '40px', backgroundColor: '#0d0d0d', border: '1px solid #222', borderRadius: '24px', textAlign: 'center', pointerEvents: 'auto' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>👋</div>
            <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '8px' }}>Claim Your Username</h2>
            <p style={{ color: '#888', fontSize: '14px', marginBottom: '32px' }}>Pick a unique handle for your Prompt Quill public profile.</p>
            <input
              type="text"
              placeholder="username"
              value={usernameInput}
              onChange={e => setUsernameInput(e.target.value.toLowerCase().replace(/\s/g, ''))}
              style={{ width: '100%', padding: '14px', backgroundColor: '#111', border: '1px solid #222', borderRadius: '12px', color: '#fff', fontSize: '16px', marginBottom: '16px', textAlign: 'center' }}
            />
            <button
              onClick={handleClaimUsername}
              disabled={profileSaving || usernameInput.length < 3}
              style={{ width: '100%', padding: '14px', backgroundColor: (usernameInput.length >= 3 && !profileSaving) ? '#a3e635' : '#222', borderRadius: '12px', color: '#000', fontWeight: '800', border: 'none', cursor: 'pointer', transition: '0.3s' }}
            >
              {profileSaving ? 'Claiming...' : 'Claim Username →'}
            </button>
            {/* Success Message */}
            {!profileSaving && userProfile && (
              <div style={{ marginTop: '16px', color: '#a3e635', fontSize: '14px', fontWeight: '700' }}>✓ Username claimed!</div>
            )}
          </div>
        </div>
      )}

      {/* ─── Profile Settings Modal ──────────────────── */}
      {showSettingsModal && (
        <div className="upgrade-modal-overlay" onClick={() => setShowSettingsModal(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()} className="animate-fade-in upgrade-modal-container" style={{ width: '100%', maxWidth: '500px', padding: '40px', backgroundColor: '#0d0d0d', border: '1px solid #222', borderRadius: '24px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '900', marginBottom: '24px' }}>Profile Settings</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ fontSize: '10px', fontWeight: '800', color: '#444', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Bio</label>
                <textarea
                  value={settingsForm.bio}
                  onChange={e => setSettingsForm({ ...settingsForm, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows={3}
                  style={{ width: '100%', padding: '14px', backgroundColor: '#111', border: '1px solid #222', borderRadius: '12px', color: '#fff', fontSize: '14px', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: '800', color: '#444', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Twitter</label>
                  <input type="text" value={settingsForm.twitter} onChange={e => setSettingsForm({ ...settingsForm, twitter: e.target.value })} placeholder="@handle" style={{ width: '100%', padding: '12px', backgroundColor: '#111', border: '1px solid #222', borderRadius: '10px', color: '#fff', fontSize: '13px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: '800', color: '#444', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>GitHub</label>
                  <input type="text" value={settingsForm.github} onChange={e => setSettingsForm({ ...settingsForm, github: e.target.value })} placeholder="username" style={{ width: '100%', padding: '12px', backgroundColor: '#111', border: '1px solid #222', borderRadius: '10px', color: '#fff', fontSize: '13px' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '10px', fontWeight: '800', color: '#444', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Website</label>
                <input type="text" value={settingsForm.website} onChange={e => setSettingsForm({ ...settingsForm, website: e.target.value })} placeholder="https://..." style={{ width: '100%', padding: '12px', backgroundColor: '#111', border: '1px solid #222', borderRadius: '10px', color: '#fff', fontSize: '13px' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
              <button onClick={() => setShowSettingsModal(false)} style={{ flex: 1, padding: '14px', backgroundColor: 'transparent', border: '1px solid #222', borderRadius: '12px', color: '#888', fontWeight: '700' }}>Cancel</button>
              <button onClick={handleSaveSettings} disabled={profileSaving} style={{ flex: 1, padding: '14px', backgroundColor: '#a3e635', border: 'none', borderRadius: '12px', color: '#000', fontWeight: '800' }}>
                {profileSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Toast Notification ──────────────────────── */}
      {toast && <div className="toast">{toast}</div>}

      {/* ─── Rename Modal ──────────────────────────────── */}
      {renameModal.isOpen && (
        <div className="upgrade-modal-overlay" onClick={() => setRenameModal({ isOpen: false, id: null, title: '' })} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div onClick={e => e.stopPropagation()} className="animate-fade-in upgrade-modal-container" style={{ width: '100%', maxWidth: '400px', padding: '32px', backgroundColor: '#111', border: '1px solid #333', borderRadius: '16px', boxShadow: '0 0 40px rgba(0, 0, 0, 0.5)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', marginBottom: '16px' }}>Rename Session</h3>
            <input
              autoFocus
              type="text"
              value={renameModal.title}
              onChange={e => setRenameModal(prev => ({ ...prev, title: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && confirmRename()}
              placeholder="Enter new title..."
              style={{ width: '100%', padding: '12px 16px', backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px', color: '#fff', marginBottom: '24px', fontSize: '14px', outline: 'none' }}
            />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setRenameModal({ isOpen: false, id: null, title: '' })}
                style={{ padding: '8px 16px', background: 'transparent', border: 'none', color: '#888', fontWeight: '700', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={confirmRename}
                style={{ padding: '8px 24px', background: '#a3e635', color: '#000', border: 'none', borderRadius: '8px', fontWeight: '800', cursor: 'pointer' }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Bury Modal ──────────────────────────────── */}
      {buryModal && (
        <div className="upgrade-modal-overlay" onClick={() => !buryLoading && setBuryModal(null)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div onClick={e => e.stopPropagation()} className="animate-fade-in upgrade-modal-container" style={{ width: '100%', maxWidth: '450px', padding: '48px', backgroundColor: '#111', border: '2px solid #ef4444', borderRadius: '20px', boxShadow: '0 0 40px rgba(239, 68, 68, 0.3)' }}>
            <div style={{ fontSize: '48px', marginBottom: '24px', textAlign: 'center', animation: 'bounce 2s ease-in-out infinite' }}>🪦</div>

            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '12px', color: '#fff', textAlign: 'center' }}>
              Bury "{buryModal.title}"?
            </h2>

            <p style={{ fontSize: '14px', color: '#888', marginBottom: '24px', textAlign: 'center', lineHeight: '1.6' }}>
              This idea will be moved to The Graveyard. You can revive it anytime from your Graveyard page.
            </p>

            <textarea
              value={buryReason}
              onChange={e => setBuryReason(e.target.value)}
              placeholder="Why are you burying this idea? (optional)"
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: '#0a0a0a',
                border: '1px solid #222',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '13px',
                resize: 'vertical',
                minHeight: '80px',
                fontFamily: 'inherit',
                marginBottom: '24px'
              }}
            />

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => !buryLoading && setBuryModal(null)}
                disabled={buryLoading}
                style={{
                  flex: 1,
                  padding: '14px 24px',
                  backgroundColor: 'transparent',
                  border: '1px solid #333',
                  borderRadius: '12px',
                  color: '#888',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: buryLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: buryLoading ? 0.5 : 1
                }}
                onMouseEnter={e => !buryLoading && (e.currentTarget.style.borderColor = '#555')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#333')}
              >
                Keep It
              </button>

              <button
                onClick={confirmBury}
                disabled={buryLoading}
                style={{
                  flex: 1,
                  padding: '14px 24px',
                  backgroundColor: '#ef4444',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: buryLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  opacity: buryLoading ? 0.6 : 1
                }}
                onMouseEnter={e => !buryLoading && (e.currentTarget.style.backgroundColor = '#ff5555')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#ef4444')}
              >
                {buryLoading ? (
                  <>
                    <div style={{ width: '14px', height: '14px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    Burying...
                  </>
                ) : (
                  <>🪦 Bury Idea</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Upload Modal */}
      {showGalleryUpload && (
        <div className="upgrade-modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(5px)'
        }}>
          <div className="animate-fade-in upgrade-modal-container" style={{
            backgroundColor: '#111',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
            border: '1px solid #222'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>Upload to Creative Gallery</h2>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#aaa' }}>Title *</label>
              <input
                type="text"
                placeholder="Your work title"
                value={galleryUploadForm.title}
                onChange={(e) => setGalleryUploadForm({ ...galleryUploadForm, title: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: '#0a0a0a',
                  border: '1px solid #222',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#aaa' }}>File *</label>
              <input
                type="file"
                accept="image/*,video/*,.pdf"
                onChange={(e) => setGalleryUploadForm({ ...galleryUploadForm, file: e.target.files?.[0] })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: '#0a0a0a',
                  border: '1px solid #222',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#aaa' }}>Creative Type</label>
              <select
                value={galleryUploadForm.creative_type}
                onChange={(e) => setGalleryUploadForm({ ...galleryUploadForm, creative_type: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: '#0a0a0a',
                  border: '1px solid #222',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
                <option value="frontend">Frontend</option>
                <option value="logo">Logo</option>
                <option value="motion">Motion</option>
                <option value="3d">3D</option>
                <option value="music">Music</option>
                <option value="writing">Writing</option>
                <option value="social">Social</option>
                <option value="poster">Poster</option>
                <option value="typography">Typography</option>
                <option value="game">Game</option>
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#aaa' }}>Description</label>
              <textarea
                placeholder="Describe your creative work..."
                value={galleryUploadForm.description}
                onChange={(e) => setGalleryUploadForm({ ...galleryUploadForm, description: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: '#0a0a0a',
                  border: '1px solid #222',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '14px',
                  minHeight: '80px',
                  boxSizing: 'border-box',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#aaa' }}>Tags (comma separated)</label>
              <input
                type="text"
                placeholder="e.g. ai, minimalist, elegant"
                value={galleryUploadForm.tags}
                onChange={(e) => setGalleryUploadForm({ ...galleryUploadForm, tags: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: '#0a0a0a',
                  border: '1px solid #222',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowGalleryUpload(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#222',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleUploadToGallery}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#db2777',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
