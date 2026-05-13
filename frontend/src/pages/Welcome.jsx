import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const styleId = 'pq-welcome-v2-styles';

function injectKeyframes() {
  if (document.getElementById(styleId)) return;
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    @keyframes pq-float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-14px); }
    }
    @keyframes pq-mesh-a {
      0%, 100% { transform: translate(0, 0) rotate(0deg); }
      33% { transform: translate(60px, -80px) rotate(120deg); }
      66% { transform: translate(-40px, -40px) rotate(240deg); }
    }
    @keyframes pq-mesh-b {
      0%, 100% { transform: translate(0, 0) rotate(0deg); }
      33% { transform: translate(-70px, -50px) rotate(120deg); }
      66% { transform: translate(50px, -80px) rotate(240deg); }
    }
    @keyframes pq-mesh-c {
      0%, 100% { transform: translate(0, 0) rotate(0deg); }
      33% { transform: translate(30px, -90px) rotate(120deg); }
      66% { transform: translate(-60px, -30px) rotate(240deg); }
    }
  `;
  document.head.appendChild(style);
}

export default function Welcome() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [subVisible, setSubVisible] = useState(false);
  const [btnsVisible, setBtnsVisible] = useState(false);
  const [tagVisible, setTagVisible] = useState(false);

  useEffect(() => {
    injectKeyframes();
    const t1 = setTimeout(() => setVisible(true), 300);
    const t2 = setTimeout(() => setSubVisible(true), 700);
    const t3 = setTimeout(() => setBtnsVisible(true), 1100);
    const t4 = setTimeout(() => setTagVisible(true), 1500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#000',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden', fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      {/* Animated gradient mesh */}
      <div style={{
        position: 'absolute', width: '600px', height: '600px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(163, 230, 53, 0.15), transparent 70%)',
        top: '5%', left: '0%', filter: 'blur(90px)',
        animation: 'pq-mesh-a 25s ease-in-out infinite',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.12), transparent 70%)',
        bottom: '10%', right: '5%', filter: 'blur(90px)',
        animation: 'pq-mesh-b 22s ease-in-out infinite reverse',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1), transparent 70%)',
        top: '45%', right: '20%', filter: 'blur(80px)',
        animation: 'pq-mesh-c 20s ease-in-out infinite',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', width: '350px', height: '350px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(163, 230, 53, 0.08), transparent 70%)',
        bottom: '25%', left: '15%', filter: 'blur(70px)',
        animation: 'pq-mesh-b 28s ease-in-out infinite 5s',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', width: '300px', height: '300px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.06), transparent 70%)',
        top: '20%', right: '35%', filter: 'blur(60px)',
        animation: 'pq-mesh-a 30s ease-in-out infinite 10s',
        pointerEvents: 'none',
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 24px' }}>
        <h1 style={{
          fontSize: 'clamp(48px, 10vw, 96px)', fontWeight: 800, letterSpacing: '-0.04em',
          color: '#fff', margin: 0, lineHeight: 1.1,
          textShadow: '0 0 40px rgba(163, 230, 53, 0.3), 0 0 80px rgba(163, 230, 53, 0.1), 0 0 120px rgba(163, 230, 53, 0.05)',
          animation: visible ? 'pq-float 4s ease-in-out infinite' : 'none',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.96)',
          transition: 'opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
          Prompt<span style={{ color: '#a3e635' }}>Quill</span>
        </h1>

        <p style={{
          fontSize: 'clamp(16px, 2.5vw, 22px)', color: '#888',
          marginTop: 16, marginBottom: 48, fontWeight: 400,
          opacity: subVisible ? 1 : 0,
          transform: subVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          transitionDelay: '0.1s',
        }}>
          Turn any idea into a complete strategic brief in seconds
        </p>

        <div style={{
          display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap',
          opacity: btnsVisible ? 1 : 0,
          transform: btnsVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          transitionDelay: '0.2s',
        }}>
          <button onClick={() => navigate('/setup')} style={{
            padding: '14px 32px', borderRadius: 12, border: 'none',
            background: '#a3e635', color: '#000', fontSize: 16, fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.target.style.background = '#bef264'; e.target.style.transform = 'scale(1.02)'; }}
            onMouseLeave={e => { e.target.style.background = '#a3e635'; e.target.style.transform = 'scale(1)'; }}
          >
            Get Started →
          </button>

          <button onClick={() => navigate('/ai')} style={{
            padding: '14px 32px', borderRadius: 12, border: '1px solid #333',
            background: 'transparent', color: '#fff', fontSize: 16, fontWeight: 500,
            cursor: 'pointer', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.target.style.borderColor = '#555'; e.target.style.background = 'rgba(255,255,255,0.04)'; }}
            onMouseLeave={e => { e.target.style.borderColor = '#333'; e.target.style.background = 'transparent'; }}
          >
            Dashboard
          </button>
        </div>
      </div>

      {/* Bottom tag */}
      <div style={{
        position: 'absolute', bottom: 40, left: 0, right: 0, textAlign: 'center',
        opacity: tagVisible ? 1 : 0,
        transform: tagVisible ? 'translateY(0)' : 'translateY(16px)',
        transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        transitionDelay: '0.3s',
      }}>
        <span style={{ color: '#555', fontSize: 14, letterSpacing: '0.02em' }}>
          Free forever. Open source. Self-hosted.
        </span>
      </div>
    </div>
  );
}
