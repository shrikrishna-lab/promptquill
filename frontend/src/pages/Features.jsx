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
    marginBottom: '60px',
    fontSize: '16px',
    borderLeft: '3px solid #a3e635',
    paddingLeft: '16px',
  },
  sectionTitle: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#a3e635',
    marginBottom: '30px',
    letterSpacing: '-0.02em',
  },
  modeCard: {
    backgroundColor: '#0d0d0d',
    border: '1px solid #1a1a1a',
    borderRadius: '16px',
    padding: '30px',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
  },
  modeCardTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#a3e635',
    marginBottom: '10px',
  },
  modeCardText: {
    marginBottom: '12px',
    fontSize: '15px',
    lineHeight: 1.8,
    color: '#b0b0b0',
  },
  modeCardTag: {
    fontSize: '13px',
    color: '#666',
  },
  personalityCard: {
    backgroundColor: '#0d0d0d',
    border: '2px solid #a3e635',
    borderRadius: '16px',
    padding: '30px',
  },
  personalityTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#a3e635',
    marginBottom: '10px',
  },
  personalityText: {
    margin: 0,
    fontSize: '15px',
    lineHeight: 1.8,
    color: '#b0b0b0',
  },
  tabCard: {
    backgroundColor: '#0d0d0d',
    padding: '18px',
    borderRadius: '10px',
    border: '1px solid #1a1a1a',
    transition: 'all 0.2s ease',
  },
  tabTitle: {
    color: '#a3e635',
    fontWeight: '600',
    fontSize: '14px',
  },
  tabDesc: {
    fontSize: '13px',
    color: '#666',
    margin: '4px 0 0 0',
    lineHeight: 1.5,
  },
  premiumRow: {
    backgroundColor: '#0d0d0d',
    border: '1px solid #1a1a1a',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '15px',
    transition: 'all 0.2s ease',
  },
  premiumIcon: {
    fontSize: '24px',
    minWidth: '40px',
    lineHeight: 1,
  },
  premiumTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#a3e635',
    marginBottom: '5px',
  },
  premiumDesc: {
    fontSize: '14px',
    color: '#888',
    margin: 0,
    lineHeight: 1.6,
  },
  ctaSection: {
    backgroundColor: '#0d0d0d',
    border: '2px solid #a3e635',
    borderRadius: '16px',
    padding: '40px',
    textAlign: 'center',
    marginTop: '60px',
  },
  ctaTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#a3e635',
    marginBottom: '15px',
  },
  ctaText: {
    fontSize: '16px',
    marginBottom: '25px',
    color: '#b0b0b0',
    lineHeight: 1.7,
  },
  primaryBtn: {
    backgroundColor: '#a3e635',
    color: '#000',
    border: 'none',
    padding: '14px 40px',
    fontSize: '16px',
    fontWeight: '700',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginRight: '15px',
    fontFamily: 'inherit',
  },
  secondaryBtn: {
    backgroundColor: 'transparent',
    color: '#a3e635',
    border: '2px solid #a3e635',
    padding: '12px 38px',
    fontSize: '16px',
    fontWeight: '700',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
  },
};

const modes = [
  {
    emoji: '🚀',
    title: 'STARTUP Mode',
    desc: 'Designed for founders and entrepreneurs. Generates market analysis, competitor research, target audience profiling, launch strategies, and financial projections.',
    tag: 'Perfect for: Startup validation, pitch decks, business planning',
  },
  {
    emoji: '💻',
    title: 'CODING Mode',
    desc: 'For developers and technical builders. Generates technical architecture specs, database schemas, API designs, code structure recommendations, and tech stack suggestions.',
    tag: 'Perfect for: Technical documentation, architecture planning, development briefs',
  },
  {
    emoji: '✍️',
    title: 'CONTENT Mode',
    desc: 'For content creators and marketers. Generates content strategies, copy guidelines, SEO recommendations, social media strategies, and engagement tactics.',
    tag: 'Perfect for: Content marketing, copywriting, social strategy',
  },
  {
    emoji: '💼',
    title: 'BUSINESS Mode',
    desc: 'For business planners and analysts. Generates business models, revenue streams, cost analysis, growth strategies, and operational plans.',
    tag: 'Perfect for: Business planning, investor pitches, financial modeling',
  },
  {
    emoji: '🎨',
    title: 'CREATIVE Mode',
    desc: 'For designers and creative professionals. Generates design concepts, branding guidelines, visual strategy, UI/UX recommendations, and creative direction.',
    tag: 'Perfect for: Brand strategy, design briefs, creative direction',
  },
  {
    emoji: '📊',
    title: 'ANALYTICS Mode',
    desc: 'For data-driven decision makers. Generates analytics frameworks, KPI recommendations, metric tracking strategies, and data visualization guidelines.',
    tag: 'Perfect for: Growth tracking, performance analysis, data strategy',
  },
];

