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
  infoBox: {
    backgroundColor: '#0d0d0d',
    border: '1px solid #1a1a1a',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '15px',
  },
  infoP: {
    margin: '0 0 8px 0',
    fontSize: '15px',
    color: '#b0b0b0',
  },
  label: {
    color: '#a3e635',
    fontWeight: '600',
  },
};

const PrivacyPolicy = () => {
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

        <h1 style={s.h1}>Privacy Policy</h1>
        <p style={s.lastUpd}>Last updated: May 2026</p>

        <div>
          <section style={s.card}>
            <h2 style={s.h2}>1. Introduction</h2>
            <p style={s.p}>
              PromptQuill is an open-source AI-powered prompt engineering platform. This Privacy Policy explains how your information is handled when you use our website and services.
            </p>
            <p style={s.pSmall}>
              PromptQuill is open-source software designed for self-hosting. When you run your own instance, all data remains within your own infrastructure under your control. If you are using an instance hosted by someone else, please refer to their privacy practices for how they handle your data.
            </p>
          </section>

          <section style={s.card}>
            <h2 style={s.h2}>2. Information Collection and Use</h2>
            <p style={s.p}>When using a hosted instance of PromptQuill, certain information may be collected to provide and improve the service. If you self-host, all data is stored in your own Supabase instance and never transmitted elsewhere:</p>

            <h3 style={s.h3}>Account Information</h3>
            <ul style={s.ul}>
              <li style={s.li}><span style={s.dot}>•</span> Email address and account credentials (for authentication)</li>
              <li style={s.li}><span style={s.dot}>•</span> Full name and profile picture (optional)</li>
            </ul>

            <h3 style={s.h3}>Usage Information</h3>
            <ul style={s.ul}>
              <li style={s.li}><span style={s.dot}>•</span> Prompts generated and their content</li>
              <li style={s.li}><span style={s.dot}>•</span> User preferences (mode, personality, AI provider selection)</li>
              <li style={s.li}><span style={s.dot}>•</span> Time spent on platform and features used</li>
              <li style={s.li}><span style={s.dot}>•</span> Community interactions (posts, comments, ratings)</li>
            </ul>

            <h3 style={s.h3}>Technical Information</h3>
            <ul style={s.ul}>
              <li style={s.li}><span style={s.dot}>•</span> Device type, browser, and operating system</li>
              <li style={s.li}><span style={s.dot}>•</span> IP address and approximate geographic location</li>
            </ul>
          </section>

          <section style={s.card}>
            <h2 style={s.h2}>3. Use of Data</h2>
            <p style={s.p}>PromptQuill uses the collected data for the following purposes:</p>

            <h3 style={s.h3}>Service Delivery</h3>
            <ul style={s.ul}>
              <li style={s.li}><span style={s.dot}>•</span> To provide, operate, and maintain our platform</li>
              <li style={s.li}><span style={s.dot}>•</span> To authenticate users and maintain account security</li>
            </ul>

            <h3 style={s.h3}>Communication</h3>
            <ul style={s.ul}>
              <li style={s.li}><span style={s.dot}>•</span> To send you service-related announcements and updates</li>
              <li style={s.li}><span style={s.dot}>•</span> To respond to your inquiries and provide support</li>
              <li style={s.li}><span style={s.dot}>•</span> To notify you about changes to our service or policies</li>
            </ul>

            <h3 style={s.h3}>Improvement & Analytics</h3>
            <ul style={s.ul}>
              <li style={s.li}><span style={s.dot}>•</span> To analyze usage patterns and improve user experience</li>
              <li style={s.li}><span style={s.dot}>•</span> To identify and fix technical issues</li>
              <li style={s.li}><span style={s.dot}>•</span> To develop new features and enhancements</li>
              <li style={s.li}><span style={s.dot}>•</span> To monitor system performance and capacity</li>
            </ul>

            <h3 style={s.h3}>Safety & Compliance</h3>
            <ul style={s.ul}>
              <li style={s.li}><span style={s.dot}>•</span> To detect and prevent fraud or abuse</li>
              <li style={s.li}><span style={s.dot}>•</span> To enforce our Terms of Service and other agreements</li>
              <li style={s.li}><span style={s.dot}>•</span> To comply with legal obligations and regulations</li>
            </ul>
          </section>

          <section style={s.card}>
            <h2 style={s.h2}>4. Security of Data</h2>
            <p style={s.p}>
              The security of your personal data is extremely important to us. We implement industry-standard security measures including:
            </p>
            <ul style={s.ul}>
              <li style={s.li}><span style={s.dot}>•</span> SSL/TLS encryption for data transmitted over the internet</li>
              <li style={s.li}><span style={s.dot}>•</span> Secure authentication mechanisms and password hashing</li>
              <li style={s.li}><span style={s.dot}>•</span> Regular security audits and vulnerability assessments</li>
              <li style={s.li}><span style={s.dot}>•</span> Restricted access to personal data on a need-to-know basis</li>
              <li style={s.li}><span style={s.dot}>•</span> Supabase's enterprise-grade security infrastructure</li>
            </ul>
            <p style={s.pSmall}>
              However, no method of transmission over the Internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security. You use our service at your own risk, and you are responsible for maintaining the confidentiality of your credentials.
            </p>
          </section>

          <section style={s.card}>
            <h2 style={s.h2}>5. Third-Party Services & Data Sharing</h2>
            <p style={s.p}>
              PromptQuill integrates with several third-party services to provide functionality. Depending on how you configure your self-hosted instance, the following services may be involved:
            </p>

            <h3 style={s.h3}>Authentication & Google OAuth</h3>
            <p style={s.p}>
              We use <strong style={{ color: '#a3e635' }}>Supabase Auth</strong> and <strong style={{ color: '#a3e635' }}>Google OAuth</strong> to provide secure login. If you sign in with Google, we access your <strong style={{ color: '#a3e635' }}>email address, full name, and profile picture</strong> from your Google Account.
            </p>
            <p style={s.p}>
              This data is used solely to create your account, personalize your dashboard, and verify your identity. We do not access your Google contacts, files, or other private data. Your credentials are processed according to Supabase's privacy policy at supabase.com/privacy and Google's privacy policy.
            </p>

            <h3 style={s.h3}>AI Providers</h3>
            <p style={s.p}>
              We route your prompts to various AI providers (OpenAI, Google Gemini, Groq, OpenRouter) based on your selection. Each provider has its own privacy policy. We do not sell or share your data with these providers beyond what is necessary to fulfill your request.
            </p>

            <h3 style={s.h3}>Media Hosting</h3>
            <p style={s.p}>
              <strong style={{ color: '#a3e635' }}>Cloudinary</strong> hosts blog images and media. See their privacy policy at cloudinary.com/privacy.
            </p>
          </section>

          <section style={s.card}>
            <h2 style={s.h2}>6. Your Rights & Data Controls</h2>
            <p style={s.p}>You have the following rights regarding your personal data:</p>

            <h3 style={s.h3}>Right to Access</h3>
            <p style={s.p}>
              You can request a copy of all personal data held about you. Contact the instance administrator to make a request.
            </p>

            <h3 style={s.h3}>Right to Correction</h3>
            <p style={s.p}>
              If your information is inaccurate or incomplete, you can update it directly through your account settings or by contacting us.
            </p>

            <h3 style={s.h3}>Right to Deletion</h3>
            <p style={s.p}>
              You can request deletion of your account and associated data. We will delete your information within 30 days, except where we're legally required to retain it.
            </p>

            <h3 style={s.h3}>Right to Data Portability</h3>
            <p style={s.p}>
              You can request your data in a portable format that can be transferred to another service.
            </p>

            <h3 style={s.h3}>Right to Opt-Out</h3>
            <p style={s.p}>
              You can opt-out of non-essential communications at any time by updating your notification preferences.
            </p>
          </section>

          <section style={s.card}>
            <h2 style={s.h2}>7. Data Retention</h2>
            <p style={s.p}>
              We retain your personal data only for as long as necessary to provide our services and comply with legal obligations:
            </p>
            <ul style={s.ul}>
              <li style={s.li}><span style={s.dot}>•</span> <strong style={{ color: '#a3e635' }}>Account Data:</strong> Retained while your account is active and for 6 months after deletion for record-keeping</li>
              <li style={s.li}><span style={s.dot}>•</span> <strong style={{ color: '#a3e635' }}>Usage Analytics:</strong> Aggregated and anonymized after 12 months</li>
              <li style={s.li}><span style={s.dot}>•</span> <strong style={{ color: '#a3e635' }}>Support Tickets:</strong> Retained for 2 years for reference and dispute resolution</li>
            </ul>
          </section>

          <section style={s.card}>
            <h2 style={s.h2}>8. Changes to This Privacy Policy</h2>
            <p style={s.p}>
              We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. Changes will be posted on our website with the "Last updated" date. We encourage you to review this policy periodically.
            </p>
          </section>

          <section style={s.card}>
            <h2 style={s.h2}>9. Contact Us</h2>
            <p style={s.p}>
              If you have any questions about this Privacy Policy or our privacy practices, please open an issue on our GitHub repository or contact the instance administrator.
            </p>
            <div style={s.infoBox}>
              <p style={s.infoP}><span style={s.label}>Project:</span> PromptQuill (open source)</p>
              <p style={{ ...s.infoP, margin: 0 }}><span style={s.label}>GitHub:</span> github.com/your-username/promptquill</p>
            </div>
            <p style={s.pSmall}>
              For privacy concerns regarding a specific hosted instance, please contact the operator of that instance directly.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
