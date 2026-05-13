import React, { useState, useEffect } from 'react';
import { Share2, Download, Copy, ExternalLink, ArrowLeft, Sparkles, Calendar, Eye, Share, Send, MessageSquare, Globe } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import SEO from '../components/SEO';

const PromptSharePage = () => {
  const navigate = useNavigate();
  const { promptId } = useParams();
  const [prompt, setPrompt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    console.log('🔵 PromptSharePage mounted with promptId:', promptId);
    fetchPrompt();
  }, [promptId]);

  const fetchPrompt = async () => {
    try {
      console.log('🔍 Fetching prompt with ID:', promptId);
      
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', promptId)
        .single();

      if (data) {
        console.log('📊 === DATABASE FIELDS ===');
        console.log('title:', data.title);
        console.log('input_text:', data.input_text);
        console.log('final_prompt type:', typeof data.final_prompt);
        console.log('final_prompt length:', data.final_prompt?.length);
        if (typeof data.final_prompt === 'string' && data.final_prompt.length < 500) {
          console.log('final_prompt content:', data.final_prompt);
        } else if (typeof data.final_prompt === 'string') {
          console.log('final_prompt (first 500 chars):', data.final_prompt.substring(0, 500));
        }
        console.log('score:', data.score);
        console.log('mode:', data.mode);
        console.log('All fields:', Object.keys(data));
      }

      if (error) {
        console.error('Database error:', error);
        navigate('/');
        return;
      }

      if (!data) {
        console.error('No data found for prompt ID:', promptId);
        navigate('/');
        return;
      }

      console.log('✅ Prompt loaded successfully');
      setPrompt(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching prompt:', err);
      navigate('/');
    }
  };

  const shareToSocial = (platform) => {
    if (!prompt?.title) {
      console.log('❌ Title missing:', prompt?.title);
      alert('Waiting for prompt data to load...');
      return;
    }

    const title = prompt.title || 'Check out my AI prompt!';
    const description = (prompt?.final_prompt || prompt?.input_text || '').substring(0, 80) + '...';
    const url = window.location.href;

    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${title}\n\n${url}\n\nCreated with PromptQuill 🚀`)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(`${title}\n${description}\n${url}`)}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`${title}\n${description}`)}`;
        break;
      default:
        return;
    }

    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const copyToClipboard = () => {
    let contentToCopy = prompt?.title || 'Prompt';
    
    // Try to extract action brief from final_prompt
    try {
      if (prompt?.final_prompt) {
        let parsedBrief = null;
        
        if (typeof prompt.final_prompt === 'string' && prompt.final_prompt.includes('{')) {
          try {
            parsedBrief = JSON.parse(prompt.final_prompt);
          } catch (e) {
            // Fallback
          }
        } else if (typeof prompt.final_prompt === 'object') {
          parsedBrief = prompt.final_prompt;
        }
        
        if (parsedBrief?.tabs?.action_brief) {
          contentToCopy = parsedBrief.tabs.action_brief;
        } else if (parsedBrief?.action_brief) {
          contentToCopy = parsedBrief.action_brief;
        }
      }
    } catch (e) {
      // Use default
    }
    
    navigator.clipboard.writeText(contentToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <Sparkles className="w-8 h-8 text-lime-400 animate-spin" style={{ marginBottom: '16px' }} />
        <p style={{ color: '#888', fontSize: '14px' }}>Loading prompt {promptId}...</p>
      </div>
    );
  }

  if (!prompt) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#888' }}>
        <p>Prompt not found</p>
        <p style={{ fontSize: '12px', marginTop: '8px', color: '#666' }}>ID: {promptId}</p>
        <button 
          onClick={() => navigate('/')}
          style={{ marginTop: '16px', padding: '8px 16px', backgroundColor: '#a3e635', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Go Home
        </button>
      </div>
    );
  }

  const score = prompt?.score || 0;

  return (
    <>
      <SEO 
        title={`${prompt.title || 'Prompt'} | PromptQuill`}
        description={prompt.content?.substring(0, 120)}
        image="/og-image.png"
      />
      
      <div style={{ minHeight: '100vh', width: '100%', backgroundColor: '#080808', color: '#fff', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Background Video */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
        >
          <source src="https://res.cloudinary.com/dfonotyfb/video/upload/v1775585556/dds3_1_rqhg7x.mp4" type="video/mp4" />
        </video>

        {/* Premium Dark Gradient Overlay */}
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.7) 100%)', zIndex: 1, pointerEvents: 'none' }} />
        
        {/* Additional Radial Gradient for Depth */}
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(ellipse at center, rgba(163,230,53,0.05) 0%, transparent 70%)', zIndex: 1, pointerEvents: 'none' }} />

        {/* Animated Stars Field */}
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 2, pointerEvents: 'none' }}>
          {[...Array(60)].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: Math.random() * 2 + 'px',
                height: Math.random() * 2 + 'px',
                backgroundColor: '#a3e635',
                borderRadius: '50%',
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                opacity: Math.random() * 0.8 + 0.2,
                animation: `twinkle ${Math.random() * 3 + 2}s infinite`,
              }}
            />
          ))}
        </div>

        {/* Animated Background Particles */}
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 3 }}>
          {[...Array(12)].map((_, i) => (
            <div
              key={`particle-${i}`}
              style={{
                position: 'absolute',
                width: Math.random() * 2 + 1 + 'px',
                height: Math.random() * 2 + 1 + 'px',
                backgroundColor: '#a3e635',
                borderRadius: '50%',
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                opacity: Math.random() * 0.3 + 0.1,
                animation: `float ${Math.random() * 20 + 15}s linear infinite`,
                animationDelay: Math.random() * 5 + 's'
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px', position: 'relative', zIndex: 10, width: '100%' }}>
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#888',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              padding: 0,
              marginBottom: '40px'
            }}
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </button>

          {/* Tags */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
            <span style={{ padding: '6px 16px', backgroundColor: 'rgba(163,230,53,0.1)', border: '1px solid rgba(163,230,53,0.2)', borderRadius: '100px', color: '#a3e635', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {prompt?.mode || 'GENERAL'}
            </span>
            <span style={{ padding: '6px 16px', backgroundColor: 'rgba(163,230,53,0.05)', border: '1px solid rgba(163,230,53,0.15)', borderRadius: '100px', color: '#a3e635', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
              SCORE: {score}/10
            </span>
          </div>

          {/* Title */}
          <h1 style={{ fontSize: '48px', fontWeight: '900', letterSpacing: '-1px', lineHeight: '1.2', marginBottom: '24px', backgroundImage: 'linear-gradient(120deg, #a3e635, #84cc16, #a3e635)', backgroundSize: '200% 200%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            {prompt?.title || 'Untitled Prompt'}
          </h1>

          {/* Metadata */}
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center', color: '#666', fontSize: '13px', fontWeight: '600', marginBottom: '48px', paddingBottom: '32px', borderBottom: '1px solid #1a1a1a', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={14} />
              {prompt?.created_at ? new Date(prompt.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Unknown date'}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Eye size={14} />
              {prompt?.views || 0} views
            </span>
          </div>

          {/* Content Preview */}
          <div style={{ backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '16px', padding: '32px', marginBottom: '40px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#a3e635', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>Action Brief</h3>
            <p style={{ fontSize: '15px', lineHeight: '1.8', color: '#ccc', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {(() => {
                try {
                  // Try to parse final_prompt as JSON to extract action_brief
                  if (prompt?.final_prompt) {
                    let parsedBrief = null;
                    
                    // Try parsing as JSON
                    if (typeof prompt.final_prompt === 'string' && prompt.final_prompt.includes('{')) {
                      try {
                        parsedBrief = JSON.parse(prompt.final_prompt);
                      } catch (e) {
                        // If JSON parsing fails, treat as plain text
                        parsedBrief = null;
                      }
                    } else if (typeof prompt.final_prompt === 'object') {
                      parsedBrief = prompt.final_prompt;
                    }
                    
                    // Extract action_brief from tabs or root level
                    if (parsedBrief) {
                      // Try tabs.action_brief first
                      if (parsedBrief.tabs?.action_brief) {
                        return parsedBrief.tabs.action_brief;
                      }
                      // Try action_brief at root
                      if (parsedBrief.action_brief) {
                        return parsedBrief.action_brief;
                      }
                      // If nothing found, show raw final_prompt as fallback
                      if (typeof prompt.final_prompt === 'string' && !prompt.final_prompt.includes('{')) {
                        return prompt.final_prompt;
                      }
                    }
                  }
                  
                  // Final fallback to input_text
                  return prompt?.input_text || 'No action brief available';
                } catch (e) {
                  console.error('Error parsing brief:', e);
                  return prompt?.input_text || 'Error loading content';
                }
              })()}
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '60px' }}>
            <button
              onClick={copyToClipboard}
              style={{
                padding: '14px 24px',
                backgroundColor: '#a3e635',
                color: '#000',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.3s ease',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#9dd326';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 24px rgba(163, 230, 53, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#a3e635';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <Copy size={16} />
              {copied ? 'Copied!' : 'Copy'}
            </button>

            <button
              onClick={() => shareToSocial('twitter')}
              style={{
                padding: '14px 24px',
                backgroundColor: 'transparent',
                color: '#1DA1F2',
                border: '1px solid rgba(29, 161, 242, 0.3)',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.3s ease',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = '#1DA1F2';
                e.target.style.backgroundColor = 'rgba(29, 161, 242, 0.1)';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 24px rgba(29, 161, 242, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = 'rgba(29, 161, 242, 0.3)';
                e.target.style.backgroundColor = 'transparent';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <Share2 size={16} />
              Twitter
            </button>
          </div>

          {/* Social Grid */}
          <div style={{ marginBottom: '60px' }}>
            <p style={{ fontSize: '11px', fontWeight: '800', color: '#666', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>Share on</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {[
                { name: 'LinkedIn', icon: Globe, platform: 'linkedin', color: '#0A66C2' },
                { name: 'Facebook', icon: Share2, platform: 'facebook', color: '#1877F2' },
                { name: 'WhatsApp', icon: Send, platform: 'whatsapp', color: '#25D366' },
                { name: 'Telegram', icon: MessageSquare, platform: 'telegram', color: '#0088cc' }
              ].map((social) => {
                const IconComponent = social.icon;
                return (
                  <button
                    key={social.platform}
                    onClick={() => shareToSocial(social.platform)}
                    style={{
                      padding: '14px 16px',
                      backgroundColor: 'rgba(0, 0, 0, 0.4)',
                      border: `1px solid ${social.color}40`,
                      borderRadius: '10px',
                      color: social.color,
                      fontWeight: '700',
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.3s ease',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = social.color;
                      e.target.style.backgroundColor = social.color + '15';
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = `0 8px 24px ${social.color}30`;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.borderColor = social.color + '40';
                      e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <IconComponent size={18} />
                    {social.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer CTA - Like Blog Page */}
          <div style={{ marginTop: '80px', padding: '40px', backgroundColor: '#0d0d0d', borderRadius: '20px', border: '1px solid #1a1a1a', textAlign: 'center' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '12px', color: '#fff' }}>Love this prompt?</h3>
            <p style={{ color: '#888', fontSize: '15px', marginBottom: '24px' }}>Generate more amazing prompts with PromptQuill and get instant AI-powered insights.</p>
            <button 
              onClick={() => navigate('/ai')}
              style={{ 
                padding: '14px 32px', 
                backgroundColor: '#a3e635', 
                border: 'none', 
                borderRadius: '100px', 
                color: '#000', 
                fontWeight: '800', 
                fontSize: '14px', 
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#9dd326'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#a3e635'}
            >
              Try PromptQuill Free
            </button>
          </div>
        </div>

        <style>{`
          @keyframes float {
            0% {
              transform: translateY(0) translateX(0);
              opacity: 0;
            }
            10% {
              opacity: 0.3;
            }
            90% {
              opacity: 0.3;
            }
            100% {
              transform: translateY(-100vh) translateX(100px);
              opacity: 0;
            }
          }
        `}</style>
      </div>
    </>
  );
};

export default PromptSharePage;
