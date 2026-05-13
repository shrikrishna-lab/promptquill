import React from 'react';
import { useNavigate } from 'react-router-dom';

const TermsOfService = () => {
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
          Terms of Service
        </h1>
        <p style={{ color: '#888', marginBottom: '40px', fontSize: '14px' }}>
          Last updated: April 2026
        </p>

        <div style={{ lineHeight: '1.8', color: '#ccc' }}>
          
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', color: '#a3e635', marginBottom: '15px' }}>1. Acceptance of Terms</h2>
            <p>
              By accessing and using PromptQuill ("Service"), you accept and agree to be bound by the terms and provisions of this Terms of Service agreement ("Terms"). These Terms constitute a legally binding agreement between you ("User" or "you") and the project maintainers ("we," "us," or "our").
            </p>
            <p style={{ marginTop: '15px' }}>
              If you do not agree to abide by the above, please do not use this service. We reserve the right to modify these Terms at any time. Your continued use of the Service after such modifications constitutes your acceptance of the updated Terms.
            </p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', color: '#a3e635', marginBottom: '15px' }}>2. Use License</h2>
            <p style={{ marginBottom: '15px' }}>
              Subject to your compliance with these Terms, we grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Service for your personal, non-commercial purposes.
            </p>
            <p style={{ marginBottom: '15px', fontWeight: 'bold', color: '#aaa' }}>You may not:</p>
            <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
              <li style={{ marginBottom: '8px' }}>Reproduce, distribute, or transmit the Service or its content without our prior written permission</li>
              <li style={{ marginBottom: '8px' }}>Modify, translate, adapt, or create derivative works from our Service</li>
              <li style={{ marginBottom: '8px' }}>Reverse engineer, decompile, or attempt to derive source code or algorithms</li>
              <li style={{ marginBottom: '8px' }}>Remove or alter any copyright, trademark, or proprietary notices</li>
              <li style={{ marginBottom: '8px' }}>Use the Service for commercial purposes without authorization</li>
              <li style={{ marginBottom: '8px' }}>Automate or scrape data from the Service</li>
              <li style={{ marginBottom: '8px' }}>Upload malware, viruses, or any harmful code</li>
              <li style={{ marginBottom: '8px' }}>Use the Service to generate illegal or inappropriate content</li>
            </ul>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', color: '#a3e635', marginBottom: '15px' }}>3. User Accounts & Responsibilities</h2>
            <p style={{ marginBottom: '15px' }}>
              When you create an account with PromptQuill, you agree to:
            </p>
            <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
              <li style={{ marginBottom: '8px' }}>Provide accurate, complete, and current information</li>
              <li style={{ marginBottom: '8px' }}>Maintain the confidentiality of your password and account</li>
              <li style={{ marginBottom: '8px' }}>Accept responsibility for all activities under your account</li>
              <li style={{ marginBottom: '8px' }}>Notify us immediately of any unauthorized use</li>
              <li style={{ marginBottom: '8px' }}>Not create multiple accounts to circumvent payment or usage limits</li>
            </ul>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', color: '#a3e635', marginBottom: '15px' }}>4. Intellectual Property Rights</h2>
            <p style={{ marginBottom: '15px' }}>
              <strong>Our Content:</strong> All content, features, and functionality (including but not limited to software, code, design) are owned by PromptQuill or our content providers and are protected by copyright and other intellectual property laws.
            </p>
            <p style={{ marginBottom: '15px' }}>
              <strong>Your Content:</strong> You retain ownership of all prompts and content you create. By using our Service, you grant us a worldwide, royalty-free license to use your content for service improvement and analytics.
            </p>
            <p>
              <strong>Generated Outputs:</strong> AI-generated outputs are provided as-is. You are responsible for verifying accuracy and ensuring compliance with applicable laws and third-party rights.
            </p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', color: '#a3e635', marginBottom: '15px' }}>5. Disclaimer of Warranties</h2>
            <p style={{ marginBottom: '15px' }}>
              THE SERVICE IS PROVIDED ON AN \"AS IS\" AND \"AS AVAILABLE\" BASIS. PROMPTQUILL MAKES NO WARRANTIES, EXPRESS OR IMPLIED, REGARDING:
            </p>
            <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
              <li style={{ marginBottom: '8px' }}>Accuracy, completeness, or reliability of content</li>
              <li style={{ marginBottom: '8px' }}>Uninterrupted or error-free operation of the Service</li>
              <li style={{ marginBottom: '8px' }}>Quality of any products, services, or information</li>
              <li style={{ marginBottom: '8px' }}>AI outputs being suitable for your purpose</li>
            </ul>
            <p style={{ marginBottom: '15px', color: '#aaa', fontSize: '14px' }}>
              We do not warrant that the Service will meet your requirements, be uninterrupted, timely, secure, or error-free.
            </p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', color: '#a3e635', marginBottom: '15px' }}>6. Limitation of Liability</h2>
            <p style={{ marginBottom: '15px' }}>
              IN NO EVENT SHALL PROMPTQUILL, ITS DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR USE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
            </p>
            <p style={{ marginBottom: '15px' }}>
              Our total liability shall not exceed the amount you paid us in the 12 months prior to the claim or $100, whichever is greater.
            </p>
            <p style={{ color: '#aaa', fontSize: '14px' }}>
              Some jurisdictions do not allow limitation of liability, so this provision may not apply to you.
            </p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', color: '#a3e635', marginBottom: '15px' }}>7. Prohibited Activities</h2>
            <p style={{ marginBottom: '15px' }}>You agree not to engage in any of the following prohibited activities:</p>
            <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
              <li style={{ marginBottom: '8px' }}>Violating any applicable laws, regulations, or third-party rights</li>
              <li style={{ marginBottom: '8px' }}>Harassing, threatening, or defaming any person or entity</li>
              <li style={{ marginBottom: '8px' }}>Creating, distributing, or promoting illegal content</li>
              <li style={{ marginBottom: '8px' }}>Attempting to gain unauthorized access to the Service or other users' accounts</li>
              <li style={{ marginBottom: '8px' }}>Interfering with the proper functioning of the Service</li>
              <li style={{ marginBottom: '8px' }}>Collecting or tracking personal information of others without consent</li>
              <li style={{ marginBottom: '8px' }}>Violating our Acceptable Use Policy</li>
            </ul>
            <p style={{ marginTop: '15px', color: '#aaa', fontSize: '14px' }}>
              Violation of these prohibitions may result in immediate suspension or termination of your account.
            </p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', color: '#a3e635', marginBottom: '15px' }}>8. Subscription & Payments</h2>
            <p style={{ marginBottom: '15px' }}>
              Certain features of PromptQuill require a paid subscription. By subscribing, you agree to:
            </p>
            <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
              <li style={{ marginBottom: '8px' }}>Pay all fees according to the pricing displayed at the time of subscription</li>
              <li style={{ marginBottom: '8px' }}>Maintain current and accurate billing information</li>
              <li style={{ marginBottom: '8px' }}>Renewing subscriptions automatically unless cancelled</li>
              <li style={{ marginBottom: '8px' }}>Monthly subscriptions renew on the same day each month</li>
              <li style={{ marginBottom: '8px' }}>Cancellations take effect at the end of the billing period</li>
            </ul>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', color: '#a3e635', marginBottom: '15px' }}>9. Termination & Suspension</h2>
            <p style={{ marginBottom: '15px' }}>
              We may terminate or suspend your account immediately, without prior notice, if you:
            </p>
            <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
              <li style={{ marginBottom: '8px' }}>Violate these Terms of Service</li>
              <li style={{ marginBottom: '8px' }}>Engage in fraudulent or illegal activity</li>
              <li style={{ marginBottom: '8px' }}>Threaten, harass, or violate the rights of others</li>
              <li style={{ marginBottom: '8px' }}>Exceed usage limits or abuse the Service</li>
            </ul>
            <p style={{ marginTop: '15px' }}>
              Upon termination, your right to use the Service ceases immediately, and your account data may be deleted.
            </p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', color: '#a3e635', marginBottom: '15px' }}>10. Governing Law & Jurisdiction</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions. Any legal action or proceeding relating to these Terms shall be brought exclusively in the courts located in Pune, India.
            </p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', color: '#a3e635', marginBottom: '15px' }}>11. Contact Us</h2>
            <p>
              For questions about these Terms of Service, please contact support@yourdomain.com
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
