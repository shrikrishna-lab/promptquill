/**
 * Blog Routes - Public blog endpoints
 */

/**
 * GET /api/blog
 * Get all published blog posts
 */
const getBlogPosts = async (req, res) => {
  try {
    const supabase = req.supabase;
    
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error) {
      if (error.message?.includes('fetch') || error.code === 'PGRST205' || error.code === '42P01') {
        return res.json([]);
      }
      console.error('[Blog] Error fetching posts:', error);
      return res.status(500).json({ error: 'Failed to fetch blog posts' });
    }

    res.json(data || []);
  } catch (err) {
    if (err.message?.includes('fetch')) return res.json([]);
    console.error('[Blog] Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * GET /api/blog/:idOrSlug
 * Get a single blog post by ID or slug
 */
const getBlogPost = async (req, res) => {
  try {
    const supabase = req.supabase;
    const { idOrSlug } = req.params;
    
    // First try by slug
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .or(`slug.eq.${idOrSlug},id.eq.${idOrSlug}`)
      .eq('is_published', true)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    res.json(data);
  } catch (err) {
    console.error('[Blog] Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export { getBlogPosts, getBlogPost };
