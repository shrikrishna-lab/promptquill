import React from 'react';
import SEO from './SEO';

const BASE_URL = import.meta.env.VITE_APP_URL || 'https://promptquill.com';

export default function LandingPage({ meta, content, faqs }) {
  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      <SEO title={meta?.title || 'PromptQuill'} description={meta?.description || ''} />
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '60px 24px' }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: '#a3e635', marginBottom: 16 }}>{meta?.h1 || meta?.title}</h1>
        <div style={{ color: '#b0b0b0', lineHeight: 1.8, fontSize: 15 }}>
          {content?.split('\n').map((p, i) => <p key={i} style={{ marginBottom: 14 }}>{p}</p>)}
        </div>
        {faqs?.map((f, i) => (
          <div key={i} style={{ marginTop: 24, padding: 16, background: '#0d0d0d', borderRadius: 12, border: '1px solid #1a1a1a' }}>
            <strong style={{ color: '#a3e635' }}>{f.question}</strong>
            <p style={{ color: '#888', marginTop: 8, fontSize: 14 }}>{f.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
