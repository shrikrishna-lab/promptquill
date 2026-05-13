import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { startProSubscription, startCreditTopup } from '../lib/pro';
import toast from 'react-hot-toast';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';
import { ArrowRight, Zap, Target, Layers, Cpu, Code2, X, Users, BookOpen, MessageSquare, Rocket, Sparkles, PenTool, Palette, CheckCircle2 } from 'lucide-react';
import SEO from '../components/SEO';
import './LandingPage.css';

gsap.registerPlugin(ScrollTrigger);

const modesData = [
    {
        id: 0,
        icon: <Zap size={60} strokeWidth={1} color="#A8FF3E" style={{ filter: 'drop-shadow(0 0 20px rgba(168,255,62,0.8))' }} />,
        title: 'General',
        theme: 'radial-gradient(130% 130% at 50% 0%, #A8FF3E 0%, #2f6b00 100%)',
        text: '#000',
        desc: 'For any task, idea, or workflow. Generates 8 tabs: Action Brief, Steps, Quick Wins, Tools, Timeline, Risks, Resources, and Score. Plus 4 Pro-locked tabs. 10 credits per generation. [FREE]'
    },
    {
        id: 1,
        icon: <Rocket size={60} strokeWidth={1} color="#fff" style={{ filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.8))' }} />,
        title: 'Startup Pro',
        theme: 'radial-gradient(130% 130% at 50% 0%, #30363d 0%, #0d1117 100%)',
        text: '#fff',
        desc: 'Full 15-tab startup brief: Action Brief, Steps, Quick Wins, Brief, Validate, Plan, Advice, Launch, Monetization, Competitors, Score — plus Pro tabs: Investor Lens, AI Debate, Ship in 30 Days, Pivot Options. 25 credits. [PRO — requires Pro plan]'
    },
    {
        id: 2,
        icon: <Sparkles size={60} strokeWidth={1} color="#a166ff" style={{ filter: 'drop-shadow(0 0 20px rgba(161,102,255,0.8))' }} />,
        title: 'Startup Lite',
        theme: 'radial-gradient(130% 130% at 50% 0%, #a166ff 0%, #4A00E0 100%)',
        text: '#fff',
        desc: 'Quick startup validation with 7 essential tabs: Action Brief, Steps, Quick Wins, Brief, Validate, Plan, and Launch. No Pro tabs — everything is unlocked. 10 credits per generation. [FREE]'
    },
    {
        id: 3,
        icon: <Code2 size={60} strokeWidth={1} color="#ff8a4c" style={{ filter: 'drop-shadow(0 0 20px rgba(255,138,76,0.8))' }} />,
        title: 'Coding',
        theme: 'radial-gradient(130% 130% at 50% 0%, #ff8a4c 0%, #b3003b 100%)',
        text: '#fff',
        desc: 'Full technical spec with 11 tabs: Action Brief, Steps, Quick Wins, Dev Brief, Architecture, Endpoints, Schema, Build Order, Components, Tech Debt, Score. Pro tabs: Security Audit, Performance Plan, Testing Suite, Deployment Guide. 10 credits. [FREE]'
    },
    {
        id: 4,
        icon: <PenTool size={60} strokeWidth={1} color="#ddd" style={{ filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.6))' }} />,
        title: 'Content',
        theme: 'radial-gradient(130% 130% at 50% 0%, #555 0%, #111 100%)',
        text: '#fff',
        desc: 'Content strategy with 11 tabs: Action Brief, Steps, Quick Wins, Content Brief, Structure, SEO, Voice & Tone, Distribution, Repurpose, Metrics, Score. Pro tabs: Content Calendar, Competitor Content, Viral Hooks, Email Sequence. 10 credits. [FREE]'
    },
    {
        id: 5,
        icon: <Palette size={60} strokeWidth={1} color="#A8FF3E" style={{ filter: 'drop-shadow(0 0 20px rgba(168,255,62,0.8))' }} />,
        title: 'Creative',
        theme: 'radial-gradient(130% 130% at 50% 0%, #222 0%, #050505 100%)',
        text: '#fff',
        desc: 'Creative direction with 11 tabs: Action Brief, Steps, Quick Wins, Master Prompt, Variations, Tool Guide, Specs, Direction, Negative Prompts, Iteration, Score. Pro tabs: Style Library, Director Notes, Remix Pack, Multi-Tool Pack. 10 credits. [FREE]'
    }
];

