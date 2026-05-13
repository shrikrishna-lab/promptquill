import React from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';

const HowItWorks = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000', color: '#e5e5e5', paddingTop: '80px' }}>
      <SEO
        title="How PromptQuill Works — AI Brief Generator in 4 Steps | PromptQuill"
        description="Discover how PromptQuill generates complete startup briefs in 30 seconds. Learn the 4-step process: Enter idea → Choose mode → Get 15 tabs → Export PDF. Free forever."
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
          How PromptQuill Works
        </h1>
        <p style={{ color: '#888', marginBottom: '60px', fontSize: '16px' }}>
          Turn any idea into a complete strategic brief in 4 simple steps
        </p>

        <div style={{ lineHeight: '1.8', color: '#ccc' }}>
          
          {/* Step 1 */}
          <section style={{ marginBottom: '50px', backgroundColor: '#111', border: '1px solid #1a1a1a', borderRadius: '12px', padding: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ 
                width: '50px', 
                height: '50px', 
                backgroundColor: '#a3e635', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#000',
                fontWeight: 'bold',
                fontSize: '24px',
                marginRight: '20px'
              }}>1</div>
              <h2 style={{ fontSize: '28px', color: '#a3e635', margin: 0 }}>Enter Your Idea</h2>
            </div>
            <p style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>
              Start by describing your idea in 1-2 sentences. It could be:
            </p>
            <ul style={{ marginLeft: '20px', marginBottom: '0' }}>
              <li style={{ marginBottom: '8px' }}>A startup concept you want to validate</li>
              <li style={{ marginBottom: '8px' }}>A coding project you're planning</li>
              <li style={{ marginBottom: '8px' }}>A content strategy or marketing campaign</li>
              <li style={{ marginBottom: '8px' }}>Any business idea requiring structured analysis</li>
            </ul>
          </section>

          {/* Step 2 */}
          <section style={{ marginBottom: '50px', backgroundColor: '#111', border: '1px solid #1a1a1a', borderRadius: '12px', padding: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ 
                width: '50px', 
                height: '50px', 
                backgroundColor: '#a3e635', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#000',
                fontWeight: 'bold',
                fontSize: '24px',
                marginRight: '20px'
              }}>2</div>
              <h2 style={{ fontSize: '28px', color: '#a3e635', margin: 0 }}>Choose Your Mode & Personality</h2>
            </div>
            <p style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>
              Select from 6 AI modes optimized for different analysis types:
            </p>
            <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <div style={{ backgroundColor: '#0a0a0a', padding: '12px', borderRadius: '8px', border: '1px solid #222' }}>
                <strong style={{ color: '#a3e635' }}>STARTUP Mode</strong><br/>
                <span style={{ fontSize: '14px' }}>Validate startup ideas with market analysis</span>
              </div>
              <div style={{ backgroundColor: '#0a0a0a', padding: '12px', borderRadius: '8px', border: '1px solid #222' }}>
                <strong style={{ color: '#a3e635' }}>CODING Mode</strong><br/>
                <span style={{ fontSize: '14px' }}>Technical specs and architecture planning</span>
              </div>
              <div style={{ backgroundColor: '#0a0a0a', padding: '12px', borderRadius: '8px', border: '1px solid #222' }}>
                <strong style={{ color: '#a3e635' }}>CONTENT Mode</strong><br/>
                <span style={{ fontSize: '14px' }}>Content strategy and copywriting briefs</span>
              </div>
              <div style={{ backgroundColor: '#0a0a0a', padding: '12px', borderRadius: '8px', border: '1px solid #222' }}>
                <strong style={{ color: '#a3e635' }}>BUSINESS Mode</strong><br/>
                <span style={{ fontSize: '14px' }}>Business model and monetization planning</span>
              </div>
            </div>
            <p style={{ fontSize: '14px', color: '#888', marginBottom: '0' }}>
              Choose between BOT (structured, technical) or HUMAN (conversational, creative) personality for your analysis.
            </p>
          </section>

          {/* Step 3 */}
          <section style={{ marginBottom: '50px', backgroundColor: '#111', border: '1px solid #1a1a1a', borderRadius: '12px', padding: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ 
                width: '50px', 
                height: '50px', 
                backgroundColor: '#a3e635', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#000',
                fontWeight: 'bold',
                fontSize: '24px',
                marginRight: '20px'
              }}>3</div>
              <h2 style={{ fontSize: '28px', color: '#a3e635', margin: 0 }}>Get 15 Analysis Tabs</h2>
            </div>
            <p style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>
              PromptQuill AI generates a comprehensive brief with 15 analysis tabs:
            </p>
            <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <span style={{ fontSize: '14px' }}>• Executive Summary</span>
              <span style={{ fontSize: '14px' }}>• Competitors Analysis</span>
              <span style={{ fontSize: '14px' }}>• Target Audience</span>
              <span style={{ fontSize: '14px' }}>• Market Validation</span>
              <span style={{ fontSize: '14px' }}>• Launch Strategy</span>
              <span style={{ fontSize: '14px' }}>• Tech Architecture</span>
              <span style={{ fontSize: '14px' }}>• Monetization</span>
              <span style={{ fontSize: '14px' }}>• Team Requirements</span>
              <span style={{ fontSize: '14px' }}>• Financial Projections</span>
              <span style={{ fontSize: '14px' }}>• Risk Analysis</span>
              <span style={{ fontSize: '14px' }}>• Reddit Validator</span>
              <span style={{ fontSize: '14px' }}>• And more...</span>
            </div>
            <p style={{ fontSize: '14px', color: '#888', marginTop: '15px', marginBottom: '0' }}>
              All generated in under 30 seconds with intelligent routing across 15+ AI providers.
            </p>
          </section>

          {/* Step 4 */}
          <section style={{ marginBottom: '50px', backgroundColor: '#111', border: '1px solid #1a1a1a', borderRadius: '12px', padding: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ 
                width: '50px', 
                height: '50px', 
                backgroundColor: '#a3e635', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#000',
                fontWeight: 'bold',
                fontSize: '24px',
                marginRight: '20px'
              }}>4</div>
              <h2 style={{ fontSize: '28px', color: '#a3e635', margin: 0 }}>Export & Share</h2>
            </div>
            <p style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>
              Your brief is now ready to use:
            </p>
            <ul style={{ marginLeft: '20px', marginBottom: '0' }}>
              <li style={{ marginBottom: '8px' }}>Export as PDF for presentations and sharing</li>
              <li style={{ marginBottom: '8px' }}>Save to your Pro Tabs for organization</li>
              <li style={{ marginBottom: '8px' }}>Share on the community feed for feedback</li>
              <li style={{ marginBottom: '8px' }}>Use for investor pitch decks, team planning, or market research</li>
              <li style={{ marginBottom: '8px' }}>Store in cloud via Supabase for anytime access</li>
            </ul>
          </section>

          {/* Why It Works */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '28px', color: '#a3e635', marginBottom: '20px' }}>Why This Process Works</h2>
            <p style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '15px' }}>
              PromptQuill isn't just generating random text — it's applying structured thinking frameworks to your idea:
            </p>
            <ul style={{ marginLeft: '20px' }}>
              <li style={{ marginBottom: '12px' }}>
                <strong style={{ color: '#a3e635' }}>Multi-Model Intelligence:</strong> Routes your prompt across 15 different AI models to get the best response for each analysis type
              </li>
              <li style={{ marginBottom: '12px' }}>
                <strong style={{ color: '#a3e635' }}>Structured Output:</strong> Breaks analysis into 15 specific tabs instead of giving you one wall of text
              </li>
              <li style={{ marginBottom: '12px' }}>
                <strong style={{ color: '#a3e635' }}>Speed:</strong> Gets you results in under 30 seconds, so you can iterate quickly
              </li>
              <li style={{ marginBottom: '12px' }}>
                <strong style={{ color: '#a3e635' }}>Export Ready:</strong> Output is immediately usable for presentations, planning, or sharing
              </li>
              <li>
                <strong style={{ color: '#a3e635' }}>Community Feedback:</strong> Share your briefs to get Reddit-powered validation from real users
              </li>
            </ul>
          </section>

          {/* CTA */}
          <section style={{ backgroundColor: '#111', border: '2px solid #a3e635', borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '28px', color: '#a3e635', marginBottom: '15px' }}>Ready to Generate Your First Brief?</h2>
            <p style={{ fontSize: '16px', marginBottom: '25px' }}>
              Start for free with 10 generations per day. No credit card required.
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
                transition: '0.2s'
              }}
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
