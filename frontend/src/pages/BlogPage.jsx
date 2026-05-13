import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Calendar, Clock, Tag, ChevronRight } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import PageLoadingSkeleton from '../components/PageLoadingSkeleton';
import SEO from '../components/SEO';

const BlogPage = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [posts, setPosts] = useState([]);
  const [activePost, setActivePost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchPost(slug);
    } else {
      fetchPosts();
    }
  }, [slug]);

  const fetchPosts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });
    setPosts(data || []);
    setActivePost(null);
    setLoading(false);
  };

  const fetchPost = async (postSlug) => {
    setLoading(true);
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', postSlug)
      .eq('is_published', true)
      .single();
    setActivePost(data);
    setLoading(false);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    const days = Math.floor(seconds / 86400);
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return formatDate(date);
  };

  const readingTime = (content) => {
    const words = (content || '').split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  };

  const renderMarkdown = (text) => {
    if (!text) return '';
    let html = text
      .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h2>$1</h2>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code style="background:#1a1a1a;padding:2px 6px;border-radius:4px;font-size:13px">$1</code>')
      .replace(/^> (.+)$/gm, '<blockquote style="border-left:3px solid #a3e635;padding-left:16px;color:#888;margin:16px 0">$1</blockquote>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;border-radius:12px;margin:24px 0" />')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#a3e635;text-decoration:underline">$1</a>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br/>');
    html = html.replace(/((?:<li>.*?<\/li><br\/>?)+)/g, '<ul style="padding-left:20px;margin:12px 0">$1</ul>');
    return `<p>${html}</p>`;
  };

  // ─── Single Post View ───
  if (activePost) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#080808', color: '#fff' }}>
        <SEO
          title={activePost.title}
          description={activePost.excerpt || `Read the latest insights on ${activePost.title}.`}
          url={`/blog/${activePost.slug}`}
          image={activePost.cover_image}
          type="article"
        />
        {/* Header */}
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>
          <button onClick={() => navigate('/blog')} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#888', fontSize: '13px', fontWeight: '700', cursor: 'pointer', background: 'none', border: 'none', padding: 0, marginBottom: '40px' }}>
            <ArrowLeft size={14} /> Back to Blog
          </button>

          {activePost.cover_image && (
            <div style={{ width: '100%', height: '400px', borderRadius: '20px', overflow: 'hidden', marginBottom: '40px' }}>
              <img src={activePost.cover_image} alt={activePost.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
            {(activePost.tags || []).map((tag, i) => (
              <span key={i} style={{ padding: '4px 12px', backgroundColor: 'rgba(163,230,53,0.1)', border: '1px solid rgba(163,230,53,0.2)', borderRadius: '100px', color: '#a3e635', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>{tag}</span>
            ))}
          </div>

          <h1 style={{ fontSize: '42px', fontWeight: '900', letterSpacing: '-2px', lineHeight: '1.2', marginBottom: '20px' }}>{activePost.title}</h1>

          <div style={{ display: 'flex', gap: '24px', alignItems: 'center', color: '#666', fontSize: '13px', fontWeight: '600', marginBottom: '48px', paddingBottom: '32px', borderBottom: '1px solid #1a1a1a' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} /> {formatDate(activePost.created_at)}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14} /> {readingTime(activePost.content)} min read</span>
          </div>

          {/* Content */}
          <div
            className="markdown-content"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(activePost.content) }}
            style={{ fontSize: '17px', lineHeight: '1.8', color: '#ccc' }}
          />

          {/* Footer CTA */}
          <div style={{ marginTop: '80px', padding: '40px', backgroundColor: '#0d0d0d', borderRadius: '20px', border: '1px solid #1a1a1a', textAlign: 'center' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '12px' }}>Ready to build something?</h3>
            <p style={{ color: '#888', fontSize: '15px', marginBottom: '24px' }}>Turn your idea into a structured brief in seconds.</p>
            <button onClick={() => navigate('/ai')} style={{ padding: '14px 32px', backgroundColor: '#a3e635', border: 'none', borderRadius: '100px', color: '#000', fontWeight: '800', fontSize: '14px', cursor: 'pointer' }}>
              Try Prompt Quill Free
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Blog List View ───
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#080808', color: '#fff' }}>
      <SEO
        title="Prompt Engineering Tips & AI Blog"
        description="Read top guides on prompt engineering for beginners and see the best ChatGPT prompts of 2026."
        url="/blog"
      />
      {/* CINEMATIC HERO SECTION */}
      <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
        >
          <source src="https://res.cloudinary.com/dfonotyfb/video/upload/v1775585556/dds3_1_rqhg7x.mp4" type="video/mp4" />
        </video>

        {/* Premium Dark Gradient Overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.7) 100%)', zIndex: 1 }} />

        {/* Additional Radial Gradient for Depth */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(163,230,53,0.05) 0%, transparent 70%)', zIndex: 1 }} />

        {/* Animated Stars Field */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 2 }}>
          {[...Array(60)].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: Math.random() * 2 + 1 + 'px',
                height: Math.random() * 2 + 1 + 'px',
                backgroundColor: '#fff',
                borderRadius: '50%',
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                opacity: Math.random() * 0.7 + 0.3,
                animation: `twinkle ${Math.random() * 3 + 2}s infinite`,
                animationDelay: Math.random() * 2 + 's',
                boxShadow: `0 0 ${Math.random() * 4 + 2}px rgba(255,255,255,${Math.random() * 0.8})`
              }}
            />
          ))}
        </div>

        {/* Floating Clouds - Left */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '-10%',
          width: '100%', maxWidth: '400px',
          height: '200px',
          background: 'radial-gradient(ellipse 400px 150px at 50% 50%, rgba(100,150,255,0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(40px)',
          animation: 'float-left 20s infinite linear',
          zIndex: 2
        }} />

        {/* Floating Clouds - Right */}
        <div style={{
          position: 'absolute',
          bottom: '15%',
          right: '-5%',
          width: '100%', maxWidth: '500px',
          height: '250px',
          background: 'radial-gradient(ellipse 500px 200px at 50% 50%, rgba(150,100,255,0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(50px)',
          animation: 'float-right 25s infinite linear',
          zIndex: 2
        }} />

        {/* Ambient Light Orbs - Top Left */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '5%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(163,230,53,0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          animation: 'pulse-glow 4s ease-in-out infinite',
          zIndex: 2
        }} />

        {/* Ambient Light Orbs - Bottom Right */}
        <div style={{
          position: 'absolute',
          bottom: '10%',
          right: '10%',
          width: '350px',
          height: '350px',
          background: 'radial-gradient(circle, rgba(100,200,255,0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(70px)',
          animation: 'pulse-glow 5s ease-in-out infinite',
          animationDelay: '1s',
          zIndex: 2
        }} />

        {/* Sky Gradient Overlay - Dynamic */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(20,30,80,0.3) 0%, rgba(80,40,120,0.1) 50%, rgba(30,20,60,0.3) 100%)',
          animation: 'sky-shift 8s ease-in-out infinite',
          zIndex: 2,
          pointerEvents: 'none'
        }} />

        {/* Particles Dust Effect */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 3 }}>
          {[...Array(30)].map((_, i) => (
            <div
              key={`particle-${i}`}
              style={{
                position: 'absolute',
                width: Math.random() * 4 + 2 + 'px',
                height: Math.random() * 4 + 2 + 'px',
                backgroundColor: 'rgba(163,230,53,0.2)',
                borderRadius: '50%',
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                animation: `float-particle ${Math.random() * 15 + 10}s linear infinite`,
                animationDelay: Math.random() * 5 + 's'
              }}
            />
          ))}
        </div>

        {/* Hero Content */}
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>
          {/* Top Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 20px', backgroundColor: 'rgba(163,230,53,0.1)', borderRadius: '100px', border: '1px solid rgba(163,230,53,0.3)', marginBottom: '32px', backdropFilter: 'blur(10px)' }}>
            <span style={{ width: '8px', height: '8px', backgroundColor: '#a3e635', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#a3e635', textTransform: 'uppercase', letterSpacing: '2px' }}>Insights & Stories</span>
          </div>

          {/* Main Headline */}
          <h1 style={{ fontSize: 'clamp(42px, 8vw, 72px)', fontWeight: '900', letterSpacing: '-3px', marginBottom: '24px', lineHeight: '1.1', background: 'linear-gradient(180deg, #fff 0%, #ccc 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: 'none' }}>
            Insights for <span style={{ background: 'linear-gradient(135deg, #a3e635 0%, #b3d435 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontStyle: 'italic', fontWeight: '900' }}>Builders</span>
          </h1>

          {/* Subheadline */}
          <p style={{ fontSize: 'clamp(16px, 2vw, 22px)', color: '#ccc', maxWidth: '700px', margin: '0 auto 40px', lineHeight: '1.6', fontWeight: '300', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
            Master AI prompting, validate startup ideas, and build products that matter. Deep-dive guides and actionable strategies.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '32px' }}>
            <button
              onClick={() => window.scrollTo({ top: document.getElementById('blog-posts').offsetTop - 100, behavior: 'smooth' })}
              style={{ padding: '16px 48px', backgroundColor: '#a3e635', color: '#000', border: 'none', borderRadius: '100px', fontWeight: '800', fontSize: '15px', cursor: 'pointer', transition: 'all 0.3s', boxShadow: '0 8px 24px rgba(163,230,53,0.3)' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(163,230,53,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(163,230,53,0.3)'; }}
            >
              Explore Articles
            </button>
            <button
              onClick={() => navigate('/ai')}
              style={{ padding: '16px 48px', backgroundColor: 'transparent', color: '#a3e635', border: '2px solid #a3e635', borderRadius: '100px', fontWeight: '800', fontSize: '15px', cursor: 'pointer', transition: 'all 0.3s' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(163,230,53,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              Try Prompt Quill
            </button>
          </div>

          {/* Scroll Indicator */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginTop: '60px', animation: 'bounce 2s infinite' }}>
            <span style={{ fontSize: '12px', color: '#999', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Scroll to explore</span>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ stroke: '#a3e635', strokeWidth: '2' }}>
              <path d="M10 4v8M10 12l3-3M10 12l-3-3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Top Navigation (Overlay) */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 20 }}>
          <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ccc', fontSize: '13px', fontWeight: '700', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}>
            <ArrowLeft size={14} /> Home
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: '#a3e635', borderRadius: '50%' }} />
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#ccc' }}>Prompt Quill</span>
          </div>
        </div>
      </div>

      {/* Posts Section with Atmospheric Background */}
      <div style={{ position: 'relative', minHeight: '100vh', backgroundColor: '#080808', overflow: 'hidden' }}>
        {/* Background Stars */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          {[...Array(40)].map((_, i) => (
            <div
              key={`bg-star-${i}`}
              style={{
                position: 'absolute',
                width: Math.random() * 1.5 + 0.5 + 'px',
                height: Math.random() * 1.5 + 0.5 + 'px',
                backgroundColor: '#fff',
                borderRadius: '50%',
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                opacity: Math.random() * 0.4 + 0.1,
                animation: `twinkle ${Math.random() * 4 + 3}s infinite`,
                animationDelay: Math.random() * 3 + 's'
              }}
            />
          ))}
        </div>

        {/* Floating Clouds Section - Left */}
        <div style={{
          position: 'absolute',
          top: '5%',
          left: '-15%',
          width: '350px',
          height: '180px',
          background: 'radial-gradient(ellipse 350px 150px at 50% 50%, rgba(100,120,255,0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(50px)',
          animation: 'float-left 30s infinite linear',
          zIndex: 0,
          pointerEvents: 'none'
        }} />

        {/* Floating Clouds Section - Right */}
        <div style={{
          position: 'absolute',
          top: '30%',
          right: '-10%',
          width: '100%', maxWidth: '400px',
          height: '200px',
          background: 'radial-gradient(ellipse 400px 180px at 50% 50%, rgba(150,80,200,0.06) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          animation: 'float-right 35s infinite linear',
          zIndex: 0,
          pointerEvents: 'none'
        }} />

        {/* Ambient Glow - Center Left */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '5%',
          width: '280px',
          height: '280px',
          background: 'radial-gradient(circle, rgba(163,230,53,0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          animation: 'pulse-glow 6s ease-in-out infinite',
          zIndex: 0,
          pointerEvents: 'none'
        }} />

        {/* Ambient Glow - Bottom Right */}
        <div style={{
          position: 'absolute',
          bottom: '5%',
          right: '8%',
          width: '320px',
          height: '320px',
          background: 'radial-gradient(circle, rgba(100,180,255,0.07) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(90px)',
          animation: 'pulse-glow 7s ease-in-out infinite',
          animationDelay: '1.5s',
          zIndex: 0,
          pointerEvents: 'none'
        }} />

        {/* Particles throughout section */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
          {[...Array(25)].map((_, i) => (
            <div
              key={`page-particle-${i}`}
              style={{
                position: 'absolute',
                width: Math.random() * 3 + 1 + 'px',
                height: Math.random() * 3 + 1 + 'px',
                backgroundColor: 'rgba(163,230,53,0.15)',
                borderRadius: '50%',
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                animation: `float-particle ${Math.random() * 20 + 15}s linear infinite`,
                animationDelay: Math.random() * 8 + 's'
              }}
            />
          ))}
        </div>

        {/* Content Container */}
        <div id="blog-posts" style={{ position: 'relative', zIndex: 10, maxWidth: '1200px', margin: '0 auto', padding: '80px 24px 80px' }}>
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <h2 style={{ fontSize: '42px', fontWeight: '900', letterSpacing: '-2px', marginBottom: '16px' }}>Latest Articles</h2>
            <p style={{ fontSize: '16px', color: '#888', maxWidth: '600px', margin: '0 auto' }}>
              Fresh insights delivered regularly. All articles are carefully curated for builders and makers.
            </p>
          </div>
          {loading ? (
            <PageLoadingSkeleton variant="page" />
          ) : posts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: '#555' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✍️</div>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#888', marginBottom: '8px' }}>No posts yet</h3>
              <p style={{ fontSize: '14px' }}>Check back soon for insights and guides.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '32px' }}>
              {posts.map(post => (
                <div
                  key={post.id}
                  onClick={() => navigate(`/blog/${post.slug}`)}
                  style={{ backgroundColor: '#0d0d0d', borderRadius: '20px', border: '1px solid #1a1a1a', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.3s ease' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = '#333'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#1a1a1a'; }}
                >
                  {post.cover_image && (
                    <div style={{ height: '200px', overflow: 'hidden' }}>
                      <img src={post.cover_image} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: '0.3s' }} />
                    </div>
                  )}
                  <div style={{ padding: '28px' }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                      {(post.tags || []).slice(0, 3).map((tag, i) => (
                        <span key={i} style={{ padding: '3px 8px', backgroundColor: 'rgba(163,230,53,0.08)', borderRadius: '6px', color: '#a3e635', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{tag}</span>
                      ))}
                    </div>
                    <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '12px', lineHeight: '1.3', letterSpacing: '-0.5px' }}>{post.title}</h2>
                    <p style={{ color: '#888', fontSize: '14px', lineHeight: '1.6', marginBottom: '20px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.excerpt}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#555', fontSize: '12px', fontWeight: '600' }}>{timeAgo(post.created_at)} · {readingTime(post.content)} min read</span>
                      <span style={{ color: '#a3e635', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>Read <ChevronRight size={14} /></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer with Atmospheric Effects */}
      <footer style={{ position: 'relative', borderTop: '1px solid #1a1a1a', padding: '60px 24px 40px', textAlign: 'center', color: '#555', fontSize: '12px', backgroundColor: '#080808', overflow: 'hidden' }}>
        {/* Background Stars */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          {[...Array(30)].map((_, i) => (
            <div
              key={`footer-star-${i}`}
              style={{
                position: 'absolute',
                width: Math.random() * 1 + 0.5 + 'px',
                height: Math.random() * 1 + 0.5 + 'px',
                backgroundColor: '#fff',
                borderRadius: '50%',
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                opacity: Math.random() * 0.3 + 0.1,
                animation: `twinkle ${Math.random() * 3 + 2}s infinite`,
                animationDelay: Math.random() * 2 + 's'
              }}
            />
          ))}
        </div>

        {/* Footer Glow */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%', maxWidth: '400px',
          height: '200px',
          background: 'radial-gradient(ellipse at center, rgba(163,230,53,0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          zIndex: 0,
          pointerEvents: 'none'
        }} />

        {/* Footer Content */}
        <div style={{ position: 'relative', zIndex: 10 }}>
          <p style={{
            marginBottom: '20px',
            fontSize: '13px',
            color: '#666',
            background: 'linear-gradient(135deg, #888 0%, #a3e635 50%, #888 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: '600',
            letterSpacing: '0.5px',
            animation: 'gradient-shift 3s ease-in-out infinite',
            textShadow: 'none'
          }}>
            © 2026 PromptQuill · Open Source MIT
          </p>
        </div>
      </footer>

      {/* Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(8px); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
        @keyframes float-left {
          0% { left: -10%; transform: translateX(0); }
          100% { left: 120%; transform: translateX(0); }
        }
        @keyframes float-right {
          0% { right: -5%; transform: translateX(0); }
          100% { right: 110%; transform: translateX(0); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        @keyframes sky-shift {
          0%, 100% { background: linear-gradient(180deg, rgba(20,30,80,0.3) 0%, rgba(80,40,120,0.1) 50%, rgba(30,20,60,0.3) 100%); }
          50% { background: linear-gradient(180deg, rgba(30,40,90,0.25) 0%, rgba(90,50,130,0.08) 50%, rgba(40,30,70,0.25) 100%); }
        }
        @keyframes float-particle {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.3; }
          90% { opacity: 0.3; }
          100% { transform: translateY(-100vh) translateX(100px); opacity: 0; }
        }
        @keyframes gradient-shift {
          0%, 100% { filter: drop-shadow(0 0 8px rgba(163,230,53,0.3)); }
          50% { filter: drop-shadow(0 0 16px rgba(163,230,53,0.6)); }
        }
      `}</style>
    </div>
  );
};

export default BlogPage;
