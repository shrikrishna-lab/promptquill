import React, { useState, useEffect } from 'react';
import { Heart, Download, Share2, Trash2, Plus, Filter, Search, GitFork, ArrowLeft, Bookmark, MoreHorizontal, MessageCircle, Eye, Copy } from 'lucide-react';
import { supabase } from '../lib/supabase.mobile';
import PageLoadingSkeleton from '../components/PageLoadingSkeleton';
import { useNotification } from '../components/Notification';

const CreativeGallery = ({ session }) => {
  const [works, setWorks] = useState([]);
  const [userWorks, setUserWorks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const { notify, NotificationContainer } = useNotification();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWork, setSelectedWork] = useState(null);

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    creative_type: 'image',
    image_url: null,
    file: null,
    tags: ''
  });

  useEffect(() => {
    fetchWorks();
  }, []);

  const fetchWorks = async () => {
    setLoading(true);
    try {
      // Fetch all public creative works
      const { data, error } = await supabase
        .from('creative_works')
        .select('id, title, description, creative_type, image_url, created_by, likes_count, tags, created_at')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWorks(data || []);

      // Fetch user's own works
      if (session?.user) {
        const { data: userWorks } = await supabase
          .from('creative_works')
          .select('*')
          .eq('created_by', session.user.id)
          .order('created_at', { ascending: false });
        setUserWorks(userWorks || []);
      }
    } catch (err) {
      console.error('Error fetching works:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!session?.user) return;

    try {
      // Upload file to Supabase Storage
      const timestamp = Date.now();
      const fileName = `${session.user.id}/${timestamp}-${file.name}`;
      
      const { data, error } = await supabase.storage
        .from('creative-works')
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('creative-works')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (err) {
      console.error('Upload error:', err);
      return null;
    }
  };

  const handleSubmitWork = async () => {
    if (!session?.user) {
      notify.warning('Please sign in to upload your work');
      return;
    }

    if (!uploadForm.title.trim()) {
      notify.warning('Please enter a title for your work');
      return;
    }

    if (!uploadForm.file && !uploadForm.image_url) {
      notify.warning('Please select a file or image to upload');
      return;
    }

    try {
      let imageUrl = uploadForm.image_url;

      // Upload file if provided
      if (uploadForm.file) {
        imageUrl = await handleFileUpload(uploadForm.file);
        if (!imageUrl) throw new Error('File upload failed');
      }

      // Save to database
      const { error } = await supabase
        .from('creative_works')
        .insert({
          created_by: session.user.id,
          title: uploadForm.title.trim(),
          description: uploadForm.description.trim(),
          creative_type: uploadForm.creative_type,
          image_url: imageUrl,
          tags: uploadForm.tags.split(',').map(t => t.trim()),
          is_public: true,
          likes_count: 0
        });

      if (error) throw error;

      // Reset form
      setUploadForm({ title: '', description: '', creative_type: 'image', image_url: null, file: null, tags: '' });
      setShowUploadModal(false);

      // Refresh
      fetchWorks();

      notify.success('Your work has been uploaded successfully!');
    } catch (err) {
      console.error('Error uploading work:', err);
      notify.error(err.message || 'Failed to upload your work. Please try again.');
    }
  };

  const toggleLike = async (workId, currentLikes) => {
    if (!session?.user) return;

    try {
      const { data: existing } = await supabase
        .from('creative_likes')
        .select('id')
        .eq('work_id', workId)
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (existing?.id) {
        await supabase.from('creative_likes').delete().eq('id', existing.id);
        await supabase.from('creative_works').update({ likes_count: Math.max(0, (currentLikes || 0) - 1) }).eq('id', workId);
      } else {
        await supabase.from('creative_likes').insert({ work_id: workId, user_id: session.user.id });
        await supabase.from('creative_works').update({ likes_count: (currentLikes || 0) + 1 }).eq('id', workId);
      }
      fetchWorks();
    } catch (err) {
      console.error('Error liking work:', err);
    }
  };

  const handleShareWork = async (work) => {
    const url = `${window.location.origin}/creative-gallery?work=${work.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: work.title, text: work.description || 'Check this creative work on PromptQuill', url });
      } else {
        await navigator.clipboard.writeText(url);
        notify.success('Share link copied to clipboard');
      }
    } catch {
      // silent cancel
    }
  };

  const handleForkToDashboard = (work) => {
    notify.success(`Opened "${work.title}" preview. Use it as your next idea in Dashboard.`);
    setSelectedWork(work);
  };

  const deleteWork = async (workId) => {
    if (!window.confirm('Delete this work?')) return;

    try {
      const { error } = await supabase
        .from('creative_works')
        .delete()
        .eq('id', workId)
        .eq('created_by', session.user.id);

      if (error) throw error;
      fetchWorks();
    } catch (err) {
      console.error('Error deleting work:', err);
    }
  };

  const filteredWorks = works.filter(work => {
    const matchesFilter = filter === 'all' || work.creative_type === filter;
    const matchesSearch = searchTerm === '' || 
      work.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      work.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (work.tags || []).some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const CREATIVE_TYPES = ['image', 'video', 'frontend', 'logo', 'motion', '3d', 'music', 'writing', 'social', 'poster', 'typography', 'game'];

  return (
    <div style={{ padding: '0 0 120px 0', margin: '0', minHeight: '100vh', backgroundColor: '#050505', color: '#fff' }}>
      
      {/* Mobile Top Bar */}
      <div style={{ padding: '24px 20px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'sticky', top: 0, background: 'rgba(5,5,5,0.95)', backdropFilter: 'blur(20px)', zIndex: 100 }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 4px 0', letterSpacing: '-0.5px' }}>Gallery</h1>
          <p style={{ color: '#888', fontSize: '14px', margin: 0, fontWeight: '500' }}>Discover amazing creations</p>
        </div>
        <button style={{ color: '#ccc', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
           <Search size={24} />
        </button>
      </div>

      {/* Tabs */}
      <div style={{ padding: '0 20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
           <button style={{ padding: '8px 20px', borderRadius: '99px', background: '#a3e635', color: '#000', fontSize: '13px', fontWeight: '800', whiteSpace: 'nowrap', border: 'none' }}>
              All
           </button>
           <button style={{ padding: '8px 20px', borderRadius: '99px', border: '1px solid transparent', background: '#111', color: '#ccc', fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap' }}>
              Prompts
           </button>
           <button style={{ padding: '8px 20px', borderRadius: '99px', border: '1px solid transparent', background: '#111', color: '#ccc', fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap' }}>
              Images
           </button>
           <button style={{ padding: '8px 20px', borderRadius: '99px', border: '1px solid transparent', background: '#111', color: '#ccc', fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap' }}>
              Logos
           </button>
           <button style={{ padding: '8px 20px', borderRadius: '99px', border: '1px solid transparent', background: '#111', color: '#ccc', fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap' }}>
              More &gt;
           </button>
        </div>
      </div>

      {/* Grid Feed */}
      <div style={{ padding: '0 20px', paddingBottom: 'calc(80px + env(safe-area-inset-bottom))' }}>
        {loading ? (
          <PageLoadingSkeleton variant="inline" />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Generate a deterministic mix of dummy works if none exist, else map real works */}
            {([...filteredWorks, ...Array(Math.max(0, 4 - filteredWorks.length)).keys()]).map((workOrIndex, i) => {
              const isReal = !!workOrIndex.id;
              const work = isReal ? workOrIndex : {
                id: `dummy-${i}`,
                title: ["Sci-Fi World", "Cyber Wolf", "Minimal Logo", "Fantasy Castle"][i % 4],
                created_by_name: ["Alex M.", "Sarah C.", "David R.", "Maya P."][i % 4],
                likes_count: [342, 289, 156, 412][i % 4],
                image_url: `https://picsum.photos/seed/${i + 10}/400/500`, // Placeholder
                description: 'A majestic fantasy castle floating above the clouds, epic atmosphere, cinematic lighting, ultra detailed, 8k',
                tags: ['Fantasy', 'Castle', 'Landscape', 'AI Art']
              };

              // Make the grid items varying heights slightly for masonry feel (or just standard 1:1.3 ratio)
              const height = (i % 3 === 0) ? '280px' : '220px';

              return (
                <div 
                  key={work.id} 
                  onClick={() => setSelectedWork(work)}
                  style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', height: height, cursor: 'pointer', backgroundColor: '#111' }}
                >
                  <img src={work.image_url} alt={work.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {/* Overlay */}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 40%, transparent 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '16px 12px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#fff', margin: '0 0 4px 0', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{work.title}</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: '#aaa', fontWeight: '500' }}>by {work.created_by_name || 'Anonymous'}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#888', fontSize: '11px', fontWeight: '600' }}>
                        <Heart size={12} /> {work.likes_count}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail View Modal (Full screen on mobile) */}
      {selectedWork && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: '#050505', zIndex: 1002, overflowY: 'auto' }}>
          
          {/* Detail Header */}
          <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
            <button onClick={() => setSelectedWork(null)} style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', border: 'none', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <ArrowLeft size={20} />
            </button>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', border: 'none', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Bookmark size={20} />
              </button>
              <button style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', border: 'none', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <MoreHorizontal size={20} />
              </button>
            </div>
          </div>

          {/* Hero Image */}
          <div style={{ width: '100%', height: '50vh', position: 'relative' }}>
            <img src={selectedWork.image_url} alt={selectedWork.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0 0 32px 32px' }} />
            {/* Carousel Dots */}
            <div style={{ position: 'absolute', bottom: '20px', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '6px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#a3e635' }}></div>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.4)' }}></div>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.4)' }}></div>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.4)' }}></div>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.4)' }}></div>
            </div>
          </div>

          {/* Content Area */}
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#fff' }}>{selectedWork.title}</h2>
              <button style={{ background: 'transparent', border: '1px solid #a3e635', color: '#a3e635', padding: '6px 16px', borderRadius: '99px', fontSize: '13px', fontWeight: '700' }}>
                Follow
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>👩🏽</div>
              <span style={{ color: '#aaa', fontSize: '14px', fontWeight: '500' }}>by <span style={{ color: '#fff', fontWeight: '700' }}>{selectedWork.created_by_name || 'Maya Patel'}</span></span>
            </div>

            <p style={{ color: '#aaa', fontSize: '15px', lineHeight: '1.6', marginBottom: '24px' }}>
              {selectedWork.description || 'A majestic fantasy castle floating above the clouds, ultra detailed, cinematic lighting.'}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '32px' }}>
              {(selectedWork.tags || ['Fantasy', 'Castle', 'Landscape', 'AI Art']).map(t => (
                <span key={t} style={{ background: '#111', color: '#888', padding: '6px 16px', borderRadius: '99px', fontSize: '12px', fontWeight: '600' }}>
                  {t}
                </span>
              ))}
            </div>

            {/* Engagement Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <div style={{ display: 'flex', gap: '24px' }}>
                <button onClick={() => toggleLike(selectedWork.id, selectedWork.likes_count)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#ef4444', fontSize: '14px', fontWeight: '700', padding: 0 }}>
                  <Heart size={18} fill="#ef4444" /> {selectedWork.likes_count}
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#888', fontSize: '14px', fontWeight: '600' }}>
                  <MessageCircle size={18} /> 36
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#888', fontSize: '14px', fontWeight: '600' }}>
                  <Eye size={18} /> 2.1K
                </div>
              </div>
              <button style={{ background: 'none', border: 'none', color: '#888', padding: 0 }}>
                <Share2 size={20} />
              </button>
            </div>

            {/* Prompt Used block */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', marginBottom: '12px' }}>Prompt Used</h3>
              <div style={{ background: '#111', border: '1px solid #222', borderRadius: '16px', padding: '20px', position: 'relative' }}>
                <p style={{ color: '#aaa', fontSize: '14px', lineHeight: '1.6', margin: 0, paddingRight: '24px' }}>
                  A majestic fantasy castle floating above the clouds, epic atmosphere, cinematic lighting, ultra detailed, 8k
                </p>
                <button style={{ position: 'absolute', right: '16px', bottom: '16px', background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: 0 }}>
                  <Copy size={16} />
                </button>
              </div>
            </div>

            <div style={{ height: '40px' }}></div> {/* Bottom Spacing */}
          </div>
        </div>
      )}

      <NotificationContainer />
    </div>
  );
};

export default CreativeGallery;
