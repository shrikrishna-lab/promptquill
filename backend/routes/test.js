import express from 'express';
import { ProviderManager } from '../lib/providerManager.js';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();
const providerManager = new ProviderManager();

router.post('/provider', async (req, res) => {
  try {
    const { provider, apiKey, cfAccountId } = req.body;
    if (!provider) return res.status(400).json({ error: 'provider required' });
    const result = await providerManager.testProvider(provider, apiKey, { cfAccountId });
    res.json({
      valid: result.valid,
      model: result.model,
      latency: result.latency,
      error: result.error || null,
    });
  } catch (err) {
    res.json({ valid: false, error: err.message });
  }
});

router.post('/supabase', async (req, res) => {
  try {
    const { url, anonKey } = req.body;
    if (!url || !anonKey) return res.status(400).json({ error: 'url and anonKey required' });

    const client = createClient(url, anonKey);
    const { error } = await client.from('health_check').select('*').limit(1);

    if (error) {
      const okCodes = ['PGRST116', '42P01', 'PGRST205', 'PGRST200', 'PGRST204'];
      if (okCodes.includes(error.code)) return res.json({ valid: true });
      return res.json({ valid: false, error: error.message });
    }
    res.json({ valid: true });
  } catch (err) {
    const msg = err.message?.includes('fetch')
      ? 'Could not reach Supabase. Check the URL is correct and your project is not paused.'
      : err.message;
    res.json({ valid: false, error: msg });
  }
});

router.get('/models', async (req, res) => {
  res.json(await providerManager.listModels({}));
});

export default router;
