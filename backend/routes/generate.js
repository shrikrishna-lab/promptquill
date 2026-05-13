import express from 'express';
import { ProviderManager } from '../lib/providerManager.js';
import { KeyStore } from '../lib/keyStore.js';
import { PromptBuilder } from '../lib/promptBuilder.js';

const router = express.Router();
const providerManager = new ProviderManager();

router.post('/', async (req, res) => {
  try {
    const { userId, ideaInput, mode = 'GENERAL', personality = 'BOT', preferredProvider, selectedModels } = req.body;
    const systemPrompt = PromptBuilder.getPrompt(mode.toUpperCase(), personality.toUpperCase());
    const keyStore = new KeyStore(req.supabase);
    const userKeys = await keyStore.getKeys(userId);
    
    if (!userKeys) {
      return res.status(400).json({ error: 'No API keys found. Add keys in Settings first.' });
    }

    const configured = keyStore.getConfiguredProviders(userKeys);
    if (configured.length === 0) {
      return res.status(400).json({ error: 'No AI providers configured. Add at least one API key.' });
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    const modelsConfig = selectedModels || {};
    const getModel = (providerId) => modelsConfig[providerId] || null;

    const result = await providerManager.generateWithFallback(
      userKeys,
      systemPrompt,
      ideaInput,
      preferredProvider,
      getModel,
    );

    const { data: brief, error } = await req.supabase
      .from('briefs')
      .insert([{
        user_id: userId,
        title: ideaInput.slice(0, 100),
        idea_input: ideaInput,
        mode: mode.toUpperCase(),
        personality: personality.toUpperCase(),
        provider_used: result.provider,
        tabs: { full_brief: result.content || '' },
      }])
      .select()
      .single();

    if (error) {
      const okCodes = ['PGRST116', '42P01', 'PGRST205'];
      if (okCodes.includes(error.code) || error.message?.includes('Could not find the table')) {
        res.write(`data: ${JSON.stringify({ type: 'done', briefId: null, provider: result.provider, providerName: result.providerName, content: result.content, note: 'Brief generated but not saved - setup database tables first' })}\n\n`);
        res.end();
        return;
      }
      throw error;
    }

    res.write(`data: ${JSON.stringify({ type: 'done', briefId: brief.id, provider: result.provider, providerName: result.providerName, content: result.content })}\n\n`);
    res.end();
  } catch (err) {
    console.error('[Generate] Error:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    } else {
      res.write(`data: ${JSON.stringify({ type: 'error', error: err.message })}\n\n`);
      res.end();
    }
  }
});

export default router;
