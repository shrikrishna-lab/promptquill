import React from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';

const AboutUs = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000', color: '#e5e5e5', paddingTop: '80px' }}>
      <SEO 
        title="About PromptQuill" 
        description="Learn why we built the fastest growing AI prompt writer and idea validator in the developer community."
        url="/about"
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
          About PromptQuill
        </h1>
        <p style={{ color: '#888', marginBottom: '40px', fontSize: '14px' }}>
          Empowering creators and builders with AI-driven prompt engineering
        </p>

        <div style={{ lineHeight: '1.8', color: '#ccc' }}>
          
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', color: '#a3e635', marginBottom: '15px' }}>Our Mission</h2>
            <p style={{ marginBottom: '12px' }}>
              PromptQuill is dedicated to democratizing AI prompt engineering and empowering creators, developers, and businesses to unlock the full potential of artificial intelligence. We believe that prompt engineering should not be a gatekeeping skill reserved for AI experts.
            </p>
            <p style={{ marginBottom: '12px' }}>
              Our mission is to provide a simple, intuitive, and powerful platform that enables anyone—regardless of technical expertise—to craft strategic AI prompts that generate world-class outputs. By combining intelligent routing with intuitive design, we're transforming how people interact with AI.
            </p>
            <p style={{ marginBottom: '12px' }}>
              We recognize that the quality of AI outputs is directly proportional to the quality of prompts. PromptQuill acts as your personal prompt engineering assistant, transforming vague ideas into precise, actionable prompts that deliver exceptional results across all major AI platforms.
            </p>
            <p>
              At our core, we're building a future where AI is accessible, affordable, and intuitive for everyone. Whether you're a startup founder, content creator, software developer, or business professional, PromptQuill is your gateway to AI excellence.
            </p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', color: '#a3e635', marginBottom: '15px' }}>What We Do</h2>
            <p style={{ marginBottom: '15px' }}>
              PromptQuill is an AI-powered prompt generation platform that helps you:
            </p>
            <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
              <li style={{ marginBottom: '8px' }}>Generate comprehensive strategic briefs in 30 seconds</li>
              <li style={{ marginBottom: '8px' }}>Switch between multiple AI models and personalities</li>
              <li style={{ marginBottom: '8px' }}>Validate prompts with Reddit-powered feedback</li>
              <li style={{ marginBottom: '8px' }}>Export prompts as PDFs and share with teams</li>
              <li style={{ marginBottom: '8px' }}>Access 15+ AI providers through intelligent routing</li>
              <li style={{ marginBottom: '8px' }}>Create professional content faster than ever before</li>
            </ul>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', color: '#a3e635', marginBottom: '15px' }}>Why PromptQuill?</h2>
            <p style={{ marginBottom: '15px' }}>
              We understand that prompt engineering is an art and a science. That's why we built PromptQuill with:
            </p>
            <ul style={{ marginLeft: '20px' }}>
              <li style={{ marginBottom: '8px' }}><strong>Precision:</strong> Our system produces high-quality briefs tailored to your needs</li>
              <li style={{ marginBottom: '8px' }}><strong>Speed:</strong> Generate complete briefs in mere seconds</li>
              <li style={{ marginBottom: '8px' }}><strong>Flexibility:</strong> Switch personalities and modes to find your perfect style</li>
              <li style={{ marginBottom: '8px' }}><strong>Intelligence:</strong> Intelligent routing ensures optimal AI provider selection</li>
              <li style={{ marginBottom: '8px' }}><strong>Community:</strong> Join thousands of creators using PromptQuill daily</li>
            </ul>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', color: '#a3e635', marginBottom: '15px' }}>Key Features</h2>
            <p style={{ marginBottom: '15px', color: '#888', fontSize: '14px' }}>
              Powerful tools designed to enhance your AI prompt engineering experience:
            </p>
            <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' }}>
              <div style={{ backgroundColor: '#111', border: '1px solid #1a1a1a', borderRadius: '8px', padding: '15px' }}>
                <h3 style={{ fontSize: '18px', color: '#a3e635', marginBottom: '8px' }}>🚀 Pro Tabs</h3>
                <p style={{ fontSize: '14px', marginBottom: '8px' }}>Organize and manage multiple prompt projects simultaneously with unlimited tabs</p>
              </div>
              <div style={{ backgroundColor: '#111', border: '1px solid #1a1a1a', borderRadius: '8px', padding: '15px' }}>
                <h3 style={{ fontSize: '18px', color: '#a3e635', marginBottom: '8px' }}>📊 Analytics</h3>
                <p style={{ fontSize: '14px', marginBottom: '8px' }}>Track usage patterns, response times, and optimize your prompt strategies with detailed insights</p>
              </div>
              <div style={{ backgroundColor: '#111', border: '1px solid #1a1a1a', borderRadius: '8px', padding: '15px' }}>
                <h3 style={{ fontSize: '18px', color: '#a3e635', marginBottom: '8px' }}>🎯 Two Personalities</h3>
                <p style={{ fontSize: '14px', marginBottom: '8px' }}>BOT (technical, structured) and HUMAN (conversational, creative) modes for different use cases</p>
              </div>
              <div style={{ backgroundColor: '#111', border: '1px solid #1a1a1a', borderRadius: '8px', padding: '15px' }}>
                <h3 style={{ fontSize: '18px', color: '#a3e635', marginBottom: '8px' }}>🌐 Multi-Model Support</h3>
                <p style={{ fontSize: '14px', marginBottom: '8px' }}>Access 15+ AI providers including GPT, Claude, Gemini, and more through one unified interface</p>
              </div>
              <div style={{ backgroundColor: '#111', border: '1px solid #1a1a1a', borderRadius: '8px', padding: '15px' }}>
                <h3 style={{ fontSize: '18px', color: '#a3e635', marginBottom: '8px' }}>💾 Export & Share</h3>
                <p style={{ fontSize: '14px', marginBottom: '8px' }}>Export prompts as PDFs and share with your team for collaborative prompt engineering</p>
              </div>
              <div style={{ backgroundColor: '#111', border: '1px solid #1a1a1a', borderRadius: '8px', padding: '15px' }}>
                <h3 style={{ fontSize: '18px', color: '#a3e635', marginBottom: '8px' }}>✨ Smart Generation</h3>
                <p style={{ fontSize: '14px', marginBottom: '8px' }}>Generate comprehensive strategic briefs in 30 seconds using AI-powered automation</p>
              </div>
            </div>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', color: '#a3e635', marginBottom: '15px' }}>Our Tech Stack</h2>
            <p style={{ marginBottom: '15px', color: '#888' }}>Built with modern, scalable technologies:</p>
            <div style={{ backgroundColor: '#111', border: '1px solid #1a1a1a', borderRadius: '8px', padding: '20px' }}>
              <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <p style={{ margin: '0 0 8px 0', color: '#a3e635', fontWeight: 'bold' }}>Frontend</p>
                  <p style={{ margin: 0, fontSize: '14px' }}>React 19 • React Router • Tailwind CSS</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 8px 0', color: '#a3e635', fontWeight: 'bold' }}>Backend</p>
                  <p style={{ margin: 0, fontSize: '14px' }}>Node.js • Express.js • REST APIs</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 8px 0', color: '#a3e635', fontWeight: 'bold' }}>Database & Auth</p>
                  <p style={{ margin: 0, fontSize: '14px' }}>Supabase • PostgreSQL • JWT Auth</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 8px 0', color: '#a3e635', fontWeight: 'bold' }}>AI & Services</p>
                  <p style={{ margin: 0, fontSize: '14px' }}>15+ AI APIs • Cloudinary</p>
                </div>
              </div>
            </div>
            <p style={{ marginTop: '15px', fontSize: '14px', color: '#888' }}>
              Our infrastructure is designed for scalability, security, and reliability. We're committed to maintaining the highest standards of service for all our users.
            </p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', color: '#a3e635', marginBottom: '15px' }}>Join Our Community</h2>
            <p style={{ marginBottom: '15px' }}>
              Join our growing community of 1000+ creators, entrepreneurs, and AI enthusiasts. Share your prompts, learn from others, collaborate on innovative projects, and stay updated with the latest AI developments.
            </p>
            <p style={{ marginBottom: '20px', color: '#888', fontSize: '14px' }}>
              We host regular challenges, webinars, and workshops to help you master AI prompt engineering. Connect with like-minded individuals and grow together.
            </p>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <a 
                href="https://twitter.com/yourhandle" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  display: 'inline-block',
                  backgroundColor: '#111',
                  border: '1px solid #1a1a1a',
                  color: '#a3e635', 
                  textDecoration: 'none',
                  padding: '10px 15px',
                  borderRadius: '6px',
                  transition: '0.2s',
                  fontSize: '14px'
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#1a1a1a'; e.currentTarget.style.borderColor = '#a3e635'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#111'; e.currentTarget.style.borderColor = '#1a1a1a'; }}
              >
                Follow on Twitter/X
              </a>
              <a 
                href="https://github.com/yourusername" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  display: 'inline-block',
                  backgroundColor: '#111',
                  border: '1px solid #1a1a1a',
                  color: '#a3e635', 
                  textDecoration: 'none',
                  padding: '10px 15px',
                  borderRadius: '6px',
                  transition: '0.2s',
                  fontSize: '14px'
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#1a1a1a'; e.currentTarget.style.borderColor = '#a3e635'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#111'; e.currentTarget.style.borderColor = '#1a1a1a'; }}
              >
                Star on GitHub
              </a>
              <a 
                href="mailto:support@yourdomain.com"
                style={{ 
                  display: 'inline-block',
                  backgroundColor: '#111',
                  border: '1px solid #1a1a1a',
                  color: '#a3e635', 
                  textDecoration: 'none',
                  padding: '10px 15px',
                  borderRadius: '6px',
                  transition: '0.2s',
                  fontSize: '14px'
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#1a1a1a'; e.currentTarget.style.borderColor = '#a3e635'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#111'; e.currentTarget.style.borderColor = '#1a1a1a'; }}
              >
                Contact Community Team
              </a>
            </div>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', color: '#a3e635', marginBottom: '15px' }}>Contact & Support</h2>
            <p style={{ marginBottom: '15px' }}>
              Have questions, feedback, or suggestions? We'd love to hear from you. Our support team is available 24/7 to assist you with any inquiries.
            </p>
            <div style={{ backgroundColor: '#111', border: '1px solid #1a1a1a', borderRadius: '8px', padding: '20px' }}>
              <p style={{ margin: '0 0 10px 0' }}><strong style={{ color: '#a3e635' }}>Email:</strong> support@yourdomain.com</p>
              <p style={{ margin: '0 0 10px 0' }}><strong style={{ color: '#a3e635' }}>License:</strong> MIT Open Source</p>
              <p style={{ margin: '0 0 10px 0' }}><strong style={{ color: '#a3e635' }}>Location:</strong> Pune, India</p>
              <p style={{ margin: '0', fontSize: '14px', color: '#888' }}>Response time: Usually within 24 hours</p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default AboutUs;
