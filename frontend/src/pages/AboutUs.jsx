import React from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#000',
    color: '#e5e5e5',
    paddingTop: '80px',
  },
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '60px 20px',
  },
  backBtn: {
    background: 'transparent',
    border: '1px solid #1a1a1a',
    color: '#a3e635',
    fontSize: '14px',
    cursor: 'pointer',
    marginBottom: '30px',
    padding: '8px 16px',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
  },
  heading1: {
    fontSize: '48px',
    fontWeight: '800',
    marginBottom: '10px',
    color: '#a3e635',
    letterSpacing: '-0.02em',
    lineHeight: 1.1,
  },
  subtitle: {
    color: '#666',
    marginBottom: '50px',
    fontSize: '16px',
    borderLeft: '3px solid #a3e635',
    paddingLeft: '16px',
  },
  section: {
    marginBottom: '50px',
    background: '#0d0d0d',
    border: '1px solid #1a1a1a',
    borderRadius: '16px',
    padding: '36px',
  },
  sectionNoCard: {
    marginBottom: '50px',
  },
  h2: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#a3e635',
    marginBottom: '18px',
    letterSpacing: '-0.01em',
  },
  paragraph: {
    marginBottom: '14px',
    lineHeight: 1.8,
    color: '#b0b0b0',
    fontSize: '15px',
  },
  listItem: {
    marginBottom: '8px',
    lineHeight: 1.7,
    color: '#b0b0b0',
    fontSize: '15px',
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '16px',
  },
  card: {
    backgroundColor: '#0d0d0d',
    border: '1px solid #1a1a1a',
    borderRadius: '12px',
    padding: '20px',
    transition: 'all 0.3s ease',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#a3e635',
    marginBottom: '8px',
  },
  cardText: {
    fontSize: '14px',
    lineHeight: 1.7,
    color: '#888',
    margin: 0,
  },
  linkBtn: {
    display: 'inline-block',
    backgroundColor: '#0d0d0d',
    border: '1px solid #1a1a1a',
    color: '#a3e635',
    textDecoration: 'none',
    padding: '12px 20px',
    borderRadius: '10px',
    transition: 'all 0.2s ease',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  infoBox: {
    backgroundColor: '#0d0d0d',
    border: '1px solid #1a1a1a',
    borderRadius: '12px',
    padding: '24px',
  },
};

const AboutUs = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
        <SEO 
          title="About PromptQuill" 
          description="Open-source AI brief generator. Turn any idea into a complete 15-tab strategic brief."
          url="/about"
        />
      <div style={styles.container}>
        <button 
          onClick={() => navigate(-1)}
          style={styles.backBtn}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#a3e635'; e.currentTarget.style.backgroundColor = '#0d0d0d'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#1a1a1a'; e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          ← Back
        </button>

        <h1 style={styles.heading1}>About PromptQuill</h1>
        <p style={styles.subtitle}>Open-source AI brief generator · Self-hosted · Free forever</p>

        <div>
          <section style={styles.section}>
            <h2 style={styles.h2}>What is PromptQuill?</h2>
            <p style={styles.paragraph}>
              PromptQuill is an open-source AI brief generator. Type any idea and get a complete 15-tab strategic brief in seconds. It runs entirely on your own infrastructure — your Supabase database, your AI provider keys, your machine. No subscriptions. No telemetry. No vendor lock-in.
            </p>
            <p style={styles.paragraph}>
              Designed for founders validating ideas, developers planning features, content strategists building campaigns, and anyone who needs to move from a rough concept to a structured plan quickly.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.h2}>What It Does</h2>
            <ul style={{ marginLeft: '20px', marginBottom: 0, listStyle: 'none', padding: 0 }}>
              {['Generates 15-tab strategic briefs from any idea','Supports 6 AI modes: Startup, Coding, Content, Creative, General, Startup Lite','Offers 2 personality styles: Bot (analytical) and Human (conversational)','Rotates across 16 AI providers with automatic failover','Streams content live as it generates','Saves everything to your own database'].map((item, i) => (
                <li key={i} style={{ ...styles.listItem, paddingLeft: '24px', position: 'relative', marginBottom: '10px' }}>
                  <span style={{ position: 'absolute', left: 0, color: '#a3e635' }}>✦</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section style={styles.section}>
            <h2 style={styles.h2}>Key Features</h2>
            <div style={styles.cardGrid}>
              {[
                { emoji: '📋', title: '15-Tab Briefs', desc: 'Executive summary to immediate next steps — every angle covered' },
                { emoji: '🎯', title: '6 AI Modes', desc: 'Specialized prompts for startup, coding, content, creative, general, and quick validation' },
                { emoji: '🤖', title: '2 Personalities', desc: 'Bot for structured analysis. Human for conversational advice.' },
                { emoji: '🔄', title: '16 Providers', desc: 'Auto-rotation across OpenAI, Claude, Groq, Gemini, xAI, Mistral, DeepSeek, and more' },
                { emoji: '🔒', title: '100% Private', desc: 'Your data, your keys, your infrastructure. Zero telemetry.' },
                { emoji: '💰', title: 'Free Forever', desc: 'MIT licensed. Self-hosted. No paid plans or subscriptions.' },
              ].map((feat, i) => (
                <div key={i} style={styles.card}>
                  <div style={{ fontSize: '28px', marginBottom: '10px' }}>{feat.emoji}</div>
                  <h3 style={styles.cardTitle}>{feat.title}</h3>
                  <p style={styles.cardText}>{feat.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section style={styles.section}>
            <h2 style={styles.h2}>Tech Stack</h2>
            <div style={styles.infoBox}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {[
                  { label: 'Frontend', value: 'React 18 · Vite' },
                  { label: 'Backend', value: 'Node.js · Express' },
                  { label: 'Database', value: 'Supabase (PostgreSQL)' },
                  { label: 'AI Providers', value: '16 providers with auto-failover' },
                ].map((item, i) => (
                  <div key={i}>
                    <p style={{ margin: '0 0 6px 0', color: '#a3e635', fontWeight: '600', fontSize: '14px' }}>{item.label}</p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#888' }}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section style={styles.section}>
            <h2 style={styles.h2}>Open Source</h2>
            <p style={styles.paragraph}>
              PromptQuill is MIT licensed. Free to use, modify, and distribute. The entire source code is available on GitHub.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '20px' }}>
              <a 
                href="https://github.com/shrikrishna-lab/promptquill" 
                target="_blank" 
                rel="noopener noreferrer"
                style={styles.linkBtn}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#1a1a1a'; e.currentTarget.style.borderColor = '#a3e635'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#0d0d0d'; e.currentTarget.style.borderColor = '#1a1a1a'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                ★ Star on GitHub
              </a>
              <a 
                href="https://github.com/shrikrishna-lab/promptquill/issues" 
                target="_blank" 
                rel="noopener noreferrer"
                style={styles.linkBtn}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#1a1a1a'; e.currentTarget.style.borderColor = '#a3e635'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#0d0d0d'; e.currentTarget.style.borderColor = '#1a1a1a'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                🐛 Report an Issue
              </a>
            </div>
          </section>

          <section style={styles.section}>
            <h2 style={styles.h2}>License</h2>
            <div style={styles.infoBox}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <div style={{ color: '#a3e635', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>License</div>
                  <div style={{ color: '#888', fontSize: '13px' }}>MIT — free forever</div>
                </div>
                <div>
                  <div style={{ color: '#a3e635', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Repository</div>
                  <div style={{ color: '#888', fontSize: '13px' }}>github.com/shrikrishna-lab/promptquill</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
