import express from 'express';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const { mode } = req.query;

    let query = req.supabase
      .from('briefs')
      .select('*, profiles!inner(username, avatar_url, display_name)', { count: 'exact' })
      .eq('is_public', true);

    if (mode) {
      query = query.eq('mode', mode);
    }

    const { data: briefs, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      const okCodes = ['PGRST116', '42P01', 'PGRST205'];
      if (okCodes.includes(error.code) || error.message?.includes('fetch') || error.message?.includes('Failed to fetch')) {
        return res.json({ briefs: [], pagination: { page, limit, total: 0, totalPages: 0, hasNext: false, hasPrev: false } });
      }
      throw error;
    }

    const totalPages = Math.ceil((count || 0) / limit);

    res.json({
      briefs: briefs || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (err) {
    console.error('[Community] List error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
