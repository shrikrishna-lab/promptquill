import React, { useEffect, useRef } from 'react';

const CanvasBackground = ({ isMainArea = false }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Configuration
    const dotCount = isMainArea ? 40 : 55; // Slightly fewer dots for dashboard area
    const connectionDist = 110;
    const dots = [];
    const scanLines = [];
    let glitches = [];

    // Colors
    const LIME = '#a3e635';
    const PURPLE = '#6d28d9';
    const BG_COLOR = isMainArea ? '#080808' : '#080808'; // Same dark depth

    const resize = () => {
      const parent = canvas.parentElement;
      canvas.width = parent.clientWidth * window.devicePixelRatio;
      canvas.height = parent.clientHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    // Initialize Dots
    for (let i = 0; i < dotCount; i++) {
      dots.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * (isMainArea ? 0.3 : 0.5), 
        vy: (Math.random() - 0.5) * (isMainArea ? 0.3 : 0.5),
        type: i % 3, 
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.02
      });
    }

    // Initialize Scan Lines
    for (let i = 0; i < (isMainArea ? 4 : 6); i++) {
      scanLines.push({
        y: Math.random() * window.innerHeight,
        speed: 0.3 + Math.random() * 0.5,
        opacity: 0.04 + Math.random() * 0.1
      });
    }

    const draw = () => {
      const w = canvas.width / window.devicePixelRatio;
      const h = canvas.height / window.devicePixelRatio;

      // BG Fill
      ctx.fillStyle = BG_COLOR;
      ctx.fillRect(0, 0, w, h);

      // 1. Connection Lines
      ctx.lineWidth = 0.5;
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDist) {
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            const opacity = (1 - dist / connectionDist) * 0.15;
            ctx.strokeStyle = (dots[i].type === 0 && dots[j].type === 0) ? `rgba(163, 230, 53, ${opacity})` : `rgba(109, 40, 217, ${opacity})`;
            ctx.stroke();
          }
        }
      }

      // 2. Dots
      dots.forEach(dot => {
        dot.x += dot.vx;
        dot.y += dot.vy;
        dot.pulse += dot.pulseSpeed;

        if (dot.x < 0 || dot.x > w) dot.vx *= -1;
        if (dot.y < 0 || dot.y > h) dot.vy *= -1;

        const pulseOffset = Math.sin(dot.pulse) * 0.4;
        let radius = 0;
        let color = '';
        let glowColor = '';

        if (dot.type === 0) {
          radius = 1.3 + pulseOffset;
          color = LIME;
          glowColor = 'rgba(163, 230, 53, 0.3)';
        } else if (dot.type === 1) {
          radius = 1.1 + pulseOffset;
          color = PURPLE;
          glowColor = 'rgba(109, 40, 217, 0.3)';
        } else {
          radius = 0.6;
          color = 'rgba(255, 255, 255, 0.4)';
        }

        // PERFORMANCE FIX: Replace shadowBlur with a secondary faint circle
        if (glowColor) {
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, radius * 3, 0, Math.PI * 2);
          ctx.fillStyle = glowColor;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      });

      // 3. Scan Lines
      scanLines.forEach(line => {
        line.y += line.speed;
        if (line.y > h) line.y = -2;
        ctx.beginPath();
        ctx.moveTo(0, line.y);
        ctx.lineTo(w, line.y);
        ctx.strokeStyle = `rgba(163, 230, 53, ${line.opacity})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // 4. Glitch Slices (Subtle & Rare)
      if (Math.random() < 0.012) {
        const count = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < count; i++) {
          glitches.push({
            y: Math.random() * h,
            h: 1 + Math.random() * 10,
            shift: (Math.random() - 0.5) * 30,
            life: 14
          });
        }
      }

      glitches = glitches.filter(g => g.life > 0);
      glitches.forEach(g => {
        ctx.save();
        const opacity = g.life / 14;
        ctx.globalAlpha = opacity * 0.3;
        ctx.fillStyle = LIME;
        ctx.fillRect((w * 0.05) + g.shift, g.y, w * 0.9, g.h);
        ctx.restore();
        g.life--;
      });

      // 5. Center Radial Glow
      const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.5);
      grad.addColorStop(0, 'rgba(109, 40, 217, 0.07)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, [isMainArea]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none'
      }}
    />
  );
};

export default CanvasBackground;
