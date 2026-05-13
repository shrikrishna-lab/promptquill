/**
 * PromptQuill UNIQUE Achievement System
 * 25+ exclusive badges created ONLY for this AI prompt platform
 * Each achievement has clear tasks and progress tracking
 */

export const ACHIEVEMENTS = {
  // === PROMPT CRAFTING TIER ===
  FIRST_SPARK: {
    id: 'first_spark',
    name: '✨ First Spark',
    description: 'Generate your first AI prompt',
    tasks: ['Generate 1 prompt in any mode'],
    icon: '✨',
    color: '#06b6d4',
    unlock: { type: 'prompts', value: 1 },
    rarity: 'common',
    reward: '+50 XP'
  },
  PROMPT_ALCHEMIST: {
    id: 'prompt_alchemist',
    name: '🧪 Prompt Alchemist',
    description: 'Generate 25 prompts - you\'re crafting with precision',
    tasks: ['Generate 25 different prompts'],
    icon: '🧪',
    color: '#8b5cf6',
    unlock: { type: 'prompts', value: 25 },
    rarity: 'uncommon',
    reward: '+200 XP + 100 credits'
  },
  REMIX_MASTER: {
    id: 'remix_master',
    name: '🎵 Remix Master',
    description: 'Use variations feature 10 times to evolve your prompts',
    tasks: ['Use prompt variations 10 times'],
    icon: '🎵',
    color: '#ec4899',
    unlock: { type: 'prompts', value: 25 },
    rarity: 'rare',
    reward: '+300 XP'
  },
  PROMPT_MASTER: {
    id: 'prompt_master',
    name: '🏆 Prompt Master',
    description: 'Create 100 prompts - you\'re an expert now',
    tasks: ['Generate 100 high-quality prompts'],
    icon: '🏆',
    color: '#fbbf24',
    unlock: { type: 'prompts', value: 100 },
    rarity: 'epic',
    reward: '+500 XP + Premium Badge'
  },

  // === MODE SPECIALISTS ===
  STARTUP_ARCHITECT: {
    id: 'startup_architect',
    name: '🚀 Startup Architect',
    description: 'Generate 15 startup ideas - build the future',
    tasks: ['Create 15 startup mode prompts'],
    icon: '🚀',
    color: '#f97316',
    unlock: { type: 'mode_count', value: { mode: 'STARTUP', count: 15 } },
    rarity: 'rare',
    reward: '+250 XP'
  },
  CODE_SORCERER: {
    id: 'code_sorcerer',
    name: '💻 Code Sorcerer',
    description: 'Generate 20 coding prompts - conjure elegant solutions',
    tasks: ['Create 20 coding mode prompts'],
    icon: '💻',
    color: '#3b82f6',
    unlock: { type: 'mode_count', value: { mode: 'CODING', count: 20 } },
    rarity: 'rare',
    reward: '+300 XP'
  },
  CONTENT_WIZARD: {
    id: 'content_wizard',
    name: '✍️ Content Wizard',
    description: 'Generate 15 content ideas - captivate audiences',
    tasks: ['Create 15 content mode prompts'],
    icon: '✍️',
    color: '#10b981',
    unlock: { type: 'mode_count', value: { mode: 'CONTENT', count: 15 } },
    rarity: 'rare',
    reward: '+250 XP'
  },
  RENAISSANCE_CREATOR: {
    id: 'renaissance_creator',
    name: '🎨 Renaissance Creator',
    description: 'Master all 4 modes - true multi-disciplinary creator',
    tasks: ['Generate prompts in ALL 4 modes'],
    icon: '🎨',
    color: '#a78bfa',
    unlock: { type: 'all_modes', value: true },
    rarity: 'epic',
    reward: '+500 XP + Gold Badge'
  },

  // === CREATOR JOURNEY ===
  FIRST_BUILD: {
    id: 'first_build',
    name: '🛠️ First Build',
    description: 'Ship your first idea into production',
    tasks: ['Click "Ship" on a prompt'],
    icon: '🛠️',
    color: '#f59e0b',
    unlock: { type: 'shipped', value: 1 },
    rarity: 'rare',
    reward: '+350 XP + Builder Badge'
  },
  SHIPPING_LEGEND: {
    id: 'shipping_legend',
    name: '📦 Shipping Legend',
    description: 'Successfully ship 10 ideas - prove you can execute',
    tasks: ['Ship 10 different ideas'],
    icon: '📦',
    color: '#06b6d4',
    unlock: { type: 'shipped', value: 10 },
    rarity: 'epic',
    reward: '+600 XP + Premium Feature'
  },
  ITERATION_SPRINT: {
    id: 'iteration_sprint',
    name: '♻️ Iteration Sprint',
    description: 'Generate 10+ versions of the same prompt - iterate like a pro',
    tasks: ['Create 10 variations of one idea'],
    icon: '♻️',
    color: '#10b981',
    unlock: { type: 'max_versions', value: 10 },
    rarity: 'uncommon',
    reward: '+200 XP'
  },

  // === COMMUNITY IMPACT ===
  PUBLIC_DEBUT: {
    id: 'public_debut',
    name: '🌍 Public Debut',
    description: 'Share your first idea publicly - go viral',
    tasks: ['Make 1 prompt public'],
    icon: '🌍',
    color: '#06b6d4',
    unlock: { type: 'public_ideas', value: 1 },
    rarity: 'uncommon',
    reward: '+100 XP'
  },
  COMMUNITY_CONTRIBUTOR: {
    id: 'community_contributor',
    name: '🤝 Community Contributor',
    description: 'Publish 10 ideas publicly - build your portfolio',
    tasks: ['Share 10 prompts publicly'],
    icon: '🤝',
    color: '#8b5cf6',
    unlock: { type: 'public_ideas', value: 10 },
    rarity: 'rare',
    reward: '+300 XP + Public Creator Badge'
  },
  VIRAL_MOMENT: {
    id: 'viral_moment',
    name: '🔥 Viral Moment',
    description: 'Get 25+ upvotes on a single prompt - create magic',
    tasks: ['Achieve 25 upvotes on any idea'],
    icon: '🔥',
    color: '#ef4444',
    unlock: { type: 'top_upvotes', value: 25 },
    rarity: 'epic',
    reward: '+400 XP + Featured Credit'
  },
  COMMUNITY_ROCKSTAR: {
    id: 'community_rockstar',
    name: '⭐ Community Rockstar',
    description: 'Accumulate 100+ total upvotes - you\'re a star',
    tasks: ['Earn 100 total community upvotes'],
    icon: '⭐',
    color: '#fbbf24',
    unlock: { type: 'total_upvotes', value: 100 },
    rarity: 'epic',
    reward: '+700 XP + Leaderboard Feature'
  },

  // === PLATFORM POWER USER ===
  EARLY_PIONEER: {
    id: 'early_pioneer',
    name: '🎖️ Early Pioneer',
    description: 'Join PromptQuill in its first month - you saw the vision',
    tasks: ['Account created in February 2026'],
    icon: '🎖️',
    color: '#a78bfa',
    unlock: { type: 'joined_date', value: '2026-02-28' },
    rarity: 'epic',
    reward: '+800 XP + Exclusive OG Badge'
  },
  CREDIT_INVESTOR: {
    id: 'credit_investor',
    name: '💎 Credit Investor',
    description: 'Spend 1000+ credits exploring premium features',
    tasks: ['Use 1000 credits'],
    icon: '💎',
    color: '#ec4899',
    unlock: { type: 'credits_spent', value: 1000 },
    rarity: 'rare',
    reward: '+500 XP + Premium Tier'
  },
  DAILY_GRINDER: {
    id: 'daily_grinder',
    name: '🔥 Daily Grinder',
    description: 'Generate prompts for 7 consecutive days - stay consistent',
    tasks: ['Create at least 1 prompt per day for 7 days'],
    icon: '🔥',
    color: '#f97316',
    unlock: { type: 'streak', value: 7 },
    rarity: 'rare',
    reward: '+300 XP'
  },
  UNSTOPPABLE_FORCE: {
    id: 'unstoppable_force',
    name: '💫 Unstoppable Force',
    description: 'Maintain a 30-day generation streak - become legendary',
    tasks: ['Create prompts every single day for 30 days'],
    icon: '💫',
    color: '#a78bfa',
    unlock: { type: 'streak', value: 30 },
    rarity: 'epic',
    reward: '+1000 XP + Leaderboard Position'
  },

  // === NETWORK EFFECT ===
  FIRST_INVITE: {
    id: 'first_invite',
    name: '📣 First Invite',
    description: 'Refer your first user - spread the magic',
    tasks: ['Send a referral link'],
    icon: '📣',
    color: '#06b6d4',
    unlock: { type: 'referrals', value: 1 },
    rarity: 'uncommon',
    reward: '+150 XP + Free Credits'
  },
  NETWORK_BUILDER: {
    id: 'network_builder',
    name: '🌐 Network Builder',
    description: 'Refer 5 users - build your community',
    tasks: ['Successfully refer 5 people'],
    icon: '🌐',
    color: '#8b5cf6',
    unlock: { type: 'referrals', value: 5 },
    rarity: 'rare',
    reward: '+400 XP + Referral Bonus'
  },
  INFLUENCER_TIER: {
    id: 'influencer_tier',
    name: '👑 Influencer Tier',
    description: 'Refer 20+ users - you\'re a true influencer',
    tasks: ['Build a network of 20+ users'],
    icon: '👑',
    color: '#fbbf24',
    unlock: { type: 'referrals', value: 20 },
    rarity: 'epic',
    reward: '+800 XP + VIP Status'
  },

  // === ACHIEVEMENT COLLECTOR ===
  ACHIEVEMENT_HUNTER: {
    id: 'achievement_hunter',
    name: '🎯 Achievement Hunter',
    description: 'Unlock 10 achievements - meta achievement unlocked!',
    tasks: ['Achieve 10 different badges'],
    icon: '🎯',
    color: '#06b6d4',
    unlock: { type: 'achievement_count', value: 10 },
    rarity: 'rare',
    reward: '+300 XP'
  },
  COMPLETIONIST: {
    id: 'completionist',
    name: '🏅 Completionist',
    description: 'Unlock 20 achievements - you\'re the ultimate completionist',
    tasks: ['Achieve 20 different badges'],
    icon: '🏅',
    color: '#fbbf24',
    unlock: { type: 'achievement_count', value: 20 },
    rarity: 'epic',
    reward: '+1000 XP + Platinum Badge + Exclusive Feature'
  },

  // === PERFECT SCORE ===
  FLAWLESS_EXECUTION: {
    id: 'flawless_execution',
    name: '💯 Flawless Execution',
    description: 'Achieve a perfect 10/10 score - something truly exceptional',
    tasks: ['Generate a prompt rated 10/10'],
    icon: '💯',
    color: '#ec4899',
    unlock: { type: 'score', value: 10 },
    rarity: 'epic',
    reward: '+600 XP + Hall of Fame Entry'
  },

  // === HIDDEN/SPECIAL ===
  MIDNIGHT_CREATOR: {
    id: 'midnight_creator',
    name: '🌙 Midnight Creator',
    description: 'Generate 5 prompts between midnight and 5 AM - night owl secret',
    tasks: ['Create at least 5 prompts during night hours'],
    icon: '🌙',
    color: '#6366f1',
    unlock: { type: 'night_prompts', value: 5 },
    rarity: 'rare',
    reward: '+250 XP + Secret Badge'
  },
  ONE_MINUTE_GENIUS: {
    id: 'one_minute_genius',
    name: '⚡ One Minute Genius',
    description: 'Generate a prompt in under 60 seconds - speed demon',
    tasks: ['Create a high-quality prompt in 1 minute'],
    icon: '⚡',
    color: '#fbbf24',
    unlock: { type: 'fast_prompts', value: 1 },
    rarity: 'uncommon',
    reward: '+200 XP'
  }
};

