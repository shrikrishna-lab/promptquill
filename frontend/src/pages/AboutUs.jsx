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
        description="Learn why we built the fastest growing AI prompt writer and idea validator in the developer community."
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
        <p style={styles.subtitle}>Empowering creators and builders with AI-driven prompt engineering</p>

        <div>
          <section style={styles.section}>
            <h2 style={styles.h2}>Our Mission</h2>
            <p style={styles.paragraph}>
              PromptQuill is dedicated to democratizing AI prompt engineering and empowering creators, developers, and businesses to unlock the full potential of artificial intelligence. We believe that prompt engineering should not be a gatekeeping skill reserved for AI experts.
            </p>
            <p style={styles.paragraph}>
              Our mission is to provide a simple, intuitive, and powerful platform that enables anyone—regardless of technical expertise—to craft strategic AI prompts that generate world-class outputs. By combining intelligent routing with intuitive design, we're transforming how people interact with AI.
            </p>
            <p style={styles.paragraph}>
              We recognize that the quality of AI outputs is directly proportional to the quality of prompts. PromptQuill acts as your personal prompt engineering assistant, transforming vague ideas into precise, actionable prompts that deliver exceptional results across all major AI platforms.
            </p>
            <p style={styles.paragraph}>
              At our core, we're building a future where AI is accessible, affordable, and intuitive for everyone. Whether you're a startup founder, content creator, software developer, or business professional, PromptQuill is your gateway to AI excellence.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.h2}>What We Do</h2>
            <p style={styles.paragraph}>
              PromptQuill is an AI-powered prompt generation platform that helps you:
            </p>
            <ul style={{ marginLeft: '20px', marginBottom: 0, listStyle: 'none', padding: 0 }}>
              {['Generate comprehensive strategic briefs in 30 seconds','Switch between multiple AI models and personalities','Validate prompts with Reddit-powered feedback','Export prompts as PDFs and share with teams','Access 15+ AI providers through intelligent routing','Create professional content faster than ever before'].map((item, i) => (
                <li key={i} style={{ ...styles.listItem, paddingLeft: '24px', position: 'relative', marginBottom: '10px' }}>
                  <span style={{ position: 'absolute', left: 0, color: '#a3e635' }}>✦</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section style={styles.section}>
            <h2 style={styles.h2}>Why PromptQuill?</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { label: 'Precision', desc: 'Our system produces high-quality briefs tailored to your needs' },
                { label: 'Speed', desc: 'Generate complete briefs in mere seconds' },
                { label: 'Flexibility', desc: 'Switch personalities and modes to find your perfect style' },
                { label: 'Intelligence', desc: 'Intelligent routing ensures optimal AI provider selection' },
                { label: 'Community', desc: 'Join thousands of creators using PromptQuill daily', span: true },
              ].map((item, i) => (
                <div key={i} style={{
                  ...styles.card,
                  gridColumn: item.span ? '1 / -1' : 'auto',
                  borderLeft: '3px solid #a3e635',
                }}>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: '#a3e635', marginBottom: '4px' }}>{item.label}</div>
                  <div style={{ fontSize: '14px', color: '#888', lineHeight: 1.6 }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </section>

          <section style={styles.sectionNoCard}>
            <h2 style={styles.h2}>Key Features</h2>
            <p style={{ ...styles.paragraph, color: '#666', fontSize: '14px', marginBottom: '20px' }}>
              Powerful tools designed to enhance your AI prompt engineering experience:
            </p>
            <div style={styles.cardGrid}>
              {[
                { emoji: '🚀', title: 'Pro Tabs', desc: 'Organize and manage multiple prompt projects simultaneously with unlimited tabs' },
                { emoji: '📊', title: 'Analytics', desc: 'Track usage patterns, response times, and optimize your prompt strategies with detailed insights' },
                { emoji: '🎯', title: 'Two Personalities', desc: 'BOT (technical, structured) and HUMAN (conversational, creative) modes for different use cases' },
                { emoji: '🌐', title: 'Multi-Model Support', desc: 'Access 15+ AI providers including GPT, Claude, Gemini, and more through one unified interface' },
                { emoji: '💾', title: 'Export & Share', desc: 'Export prompts as PDFs and share with your team for collaborative prompt engineering' },
                { emoji: '✨', title: 'Smart Generation', desc: 'Generate comprehensive strategic briefs in 30 seconds using AI-powered automation' },
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
            <h2 style={styles.h2}>Our Tech Stack</h2>
            <p style={{ ...styles.paragraph, color: '#666' }}>Built with modern, scalable technologies:</p>
            <div style={styles.infoBox}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {[
                  { label: 'Frontend', value: 'React 19 • React Router • Tailwind CSS' },
                  { label: 'Backend', value: 'Node.js • Express.js • REST APIs' },
                  { label: 'Database & Auth', value: 'Supabase • PostgreSQL • JWT Auth' },
                  { label: 'AI & Services', value: '15+ AI APIs • Your Infrastructure' },
                ].map((item, i) => (
                  <div key={i}>
                    <p style={{ margin: '0 0 6px 0', color: '#a3e635', fontWeight: '600', fontSize: '14px' }}>{item.label}</p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#888' }}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <p style={{ marginTop: '16px', fontSize: '13px', color: '#666', lineHeight: 1.7 }}>
              Our infrastructure is designed for scalability, security, and reliability. We're committed to maintaining the highest standards of service for all our users.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.h2}>Join Our Community</h2>
            <p style={styles.paragraph}>
              Join our growing community of 1000+ creators, entrepreneurs, and AI enthusiasts. Share your prompts, learn from others, collaborate on innovative projects, and stay updated with the latest AI developments.
            </p>
            <p style={{ ...styles.paragraph, color: '#666', fontSize: '14px' }}>
              We host regular challenges, webinars, and workshops to help you master AI prompt engineering. Connect with like-minded individuals and grow together.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '20px' }}>
              <a 
                href="https://twitter.com/yourhandle" 
                target="_blank" 
                rel="noopener noreferrer"
                style={styles.linkBtn}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#1a1a1a'; e.currentTarget.style.borderColor = '#a3e635'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#0d0d0d'; e.currentTarget.style.borderColor = '#1a1a1a'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                ✕ Follow on Twitter/X
              </a>
              <a 
                href="https://github.com/yourusername" 
                target="_blank" 
                rel="noopener noreferrer"
                style={styles.linkBtn}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#1a1a1a'; e.currentTarget.style.borderColor = '#a3e635'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#0d0d0d'; e.currentTarget.style.borderColor = '#1a1a1a'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                ★ Star on GitHub
              </a>
              <a 
                href="mailto:support@yourdomain.com"
                style={styles.linkBtn}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#1a1a1a'; e.currentTarget.style.borderColor = '#a3e635'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#0d0d0d'; e.currentTarget.style.borderColor = '#1a1a1a'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                ✉ Contact Community Team
              </a>
            </div>
          </section>

          <section style={styles.section}>
            <h2 style={styles.h2}>Contact & Support</h2>
            <p style={styles.paragraph}>
              Have questions, feedback, or suggestions? We'd love to hear from you. Our support team is available 24/7 to assist you with any inquiries.
            </p>
            <div style={styles.infoBox}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <div style={{ color: '#a3e635', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Email</div>
                  <div style={{ color: '#888', fontSize: '13px' }}>support@yourdomain.com</div>
                </div>
                <div>
                  <div style={{ color: '#a3e635', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>License</div>
                  <div style={{ color: '#888', fontSize: '13px' }}>MIT Open Source</div>
                </div>
                <div>
                  <div style={{ color: '#a3e635', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Location</div>
                  <div style={{ color: '#888', fontSize: '13px' }}>Pune, India</div>
                </div>
              </div>
              <div style={{ marginTop: '12px', fontSize: '13px', color: '#555', borderTop: '1px solid #1a1a1a', paddingTop: '12px' }}>
                Response time: Usually within 24 hours
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
