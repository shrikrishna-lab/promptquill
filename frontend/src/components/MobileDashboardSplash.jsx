import React from 'react';
import { Play } from 'lucide-react';

const MobileDashboardSplash = ({ profile, sessions, setSuggestionInput, username, credits }) => {
  const recentSession = sessions && sessions.length > 0 ? sessions[0] : null;

  return (
    <div className="mobile-only-input animate-fade-in" style={{ 
      flex: 1, 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      width: '100%', 
      position: 'relative',
      paddingTop: '20px',
      overflow: 'hidden',
      background: 'radial-gradient(circle at 50% 0%, rgba(109,40,217,0.15) 0%, transparent 60%)'
    }}>
      
      {/* Background Glows */}
      <div style={{ position: 'absolute', top: '5%', left: '-20%', width: '250px', height: '250px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(163,230,53,0.12) 0%, transparent 70%)', filter: 'blur(40px)', zIndex: 0 }} />
      <div style={{ position: 'absolute', top: '35%', right: '-25%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(219,39,119,0.12) 0%, transparent 70%)', filter: 'blur(50px)', zIndex: 0 }} />

      {/* Top Profile Section */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10, width: '100%' }}>
        <div style={{ 
          width: '56px', height: '56px', borderRadius: '50%', 
          background: 'linear-gradient(135deg, #a3e635, #6d28d9)', 
          padding: '2px',
          marginBottom: '16px',
          boxShadow: '0 8px 24px rgba(163,230,53,0.25)'
        }}>
          <div style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '800', color: '#fff' }}>
            {username.charAt(0).toUpperCase()}
          </div>
        </div>
        
        <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#fff', margin: 0, letterSpacing: '-0.5px' }}>
          Hello, {username}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', fontWeight: '500', marginTop: '6px' }}>
          Let's start your creative session
        </p>
      </div>

      {/* Floating Cards Container */}
      <div style={{ position: 'relative', width: '100%', maxWidth: '360px', height: '320px', marginTop: '40px', zIndex: 10 }}>
        
        {/* Card 1: Action Required / Smart Expander (Tilted left) */}
        <div 
          onClick={() => setSuggestionInput('Help me brainstorm a new startup idea')}
          className="hover-glow"
          style={{
            position: 'absolute',
            top: '40px',
            left: '10px',
            width: '170px',
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '24px',
            padding: '20px',
            transform: 'rotate(-5deg)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.5)',
            zIndex: 3,
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            <span style={{ color: '#ef4444', fontSize: '14px' }}>▲</span>
            <span style={{ color: '#444', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Action required</span>
          </div>
          <h3 style={{ color: '#000', fontSize: '20px', fontWeight: '900', margin: '0 0 10px 0', lineHeight: '1.1', letterSpacing: '-0.5px' }}>Idea<br/>Expander</h3>
          <p style={{ color: '#666', fontSize: '11px', margin: 0, lineHeight: '1.5', fontWeight: '500' }}>
            Verify your parameters with our AI scanner for personalized recommendations.
          </p>
          <div style={{ position: 'absolute', right: '-12px', top: '50%', transform: 'translateY(-50%)', width: '36px', height: '36px', borderRadius: '50%', background: 'radial-gradient(circle at 30% 30%, #f97316 0%, #ea580c 100%)', boxShadow: '0 6px 16px rgba(249, 115, 22, 0.5)', border: '2px solid #fff' }}></div>
        </div>

        {/* Card 2: Upcoming / Pro feature (Tilted right, back) */}
        <div 
          style={{
            position: 'absolute',
            top: '0px',
            right: '20px',
            width: '150px',
            background: 'rgba(124, 58, 237, 0.3)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderRadius: '24px',
            padding: '16px',
            transform: 'rotate(8deg)',
            border: '1px solid rgba(255,255,255,0.1)',
            zIndex: 1
          }}
        >
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: '700', margin: '0 0 6px 0', letterSpacing: '0.5px' }}>Pro Feature</p>
          <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: '800', margin: '0 0 10px 0' }}>Deep Analysis</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
             <div style={{ width: '22px', height: '22px', borderRadius: '50%', overflow: 'hidden' }}>
               <img src="https://ui-avatars.com/api/?name=AI&background=a3e635&color=000" alt="AI" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
             </div>
             <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px', fontWeight: '600' }}>Unlocked</span>
          </div>
        </div>

        {/* Card 3: Recent Session (Tilted right, front) */}
        <div 
          onClick={() => recentSession && setSuggestionInput(recentSession.title)}
          className="hover-glow"
          style={{
            position: 'absolute',
            top: '140px',
            right: '10px',
            width: '180px',
            background: 'linear-gradient(135deg, rgba(219, 39, 119, 0.85), rgba(109, 40, 217, 0.85))',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderRadius: '28px',
            padding: '20px',
            transform: 'rotate(4deg)',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
            zIndex: 4,
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', fontWeight: '700', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Continue work</p>
          
          <div style={{ width: '100%', height: '70px', borderRadius: '16px', background: 'rgba(0,0,0,0.25)', marginBottom: '16px', position: 'relative', overflow: 'hidden' }}>
            {/* Inner colorful abstract shape */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '90%', height: '50px', borderRadius: '50px', background: 'linear-gradient(90deg, #a3e635, #f97316, #db2777)', filter: 'blur(10px)', opacity: 0.9 }}></div>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80%', height: '24px', borderRadius: '20px', background: 'rgba(255,255,255,0.95)', boxShadow: '0 0 16px rgba(255,255,255,0.6)' }}></div>
          </div>

          <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: '900', margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.3px' }}>
            {recentSession ? recentSession.title : 'Creative Writing'}
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', margin: 0, fontWeight: '500' }}>
            {recentSession ? 'Resume session' : 'Start new project'}
          </p>

          <div style={{ position: 'absolute', top: '16px', right: '16px', width: '28px', height: '28px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
            <Play fill="#000" size={12} color="#000" style={{ marginLeft: '2px' }} />
          </div>
        </div>

      </div>

    </div>
  );
};

export default MobileDashboardSplash;
