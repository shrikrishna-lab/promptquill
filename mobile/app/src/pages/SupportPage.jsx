import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.mobile';
import { HelpCircle, MessageSquare, Plus, Clock, CheckCircle, AlertCircle, ArrowLeft, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SupportPage = ({ session, isAdmin }) => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTicket, setActiveTicket] = useState(null);
  const [replies, setReplies] = useState([]);
  const [replyText, setReplyText] = useState('');
  
  // New ticket state
  const [isCreating, setIsCreating] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newPriority, setNewPriority] = useState('normal');
  const [submitting, setSubmitting] = useState(false);
  
  // Toast state
  const [toast, setToast] = useState(null);
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };


  useEffect(() => {
    fetchTickets();

    const ticketsChannel = supabase
      .channel('public_support_tickets')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'support_tickets'
      }, (payload) => {
        if (isAdmin || payload.new?.user_id === session?.user?.id || payload.old?.user_id === session?.user?.id) {
           fetchTickets(false); // Refetch silently to capture updates and profile mapping
           setActiveTicket(prev => {
              if (prev && payload.new?.id === prev.id) {
                 return { ...prev, ...payload.new };
              }
              return prev;
           });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ticketsChannel);
    };
  }, [session, isAdmin]);

  useEffect(() => {
    if (activeTicket) {
      fetchReplies(activeTicket.id);
      
      // Setup realtime subscription for replies
      const channel = supabase
        .channel(`ticket_${activeTicket.id}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'ticket_replies',
          filter: `ticket_id=eq.${activeTicket.id}`
        }, payload => {
          setReplies(current => [...current, payload.new]);
        })
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [activeTicket]);

  const fetchTickets = async (showLoading = true) => {
    if (!session?.user?.id) return;
    if (showLoading) setLoading(true);
    
    let query = supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (!isAdmin) {
      query = query.eq('user_id', session.user.id);
    }
    
    const { data: ticketsData } = await query;
    let finalTickets = ticketsData || [];

    if (isAdmin && finalTickets.length > 0) {
      const userIds = [...new Set(finalTickets.map(t => t.user_id))];
      const { data: profilesData } = await supabase.from('profiles').select('id, email, is_pro').in('id', userIds);
      
      finalTickets = finalTickets.map(t => {
        const profile = (profilesData || []).find(p => p.id === t.user_id);
        return { ...t, profiles: profile };
      });
    }

    setTickets(finalTickets);
    setLoading(false);
  };

  const fetchReplies = async (ticketId) => {
    const { data: repliesData } = await supabase
      .from('ticket_replies')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });
    
    let finalReplies = repliesData || [];
    
    if (finalReplies.length > 0) {
      const userIds = [...new Set(finalReplies.map(r => r.sender_id))];
      const { data: profilesData } = await supabase.from('profiles').select('id, email, role').in('id', userIds);
      
      finalReplies = finalReplies.map(r => {
        const profile = (profilesData || []).find(p => p.id === r.sender_id);
        return { ...r, profiles: profile };
      });
    }

    setReplies(finalReplies);
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!newSubject.trim() || !newMessage.trim()) return;
    
    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .insert([{
          user_id: session.user.id,
          subject: newSubject,
          message: newMessage,
          priority: newPriority,
          status: 'open'
        }])
        .select()
        .single();
        
      if (error) {
        showToast(`❌ Failed to submit: ${error.message || 'Database error'}`);
      } else if (data) {
        setTickets([data, ...tickets]);
        setIsCreating(false);
        setNewSubject('');
        setNewMessage('');
        setActiveTicket(data);
        showToast('✅ Ticket submitted successfully!');
      }
    } catch (err) {
      showToast(`❌ Unexpected Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !activeTicket) return;
    
    const textToSend = replyText;
    setReplyText(''); // Optimistic clear
    
    const { error } = await supabase.from('ticket_replies').insert([{
      ticket_id: activeTicket.id,
      sender_id: session.user.id,
      message: textToSend,
      is_admin: isAdmin || false
    }]);

    if (error) {
      showToast(`❌ Failed to send reply: ${error.message}`);
    } else {
      // Automatically fetch just in case realtime is slow
      fetchReplies(activeTicket.id);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'open': return <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: 'rgba(59,130,246,0.1)', color: '#3b82f6', fontSize: '10px', fontWeight: '800' }}>OPEN</span>;
      case 'in_progress': return <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: 'rgba(234,179,8,0.1)', color: '#eab308', fontSize: '10px', fontWeight: '800' }}>IN PROGRESS</span>;
      case 'resolved': return <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: 'rgba(34,197,94,0.1)', color: '#22c55e', fontSize: '10px', fontWeight: '800' }}>RESOLVED</span>;
      default: return null;
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent': return '#ef4444';
      case 'high': return '#f97316';
      case 'normal': return '#a3e635';
      case 'low': return '#9ca3af';
      default: return '#9ca3af';
    }
  };

  const latestAdminResolution = replies
    .filter((r) => r.is_admin)
    .slice()
    .reverse()
    .find((r) => typeof r.message === 'string' && (activeTicket?.status === 'resolved' || activeTicket?.status === 'closed'));

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#080808', color: '#fff', display: 'flex', position: 'relative' }}>
      
      {/* Toast Notification */}
      {toast && (
        <div style={{ position: 'fixed', top: '24px', right: '50%', transform: 'translateX(50%)', backgroundColor: '#fff', color: '#000', padding: '12px 24px', borderRadius: '12px', fontSize: '13px', fontWeight: '800', zIndex: 9999, boxShadow: '0 10px 40px rgba(0,0,0,0.5)', border: '1px solid #ccc' }}>
          {toast}
        </div>
      )}

      {/* Sidebar: Ticket List */}
      <div style={{ width: '320px', backgroundColor: '#0a0a0a', borderRight: '1px solid #1a1a1a', display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid #1a1a1a' }}>
          <button onClick={() => navigate('/settings')} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#888', fontSize: '12px', fontWeight: '700', marginBottom: '24px', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}>
            <ArrowLeft size={14} /> Back to Settings
          </button>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ fontSize: '20px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HelpCircle size={20} color="#a3e635" /> Support
            </h1>
            <button onClick={() => { setIsCreating(true); setActiveTicket(null); }} style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#a3e635', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none' }}>
              <Plus size={18} color="#000" />
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#555' }}>Loading tickets...</div>
          ) : tickets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#555', fontSize: '13px' }}>
              No support tickets yet.<br/><br/>Click the + button to create one.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {tickets.map(t => (
                <div 
                  key={t.id} 
                  onClick={() => { setActiveTicket(t); setIsCreating(false); }}
                  style={{ 
                    padding: '16px', borderRadius: '12px', cursor: 'pointer', transition: '0.2s',
                    backgroundColor: activeTicket?.id === t.id ? '#1a1a1a' : 'transparent',
                    border: activeTicket?.id === t.id ? '1px solid #333' : '1px solid transparent',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: getPriorityColor(t.priority) }} />
                      <span style={{ fontSize: '13px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>{t.subject}</span>
                    </div>
                    {getStatusBadge(t.status)}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: '#666', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} /> {formatTime(t.created_at)}
                    </span>
                    {isAdmin && t.profiles && <span style={{ fontSize: '10px', color: '#888' }}>{t.profiles.email?.split('@')[0]}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#050505' }}>
        
        {/* State: Create New Ticket */}
        {isCreating && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '40px' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '8px' }}>New Support Ticket</h2>
              <p style={{ color: '#888', fontSize: '13px', marginBottom: '32px' }}>We typically respond within 12-24 hours.</p>
              
              <form onSubmit={handleCreateTicket} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: '#555', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>SUBJECT</label>
                  <input type="text" value={newSubject} onChange={e => setNewSubject(e.target.value)} required placeholder="e.g., Cannot export to PDF"
                    style={{ width: '100%', padding: '12px 16px', backgroundColor: '#111', border: '1px solid #222', borderRadius: '10px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: '#555', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>HOW URGENT IS THIS?</label>
                  <select value={newPriority} onChange={e => setNewPriority(e.target.value)}
                    style={{ width: '100%', padding: '12px 16px', backgroundColor: '#111', border: '1px solid #222', borderRadius: '10px', color: '#fff', fontSize: '14px', outline: 'none', appearance: 'none', boxSizing: 'border-box', cursor: 'pointer' }}>
                    <option value="low">Low - Minor bug or feature request</option>
                    <option value="normal">Normal - Standard support issue</option>
                    <option value="high">High - Feature is severely broken</option>
                    <option value="urgent">Urgent - Complete account lockout / payment issue</option>
                  </select>
                </div>
                
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: '#555', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>MESSAGE</label>
                  <textarea value={newMessage} onChange={e => setNewMessage(e.target.value)} required placeholder="Please describe the issue in detail..." rows={6}
                    style={{ width: '100%', padding: '12px 16px', backgroundColor: '#111', border: '1px solid #222', borderRadius: '10px', color: '#fff', fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                </div>
                
                <button type="submit" disabled={submitting} style={{ padding: '14px', backgroundColor: '#a3e635', border: 'none', borderRadius: '10px', color: '#000', fontSize: '14px', fontWeight: '800', cursor: 'pointer', marginTop: '12px' }}>
                  {submitting ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* State: Viewing Active Ticket */}
        {!isCreating && activeTicket && (
          <>
            {/* Ticket Header */}
            <div style={{ padding: '24px 40px', borderBottom: '1px solid #1a1a1a', backgroundColor: '#0a0a0a' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                {getStatusBadge(activeTicket.status)}
                <span style={{ fontSize: '12px', color: '#666', fontWeight: '600' }}>ID: {activeTicket.id.split('-')[0]}</span>
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: '800' }}>{activeTicket.subject}</h2>
            </div>
            
            {/* Conversation Thread */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Original Message */}
              <div style={{ display: 'flex', gap: '16px', maxWidth: '80%' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '800', flexShrink: 0 }}>
                  {isAdmin && activeTicket.profiles ? activeTicket.profiles.email?.charAt(0).toUpperCase() : session?.user?.email?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700' }}>{isAdmin && activeTicket.profiles ? activeTicket.profiles.email?.split('@')[0] : 'You'}</span>
                    <span style={{ fontSize: '11px', color: '#666' }}>{formatTime(activeTicket.created_at)}</span>
                  </div>
                  <div style={{ padding: '16px', backgroundColor: '#1a1a1a', borderRadius: '0 16px 16px 16px', fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-wrap', color: '#eee' }}>
                    {activeTicket.message}
                  </div>
                </div>
              </div>

              {/* Replies */}
              {replies.map(reply => {
                const isReplyFromAdmin = reply.is_admin || reply.profiles?.role === 'ADMIN';
                return (
                  <div key={reply.id} style={{ display: 'flex', gap: '16px', maxWidth: '80%', alignSelf: isReplyFromAdmin ? 'flex-end' : 'flex-start', flexDirection: isReplyFromAdmin ? 'row-reverse' : 'row' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: isReplyFromAdmin ? '#a3e635' : '#222', color: isReplyFromAdmin ? '#000' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '800', flexShrink: 0 }}>
                      {isReplyFromAdmin ? 'OS' : (isAdmin && activeTicket.profiles ? activeTicket.profiles.email?.charAt(0).toUpperCase() : session?.user?.email?.charAt(0).toUpperCase())}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: isReplyFromAdmin ? 'flex-end' : 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexDirection: isReplyFromAdmin ? 'row-reverse' : 'row' }}>
                        <span style={{ fontSize: '13px', fontWeight: '700' }}>{isReplyFromAdmin ? 'Prompt Quill Support' : (isAdmin && activeTicket.profiles ? activeTicket.profiles.email?.split('@')[0] : 'You')}</span>
                        <span style={{ fontSize: '11px', color: '#666' }}>{formatTime(reply.created_at)}</span>
                      </div>
                      <div style={{ padding: '16px', backgroundColor: isReplyFromAdmin ? 'rgba(163,230,53,0.1)' : '#1a1a1a', border: isReplyFromAdmin ? '1px solid rgba(163,230,53,0.2)' : 'none', borderRadius: isReplyFromAdmin ? '16px 0 16px 16px' : '0 16px 16px 16px', fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-wrap', color: isReplyFromAdmin ? '#a3e635' : '#eee' }}>
                        {reply.message}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {(activeTicket.status === 'resolved' || activeTicket.status === 'closed') && (
              <div style={{ margin: '0 40px 12px', borderRadius: '12px', border: `1px solid ${activeTicket.status === 'closed' ? 'rgba(239,68,68,0.35)' : 'rgba(34,197,94,0.35)'}`, background: activeTicket.status === 'closed' ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)', padding: '14px 16px' }}>
                <div style={{ fontSize: '12px', fontWeight: '800', letterSpacing: '0.6px', color: activeTicket.status === 'closed' ? '#ef4444' : '#22c55e', marginBottom: '8px' }}>
                  {activeTicket.status === 'closed' ? '🔒 Chat locked by support admin' : '✅ Issue marked as resolved'}
                </div>
                <div style={{ fontSize: '13px', color: '#d6d6d6', lineHeight: '1.6' }}>
                  {latestAdminResolution?.message || 'Support marked this ticket complete. If you still need help, open a new ticket.'}
                </div>
              </div>
            )}

            {/* Reply Input Box */}
            {(activeTicket.status !== 'closed' && activeTicket.status !== 'resolved') && (
              <div style={{ padding: '24px 40px', backgroundColor: '#0a0a0a', borderTop: '1px solid #1a1a1a' }}>
                <form onSubmit={handleSendReply} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                  <div style={{ flex: 1, backgroundColor: '#111', border: '1px solid #222', borderRadius: '16px', padding: '12px 16px', display: 'flex' }}>
                    <textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Type a reply..." rows={1}
                      style={{ width: '100%', backgroundColor: 'transparent', border: 'none', color: '#fff', fontSize: '14px', outline: 'none', resize: 'vertical', minHeight: '24px', fontFamily: 'inherit' }} 
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendReply(e); }
                      }}
                    />
                  </div>
                  <button type="submit" disabled={!replyText.trim()} style={{ width: '48px', height: '48px', borderRadius: '16px', backgroundColor: replyText.trim() ? '#a3e635' : '#222', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: replyText.trim() ? 'pointer' : 'default', transition: '0.2s', flexShrink: 0 }}>
                    <Send size={20} color={replyText.trim() ? '#000' : '#555'} />
                  </button>
                </form>
              </div>
            )}
          </>
        )}

        {/* State: Empty / No Action */}
        {!isCreating && !activeTicket && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#555', padding: '40px' }}>
            <MessageSquare size={48} style={{ marginBottom: '24px', opacity: 0.5 }} />
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px', color: '#888' }}>How can we help?</h3>
            <p style={{ fontSize: '14px', textAlign: 'center', maxWidth: '300px', lineHeight: '1.6' }}>Select a ticket from the sidebar or create a new one to chat with our support team.</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default SupportPage;

