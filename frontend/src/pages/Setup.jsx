import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const PROVIDERS = [
  { id: 'openai', name: 'OpenAI', keyLabel: 'API Key', link: 'https://platform.openai.com/api-keys', fields: [{ key: 'apiKey', label: 'API Key' }] },
  { id: 'claude', name: 'Anthropic', keyLabel: 'API Key', link: 'https://console.anthropic.com/', fields: [{ key: 'apiKey', label: 'API Key' }] },
  { id: 'xai', name: 'xAI Grok', keyLabel: 'API Key', link: 'https://console.x.ai/', fields: [{ key: 'apiKey', label: 'API Key' }] },
  { id: 'gemini', name: 'Google Gemini', keyLabel: 'API Key', link: 'https://aistudio.google.com/apikey', fields: [{ key: 'apiKey', label: 'API Key' }] },
  { id: 'groq', name: 'Groq', keyLabel: 'API Key', link: 'https://console.groq.com/keys', fields: [{ key: 'apiKey', label: 'API Key' }] },
  { id: 'mistral', name: 'Mistral AI', keyLabel: 'API Key', link: 'https://console.mistral.ai/', fields: [{ key: 'apiKey', label: 'API Key' }] },
  { id: 'deepseek', name: 'DeepSeek', keyLabel: 'API Key', link: 'https://platform.deepseek.com/', fields: [{ key: 'apiKey', label: 'API Key' }] },
  { id: 'cohere', name: 'Cohere', keyLabel: 'API Key', link: 'https://dashboard.cohere.com/', fields: [{ key: 'apiKey', label: 'API Key' }] },
  { id: 'perplexity', name: 'Perplexity AI', keyLabel: 'API Key', link: 'https://docs.perplexity.ai/', fields: [{ key: 'apiKey', label: 'API Key' }] },
  { id: 'moonshot', name: 'Moonshot AI', keyLabel: 'API Key', link: 'https://platform.moonshot.cn/', fields: [{ key: 'apiKey', label: 'API Key' }] },
  { id: 'cerebras', name: 'Cerebras', keyLabel: 'API Key', link: 'https://cloud.cerebras.ai/', fields: [{ key: 'apiKey', label: 'API Key' }] },
  { id: 'openrouter', name: 'OpenRouter', keyLabel: 'API Key', link: 'https://openrouter.ai/keys', fields: [{ key: 'apiKey', label: 'API Key' }] },
  { id: 'cloudflare', name: 'Cloudflare', keyLabel: 'API Key', link: 'https://dash.cloudflare.com/', fields: [{ key: 'apiKey', label: 'API Key' }, { key: 'accountId', label: 'Account ID' }] },
  { id: 'nvidia', name: 'NVIDIA NIM', keyLabel: 'API Key', link: 'https://build.nvidia.com/', fields: [{ key: 'apiKey', label: 'API Key' }] },
  { id: 'ollama', name: 'Ollama (Local)', keyLabel: 'URL', link: 'https://ollama.com/', fields: [{ key: 'url', label: 'Server URL (default: http://localhost:11434)' }] },
  { id: 'lmstudio', name: 'LM Studio (Local)', keyLabel: 'URL', link: 'https://lmstudio.ai/', fields: [{ key: 'url', label: 'Server URL (default: http://localhost:1234)' }] },
];

const STEPS = ['Welcome', 'Supabase', 'AI Keys', 'Database', 'Done'];

