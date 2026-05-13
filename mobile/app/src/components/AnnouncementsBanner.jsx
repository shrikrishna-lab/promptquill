import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.mobile';
import { Megaphone, X } from 'lucide-react';

const AnnouncementsBanner = () => {
  const [announcement, setAnnouncement] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        // Find the first active announcement
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        // 406 = table may not exist, PGRST116 = no rows found
        if (error && error.code !== 'PGRST116' && error.status !== 406) {
          console.error('Announcement fetch error:', error);
          return;
        }

        if (data) {
          // Check if the user already dismissed this specific announcement recently
          const dismissedKey = `dismissed_announcement_${data.id}`;
          if (!localStorage.getItem(dismissedKey)) {
            setAnnouncement(data);
          }
        }
      } catch (err) {
        console.error('Failed to fetch announcement:', err);
      }
    };

    fetchAnnouncement();

    // Subscribe to new announcements
    try {
      const channel = supabase.channel('public:announcements')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, () => {
          fetchAnnouncement();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (err) {
      console.error('Failed to subscribe to announcements:', err);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    if (announcement) {
      localStorage.setItem(`dismissed_announcement_${announcement.id}`, 'true');
    }
  };

  if (!announcement || dismissed) return null;

  const bgColors = {
    info: 'rgba(59, 130, 246, 0.1)',
    warning: 'rgba(245, 158, 11, 0.1)',
    update: 'rgba(163, 230, 53, 0.1)'
  };
  
  const textColors = {
    info: '#60a5fa',
    warning: '#fbbf24',
    update: '#a3e635'
  };

  const type = announcement.type || 'info';

  return (
    <div className="animate-fade-in" style={{ backgroundColor: bgColors[type], borderBottom: `1px solid ${textColors[type]}33`, padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 100 }}>
      {/* Content */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Megaphone size={16} color={textColors[type]} />
        <span style={{ fontSize: '13px', fontWeight: '800', color: textColors[type], textTransform: 'uppercase', letterSpacing: '0.5px' }}>{type}</span>
        <span style={{ fontSize: '13px', color: '#fff', fontWeight: '600' }}>
          <strong style={{ marginRight: '6px' }}>{announcement.title}</strong>
          <span style={{ color: '#aaa', fontWeight: '400' }}>— {announcement.content}</span>
        </span>
      </div>

      {/* Dismiss Button */}
      <button onClick={handleDismiss} style={{ position: 'absolute', right: '24px', background: 'none', border: 'none', color: '#666', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <X size={16} />
      </button>
    </div>
  );
};

export default AnnouncementsBanner;
