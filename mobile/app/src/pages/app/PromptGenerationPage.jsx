import React, { useEffect, useMemo, useState } from 'react';
import {
  Check,
  Coins,
  Copy,
  Loader,
  Save,
  Sparkles,
  WandSparkles
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  PromptMemory,
  generateInitialTabs,
  generateTabContent
} from '../../lib/ai.js';
import {
  INITIAL_TABS,
  getProTabsForMode,
  getTabsForMode,
  normalizeMode
} from '../../lib/promptModeRegistry.js';
import { getCredits, deductCredits, getActionCost } from '../../lib/credits.js';
import { checkProStatus, logUsage } from '../../lib/pro.js';
import { supabase } from '../../lib/supabase.mobile.js';

const cardStyle = {
  background: 'rgba(18, 18, 28, 0.94)',
  border: '1px solid rgba(255, 255, 255, 0.07)',
  borderRadius: '22px',
  padding: '18px'
};

const modeOptions = [
  { id: 'GENERAL', label: 'General' },
  { id: 'CODING', label: 'Coding' },
  { id: 'CONTENT', label: 'Content' },
  { id: 'CREATIVE', label: 'Creative' },
  { id: 'STARTUP_LITE', label: 'Startup Lite' },
  { id: 'STARTUP', label: 'Startup Pro' }
];

const prettifyTabName = (tabId) =>
  tabId
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const compileTabsToText = (tabs, mode) => {
  const orderedTabs = getTabsForMode(mode) || Object.keys(tabs || {});

  return orderedTabs
    .filter((tabId) => tabs?.[tabId])
    .map((tabId) => `${prettifyTabName(tabId)}\n\n${tabs[tabId]}`)
    .join('\n\n---\n\n');
};

