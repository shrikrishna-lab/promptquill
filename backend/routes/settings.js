import express from 'express';
import { KeyStore } from '../lib/keyStore.js';
import { ProviderManager } from '../lib/providerManager.js';

const router = express.Router();
const providerManager = new ProviderManager();

router.post('/', async (req, res) => {
  try {
    const { userId, ...keys } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required' });

    const keyStore = new KeyStore(req.supabase);
    await keyStore.saveKeys(userId, keys);
    res.json({ success: true });
  } catch (err) {
    console.error('[Settings] Save error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const keyStore = new KeyStore(req.supabase);
    const keys = await keyStore.getKeys(userId);
    
    const configuredProviders = keyStore.getConfiguredProviders(keys);
    res.json({
      configuredProviders,
      primaryProvider: keys?.primaryProvider || 'openai',
      hasKeys: (configuredProviders || []).length > 0,
    });
  } catch (err) {
    const okCodes = ['PGRST116', '42P01', 'PGRST205'];
    if (okCodes.some(c => err.message?.includes(c) || err.code === c)) {
      return res.json({ configuredProviders: [], primaryProvider: 'openai', hasKeys: false });
    }
    console.error('[Settings] Get error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