/**
 * Check if user has unlocked an achievement
 */
export const checkAchievementUnlock = (achievementId, userStats) => {
  const achievement = ACHIEVEMENTS[achievementId];
  if (!achievement) return false;

  const { type, value } = achievement.unlock;

  switch (type) {
    case 'prompts':
      return (userStats.totalPrompts || 0) >= value;
    case 'score':
      return (userStats.bestScore || 0) >= value;
    case 'mode_count':
      return (userStats.modeCounts?.[value.mode] || 0) >= value.count;
    case 'public_ideas':
      return (userStats.publicIdeas || 0) >= value;
    case 'top_upvotes':
      return (userStats.topUpvotes || 0) >= value;
    case 'total_upvotes':
      return (userStats.totalUpvotes || 0) >= value;
    case 'credits_spent':
      return (userStats.creditsSpent || 0) >= value;
    case 'streak':
      return (userStats.streak || 0) >= value;
    case 'referrals':
      return (userStats.referralCount || 0) >= value;
    case 'shipped':
      return (userStats.totalShipped || 0) >= value;
    case 'max_versions':
      return (userStats.maxVersionsPerPrompt || 0) >= value;
    case 'joined_date':
      const joinDate = new Date(userStats.joinedAt);
      const checkDate = new Date(value);
      return joinDate <= checkDate;
    case 'achievement_count':
      return (userStats.unlockedCount || 0) >= value;
    case 'all_modes':
      const modes = Object.keys(userStats.modeCounts || {}).filter(m => (userStats.modeCounts?.[m] || 0) > 0);
      return ['STARTUP', 'CODING', 'CONTENT', 'GENERAL'].every(m => modes.includes(m));
    case 'night_prompts':
      return (userStats.nightPrompts || 0) >= value;
    case 'fast_prompts':
      return (userStats.fastPrompts || 0) >= value;
    default:
      return false;
  }
};

