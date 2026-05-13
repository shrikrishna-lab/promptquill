import express from 'express';

const router = express.Router();

router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { data: briefs, error } = await req.supabase
      .from('briefs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      const okCodes = ['PGRST116', '42P01', 'PGRST205'];
      if (okCodes.includes(error.code) || error.message?.includes('fetch')) {
        return res.json({ briefs: [] });
      }
      throw error;
    }
    res.json({ briefs: briefs || [] });
  } catch (err) {
    const dbOk = ['PGRST205', 'PGRST116', '42P01'];
    if (dbOk.includes(err.code) || err.message?.includes('Could not find the table') || err.message?.includes('fetch')) {
      return res.json({ briefs: [] });
    }
    console.error('[Briefs] List error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/detail/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data: brief, error } = await req.supabase
      .from('briefs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      const okCodes = ['PGRST116', '42P01', 'PGRST205'];
      if (okCodes.includes(error.code) || error.message?.includes('fetch')) {
        return res.json({ brief: null });
      }
      throw error;
    }

    res.json({ brief });
  } catch (err) {
    const dbOk = ['PGRST205', 'PGRST116', '42P01'];
    if (dbOk.includes(err.code) || err.message?.includes('Could not find the table') || err.message?.includes('fetch')) {
      return res.json({ brief: null });
    }
    console.error('[Briefs] Get error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/publish', async (req, res) => {
  try {
    const { id } = req.params;
    const { data: brief, error: fetchError } = await req.supabase
      .from('briefs')
      .select('is_public')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Brief not found' });
      }
      throw fetchError;
    }

    const newVisibility = !brief.is_public;
    const { data: updated, error: updateError } = await req.supabase
      .from('briefs')
      .update({ is_public: newVisibility })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    res.json({ brief: updated, message: `Brief is now ${newVisibility ? 'public' : 'private'}` });
  } catch (err) {
    console.error('[Briefs] Publish toggle error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
