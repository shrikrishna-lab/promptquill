import React from 'react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
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
          Privacy Policy
        </h1>
        <p style={{ color: '#888', marginBottom: '40px', fontSize: '14px' }}>
          Last updated: April 2026
        </p>

        <div style={{ lineHeight: '1.8', color: '#ccc' }}>
          
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', color: '#a3e635', marginBottom: '15px' }}>1. Introduction</h2>
            <p>
              PromptQuill ("we", "our", or "us") is an open source project maintained by the community and provides an AI-powered prompt engineering platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services, including all related applications, features, and functionality.
            </p>
            <p style={{ marginTop: '15px', color: '#aaa', fontSize: '14px' }}>
              Please read this Privacy Policy carefully. If you do not agree with our policies and practices, please do not use our service. By accessing and using PromptQuill, you acknowledge that you have read, understood, and agree to be bound by all the provisions of this Privacy Policy.
            </p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', color: '#a3e635', marginBottom: '15px' }}>2. Information Collection and Use</h2>
            <p style={{ marginBottom: '10px' }}>We collect several different types of information for various purposes to provide and improve our service to you:</p>
            
            <h3 style={{ fontSize: '18px', color: '#a3e635', marginBottom: '10px', marginTop: '20px' }}>Account Information</h3>
            <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
              <li style={{ marginBottom: '8px' }}>Email address and account credentials (for authentication)</li>
              <li style={{ marginBottom: '8px' }}>Full name and profile picture (optional)</li>
              <li style={{ marginBottom: '8px' }}>Payment method and subscription tier</li>
            </ul>

            <h3 style={{ fontSize: '18px', color: '#a3e635', marginBottom: '10px', marginTop: '20px' }}>Usage Information</h3>
            <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
              <li style={{ marginBottom: '8px' }}>Prompts generated and their content</li>
              <li style={{ marginBottom: '8px' }}>User preferences (mode, personality, AI provider selection)</li>
              <li style={{ marginBottom: '8px' }}>Time spent on platform and features used</li>\n              <li style={{ marginBottom: '8px' }}>Community interactions (posts, comments, ratings)</li>
            </ul>

            <h3 style={{ fontSize: '18px', color: '#a3e635', marginBottom: '10px', marginTop: '20px' }}>Technical Information</h3>
            <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
              <li style={{ marginBottom: '8px' }}>Device type, browser, and operating system</li>
              <li style={{ marginBottom: '8px' }}>IP address and approximate geographic location</li>
              <li style={{ marginBottom: '8px' }}>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', color: '#a3e635', marginBottom: '15px' }}>3. Use of Data</h2>
            <p style={{ marginBottom: '15px' }}>PromptQuill uses the collected data for the following purposes:</p>
            
            <h3 style={{ fontSize: '18px', color: '#a3e635', marginBottom: '10px' }}>Service Delivery</h3>
            <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
              <li style={{ marginBottom: '8px' }}>To provide, operate, and maintain our platform</li>
              <li style={{ marginBottom: '8px' }}>To process your payments and manage subscriptions</li>
              <li style={{ marginBottom: '8px' }}>To authenticate users and maintain account security</li>
            </ul>

            <h3 style={{ fontSize: '18px', color: '#a3e635', marginBottom: '10px' }}>Communication</h3>
            <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
              <li style={{ marginBottom: '8px' }}>To send you service-related announcements and updates</li>
              <li style={{ marginBottom: '8px' }}>To respond to your inquiries and provide support</li>
              <li style={{ marginBottom: '8px' }}>To notify you about changes to our service or policies</li>
            </ul>

            <h3 style={{ fontSize: '18px', color: '#a3e635', marginBottom: '10px' }}>Improvement & Analytics</h3>
            <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
              <li style={{ marginBottom: '8px' }}>To analyze usage patterns and improve user experience</li>
              <li style={{ marginBottom: '8px' }}>To identify and fix technical issues</li>
              <li style={{ marginBottom: '8px' }}>To develop new features and enhancements</li>
              <li style={{ marginBottom: '8px' }}>To monitor system performance and capacity</li>
            </ul>

            <h3 style={{ fontSize: '18px', color: '#a3e635', marginBottom: '10px' }}>Safety & Compliance</h3>
            <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
              <li style={{ marginBottom: '8px' }}>To detect and prevent fraud or abuse</li>
              <li style={{ marginBottom: '8px' }}>To enforce our Terms of Service and other agreements</li>
              <li style={{ marginBottom: '8px' }}>To comply with legal obligations and regulations</li>
            </ul>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', color: '#a3e635', marginBottom: '15px' }}>4. Security of Data</h2>
            <p>
              The security of your personal data is extremely important to us. We implement industry-standard security measures including:\n            </p>
            <ul style={{ marginLeft: '20px', marginTop: '15px', marginBottom: '15px' }}>
              <li style={{ marginBottom: '8px' }}>SSL/TLS encryption for data transmitted over the internet</li>
              <li style={{ marginBottom: '8px' }}>Secure authentication mechanisms and password hashing</li>
              <li style={{ marginBottom: '8px' }}>Regular security audits and vulnerability assessments</li>
              <li style={{ marginBottom: '8px' }}>Restricted access to personal data on a need-to-know basis</li>
              <li style={{ marginBottom: '8px' }}>Supabase's enterprise-grade security infrastructure</li>
            </ul>
            <p style={{ marginTop: '15px', color: '#aaa', fontSize: '14px' }}>
              However, no method of transmission over the Internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security. You use our service at your own risk, and you are responsible for maintaining the confidentiality of your credentials.
            </p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', color: '#a3e635', marginBottom: '15px' }}>5. Third-Party Services & Data Sharing</h2>
            <p style={{ marginBottom: '15px' }}>
              Our service integrates with carefully selected third-party services to provide you with a complete experience:
            </p>
            
            <h3 style={{ fontSize: '18px', color: '#a3e635', marginBottom: '10px' }}>Authentication & Google OAuth</h3>
            <p style={{ marginBottom: '15px' }}>
              We use <strong>Supabase Auth</strong> and <strong>Google OAuth</strong> to provide secure login. If you sign in with Google, we access your <strong>email address, full name, and profile picture</strong> from your Google Account. 
            </p>
            <p style={{ marginBottom: '15px' }}>
              This data is used solely to create your account, personalize your dashboard, and verify your identity. We do not access your Google contacts, files, or other private data. Your credentials are processed according to Supabase's privacy policy at supabase.com/privacy and Google's privacy policy.
            </p>

            <h3 style={{ fontSize: '18px', color: '#a3e635', marginBottom: '10px' }}>Payments</h3>
            <p style={{ marginBottom: '15px' }}>
              Third-party payment processors securely handle all payment transactions. Your payment information is never stored on our servers.
            </p>

            <h3 style={{ fontSize: '18px', color: '#a3e635', marginBottom: '10px' }}>AI Providers</h3>
            <p style={{ marginBottom: '15px' }}>
              We route your prompts to various AI providers (OpenAI, Google Gemini, Groq, OpenRouter) based on your selection. Each provider has its own privacy policy. We do not sell or share your data with these providers beyond what is necessary to fulfill your request.
            </p>

            <h3 style={{ fontSize: '18px', color: '#a3e635', marginBottom: '10px' }}>Media Hosting</h3>
            <p>
              <strong>Cloudinary</strong> hosts blog images and media. See their privacy policy at cloudinary.com/privacy.
            </p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', color: '#a3e635', marginBottom: '15px' }}>6. Your Rights & Data Controls</h2>
            <p style={{ marginBottom: '15px' }}>You have the following rights regarding your personal data:</p>
            
            <h3 style={{ fontSize: '18px', color: '#a3e635', marginBottom: '10px' }}>Right to Access</h3>
            <p style={{ marginBottom: '15px' }}>
              You can request a copy of all personal data we hold about you. Contact support@yourdomain.com with your request.
            </p>

            <h3 style={{ fontSize: '18px', color: '#a3e635', marginBottom: '10px' }}>Right to Correction</h3>
            <p style={{ marginBottom: '15px' }}>
              If your information is inaccurate or incomplete, you can update it directly through your account settings or by contacting us.
            </p>

            <h3 style={{ fontSize: '18px', color: '#a3e635', marginBottom: '10px' }}>Right to Deletion</h3>
            <p style={{ marginBottom: '15px' }}>
              You can request deletion of your account and associated data. We will delete your information within 30 days, except where we're legally required to retain it.
            </p>

            <h3 style={{ fontSize: '18px', color: '#a3e635', marginBottom: '10px' }}>Right to Data Portability</h3>
            <p style={{ marginBottom: '15px' }}>
              You can request your data in a portable format that can be transferred to another service.
            </p>

            <h3 style={{ fontSize: '18px', color: '#a3e635', marginBottom: '10px' }}>Right to Opt-Out</h3>
            <p>
              You can opt-out of marketing communications at any time by clicking the unsubscribe link in emails or by updating your notification preferences.
            </p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', color: '#a3e635', marginBottom: '15px' }}>7. Data Retention</h2>
            <p style={{ marginBottom: '15px' }}>
              We retain your personal data only for as long as necessary to provide our services and comply with legal obligations:
            </p>
            <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
              <li style={{ marginBottom: '8px' }}><strong>Account Data:</strong> Retained while your account is active and for 6 months after deletion for record-keeping</li>
              <li style={{ marginBottom: '8px' }}><strong>Payment Records:</strong> Retained for 7 years to comply with tax and accounting regulations</li>
              <li style={{ marginBottom: '8px' }}><strong>Usage Analytics:</strong> Aggregated and anonymized after 12 months</li>
              <li style={{ marginBottom: '8px' }}><strong>Support Tickets:</strong> Retained for 2 years for reference and dispute resolution</li>
            </ul>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', color: '#a3e635', marginBottom: '15px' }}>8. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the new Privacy Policy on our website and updating the \"Last updated\" date. Your continued use of the Service after such modifications constitutes your acknowledgment and acceptance of the modified Privacy Policy.
            </p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', color: '#a3e635', marginBottom: '15px' }}>9. Contact Us</h2>
            <p style={{ marginBottom: '15px' }}>
              If you have any questions about this Privacy Policy or our privacy practices, please contact us:
            </p>
            <div style={{ backgroundColor: '#111', border: '1px solid #1a1a1a', borderRadius: '8px', padding: '20px', marginBottom: '15px' }}>
              <p style={{ margin: '0 0 8px 0' }}><strong>Email:</strong> support@yourdomain.com</p>
              <p style={{ margin: '0 0 8px 0' }}><strong>Project:</strong> Open Source MIT</p>
              <p style={{ margin: 0 }}><strong>Location:</strong> Pune, India</p>
            </div>
            <p style={{ color: '#888', fontSize: '14px' }}>
              We will respond to your privacy inquiries within 30 days.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