const tabs = [
  { title: 'Executive Summary', desc: 'High-level overview of your idea and recommendations' },
  { title: 'Competitors Analysis', desc: 'Competitive landscape and positioning' },
  { title: 'Target Audience', desc: 'Customer segmentation and personas' },
  { title: 'Market Validation', desc: 'Market size and growth potential' },
  { title: 'Launch Strategy', desc: 'Go-to-market and launch tactics' },
  { title: 'Tech Architecture', desc: 'Technical implementation details' },
  { title: 'Monetization', desc: 'Revenue models and pricing strategy' },
  { title: 'Team Requirements', desc: 'Roles and skills needed to execute' },
  { title: 'Financial Projections', desc: 'Revenue and growth forecasts' },
  { title: 'Risk Analysis', desc: 'Potential challenges and mitigation' },
  { title: 'Reddit Validator', desc: 'Community feedback and market sentiment' },
  { title: 'Implementation Timeline', desc: 'Milestones and execution roadmap' },
  { title: 'Success Metrics', desc: 'KPIs and tracking methodology' },
  { title: 'Next Steps', desc: 'Immediate actions and priorities' },
  { title: 'Resources & Tools', desc: 'Recommended tools and frameworks' },
];

const premiumFeatures = [
  { emoji: '📄', title: 'PDF Export', desc: 'Export any brief as a professional PDF for sharing, presenting, or archiving' },
  { emoji: '📊', title: 'Pro Tabs Organization', desc: 'Save unlimited briefs across 15+ customizable tabs for project organization' },
  { emoji: '🔄', title: 'Unlimited Regeneration', desc: 'Regenerate any brief with different prompts or settings with no limits' },
  { emoji: '🚀', title: 'Priority AI Routing', desc: 'Get priority access to the fastest AI models and skip queues' },
  { emoji: '👥', title: 'Team Collaboration', desc: 'Share briefs with team members and collaborate on analysis' },
  { emoji: '🔐', title: 'Private Briefs', desc: 'Keep your briefs completely private or share selectively with team' },
];

const Features = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      <SEO
        title="PromptQuill Features — 6 AI Modes, 15 Tabs, 2 Personalities | PromptQuill"
        description="Explore all PromptQuill features: 6 AI modes for different analysis types, 15 analysis tabs per brief, BOT & HUMAN personalities, PDF export, Reddit Validator, community feed, and more."
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

        <h1 style={styles.heading1}>PromptQuill Features</h1>
        <p style={styles.subtitle}>Everything you need to generate, validate, and export strategic briefs</p>

        <div>
          <section style={{ marginBottom: '60px' }}>
            <h2 style={styles.sectionTitle}>6 AI Modes for Every Builder</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {modes.map((mode, i) => (
                <div
                  key={i}
                  style={styles.modeCard}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#a3e635'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#1a1a1a'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>{mode.emoji}</div>
                  <h3 style={styles.modeCardTitle}>{mode.title}</h3>
                  <p style={styles.modeCardText}>{mode.desc}</p>
                  <p style={styles.modeCardTag}>{mode.tag}</p>
                </div>
              ))}
            </div>
          </section>

          <section style={{ marginBottom: '60px' }}>
            <h2 style={styles.sectionTitle}>2 AI Personalities</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={styles.personalityCard}>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>🤖</div>
                <h3 style={styles.personalityTitle}>BOT Personality</h3>
                <p style={styles.personalityText}>
                  Technical, structured, and precise. BOT persona delivers data-driven insights with clear formatting, bullet points, and actionable recommendations. Best for technical analysis and documentation.
                </p>
              </div>
              <div style={styles.personalityCard}>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>💬</div>
                <h3 style={styles.personalityTitle}>HUMAN Personality</h3>
                <p style={styles.personalityText}>
                  Conversational, creative, and engaging. HUMAN persona delivers insights in a friendly tone with storytelling, context, and deeper reasoning. Best for brainstorming and strategy.
                </p>
              </div>
            </div>
          </section>

          <section style={{ marginBottom: '60px' }}>
            <h2 style={styles.sectionTitle}>15 Analysis Tabs Per Brief</h2>
            <p style={{ marginBottom: '20px', fontSize: '15px', color: '#888', lineHeight: 1.7 }}>
              Every brief includes comprehensive analysis across these key areas:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              {tabs.map((tab, i) => (
                <div
                  key={i}
                  style={styles.tabCard}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#a3e635'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#1a1a1a'; }}
                >
                  <div style={styles.tabTitle}>{tab.title}</div>
                  <p style={styles.tabDesc}>{tab.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section style={{ marginBottom: '60px' }}>
            <h2 style={styles.sectionTitle}>Premium Features</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {premiumFeatures.map((feat, i) => (
                <div
                  key={i}
                  style={styles.premiumRow}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#a3e635'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#1a1a1a'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <span style={styles.premiumIcon}>{feat.emoji}</span>
                  <div>
                    <h3 style={styles.premiumTitle}>{feat.title}</h3>
                    <p style={styles.premiumDesc}>{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section style={styles.ctaSection}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 30px rgba(163, 230, 53, 0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
          >
            <h2 style={styles.ctaTitle}>Experience All Features Risk-Free</h2>
            <p style={styles.ctaText}>
              Start with free forever — 10 daily generations with core features. Upgrade anytime for unlimited access.
            </p>
            <button 
              onClick={() => navigate('/ai')}
              style={styles.primaryBtn}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Try Free
            </button>
            <button 
              onClick={() => navigate('/pricing')}
              style={styles.secondaryBtn}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#a3e635'; e.currentTarget.style.color = '#000'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#a3e635'; }}
            >
              View Pricing
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Features;