/**
 * Get all unlocked achievements for a user
 */
export const getUnlockedAchievements = (userStats) => {
  return Object.entries(ACHIEVEMENTS)
    .filter(([id]) => checkAchievementUnlock(id, userStats))
    .map(([id, achievement]) => ({ ...achievement, id }));
};

/**
 * Get next achievement to unlock with progress
 */
export const getNextAchievement = (userStats) => {
  const locked = Object.entries(ACHIEVEMENTS)
    .filter(([id]) => !checkAchievementUnlock(id, userStats))
    .map(([id, achievement]) => {
      const { type, value } = achievement.unlock;
      let current = 0;
      let target = 1;

      switch (type) {
        case 'prompts':
          current = userStats.totalPrompts || 0;
          target = value;
          break;
        case 'public_ideas':
          current = userStats.publicIdeas || 0;
          target = value;
          break;
        case 'shipped':
          current = userStats.totalShipped || 0;
          target = value;
          break;
        case 'streak':
          current = userStats.streak || 0;
          target = value;
          break;
        case 'referrals':
          current = userStats.referralCount || 0;
          target = value;
          break;
        case 'credits_spent':
          current = userStats.creditsSpent || 0;
          target = value;
          break;
        case 'top_upvotes':
          current = userStats.topUpvotes || 0;
          target = value;
          break;
        case 'total_upvotes':
          current = userStats.totalUpvotes || 0;
          target = value;
          break;
        case 'achievement_count':
          current = userStats.unlockedCount || 0;
          target = value;
          break;
      }

      const progress = Math.min((current / target) * 100, 100);

      return {
        ...achievement,
        id,
        current,
        target,
        progress
      };
    })
    .sort((a, b) => (b.progress || 0) - (a.progress || 0))[0];

  return locked || null;
};