function injectStyles() {
  const id = 'pq-setup-styles';
  if (document.getElementById(id)) return;
  const s = document.createElement('style');
  s.id = id;
  s.textContent = `
    @keyframes pq-check-in {
      0% { transform: scale(0) rotate(-10deg); opacity: 0; }
      50% { transform: scale(1.2) rotate(3deg); }
      100% { transform: scale(1) rotate(0deg); opacity: 1; }
    }
    @keyframes pq-fade-slide {
      0% { opacity: 0; transform: translateX(30px); }
      100% { opacity: 1; transform: translateX(0); }
    }
    @keyframes pq-fade-slide-reverse {
      0% { opacity: 0; transform: translateX(-30px); }
      100% { opacity: 1; transform: translateX(0); }
    }
    @keyframes pq-spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes pq-pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(163, 230, 53, 0.4); }
      50% { box-shadow: 0 0 0 12px rgba(163, 230, 53, 0); }
    }
    @keyframes pq-progress-fill {
      0% { width: 0%; }
      100% { width: 100%; }
    }
  `;
  document.head.appendChild(s);
}

export default function Setup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [animDir, setAnimDir] = useState('forward');
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');
  const [supabaseServiceKey, setSupabaseServiceKey] = useState('');
  const [supabaseDbPassword, setSupabaseDbPassword] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [testError, setTestError] = useState(null);
  const [testing, setTesting] = useState(false);
  const [providerKeys, setProviderKeys] = useState({});
  const [providerResults, setProviderResults] = useState({});
  const [testingProvider, setTestingProvider] = useState(null);
  const [setupRunning, setSetupRunning] = useState(false);
  const [setupProgress, setSetupProgress] = useState([]);
  const [setupError, setSetupError] = useState(null);
  const [supabaseConfigured, setSupabaseConfigured] = useState(true);

  const setupSteps = [
    'Creating user tables...',
    'Creating briefs table...',
    'Creating community table...',
    'Setting up RLS policies...',
    'Creating triggers...',
    'Inserting default settings...',
  ];

  const urlRef = useRef('');
  const anonKeyRef = useRef('');

  useEffect(() => {
    injectStyles();
    const done = localStorage.getItem('pq_setup_complete');
    if (done === 'true') {
      navigate('/ai', { replace: true });
      return;
    }
    const su = import.meta.env.VITE_SUPABASE_URL;
    if (!su) {
      setSupabaseConfigured(false);
      setSupabaseUrl('');
      setSupabaseAnonKey('');
      setStep(1);
    }
  }, []);

  const goTo = (s, dir) => {
    setAnimDir(dir);
    setStep(s);
  };

  const testSupabase = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/test/supabase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: supabaseUrl, anonKey: supabaseAnonKey }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setTestResult(true);
        setTestError(null);
        urlRef.current = supabaseUrl;
        anonKeyRef.current = supabaseAnonKey;
      } else {
        setTestResult(false);
        setTestError(data?.error || 'Connection failed. Check your URL and key.');
      }
    } catch (err) {
      setTestResult(false);
      setTestError('Network error. Is the backend running?');
    } finally {
      setTesting(false);
    }
  };

  const updateProviderKey = (providerId, field, value) => {
    setProviderKeys(prev => ({
      ...prev,
      [providerId]: { ...(prev[providerId] || {}), [field]: value },
    }));
  };

  const testProvider = async (providerId) => {
    setTestingProvider(providerId);
    setProviderResults(prev => ({ ...prev, [providerId]: null }));
    const keys = providerKeys[providerId];
    if (!keys) { setTestingProvider(null); return; }
    try {
      const body = { provider: providerId, apiKey: keys.apiKey };
      if (providerId === 'cloudflare') {
        body.cfAccountId = keys.accountId;
      }
      const res = await fetch(`${BACKEND_URL}/api/test/provider`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setProviderResults(prev => ({ ...prev, [providerId]: res.ok && data.valid }));
    } catch {
      setProviderResults(prev => ({ ...prev, [providerId]: false }));
    } finally {
      setTestingProvider(null);
    }
  };

  const runSetup = async () => {
    setSetupRunning(true);
    setSetupError(null);
    setSetupProgress([]);

    try {
      const res = await fetch(`${BACKEND_URL}/api/setup/database`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: supabaseUrl || import.meta.env.VITE_SUPABASE_URL,
          serviceKey: supabaseServiceKey || '',
          dbPassword: supabaseDbPassword || '',
        }),
      });
      const data = await res.json();

      if (data.manualSetup) {
        setSetupError(
          'Database setup requires SUPABASE_SERVICE_KEY in backend/.env.\n' +
          'Add it, restart backend, and run setup again.'
        );
        setSetupRunning(false);
        return;
      }

      if (data.needsManualSetup) {
        setSetupProgress(prev => [...prev, { label: '⚠️ Auto-creation not available', status: 'error' }]);
        setSetupError(
          '⏳ Could not auto-create tables.\n\n' +
          'The app still works for generating briefs — they just won\'t be saved to a database.\n\n' +
          'To enable database saving later:\n' +
          '1. Open your Supabase Dashboard → SQL Editor\n' +
          '2. Paste the SQL below and click "Run"\n\n' +
          '--- Copy from here ---\n' +
          (data.schema || '').trim() + '\n' +
          '--- End of SQL ---\n'
        );
        setSetupRunning(false);
        return;
      }

      if (data.steps) {
        for (const step of data.steps) {
          setSetupProgress(prev => [...prev, { label: step.name, status: step.status === 'done' ? 'done' : 'error' }]);
          await new Promise(r => setTimeout(r, 300));
        }
      }

      if (data.success) {
        setSetupProgress(prev => [...prev, { label: '✅ Database ready!', status: 'done' }]);
      }
    } catch (err) {
      setSetupError('Could not reach backend to set up database. Make sure the backend is running.');
    }

    setSetupRunning(false);
  };

  const validProviders = PROVIDERS.filter(p => {
    const keys = providerKeys[p.id];
    if (!keys) return false;
    if (p.id === 'cloudflare') return keys.apiKey && keys.accountId;
    return keys.apiKey;
  });

  const anyKeyValid = Object.values(providerResults).some(r => r === true);

  const finish = async () => {
    localStorage.setItem('pq_supabase_url', supabaseUrl);
    localStorage.setItem('pq_supabase_anon_key', supabaseAnonKey);
    localStorage.setItem('pq_supabase_service_key', supabaseServiceKey);
    localStorage.setItem('pq_setup_complete', 'true');

    try {
      const body = {
        supabaseUrl,
        supabaseAnonKey,
        supabaseServiceKey,
        frontendUrl: window.location.origin,
      };
      for (const [id, keys] of Object.entries(providerKeys)) {
        if (id === 'cloudflare') {
          body.cfApiKey = keys.apiKey;
          body.cfAccountId = keys.accountId;
        } else if (id === 'ollama') {
          body.ollamaUrl = keys.url || 'http://localhost:11434';
        } else if (id === 'lmstudio') {
          body.lmstudioUrl = keys.url || 'http://localhost:1234';
        } else {
          body[`${id}Key`] = keys.apiKey;
        }
      }
      await fetch(`${BACKEND_URL}/api/setup/save-config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch {}

    try {
      const settingsBody = { userId: 'demo' };
      for (const [id, keys] of Object.entries(providerKeys)) {
        if (id === 'cloudflare') {
          settingsBody.cfApiKey = keys.apiKey;
          settingsBody.cfAccountId = keys.accountId;
        } else if (!['ollama', 'lmstudio'].includes(id)) {
          settingsBody[id] = keys.apiKey;
        }
      }
      await fetch(`${BACKEND_URL}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsBody),
      });
    } catch {}

    navigate('/ai');
  };

  const renderStep = () => {
    switch (step) {
      case 0: return renderWelcome();
      case 1: return renderSupabase();
      case 2: return renderAIKeys();
      case 3: return renderDatabase();
      case 4: return renderDone();
      default: return null;
    }
  };

  const titleStyle = {
    fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 8,
    letterSpacing: '-0.03em',
  };
  const subtitleStyle = {
    fontSize: 15, color: '#888', marginBottom: 32, lineHeight: 1.6,
  };
  const infoBoxStyle = {
    background: 'linear-gradient(135deg, rgba(163,230,53,0.08), rgba(59,130,246,0.06))',
    border: '1px solid rgba(163,230,53,0.15)',
    borderRadius: 12, padding: '16px 20px', color: '#bbb', fontSize: 14, lineHeight: 1.6,
    marginBottom: 24,
  };
  const inputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #333',
    background: '#0d0d0d', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };
  const labelStyle = {
    display: 'block', color: '#aaa', fontSize: 13, fontWeight: 500, marginBottom: 6,
    letterSpacing: '0.02em',
  };
  const btnPrimary = {
    padding: '12px 28px', borderRadius: 10, border: 'none',
    background: '#a3e635', color: '#000', fontSize: 15, fontWeight: 600,
    cursor: 'pointer', transition: 'all 0.2s',
  };
  const btnSecondary = {
    padding: '12px 28px', borderRadius: 10, border: '1px solid #333',
    background: 'transparent', color: '#fff', fontSize: 15, fontWeight: 500,
    cursor: 'pointer', transition: 'all 0.2s',
  };
  const btnDisabled = {
    ...btnPrimary, opacity: 0.4, cursor: 'not-allowed',
  };

  const containerStyle = {
    minHeight: '100vh', background: '#000',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: 24, fontFamily: 'system-ui, -apple-system, sans-serif',
  };

  const cardStyle = {
    width: '100%', maxWidth: 520,
    background: '#0d0d0d', borderRadius: 20,
    border: '1px solid rgba(163,230,53,0.08)',
    boxShadow: '0 0 60px rgba(163,230,53,0.03), 0 0 120px rgba(163,230,53,0.02)',
    padding: '40px 36px',
    animation: animDir === 'forward' ? 'pq-fade-slide 0.4s cubic-bezier(0.16, 1, 0.3, 1)' : 'pq-fade-slide-reverse 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
  };

  const handleFocus = e => {
    e.target.style.borderColor = '#a3e635';
    e.target.style.boxShadow = '0 0 0 3px rgba(163,230,53,0.15)';
  };
  const handleBlur = e => {
    e.target.style.borderColor = '#333';
    e.target.style.boxShadow = 'none';
  };

  // ─── Welcome Step ───────────────────────────────────
  const renderWelcome = () => (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ fontSize: 48, marginBottom: 12, textAlign: 'center', filter: 'drop-shadow(0 0 12px rgba(163,230,53,0.3))' }}>🪶</div>
        <h1 style={{ ...titleStyle, textAlign: 'center' }}>Welcome to PromptQuill</h1>
        <p style={{ ...subtitleStyle, textAlign: 'center' }}>
          You are 3 minutes away from your first AI brief
        </p>
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <button style={btnPrimary} onClick={() => goTo(1, 'forward')}>
            Let's Go →
          </button>
        </div>
      </div>
    </div>
  );

  // ─── Supabase Step ──────────────────────────────────
  const renderSupabase = () => (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Connect your database</h1>
        <div style={infoBoxStyle}>
          PromptQuill connects only to <strong style={{ color: '#a3e635' }}>YOUR</strong> Supabase project. Your data stays in your own database — no one else can access it.
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Supabase Project URL</label>
          <input style={inputStyle} placeholder="https://yourproject.supabase.co"
            value={supabaseUrl}
            onChange={e => { setSupabaseUrl(e.target.value); setTestResult(null); }}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Supabase Anon Key</label>
          <input style={inputStyle} placeholder="eyJhbGciOiJIUzI1NiIs..."
            value={supabaseAnonKey}
            onChange={e => { setSupabaseAnonKey(e.target.value); setTestResult(null); }}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Supabase Service Key</label>
          <input style={inputStyle} placeholder="eyJhbGciOiJIUzI1NiIs... (service_role key)"
            value={supabaseServiceKey}
            onChange={e => { setSupabaseServiceKey(e.target.value); }}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          <div style={{ color: '#888', fontSize: 12, marginTop: 4 }}>
            Dashboard → Project Settings → API → service_role key
          </div>
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Database Password <span style={{ color: '#a3e635', fontSize: 12 }}>(for auto table creation)</span></label>
          <input style={inputStyle} type="password" placeholder="Enter your Supabase database password"
            value={supabaseDbPassword}
            onChange={e => { setSupabaseDbPassword(e.target.value); }}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          <div style={{ color: '#888', fontSize: 12, marginTop: 4 }}>
            Dashboard → Project Settings → Database → Password
          </div>
        </div>

        <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer"
          style={{ color: '#a3e635', fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 24 }}>
          How to find these ↗
        </a>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <button style={testing ? btnDisabled : btnPrimary}
            disabled={testing || !supabaseUrl || !supabaseAnonKey}
            onClick={testSupabase}>
            {testing ? 'Testing...' : 'Test Connection'}
          </button>
          {testResult === true && <span style={{ fontSize: 22, animation: 'pq-check-in 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>✅</span>}
          {testResult === false && <span style={{ fontSize: 22, animation: 'pq-check-in 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>❌</span>}
          {testError && <div style={{ color: '#ef4444', fontSize: 13, marginTop: 8 }}>{testError}</div>}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24, gap: 10 }}>
          <button style={btnSecondary} onClick={() => goTo(0, 'back')}>Back</button>
          <button style={testResult === true ? btnPrimary : btnDisabled}
            disabled={testResult !== true}
            onClick={() => goTo(2, 'forward')}>
            Next →
          </button>
        </div>
      </div>
    </div>
  );

  // ─── AI Keys Step ───────────────────────────────────
  const renderAIKeys = () => (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Add your AI keys</h1>
        <div style={infoBoxStyle}>
          Your keys are stored only in your own database. They are never sent to or stored by anyone else.
        </div>

        {PROVIDERS.map(p => {
          const keys = providerKeys[p.id] || {};
          const result = providerResults[p.id];
          const isValid = result === true;
          return (
            <div key={p.id} style={{
              border: `1px solid ${isValid ? 'rgba(163,230,53,0.4)' : '#1a1a1a'}`,
              borderRadius: 12, padding: 16, marginBottom: 12,
              background: isValid ? 'rgba(163,230,53,0.03)' : 'rgba(255,255,255,0.02)',
              transition: 'border-color 0.3s, background 0.3s',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ color: '#fff', fontWeight: 600, fontSize: 15 }}>{p.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <a href={p.link} target="_blank" rel="noopener noreferrer"
                    style={{ color: '#666', fontSize: 12, textDecoration: 'none' }}>
                    Get Key ↗
                  </a>
                  {isValid && <span style={{ fontSize: 18, animation: 'pq-check-in 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>✅</span>}
                  {result === false && <span style={{ fontSize: 18, animation: 'pq-check-in 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>❌</span>}
                </div>
              </div>
              {p.fields.map(f => (
                <div key={f.key} style={{ marginBottom: 8 }}>
                  <input style={inputStyle} placeholder={f.label}
                    value={keys[f.key] || ''}
                    onChange={e => updateProviderKey(p.id, f.key, e.target.value)}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </div>
              ))}
              <button style={{
                ...btnSecondary, padding: '8px 18px', fontSize: 13,
                ...(testingProvider === p.id ? { opacity: 0.4, cursor: 'not-allowed' } : {}),
              }}
                disabled={testingProvider === p.id}
                onClick={() => testProvider(p.id)}>
                {testingProvider === p.id ? 'Testing...' : 'Test Keys'}
              </button>
            </div>
          );
        })}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24, gap: 10 }}>
          <button style={btnSecondary} onClick={() => goTo(1, 'back')}>Back</button>
          <button style={anyKeyValid ? btnPrimary : btnDisabled}
            disabled={!anyKeyValid}
            onClick={() => goTo(3, 'forward')}>
            Next →
          </button>
        </div>
      </div>
    </div>
  );

  // ─── Database Step ──────────────────────────────────
  const renderDatabase = () => (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Setting up your database</h1>
        <p style={subtitleStyle}>Creating tables in YOUR Supabase project</p>

        {setupError && (
          <div style={{
            background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 10, padding: '14px 18px', color: '#fca5a5', fontSize: 14, marginBottom: 20, lineHeight: 1.6,
          }}>
            {setupError}
          </div>
        )}

        <div style={{ marginBottom: 28 }}>
          {setupSteps.map((label, i) => {
            const prog = setupProgress[i];
            const status = prog ? prog.status : null;
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 0', borderBottom: '1px solid #141414',
                color: status === 'done' ? '#a3e635' : status === 'loading' ? '#fff' : '#555',
                fontSize: 14, transition: 'color 0.3s',
              }}>
                <span style={{ fontSize: 16, width: 24, textAlign: 'center' }}>
                  {status === 'done' ? <span style={{ animation: 'pq-check-in 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>✅</span> : status === 'loading' ? <span style={{ display: 'inline-block', animation: 'pq-spin 1s linear infinite', filter: 'drop-shadow(0 0 4px rgba(163,230,53,0.4))' }}>⏳</span> : '⏳'}
                </span>
                {label}
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16, gap: 10 }}>
          <button style={btnSecondary} onClick={() => goTo(2, 'back')}>Back</button>
          {!setupRunning && setupProgress.length < setupSteps.length && !setupError && (
            <button style={btnPrimary} onClick={runSetup}>Run Setup →</button>
          )}
          {!setupRunning && setupError && (
            <button style={btnPrimary} onClick={() => goTo(4, 'forward')}>Skip →</button>
          )}
          {setupProgress.length === setupSteps.length && !setupRunning && (
            <button style={btnPrimary} onClick={() => goTo(4, 'forward')}>Next →</button>
          )}
          {setupRunning && (
            <button style={btnDisabled} disabled>Running...</button>
          )}
        </div>
      </div>
    </div>
  );



  // ─── Done Step ──────────────────────────────────────
  const renderDone = () => {
    const validCount = validProviders.length;
    return (
      <div style={containerStyle}>
        <div style={{ ...cardStyle, textAlign: 'center' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(163,230,53,0.2), rgba(163,230,53,0.05))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
            animation: 'pq-check-in 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: '0 0 30px rgba(163,230,53,0.1)',
          }}>
            <span style={{ fontSize: 40 }}>✅</span>
          </div>

          <h1 style={{ ...titleStyle, textAlign: 'center' }}>PromptQuill is ready!</h1>

          <div style={{ textAlign: 'left', marginTop: 28, marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', color: '#a3e635', fontSize: 14, borderBottom: '1px solid #141414' }}>
              ✅ Your database connected
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', color: '#a3e635', fontSize: 14 }}>
              ✅ {validCount} AI provider{validCount !== 1 ? 's' : ''} configured
            </div>

          </div>

          <button style={{ ...btnPrimary, padding: '14px 36px', fontSize: 16 }} onClick={finish}>
            Open PromptQuill →
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#000',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      {/* Step progress dots */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 10,
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0,
        padding: '20px 24px',
        background: 'linear-gradient(180deg, rgba(0,0,0,1) 60%, transparent)',
      }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
            {i > 0 && (
              <div style={{
                width: 40, height: 2,
                background: i <= step ? '#a3e635' : '#1a1a1a',
                transition: 'background 0.4s',
              }} />
            )}
            <div style={{
              width: 12, height: 12, borderRadius: '50%',
              background: i < step
                ? 'linear-gradient(135deg, #a3e635, #84cc16)'
                : i === step
                  ? '#fff'
                  : '#1a1a1a',
              boxShadow: i === step ? '0 0 12px rgba(163,230,53,0.3)' : 'none',
              transition: 'all 0.4s',
            }} />
          </div>
        ))}
      </div>

      {renderStep()}
    </div>
  );
}
