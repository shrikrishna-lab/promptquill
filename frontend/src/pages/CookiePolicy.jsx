import React from 'react';
import { useNavigate } from 'react-router-dom';

const s = {
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
  h1: {
    fontSize: '48px',
    fontWeight: '800',
    marginBottom: '10px',
    color: '#a3e635',
    letterSpacing: '-0.02em',
    lineHeight: 1.1,
  },
  lastUpd: {
    color: '#555',
    marginBottom: '50px',
    fontSize: '14px',
    borderLeft: '3px solid #a3e635',
    paddingLeft: '16px',
  },
  card: {
    background: '#0d0d0d',
    border: '1px solid #1a1a1a',
    borderRadius: '16px',
    padding: '36px',
    marginBottom: '24px',
  },
  h2: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#a3e635',
    marginBottom: '18px',
    paddingBottom: '12px',
    borderBottom: '1px solid #1a1a1a',
  },
  h3: {
    fontSize: '17px',
    fontWeight: '600',
    color: '#a3e635',
    marginBottom: '10px',
    marginTop: '24px',
  },
  p: {
    marginBottom: '14px',
    lineHeight: '1.85',
    color: '#b0b0b0',
    fontSize: '15px',
  },
  pSmall: {
    fontSize: '14px',
    lineHeight: 1.8,
    color: '#666',
    marginTop: '15px',
  },
  ul: {
    marginLeft: '0',
    marginBottom: '15px',
    padding: 0,
    listStyle: 'none',
  },
  li: {
    marginBottom: '8px',
    lineHeight: 1.7,
    color: '#b0b0b0',
    fontSize: '15px',
    paddingLeft: '24px',
    position: 'relative',
  },
  dot: {
    position: 'absolute',
    left: 0,
    color: '#a3e635',
  },
};

const CookiePolicy = () => {
  const navigate = useNavigate();

  return (
    <div style={s.page}>
      <div style={s.container}>
        <button
          onClick={() => navigate(-1)}
          style={s.backBtn}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#a3e635'; e.currentTarget.style.backgroundColor = '#0d0d0d'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#1a1a1a'; e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          ← Back
        </button>

        <h1 style={s.h1}>Cookie Policy</h1>
        <p style={s.lastUpd}>Last updated: May 2026</p>

        <div>
          <section style={s.card}>
            <h2 style={s.h2}>1. What are Cookies?</h2>
            <p style={s.p}>
              Cookies are small text files that are placed on your device (computer, tablet, or mobile phone) when you visit PromptQuill. They are widely used to make websites work more efficiently, as well as to provide information to the owners of the site.
            </p>
            <p style={s.p}>
              Cookies help us:
            </p>
            <ul style={s.ul}>
              <li style={s.li}><span style={s.dot}>•</span> Remember your login information and session</li>
              <li style={s.li}><span style={s.dot}>•</span> Understand how you interact with the platform</li>
              <li style={s.li}><span style={s.dot}>•</span> Personalize your experience based on preferences</li>
              <li style={s.li}><span style={s.dot}>•</span> Ensure the security of your account</li>
            </ul>
          </section>

          <section style={s.card}>
            <h2 style={s.h2}>2. Types of Cookies We Use</h2>
            <p style={s.p}>We use the following types of cookies on PromptQuill:</p>

            <h3 style={s.h3}>Essential Cookies</h3>
            <p style={s.p}>
              These cookies are absolutely necessary for the website to function properly. They enable:
            </p>
            <ul style={s.ul}>
              <li style={s.li}><span style={s.dot}>•</span> User login and authentication</li>
              <li style={s.li}><span style={s.dot}>•</span> Session management</li>
              <li style={s.li}><span style={s.dot}>•</span> Security and fraud prevention</li>
              <li style={s.li}><span style={s.dot}>•</span> Accessing paid features based on subscription level</li>
            </ul>

            <h3 style={s.h3}>Preference Cookies</h3>
            <p style={s.p}>
              These cookies remember your choices to provide a personalized experience:
            </p>
            <ul style={s.ul}>
              <li style={s.li}><span style={s.dot}>•</span> Language and theme preferences</li>
              <li style={s.li}><span style={s.dot}>•</span> AI provider selection and mode preferences</li>
              <li style={s.li}><span style={s.dot}>•</span> Interface customization settings</li>
              <li style={s.li}><span style={s.dot}>•</span> Recently used features and shortcuts</li>
            </ul>

            <h3 style={s.h3}>Analytics Cookies (Optional)</h3>
            <p style={s.p}>
              If you have self-hosted analytics (e.g., Plausible, Umami), these cookies track anonymous usage data. No analytics cookies are set by default.
            </p>
          </section>

          <section style={s.card}>
            <h2 style={s.h2}>3. How We Use Cookies</h2>
            <ul style={s.ul}>
              <li style={s.li}><span style={s.dot}>•</span> To authenticate users and maintain sessions</li>
              <li style={s.li}><span style={s.dot}>•</span> To remember user preferences and settings</li>
              <li style={s.li}><span style={s.dot}>•</span> To improve website performance and functionality</li>
              <li style={s.li}><span style={s.dot}>•</span> To personalize user experience</li>
            </ul>
          </section>

          <section style={s.card}>
            <h2 style={s.h2}>4. Third-Party Cookies</h2>
            <p style={s.p}>
              PromptQuill does not embed third-party tracking cookies by default. Any third-party services you self-host (e.g., analytics) are your own responsibility.
            </p>
          </section>

          <section style={s.card}>
            <h2 style={s.h2}>5. Managing Cookies</h2>
            <p style={s.p}>You can control cookies through your browser settings:</p>
            <ul style={s.ul}>
              <li style={s.li}><span style={s.dot}>•</span> Accept or reject cookies</li>
              <li style={s.li}><span style={s.dot}>•</span> Delete existing cookies</li>
              <li style={s.li}><span style={s.dot}>•</span> Set preferences for specific websites</li>
            </ul>
            <p style={s.pSmall}>
              Note: Disabling essential cookies may prevent the website from functioning properly.
            </p>
          </section>

          <section style={s.card}>
            <h2 style={s.h2}>6. Consent</h2>
            <p style={s.p}>
              By using PromptQuill, you consent to the use of cookies as described in this policy. If you do not agree, please adjust your browser settings or stop using our service.
            </p>
          </section>

          <section style={s.card}>
            <h2 style={s.h2}>7. Contact Us</h2>
            <p style={s.p}>
              If you have questions about this cookie policy, please open an issue on the PromptQuill GitHub repository or contact the project maintainers.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;
