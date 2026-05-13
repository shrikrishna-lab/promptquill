import express from 'express';
import * as features from '../utils/features.js';
import { calculateCreditsNeeded, deductCredits, checkCredits } from '../utils/credits.js';


const router = express.Router();

// ═══════════════════════════════════════════════════════════════════
// PROMPT BATTLE ROUTES
// ═══════════════════════════════════════════════════════════════════

router.post('/battles/create', async (req, res) => {
  try {
    const { title, description, promptA, promptB } = req.body;
    const userId = req.body.userId || '00000000-0000-0000-0000-000000000000';

    if (!userId || !title || !promptA || !promptB) {
      return res.status(400).json({ error: 'Missing required fields: title, promptA, promptB' });
    }

    if (promptA.trim().length < 5 || promptB.trim().length < 5) {
      return res.status(400).json({ error: 'Prompts must be at least 5 characters long' });
    }

    const result = await features.createBattle(userId, title, description, promptA, promptB);
    res.json(result);
  } catch (err) {
    console.error('Error creating battle:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/battles/:battleId/vote', async (req, res) => {
  try {
    const { battleId } = req.params;
    const { vote } = req.body;
    const userId = req.body.userId || '00000000-0000-0000-0000-000000000000';

    if (!battleId) {
      return res.status(400).json({ error: 'Battle ID required' });
    }

    if (!userId || !vote || !['a', 'b'].includes(vote)) {
      return res.status(400).json({ error: 'Invalid vote (must be "a" or "b")' });
    }

    const result = await features.recordBattleVote(battleId, userId, vote);
    res.json(result);
  } catch (err) {
    console.error('Error recording vote:', err);
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════
// ACHIEVEMENTS ROUTES
// ═══════════════════════════════════════════════════════════════════

router.get('/achievements/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const result = await features.getUserAchievements(userId);
    res.json(result);
  } catch (err) {
    console.error('Error fetching achievements:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/achievements/check/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const result = await features.checkAndUnlockAchievements(userId);
    res.json(result);
  } catch (err) {
    console.error('Error checking achievements:', err);
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════
// COLLABORATION ROUTES
// ═══════════════════════════════════════════════════════════════════

router.post('/collab/create', async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.body.userId || '00000000-0000-0000-0000-000000000000';

    if (!userId || !title) {
      return res.status(400).json({ error: 'Title required' });
    }

    if (title.trim().length < 3) {
      return res.status(400).json({ error: 'Title must be at least 3 characters' });
    }

    const result = await features.createCollabRoom(userId, title, description);
    res.json(result);
  } catch (err) {
    console.error('Error creating collab room:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/collab/:roomId/join', async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.body.userId || '00000000-0000-0000-0000-000000000000';

    if (!roomId) {
      return res.status(400).json({ error: 'Room ID required' });
    }

    const result = await features.joinCollabRoom(roomId, userId);
    res.json(result);
  } catch (err) {
    console.error('Error joining collab room:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/collab/:roomId/update', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { content, changeSummary } = req.body;
    const userId = req.body.userId || '00000000-0000-0000-0000-000000000000';

    if (!roomId) {
      return res.status(400).json({ error: 'Room ID required' });
    }

    if (!content) {
      return res.status(400).json({ error: 'Content required' });
    }

    // Calculate credits needed based on content length (5-10 credits)
    const creditsNeeded = calculateCreditsNeeded(content, 'validate');
    const creditCheck = await checkCredits(req.app.locals.supabase, userId, creditsNeeded);
    
    if (!creditCheck.hasSufficient) {
      return res.status(402).json({
        error: 'insufficient_credits',
        message: `Collaboration update requires ${creditsNeeded} credits. You have ${creditCheck.current} credits.`,
        required: creditsNeeded,
        current: creditCheck.current
      });
    }

    const result = await features.updateCollabContent(roomId, userId, content, changeSummary);
    
    // Deduct credits after successful update
    await deductCredits(
      req.app.locals.supabase,
      userId,
      creditsNeeded,
      'Collaboration content update',
      'collab'
    );

    res.json({
      ...result,
      creditsDeducted: creditsNeeded,
      message: `✅ Content updated! ${creditsNeeded} credits deducted.`
    });
  } catch (err) {
    console.error('Error updating collab content:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/collab/:roomId/history', async (req, res) => {
  try {
    const { roomId } = req.params;

    if (!roomId) {
      return res.status(400).json({ error: 'Room ID required' });
    }

    const result = await features.getCollabRoomHistory(roomId);
    
    // Return history with timestamp
    res.json({
      roomId,
      history: result,
      retrievedAt: new Date().toISOString(),
      count: (result || []).length
    });
  } catch (err) {
    console.error('Error fetching collab history:', err);
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════
// ENGAGEMENT ROUTES (Likes, etc)
// ═══════════════════════════════════════════════════════════════════

router.post('/prompts/:promptId/like', async (req, res) => {
  try {
    const { promptId } = req.params;
    const userId = req.body.userId || '00000000-0000-0000-0000-000000000000';

    if (!promptId) {
      return res.status(400).json({ error: 'Prompt ID required' });
    }

    const result = await features.togglePromptLike(promptId, userId);
    res.json(result);
  } catch (err) {
    console.error('Error toggling like:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/prompts/:promptId/engagement', async (req, res) => {
  try {
    const { promptId } = req.params;

    if (!promptId) {
      return res.status(400).json({ error: 'Prompt ID required' });
    }

    const result = await features.getPromptEngagement(promptId);
    res.json(result);
  } catch (err) {
    console.error('Error fetching engagement:', err);
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════
// REMIX ROUTES
// ═══════════════════════════════════════════════════════════════════

router.post('/prompts/:promptId/remix', async (req, res) => {
  try {
    const { promptId } = req.params;
    const { title, description } = req.body;
    const userId = req.body.userId || '00000000-0000-0000-0000-000000000000';

    if (!promptId) {
      return res.status(400).json({ error: 'Prompt ID required' });
    }

    if (!title || title.trim().length < 3) {
      return res.status(400).json({ error: 'Title must be at least 3 characters' });
    }

    // Refinement/Remix requires 20 credits
    const creditsNeeded = 20;
    const creditCheck = await checkCredits(req.app.locals.supabase, userId, creditsNeeded);
    
    if (!creditCheck.hasSufficient) {
      return res.status(402).json({
        error: 'insufficient_credits',
        message: `Refinement requires ${creditsNeeded} credits. You have ${creditCheck.current} credits.`,
        required: creditsNeeded,
        current: creditCheck.current
      });
    }

    // Perform remix
    const result = await features.remixPrompt(promptId, userId, title, description);
    
    // Deduct credits after successful remix
    await deductCredits(
      req.app.locals.supabase,
      userId,
      creditsNeeded,
      'Prompt refinement/remix',
      'remix'
    );

    res.json({
      ...result,
      creditsDeducted: creditsNeeded,
      message: `✅ Prompt remixed successfully! ${creditsNeeded} credits deducted.`
    });
  } catch (err) {
    console.error('Error remixing prompt:', err);
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════
// HEALTH CHECK
// ═══════════════════════════════════════════════════════════════════

router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'features-api' });
});

export default router;