function PromptGenerationPage({ profile, session }) {
  const [searchParams] = useSearchParams();
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState('GENERAL');
  const [result, setResult] = useState(null);
  const [credits, setCredits] = useState({ balance: 0 });
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingTabId, setLoadingTabId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [sessionId, setSessionId] = useState('');

  const currentMode = normalizeMode(result?.mode || mode);
  const modeTabs = useMemo(() => getTabsForMode(currentMode) || [], [currentMode]);
  const proTabs = useMemo(() => new Set(getProTabsForMode(currentMode)), [currentMode]);

  const refreshCredits = async () => {
    if (!session?.user?.id) return;
    const [creditSnapshot, proStatus] = await Promise.all([
      getCredits(session.user.id),
      checkProStatus(session.user.id)
    ]);

    setCredits(creditSnapshot || { balance: 0 });
    setIsPro(proStatus);
  };

  const persistResult = async (nextResult, nextPrompt, nextMode) => {
    if (!session?.user?.id || !nextResult) return '';

    const payload = {
      user_id: session.user.id,
      title:
        nextPrompt.length > 56
          ? `${nextPrompt.slice(0, 56).trimEnd()}...`
          : nextPrompt,
      input_text: nextPrompt,
      mode: nextMode,
      final_prompt: JSON.stringify({
        tabs: nextResult.tabs || {}
      }),
      score: nextResult.score || 0,
      difficulty: nextResult.difficulty || 'Prompt Session',
      difficulty_hours: nextResult.difficulty_hours || 0,
      issues_count: Array.isArray(nextResult.issues) ? nextResult.issues.length : 0,
      suggestions_count: Array.isArray(nextResult.suggestions) ? nextResult.suggestions.length : 0,
      updated_at: new Date().toISOString()
    };

    let activeSessionId = sessionId;

    if (activeSessionId) {
      await supabase.from('sessions').update(payload).eq('id', activeSessionId);
    } else {
      const { data: insertedSession } = await supabase
        .from('sessions')
        .insert([payload])
        .select()
        .single();

      activeSessionId = insertedSession?.id || '';
      setSessionId(activeSessionId);
    }

    if (activeSessionId) {
      const { data: versions } = await supabase
        .from('prompt_versions')
        .select('version_number')
        .eq('session_id', activeSessionId)
        .order('version_number', { ascending: false })
        .limit(1);

      const nextVersion = versions?.length ? versions[0].version_number + 1 : 1;
      await supabase.from('prompt_versions').insert([
        {
          session_id: activeSessionId,
          version_number: nextVersion,
          prompt_text: JSON.stringify(nextResult),
          score: nextResult.score || 0
        }
      ]);
    }

    PromptMemory.recordBrief(nextPrompt, nextResult, nextResult.tokensUsed || 0);
    return activeSessionId;
  };

  const loadSavedSession = async (id) => {
    if (!id) return;

    const { data: version } = await supabase
      .from('prompt_versions')
      .select('prompt_text')
      .eq('session_id', id)
      .order('version_number', { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: savedSession } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (!savedSession) {
      return;
    }

    setPrompt(savedSession.input_text || savedSession.title || '');
    setMode(normalizeMode(savedSession.mode || 'GENERAL'));
    setSessionId(savedSession.id);

    if (version?.prompt_text) {
      try {
        setResult(JSON.parse(version.prompt_text));
      } catch {
        setResult(null);
      }
    }
  };

  useEffect(() => {
    refreshCredits().catch((refreshError) => {
      console.error('Failed to refresh mobile credits:', refreshError);
    });

    const selectedSessionId = searchParams.get('session');
    if (selectedSessionId) {
      loadSavedSession(selectedSessionId).catch((loadError) => {
        console.error('Failed to load saved session:', loadError);
      });
    }

    const handleCreditEvent = () => {
      refreshCredits().catch(() => {});
    };

    window.addEventListener('creditsUpdated', handleCreditEvent);
    return () => {
      window.removeEventListener('creditsUpdated', handleCreditEvent);
    };
  }, [searchParams, session?.user?.id]);

  const handleGenerate = async () => {
    const trimmedPrompt = prompt.trim();
    if (trimmedPrompt.length < 10) {
      setError('Please describe what you want in a little more detail.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const metadata = {
        userId: session.user.id,
        userEmail: session.user.email,
        isPro,
        personality: 'bot'
      };

      const generated = await generateInitialTabs(trimmedPrompt, mode, metadata);

      if (generated?.success === false) {
        throw new Error(generated.error || 'Prompt generation failed.');
      }

      const normalizedResult = {
        ...generated,
        mode: generated.mode || normalizeMode(mode),
        tabs: generated.tabs || {}
      };

      setResult(normalizedResult);
      setMode(normalizedResult.mode);
      await persistResult(normalizedResult, trimmedPrompt, normalizedResult.mode);

      if (!isPro && !generated.creditsUsed) {
        const initialCost = generated._creditsForInitial || getActionCost('generate', normalizedResult);
        await deductCredits(
          session.user.id,
          Math.max(0, Number(initialCost) || 0),
          generated._providerUsed || 'groq',
          `Mobile prompt generation (${normalizedResult.mode})`
        );
      }

      await refreshCredits();
      await logUsage(session.user.id, 'generate');
      toast.success('Prompt generated inside the app.');
    } catch (generationError) {
      console.error('Mobile generation failed:', generationError);
      setError(generationError.message || 'Prompt generation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTab = async (tabId) => {
    if (!result || !prompt.trim()) return;

    setLoadingTabId(tabId);
    setError('');

    try {
      const tabResult = await generateTabContent(prompt.trim(), result.mode, tabId, result.tabs || {}, {
        userId: session.user.id,
        userEmail: session.user.email,
        isPro,
        personality: 'bot'
      });

      if (!tabResult.success) {
        throw new Error(tabResult.error || 'Unable to generate this section.');
      }

      const nextResult = {
        ...result,
        tabs: {
          ...(result.tabs || {}),
          [tabId]: tabResult.content
        }
      };

      setResult(nextResult);
      await persistResult(nextResult, prompt.trim(), nextResult.mode);

      if (!isPro && tabResult.creditsDeducted > 0) {
        await deductCredits(
          session.user.id,
          tabResult.creditsDeducted,
          'groq',
          `Mobile prompt tab generation (${tabId})`
        );
      }

      await refreshCredits();
      toast.success(`${prettifyTabName(tabId)} is ready.`);
    } catch (tabError) {
      console.error('Mobile tab generation failed:', tabError);
      setError(tabError.message || 'Unable to generate that section.');
    } finally {
      setLoadingTabId('');
    }
  };

  const handleCopy = async () => {
    if (!result?.tabs) return;

    await navigator.clipboard.writeText(compileTabsToText(result.tabs, result.mode));
    toast.success('Prompt copied to clipboard.');
  };

  const handleSave = async () => {
    if (!result) return;

    setSaving(true);

    try {
      await persistResult(result, prompt.trim(), result.mode);
      toast.success('Saved to your in-app history.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <section style={{ ...cardStyle, display: 'grid', gridTemplateColumns: '1fr auto', gap: '14px' }}>
        <div>
          <div style={{ color: '#a1a1aa', fontSize: '13px', marginBottom: '6px' }}>Credits available</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '14px',
                background: 'rgba(163, 230, 53, 0.14)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Coins size={18} color="#d9f99d" />
            </div>
            <div>
              <div style={{ fontSize: '26px', fontWeight: 900 }}>{credits.balance ?? 0}</div>
              <div style={{ color: '#a1a1aa', fontSize: '13px' }}>
                {isPro || profile?.is_pro ? 'Pro account' : 'Free account'}
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            alignSelf: 'start',
            padding: '10px 12px',
            borderRadius: '14px',
            background: 'rgba(109, 40, 217, 0.16)',
            color: '#e9d5ff',
            fontSize: '12px',
            fontWeight: 800
          }}
        >
          Local mobile flow
        </div>
      </section>

      <section style={cardStyle}>
        <div style={{ marginBottom: '14px' }}>
          <h2 style={{ margin: '0 0 6px', fontSize: '24px', fontWeight: 900 }}>Generate</h2>
          <p style={{ margin: 0, color: '#a1a1aa', fontSize: '14px', lineHeight: 1.6 }}>
            Build prompts directly inside the app. No landing page, no web redirect, no handoff.
          </p>
        </div>

        <label style={{ display: 'block', marginBottom: '14px' }}>
          <span style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1', fontSize: '13px' }}>
            What do you want to generate?
          </span>
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Describe the prompt outcome you want..."
            style={{
              width: '100%',
              minHeight: '156px',
              resize: 'vertical',
              borderRadius: '18px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              background: '#11131a',
              color: '#f8fafc',
              padding: '16px',
              fontSize: '15px',
              lineHeight: 1.6,
              boxSizing: 'border-box',
              outline: 'none'
            }}
          />
        </label>

        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
          {modeOptions.map((option) => {
            const active = normalizeMode(mode) === option.id;
            const disabled = option.id === 'STARTUP' && !isPro;

            return (
              <button
                key={option.id}
                type="button"
                disabled={disabled}
                onClick={() => setMode(option.id)}
                style={{
                  flex: '0 0 auto',
                  minHeight: '44px',
                  padding: '0 14px',
                  borderRadius: '999px',
                  border: active ? '1px solid transparent' : '1px solid rgba(255, 255, 255, 0.08)',
                  background: active ? '#a3e635' : disabled ? '#161922' : '#11131a',
                  color: active ? '#05070d' : disabled ? '#52525b' : '#f8fafc',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: disabled ? 'not-allowed' : 'pointer'
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        {error ? (
          <div
            style={{
              marginTop: '14px',
              borderRadius: '16px',
              border: '1px solid rgba(239, 68, 68, 0.28)',
              background: 'rgba(127, 29, 29, 0.22)',
              color: '#fecaca',
              padding: '14px 16px',
              fontSize: '14px',
              lineHeight: 1.5
            }}
          >
            {error}
          </div>
        ) : null}
      </section>

      {result ? (
        <section style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#a1a1aa', marginBottom: '4px' }}>Current result</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="#d9f99d" />
                <strong style={{ fontSize: '18px' }}>{prettifyTabName(currentMode.toLowerCase())} prompt set</strong>
              </div>
            </div>
            <div
              style={{
                padding: '10px 12px',
                borderRadius: '14px',
                background: 'rgba(163, 230, 53, 0.12)',
                color: '#d9f99d',
                fontWeight: 800,
                fontSize: '14px'
              }}
            >
              Score {result.score || 0}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' }}>
            <button
              type="button"
              onClick={handleCopy}
              style={{
                minHeight: '46px',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                background: '#11131a',
                color: '#f8fafc',
                fontWeight: 800,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              <Copy size={16} />
              Copy
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              style={{
                minHeight: '46px',
                borderRadius: '16px',
                border: 'none',
                background: saving ? '#64748b' : '#a3e635',
                color: '#05070d',
                fontWeight: 900,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: saving ? 'not-allowed' : 'pointer'
              }}
            >
              <Save size={16} />
              {saving ? 'Saving...' : 'Save to History'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {modeTabs.map((tabId) => {
              const content = result.tabs?.[tabId];
              const locked = proTabs.has(tabId) && !isPro;

              return (
                <article
                  key={tabId}
                  style={{
                    borderRadius: '18px',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    background: '#11131a',
                    overflow: 'hidden'
                  }}
                >
                  <div
                    style={{
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    <div style={{ fontWeight: 800 }}>{prettifyTabName(tabId)}</div>
                    {content ? (
                      <span style={{ color: '#a3e635', fontSize: '12px', fontWeight: 800 }}>
                        <Check size={14} style={{ verticalAlign: 'text-bottom' }} /> Ready
                      </span>
                    ) : locked ? (
                      <span style={{ color: '#e9d5ff', fontSize: '12px', fontWeight: 800 }}>Pro</span>
                    ) : (
                      <span style={{ color: '#a1a1aa', fontSize: '12px' }}>Not generated yet</span>
                    )}
                  </div>

                  {content ? (
                    <div
                      style={{
                        padding: '16px',
                        color: '#e4e4e7',
                        fontSize: '14px',
                        lineHeight: 1.7,
                        whiteSpace: 'pre-wrap',
                        maxHeight: '320px',
                        overflowY: 'auto'
                      }}
                    >
                      {content}
                    </div>
                  ) : locked ? (
                    <div style={{ padding: '16px', color: '#c4b5fd', fontSize: '14px', lineHeight: 1.6 }}>
                      This section is reserved for Pro accounts. Upgrade inside the app to unlock it.
                    </div>
                  ) : (
                    <div style={{ padding: '16px' }}>
                      <button
                        type="button"
                        onClick={() => handleGenerateTab(tabId)}
                        disabled={loadingTabId === tabId}
                        style={{
                          width: '100%',
                          minHeight: '46px',
                          borderRadius: '16px',
                          border: '1px solid rgba(163, 230, 53, 0.18)',
                          background: 'rgba(163, 230, 53, 0.08)',
                          color: '#d9f99d',
                          fontWeight: 800,
                          fontSize: '14px',
                          cursor: loadingTabId === tabId ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px'
                        }}
                      >
                        {loadingTabId === tabId ? <Loader size={16} className="spin" /> : <WandSparkles size={16} />}
                        {loadingTabId === tabId ? 'Generating...' : 'Generate This Section'}
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      <div
        style={{
          position: 'sticky',
          bottom: '12px',
          paddingTop: '6px'
        }}
      >
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          style={{
            width: '100%',
            minHeight: '58px',
            borderRadius: '20px',
            border: 'none',
            background: loading ? '#64748b' : '#a3e635',
            color: '#05070d',
            fontSize: '16px',
            fontWeight: 900,
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 24px 50px rgba(0, 0, 0, 0.35)'
          }}
        >
          {loading ? 'Generating Prompt...' : 'Generate Prompt'}
        </button>
      </div>
    </div>
  );
}

export default PromptGenerationPage;
