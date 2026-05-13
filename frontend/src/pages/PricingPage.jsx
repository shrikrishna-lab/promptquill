import React, { useState } from 'react';
import { Check, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';

const PricingPage = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    { q: 'Is PromptQuill really free?', a: 'Yes! PromptQuill is open source software. You can self-host it for free. You only pay for AI API keys (e.g., Groq offers 14,400 requests/day free).' },
    { q: 'How do I get started?', a: 'Clone the repo, set up your own Supabase project, add your AI API keys (one is enough), and you\'re good to go.' },
    { q: 'What do I need to host my own instance?', a: 'A Supabase project (free tier works), at least one AI API key (Groq is free), and a Node.js environment. The full setup takes 5 minutes.' },
    { q: 'What are the daily limits?', a: 'Limits depend on your AI provider. Groq gives 14,400 requests/day free. You can add multiple providers for higher limits.' },
    { q: 'Do I need to pay for anything?', a: 'No. PromptQuill is MIT licensed and free forever. You only pay if you use paid AI providers or paid infrastructure.' },
  ];

  return (
    <>
      <SEO
        title="PromptQuill — Free & Open Source"
        description="PromptQuill is free open source software. Self-host your own instance. Connect your own AI providers. MIT license."
      />
      <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1a1a1a' }}>
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666', fontSize: '14px', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 12px', borderRadius: 8, transition: '0.2s' }}
          onMouseEnter={e => { e.target.style.color = '#fff'; e.target.style.background = 'rgba(255,255,255,0.05)'; }}
          onMouseLeave={e => { e.target.style.color = '#666'; e.target.style.background = 'none'; }}
        >
          <ArrowLeft size={18} /> Back
        </button>
        <h1 style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '-1px', margin: 0 }}>Prompt<span style={{ color: '#a3e635' }}>Quill</span></h1>
        <div style={{ width: '80px' }} />
      </div>

      <div style={{ textAlign: 'center', padding: '100px 24px 50px' }}>
        <h2 style={{ fontSize: '52px', fontWeight: '900', letterSpacing: '-2.5px', marginBottom: '16px', lineHeight: 1.1 }}>Free &amp; <span style={{ color: '#a3e635', position: 'relative' }}>Open Source</span></h2>
        <p style={{ color: '#666', fontSize: '18px', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>PromptQuill is MIT licensed. Self-host your own instance. Your data, your keys, your infrastructure.</p>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{
          padding: '1px',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, #a3e635, #4ade80, #22d3ee)',
        }}>
          <div style={{
            padding: '40px',
            backgroundColor: '#0d0d0d',
            borderRadius: '23px',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#a3e635', marginBottom: '8px', letterSpacing: '-0.5px' }}>Self-Hosted</h3>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '16px' }}>
              <span style={{ fontSize: '44px', fontWeight: '900', letterSpacing: '-2px' }}>$0</span>
              <span style={{ fontSize: '14px', color: '#555' }}>/forever</span>
            </div>
            <p style={{ fontSize: '14px', color: '#555', marginBottom: '32px' }}>Open source. MIT license.</p>
            <a
              href="https://github.com/shrikrishna-lab/promptquill"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                width: '100%', padding: '16px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #a3e635, #84cc16)',
                border: 'none', color: '#000', fontSize: '15px', fontWeight: '800',
                cursor: 'pointer', textAlign: 'center', textDecoration: 'none',
                marginBottom: '28px', letterSpacing: '0.3px',
                boxShadow: '0 0 30px rgba(163,230,53,0.2)',
                boxSizing: 'border-box',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 0 40px rgba(163,230,53,0.4)'; }}
              onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 0 30px rgba(163,230,53,0.2)'; }}
            >
              View on GitHub →
            </a>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(163,230,53,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={12} color="#a3e635" strokeWidth={3} />
                </div>
                <span style={{ color: '#ccc' }}>Unlimited generations</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(163,230,53,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={12} color="#a3e635" strokeWidth={3} />
                </div>
                <span style={{ color: '#ccc' }}>Your own Supabase database</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(163,230,53,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={12} color="#a3e635" strokeWidth={3} />
                </div>
                <span style={{ color: '#ccc' }}>Your own AI API keys</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(163,230,53,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={12} color="#a3e635" strokeWidth={3} />
                </div>
                <span style={{ color: '#ccc' }}>All 15 tabs per brief</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(163,230,53,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={12} color="#a3e635" strokeWidth={3} />
                </div>
                <span style={{ color: '#ccc' }}>All 6 AI modes</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(163,230,53,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={12} color="#a3e635" strokeWidth={3} />
                </div>
                <span style={{ color: '#ccc' }}>All 2 personalities</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(163,230,53,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={12} color="#a3e635" strokeWidth={3} />
                </div>
                <span style={{ color: '#ccc' }}>Community feed</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(163,230,53,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={12} color="#a3e635" strokeWidth={3} />
                </div>
                <span style={{ color: '#ccc' }}>No telemetry. No phone-home.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 24px 100px' }}>
        <h3 style={{ fontSize: '26px', fontWeight: '900', marginBottom: '40px', textAlign: 'center', letterSpacing: '-1px' }}>Frequently Asked</h3>
        {faqs.map((faq, i) => (
          <div key={i} onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{
            padding: '24px 0',
            borderBottom: '1px solid #1a1a1a',
            cursor: 'pointer',
            transition: '0.2s',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
              <span style={{ fontSize: '15px', fontWeight: '700', color: '#fff', transition: '0.2s' }}>{faq.q}</span>
              <span style={{
                color: '#555', fontSize: '18px', fontWeight: 300,
                transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0deg)',
                display: 'inline-block',
                transition: 'transform 0.3s ease',
                minWidth: 20,
                textAlign: 'center',
              }}>+</span>
            </div>
            <div style={{
              maxHeight: openFaq === i ? '300px' : '0',
              overflow: 'hidden',
              transition: 'max-height 0.35s ease, opacity 0.35s ease, margin 0.35s ease',
              opacity: openFaq === i ? 1 : 0,
              marginTop: openFaq === i ? '12px' : '0',
            }}>
              <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.7', margin: 0 }}>{faq.a}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
    </>
  );
};

export default PricingPage;
