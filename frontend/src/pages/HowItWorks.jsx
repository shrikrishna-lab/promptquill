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
  stepCard: {
    backgroundColor: '#0d0d0d',
    border: '1px solid #1a1a1a',
    borderRadius: '16px',
    padding: '36px',
    position: 'relative',
    transition: 'all 0.3s ease',
  },
  stepNumOuter: {
    width: '56px',
    height: '56px',
    backgroundColor: '#a3e635',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#000',
    fontWeight: '800',
    fontSize: '22px',
    marginRight: '20px',
    flexShrink: 0,
  },
  stepTitle: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#a3e635',
    margin: 0,
    letterSpacing: '-0.01em',
  },
  stepHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '20px',
  },
  stepText: {
    fontSize: '15px',
    lineHeight: 1.8,
    color: '#b0b0b0',
    marginBottom: '12px',
  },
  stepList: {
    marginLeft: '20px',
    marginBottom: 0,
    listStyle: 'none',
    padding: 0,
  },
  stepListItem: {
    marginBottom: '8px',
    lineHeight: 1.7,
    color: '#b0b0b0',
    fontSize: '15px',
    paddingLeft: '24px',
    position: 'relative',
  },
  connector: {
    width: '2px',
    height: '40px',
    backgroundColor: '#a3e635',
    margin: '0 auto',
    opacity: 0.4,
  },
  modeMiniCard: {
    backgroundColor: '#050505',
    padding: '14px',
    borderRadius: '10px',
    border: '1px solid #222',
  },
  modeMiniTitle: {
    color: '#a3e635',
    fontWeight: '600',
    fontSize: '14px',
  },
  modeMiniDesc: {
    fontSize: '13px',
    color: '#888',
  },
  sectionTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#a3e635',
    marginBottom: '20px',
  },
  paragraph: {
    fontSize: '15px',
    lineHeight: 1.8,
    color: '#b0b0b0',
    marginBottom: '15px',
  },
  strong: {
    color: '#a3e635',
    fontWeight: '600',
  },
  ctaSection: {
    backgroundColor: '#0d0d0d',
    border: '2px solid #a3e635',
    borderRadius: '16px',
    padding: '40px',
    textAlign: 'center',
    transition: 'all 0.3s ease',
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
    fontFamily: 'inherit',
  },
};

const steps = [
  {
    num: 1,
    title: 'Enter Your Idea',
    text: 'Start by describing your idea in 1-2 sentences. It could be:',
    items: [
      'A startup concept you want to validate',
      'A coding project you\'re planning',
      'A content strategy or marketing campaign',
      'Any business idea requiring structured analysis',
    ],
  },
  {
    num: 2,
    title: 'Choose Your Mode & Personality',
    text: 'Select from 6 AI modes optimized for different analysis types:',
    modes: true,
    afterText: 'Choose between BOT (structured, technical) or HUMAN (conversational, creative) personality for your analysis.',
  },
  {
    num: 3,
    title: 'Get 15 Analysis Tabs',
    text: 'PromptQuill AI generates a comprehensive brief with 15 analysis tabs:',
    cols: true,
    afterText: 'All generated in under 30 seconds with intelligent routing across 15+ AI providers.',
  },
  {
    num: 4,
    title: 'Export & Share',
    text: 'Your brief is now ready to use:',
    items: [
      'Export as PDF for presentations and sharing',
      'Save to your Pro Tabs for organization',
      'Share on the community feed for feedback',
      'Use for investor pitch decks, team planning, or market research',
      'Store in cloud via Supabase for anytime access',
    ],
  },
];

const howItWorksReasons = [
  {
    label: 'Multi-Model Intelligence:',
    desc: 'Routes your prompt across 15 different AI models to get the best response for each analysis type',
  },
  {
    label: 'Structured Output:',
    desc: 'Breaks analysis into 15 specific tabs instead of giving you one wall of text',
  },
  {
    label: 'Speed:',
    desc: 'Gets you results in under 30 seconds, so you can iterate quickly',
  },
  {
    label: 'Export Ready:',
    desc: 'Output is immediately usable for presentations, planning, or sharing',
  },
  {
    label: 'Community Feedback:',
    desc: 'Share your briefs to get Reddit-powered validation from real users',
  },
];