const LandingPage = () => {
    const navigate = useNavigate();
    const [heroInput, setHeroInput] = useState('');
    const [currency, setCurrency] = useState('₹');

    const [hoverHIW, setHoverHIW] = useState(null);
    const [hoverPrice, setHoverPrice] = useState(null);

    // Referral code auto-detect (deactivated — no auth)
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('ref') || localStorage.getItem('promptquill_referral_code')) {
            // Referral present — redirect to dashboard
            window.location.href = '/ai';
        }
    }, []);

    const [expandedMode, setExpandedMode] = useState(null);

    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const hscrollRef = useRef(null);

    useEffect(() => {
        const cInterval = setInterval(() => {
            setCurrency(prev => prev === '₹' ? '$' : '₹');
        }, 3000);
        return () => clearInterval(cInterval);
    }, []);

    const onAuthClick = () => navigate('/ai');
    const handleHeroSubmit = (e) => {
        e.preventDefault();
        if (heroInput.trim()) {
            localStorage.setItem('promptquill_intent', heroInput);
            onAuthClick();
        }
    };

    const handlePricingCheckout = async (type) => {
        toast.success('PromptQuill is free & open source! Start generating right away.');
        navigate('/ai');
    };

    const faqData = [
        {
            question: "What is PromptQuill?",
            answer: "PromptQuill is an advanced AI prompt engineering platform that helps you generate high-quality, structured prompts for ChatGPT, Claude, Gemini, and Midjourney using specialized generation modes."
        },
        {
            question: "Is PromptQuill free to use?",
            answer: "Yes, PromptQuill offers 10 free generations daily across all standard modes. We also have a Pro plan for unlimited generations and access to advanced 'Investor Lens' and 'AI Debate' features."
        },
        {
            question: "Which AI models does it support?",
            answer: "The prompts generated by PromptQuill are optimized for all leading LLMs including GPT-4o, Claude 3.5 Sonnet, and Google Gemini."
        }
    ];

    useEffect(() => {
        const isMobileViewport = window.innerWidth <= 768;
        const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smooth: true, direction: 'vertical', gestureDirection: 'vertical' });
        if (!isMobileViewport) {
            lenis.on('scroll', ScrollTrigger.update);
            gsap.ticker.add((time) => lenis.raf(time * 1000));
            gsap.ticker.lagSmoothing(0);
        }

        const canvas = document.getElementById('spine-canvas');
        if (!canvas) return;

        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x000000, 0.012);
        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 25;

        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const engineGroup = new THREE.Group();
        scene.add(engineGroup);

        const geoOuter = new THREE.IcosahedronGeometry(10, 2);
        const matOuter = new THREE.MeshBasicMaterial({ color: 0xA8FF3E, wireframe: true, transparent: true, opacity: 0.15 });
        const meshOuter = new THREE.Mesh(geoOuter, matOuter);
        engineGroup.add(meshOuter);

        const geoInner = new THREE.IcosahedronGeometry(6, 1);
        const matInner = new THREE.MeshBasicMaterial({ color: 0x7B2FFF, wireframe: true, transparent: true, opacity: 0.4 });
        const meshInner = new THREE.Mesh(geoInner, matInner);
        engineGroup.add(meshInner);

        const dustGeo = new THREE.BufferGeometry();
        const numParticles = window.innerWidth < 768 ? 150 : 800;
        const dustPos = new Float32Array(numParticles * 3);
        for (let i = 0; i < numParticles * 3; i++) dustPos[i] = (Math.random() - 0.5) * 80;
        dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
        const dustMat = new THREE.PointsMaterial({ size: 0.1, color: 0xffffff, transparent: true, opacity: 0.3 });
        const dust = new THREE.Points(dustGeo, dustMat);
        scene.add(dust);

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        const ctx = gsap.context(() => {
            if (isMobileViewport) return;

            ScrollTrigger.create({
                trigger: containerRef.current, start: "top top", end: "bottom bottom", scrub: 1,
                onUpdate: (self) => {
                    const fill = document.querySelector('.spine-fill');
                    if (fill) gsap.set(fill, { height: `${self.progress * 100}%` });
                    engineGroup.rotation.y = self.progress * Math.PI * 4;
                    engineGroup.rotation.z = self.progress * Math.PI * 2;
                    engineGroup.position.y = Math.sin(self.progress * Math.PI) * 4;
                }
            });

            const anatomyNodes = gsap.utils.toArray('.anatomy-node');
            anatomyNodes.forEach((node) => {
                gsap.fromTo(node, { opacity: 0, x: -50 }, { opacity: 1, x: 0, scrollTrigger: { trigger: node, start: "top 60%", end: "bottom 40%", scrub: true } });
            });

            gsap.to('.kenetic-track-1', { xPercent: -50, ease: "none", scrollTrigger: { trigger: ".kinetic-section", start: "top bottom", end: "bottom top", scrub: true } });
            gsap.to('.kenetic-track-2', { xPercent: 50, ease: "none", scrollTrigger: { trigger: ".kinetic-section", start: "top bottom", end: "bottom top", scrub: true } });

            let mm = gsap.matchMedia();
            mm.add("(min-width: 769px)", () => {
                if (hscrollRef.current) {
                    const track = hscrollRef.current;
                    const scrollWidth = track.scrollWidth - window.innerWidth;
                    gsap.to(track, { x: -scrollWidth, ease: "none", scrollTrigger: { trigger: ".h-scroll-section", start: "top top", end: `+=${scrollWidth}`, pin: true, scrub: 1 } });
                }
            });

            gsap.fromTo(".target-graphics", { scale: 0.2, opacity: 0 }, { scale: 1, opacity: 1, ease: "power2.out", scrollTrigger: { trigger: ".target-section", start: "top 70%", end: "center center", scrub: true } });

            const folderTl = gsap.timeline({
                scrollTrigger: {
                    trigger: ".folder-section",
                    start: "top top",
                    end: "+=2500",
                    scrub: 1.5,
                    pin: true
                }
            });

            folderTl.to(".folder-front", { rotateX: -75, transformOrigin: "bottom center", ease: "power1.inOut" }, 0);

            modesData.forEach((m, idx) => {
                const angle = -60 + (idx * 24);
                const yDist = -380 + Math.abs(angle) * 1.8;
                folderTl.to(`.card-mode-${idx}`, {
                    y: yDist,
                    x: angle * 3.5,
                    rotateZ: angle,
                    scale: 1.1,
                    zIndex: idx + 5
                }, 0.1 + (idx * 0.15));
            });

            gsap.fromTo('.community-section .sc-card', { scale: 0.9, opacity: 0, y: 50 }, { scale: 1, opacity: 1, y: 0, ease: 'back.out(1.5)', stagger: 0.1, scrollTrigger: { trigger: ".community-section", start: "top 75%" } });
            gsap.fromTo('.how-it-works-section .sc-card', { opacity: 0, y: 50 }, { opacity: 1, y: 0, ease: 'power3.out', stagger: 0.15, scrollTrigger: { trigger: ".how-it-works-section", start: "top 75%" } });

        }, containerRef);

        let animId;
        const animate = () => {
            dust.rotation.y += 0.001; meshOuter.rotation.x += 0.002; meshInner.rotation.y -= 0.003;
            renderer.render(scene, camera);
            animId = requestAnimationFrame(animate);
        };
        animate();

        // Refresh ScrollTrigger to fix stuck scroll after navigation
        setTimeout(() => {
            ScrollTrigger.refresh();
            document.body.style.overflow = 'unset';
            document.documentElement.style.overflow = 'unset';
            if (lenis) lenis.start();
        }, 150);

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', handleResize);
            lenis.destroy();
            ctx.revert();
            renderer.dispose();
        };
    }, []);

    useEffect(() => {
        if (expandedMode !== null) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [expandedMode]);

    return (
        <div className="main-container" ref={containerRef}>
            <SEO 
                title="PromptQuill — AI Prompt Generator & Engineering Tool"
                description="The ultimate AI Prompt Generator. Create, refine, and optimize perfect prompts for ChatGPT, Claude, Gemini, and Midjourney in seconds. Master prompt engineering."
                keywords="prompt generator, AI prompt generator, prompt engineering tool, ChatGPT prompt generator, prompt builder, Midjourney prompt generator, AI prompt writer, prompt optimizer"
                bingVerification={import.meta.env.VITE_BING_VERIFICATION || ""}
                jsonLd={{
                    "@context": "https://schema.org",
                    "@type": "FAQPage",
                    "mainEntity": faqData.map(f => ({
                        "@type": "Question",
                        "name": f.question,
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": f.answer
                        }
                    }))
                }}
            />
            <canvas id="spine-canvas" ref={canvasRef}></canvas>
            <div className="spine-noise"></div>

            <nav className="spine-nav mobile-nav-autohide">
                <div className="nav-brand-complex" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '9px', letterSpacing: '2px', color: '#555', textTransform: 'uppercase', fontWeight: '600' }}>BY ERROR404 STUDIO</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div className="nb-dot"></div>
                        <span className="nb-name" style={{ fontSize: '16px', fontWeight: '700', color: '#fff', letterSpacing: '0.5px' }}>PromptQuill</span>
                    </div>
                </div>
                <button className="nav-btn" onClick={onAuthClick}>Try Free →</button>
            </nav>

            <div className="spine-central-line"><div className="spine-fill"></div></div>

            <section className="anatomy-section">
                <div className="hero-center-titles">
                    <p className="hero-subtitle top-subtitle" style={{ color: 'var(--neon-green)', marginBottom: '8px', opacity: 0.8 }}>AI PROMPT ENGINE · 6 MODES · PERSONALITY TOGGLE</p>
                    <h1 className="hero-title">GENERATE<br /><span>YOUR PROMPT</span></h1>
                    <p className="hero-subtitle bottom-subtitle" style={{ maxWidth: '600px', margin: '25px auto 0', color: '#888' }}>Type an idea. Pick a mode. Get a structured, multi-tab AI brief ready for any LLM.</p>
                    <div className="hero-input-area" style={{ marginTop: '50px' }}>
                        <input type="text" className="hero-input" placeholder="Describe your idea..." value={heroInput} onChange={(e) => setHeroInput(e.target.value)} />
                        <button className="hero-btn" onClick={handleHeroSubmit}><ArrowRight size={24} /></button>
                    </div>
                </div>
                <div className="anatomy-overlay">
                    {/* Top Left Node */}
                    <div className="anatomy-node" style={{ top: '8%', left: '2%' }}>
                        <div className="node-dot"></div><div className="node-line" style={{ width: '80px' }}></div>
                        <div className="node-text" style={{ borderLeftColor: 'var(--neon-green)' }}>
                            <div className="n-title">6 Engine Modes</div>
                            <div className="n-desc" style={{ maxWidth: '180px' }}>General, Startup, Coding, Content, and Creative — deep-domain precision.</div>
                        </div>
                    </div>
                    {/* Middle Right Node */}
                    <div className="anatomy-node" style={{ top: '38%', right: '2%', left: 'auto', textAlign: 'right' }}>
                        <div className="node-text" style={{ borderLeft: 'none', borderRight: '2px solid var(--neon-purple)' }}>
                            <div className="n-title">Personality Switch</div>
                            <div className="n-desc" style={{ maxWidth: '180px' }}>Technical precision (Bot) or high-stakes founder prose (Human).</div>
                        </div>
                        <div className="node-line" style={{ width: '80px', marginRight: 0, marginLeft: '15px' }}></div>
                        <div className="node-dot" style={{ borderColor: 'var(--neon-purple)' }}></div>
                    </div>
                    {/* Bottom Left Node */}
                    <div className="anatomy-node" style={{ top: '68%', left: '2%' }}>
                        <div className="node-dot" style={{ borderColor: 'var(--neon-orange)' }}></div><div className="node-line" style={{ width: '80px' }}></div>
                        <div className="node-text" style={{ borderLeftColor: 'var(--neon-orange)' }}>
                            <div className="n-title">Multi-Tab Briefs</div>
                            <div className="n-desc" style={{ maxWidth: '180px' }}>Up to 15 focused analysis tabs per generation — ready to paste into any LLM.</div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="kinetic-section">
                <div className="kinetic-container">
                    <div className="kenetic-track kenetic-track-1">
                        6 GENERATION MODES &nbsp; <span style={{ color: 'var(--neon-purple)' }}>BOT & HUMAN VOICE</span> &nbsp; 6 GENERATION MODES &nbsp; <span style={{ color: 'var(--neon-purple)' }}>BOT & HUMAN VOICE</span>
                    </div>
                    <div className="kenetic-track kenetic-track-2" style={{ marginLeft: '-100vw' }}>
                        MULTI-TAB BRIEFS &nbsp; <span>COPY · EXPORT · SHARE</span> &nbsp; MULTI-TAB BRIEFS &nbsp; <span>COPY · EXPORT · SHARE</span>
                    </div>
                    <div className="kenetic-track kenetic-track-1">
                        PDF & CURSOR EXPORT &nbsp; <span style={{ color: 'var(--neon-orange)' }}>REDDIT VALIDATOR</span> &nbsp; COMMUNITY FEED
                    </div>
                </div>
                <div className="extreme-angle-text">
                    <div className="angle-small">Up to</div><div className="angle-large">6</div><div className="angle-small" style={{ textAlign: 'right' }}>Tabs Per Brief</div>
                </div>
            </section>

            <section className="h-scroll-section">
                <div className="h-scroll-track" ref={hscrollRef}>

                    <div className="super-card" onClick={onAuthClick}>
                        <div className="clay-char-mask mask-boo">
                            <img className="clay-img" src="/clay_chars/clay_robot.png" alt="Neural Bot" />
                        </div>

                        <div className="sc-top"><Zap className="sc-icon" /> <span className="sc-tag">Inside a brief</span></div>
                        <div className="sc-mid">
                            <h3 className="sc-title">BRIEF TAB</h3>
                            <p className="sc-desc"><strong>What it generates:</strong> A structured overview of your idea — target user, core problem, proposed solution, and key differentiators. Tailored to your exact input.</p>
                        </div>
                        <div className="sc-bottom"><button className="sc-btn">Try It Free</button></div>
                    </div>

                    <div className="super-card purple-theme" onClick={onAuthClick}>
                        <div className="clay-char-mask mask-sweet">
                            <img className="clay-img" src="/clay_chars/clay_architect.png" alt="Architect Bot" />
                        </div>

                        <div className="sc-top"><Layers className="sc-icon" /> <span className="sc-tag">Inside a brief</span></div>
                        <div className="sc-mid">
                            <h3 className="sc-title">VALIDATE TAB</h3>
                            <p className="sc-desc"><strong>What it generates:</strong> Riskiest assumptions, competitor landscape analysis, and Reddit-sourced pain points. Identifies what could kill your idea before you build.</p>
                        </div>
                        <div className="sc-bottom"><button className="sc-btn">Try It Free</button></div>
                    </div>

                    <div className="super-card orange-theme" onClick={onAuthClick}>
                        <div className="clay-char-mask mask-peek">
                            <img className="clay-img" src="/clay_chars/clay_marketer.png" alt="Marketer Bot" />
                        </div>

                        <div className="sc-top"><Target className="sc-icon" /> <span className="sc-tag">Inside a brief</span></div>
                        <div className="sc-mid">
                            <h3 className="sc-title">LAUNCH TAB</h3>
                            <p className="sc-desc"><strong>What it generates:</strong> Week-by-week launch plan with specific distribution channels, Reddit post drafts, landing page copy ideas, and measurable signup targets.</p>
                        </div>
                        <div className="sc-bottom"><button className="sc-btn">Try It Free</button></div>
                    </div>

                    <div className="super-card" onClick={onAuthClick}>
                        <div className="clay-char-mask mask-rise">
                            <img className="clay-img" src="/clay_chars/clay_coder.png" alt="Coder Bot" />
                        </div>

                        <div className="sc-top"><Code2 className="sc-icon" /> <span className="sc-tag">Inside a brief</span></div>
                        <div className="sc-mid">
                            <h3 className="sc-title">INVESTOR TAB 🔒</h3>
                            <p className="sc-desc" style={{ filter: 'blur(3px)' }}>Funding stage fit · key metrics to track · comparable startup references · pitch deck structure</p>
                        </div>
                        <div className="sc-bottom"><button className="sc-btn">Unlock with Pro</button></div>
                    </div>

                </div>
            </section>

            <section className="target-section">
                <div className="target-graphics">
                    <div className="t-circle tc-1" style={{ opacity: expandedMode !== null ? 0 : 1 }}></div>
                    <div className="t-circle tc-2" style={{ opacity: expandedMode !== null ? 0 : 1 }}></div>
                    <div className="t-circle tc-3" style={{ opacity: expandedMode !== null ? 0 : 1 }}></div>
                </div>
                <div className="target-content" style={{ opacity: expandedMode !== null ? 0 : 1, transition: '0.5s' }}>
                    <h2 className="target-title">TWO VOICES.<br /><span>YOUR CHOICE.</span></h2>
                    <p className="target-desc"><strong>⚙ BOT MODE:</strong> Structured, data-driven briefs. Tables, specs, numbered lists. Output reads like a professional strategy document.<br /><br /><strong>✦ HUMAN MODE:</strong> Direct, opinionated prose. No fluff, no corporate speak. Reads like advice from a brutally honest friend who's built things.</p>
                </div>
            </section>

            <section className="folder-section">
                <div className="folder-perspective">
                    <div className="wireframe-dome"></div>
                    <div className="folder-back"></div>
                    <div className="folder-cards-container">
                        {modesData.map((m, i) => (
                            <div
                                key={m.id}
                                className={`folder-card card-mode-${i}`}
                                style={{ backgroundImage: m.theme, color: m.text }}
                                onClick={() => setExpandedMode(i)}
                            >
                                <div className="hologram-shimmer"></div>
                                <div className="fc-icon">
                                    {m.icon}
                                </div>
                                <div className="fc-title" style={{ color: m.text }}>{m.title}</div>
                                <div className="fc-data-strip">
                                    <span>DATA_LINK: READY</span>
                                    <span>V-ENGINE: STABLE</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="folder-front">
                        <div className="folder-logo">CHOOSE YOUR MODE</div>
                        <div className="folder-scanning-line"></div>
                        <div className="folder-status-panel">
                            <div className="status-item"><div className="status-led green"></div> CORE_ON</div>
                            <div className="status-item"><div className="status-led pulse"></div> SENSING...</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* MOBILE ONLY: CREATIVE MODES */}
            <section className="mobile-modes-section">
                <div className="mm-header">
                    <h2>CHOOSE YOUR MODE</h2>
                    <p>Tap a mode to initialize the pipeline.</p>
                </div>
                <div className="mm-grid">
                    {modesData.map((m, i) => (
                        <div key={m.id} className="mm-card" style={{ backgroundImage: m.theme, color: m.text }} onClick={() => setExpandedMode(i)}>
                            <div className="mm-icon">{m.icon}</div>
                            <div className="mm-content">
                                <h3>{m.title}</h3>
                                <span>INITIALIZE <ArrowRight size={14} style={{marginLeft: '4px'}}/></span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>



            {expandedMode !== null && (
                <div className="expanded-portal" style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="expanded-backdrop" onClick={() => setExpandedMode(null)}></div>
                    <div className="folder-card expanded-mode-card" style={{ backgroundImage: modesData[expandedMode].theme, color: modesData[expandedMode].text }}>
                        <div className="fc-close" onClick={() => setExpandedMode(null)}><X /></div>

                        {/* Interactive Spark Background */}
                        <div className="fc-bg-aura"></div>
                        <div className="fc-particles-container">
                            {[...Array(8)].map((_, i) => <div key={i} className={`fc-particle p-${i}`}></div>)}
                        </div>

                        <div className="fc-content-reveal">
                            <div className="fc-icon expanded-icon" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                {modesData[expandedMode].icon}
                                <div className="fc-icon-glow"></div>
                            </div>
                            <div className="fc-title-group">
                                <div className="fc-title">{modesData[expandedMode].title}</div>
                                <div className="fc-subtitle">ENGINE ARCHITECTURE v5.0</div>
                            </div>
                            <div className="fc-details">
                                <p className="fcd-text">{modesData[expandedMode].desc}</p>
                                <div className="hero-input-area" style={{ width: '95%', margin: '30px auto 0', height: '65px', background: 'rgba(0,0,0,0.6)' }}>
                                    <input type="text" className="hero-input" style={{ fontSize: '15px' }} placeholder={`Execute pipeline for ${modesData[expandedMode].title.toUpperCase()}...`} />
                                    <div className="hero-btn"><ArrowRight size={22} /></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <section className="community-section" style={{ padding: '100px 5%', borderTop: '1px solid #111', position: 'relative' }}>
                <style>{`
                    .community-sc-card, .blog-sc-card, .forum-sc-card { transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important; cursor: pointer; }
                    .community-sc-card:hover { transform: translateY(-12px) scale(1.02) !important; box-shadow: 0 25px 60px rgba(123,47,255,0.2) !important; border-color: rgba(123,47,255,0.6) !important; }
                    .blog-sc-card:hover { transform: translateY(-12px) scale(1.02) !important; box-shadow: 0 25px 60px rgba(168,255,62,0.15) !important; border-color: rgba(168,255,62,0.6) !important; }
                    .forum-sc-card:hover { transform: translateY(-12px) scale(1.02) !important; box-shadow: 0 25px 60px rgba(0,240,255,0.15) !important; border-color: rgba(0,240,255,0.6) !important; }
                    .btn-hover-fx { transition: all 0.3s ease; }
                    .community-sc-card:hover .btn-hover-fx { background: #fff !important; color: #000 !important; }
                    .blog-sc-card:hover .btn-hover-fx { background: var(--neon-green) !important; color: #000 !important; }
                    .forum-sc-card:hover .btn-hover-fx { background: #fff !important; color: #000 !important; }
                    .comm-bg-glow { position: absolute; width: 600px; height: 600px; background: radial-gradient(circle, rgba(123,47,255,0.05) 0%, transparent 70%); top: 50%; left: 50%; transform: translate(-50%, -50%); pointer-events: none; }
                `}</style>
                <div className="comm-bg-glow"></div>
                <div className="comm-header">
                    <h2 className="comm-title">BEYOND <span>GENERATION</span></h2>
                    <p className="comm-desc" style={{ marginBottom: '60px' }}>Discover templates shared by others in our community, and read our blog for the latest guides on prompt engineering.</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))', gap: '30px', maxWidth: '1400px', margin: '0 auto' }}>
                    <div className="sc-card community-sc-card beyond-card" onClick={() => navigate('/community')} style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(160deg, #050505, #111)', border: '1px solid rgba(123,47,255,0.2)', borderRadius: '20px', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <div style={{ position: 'absolute', top: 0, right: 0, width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(123,47,255,0.15) 0%, transparent 70%)', transform: 'translate(30%, -30%)', borderRadius: '50%', zIndex: -1 }}></div>
                        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '3px', background: 'linear-gradient(90deg, transparent, var(--neon-purple), transparent)' }}></div>
                        <div className="beyond-badge" style={{ background: 'rgba(123,47,255,0.1)', border: '1px solid var(--neon-purple)', color: '#fff' }}>PROMPT FEED</div>
                        <Users className="beyond-icon" size={36} color="var(--neon-purple)" />
                        <h3 className="sc-title beyond-title">PromptQuill Community</h3>
                        <p className="sc-desc beyond-desc">Explore a dynamic feed of AI use-cases, validated structures, and prompt templates shared by the network. Discover new ways to use our different generation modes, upvote the best logic, and remix high-performing context windows built by other users.</p>
                        <button className="sc-btn btn-hover-fx beyond-btn" style={{ background: 'var(--neon-purple)', color: '#fff', border: 'none' }}>VIEW COMMUNITY <ArrowRight size={18} /></button>
                    </div>

                    <div className="sc-card blog-sc-card beyond-card" onClick={() => navigate('/blog')} style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(160deg, #050505, #111)', border: '1px solid rgba(168,255,62,0.2)', borderRadius: '20px', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(168,255,62,0.1) 0%, transparent 70%)', transform: 'translate(-30%, -30%)', borderRadius: '50%', zIndex: -1 }}></div>
                        <div style={{ position: 'absolute', bottom: 0, right: 0, width: '100%', height: '3px', background: 'linear-gradient(90deg, transparent, var(--neon-green), transparent)' }}></div>
                        <div className="beyond-badge" style={{ background: 'rgba(168,255,62,0.1)', border: '1px solid var(--neon-green)', color: 'var(--neon-green)' }}>KNOWLEDGE BASE</div>
                        <BookOpen className="beyond-icon" size={36} color="var(--neon-green)" />
                        <h3 className="sc-title beyond-title">Official Blog</h3>
                        <p className="sc-desc beyond-desc">Read our latest platform updates, feature releases, and in-depth guides. Learn step-by-step how to leverage PromptQuill's ecosystem to craft the perfect context windows for coding, startups, content creation, and creative workflows.</p>
                        <button className="sc-btn btn-hover-fx beyond-btn" style={{ background: 'transparent', border: '1px solid var(--neon-green)', color: 'var(--neon-green)' }}>READ ARTICLES <ArrowRight size={18} /></button>
                    </div>

                    <div className="sc-card forum-sc-card beyond-card" onClick={() => navigate('/forums')} style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(160deg, #050505, #111)', border: '1px solid rgba(0,240,255,0.2)', borderRadius: '20px', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(0,240,255,0.15) 0%, transparent 70%)', transform: 'translate(-30%, 30%)', borderRadius: '50%', zIndex: -1 }}></div>
                        <div style={{ position: 'absolute', top: 0, right: 0, width: '100%', height: '3px', background: 'linear-gradient(90deg, transparent, #00f0ff, transparent)' }}></div>
                        <div className="beyond-badge" style={{ background: 'rgba(0,240,255,0.1)', border: '1px solid #00f0ff', color: '#00f0ff' }}>DISCUSSIONS</div>
                        <MessageSquare className="beyond-icon" size={36} color="#00f0ff" />
                        <h3 className="sc-title beyond-title">Help Forums</h3>
                        <p className="sc-desc beyond-desc">Join the discussion! Connect with other creators, debug prompts together, ask for support, and share your most innovative workflows. Features dedicated categories for each generation mode, from startups to raw code architecture.</p>
                        <button className="sc-btn btn-hover-fx beyond-btn" style={{ background: 'transparent', border: '1px solid #00f0ff', color: '#00f0ff' }}>BROWSE FORUMS <ArrowRight size={18} /></button>
                    </div>
                </div>
            </section>

            <section className="how-it-works-section" style={{ padding: '100px 5%', background: '#050505' }}>
                <style>{`
                    @keyframes hqGridPan {
                        0% { background-position: 0 0; }
                        100% { background-position: 50px 50px; }
                    }
                    @keyframes hqTunnelDrive {
                        0% { background-position: 0 0; }
                        100% { background-position: -40px 0; }
                    }
                `}</style>
                <h2 className="blog-main-title" style={{ textAlign: 'center', marginBottom: '60px' }}>HOW IT <span>WORKS</span></h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '40px', maxWidth: '1400px', margin: '0 auto', paddingTop: '50px' }}>

                    <div style={{ position: 'relative' }} onMouseEnter={() => setHoverHIW(1)} onMouseLeave={() => setHoverHIW(null)}>
                        <div className="sc-card" style={{ transform: hoverHIW === 1 ? 'translateY(-10px)' : 'none', transition: 'all 0.4s', overflow: 'visible', padding: 0, zIndex: 2, position: 'relative', boxShadow: hoverHIW === 1 ? '0 20px 40px rgba(0,0,0,0.8)' : 'none', border: hoverHIW === 1 ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ width: '100%', height: '180px', position: 'relative', background: 'linear-gradient(45deg, #020202, #1a1a1a)', overflow: 'hidden', borderRadius: '15px 15px 0 0' }}>
                                <div style={{ width: '200%', height: '200%', position: 'absolute', top: '-50%', left: '-50%', backgroundImage: 'radial-gradient(circle at center, rgba(168,255,62,0.8) 1px, transparent 1px), linear-gradient(rgba(168,255,62,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(168,255,62,0.15) 1px, transparent 1px)', backgroundSize: '50px 50px, 25px 25px, 25px 25px', opacity: 0.8, animation: 'hqGridPan 2s linear infinite', transform: 'rotate(25deg) scale(1.2)' }}></div>
                                <div style={{ position: 'absolute', bottom: '15px', left: '15px', fontSize: '12px', color: '#A8FF3E', fontWeight: 'bold', letterSpacing: '2px', background: 'rgba(0,0,0,0.5)', padding: '5px 10px', borderRadius: '5px', backdropFilter: 'blur(5px)' }}>PHASE 01: INPUT</div>
                            </div>
                            {/* 3D character - sits in front, half overlapping the card boundary */}
                            <img src="/clay_chars/emoji_robot.png" alt="Robot" className="hiw-clay-char" style={{ position: 'absolute', right: '20px', top: '120px', width: '100px', height: '100px', zIndex: 20, filter: 'drop-shadow(0 8px 20px rgba(168,255,62,0.4))', transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)', transform: hoverHIW === 1 ? 'scale(1.3) rotate(-10deg)' : 'scale(1)', pointerEvents: 'none' }} />
                            <div style={{ padding: '30px' }}>
                                <h3 className="sc-title" style={{ fontSize: '32px' }}>Type your idea</h3>
                                <p className="sc-desc">Describe any idea — an app, a startup, a coding project, or a creative task. Two words or two paragraphs, PromptQuill handles both.</p>
                            </div>
                        </div>
                    </div>

                    <div style={{ position: 'relative' }} onMouseEnter={() => setHoverHIW(2)} onMouseLeave={() => setHoverHIW(null)}>
                        <div className="sc-card" style={{ transform: hoverHIW === 2 ? 'translateY(-10px)' : 'none', transition: 'all 0.4s', overflow: 'visible', padding: 0, zIndex: 2, position: 'relative', boxShadow: hoverHIW === 2 ? '0 20px 40px rgba(0,0,0,0.8)' : 'none', border: hoverHIW === 2 ? '1px solid rgba(168,255,62,0.4)' : '1px solid rgba(255,255,255,0.05)' }}>
                            <div className="hologram-effect" style={{ width: '100%', height: '180px', position: 'relative', background: 'linear-gradient(45deg, var(--neon-purple), #110033)', borderRadius: '15px 15px 0 0', overflow: 'hidden' }}>
                                <div className="b-holo-graph" style={{ opacity: 1, filter: 'hue-rotate(90deg)' }}></div>
                                <div style={{ position: 'absolute', bottom: '15px', left: '15px', fontSize: '12px', color: '#fff', fontWeight: 'bold', letterSpacing: '2px', background: 'rgba(0,0,0,0.5)', padding: '5px 10px', borderRadius: '5px', backdropFilter: 'blur(5px)' }}>PHASE 02: LOGIC ROUTING</div>
                            </div>
                            {/* 3D character - sits in front, half overlapping the card boundary */}
                            <img src="/clay_chars/emoji_brain.png" alt="Brain" className="hiw-clay-char" style={{ position: 'absolute', right: '20px', top: '120px', width: '100px', height: '100px', zIndex: 20, filter: 'drop-shadow(0 8px 20px rgba(123,47,255,0.5))', transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)', transform: hoverHIW === 2 ? 'scale(1.3) rotate(10deg)' : 'scale(1)', pointerEvents: 'none' }} />
                            <div style={{ padding: '30px' }}>
                                <h3 className="sc-title" style={{ fontSize: '32px' }}>Choose your mode</h3>
                                <p className="sc-desc">Select from 6 modes — General, Startup Pro, Startup Lite, Coding, Content, or Creative. Then toggle between Bot or Human voice.</p>
                            </div>
                        </div>
                    </div>

                    <div style={{ position: 'relative' }} onMouseEnter={() => setHoverHIW(3)} onMouseLeave={() => setHoverHIW(null)}>
                        <div className="sc-card" style={{ transform: hoverHIW === 3 ? 'translateY(-10px)' : 'none', transition: 'all 0.4s', overflow: 'visible', padding: 0, zIndex: 2, position: 'relative', boxShadow: hoverHIW === 3 ? '0 20px 40px rgba(0,0,0,0.8)' : 'none', border: hoverHIW === 3 ? '1px solid rgba(255,90,0,0.4)' : '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ width: '100%', height: '180px', position: 'relative', background: 'linear-gradient(45deg, var(--neon-orange), #330000)', overflow: 'hidden', borderRadius: '15px 15px 0 0' }}>
                                <div style={{ width: '100%', height: '100%', position: 'absolute', top: '0', left: '0', backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(255,90,0,0.2) 10px, rgba(255,90,0,0.5) 20px)', opacity: 0.9, animation: 'hqTunnelDrive 1s linear infinite' }}></div>
                                <div style={{ position: 'absolute', bottom: '15px', left: '15px', fontSize: '12px', color: '#FF5A00', fontWeight: 'bold', letterSpacing: '2px', background: 'rgba(0,0,0,0.5)', padding: '5px 10px', borderRadius: '5px', backdropFilter: 'blur(5px)' }}>PHASE 03: SYNTHESIS</div>
                            </div>
                            {/* 3D character - sits in front, half overlapping the card boundary */}
                            <img src="/clay_chars/emoji_rocket.png" alt="Rocket" className="hiw-clay-char" style={{ position: 'absolute', right: '20px', top: '120px', width: '100px', height: '100px', zIndex: 20, filter: 'drop-shadow(0 8px 20px rgba(255,90,0,0.5))', transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)', transform: hoverHIW === 3 ? 'scale(1.3) rotate(-15deg)' : 'scale(1)', pointerEvents: 'none' }} />
                            <div style={{ padding: '30px' }}>
                                <h3 className="sc-title" style={{ fontSize: '32px' }}>Get your brief</h3>
                                <p className="sc-desc">Your multi-tab brief generates in seconds. Each tab (Brief, Validate, Plan, Launch) is tailored to your exact input. Copy, export as PDF, or share via community.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="pricing-section" id="pricing" style={{ padding: '120px 5%', background: '#020202', position: 'relative', overflow: 'hidden' }}>
                <style>{`
                    @keyframes pricingGlowPulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
                    .pricing-glow-orb { position: absolute; width: 500px; height: 500px; border-radius: 50%; filter: blur(140px); pointer-events: none; animation: pricingGlowPulse 6s ease-in-out infinite; z-index: 1;}
                    
                    /* BANGER PRICING UI */
                    .pricing-bento { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; max-width: 1200px; margin: 0 auto; position: relative; z-index: 5; margin-top: 50px; }
                    
                    /* CREATIVE FREE TIER */
                    .free-tier-grid { grid-column: 1 / -1; display: grid; grid-template-columns: 1.5fr 1fr; gap: 30px; position: relative; z-index: 5; }
                    .ft-details { background: linear-gradient(145deg, #070707, #0f0f0f); border: 1px solid rgba(255,255,255,0.06); border-radius: 24px; padding: 40px 50px; position: relative; overflow: hidden; display: flex; flex-direction: column; justify-content: center; transition: 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
                    .ft-details:hover { border-color: rgba(255,255,255,0.15); transform: translateY(-5px); box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
                    .ft-status-line { position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: var(--neon-green); box-shadow: 0 0 20px var(--neon-green); }
                    
                    .ft-action { background: linear-gradient(135deg, rgba(168,255,62,0.08), rgba(0,0,0,0.8)); border: 1px solid rgba(168,255,62,0.3); border-radius: 24px; padding: 40px; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; overflow: hidden; text-align: center; transition: 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
                    .ft-action:hover { border-color: rgba(168,255,62,0.6); box-shadow: 0 20px 50px rgba(168,255,62,0.15); transform: translateY(-5px); }
                    .ft-glow { position: absolute; top: -50px; right: -50px; width: 250px; height: 250px; background: var(--neon-green); filter: blur(100px); opacity: 0.25; pointer-events: none; }
                    .ft-btn { background: #fff; color: #000; border: none; padding: 18px 45px; border-radius: 100px; font-weight: 900; font-size: 16px; letter-spacing: 1px; display: flex; align-items: center; gap: 12px; cursor: pointer; transition: 0.4s cubic-bezier(0.16, 1, 0.3, 1); box-shadow: 0 10px 20px rgba(0,0,0,0.3); z-index: 2; position: relative; margin-top: auto; }
                    .ft-btn:hover { transform: translateY(-4px) scale(1.03); box-shadow: 0 15px 30px rgba(168,255,62,0.4); background: var(--neon-green); }

                    .sub-card { background: linear-gradient(145deg, #070707, #130033); border: 1px solid rgba(123,47,255,0.5); border-radius: 24px; padding: 50px; position: relative; overflow: hidden; box-shadow: 0 30px 80px rgba(123,47,255,0.2), inset 0 0 50px rgba(123,47,255,0.1); display: flex; flex-direction: column; }
                    .sub-card::before { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(123,47,255,0.15) 0%, transparent 60%); animation: spinDome 20s linear infinite; pointer-events: none; }
                    @keyframes spinDome { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                    .sub-header { border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 30px; margin-bottom: 30px; position: relative; z-index: 2;}
                    .sub-title { font-size: 48px; font-family: 'Bebas Neue', sans-serif; color: #fff; line-height: 1; letter-spacing: 2px; }
                    .sub-desc { color: #aaa; font-size: 15px; margin-top: 10px; }
                    .sub-price-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; position: relative; z-index: 2;}
                    .sub-price-box { border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.6); backdrop-filter: blur(10px); border-radius: 16px; padding: 25px; cursor: pointer; transition: 0.3s; position: relative; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; }
                    .sub-price-box:hover { border-color: var(--neon-purple); background: rgba(123,47,255,0.1); transform: translateY(-5px); box-shadow: 0 15px 30px rgba(123,47,255,0.2); }
                    .spb-popular { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: var(--neon-purple); color: #fff; font-size: 10px; font-weight: 900; padding: 4px 14px; border-radius: 20px; letter-spacing: 1.5px; box-shadow: 0 5px 15px rgba(123,47,255,0.4); }

                    .credit-rack { display: flex; flex-direction: column; gap: 20px; position: relative; z-index: 2;}
                    .rack-module { background: #050505; border: 1px solid rgba(255,255,255,0.05); border-left: 4px solid #333; border-radius: 16px; padding: 30px; display: flex; align-items: center; justify-content: space-between; transition: 0.4s cubic-bezier(0.16, 1, 0.3, 1); cursor: pointer; position: relative; overflow: hidden; }
                    .rack-module:hover { background: #0a0a0a; border-left-color: var(--neon-green); border-top-color: rgba(168,255,62,0.2); border-right-color: rgba(168,255,62,0.2); border-bottom-color: rgba(168,255,62,0.2); transform: translateX(10px); box-shadow: 0 20px 40px rgba(0,0,0,0.8); }
                    .rm-left { display: flex; flex-direction: column; gap: 6px; }
                    .rm-title { font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 800; color: #777; letter-spacing: 2px; transition: 0.3s; }
                    .rack-module:hover .rm-title { color: var(--neon-green); }
                    .rm-credits { font-size: 32px; font-family: 'Bebas Neue', sans-serif; color: #fff; letter-spacing: 1px; line-height: 1; margin: 5px 0;}
                    .rm-right { display: flex; align-items: center; gap: 25px; }
                    .rm-price { font-size: 24px; font-weight: 800; color: #ddd; }
                    .rm-btn { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.1); color: #888; width: 45px; height: 45px; border-radius: 50%; display: flex; justify-content: center; align-items: center; transition: 0.4s; }
                    .rack-module:hover .rm-btn { background: var(--neon-green); color: #000; border-color: var(--neon-green); transform: rotate(-45deg); }

                    .price-sub-feature { display: flex; align-items: flex-start; gap: 15px; color: #bbb; font-size: 15px; line-height: 1.5; padding: 5px 0; position: relative; z-index: 2;}

                    @media (max-width: 900px) {
                        .pricing-bento { grid-template-columns: 1fr; }
                    }
                    @media (max-width: 768px) {
                        .free-tier-grid { grid-template-columns: 1fr; gap: 20px; }
                        .ft-details { padding: 35px 25px; }
                        .ft-action { padding: 35px 25px; }
                        .sub-price-grid { grid-template-columns: 1fr; }
                        .rack-module { flex-direction: column; align-items: flex-start; gap: 20px; }
                        .rm-right { width: 100%; justify-content: space-between; }
                    }
                `}</style>
                <div className="pricing-glow-orb" style={{ background: 'rgba(123,47,255,0.05)', top: '10%', left: '10%' }}></div>
                <div className="pricing-glow-orb" style={{ background: 'rgba(168,255,62,0.05)', bottom: '10%', right: '10%', animationDelay: '3s' }}></div>

                <div style={{ textAlign: 'center', marginBottom: '70px', position: 'relative', zIndex: 2 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 20px', background: 'rgba(168,255,62,0.08)', border: '1px solid rgba(168,255,62,0.2)', borderRadius: '30px', fontSize: '12px', color: 'var(--neon-green)', fontWeight: '700', letterSpacing: '2px', marginBottom: '25px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--neon-green)', animation: 'pricingGlowPulse 2s infinite' }}></span>
                        TRANSPARENT PRICING
                    </div>
                    <h2 className="blog-main-title" style={{ marginBottom: '20px' }}>INVEST IN YOUR <span>INTELLIGENCE</span></h2>
                    <p style={{ color: '#666', fontSize: '16px', maxWidth: '550px', margin: '0 auto', lineHeight: '1.7' }}>Scale your workflow with Unlimited Pro, or buy on-demand generation credits that never expire.</p>

                    <div style={{ marginTop: '35px', display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '10px 25px', background: 'rgba(255,255,255,0.02)', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ color: '#888', fontSize: '13px', letterSpacing: '1px' }}>CURRENCY MODE</span>
                        <strong style={{ color: 'var(--neon-green)', fontSize: '22px', minWidth: '20px', textAlign: 'center', transition: 'all 0.3s' }}>{currency}</strong>
                        <span style={{ color: '#555', fontSize: '11px' }}>(INR/USD Auto Switch)</span>
                    </div>
                </div>

                <div className="pricing-bento">
                    {/* CREATIVE FREE BANNER */}
                    <div className="free-tier-grid">
                        <div className="ft-details">
                            <div className="ft-status-line"></div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--neon-green)', animation: 'pricingGlowPulse 2s infinite' }}></div>
                                <div style={{ color: 'var(--neon-green)', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', fontWeight: '800', letterSpacing: '2px' }}>BASIC ACCESS: GRANTED</div>
                            </div>

                            <h3 className="ft-main-title" style={{ fontSize: '46px', fontFamily: '"Bebas Neue", sans-serif', color: '#fff', margin: '0 0 12px 0', letterSpacing: '1px', lineHeight: '1.1' }}>THE FOREVER FREE ENGINE</h3>
                            <p style={{ color: '#999', margin: 0, fontSize: '15px', lineHeight: '1.6', maxWidth: '420px' }}>10 generations (100 credits) injected into your vault every single day. Perfect for prototyping without ever attaching a card.</p>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '30px' }}>
                                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '6px 14px', borderRadius: '10px', color: '#aaa', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}><Cpu size={14} color="var(--neon-green)" /> 5 Core Modes</div>
                                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '6px 14px', borderRadius: '10px', color: '#aaa', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}><Zap size={14} color="var(--neon-green)" /> 100 Daily Credits</div>
                                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '6px 14px', borderRadius: '10px', color: '#aaa', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}><Users size={14} color="var(--neon-green)" /> Community Access</div>
                            </div>
                        </div>

                        <div className="ft-action">
                            <div className="ft-glow"></div>

                            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ fontSize: '72px', fontFamily: '"Bebas Neue", sans-serif', color: '#fff', lineHeight: '1', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', textShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 2 }}>
                                    <span style={{ fontSize: '32px', color: 'var(--neon-green)', marginTop: '8px', marginRight: '6px' }}>{currency}</span>
                                    0
                                </div>
                                <div style={{ color: 'var(--neon-green)', fontSize: '13px', fontWeight: '800', letterSpacing: '1.5px', marginBottom: '25px', zIndex: 2 }}>FOREVER ZERO COST</div>
                            </div>

                            <button className="ft-btn" onClick={onAuthClick}>
                                INITIALIZE FREE
                                <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>

                    {/* SUBSCRIPTION COLUMN */}
                    <div className="sub-card">
                        <div className="sub-header">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div className="sub-title">UNLIMITED PRO</div>
                                <div className="premium-badge" style={{ background: 'rgba(123,47,255,0.2)', color: 'var(--neon-purple)', padding: '5px 15px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', border: '1px solid rgba(123,47,255,0.4)', backdropFilter: 'blur(5px)' }}>PREMIUM ACCESS</div>
                            </div>
                            <div className="sub-desc">The ultimate pipeline with unlimited generations and 300 credits per day.</div>
                        </div>

                        <div className="sub-price-grid">
                            <button onClick={() => handlePricingCheckout('pro_monthly')} style={{ textDecoration: 'none', color: 'inherit', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                                <div className="sub-price-box" style={{ width: '100%' }}>
                                    <div style={{ color: '#999', fontSize: '13px', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Billed Monthly</div>
                                    <div style={{ fontSize: '36px', fontWeight: '900', color: '#fff' }}>{currency}{currency === '₹' ? '499' : '5.99'}</div>
                                    <div style={{ color: '#666', fontSize: '12px', marginTop: '5px' }}>/month</div>
                                </div>
                            </button>
                            <button onClick={() => handlePricingCheckout('pro_yearly')} style={{ textDecoration: 'none', color: 'inherit', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                                <div className="sub-price-box" style={{ borderColor: 'rgba(123,47,255,0.5)', background: 'rgba(123,47,255,0.08)', width: '100%' }}>
                                    <div className="spb-popular">SAVE 30%</div>
                                    <div style={{ color: 'var(--neon-purple)', fontSize: '13px', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Billed Annually</div>
                                    <div style={{ fontSize: '36px', fontWeight: '900', color: '#fff' }}>{currency}{currency === '₹' ? '4,199' : '49.99'}</div>
                                    <div style={{ color: '#aaa', fontSize: '12px', marginTop: '5px' }}>≈ {currency}{currency === '₹' ? '350' : '4.17'} /month</div>
                                </div>
                            </button>
                        </div>

                        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div className="price-sub-feature"><CheckCircle2 size={20} color="var(--neon-purple)" style={{ flexShrink: 0 }} /> <span style={{ color: '#fff', fontWeight: 'bold' }}>Unlimited generations (300 credits/day)</span></div>
                            <div className="price-sub-feature"><CheckCircle2 size={20} color="var(--neon-purple)" style={{ flexShrink: 0 }} /> All 6 AI modes (including Startup Pro)</div>
                            <div className="price-sub-feature"><CheckCircle2 size={20} color="var(--neon-purple)" style={{ flexShrink: 0 }} /> Full community access & posting</div>
                            <div className="price-sub-feature"><CheckCircle2 size={20} color="var(--neon-purple)" style={{ flexShrink: 0 }} /> Clean share cards (no watermark)</div>
                            <div className="price-sub-feature"><CheckCircle2 size={20} color="var(--neon-purple)" style={{ flexShrink: 0 }} /> PDF + Cursor exports</div>
                            <div className="price-sub-feature"><CheckCircle2 size={20} color="var(--neon-purple)" style={{ flexShrink: 0 }} /> Full Reddit Validator & Score insights</div>
                        </div>
                    </div>

                    {/* CREDIT PACKS COLUMN */}
                    <div className="credit-rack">
                        <div style={{ marginBottom: '10px', paddingLeft: '10px' }}>
                            <h3 style={{ fontSize: '28px', color: '#fff', margin: '0 0 5px 0', fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '1.5px' }}>PAY-AS-YOU-GO CREDITS</h3>
                            <p style={{ color: '#888', fontSize: '14px', margin: 0, lineHeight: '1.5' }}>Tokens that never expire. Inject them into your vault whenever you need high-capacity architectural briefs.</p>
                        </div>

                        <button onClick={() => handlePricingCheckout('credits_49')} style={{ textDecoration: 'none', color: 'inherit', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                            <div className="rack-module" style={{ width: '100%' }}>
                                <div className="rm-left">
                                    <div className="rm-title">STARTER PACK</div>
                                    <div className="rm-credits">5 CREDITS</div>
                                    <div style={{ fontSize: '13px', color: '#666' }}>Up to 5 standard generations</div>
                                </div>
                                <div className="rm-right">
                                    <div className="rm-price">{currency}{currency === '₹' ? '49' : '0.59'}</div>
                                    <div className="rm-btn"><ArrowRight size={20} /></div>
                                </div>
                            </div>
                        </button>

                        <button onClick={() => handlePricingCheckout('credits_99')} style={{ textDecoration: 'none', color: 'inherit', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                            <div className="rack-module" style={{ borderLeftColor: '#A8FF3E', width: '100%' }}>
                                <div className="rm-left">
                                    <div className="rm-title" style={{ color: '#A8FF3E' }}>GROWTH PACK</div>
                                    <div className="rm-credits">15 CREDITS</div>
                                    <div style={{ fontSize: '13px', color: '#666' }}>Community feed + Reddit validator</div>
                                </div>
                                <div className="rm-right">
                                    <div className="rm-price">{currency}{currency === '₹' ? '99' : '1.19'}</div>
                                    <div className="rm-btn" style={{ borderColor: 'rgba(168,255,62,0.4)', color: 'var(--neon-green)' }}><ArrowRight size={20} /></div>
                                </div>
                            </div>
                        </button>

                        <button onClick={() => handlePricingCheckout('credits_249')} style={{ textDecoration: 'none', color: 'inherit', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                            <div className="rack-module" style={{ borderLeftColor: '#FF5A00', background: 'linear-gradient(90deg, rgba(255,90,0,0.05), #050505 50%)', width: '100%' }}>
                                <div className="rm-left">
                                    <div className="rm-title" style={{ color: '#FF5A00' }}>PROFESSIONAL PACK</div>
                                    <div className="rm-credits">50 CREDITS</div>
                                    <div style={{ fontSize: '13px', color: '#666' }}>Clean cards + PDF export + PRO mode</div>
                                </div>
                                <div className="rm-right">
                                    <div className="rm-price" style={{ color: '#fff' }}>{currency}{currency === '₹' ? '249' : '2.99'}</div>
                                    <div className="rm-btn" style={{ borderColor: 'rgba(255,90,0,0.4)', color: '#FF5A00' }}><ArrowRight size={20} /></div>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '70px', position: 'relative', zIndex: 2 }}>
                    <p style={{ color: '#444', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2px' }}>Secure payments via <strong style={{ color: '#777' }}>your provider</strong></p>
                </div>
            </section>

            <section className="anatomy-section cta-section" style={{ minHeight: '50vh', padding: '100px 0', borderTop: '1px solid #111' }}>
                <div className="hero-center-titles">
                    <h2 className="hero-title cta-title">Stop describing.<br /><span style={{ color: 'var(--neon-green)' }}>Start generating.</span></h2>
                    <p className="hero-subtitle bottom-subtitle" style={{ color: '#888' }}>6 modes. Bot & Human voice. Multi-tab AI briefs in seconds.</p>
                    <div className="hero-input-area" style={{ marginTop: '40px' }}>
                        <input type="text" className="hero-input" placeholder="Type your idea and press Enter..." value={heroInput} onChange={(e) => setHeroInput(e.target.value)} />
                        <button className="hero-btn" onClick={handleHeroSubmit}><ArrowRight size={24} /></button>
                    </div>
                    <p className="cta-footnote" style={{ color: '#555', fontSize: '13px', marginTop: '15px' }}>10 free generations daily · No credit card required</p>
                </div>
            </section>

            {/* CRAZY FOOTER MARQUEE */}
            <div className="footer-marquee" style={{ background: 'var(--neon-green)', padding: '15px 0', overflow: 'hidden' }}>
                <marquee scrollamount="15" style={{ color: '#000', fontWeight: '900', fontSize: '24px', letterSpacing: '4px', textTransform: 'uppercase', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    <span style={{ opacity: 0.3 }}>✦</span> 6 AI MODES <span style={{ opacity: 0.3 }}>✦</span> BOT & HUMAN VOICE <span style={{ opacity: 0.3 }}>✦</span> MULTI-TAB BRIEFS <span style={{ opacity: 0.3 }}>✦</span> PDF & CURSOR EXPORT <span style={{ opacity: 0.3 }}>✦</span> REDDIT VALIDATOR <span style={{ opacity: 0.3 }}>✦</span> COMMUNITY FORUMS <span style={{ opacity: 0.3 }}>✦</span> COMMUNITY FEED <span style={{ opacity: 0.3 }}>✦</span> 10 FREE DAILY <span style={{ opacity: 0.3 }}>✦</span> RAZORPAY PAYMENTS <span style={{ opacity: 0.3 }}>✦</span> START GENERATING TODAY
                </marquee>
            </div>

            <footer className="dashboard-footer" style={{ borderTop: '1px solid #1a1a1a', padding: '80px 5% 40px', background: '#000', position: 'relative', zIndex: 10 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', maxWidth: '1200px', margin: '0 auto', marginBottom: '60px' }}>
                    <div style={{ flex: '2 1 350px', opacity: 0.9 }}>
                        <div className="d-logo" style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontSize: '9px', letterSpacing: '2px', color: '#555', textTransform: 'uppercase', fontWeight: '600' }}></span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div className="d-logo-icon"></div>
                                <span style={{ fontSize: '18px', fontWeight: '700', color: '#9bff5dff' }}>PromptQuill</span>
                            </div>
                        </div>
                        <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6', maxWidth: '280px' }}>AI prompt engineering engine with 6 generation modes, Bot & Human voice toggle, and multi-tab briefs. 10 free generations daily.</p>
                    </div>
                    <div style={{ flex: '1 1 150px' }}>
                        <h4 style={{ color: '#fff', fontSize: '16px', marginBottom: '20px', fontWeight: 'bold' }}>Platform</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <li><a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ color: '#888', textDecoration: 'none', transition: 'color 0.2s' }}>Home</a></li>
                            <li><a href="#" onClick={(e) => { e.preventDefault(); document.querySelector('.folder-section')?.scrollIntoView({ behavior: 'smooth' }); }} style={{ color: '#888', textDecoration: 'none', transition: 'color 0.2s' }}>All Modes</a></li>
                            <li><a href="#" onClick={(e) => { e.preventDefault(); document.querySelector('.pricing-section')?.scrollIntoView({ behavior: 'smooth' }); }} style={{ color: '#888', textDecoration: 'none', transition: 'color 0.2s' }}>Pricing</a></li>
                        </ul>
                    </div>
                    <div style={{ flex: '1 1 150px' }}>
                        <h4 style={{ color: '#fff', fontSize: '16px', marginBottom: '20px', fontWeight: 'bold' }}>Resources</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('/community'); }} style={{ color: '#888', textDecoration: 'none', transition: 'color 0.2s' }}>Community Network</a></li>
                            <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('/forums'); }} style={{ color: '#888', textDecoration: 'none', transition: 'color 0.2s' }}>Forums</a></li>
                            <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('/blog'); }} style={{ color: '#888', textDecoration: 'none', transition: 'color 0.2s' }}>Official Blog</a></li>
                            <li><a href="#" onClick={(e) => { e.preventDefault(); onAuthClick(); }} style={{ color: '#888', textDecoration: 'none', transition: 'color 0.2s' }}>Dashboard Access</a></li>
                        </ul>
                    </div>
                    <div style={{ flex: '1 1 150px' }}>
                        <h4 style={{ color: '#fff', fontSize: '16px', marginBottom: '20px', fontWeight: 'bold' }}>Legal</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <li><a href="/privacy" onClick={(e) => { e.preventDefault(); navigate('/privacy'); }} style={{ color: '#888', textDecoration: 'none', transition: 'color 0.2s', cursor: 'pointer' }}>Privacy Policy</a></li>
                            <li><a href="/terms" onClick={(e) => { e.preventDefault(); navigate('/terms'); }} style={{ color: '#888', textDecoration: 'none', transition: 'color 0.2s', cursor: 'pointer' }}>Terms of Service</a></li>
                            <li><a href="/cookies" onClick={(e) => { e.preventDefault(); navigate('/cookies'); }} style={{ color: '#888', textDecoration: 'none', transition: 'color 0.2s', cursor: 'pointer' }}>Cookie Policy</a></li>
                        </ul>
                    </div>
                </div>
                <div style={{ borderTop: '1px solid #111', paddingTop: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ color: '#444', fontSize: '14px' }}>&copy; 2026 PromptQuill. Open source. MIT License.</div>
                    <div style={{ color: '#444', fontSize: '13px' }}>Built with Supabase</div>
                </div>
            </footer>

        </div>
    );
};

export default LandingPage;
