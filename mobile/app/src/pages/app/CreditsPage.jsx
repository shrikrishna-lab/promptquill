import React, { useEffect, useState } from 'react';
import { Coins, Crown, Receipt, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { getCredits } from '../../lib/credits.js';
import { checkProStatus, startCreditTopup, startProSubscription } from '../../lib/pro.js';

const cardStyle = {
  background: 'rgba(18, 18, 28, 0.94)',
  border: '1px solid rgba(255, 255, 255, 0.07)',
  borderRadius: '22px',
  padding: '18px'
};

const creditPackages = [
  { key: 'CREDITS_49', price: '₹49', credits: 50 },
  { key: 'CREDITS_99', price: '₹99', credits: 120 },
  { key: 'CREDITS_249', price: '₹249', credits: 350 }
];

function CreditsPage({ profile, session }) {
  const [credits, setCredits] = useState({ balance: 0 });
  const [isPro, setIsPro] = useState(Boolean(profile?.is_pro));
  const [loadingKey, setLoadingKey] = useState('');

  const refreshCredits = async () => {
    if (!session?.user?.id) return;

    const [creditSnapshot, proStatus] = await Promise.all([
      getCredits(session.user.id),
      checkProStatus(session.user.id)
    ]);

    setCredits(creditSnapshot || { balance: 0 });
    setIsPro(proStatus);
  };

  useEffect(() => {
    refreshCredits().catch((error) => {
      console.error('Failed to refresh credits page:', error);
    });

    const handleCreditsChanged = () => {
      refreshCredits().catch(() => {});
    };

    window.addEventListener('creditsUpdated', handleCreditsChanged);
    return () => {
      window.removeEventListener('creditsUpdated', handleCreditsChanged);
    };
  }, [session?.user?.id]);

  const handleTopUp = async (packageKey) => {
    setLoadingKey(packageKey);

    await startCreditTopup(
      packageKey,
      session.user.id,
      session.user.email,
      profile?.display_name || 'PromptQuill User',
      async () => {
        toast.success('Credits purchase completed.');
        await refreshCredits();
        setLoadingKey('');
      },
      (error) => {
        toast.error(error?.message || 'Credits purchase failed.');
        setLoadingKey('');
      }
    );
  };

  const handleUpgrade = async (plan) => {
    const actionKey = `pro:${plan}`;
    setLoadingKey(actionKey);

    await startProSubscription(
      plan,
      session.user.id,
      session.user.email,
      profile?.display_name || 'PromptQuill User',
      async () => {
        toast.success('Pro unlocked inside the app.');
        await refreshCredits();
        setLoadingKey('');
      },
      (error) => {
        toast.error(error?.message || 'Unable to upgrade right now.');
        setLoadingKey('');
      }
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <section style={{ ...cardStyle, display: 'grid', gridTemplateColumns: '1fr auto', gap: '14px' }}>
        <div>
          <div style={{ color: '#a1a1aa', fontSize: '13px', marginBottom: '6px' }}>Current balance</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '14px',
                background: 'rgba(163, 230, 53, 0.14)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Coins size={18} color="#d9f99d" />
            </div>
            <div>
              <div style={{ fontSize: '26px', fontWeight: 900 }}>{credits.balance ?? 0}</div>
              <div style={{ color: '#a1a1aa', fontSize: '13px' }}>
                {isPro ? 'Pro with native billing' : 'Free plan with top-ups'}
              </div>
            </div>
          </div>
        </div>
        <div
          style={{
            alignSelf: 'start',
            padding: '10px 12px',
            borderRadius: '14px',
            background: isPro ? 'rgba(109, 40, 217, 0.16)' : 'rgba(255, 255, 255, 0.06)',
            color: isPro ? '#e9d5ff' : '#e4e4e7',
            fontWeight: 800,
            fontSize: '12px'
          }}
        >
          {isPro ? 'Pro active' : 'Top up any time'}
        </div>
      </section>

      {!isPro ? (
        <section style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Crown size={18} color="#d9f99d" />
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 900 }}>Upgrade to Pro</h2>
          </div>
          <p style={{ margin: '0 0 16px', color: '#a1a1aa', fontSize: '14px', lineHeight: 1.6 }}>
            Native subscriptions stay inside the app and remove the free-plan friction.
          </p>
          <div style={{ display: 'grid', gap: '12px' }}>
            <button
              type="button"
              onClick={() => handleUpgrade('monthly')}
              disabled={loadingKey === 'pro:monthly'}
              style={{
                minHeight: '52px',
                borderRadius: '18px',
                border: 'none',
                background: '#a3e635',
                color: '#05070d',
                fontWeight: 900,
                fontSize: '15px',
                cursor: loadingKey === 'pro:monthly' ? 'not-allowed' : 'pointer'
              }}
            >
              {loadingKey === 'pro:monthly' ? 'Opening Monthly Plan...' : 'Monthly Pro - ₹499'}
            </button>
            <button
              type="button"
              onClick={() => handleUpgrade('yearly')}
              disabled={loadingKey === 'pro:yearly'}
              style={{
                minHeight: '52px',
                borderRadius: '18px',
                border: '1px solid rgba(163, 230, 53, 0.18)',
                background: 'rgba(163, 230, 53, 0.08)',
                color: '#d9f99d',
                fontWeight: 900,
                fontSize: '15px',
                cursor: loadingKey === 'pro:yearly' ? 'not-allowed' : 'pointer'
              }}
            >
              {loadingKey === 'pro:yearly' ? 'Opening Yearly Plan...' : 'Yearly Pro - ₹4,199'}
            </button>
          </div>
        </section>
      ) : null}

      <section style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <Receipt size={18} color="#d9f99d" />
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 900 }}>Credit packs</h2>
        </div>
        <div style={{ display: 'grid', gap: '12px' }}>
          {creditPackages.map((creditPackage) => (
            <article
              key={creditPackage.key}
              style={{
                borderRadius: '18px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                background: '#11131a',
                padding: '16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '17px', fontWeight: 800 }}>{creditPackage.credits} credits</div>
                  <div style={{ color: '#a1a1aa', fontSize: '13px', marginTop: '4px' }}>
                    Instant top-up without leaving the app
                  </div>
                </div>
                <div
                  style={{
                    padding: '8px 10px',
                    borderRadius: '12px',
                    background: 'rgba(163, 230, 53, 0.12)',
                    color: '#d9f99d',
                    fontWeight: 900,
                    fontSize: '14px'
                  }}
                >
                  {creditPackage.price}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleTopUp(creditPackage.key)}
                disabled={loadingKey === creditPackage.key}
                style={{
                  marginTop: '14px',
                  width: '100%',
                  minHeight: '46px',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  background: '#161922',
                  color: '#f8fafc',
                  fontWeight: 800,
                  fontSize: '14px',
                  cursor: loadingKey === creditPackage.key ? 'not-allowed' : 'pointer'
                }}
              >
                {loadingKey === creditPackage.key ? 'Opening Purchase...' : 'Buy This Pack'}
              </button>
            </article>
          ))}
        </div>
      </section>

      <section style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Sparkles size={18} color="#d9f99d" />
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 900 }}>Native purchase flow</h2>
        </div>
        <p style={{ margin: 0, color: '#a1a1aa', fontSize: '14px', lineHeight: 1.6 }}>
          Purchases stay inside PromptQuill. Android uses Google Play Billing and iPhone uses
          StoreKit through the mobile payment layer.
        </p>
      </section>
    </div>
  );
}

export default CreditsPage;
