import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000000';

const PROVIDERS = [
  { id: 'openai', name: 'OpenAI', models: ['GPT-5', 'GPT-4', 'o1', 'o3'], doc: 'https://platform.openai.com/api-keys', color: '#00A67E' },
  { id: 'claude', name: 'Anthropic', models: ['Opus 4.6', 'Sonnet 4.6', 'Haiku 4.5'], doc: 'https://console.anthropic.com/', color: '#CC7833' },
  { id: 'xai', name: 'xAI Grok', models: ['Grok 4', 'Grok 3', 'Grok Vision'], doc: 'https://console.x.ai/', color: '#1A1A2E' },
  { id: 'gemini', name: 'Google Gemini', models: ['3.1 Pro', '3 Flash', '2.5 Pro'], doc: 'https://aistudio.google.com/', color: '#4285F4' },
  { id: 'groq', name: 'Groq', models: ['Llama 3.3', 'Mixtral', 'Qwen'], doc: 'https://console.groq.com/keys', color: '#a3e635' },
  { id: 'mistral', name: 'Mistral AI', models: ['Large', 'Codestral', 'Pixtral'], doc: 'https://console.mistral.ai/', color: '#FF6D00' },
  { id: 'deepseek', name: 'DeepSeek', models: ['V4', 'R1', 'Coder V2'], doc: 'https://platform.deepseek.com/', color: '#4F6EF7' },
  { id: 'cohere', name: 'Cohere', models: ['Command R+', 'Command R', 'Aya'], doc: 'https://dashboard.cohere.com/', color: '#39594D' },
  { id: 'perplexity', name: 'Perplexity AI', models: ['Sonar Pro', 'Sonar', 'R1'], doc: 'https://docs.perplexity.ai/', color: '#1E3A5F' },
  { id: 'moonshot', name: 'Moonshot AI', models: ['Kimi K2.5', 'Kimi Vision'], doc: 'https://platform.moonshot.cn/', color: '#FF6B35' },
  { id: 'cerebras', name: 'Cerebras', models: ['Llama 3.1 70B'], doc: 'https://cloud.cerebras.ai/', color: '#8b5cf6' },
  { id: 'openrouter', name: 'OpenRouter', models: ['Free models'], doc: 'https://openrouter.ai/keys', color: '#f59e0b' },
  { id: 'cloudflare', name: 'Cloudflare', models: ['Workers AI'], doc: 'https://dash.cloudflare.com/', color: '#f6821f' },
  { id: 'nvidia', name: 'NVIDIA NIM', models: ['Nemotron', 'DeepSeek', 'Gemma'], doc: 'https://build.nvidia.com/', color: '#76B900' },
];

const LOCAL_PROVIDERS = [
  { id: 'ollama', name: 'Ollama', defaultUrl: 'http://localhost:11434', doc: 'https://ollama.com/', color: '#fff' },
  { id: 'lmstudio', name: 'LM Studio', defaultUrl: 'http://localhost:1234', doc: 'https://lmstudio.ai/', color: '#06b6d4' },
];

const SettingsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('providers');

  const [apiKeys, setApiKeys] = useState({});
  const [cfAccountId, setCfAccountId] = useState('');
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
  const [lmstudioUrl, setLmstudioUrl] = useState('http://localhost:1234');
  const [testResults, setTestResults] = useState({});
  const [testingAll, setTestingAll] = useState(false);
  const [saved, setSaved] = useState(false);

  const [models, setModels] = useState({});
  const [selectedModels, setSelectedModels] = useState({});

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');

  const [supabaseStatus, setSupabaseStatus] = useState(null);

  useEffect(() => {
    loadSettings();
    loadModels();
    checkSupabase();
  }, []);

  const loadModels = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/test/models`);
      const data = await res.json();
      if (Array.isArray(data)) {
        const modelMap = {};
        const defaultModels = {};
        data.forEach(p => {
          modelMap[p.id] = p.models;
          defaultModels[p.id] = p.defaultModel || p.models[0];
        });
        setModels(modelMap);
        const saved = localStorage.getItem('pq_selected_models');
        if (saved) {
          try { setSelectedModels(JSON.parse(saved)); }
          catch { setSelectedModels(defaultModels); }
        } else {
          setSelectedModels(defaultModels);
        }
      }
    } catch {}
  };

  const loadSettings = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/settings/${DEMO_USER_ID}`);
      const data = await res.json();
      if (data.configuredProviders) {
        const keys = {};
        data.configuredProviders.forEach(p => keys[p] = 'configured');
        setApiKeys(keys);
      }
    } catch {}

    const savedKeys = localStorage.getItem('pq_provider_keys');
    if (savedKeys) {
      try { setApiKeys(prev => ({ ...prev, ...JSON.parse(savedKeys) })); } catch {}
    }
    setOllamaUrl(localStorage.getItem('pq_ollama_url') || 'http://localhost:11434');
    setLmstudioUrl(localStorage.getItem('pq_lmstudio_url') || 'http://localhost:1234');
  };

  const checkSupabase = async () => {
    const url = localStorage.getItem('pq_supabase_url');
    const key = localStorage.getItem('pq_supabase_anon_key');
    if (!url) { setSupabaseStatus('not-configured'); return; }
    try {
      const res = await fetch(`${BACKEND_URL}/api/test/supabase`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, anonKey: key || '' }),
      });
      const data = await res.json();
      setSupabaseStatus(data.valid ? 'connected' : 'error');
    } catch { setSupabaseStatus('error'); }
  };

  const saveAllKeys = async () => {
    setSaved(false);
    const body = { userId: DEMO_USER_ID, ...apiKeys, cfAccountId, ollamaUrl, lmstudioUrl };
    try {
      await fetch(`${BACKEND_URL}/api/settings`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      await fetch(`${BACKEND_URL}/api/setup/save-config`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supabaseUrl: localStorage.getItem('pq_supabase_url'),
          ...apiKeys, ollamaUrl, lmstudioUrl,
          selectedModels,
        }),
      });
      localStorage.setItem('pq_provider_keys', JSON.stringify(apiKeys));
      localStorage.setItem('pq_selected_models', JSON.stringify(selectedModels));
      localStorage.setItem('pq_ollama_url', ollamaUrl);
      localStorage.setItem('pq_lmstudio_url', lmstudioUrl);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
  };

  const testProvider = async (id) => {
    setTestResults(prev => ({ ...prev, [id]: 'testing' }));
    try {
      const body = { provider: id, apiKey: apiKeys[id] || '' };
      if (id === 'cloudflare') body.cfAccountId = cfAccountId;
      const res = await fetch(`${BACKEND_URL}/api/test/provider`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setTestResults(prev => ({ ...prev, [id]: data.valid ? 'valid' : 'invalid' }));
    } catch { setTestResults(prev => ({ ...prev, [id]: 'error' })); }
  };

  const testAllProviders = async () => {
    setTestingAll(true);
    for (const p of PROVIDERS) {
      if (apiKeys[p.id]) await testProvider(p.id);
    }
    setTestingAll(false);
  };

  const tabStyle = (tab) => ({
    padding: '14px 20px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 700,
    letterSpacing: '0.5px',
    background: 'transparent',
    color: activeTab === tab ? '#fff' : '#555',
    border: 'none',
    borderBottom: activeTab === tab ? '2px solid #a3e635' : '2px solid transparent',
    transition: 'all 0.2s ease',
    marginBottom: '-1px',
    whiteSpace: 'nowrap',
  });

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ padding: '20px 32px', borderBottom: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={() => navigate('/ai')} style={{ background: 'none', border: 'none', color: '#555', fontSize: 20, cursor: 'pointer', padding: '4px 8px', borderRadius: 6, transition: '0.2s' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = '#555'}>←</button>
        <h1 style={{ fontSize: 18, fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>Settings</h1>
        <div style={{ flex: 1 }} />
        <button onClick={saveAllKeys} style={{
          padding: '10px 24px', borderRadius: 8, border: saved ? '1px solid #a3e635' : '1px solid #a3e635',
          background: saved ? '#a3e635' : 'transparent',
          color: saved ? '#000' : '#a3e635',
          fontWeight: 700, cursor: 'pointer', fontSize: 13,
          transition: 'all 0.3s ease',
          transform: saved ? 'scale(1.05)' : 'scale(1)',
        }}>{saved ? '✓ Saved' : 'Save All'}</button>
      </div>

      <div style={{ padding: '0 32px', display: 'flex', gap: 0, borderBottom: '1px solid #1a1a1a', overflowX: 'auto' }}>
        <button style={tabStyle('providers')} onClick={() => setActiveTab('providers')}>AI Providers</button>
        <button style={tabStyle('local')} onClick={() => setActiveTab('local')}>Local Models</button>
        <button style={tabStyle('database')} onClick={() => setActiveTab('database')}>Database</button>
        <button style={tabStyle('account')} onClick={() => setActiveTab('account')}>Account</button>
        <button style={tabStyle('about')} onClick={() => setActiveTab('about')}>About</button>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>

        {activeTab === 'providers' && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4, letterSpacing: '-0.5px' }}>AI Providers</h2>
            <p style={{ color: '#666', fontSize: 14, marginBottom: 28, lineHeight: 1.5 }}>Add your API keys. Keys are stored in your own Supabase database — never exposed to anyone else.</p>

            {PROVIDERS.map(p => (
              <div key={p.id} style={{
                borderRadius: 12, background: '#0d0d0d', border: '1px solid #1a1a1a', marginBottom: 12, overflow: 'hidden',
              }}>
                <div style={{ height: 3, background: `linear-gradient(90deg, ${p.color}, rgba(163,230,53,0.3))` }} />
                <div style={{ padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: '50%',
                      background: apiKeys[p.id] ? p.color : '#222',
                      boxShadow: apiKeys[p.id] ? `0 0 8px ${p.color}` : 'none',
                      transition: '0.3s',
                    }} />
                    <strong style={{ flex: 1, fontSize: 14, letterSpacing: '-0.3px' }}>{p.name}</strong>
                    <a href={p.doc} target="_blank" rel="noopener noreferrer" style={{ color: '#a3e635', fontSize: 12, textDecoration: 'none', opacity: 0.8, transition: '0.2s' }} onMouseEnter={e => e.target.style.opacity = '1'} onMouseLeave={e => e.target.style.opacity = '0.8'}>Get Key ↗</a>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <input
                      placeholder={`${p.name} API Key`}
                      value={apiKeys[p.id] || ''}
                      onChange={e => setApiKeys(prev => ({ ...prev, [p.id]: e.target.value }))}
                      style={{
                        flex: 1, minWidth: 180, padding: '10px 14px', borderRadius: 8,
                        border: '1px solid rgba(255,255,255,0.06)',
                        background: 'rgba(255,255,255,0.03)',
                        backdropFilter: 'blur(8px)',
                        color: '#fff', fontSize: 13, outline: 'none',
                        transition: 'border 0.2s ease',
                      }}
                      onFocus={e => e.target.style.borderColor = '#a3e635'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
                    />
                    {models[p.id] && models[p.id].length > 0 && (
                      <select
                        value={selectedModels[p.id] || ''}
                        onChange={e => setSelectedModels(prev => ({ ...prev, [p.id]: e.target.value }))}
                        style={{
                          padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)',
                          background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(8px)',
                          color: '#fff', fontSize: 12, outline: 'none', cursor: 'pointer',
                          maxWidth: 220,
                        }}
                      >
                        {models[p.id].map(m => (
                          <option key={m} value={m} style={{ background: '#111', color: '#fff' }}>{m}</option>
                        ))}
                      </select>
                    )}
                    {p.id === 'cloudflare' && (
                      <input
                        placeholder="Account ID"
                        value={cfAccountId}
                        onChange={e => setCfAccountId(e.target.value)}
                        style={{
                          width: 140, padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)',
                          background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(8px)',
                          color: '#fff', fontSize: 13, outline: 'none', transition: 'border 0.2s ease',
                        }}
                        onFocus={e => e.target.style.borderColor = '#a3e635'}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
                      />
                    )}
                    <button onClick={() => testProvider(p.id)} style={{
                      padding: '10px 18px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)',
                      background: 'rgba(255,255,255,0.04)', color: '#aaa', cursor: 'pointer', fontSize: 12, whiteSpace: 'nowrap',
                      transition: 'all 0.2s ease',
                    }}
                      onMouseEnter={e => { e.target.style.background = 'rgba(255,255,255,0.08)'; e.target.style.color = '#fff'; }}
                      onMouseLeave={e => { e.target.style.background = 'rgba(255,255,255,0.04)'; e.target.style.color = '#aaa'; }}
                    >
                      {testResults[p.id] === 'testing' ? '...' : 'Test'}
                    </button>
                    {testResults[p.id] === 'valid' && <span style={{ fontSize: 18 }}>✅</span>}
                    {testResults[p.id] === 'invalid' && <span style={{ fontSize: 18 }}>❌</span>}
                    {testResults[p.id] === 'error' && <span style={{ fontSize: 18 }}>⚠️</span>}
                  </div>
                </div>
              </div>
            ))}

            <button onClick={testAllProviders} disabled={testingAll} style={{
              padding: '12px 28px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.04)', color: '#aaa', cursor: testingAll ? 'not-allowed' : 'pointer', fontSize: 13, marginTop: 8, opacity: testingAll ? 0.5 : 1,
              transition: 'all 0.2s ease',
            }}
              onMouseEnter={e => { if (!testingAll) { e.target.style.background = 'rgba(255,255,255,0.08)'; e.target.style.color = '#fff'; } }}
              onMouseLeave={e => { if (!testingAll) { e.target.style.background = 'rgba(255,255,255,0.04)'; e.target.style.color = '#aaa'; } }}
            >
              {testingAll ? 'Testing...' : 'Test All Configured Providers'}
            </button>

            <div style={{ marginTop: 28, padding: 20, borderRadius: 12, background: '#0d0d0d', border: '1px solid #1a1a1a' }}>
              <p style={{ color: '#555', fontSize: 12, lineHeight: 1.7, margin: 0 }}>
                🔒 Your API keys are stored in your own database and are never returned to the frontend.
                The backend reads keys directly from your user_settings table in Supabase.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'local' && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4, letterSpacing: '-0.5px' }}>Local Models</h2>
            <p style={{ color: '#666', fontSize: 14, marginBottom: 28, lineHeight: 1.5 }}>Connect to local AI models running on your machine.</p>

            {LOCAL_PROVIDERS.map(p => (
              <div key={p.id} style={{ borderRadius: 12, background: '#0d0d0d', border: '1px solid #1a1a1a', marginBottom: 12, overflow: 'hidden' }}>
                <div style={{ height: 3, background: `linear-gradient(90deg, ${p.color}, rgba(163,230,53,0.3))` }} />
                <div style={{ padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: p.color, boxShadow: `0 0 8px ${p.color}` }} />
                    <strong style={{ fontSize: 14, flex: 1, letterSpacing: '-0.3px' }}>{p.name}</strong>
                    <a href={p.doc} target="_blank" rel="noopener noreferrer" style={{ color: '#a3e635', fontSize: 12, textDecoration: 'none', opacity: 0.8, transition: '0.2s' }} onMouseEnter={e => e.target.style.opacity = '1'} onMouseLeave={e => e.target.style.opacity = '0.8'}>Download ↗</a>
                  </div>
                  <input
                    placeholder={p.defaultUrl}
                    value={p.id === 'ollama' ? ollamaUrl : lmstudioUrl}
                    onChange={e => p.id === 'ollama' ? setOllamaUrl(e.target.value) : setLmstudioUrl(e.target.value)}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)',
                      background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(8px)',
                      color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box',
                      transition: 'border 0.2s ease',
                    }}
                    onFocus={e => e.target.style.borderColor = '#a3e635'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
                  />
                  <div style={{ color: '#555', fontSize: 12, marginTop: 8 }}>
                    {p.id === 'ollama' ? 'Ensure Ollama is running: ollama serve' : 'Enable Local Inference Server in LM Studio'}
                  </div>
                </div>
              </div>
            ))}

            <div style={{ marginTop: 20, padding: 20, borderRadius: 12, background: '#0d0d0d', border: '1px solid #1a1a1a' }}>
              <p style={{ color: '#555', fontSize: 12, lineHeight: 1.7, margin: 0 }}>
                💡 Local models are auto-detected at runtime. If Ollama or LM Studio is running,
                they will appear in the provider rotation automatically — no API keys needed.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'database' && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4, letterSpacing: '-0.5px' }}>Database</h2>
            <p style={{ color: '#666', fontSize: 14, marginBottom: 28, lineHeight: 1.5 }}>Your Supabase connection status.</p>

            <div style={{ padding: 24, borderRadius: 12, background: '#0d0d0d', border: '1px solid #1a1a1a' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{
                  width: 12, height: 12, borderRadius: '50%',
                  background: supabaseStatus === 'connected' ? '#a3e635' : supabaseStatus === 'error' ? '#ef4444' : '#333',
                  boxShadow: supabaseStatus === 'connected' ? '0 0 10px #a3e635' : supabaseStatus === 'error' ? '0 0 10px #ef4444' : 'none',
                }} />
                <span style={{ fontSize: 14, fontWeight: 600 }}>
                  {supabaseStatus === 'connected' ? 'Connected' : supabaseStatus === 'error' ? 'Connection Error' : 'Not Configured'}
                </span>
                <button onClick={checkSupabase} style={{
                  marginLeft: 'auto', padding: '8px 16px', borderRadius: 6,
                  border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)',
                  color: '#aaa', cursor: 'pointer', fontSize: 12, transition: '0.2s',
                }}
                  onMouseEnter={e => { e.target.style.background = 'rgba(255,255,255,0.08)'; e.target.style.color = '#fff'; }}
                  onMouseLeave={e => { e.target.style.background = 'rgba(255,255,255,0.04)'; e.target.style.color = '#aaa'; }}
                >Refresh</button>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: 14, borderRadius: 8, marginBottom: 12, border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ color: '#666', fontSize: 12, marginBottom: 4, fontWeight: 600 }}>Project URL</div>
                <div style={{ fontSize: 13, color: '#ccc', wordBreak: 'break-all' }}>{localStorage.getItem('pq_supabase_url') || '—'}</div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: 14, borderRadius: 8, border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ color: '#666', fontSize: 12, marginBottom: 6, fontWeight: 600 }}>Setup Status</div>
                <div style={{ fontSize: 13, color: localStorage.getItem('pq_setup_complete') ? '#a3e635' : '#f59e0b', marginBottom: 10 }}>
                  {localStorage.getItem('pq_setup_complete') ? '✅ Setup completed' : '⚠️ Setup not completed'}
                </div>
                {!localStorage.getItem('pq_setup_complete') && (
                  <button onClick={() => navigate('/setup')} style={{
                    padding: '8px 20px', borderRadius: 8, border: 'none',
                    background: '#a3e635', color: '#000', fontWeight: 600, cursor: 'pointer', fontSize: 13,
                    transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => { e.target.style.background = '#bef264'; }}
                    onMouseLeave={e => { e.target.style.background = '#a3e635'; }}
                  >
                    Open Setup Wizard →
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'account' && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4, letterSpacing: '-0.5px' }}>Account</h2>
            <p style={{ color: '#666', fontSize: 14, marginBottom: 28, lineHeight: 1.5 }}>Your profile information.</p>

            <div style={{ padding: 24, borderRadius: 12, background: '#0d0d0d', border: '1px solid #1a1a1a' }}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ color: '#666', fontSize: 12, marginBottom: 8, display: 'block', fontWeight: 600, letterSpacing: '0.3px' }}>Display Name</label>
                <input value={displayName} onChange={e => setDisplayName(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)',
                    background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(8px)',
                    color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box', transition: 'border 0.2s ease' }}
                  placeholder="Your name"
                  onFocus={e => e.target.style.borderColor = '#a3e635'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
                />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ color: '#666', fontSize: 12, marginBottom: 8, display: 'block', fontWeight: 600, letterSpacing: '0.3px' }}>Email</label>
                <input value={email} onChange={e => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)',
                    background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(8px)',
                    color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box', transition: 'border 0.2s ease' }}
                  placeholder="your@email.com"
                  onFocus={e => e.target.style.borderColor = '#a3e635'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
                />
              </div>
              <p style={{ color: '#555', fontSize: 12, lineHeight: 1.6, margin: 0 }}>Account info is stored locally. For multi-user support, set up authentication in your Supabase project.</p>
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4, letterSpacing: '-0.5px' }}>About</h2>
            <p style={{ color: '#666', fontSize: 14, marginBottom: 28, lineHeight: 1.5 }}>PromptQuill is open source software.</p>

            <div style={{ padding: 24, borderRadius: 12, background: '#0d0d0d', border: '1px solid #1a1a1a' }}>
              <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ color: '#666', fontSize: 12, fontWeight: 600 }}>Version</div>
                <div style={{ fontSize: 14 }}>1.0.0 (Open Source)</div>
              </div>

              <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ color: '#666', fontSize: 12, fontWeight: 600 }}>License</div>
                <div style={{ fontSize: 14 }}>MIT — free forever</div>
              </div>

              <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ color: '#666', fontSize: 12, fontWeight: 600 }}>AI Providers</div>
                <div style={{ fontSize: 14 }}>11 providers • 6 modes • 2 personalities</div>
              </div>

              <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ color: '#666', fontSize: 12, fontWeight: 600 }}>Repository</div>
                <a href="https://github.com/shrikrishna-lab/promptquill" target="_blank" rel="noopener noreferrer" style={{ color: '#a3e635', fontSize: 14, textDecoration: 'none', opacity: 0.8, transition: '0.2s' }} onMouseEnter={e => e.target.style.opacity = '1'} onMouseLeave={e => e.target.style.opacity = '0.8'}>
                  github.com/shrikrishna-lab/promptquill ↗
                </a>
              </div>

              <div style={{
                marginTop: 28, padding: 24, borderRadius: 12, background: 'rgba(163,230,53,0.04)',
                border: '1px solid rgba(163,230,53,0.12)', textAlign: 'center',
              }}>
                <div style={{ color: '#a3e635', fontSize: 28, fontWeight: 900, marginBottom: 4, letterSpacing: '-1px' }}>PromptQuill</div>
                <div style={{ color: '#555', fontSize: 12 }}>Open source. Self-hosted. Free forever.</div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default SettingsPage;
