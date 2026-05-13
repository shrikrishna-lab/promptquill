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
  link: {
    color: '#a3e635',
    textDecoration: 'none',
  },
};

const TermsOfService = () => {
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

        <h1 style={s.h1}>Terms of Service</h1>
        <p style={s.lastUpd}>Last updated: May 2026</p>

        <div>
          <section style={s.card}>
            <h2 style={s.h2}>1. Acceptance of Terms</h2>
            <p style={s.p}>
              By accessing and using PromptQuill ("Service"), you accept and agree to be bound by the terms and provisions of this Terms of Service agreement ("Terms"). This is an open source project provided as-is by the project maintainers ("we," "us," or "our").
            </p>
            <p style={s.p}>
              If you do not agree to abide by the above, please do not use this service. As a self-hosted instance, you are responsible for your own deployment and data. The project maintainers reserve the right to modify these Terms at any time. Your continued use of the Service after such modifications constitutes your acceptance of the updated Terms.
            </p>
          </section>

          <section style={s.card}>
            <h2 style={s.h2}>2. License</h2>
            <p style={s.p}>
              PromptQuill is open source software released under the MIT License. You are free to use, modify, and distribute the software in accordance with the terms of that license.
            </p>
            <p style={s.p}>
              The MIT License grants you permission to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the software, subject to the conditions that the copyright notice and permission notice are included in all copies or substantial portions of the software.
            </p>
            <p style={{ ...s.p, fontWeight: 'bold', color: '#888' }}>When using this instance, you agree not to:</p>
            <ul style={s.ul}>
              <li style={s.li}><span style={s.dot}>•</span> Upload malware, viruses, or any harmful code</li>
              <li style={s.li}><span style={s.dot}>•</span> Use the Service to generate illegal or inappropriate content</li>
              <li style={s.li}><span style={s.dot}>•</span> Attempt to gain unauthorized access to the underlying system</li>
              <li style={s.li}><span style={s.dot}>•</span> Impose an unreasonable load on the server infrastructure</li>
            </ul>
          </section>

          <section style={s.card}>
            <h2 style={s.h2}>3. User Accounts & Responsibilities</h2>
            <p style={s.p}>
              When you create an account with PromptQuill, you agree to:
            </p>
            <ul style={s.ul}>
              <li style={s.li}><span style={s.dot}>•</span> Provide accurate, complete, and current information</li>
              <li style={s.li}><span style={s.dot}>•</span> Maintain the confidentiality of your password and account</li>
              <li style={s.li}><span style={s.dot}>•</span> Accept responsibility for all activities under your account</li>
              <li style={s.li}><span style={s.dot}>•</span> Notify the instance administrator immediately of any unauthorized use</li>
            </ul>
          </section>

          <section style={s.card}>
            <h2 style={s.h2}>4. Intellectual Property Rights</h2>
            <p style={s.p}>
              <strong style={{ color: '#a3e635' }}>Software:</strong> The PromptQuill software is licensed under the MIT License. See the LICENSE file in the source repository for details.
            </p>
            <p style={s.p}>
              <strong style={{ color: '#a3e635' }}>Your Content:</strong> You retain full ownership of all prompts and content you create. The project maintainers claim no ownership over your content.
            </p>
            <p style={s.p}>
              <strong style={{ color: '#a3e635' }}>Generated Outputs:</strong> AI-generated outputs are provided as-is. You are responsible for verifying accuracy and ensuring compliance with applicable laws and third-party rights.
            </p>
          </section>

          <section style={s.card}>
            <h2 style={s.h2}>5. Disclaimer of Warranties</h2>
            <p style={s.p}>
              THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NONINFRINGEMENT.
            </p>
            <ul style={s.ul}>
              <li style={s.li}><span style={s.dot}>•</span> Accuracy, completeness, or reliability of content</li>
              <li style={s.li}><span style={s.dot}>•</span> Uninterrupted or error-free operation of the Service</li>
              <li style={s.li}><span style={s.dot}>•</span> Quality of any products, services, or information</li>
              <li style={s.li}><span style={s.dot}>•</span> AI outputs being suitable for your purpose</li>
            </ul>
            <p style={s.pSmall}>
              No warranty is given that the Service will meet your requirements, be uninterrupted, timely, secure, or error-free.
            </p>
          </section>

          <section style={s.card}>
            <h2 style={s.h2}>6. Limitation of Liability</h2>
            <p style={s.p}>
              IN NO EVENT SHALL THE PROJECT MAINTAINERS BE LIABLE FOR ANY CLAIM, DAMAGES, OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT, OR OTHERWISE, ARISING FROM, OUT OF, OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
            </p>
            <p style={s.pSmall}>
              This limitation of liability applies to the fullest extent permitted by applicable law.
            </p>
          </section>

          <section style={s.card}>
            <h2 style={s.h2}>7. Prohibited Activities</h2>
            <p style={s.p}>You agree not to engage in any of the following prohibited activities:</p>
            <ul style={s.ul}>
              <li style={s.li}><span style={s.dot}>•</span> Violating any applicable laws, regulations, or third-party rights</li>
              <li style={s.li}><span style={s.dot}>•</span> Harassing, threatening, or defaming any person or entity</li>
              <li style={s.li}><span style={s.dot}>•</span> Creating, distributing, or promoting illegal content</li>
              <li style={s.li}><span style={s.dot}>•</span> Attempting to gain unauthorized access to the Service or other users' accounts</li>
              <li style={s.li}><span style={s.dot}>•</span> Interfering with the proper functioning of the Service</li>
              <li style={s.li}><span style={s.dot}>•</span> Collecting or tracking personal information of others without consent</li>
              <li style={s.li}><span style={s.dot}>•</span> Violating our Acceptable Use Policy</li>
            </ul>
            <p style={s.pSmall}>
              Violation of these prohibitions may result in immediate suspension or termination of your account.
            </p>
          </section>

          <section style={s.card}>
            <h2 style={s.h2}>8. Privacy</h2>
            <p style={s.p}>
              This is a self-hosted instance. Your data is stored on the server where this instance is deployed. The project maintainers do not have access to your data. For information about how your data is handled, please refer to the Privacy Policy of this instance or contact the instance administrator.
            </p>
            <p style={s.p}>
              If you are self-hosting PromptQuill, you are responsible for complying with applicable data protection laws in your jurisdiction.
            </p>
          </section>

          <section style={s.card}>
            <h2 style={s.h2}>9. Termination</h2>
            <p style={s.p}>
              The instance administrator may terminate or suspend your access to the Service at any time, without prior notice, if you:
            </p>
            <ul style={s.ul}>
              <li style={s.li}><span style={s.dot}>•</span> Violate these Terms of Service</li>
              <li style={s.li}><span style={s.dot}>•</span> Engage in fraudulent or illegal activity</li>
              <li style={s.li}><span style={s.dot}>•</span> Threaten, harass, or violate the rights of others</li>
              <li style={s.li}><span style={s.dot}>•</span> Abuse the Service or its infrastructure</li>
            </ul>
            <p style={s.p}>
              Upon termination, your right to use the Service ceases immediately, and your account data may be deleted by the instance administrator.
            </p>
          </section>

          <section style={s.card}>
            <h2 style={s.h2}>10. Governing Law</h2>
            <p style={s.p}>
              These Terms shall be governed by the laws applicable in the jurisdiction where the instance is hosted. If you are self-hosting, you are responsible for ensuring compliance with your local laws.
            </p>
          </section>

          <section style={s.card}>
            <h2 style={s.h2}>11. Contact</h2>
            <p style={s.p}>
              For questions about these Terms of Service, please contact the administrator of this instance. If you are the instance administrator, refer to the project repository at <a href="https://github.com/yourusername/promptquill" style={s.link}>github.com/yourusername/promptquill</a> for support.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
