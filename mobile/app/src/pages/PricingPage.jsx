import React, { useState } from 'react';
import { Check, X, Zap, ArrowLeft, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import { startProSubscription } from '../lib/pro';
import PricingTierCard from '../components/PricingTierCard';
import { PRICING_TIERS } from '../config/pricingTiers';
import toast from 'react-hot-toast';

const PricingPage = ({ session }) => {
  const navigate = useNavigate();
  const [billing, setBilling] = useState('monthly');
  const [processing, setProcessing] = useState(false);


  const faqs = [
    { q: 'Which plan should I choose?', a: 'Start with Starter (₹49) to test the platform. Growth (₹99) is perfect for regular builders. Professional (₹249) includes all premium features. Premium (₹499/month) is best for unlimited generation. Annual Pro (₹4,199) saves 28% if you\'re committed.' },
    { q: 'Can I upgrade anytime?', a: 'Yes! You can upgrade to any plan instantly. The new plan will be activated immediately after payment.' },
    { q: 'What payment methods are accepted?', a: 'UPI, Cards (Visa/Mastercard/Amex), NetBanking, and Wallets (Paytm, PhonePe, etc.).' },
    { q: 'How do generation credits work?', a: 'Each mode uses a certain number of credits (e.g., STARTUP uses 25 credits, STARTUP_LITE uses 10 credits). Purchase once, use until exhausted. Premium plans offer unlimited generations.' },
    { q: 'What if I run out of credits?', a: 'You\'ll see the upgrade modal. Simply purchase another credit package to continue.' },
    { q: 'Is there a refund policy?', a: 'All sales are final. However, if you face any issues, contact support@yourdomain.com within 24 hours.' },
  ];

  const [openFaq, setOpenFaq] = useState(null);

  return (
    <>
      <SEO
        title="Pricing — PromptQuill | Free to $9/month | No Credit Card Required"
        description="PromptQuill pricing plans: Free forever (10 daily generations), Professional (₹249), Premium (₹499/month). Unlimited generations, priority AI routing, PDF export, Reddit Validator."
      />
      <div style={{ minHeight: '100vh', backgroundColor: '#080808', color: '#fff' }}>
      {/* Nav */}
      <div style={{ padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#888', fontSize: '14px', fontWeight: '600' }}>
          <ArrowLeft size={18} /> Back
        </button>
        <h1 style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '-1px' }}>Prompt<span style={{ color: '#a3e635' }}>OS</span></h1>
        <div style={{ width: '80px' }} />
      </div>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '80px 24px 40px' }}>
        <h2 style={{ fontSize: '48px', fontWeight: '900', letterSpacing: '-2px', marginBottom: '16px' }}>Simple, <span style={{ color: '#a3e635' }}>Transparent</span> Pricing</h2>
        <p style={{ color: '#888', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>Choose the plan that fits your needs. All plans include secure payment processing and instant activation.</p>
      </div>

      {/* Pricing Tiers Grid */}
      <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '24px',
          gridAutoRows: 'max-content'
        }}>
          {/* Free Tier */}
          <div style={{ 
            padding: '40px', 
            backgroundColor: '#0d0d0d',
            border: '1px solid #1a1a1a',
            borderRadius: '24px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#888', marginBottom: '8px' }}>Basic</h3>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '16px' }}>
              <span style={{ fontSize: '40px', fontWeight: '900' }}>₹0</span>
              <span style={{ fontSize: '14px', color: '#555' }}>/forever</span>
            </div>
            <p style={{ fontSize: '14px', color: '#555', marginBottom: '32px' }}>Get started for free</p>
            <button 
              onClick={() => navigate('/ai')} 
              style={{ 
                width: '100%', 
                padding: '14px', 
                borderRadius: '12px', 
                backgroundColor: '#111', 
                border: '1px solid #222', 
                color: '#fff', 
                fontSize: '14px', 
                fontWeight: '700', 
                cursor: 'pointer',
                marginBottom: '24px'
              }}
            >
              Current Plan
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                <Check size={14} color="#555" />
                <span style={{ color: '#888' }}>10 generations/day</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                <Check size={14} color="#555" />
                <span style={{ color: '#888' }}>Basic AI modes</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                <Check size={14} color="#555" />
                <span style={{ color: '#888' }}>View-only community</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                <X size={14} color="#333" />
                <span style={{ color: '#333' }}>Premium features</span>
              </div>
            </div>
          </div>

          {/* Paid Tiers */}
          {PRICING_TIERS.filter(t => ['starter', 'growth', 'professional', 'premium', 'annual'].includes(t.id)).map((tier) => (
            <PricingTierCard key={tier.id} tier={tier} session={session} profile={session?.user || {}} />
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 24px 100px' }}>
        <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '32px', textAlign: 'center' }}>Frequently Asked</h3>
        {faqs.map((faq, i) => (
          <div key={i} onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ padding: '20px 0', borderBottom: '1px solid #1a1a1a', cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '15px', fontWeight: '700', color: '#fff' }}>{faq.q}</span>
              <span style={{ color: '#555', fontSize: '18px' }}>{openFaq === i ? '−' : '+'}</span>
            </div>
            {openFaq === i && <p style={{ color: '#888', fontSize: '14px', marginTop: '12px', lineHeight: '1.6' }}>{faq.a}</p>}
          </div>
        ))}
      </div>
    </div>
    </>
  );
};

export default PricingPage;