/**
 * Get achievement progress for all achievements
 */
export const getAchievementProgress = (userStats) => {
  return Object.entries(ACHIEVEMENTS).map(([id, achievement]) => {
    const { type, value } = achievement.unlock;
    let current = 0;
    let target = 1;

    switch (type) {
      case 'prompts':
        current = userStats.totalPrompts || 0;
        target = value;
        break;
      case 'public_ideas':
        current = userStats.publicIdeas || 0;
        target = value;
        break;
      case 'shipped':
        current = userStats.totalShipped || 0;
        target = value;
        break;
      case 'streak':
        current = userStats.streak || 0;
        target = value;
        break;
      case 'referrals':
        current = userStats.referralCount || 0;
        target = value;
        break;
      case 'credits_spent':
        current = userStats.creditsSpent || 0;
        target = value;
        break;
      case 'achievement_count':
        current = userStats.unlockedCount || 0;
        target = value;
        break;
    }

    const isUnlocked = checkAchievementUnlock(id, userStats);
    const progress = Math.min((current / target) * 100, 100);

    return {
      ...achievement,
      id,
      current,
      target,
      progress,
      isUnlocked
    };
  });
};

export const rarityColors = {
  common: { bg: '#1f2937', border: '#6b7280', text: '#d1d5db' },
  uncommon: { bg: '#0d7dba', border: '#0284c7', text: '#7dd3fc' },
  rare: { bg: '#6d28d9', border: '#8b5cf6', text: '#ddd6fe' },
  epic: { bg: '#b91c1c', border: '#fbbf24', text: '#fef3c7' }
};