const HowItWorks = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      <SEO
        title="How PromptQuill Works — AI Brief Generator in 4 Steps | PromptQuill"
        description="Discover how PromptQuill generates complete startup briefs in 30 seconds. Learn the 4-step process: Enter idea → Choose mode → Get 15 tabs → Export PDF. Free forever."
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

        <h1 style={styles.heading1}>How PromptQuill Works</h1>
        <p style={styles.subtitle}>Turn any idea into a complete strategic brief in 4 simple steps</p>

        <div>
          {steps.map((step, si) => (
            <React.Fragment key={si}>
              <section
                style={styles.stepCard}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#a3e635'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#1a1a1a'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={styles.stepHeader}>
                  <div style={styles.stepNumOuter}>{step.num}</div>
                  <h2 style={styles.stepTitle}>{step.title}</h2>
                </div>
                <p style={styles.stepText}>{step.text}</p>

                {step.items && (
                  <ul style={styles.stepList}>
                    {step.items.map((item, ii) => (
                      <li key={ii} style={styles.stepListItem}>
                        <span style={{ position: 'absolute', left: 0, color: '#a3e635' }}>✦</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                )}

                {step.modes && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                      <div style={styles.modeMiniCard}>
                        <div style={styles.modeMiniTitle}>STARTUP Mode</div>
                        <div style={styles.modeMiniDesc}>Validate startup ideas with market analysis</div>
                      </div>
                      <div style={styles.modeMiniCard}>
                        <div style={styles.modeMiniTitle}>CODING Mode</div>
                        <div style={styles.modeMiniDesc}>Technical specs and architecture planning</div>
                      </div>
                      <div style={styles.modeMiniCard}>
                        <div style={styles.modeMiniTitle}>CONTENT Mode</div>
                        <div style={styles.modeMiniDesc}>Content strategy and copywriting briefs</div>
                      </div>
                      <div style={styles.modeMiniCard}>
                        <div style={styles.modeMiniTitle}>BUSINESS Mode</div>
                        <div style={styles.modeMiniDesc}>Business model and monetization planning</div>
                      </div>
                    </div>
                    <p style={{ fontSize: '14px', color: '#666', marginBottom: 0 }}>{step.afterText}</p>
                  </>
                )}

                {step.cols && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                      <span style={{ fontSize: '14px', color: '#b0b0b0' }}>• Executive Summary</span>
                      <span style={{ fontSize: '14px', color: '#b0b0b0' }}>• Competitors Analysis</span>
                      <span style={{ fontSize: '14px', color: '#b0b0b0' }}>• Target Audience</span>
                      <span style={{ fontSize: '14px', color: '#b0b0b0' }}>• Market Validation</span>
                      <span style={{ fontSize: '14px', color: '#b0b0b0' }}>• Launch Strategy</span>
                      <span style={{ fontSize: '14px', color: '#b0b0b0' }}>• Tech Architecture</span>
                      <span style={{ fontSize: '14px', color: '#b0b0b0' }}>• Monetization</span>
                      <span style={{ fontSize: '14px', color: '#b0b0b0' }}>• Team Requirements</span>
                      <span style={{ fontSize: '14px', color: '#b0b0b0' }}>• Financial Projections</span>
                      <span style={{ fontSize: '14px', color: '#b0b0b0' }}>• Risk Analysis</span>
                      <span style={{ fontSize: '14px', color: '#b0b0b0' }}>• Reddit Validator</span>
                      <span style={{ fontSize: '14px', color: '#b0b0b0' }}>• And more...</span>
                    </div>
                    <p style={{ fontSize: '14px', color: '#666', marginTop: 0, marginBottom: 0 }}>{step.afterText}</p>
                  </>
                )}
              </section>
              {si < steps.length - 1 && (
                <div style={styles.connector} />
              )}
            </React.Fragment>
          ))}

          <section style={{ marginTop: '50px', marginBottom: '50px', padding: '36px', backgroundColor: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '16px' }}>
            <h2 style={styles.sectionTitle}>Why This Process Works</h2>
            <p style={styles.paragraph}>
              PromptQuill isn't just generating random text — it's applying structured thinking frameworks to your idea:
            </p>
            <ul style={{ marginLeft: '20px', listStyle: 'none', padding: 0 }}>
              {howItWorksReasons.map((r, i) => (
                <li key={i} style={{ marginBottom: '14px', lineHeight: 1.7, color: '#b0b0b0', fontSize: '15px', paddingLeft: '24px', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0, color: '#a3e635' }}>◆</span>
                  <strong style={styles.strong}>{r.label}</strong> {r.desc}
                </li>
              ))}
            </ul>
          </section>

          <section style={styles.ctaSection}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 30px rgba(163, 230, 53, 0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
          >
            <h2 style={styles.ctaTitle}>Ready to Generate Your First Brief?</h2>
            <p style={styles.ctaText}>
              Start for free with 10 generations per day. No credit card required.
            </p>
            <button 
              onClick={() => navigate('/ai')}
              style={styles.primaryBtn}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Generate Your First Brief
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
