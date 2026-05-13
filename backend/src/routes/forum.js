import express from 'express';

const router = express.Router();
const ADMIN_EMAIL_ENV = process.env.ADMIN_EMAIL || '';
const ADMIN_EMAILS = ADMIN_EMAIL_ENV ? ADMIN_EMAIL_ENV.split(',').map(e => e.trim()) : [];

const isForumAdmin = async (req) => {
  if (!req.user) return false;
  if (ADMIN_EMAILS.includes(req.user.email?.toLowerCase())) return true;
  const { data: profile } = await req.supabase
    .from('profiles')
    .select('role')
    .eq('id', req.user.id)
    .maybeSingle();
  return profile?.role?.toUpperCase() === 'ADMIN';
};

const requireForumAdmin = async (req, res, next) => {
  try {
    if (await isForumAdmin(req)) return next();
    return res.status(403).json({ error: 'Admin access required' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ═══════════════════════════════════════════════════════
// FORUM CATEGORIES (Public read, Admin create/edit/delete)
// ═══════════════════════════════════════════════════════

// GET all categories with thread counts
router.get('/categories', async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('forum_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      if (error.message?.includes('fetch') || ['PGRST205','42P01','PGRST116'].includes(error.code)) {
        return res.json({ categories: [] });
      }
      throw error;
    }

    const categoryIds = (data || []).map(c => c.id);
    let threadCounts = {};
    
    if (categoryIds.length > 0) {
      const { data: threads } = await req.supabase
        .from('forum_threads')
        .select('category_id')
        .in('category_id', categoryIds)
        .eq('is_deleted', false);

      if (threads) {
        threads.forEach(t => {
          threadCounts[t.category_id] = (threadCounts[t.category_id] || 0) + 1;
        });
      }
    }

    const categoriesWithCounts = (data || []).map(c => ({
      ...c,
      thread_count: threadCounts[c.id] || 0
    }));

    res.json({ categories: categoriesWithCounts });
  } catch (err) {
    if (err.message?.includes('fetch')) return res.json({ categories: [] });
    console.error('❌ Forum categories error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST create category (Admin only)
router.post('/categories', async (req, res) => {
  try {
    // Check admin
    const { data: profile } = await req.supabase
      .from('profiles')
      .select('role')
      .eq('id', req.user.id)
      .single();

    if (profile?.role?.toUpperCase() !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { name, description, icon, color, sort_order, role_required } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const { data, error } = await req.supabase
      .from('forum_categories')
      .insert([{ name, description, icon: icon || '💬', color: color || '#A8FF3E', slug, sort_order: sort_order || 0 }])
      .select()
      .single();

    if (error) throw error;
    if (role_required !== undefined) {
      await req.supabase
        .from('forum_categories')
        .update({ role_required: role_required || null })
        .eq('id', data.id);
      data.role_required = role_required || null;
    }
    res.json({ category: data });
  } catch (err) {
    console.error('❌ Create category error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// PUT update category (Admin only)
router.put('/categories/:id', async (req, res) => {
  try {
    const { data: profile } = await req.supabase
      .from('profiles')
      .select('role')
      .eq('id', req.user.id)
      .single();

    if (profile?.role?.toUpperCase() !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { name, description, icon, color, sort_order, is_active, role_required } = req.body;
    const updates = {};
    if (name !== undefined) {
      updates.name = name;
      updates.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    if (description !== undefined) updates.description = description;
    if (icon !== undefined) updates.icon = icon;
    if (color !== undefined) updates.color = color;
    if (sort_order !== undefined) updates.sort_order = sort_order;
    if (is_active !== undefined) updates.is_active = is_active;
    if (role_required !== undefined) updates.role_required = role_required || null;

    const { data, error } = await req.supabase
      .from('forum_categories')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ category: data });
  } catch (err) {
    console.error('❌ Update category error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// DELETE category (Admin only — soft delete)
router.delete('/categories/:id', async (req, res) => {
  try {
    const { data: profile } = await req.supabase
      .from('profiles')
      .select('role')
      .eq('id', req.user.id)
      .single();

    if (profile?.role?.toUpperCase() !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { error } = await req.supabase
      .from('forum_categories')
      .update({ is_active: false })
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Delete category error:', err.message);
    res.status(500).json({ error: err.message });
  }
});


// ═══════════════════════════════════════════════════════
// FORUM THREADS (Auth: create, Public: read)
// ═══════════════════════════════════════════════════════

// GET threads for a category (with pagination)
router.get('/threads', async (req, res) => {
  try {
    const { category_id, page = 1, limit = 20, sort = 'newest' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = req.supabase
      .from('forum_threads')
      .select('*', { count: 'exact' })
      .eq('is_deleted', false);

    if (category_id) query = query.eq('category_id', category_id);

    if (sort === 'newest') query = query.order('is_pinned', { ascending: false }).order('created_at', { ascending: false });
    else if (sort === 'popular') query = query.order('is_pinned', { ascending: false }).order('upvotes', { ascending: false });
    else if (sort === 'active') query = query.order('is_pinned', { ascending: false }).order('last_reply_at', { ascending: false, nullsFirst: false });

    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    // Fetch author profiles
    const userIds = [...new Set((data || []).map(t => t.user_id))];
    let profiles = {};
    if (userIds.length > 0) {
      const { data: profilesData } = await req.supabase
        .from('profiles')
        .select('id, email, is_pro, role, avatar_url')
        .in('id', userIds);
      if (profilesData) {
        profilesData.forEach(p => { profiles[p.id] = p; });
      }
    }

    const threadsWithAuthors = (data || []).map(t => ({
      ...t,
      author: profiles[t.user_id] || null
    }));

    res.json({ threads: threadsWithAuthors, total: count, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error('❌ Forum threads error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET single thread with posts
router.get('/threads/:id', async (req, res) => {
  try {
    // Get thread
    const { data: thread, error: threadError } = await req.supabase
      .from('forum_threads')
      .select('*')
      .eq('id', req.params.id)
      .eq('is_deleted', false)
      .single();

    if (threadError) throw threadError;

    // Increment views
    await req.supabase
      .from('forum_threads')
      .update({ views: (thread.views || 0) + 1 })
      .eq('id', req.params.id);

    // Get posts
    const { data: posts, error: postsError } = await req.supabase
      .from('forum_posts')
      .select('*')
      .eq('thread_id', req.params.id)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true });

    if (postsError) throw postsError;

    // Get all user profiles involved
    const userIds = [...new Set([thread.user_id, ...(posts || []).map(p => p.user_id)])];
    let profiles = {};
    if (userIds.length > 0) {
      const { data: profilesData } = await req.supabase
        .from('profiles')
        .select('id, email, is_pro, role, avatar_url')
        .in('id', userIds);
      if (profilesData) {
        profilesData.forEach(p => { profiles[p.id] = p; });
      }
    }

    // Get category
    const { data: category } = await req.supabase
      .from('forum_categories')
      .select('*')
      .eq('id', thread.category_id)
      .single();

    res.json({
      thread: { ...thread, author: profiles[thread.user_id] || null },
      posts: (posts || []).map(p => ({ ...p, author: profiles[p.user_id] || null })),
      category
    });
  } catch (err) {
    console.error('❌ Forum thread detail error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST create thread (Auth required)
router.post('/threads', async (req, res) => {
  try {
    const { title, body, category_id, tags } = req.body;

    if (!title || title.length < 5) return res.status(400).json({ error: 'Title must be at least 5 characters' });
    if (!body || body.length < 10) return res.status(400).json({ error: 'Body must be at least 10 characters' });
    if (!category_id) return res.status(400).json({ error: 'Category is required' });

    // Get user profile for role check
    const { data: profile } = await req.supabase
      .from('profiles')
      .select('role, is_pro, tier, subscription_status, subscription_end_date')
      .eq('id', req.user.id)
      .single();

    // Check category role_required
    const { data: cat } = await req.supabase
      .from('forum_categories')
      .select('role_required')
      .eq('id', category_id)
      .single();

    const hasActiveSubscription = (
      profile?.tier === 'pro' &&
      profile?.subscription_status === 'active' &&
      profile?.subscription_end_date &&
      new Date(profile.subscription_end_date) > new Date()
    );
    const isProActive = Boolean(profile?.is_pro || hasActiveSubscription || profile?.role?.toUpperCase() === 'ADMIN');

    if ((cat?.role_required?.toUpperCase() === 'PRO') && !isProActive) {
      return res.status(403).json({ error: 'This category requires a Pro subscription' });
    }

    const { data, error } = await req.supabase
      .from('forum_threads')
      .insert([{
        title,
        body,
        category_id,
        user_id: req.user.id,
        tags: tags || [],
        reply_count: 0,
        upvotes: 0,
        views: 0,
        is_pinned: false,
        is_locked: false,
        is_deleted: false,
        last_reply_at: null
      }])
      .select()
      .single();

    if (error) throw error;
    res.json({ thread: data });
  } catch (err) {
    console.error('❌ Create thread error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// PUT update thread (Author or Admin)
router.put('/threads/:id', async (req, res) => {
  try {
    const { data: thread } = await req.supabase
      .from('forum_threads')
      .select('user_id')
      .eq('id', req.params.id)
      .single();

    const { data: profile } = await req.supabase
      .from('profiles')
      .select('role')
      .eq('id', req.user.id)
      .single();

    const isAdmin = profile?.role?.toUpperCase() === 'ADMIN';
    if (thread?.user_id !== req.user.id && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { title, body, tags, category_id, is_pinned, is_locked, is_deleted } = req.body;
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (body !== undefined) updates.body = body;
    if (tags !== undefined) updates.tags = tags;
    // Admin-only fields
    if (isAdmin) {
      if (category_id !== undefined) updates.category_id = category_id;
      if (is_pinned !== undefined) updates.is_pinned = is_pinned;
      if (is_locked !== undefined) updates.is_locked = is_locked;
      if (is_deleted !== undefined) updates.is_deleted = is_deleted;
    }

    const { data, error } = await req.supabase
      .from('forum_threads')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ thread: data });
  } catch (err) {
    console.error('❌ Update thread error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// DELETE thread (soft delete — Author or Admin)
router.delete('/threads/:id', async (req, res) => {
  try {
    const { data: thread } = await req.supabase
      .from('forum_threads')
      .select('user_id')
      .eq('id', req.params.id)
      .single();

    const { data: profile } = await req.supabase
      .from('profiles')
      .select('role')
      .eq('id', req.user.id)
      .single();

    if (thread?.user_id !== req.user.id && profile?.role?.toUpperCase() !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { error } = await req.supabase
      .from('forum_threads')
      .update({ is_deleted: true })
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Delete thread error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/admin/threads', async (req, res) => {
  try {
    const { page = 1, limit = 50, status = 'active', category_id, q = '' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = req.supabase
      .from('forum_threads')
      .select('*', { count: 'exact' });

    if (status === 'deleted' || status === 'hidden') query = query.eq('is_deleted', true);
    else if (status === 'locked') query = query.eq('is_locked', true).eq('is_deleted', false);
    else if (status === 'pinned') query = query.eq('is_pinned', true).eq('is_deleted', false);
    else if (status !== 'all') query = query.eq('is_deleted', false);

    if (category_id) query = query.eq('category_id', category_id);
    if (q) query = query.or(`title.ilike.%${q}%,body.ilike.%${q}%`);

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (error) throw error;

    const userIds = [...new Set((data || []).map(t => t.user_id).filter(Boolean))];
    const categoryIds = [...new Set((data || []).map(t => t.category_id).filter(Boolean))];
    const profiles = {};
    const categories = {};

    if (userIds.length > 0) {
      const { data: profileRows } = await req.supabase
        .from('profiles')
        .select('id, email, is_pro, role, avatar_url')
        .in('id', userIds);
      (profileRows || []).forEach(p => { profiles[p.id] = p; });
    }

    if (categoryIds.length > 0) {
      const { data: categoryRows } = await req.supabase
        .from('forum_categories')
        .select('id, name, color, slug')
        .in('id', categoryIds);
      (categoryRows || []).forEach(c => { categories[c.id] = c; });
    }

    res.json({
      threads: (data || []).map(t => ({
        ...t,
        author: profiles[t.user_id] || null,
        category: categories[t.category_id] || null
      })),
      total: count || 0,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (err) {
    console.error('❌ Admin forum threads error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post('/admin/threads/:id/action', async (req, res) => {
  try {
    const { action, title, body, tags, category_id } = req.body;
    const updates = {};

    if (action === 'pin') updates.is_pinned = true;
    else if (action === 'unpin') updates.is_pinned = false;
    else if (action === 'lock') updates.is_locked = true;
    else if (action === 'unlock') updates.is_locked = false;
    else if (action === 'hide' || action === 'delete') updates.is_deleted = true;
    else if (action === 'restore') updates.is_deleted = false;
    else if (action === 'edit') {
      if (title !== undefined) updates.title = title;
      if (body !== undefined) updates.body = body;
      if (tags !== undefined) updates.tags = tags;
      if (category_id !== undefined) updates.category_id = category_id;
    } else if (action === 'move') {
      if (!category_id) return res.status(400).json({ error: 'category_id required' });
      updates.category_id = category_id;
    } else {
      return res.status(400).json({ error: 'Unsupported action' });
    }

    const { data, error } = await req.supabase
      .from('forum_threads')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Thread not found' });

    res.json({ success: true, thread: data });
  } catch (err) {
    console.error('❌ Forum admin action error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST upvote thread
router.post('/threads/:id/upvote', async (req, res) => {
  try {
    // Check existing vote
    const { data: existing } = await req.supabase
      .from('forum_votes')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('thread_id', req.params.id)
      .maybeSingle();

    if (existing) {
      // Remove vote
      await req.supabase.from('forum_votes').delete().eq('id', existing.id);
      const { data: thread } = await req.supabase
        .from('forum_threads')
        .select('upvotes')
        .eq('id', req.params.id)
        .single();
      await req.supabase.from('forum_threads')
        .update({ upvotes: Math.max(0, (thread?.upvotes || 1) - 1) })
        .eq('id', req.params.id);
      return res.json({ voted: false });
    }

    // Add vote
    await req.supabase.from('forum_votes').insert([{
      user_id: req.user.id,
      thread_id: req.params.id
    }]);
    const { data: thread } = await req.supabase
      .from('forum_threads')
      .select('upvotes')
      .eq('id', req.params.id)
      .single();
    await req.supabase.from('forum_threads')
      .update({ upvotes: (thread?.upvotes || 0) + 1 })
      .eq('id', req.params.id);

    res.json({ voted: true });
  } catch (err) {
    console.error('❌ Upvote error:', err.message);
    res.status(500).json({ error: err.message });
  }
});


// ═══════════════════════════════════════════════════════
// FORUM POSTS / REPLIES (Auth: create, Public: read)
// ═══════════════════════════════════════════════════════

// POST create reply
router.post('/posts', async (req, res) => {
  try {
    const { thread_id, body, parent_id } = req.body;

    if (!body || body.length < 2) return res.status(400).json({ error: 'Reply too short' });

    // Check if thread is locked
    const { data: thread } = await req.supabase
      .from('forum_threads')
      .select('is_locked')
      .eq('id', thread_id)
      .single();

    if (thread?.is_locked) return res.status(403).json({ error: 'This thread is locked' });

    const { data, error } = await req.supabase
      .from('forum_posts')
      .insert([{
        thread_id,
        user_id: req.user.id,
        body,
        parent_id: parent_id || null,
        upvotes: 0,
        is_deleted: false
      }])
      .select()
      .single();

    if (error) throw error;

    // Update thread reply count and last_reply_at
    // Try RPC first, fall back to direct update
    let rpcWorked = false;
    try {
      const { error: rpcError } = await req.supabase.rpc('increment_reply_count', { thread_id_param: thread_id });
      if (!rpcError) rpcWorked = true;
    } catch (_) {
      // RPC doesn't exist, use fallback
    }

    if (!rpcWorked) {
      // Direct update as fallback
      const { data: currentThread } = await req.supabase
        .from('forum_threads')
        .select('reply_count')
        .eq('id', thread_id)
        .single();
      
      await req.supabase.from('forum_threads')
        .update({ 
          reply_count: (currentThread?.reply_count || 0) + 1,
          last_reply_at: new Date().toISOString()
        })
        .eq('id', thread_id);
    }

    res.json({ post: data });
  } catch (err) {
    console.error('❌ Create post error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// DELETE post (Author or Admin)
router.delete('/posts/:id', async (req, res) => {
  try {
    const { data: post } = await req.supabase
      .from('forum_posts')
      .select('user_id')
      .eq('id', req.params.id)
      .single();

    const { data: profile } = await req.supabase
      .from('profiles')
      .select('role')
      .eq('id', req.user.id)
      .single();

    if (post?.user_id !== req.user.id && profile?.role?.toUpperCase() !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { error } = await req.supabase
      .from('forum_posts')
      .update({ is_deleted: true })
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Delete post error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.put('/posts/:id', async (req, res) => {
  try {
    const { data: post } = await req.supabase
      .from('forum_posts')
      .select('user_id')
      .eq('id', req.params.id)
      .single();

    const admin = await isForumAdmin(req);
    if (post?.user_id !== req.user.id && !admin) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { body, is_deleted } = req.body;
    const updates = {};
    if (body !== undefined) updates.body = body;
    if (admin && is_deleted !== undefined) updates.is_deleted = is_deleted;

    const { data, error } = await req.supabase
      .from('forum_posts')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ post: data });
  } catch (err) {
    console.error('❌ Update post error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST upvote post
router.post('/posts/:id/upvote', async (req, res) => {
  try {
    const { data: existing } = await req.supabase
      .from('forum_votes')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('post_id', req.params.id)
      .maybeSingle();

    if (existing) {
      await req.supabase.from('forum_votes').delete().eq('id', existing.id);
      const { data: post } = await req.supabase.from('forum_posts').select('upvotes').eq('id', req.params.id).single();
      await req.supabase.from('forum_posts').update({ upvotes: Math.max(0, (post?.upvotes || 1) - 1) }).eq('id', req.params.id);
      return res.json({ voted: false });
    }

    await req.supabase.from('forum_votes').insert([{ user_id: req.user.id, post_id: req.params.id }]);
    const { data: post } = await req.supabase.from('forum_posts').select('upvotes').eq('id', req.params.id).single();
    await req.supabase.from('forum_posts').update({ upvotes: (post?.upvotes || 0) + 1 }).eq('id', req.params.id);

    res.json({ voted: true });
  } catch (err) {
    console.error('❌ Upvote post error:', err.message);
    res.status(500).json({ error: err.message });
  }
});


// ═══════════════════════════════════════════════════════
// ADMIN: FORUM STATS
// ═══════════════════════════════════════════════════════

router.get('/admin/stats', async (req, res) => {
  try {
    const { count: threadCount } = await req.supabase.from('forum_threads').select('*', { count: 'exact', head: true }).eq('is_deleted', false);
    const { count: hiddenThreadCount } = await req.supabase.from('forum_threads').select('*', { count: 'exact', head: true }).eq('is_deleted', true);
    const { count: lockedThreadCount } = await req.supabase.from('forum_threads').select('*', { count: 'exact', head: true }).eq('is_locked', true).eq('is_deleted', false);
    const { count: pinnedThreadCount } = await req.supabase.from('forum_threads').select('*', { count: 'exact', head: true }).eq('is_pinned', true).eq('is_deleted', false);
    const { count: postCount } = await req.supabase.from('forum_posts').select('*', { count: 'exact', head: true }).eq('is_deleted', false);
    const { count: categoryCount } = await req.supabase.from('forum_categories').select('*', { count: 'exact', head: true }).eq('is_active', true);

    // Recent threads for moderation
    const { data: recentThreads } = await req.supabase
      .from('forum_threads')
      .select('*')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(20);

    res.json({
      stats: {
        threads: threadCount || 0,
        posts: postCount || 0,
        categories: categoryCount || 0,
        hiddenThreads: hiddenThreadCount || 0,
        lockedThreads: lockedThreadCount || 0,
        pinnedThreads: pinnedThreadCount || 0
      },
      recentThreads: recentThreads || []
    });
  } catch (err) {
    console.error('❌ Forum stats error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════
// USER PROFILES & LEADERBOARD
// ═══════════════════════════════════════════════════════

router.get('/leaderboard', async (req, res) => {
  try {
    const { data: threads } = await req.supabase.from('forum_threads').select('user_id, upvotes').gt('upvotes', 0);
    const { data: posts } = await req.supabase.from('forum_posts').select('user_id, upvotes').gt('upvotes', 0);
    
    let scores = {};
    (threads || []).forEach(t => { scores[t.user_id] = (scores[t.user_id] || 0) + (t.upvotes || 0); });
    (posts || []).forEach(p => { scores[p.user_id] = (scores[p.user_id] || 0) + (p.upvotes || 0); });

    const sortedUserIds = Object.entries(scores).sort((a, b) => b[1] - a[1]).slice(0, 50).map(x => x[0]);
    
    if (sortedUserIds.length === 0) {
      return res.json({ leaderboard: [] });
    }

    const { data: profiles } = await req.supabase
      .from('profiles')
      .select('id, email, is_pro, role, avatar_url')
      .in('id', sortedUserIds);
      
    const leaderboard = profiles.map(p => ({
      ...p,
      popularity: scores[p.id] || 0,
      username: p.email ? p.email.split('@')[0] : 'Unknown'
    })).sort((a, b) => b.popularity - a.popularity);

    res.json({ leaderboard });
  } catch (err) {
    console.error('❌ Leaderboard error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data: profile } = await req.supabase
      .from('profiles')
      .select('id, email, is_pro, role, avatar_url, created_at')
      .eq('id', id)
      .single();

    if (!profile) return res.status(404).json({ error: 'User not found' });

    // Calculate popularity and stats
    const { data: threads } = await req.supabase.from('forum_threads').select('upvotes').eq('user_id', id);
    const { data: posts } = await req.supabase.from('forum_posts').select('upvotes').eq('user_id', id);

    let popularity = 0;
    (threads || []).forEach(t => popularity += (t.upvotes || 0));
    (posts || []).forEach(p => popularity += (p.upvotes || 0));

    // Get recent activity
    const { data: recentThreads } = await req.supabase
      .from('forum_threads')
      .select('id, title, created_at, category_id, upvotes, reply_count')
      .eq('user_id', id)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(5);

    res.json({
      profile: {
        ...profile,
        username: profile.email ? profile.email.split('@')[0] : 'Unknown',
        popularity,
        threadCount: threads?.length || 0,
        postCount: posts?.length || 0
      },
      recentThreads: recentThreads || []
    });
  } catch (err) {
    console.error('❌ Profile fetch error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
