import React from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';

const Features = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000', color: '#e5e5e5', paddingTop: '80px' }}>
      <SEO
        title="PromptQuill Features — 6 AI Modes, 15 Tabs, 2 Personalities | PromptQuill"
        description="Explore all PromptQuill features: 6 AI modes for different analysis types, 15 analysis tabs per brief, BOT & HUMAN personalities, PDF export, Reddit Validator, community feed, and more."
      />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 20px' }}>
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#a3e635',
            fontSize: '14px',
            cursor: 'pointer',
            marginBottom: '30px',
            transition: '0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          ← Back to Home
        </button>

        <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '10px', color: '#a3e635' }}>
          PromptQuill Features
        </h1>
        <p style={{ color: '#888', marginBottom: '60px', fontSize: '16px' }}>
          Everything you need to generate, validate, and export strategic briefs
        </p>

        <div style={{ lineHeight: '1.8', color: '#ccc' }}>
          
          {/* 6 AI Modes */}
          <section style={{ marginBottom: '60px' }}>
            <h2 style={{ fontSize: '32px', color: '#a3e635', marginBottom: '30px' }}>6 AI Modes for Every Builder</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
              
              <div style={{ backgroundColor: '#111', border: '1px solid #1a1a1a', borderRadius: '12px', padding: '30px' }}>
                <h3 style={{ fontSize: '22px', color: '#a3e635', marginBottom: '10px' }}>🚀 STARTUP Mode</h3>
                <p style={{ marginBottom: '12px', fontSize: '15px' }}>
                  Designed for founders and entrepreneurs. Generates market analysis, competitor research, target audience profiling, launch strategies, and financial projections.
                </p>
                <p style={{ fontSize: '13px', color: '#888' }}>Perfect for: Startup validation, pitch decks, business planning</p>
              </div>

              <div style={{ backgroundColor: '#111', border: '1px solid #1a1a1a', borderRadius: '12px', padding: '30px' }}>
                <h3 style={{ fontSize: '22px', color: '#a3e635', marginBottom: '10px' }}>💻 CODING Mode</h3>
                <p style={{ marginBottom: '12px', fontSize: '15px' }}>
                  For developers and technical builders. Generates technical architecture specs, database schemas, API designs, code structure recommendations, and tech stack suggestions.
                </p>
                <p style={{ fontSize: '13px', color: '#888' }}>Perfect for: Technical documentation, architecture planning, development briefs</p>
              </div>

              <div style={{ backgroundColor: '#111', border: '1px solid #1a1a1a', borderRadius: '12px', padding: '30px' }}>
                <h3 style={{ fontSize: '22px', color: '#a3e635', marginBottom: '10px' }}>✍️ CONTENT Mode</h3>
                <p style={{ marginBottom: '12px', fontSize: '15px' }}>
                  For content creators and marketers. Generates content strategies, copy guidelines, SEO recommendations, social media strategies, and engagement tactics.
                </p>
                <p style={{ fontSize: '13px', color: '#888' }}>Perfect for: Content marketing, copywriting, social strategy</p>
              </div>

              <div style={{ backgroundColor: '#111', border: '1px solid #1a1a1a', borderRadius: '12px', padding: '30px' }}>
                <h3 style={{ fontSize: '22px', color: '#a3e635', marginBottom: '10px' }}>💼 BUSINESS Mode</h3>
                <p style={{ marginBottom: '12px', fontSize: '15px' }}>
                  For business planners and analysts. Generates business models, revenue streams, cost analysis, growth strategies, and operational plans.
                </p>
                <p style={{ fontSize: '13px', color: '#888' }}>Perfect for: Business planning, investor pitches, financial modeling</p>
              </div>

              <div style={{ backgroundColor: '#111', border: '1px solid #1a1a1a', borderRadius: '12px', padding: '30px' }}>
                <h3 style={{ fontSize: '22px', color: '#a3e635', marginBottom: '10px' }}>🎨 CREATIVE Mode</h3>
                <p style={{ marginBottom: '12px', fontSize: '15px' }}>
                  For designers and creative professionals. Generates design concepts, branding guidelines, visual strategy, UI/UX recommendations, and creative direction.
                </p>
                <p style={{ fontSize: '13px', color: '#888' }}>Perfect for: Brand strategy, design briefs, creative direction</p>
              </div>

              <div style={{ backgroundColor: '#111', border: '1px solid #1a1a1a', borderRadius: '12px', padding: '30px' }}>
                <h3 style={{ fontSize: '22px', color: '#a3e635', marginBottom: '10px' }}>📊 ANALYTICS Mode</h3>
                <p style={{ marginBottom: '12px', fontSize: '15px' }}>
                  For data-driven decision makers. Generates analytics frameworks, KPI recommendations, metric tracking strategies, and data visualization guidelines.
                </p>
                <p style={{ fontSize: '13px', color: '#888' }}>Perfect for: Growth tracking, performance analysis, data strategy</p>
              </div>

            </div>
          </section>

          {/* 2 Personalities */}
          <section style={{ marginBottom: '60px' }}>
            <h2 style={{ fontSize: '32px', color: '#a3e635', marginBottom: '30px' }}>2 AI Personalities</h2>
            <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              
              <div style={{ backgroundColor: '#111', border: '2px solid #a3e635', borderRadius: '12px', padding: '30px' }}>
                <h3 style={{ fontSize: '22px', color: '#a3e635', marginBottom: '10px' }}>🤖 BOT Personality</h3>
                <p style={{ marginBottom: '0', fontSize: '15px' }}>
                  Technical, structured, and precise. BOT persona delivers data-driven insights with clear formatting, bullet points, and actionable recommendations. Best for technical analysis and documentation.
                </p>
              </div>

              <div style={{ backgroundColor: '#111', border: '2px solid #a3e635', borderRadius: '12px', padding: '30px' }}>
                <h3 style={{ fontSize: '22px', color: '#a3e635', marginBottom: '10px' }}>💬 HUMAN Personality</h3>
                <p style={{ marginBottom: '0', fontSize: '15px' }}>
                  Conversational, creative, and engaging. HUMAN persona delivers insights in a friendly tone with storytelling, context, and deeper reasoning. Best for brainstorming and strategy.
                </p>
              </div>

            </div>
          </section>

          {/* 15 Analysis Tabs */}
          <section style={{ marginBottom: '60px' }}>
            <h2 style={{ fontSize: '32px', color: '#a3e635', marginBottom: '30px' }}>15 Analysis Tabs Per Brief</h2>
            <p style={{ marginBottom: '20px', fontSize: '15px' }}>
              Every brief includes comprehensive analysis across these key areas:
            </p>
            <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div style={{ backgroundColor: '#0a0a0a', padding: '15px', borderRadius: '8px', border: '1px solid #1a1a1a' }}>
                <strong style={{ color: '#a3e635' }}>Executive Summary</strong>
                <p style={{ fontSize: '13px', color: '#888', margin: '5px 0 0 0' }}>High-level overview of your idea and recommendations</p>
              </div>
              <div style={{ backgroundColor: '#0a0a0a', padding: '15px', borderRadius: '8px', border: '1px solid #1a1a1a' }}>
                <strong style={{ color: '#a3e635' }}>Competitors Analysis</strong>
                <p style={{ fontSize: '13px', color: '#888', margin: '5px 0 0 0' }}>Competitive landscape and positioning</p>
              </div>
              <div style={{ backgroundColor: '#0a0a0a', padding: '15px', borderRadius: '8px', border: '1px solid #1a1a1a' }}>
                <strong style={{ color: '#a3e635' }}>Target Audience</strong>
                <p style={{ fontSize: '13px', color: '#888', margin: '5px 0 0 0' }}>Customer segmentation and personas</p>
              </div>
              <div style={{ backgroundColor: '#0a0a0a', padding: '15px', borderRadius: '8px', border: '1px solid #1a1a1a' }}>
                <strong style={{ color: '#a3e635' }}>Market Validation</strong>
                <p style={{ fontSize: '13px', color: '#888', margin: '5px 0 0 0' }}>Market size and growth potential</p>
              </div>
              <div style={{ backgroundColor: '#0a0a0a', padding: '15px', borderRadius: '8px', border: '1px solid #1a1a1a' }}>
                <strong style={{ color: '#a3e635' }}>Launch Strategy</strong>
                <p style={{ fontSize: '13px', color: '#888', margin: '5px 0 0 0' }}>Go-to-market and launch tactics</p>
              </div>
              <div style={{ backgroundColor: '#0a0a0a', padding: '15px', borderRadius: '8px', border: '1px solid #1a1a1a' }}>
                <strong style={{ color: '#a3e635' }}>Tech Architecture</strong>
                <p style={{ fontSize: '13px', color: '#888', margin: '5px 0 0 0' }}>Technical implementation details</p>
              </div>
              <div style={{ backgroundColor: '#0a0a0a', padding: '15px', borderRadius: '8px', border: '1px solid #1a1a1a' }}>
                <strong style={{ color: '#a3e635' }}>Monetization</strong>
                <p style={{ fontSize: '13px', color: '#888', margin: '5px 0 0 0' }}>Revenue models and pricing strategy</p>
              </div>
              <div style={{ backgroundColor: '#0a0a0a', padding: '15px', borderRadius: '8px', border: '1px solid #1a1a1a' }}>
                <strong style={{ color: '#a3e635' }}>Team Requirements</strong>
                <p style={{ fontSize: '13px', color: '#888', margin: '5px 0 0 0' }}>Roles and skills needed to execute</p>
              </div>
              <div style={{ backgroundColor: '#0a0a0a', padding: '15px', borderRadius: '8px', border: '1px solid #1a1a1a' }}>
                <strong style={{ color: '#a3e635' }}>Financial Projections</strong>
                <p style={{ fontSize: '13px', color: '#888', margin: '5px 0 0 0' }}>Revenue and growth forecasts</p>
              </div>
              <div style={{ backgroundColor: '#0a0a0a', padding: '15px', borderRadius: '8px', border: '1px solid #1a1a1a' }}>
                <strong style={{ color: '#a3e635' }}>Risk Analysis</strong>
                <p style={{ fontSize: '13px', color: '#888', margin: '5px 0 0 0' }}>Potential challenges and mitigation</p>
              </div>
              <div style={{ backgroundColor: '#0a0a0a', padding: '15px', borderRadius: '8px', border: '1px solid #1a1a1a' }}>
                <strong style={{ color: '#a3e635' }}>Reddit Validator</strong>
                <p style={{ fontSize: '13px', color: '#888', margin: '5px 0 0 0' }}>Community feedback and market sentiment</p>
              </div>
              <div style={{ backgroundColor: '#0a0a0a', padding: '15px', borderRadius: '8px', border: '1px solid #1a1a1a' }}>
                <strong style={{ color: '#a3e635' }}>Implementation Timeline</strong>
                <p style={{ fontSize: '13px', color: '#888', margin: '5px 0 0 0' }}>Milestones and execution roadmap</p>
              </div>
              <div style={{ backgroundColor: '#0a0a0a', padding: '15px', borderRadius: '8px', border: '1px solid #1a1a1a' }}>
                <strong style={{ color: '#a3e635' }}>Success Metrics</strong>
                <p style={{ fontSize: '13px', color: '#888', margin: '5px 0 0 0' }}>KPIs and tracking methodology</p>
              </div>
              <div style={{ backgroundColor: '#0a0a0a', padding: '15px', borderRadius: '8px', border: '1px solid #1a1a1a' }}>
                <strong style={{ color: '#a3e635' }}>Next Steps</strong>
                <p style={{ fontSize: '13px', color: '#888', margin: '5px 0 0 0' }}>Immediate actions and priorities</p>
              </div>
              <div style={{ backgroundColor: '#0a0a0a', padding: '15px', borderRadius: '8px', border: '1px solid #1a1a1a' }}>
                <strong style={{ color: '#a3e635' }}>Resources & Tools</strong>
                <p style={{ fontSize: '13px', color: '#888', margin: '5px 0 0 0' }}>Recommended tools and frameworks</p>
              </div>
            </div>
          </section>

          {/* Premium Features */}
          <section style={{ marginBottom: '60px' }}>
            <h2 style={{ fontSize: '32px', color: '#a3e635', marginBottom: '30px' }}>Premium Features</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
              <div style={{ backgroundColor: '#111', border: '1px solid #1a1a1a', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                <span style={{ fontSize: '24px', minWidth: '40px' }}>📄</span>
                <div>
                  <h3 style={{ fontSize: '18px', color: '#a3e635', marginBottom: '5px' }}>PDF Export</h3>
                  <p style={{ fontSize: '14px', color: '#888', margin: 0 }}>Export any brief as a professional PDF for sharing, presenting, or archiving</p>
                </div>
              </div>
              <div style={{ backgroundColor: '#111', border: '1px solid #1a1a1a', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                <span style={{ fontSize: '24px', minWidth: '40px' }}>📊</span>
                <div>
                  <h3 style={{ fontSize: '18px', color: '#a3e635', marginBottom: '5px' }}>Pro Tabs Organization</h3>
                  <p style={{ fontSize: '14px', color: '#888', margin: 0 }}>Save unlimited briefs across 15+ customizable tabs for project organization</p>
                </div>
              </div>
              <div style={{ backgroundColor: '#111', border: '1px solid #1a1a1a', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                <span style={{ fontSize: '24px', minWidth: '40px' }}>🔄</span>
                <div>
                  <h3 style={{ fontSize: '18px', color: '#a3e635', marginBottom: '5px' }}>Unlimited Regeneration</h3>
                  <p style={{ fontSize: '14px', color: '#888', margin: 0 }}>Regenerate any brief with different prompts or settings with no limits</p>
                </div>
              </div>
              <div style={{ backgroundColor: '#111', border: '1px solid #1a1a1a', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                <span style={{ fontSize: '24px', minWidth: '40px' }}>🚀</span>
                <div>
                  <h3 style={{ fontSize: '18px', color: '#a3e635', marginBottom: '5px' }}>Priority AI Routing</h3>
                  <p style={{ fontSize: '14px', color: '#888', margin: 0 }}>Get priority access to the fastest AI models and skip queues</p>
                </div>
              </div>
              <div style={{ backgroundColor: '#111', border: '1px solid #1a1a1a', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                <span style={{ fontSize: '24px', minWidth: '40px' }}>👥</span>
                <div>
                  <h3 style={{ fontSize: '18px', color: '#a3e635', marginBottom: '5px' }}>Team Collaboration</h3>
                  <p style={{ fontSize: '14px', color: '#888', margin: 0 }}>Share briefs with team members and collaborate on analysis</p>
                </div>
              </div>
              <div style={{ backgroundColor: '#111', border: '1px solid #1a1a1a', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                <span style={{ fontSize: '24px', minWidth: '40px' }}>🔐</span>
                <div>
                  <h3 style={{ fontSize: '18px', color: '#a3e635', marginBottom: '5px' }}>Private Briefs</h3>
                  <p style={{ fontSize: '14px', color: '#888', margin: 0 }}>Keep your briefs completely private or share selectively with team</p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section style={{ backgroundColor: '#111', border: '2px solid #a3e635', borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '28px', color: '#a3e635', marginBottom: '15px' }}>Experience All Features Risk-Free</h2>
            <p style={{ fontSize: '16px', marginBottom: '25px' }}>
              Start with free forever — 10 daily generations with core features. Upgrade anytime for unlimited access.
            </p>
            <button 
              onClick={() => navigate('/ai')}
              style={{
                backgroundColor: '#a3e635',
                color: '#000',
                border: 'none',
                padding: '14px 40px',
                fontSize: '16px',
                fontWeight: 'bold',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: '0.2s',
                marginRight: '15px'
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Try Free
            </button>
            <button 
              onClick={() => navigate('/pricing')}
              style={{
                backgroundColor: 'transparent',
                color: '#a3e635',
                border: '2px solid #a3e635',
                padding: '12px 38px',
                fontSize: '16px',
                fontWeight: 'bold',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: '0.2s'
              }}
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
