import React, { useMemo, useRef, useState } from 'react';
import { BookmarkCheck, ChevronRight, Palette, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { secureStore } from '../../lib/secureStorage.mobile';

const shellStyle = {
  minHeight: '100vh',
  background: 'radial-gradient(circle at top, rgba(109, 40, 217, 0.18), transparent 45%), #0a0a0f',
  color: '#f8fafc',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden'
};

const iconBoxStyle = {
  width: '88px',
  height: '88px',
  borderRadius: '28px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, rgba(163, 230, 53, 0.22), rgba(109, 40, 217, 0.26))',
  border: '1px solid rgba(163, 230, 53, 0.18)',
  boxShadow: '0 24px 50px rgba(0, 0, 0, 0.28)'
};

function OnboardingFlow() {
  const navigate = useNavigate();
  const [screenIndex, setScreenIndex] = useState(0);
  const touchStartX = useRef(null);

  const screens = useMemo(
    () => [
      {
        icon: <Sparkles size={42} color="#d9f99d" />,
        headline: 'AI Prompts That Actually Work',
        subtext: 'Generate perfect prompts for any AI tool in seconds'
      },
      {
        icon: <Palette size={42} color="#d9f99d" />,
        headline: 'For Writers, Designers & Builders',
        subtext: 'Tailored prompts for ChatGPT, Midjourney, Runway and more'
      },
      {
        icon: <BookmarkCheck size={42} color="#d9f99d" />,
        headline: 'Access Anywhere, Anytime',
        subtext: 'All your prompts synced across devices instantly'
      }
    ],
    []
  );

  const completeOnboarding = async () => {
    await secureStore.set('onboarding_complete', 'true');
    navigate('/login', { replace: true });
  };

  const goToScreen = (nextIndex) => {
    if (nextIndex < 0 || nextIndex >= screens.length) return;
    setScreenIndex(nextIndex);
  };

  const handleTouchStart = (event) => {
    touchStartX.current = event.changedTouches?.[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event) => {
    const endX = event.changedTouches?.[0]?.clientX ?? null;
    if (touchStartX.current == null || endX == null) return;

    const delta = touchStartX.current - endX;
    if (Math.abs(delta) < 40) return;

    if (delta > 0) {
      goToScreen(screenIndex + 1);
      return;
    }

    goToScreen(screenIndex - 1);
  };

  const isLastScreen = screenIndex === screens.length - 1;

  return (
    <div style={shellStyle}>
      <div
        style={{
          padding: '18px 22px 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '0.02em' }}>PromptQuill</div>
        {!isLastScreen ? (
          <button
            type="button"
            onClick={completeOnboarding}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#d9f99d',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Skip
          </button>
        ) : (
          <div style={{ width: '42px' }} />
        )}
      </div>

      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden',
          touchAction: 'pan-y'
        }}
      >
        <div
          style={{
            width: `${screens.length * 100}%`,
            display: 'flex',
            transform: `translateX(-${screenIndex * (100 / screens.length)}%)`,
            transition: 'transform 240ms ease'
          }}
        >
          {screens.map((screen) => (
            <section
              key={screen.headline}
              style={{
                width: `${100 / screens.length}%`,
                padding: '48px 24px 28px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center'
              }}
            >
              <div style={iconBoxStyle}>{screen.icon}</div>
              <h1
                style={{
                  margin: '28px 0 14px',
                  maxWidth: '320px',
                  fontSize: '32px',
                  lineHeight: 1.15,
                  fontWeight: 900
                }}
              >
                {screen.headline}
              </h1>
              <p
                style={{
                  margin: 0,
                  maxWidth: '320px',
                  color: '#a1a1aa',
                  fontSize: '16px',
                  lineHeight: 1.6
                }}
              >
                {screen.subtext}
              </p>
            </section>
          ))}
        </div>
      </div>

      <div
        style={{
          padding: '0 24px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          {screens.map((screen, index) => (
            <button
              key={screen.headline}
              type="button"
              onClick={() => goToScreen(index)}
              aria-label={`Go to onboarding screen ${index + 1}`}
              style={{
                width: index === screenIndex ? '28px' : '10px',
                height: '10px',
                borderRadius: '999px',
                border: 'none',
                background: index === screenIndex ? '#a3e635' : 'rgba(255, 255, 255, 0.16)',
                cursor: 'pointer',
                transition: 'all 180ms ease'
              }}
            />
          ))}
        </div>

        {isLastScreen ? (
          <button
            type="button"
            onClick={completeOnboarding}
            style={{
              width: '100%',
              minHeight: '56px',
              border: 'none',
              borderRadius: '18px',
              background: '#a3e635',
              color: '#080b11',
              fontSize: '16px',
              fontWeight: 900,
              cursor: 'pointer'
            }}
          >
            Get Started
          </button>
        ) : (
          <button
            type="button"
            onClick={() => goToScreen(screenIndex + 1)}
            style={{
              width: '100%',
              minHeight: '56px',
              border: '1px solid rgba(163, 230, 53, 0.18)',
              borderRadius: '18px',
              background: 'rgba(18, 18, 28, 0.92)',
              color: '#f8fafc',
              fontSize: '16px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            Continue
            <ChevronRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}

export default OnboardingFlow;
