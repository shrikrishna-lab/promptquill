import React from 'react';
import { useNavigate } from 'react-router-dom';

const CookiePolicy = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000', color: '#e5e5e5', paddingTop: '80px' }}>
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
          Cookie Policy
        </h1>
        <p style={{ color: '#888', marginBottom: '40px', fontSize: '14px' }}>
          Last updated: April 2026
        </p>

        <div style={{ lineHeight: '1.8', color: '#ccc' }}>
          
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', color: '#a3e635', marginBottom: '15px' }}>1. What are Cookies?</h2>
            <p>
              Cookies are small text files that are placed on your device (computer, tablet, or mobile phone) when you visit PromptQuill. They are widely used to make websites work more efficiently, as well as to provide information to the owners of the site.
            </p>
            <p style={{ marginTop: '15px' }}>
              Cookies help us:
            </p>
            <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
              <li style={{ marginBottom: '8px' }}>Remember your login information and session</li>
              <li style={{ marginBottom: '8px' }}>Understand how you interact with our platform</li>
              <li style={{ marginBottom: '8px' }}>Personalize your experience based on preferences</li>
              <li style={{ marginBottom: '8px' }}>Analyze usage patterns to improve our services</li>
              <li style={{ marginBottom: '8px' }}>Ensure the security of your account</li>
            </ul>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', color: '#a3e635', marginBottom: '15px' }}>2. Types of Cookies We Use</h2>
            <p style={{ marginBottom: '15px' }}>We use the following types of cookies on PromptQuill:</p>
            
            <h3 style={{ fontSize: '18px', color: '#a3e635', marginBottom: '10px', marginTop: '20px' }}>Essential Cookies</h3>
            <p style={{ marginBottom: '15px' }}>
              These cookies are absolutely necessary for the website to function properly. They enable:
            </p>
            <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
              <li style={{ marginBottom: '8px' }}>User login and authentication</li>
              <li style={{ marginBottom: '8px' }}>Session management</li>
              <li style={{ marginBottom: '8px' }}>Security and fraud prevention</li>
              <li style={{ marginBottom: '8px' }}>Accessing paid features based on subscription level</li>
            </ul>

            <h3 style={{ fontSize: '18px', color: '#a3e635', marginBottom: '10px', marginTop: '20px' }}>Preference Cookies</h3>
            <p style={{ marginBottom: '15px' }}>
              These cookies remember your choices to provide a personalized experience:
            </p>
            <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
              <li style={{ marginBottom: '8px' }}>Language and theme preferences</li>
              <li style={{ marginBottom: '8px' }}>AI provider selection and mode preferences</li>
              <li style={{ marginBottom: '8px' }}>Interface customization settings</li>
              <li style={{ marginBottom: '8px' }}>Recently used features and shortcuts</li>
            </ul>

            <h3 style={{ fontSize: '18px', color: '#a3e635', marginBottom: '10px', marginTop: '20px' }}>Analytics Cookies</h3>
            <p style={{ marginBottom: '15px' }}>
              These cookies help us understand how users interact with our platform:
            </p>
            <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
              <li style={{ marginBottom: '8px' }}>Pages visited and features used</li>
              <li style={{ marginBottom: '8px' }}>Time spent on different sections</li>
              <li style={{ marginBottom: '8px' }}>Click patterns and user flows</li>
              <li style={{ marginBottom: '8px' }}>Errors and performance issues</li>
            </ul>

            <h3 style={{ fontSize: '18px', color: '#a3e635', marginBottom: '10px', marginTop: '20px' }}>Marketing Cookies</h3>
            <p style={{ marginBottom: '15px' }}>
              These cookies are used to measure advertising effectiveness and personalize content recommendations (if you consent).
            </p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', color: '#a3e635', marginBottom: '15px' }}>3. How We Use Cookies</h2>
            <ul style={{ marginLeft: '20px' }}>
              <li style={{ marginBottom: '8px' }}>To authenticate users and maintain sessions</li>
              <li style={{ marginBottom: '8px' }}>To remember user preferences and settings</li>
              <li style={{ marginBottom: '8px' }}>To analyze website traffic and usage patterns</li>
              <li style={{ marginBottom: '8px' }}>To improve website performance and functionality</li>
              <li style={{ marginBottom: '8px' }}>To personalize user experience</li>
            </ul>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', color: '#a3e635', marginBottom: '15px' }}>4. Third-Party Cookies</h2>
            <p>
              We may allow third-party service providers (analytics, payment processors) to place cookies on your device. These cookies are governed by their privacy policies, not ours.
            </p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', color: '#a3e635', marginBottom: '15px' }}>5. Managing Cookies</h2>
            <p style={{ marginBottom: '10px' }}>You can control cookies through your browser settings:</p>
            <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
              <li style={{ marginBottom: '8px' }}>Accept or reject cookies</li>
              <li style={{ marginBottom: '8px' }}>Delete existing cookies</li>
              <li style={{ marginBottom: '8px' }}>Set preferences for specific websites</li>
            </ul>
            <p style={{ color: '#888' }}>
              Note: Disabling essential cookies may prevent the website from functioning properly.
            </p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', color: '#a3e635', marginBottom: '15px' }}>6. Consent</h2>
            <p>
              By using PromptQuill, you consent to the use of cookies as described in this policy. If you do not agree, please adjust your browser settings or stop using our service.
            </p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', color: '#a3e635', marginBottom: '15px' }}>7. Contact Us</h2>
            <p style={{ marginBottom: '15px' }}>
              If you have questions about our cookie practices or this policy, please contact us:
            </p>
            <div style={{ backgroundColor: '#111', border: '1px solid #1a1a1a', borderRadius: '8px', padding: '20px' }}>
              <p style={{ margin: '0 0 8px 0' }}><strong>Email:</strong> support@yourdomain.com</p>
              <p style={{ margin: '0 0 8px 0' }}><strong>Project:</strong> Open Source MIT</p>
              <p style={{ margin: 0 }}><strong>Location:</strong> Pune, India</p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;
