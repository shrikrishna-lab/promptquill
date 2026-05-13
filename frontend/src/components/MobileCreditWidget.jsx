import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const MobileCreditWidget = ({ credits, isPro }) => {
  const navigate = useNavigate();
  if (isPro) return null; // Pros don't need recharging
  
  const balance = credits?.balance || 0;
  const percentage = Math.min(100, Math.max(0, balance)); // Base 100

  return (
    <div 
      className="mobile-only animate-fade-in" 
      onClick={() => navigate('/pricing?tab=credits')}
      style={{ 
        width: '100%',
        marginTop: '16px',
        marginBottom: '8px',
        background: '#0a0a0a', 
        borderRadius: '24px', 
        padding: '16px 20px', 
        border: '1px solid rgba(255,255,255,0.05)', 
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer'
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color: '#fff', marginBottom: '12px' }}>
          <span style={{ color: '#fbbf24' }}>⚡</span> Recharge
        </div>
        
        <div style={{ width: '80%', height: '14px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', position: 'relative', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            bottom: 0, 
            width: `${percentage}%`, 
            background: 'linear-gradient(90deg, #ea580c, #ef4444)', 
            borderRadius: '99px',
            boxShadow: '0 0 10px rgba(239, 68, 68, 0.4)',
            transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
          }}></div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '80%', fontSize: '10px', color: '#555', marginTop: '6px', fontWeight: '600' }}>
          <span>0</span>
          <span>50</span>
          <span>100</span>
        </div>
      </div>

      <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.08)', margin: '0 20px' }}></div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '20px', fontWeight: '800', color: '#a3e635', lineHeight: 1 }}>{balance}</span>
          <span style={{ fontSize: '11px', color: '#666', fontWeight: '600', marginTop: '2px' }}>Credits</span>
        </div>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(163, 230, 53, 0.1)', border: '1px solid rgba(163, 230, 53, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a3e635' }}>
          <ChevronRight size={16} strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );
};

export default MobileCreditWidget;
