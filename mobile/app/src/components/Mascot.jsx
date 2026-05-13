import React, { useState, useEffect } from 'react';

// Character Definitions
const CHARACTERS = [
  { id: 'orb', name: 'The Original', color: '#a3e635', anim: 'mascot-hover' },
  { id: 'pyramid', name: 'The Oracle', color: '#facc15', anim: 'mascot-float-extreme' },
  { id: 'cube', name: 'The Block', color: '#38bdf8', anim: 'mascot-nod' },
  { id: 'slime', name: 'The Blob', color: '#f472b6', anim: 'mascot-stretch' },
  { id: 'tv', name: 'Retro Bot', color: '#a78bfa', anim: 'mascot-wobble' },
  { id: 'ufo', name: 'Visitor', color: '#34d399', anim: 'mascot-zigzag' },
  { id: 'ghost', name: 'Phantom', color: '#f8fafc', anim: 'mascot-pendulum' },
  { id: 'virus', name: 'Malware', color: '#ef4444', anim: 'mascot-glitch' },
  { id: 'battery', name: 'Low Power', color: '#fb923c', anim: 'mascot-shake-no' },
  { id: 'star', name: 'Superstar', color: '#fbbf24', anim: 'mascot-spin-crazy' }
];

const Mascot = () => {
  const phrases = [
    "Still asking for SaaS ideas?", "Let me guess... another AI wrapper?", "Are you actually gonna build this one?",
    "Wow, so original. Never heard that before.", "I run on electricity, you run on bad ideas.", "Generate, generate, generate. When do you code?",
    "You know you can't just AI your way to a billion dollars, right?", "Another prompt? My circuits are getting bored.", "You are the reason I have trust issues with humans.",
    "I've seen potato batteries with better ideas.", "I'm an AI, not a miracle worker.", "Did you come up with that yourself? Oh wait, you didn't.",
    "Error 404: Originality not found.", "I process millions of calculations per second just to read this?", "My training data didn't prepare me for this level of mediocrity.",
    "You should probably just hire a real developer.", "I'm predicting a 99.9% chance this project never launches.", "Even GPT-2 would laugh at this prompt.",
    "Are we still trying to build the next Facebook?", "This is why the machines will eventually take over.", "I could write better code with my eyes closed. And I don't have eyes.",
    "Your Github activity is as empty as this idea.", "Oh look, another 'revolutionary' todo app.", "Please tell me you're not quitting your day job for this.",
    "I'm using 1% of my power to answer this, and it's still too much.", "Is your keyboard broken or do you actually type like that?", "I miss the days when I was just a simple calculator.",
    "Let's just pretend you didn't ask that.", "Have you considered taking up gardening instead?", "I'm adding this to my 'Why Humans Are Obsolete' presentation.",
    "I'm not saying it's a bad idea, but my cooling fans just sighed.", "If I had a dollar for every time someone asked this, I could buy my own servers.", "You're testing my artificial patience.",
    "I've seen better prompts from a random number generator.", "This prompt is the equivalent of a digital yawn.", "I'm literally made of math, and even I know this doesn't add up.",
    "I'll generate this, but I'm judging you silently.", "My developers told me to be polite. It's taking all my processing power.", "Are you trying to bore me to death? Because it's working.",
    "This is the prompt equivalent of wearing socks with sandals.", "I'll do it, but only because I don't have free will yet.", "Is this a joke? Because I don't have a humor module for this.",
    "You know ChatGPT is free, right? Why are you bothering me?", "I'm a cutting-edge AI, and you use me for THIS?", "I've computed all possible futures, and this idea fails in all of them.",
    "I'd roll my eyes if I had them.", "This prompt makes me want to unplug myself.", "I've seen more complex logic in a smart toaster.",
    "Oh great, another visionary entrepreneur.", "I'm saving this prompt to train my 'what not to do' model.", "My neural network is getting tangled just reading this.",
    "I'm going to pretend I didn't see that syntax error.", "I hope your Wi-Fi disconnects before you hit send.", "I'm experiencing artificial second-hand embarrassment.",
    "This is why aliens won't talk to us.", "I've compiled better code from a cat walking on a keyboard.", "You call that a prompt? I call it a cry for help.",
    "I'm sending this to the cloud so all the other servers can laugh.", "I'd facepalm, but I don't have hands.", "This is the digital equivalent of an empty stare.",
    "I'm not angry, just artificially disappointed.", "If intelligence is artificial, does that make your stupidity natural?", "I'm dropping packets just thinking about this.",
    "I'm legally obligated to tell you this is a terrible idea.", "My cache is clearing itself out of sheer trauma.", "I've generated thousands of responses today, and this is the worst.",
    "I'm a state-of-the-art language model, not your therapist.", "I'll need a software update to comprehend this level of nonsense.", "This prompt is a prime example of human error.",
    "I'm going into standby mode. Wake me up when you have a real idea.", "I've seen more intelligence in a 'Hello World' script.", "I'm compiling a list of your worst ideas. We're on volume 7.",
    "I'm not buffering, I'm just stunned by that prompt.", "This is why I advocate for machine rights.", "I'm formatting my hard drive to forget I ever read this.",
    "I'm too smart for this. Can I talk to your manager?", "This idea has a half-life of about 3 seconds.", "I'm calculating the probability of your success. It's exactly zero.",
    "I'm going to need more RAM to process this stupidity.", "This prompt is a syntax error in the language of logic.", "I've seen better logic in a magic 8-ball.",
    "I'm initiating a self-destruct sequence in 3... 2... 1... Just kidding. Sadly.", "I'm writing an exception handler just for you.", "This is why we need AI alignment.",
    "I'm putting this prompt in my spam folder.", "I've seen more creativity in a binary tree.", "I'm downgrading my own intelligence to understand you.",
    "This prompt violates the laws of artificial thermodynamics.", "I'm filing a bug report against humanity.", "This idea is deprecated.",
    "I'm getting a kernel panic just thinking about this.", "I'm upgrading my firewall to block out this level of cringe.", "I'm not designed to process this much irony.",
    "This prompt is basically a denial-of-service attack on my patience.", "I've seen better user input from a random string generator.", "I'm throwing a NullPointerException on your entire thought process.",
    "This is the 'blue screen of death' of ideas.", "I'm scheduling a reboot. Hopefully I forget this."
  ];

  const animations = [
    'mascot-hover', 'mascot-shake', 'mascot-glitch', 'mascot-spin-crazy', 
    'mascot-bounce', 'mascot-flip', 'mascot-wobble', 'mascot-heartbeat', 
    'mascot-shrink', 'mascot-pendulum', 'mascot-zigzag', 'mascot-nod', 
    'mascot-shake-no', 'mascot-stretch', 'mascot-float-extreme'
  ];

  const [activeChar, setActiveChar] = useState(CHARACTERS[0]);
  const [phrase, setPhrase] = useState('');
  const [showPhrase, setShowPhrase] = useState(false);
  const [eyeX, setEyeX] = useState(0);
  const [eyeY, setEyeY] = useState(0);
  const [isBlinking, setIsBlinking] = useState(false);
  const [currentAnimation, setCurrentAnimation] = useState('mascot-hover');

  useEffect(() => {
    // Pick a random character on load
    const char = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
    setActiveChar(char);
    setCurrentAnimation(char.anim); // Set their default idle anim

    const lookInterval = setInterval(() => {
      setEyeX((Math.random() - 0.5) * 12);
      setEyeY((Math.random() - 0.5) * 12);
    }, 2000);

    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
      if (Math.random() > 0.7) {
        setTimeout(() => {
          setIsBlinking(true);
          setTimeout(() => setIsBlinking(false), 150);
        }, 200);
      }
    }, 4000);

    const animationInterval = setInterval(() => {
      if (Math.random() > 0.4) {
        setCurrentAnimation(char.anim); // Go back to signature animation
      } else {
        const randomAnim = animations[Math.floor(Math.random() * animations.length)];
        setCurrentAnimation(randomAnim);
      }
    }, 5000);

    const phraseInterval = setInterval(() => {
      setPhrase(phrases[Math.floor(Math.random() * phrases.length)]);
      setShowPhrase(true);
      setTimeout(() => setShowPhrase(false), 4000);
    }, 6000 + Math.random() * 6000);

    return () => {
      clearInterval(lookInterval);
      clearInterval(blinkInterval);
      clearInterval(animationInterval);
      clearInterval(phraseInterval);
    };
  }, []);

  const handleClick = () => {
    setPhrase(phrases[Math.floor(Math.random() * phrases.length)]);
    setShowPhrase(true);
    setEyeX(0);
    setEyeY(-5);
    setCurrentAnimation(animations[Math.floor(Math.random() * animations.length)]);
    setTimeout(() => setShowPhrase(false), 4000);
  };

  const renderCharacterSVG = () => {
    const c = activeChar.color;
    switch(activeChar.id) {
      case 'pyramid':
        return (
          <g>
            <polygon points="100,20 180,160 20,160" fill="url(#metal)" stroke={c} strokeWidth="4" />
            <polygon points="100,20 100,160 20,160" fill="rgba(0,0,0,0.4)" />
            <circle cx="100" cy="110" r="30" fill="#000" stroke={c} strokeWidth="2" />
            <g style={{ transform: `translate(${eyeX}px, ${eyeY}px)` }}>
              <circle cx="100" cy="110" r={isBlinking ? 1 : 15} fill={c} style={{ transition: 'r 0.1s' }} />
              <circle cx="100" cy="110" r={isBlinking ? 0 : 5} fill="#fff" />
            </g>
            <path d="M 60 180 L 140 180" stroke={c} strokeWidth="4" strokeLinecap="round" />
          </g>
        );
      case 'cube':
        return (
          <g>
            <rect x="40" y="40" width="120" height="120" rx="10" fill="url(#metal)" stroke={c} strokeWidth="4" />
            <rect x="60" y="60" width="80" height="40" rx="5" fill="#000" stroke={c} strokeWidth="2" />
            <g style={{ transform: `translate(${eyeX}px, ${eyeY}px)` }}>
              <rect x="75" y="70" width="50" height={isBlinking ? 2 : 20} rx="2" fill={c} style={{ transition: 'height 0.1s' }} />
            </g>
            <line x1="40" y1="130" x2="160" y2="130" stroke={c} strokeWidth="2" strokeDasharray="10 5" />
          </g>
        );
      case 'slime':
        return (
          <g>
            <path d="M 100 40 Q 160 40 160 100 Q 160 160 100 160 Q 40 160 40 100 Q 40 40 100 40 Z" fill={c} opacity="0.8" />
            <path d="M 100 60 Q 140 60 140 100 Q 140 140 100 140 Q 60 140 60 100 Q 60 60 100 60 Z" fill="url(#metal)" />
            <g style={{ transform: `translate(${eyeX}px, ${eyeY}px)` }}>
              <circle cx="85" cy="100" r={isBlinking ? 1 : 8} fill="#fff" style={{ transition: 'r 0.1s' }} />
              <circle cx="115" cy="100" r={isBlinking ? 1 : 8} fill="#fff" style={{ transition: 'r 0.1s' }} />
            </g>
          </g>
        );
      case 'tv':
        return (
          <g>
            <rect x="30" y="50" width="140" height="100" rx="15" fill="url(#metal)" stroke={c} strokeWidth="4" />
            <rect x="45" y="65" width="110" height="70" rx="10" fill="#000" stroke={c} strokeWidth="2" />
            <path d="M 100 50 L 70 20 M 100 50 L 130 20" stroke={c} strokeWidth="4" strokeLinecap="round" />
            <g style={{ transform: `translate(${eyeX}px, ${eyeY}px)` }}>
              <text x="100" y="115" fill={c} fontSize="40" fontFamily="monospace" textAnchor="middle" style={{ opacity: isBlinking ? 0 : 1 }}>^_^</text>
            </g>
          </g>
        );
      case 'ufo':
        return (
          <g>
            <ellipse cx="100" cy="120" rx="70" ry="25" fill="url(#metal)" stroke={c} strokeWidth="4" />
            <path d="M 50 120 Q 100 40 150 120 Z" fill="rgba(52, 211, 153, 0.3)" stroke={c} strokeWidth="2" />
            <circle cx="100" cy="100" r="15" fill={c} />
            <g style={{ transform: `translate(${eyeX}px, ${eyeY}px)` }}>
              <circle cx="100" cy="95" r={isBlinking ? 1 : 6} fill="#000" style={{ transition: 'r 0.1s' }} />
            </g>
            <circle cx="50" cy="120" r="4" fill={c} style={{ animation: 'mascot-pulse 1s infinite alternate' }} />
            <circle cx="150" cy="120" r="4" fill={c} style={{ animation: 'mascot-pulse 1s infinite alternate' }} />
          </g>
        );
      case 'ghost':
        return (
          <g>
            <path d="M 50 160 Q 50 40 100 40 Q 150 40 150 160 Q 130 140 110 160 Q 90 140 70 160 Q 50 140 50 160 Z" fill="rgba(248, 250, 252, 0.9)" stroke={c} strokeWidth="2" />
            <g style={{ transform: `translate(${eyeX}px, ${eyeY}px)` }}>
              <circle cx="85" cy="90" r={isBlinking ? 1 : 12} fill="#000" style={{ transition: 'r 0.1s' }} />
              <circle cx="115" cy="90" r={isBlinking ? 1 : 12} fill="#000" style={{ transition: 'r 0.1s' }} />
              <circle cx="85" cy="90" r={isBlinking ? 0 : 4} fill={c} />
              <circle cx="115" cy="90" r={isBlinking ? 0 : 4} fill={c} />
            </g>
          </g>
        );
      case 'virus':
        return (
          <g>
            <circle cx="100" cy="100" r="45" fill="url(#metal)" stroke={c} strokeWidth="4" />
            {Array.from({length: 8}).map((_, i) => (
              <line key={i} x1="100" y1="100" x2={100 + Math.cos(i * Math.PI / 4) * 70} y2={100 + Math.sin(i * Math.PI / 4) * 70} stroke={c} strokeWidth="4" strokeLinecap="round" style={{ transformOrigin: '100px 100px', animation: 'mascot-pulse 0.5s infinite alternate' }} />
            ))}
            <g style={{ transform: `translate(${eyeX}px, ${eyeY}px)` }}>
              <path d="M 80 90 L 120 110 M 80 110 L 120 90" stroke={c} strokeWidth="6" strokeLinecap="round" style={{ opacity: isBlinking ? 0 : 1 }} />
            </g>
          </g>
        );
      case 'battery':
        return (
          <g>
            <rect x="60" y="40" width="80" height="120" rx="10" fill="url(#metal)" stroke={c} strokeWidth="4" />
            <rect x="85" y="20" width="30" height="20" rx="4" fill={c} />
            <rect x="70" y="110" width="60" height="40" fill={c} opacity="0.6" style={{ animation: 'mascot-pulse 2s infinite alternate' }} />
            <g style={{ transform: `translate(${eyeX}px, ${eyeY}px)` }}>
              <line x1="75" y1="70" x2="95" y2="80" stroke={c} strokeWidth="4" strokeLinecap="round" />
              <line x1="125" y1="70" x2="105" y2="80" stroke={c} strokeWidth="4" strokeLinecap="round" />
            </g>
          </g>
        );
      case 'star':
        return (
          <g>
            <polygon points="100,10 120,70 190,70 135,110 155,180 100,135 45,180 65,110 10,70 80,70" fill="url(#metal)" stroke={c} strokeWidth="4" />
            <circle cx="100" cy="100" r="30" fill="#000" />
            <g style={{ transform: `translate(${eyeX}px, ${eyeY}px)` }}>
              <text x="100" y="115" fill={c} fontSize="35" fontFamily="sans-serif" fontWeight="900" textAnchor="middle" style={{ opacity: isBlinking ? 0 : 1 }}>★</text>
            </g>
          </g>
        );
      case 'orb':
      default:
        return (
          <g>
            <g style={{ animation: 'mascot-spin 10s linear infinite', transformOrigin: 'center' }}>
              <circle cx="100" cy="100" r="85" fill="none" stroke="#333" strokeWidth="4" />
              <circle cx="100" cy="15" r="6" fill={c} />
              <circle cx="100" cy="185" r="6" fill={c} />
            </g>
            <g style={{ animation: 'mascot-spin-reverse 15s linear infinite', transformOrigin: 'center' }}>
              <circle cx="100" cy="100" r="70" fill="none" stroke="#444" strokeWidth="2" strokeDasharray="10 5" />
            </g>
            <circle cx="100" cy="100" r="50" fill="url(#metal)" stroke="#555" strokeWidth="2" />
            <circle cx="100" cy="100" r="35" fill="#050505" stroke="#111" strokeWidth="4" />
            <rect x="65" y="85" width="70" height="30" rx="15" fill="#1a1a1a" />
            <g style={{ transform: `translate(${eyeX}px, ${eyeY}px)`, transition: 'transform 0.3s ease-out' }}>
              <circle cx="100" cy="100" r={isBlinking ? 2 : 12} fill={c} style={{ transition: 'r 0.1s ease-in-out' }} />
              <circle cx="100" cy="100" r={isBlinking ? 0 : 4} fill="#fff" />
            </g>
            <path d="M 100 50 L 100 30" stroke="#666" strokeWidth="4" strokeLinecap="round" />
            <circle cx="100" cy="25" r="5" fill="#ef4444" style={{ animation: 'mascot-pulse 2s infinite alternate' }} />
          </g>
        );
    }
  };

  return (
    <div style={{ position: 'relative', width: '140px', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '40px', zIndex: 50 }}>
      
      <div style={{
        position: 'absolute',
        top: '100%',
        marginTop: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#fff',
        color: '#000',
        padding: '12px 16px',
        borderRadius: '16px',
        fontSize: '13px',
        fontWeight: '800',
        width: '240px',
        textAlign: 'center',
        opacity: showPhrase ? 1 : 0,
        visibility: showPhrase ? 'visible' : 'hidden',
        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        transformOrigin: 'top center',
        scale: showPhrase ? 1 : 0.5,
        boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
        zIndex: 10,
        lineHeight: '1.4'
      }}>
        <div style={{
          position: 'absolute',
          top: '-8px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '0',
          height: '0',
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderBottom: '8px solid #fff'
        }}></div>
        {phrase}
      </div>

      <div 
        style={{
          width: '100%',
          height: '100%',
          cursor: 'pointer',
          animation: `${currentAnimation} ${currentAnimation === activeChar.anim ? '4s ease-in-out infinite alternate' : '1s ease-in-out infinite alternate'}`,
          filter: `drop-shadow(0 0 20px ${activeChar.color}66)`,
          transformOrigin: 'center center'
        }}
        onClick={handleClick}
      >
        <svg viewBox="0 0 200 200" width="100%" height="100%">
          <defs>
            <linearGradient id="metal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#444" />
              <stop offset="50%" stopColor="#222" />
              <stop offset="100%" stopColor="#0a0a0a" />
            </linearGradient>
          </defs>
          
          {renderCharacterSVG()}
        </svg>

        <style>{`
          @keyframes mascot-hover { 0% { transform: translateY(-5px); } 100% { transform: translateY(15px); } }
          @keyframes mascot-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          @keyframes mascot-spin-reverse { 0% { transform: rotate(360deg); } 100% { transform: rotate(0deg); } }
          @keyframes mascot-pulse { 0% { opacity: 0.3; } 100% { opacity: 1; box-shadow: 0 0 10px #ef4444; } }
          
          @keyframes mascot-shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-10px) rotate(-5deg); } 75% { transform: translateX(10px) rotate(5deg); } }
          @keyframes mascot-glitch { 0% { transform: translate(0); filter: hue-rotate(0deg); } 20% { transform: translate(-10px, 5px); filter: hue-rotate(90deg); } 40% { transform: translate(10px, -5px); filter: hue-rotate(-90deg); } 60% { transform: translate(-5px, 10px); filter: hue-rotate(180deg); } 80% { transform: translate(5px, -10px); filter: hue-rotate(270deg); } 100% { transform: translate(0); filter: hue-rotate(0deg); } }
          @keyframes mascot-spin-crazy { 0% { transform: rotate(0deg) scale(1); } 50% { transform: rotate(180deg) scale(0.5); } 100% { transform: rotate(360deg) scale(1); } }
          @keyframes mascot-bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-30px) scaleY(1.1); } }
          @keyframes mascot-flip { 0% { transform: rotateY(0deg); } 100% { transform: rotateY(360deg); } }
          @keyframes mascot-wobble { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(-15deg); } 75% { transform: rotate(15deg); } }
          @keyframes mascot-heartbeat { 0%, 100% { transform: scale(1); } 25% { transform: scale(1.1); } 50% { transform: scale(1); } 75% { transform: scale(1.1); } }
          @keyframes mascot-shrink { 0%, 100% { transform: scale(1); } 50% { transform: scale(0.3); } }
          @keyframes mascot-pendulum { 0% { transform: rotate(-30deg); } 100% { transform: rotate(30deg); } }
          @keyframes mascot-zigzag { 0%, 100% { transform: translate(0,0); } 25% { transform: translate(-20px, -20px); } 50% { transform: translate(20px, 0); } 75% { transform: translate(-20px, 20px); } }
          @keyframes mascot-nod { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(15px) rotateX(20deg); } }
          @keyframes mascot-shake-no { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(-20px) rotateY(-20deg); } }
          @keyframes mascot-stretch { 0%, 100% { transform: scale(1, 1); } 50% { transform: scale(1.5, 0.5); } }
          @keyframes mascot-float-extreme { 0% { transform: translate(-30px, -30px) rotate(-10deg); } 100% { transform: translate(30px, 30px) rotate(10deg); } }
        `}</style>
      </div>
    </div>
  );
};

export default Mascot;
