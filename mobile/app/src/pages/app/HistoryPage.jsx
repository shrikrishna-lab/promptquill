import React, { useEffect, useState } from 'react';
import { ChevronRight, Clock3, History, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase.mobile.js';
import { timeAgo } from '../../lib/utils.js';

const cardStyle = {
  background: 'rgba(18, 18, 28, 0.94)',
  border: '1px solid rgba(255, 255, 255, 0.07)',
  borderRadius: '22px',
  padding: '18px'
};

function HistoryPage({ session }) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    if (!session?.user?.id) return;

    setLoading(true);
    const { data } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('is_buried', false)
      .order('updated_at', { ascending: false });

    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory().catch((error) => {
      console.error('Failed to fetch mobile history:', error);
      setLoading(false);
    });
  }, [session?.user?.id]);

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Delete this prompt from your history?');
    if (!confirmed) return;

    await supabase.from('sessions').delete().eq('id', id);
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
  };

  if (loading) {
    return (
      <div style={{ ...cardStyle, textAlign: 'center', color: '#a1a1aa' }}>
        <div style={{ marginBottom: '8px' }}>Loading history...</div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div style={{ ...cardStyle, textAlign: 'center' }}>
        <History size={40} color="#71717a" style={{ marginBottom: '12px' }} />
        <h2 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 900 }}>No saved prompts yet</h2>
        <p style={{ margin: 0, color: '#a1a1aa', fontSize: '14px', lineHeight: 1.6 }}>
          Generate a prompt and save it to build your mobile history.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {items.map((item) => (
        <article key={item.id} style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#a1a1aa' }}>
                <Clock3 size={14} />
                <span style={{ fontSize: '12px' }}>{timeAgo(item.updated_at || item.created_at)}</span>
              </div>
              <h3
                style={{
                  margin: '0 0 8px',
                  fontSize: '17px',
                  fontWeight: 800,
                  lineHeight: 1.4,
                  wordBreak: 'break-word'
                }}
              >
                {item.title || 'Untitled prompt'}
              </h3>
              <p style={{ margin: 0, color: '#a1a1aa', fontSize: '13px', lineHeight: 1.6 }}>
                {item.mode || 'GENERAL'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleDelete(item.id)}
              aria-label="Delete saved prompt"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '14px',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                background: 'rgba(127, 29, 29, 0.12)',
                color: '#fca5a5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              <Trash2 size={16} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => navigate(`/app/generate?session=${item.id}`)}
            style={{
              marginTop: '16px',
              width: '100%',
              minHeight: '46px',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              background: '#11131a',
              color: '#f8fafc',
              fontWeight: 800,
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            Open in Generate
            <ChevronRight size={16} />
          </button>
        </article>
      ))}
    </div>
  );
}

export default HistoryPage;
