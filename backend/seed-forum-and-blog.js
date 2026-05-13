/**
 * PromptQuill — Forum & Blog Seed Script
 * 
 * Seeds:
 * 1. Forum categories (6 categories matching the 6 generation modes)
 * 2. Welcome/Announcement threads in each category
 * 3. A professional blog post about the new Forum feature
 * 
 * Run: node seed-forum-and-blog.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ═══════════════════════════════════════
// 1. FORUM CATEGORIES
// ═══════════════════════════════════════
const forumCategories = [
  {
    name: 'Announcements',
    description: 'Official PromptQuill updates, new features, and platform news from the team.',
    icon: '📢',
    color: '#A8FF3E',
    slug: 'announcements',
    sort_order: 0,
    is_active: true
  },
  {
    name: 'General Discussion',
    description: 'Chat about anything related to AI prompt engineering, share ideas, and connect with the community.',
    icon: '💬',
    color: '#3b82f6',
    slug: 'general-discussion',
    sort_order: 1,
    is_active: true
  },
  {
    name: 'Startup Mode',
    description: 'Discuss startup validation, business ideas, and how to get the most out of Startup Pro and Startup Lite modes.',
    icon: '🚀',
    color: '#7B2FFF',
    slug: 'startup-mode',
    sort_order: 2,
    is_active: true
  },
  {
    name: 'Coding Mode',
    description: 'Technical discussions around architecture briefs, API design, schema planning, and the Coding generation mode.',
    icon: '💻',
    color: '#FF5A00',
    slug: 'coding-mode',
    sort_order: 3,
    is_active: true
  },
  {
    name: 'Content & Creative',
    description: 'Share tips on content strategy, creative workflows, AI art prompts, and the Content & Creative generation modes.',
    icon: '🎨',
    color: '#f59e0b',
    slug: 'content-creative',
    sort_order: 4,
    is_active: true
  },
  {
    name: 'Help & Support',
    description: 'Need help? Ask questions about credits, subscriptions, features, bugs, or anything else. The community and team are here to help.',
    icon: '🆘',
    color: '#ef4444',
    slug: 'help-support',
    sort_order: 5,
    is_active: true
  }
];

// ═══════════════════════════════════════
// 2. WELCOME THREADS (one per category)
// ═══════════════════════════════════════
const welcomeThreads = [
  {
    categorySlug: 'announcements',
    title: '🎉 Welcome to PromptQuill Forums — Community Guidelines',
    body: `# Welcome to the PromptQuill Community Forums!

We're thrilled to have you here. These forums are your space to connect with fellow creators, share prompt engineering strategies, debug ideas together, and discover new ways to use PromptQuill's 6 generation modes.

## Community Guidelines

1. **Be Respectful** — Treat everyone with kindness. We're all here to learn and grow.
2. **Stay On Topic** — Post in the right category. It helps everyone find relevant content faster.
3. **No Spam** — Don't post promotional content, referral links, or repetitive messages.
4. **Share Knowledge** — If you've discovered a great prompt pattern or workflow, share it! The best posts get pinned.
5. **Report Issues** — Found a bug? Use the Help & Support category. We're actively monitoring.
6. **Have Fun** — This is a creative community. Experiment, remix, and push boundaries.

## What You Can Do Here

- 🚀 Share your best prompts and generation results
- 💡 Get feedback on startup ideas using our Startup modes
- 💻 Discuss technical architecture from Coding mode briefs
- 🎨 Share creative workflows and AI art prompt techniques
- ❓ Ask questions and get help from the community
- 📢 Stay updated on new features and platform updates

Welcome aboard. Let's build something amazing together.

— The PromptQuill Team`,
    tags: ['welcome', 'guidelines', 'pinned'],
    is_pinned: true,
    is_locked: true
  },
  {
    categorySlug: 'announcements',
    title: '🚀 New Feature: Community Forums are LIVE!',
    body: `# PromptQuill Forums Are Here!

We're excited to announce the launch of **PromptQuill Community Forums** — a dedicated space for our growing community of AI prompt engineers, startup founders, developers, and creators.

## What's New

- **6 Forum Categories** matching our generation modes — discuss strategies specific to each mode
- **Threaded Discussions** with upvoting, pinning, and thread locking
- **Community Profiles** — your Pro status and role badges are displayed automatically
- **Admin Moderation** — our team actively monitors to keep conversations productive

## Coming Soon

- Thread search and filtering
- User reputation system
- Best answer marking for Help & Support threads
- Integration with Community Feed for cross-posting

This is just the beginning. We're building the forums based on YOUR feedback, so don't hesitate to share what you'd like to see next.

Head to any category and start a thread!

— The PromptQuill Team`,
    tags: ['announcement', 'forums', 'new-feature'],
    is_pinned: true,
    is_locked: false
  },
  {
    categorySlug: 'general-discussion',
    title: '👋 Introduce Yourself! Who are you and what are you building?',
    body: `# Let's Get to Know Each Other!

Drop a quick intro — who are you, what are you working on, and how are you using PromptQuill?

Here's a template to get started:

**Name/Handle:** 
**What I'm building:** 
**Favorite PromptQuill mode:** 
**One thing I'm excited about:**

Looking forward to meeting everyone! 🎉`,
    tags: ['introductions', 'community'],
    is_pinned: true,
    is_locked: false
  },
  {
    categorySlug: 'startup-mode',
    title: '📋 Startup Mode Tips: How to Get the Best Validation Briefs',
    body: `# Getting the Most Out of Startup Mode

After generating hundreds of startup briefs, here are the patterns that produce the best results:

## For Startup Lite (Free)
- **Be specific about your target market.** Instead of "a food delivery app", try "a meal prep delivery service for busy solo professionals aged 25-35 in tier-2 Indian cities"
- **Include your constraints.** Mention your budget, timeline, or technical limitations. The AI adapts its advice accordingly.
- **Use Human Mode** for more opinionated, founder-style feedback. It cuts through the corporate speak.

## For Startup Pro (Premium)
- **Start with Startup Lite first** to validate the core idea, then upgrade to Pro for the full 15-tab deep dive
- **The Investor Lens tab** is incredibly useful — it tells you exactly what VCs would look for and what metrics matter
- **AI Debate tab** simulates a bull vs bear argument about your idea. Read it before your next pitch.

## Pro Tips
- Copy the Validate tab output and paste it back as a new prompt: "Given these risks, suggest 3 pivot strategies" → generates even deeper analysis
- The Launch tab's Reddit post drafts are surprisingly effective. Several community members have reported 100+ upvotes using them directly.

Share your own tips below! What prompts have given you the best startup briefs?`,
    tags: ['tips', 'startup', 'guide'],
    is_pinned: true,
    is_locked: false
  },
  {
    categorySlug: 'coding-mode',
    title: '⚡ Coding Mode Showcase: Architecture Briefs That Ship',
    body: `# Coding Mode: From Brief to Production

The Coding generation mode produces 11 tabs of technical specification. Here's how to turn those into actual shipped code:

## The Workflow
1. **Generate with a specific stack in mind.** Instead of "build a chat app", try "build a real-time chat app using Next.js 14, Supabase, and Tailwind CSS with WebSocket support"
2. **Start with the Architecture tab** — it gives you the folder structure and component hierarchy
3. **Follow the Build Order tab** — it tells you exactly which files to create first
4. **Use the Endpoints tab** as your API contract — paste it into your API documentation
5. **The Schema tab** generates your database migrations — copy directly into Supabase SQL editor

## Real Example
One of our users generated a brief for "a SaaS analytics dashboard with multi-tenant auth" and had a working MVP deployed on Vercel within 48 hours using only the Coding mode output + Cursor IDE.

Share your Coding mode wins below. What have you built with it?`,
    tags: ['coding', 'architecture', 'showcase'],
    is_pinned: true,
    is_locked: false
  },
  {
    categorySlug: 'content-creative',
    title: '🎨 Creative Mode Gallery: Share Your Best AI-Assisted Work',
    body: `# Creative Mode Gallery

This thread is for sharing your best work created with the help of PromptQuill's Content and Creative generation modes.

## How to Share
1. Describe what you were trying to create
2. Share the prompt you used (or a summary)
3. Show the result — text, images, campaigns, whatever you made
4. Any tips for others trying similar things

## Categories Welcome
- 📝 Blog posts and articles
- 🎨 AI art prompt chains
- 📧 Email campaigns
- 📱 Social media content calendars
- 🎥 Video scripts and storyboards
- 🎵 Music and audio projects

No judgment here — we're all experimenting and learning. Drop your work below! 👇`,
    tags: ['creative', 'gallery', 'showcase'],
    is_pinned: true,
    is_locked: false
  },
  {
    categorySlug: 'help-support',
    title: '📌 Before Posting: FAQ & Common Solutions',
    body: `# Frequently Asked Questions

Before creating a new thread, check if your question is answered here:

## Credits & Billing
- **Q: How many free credits do I get?** → 100 credits (10 generations) every day, automatically refilled.
- **Q: Do unused credits carry over?** → Daily free credits reset each day. Purchased credits never expire.
- **Q: How do I upgrade to Pro?** → Go to the landing page pricing section or click the upgrade button in your dashboard.

## Generation Issues
- **Q: My generation is stuck/loading forever.** → Refresh the page and try again. If it persists, our AI providers may be experiencing high load — wait 1-2 minutes.
- **Q: I got an error during generation.** → Check your credit balance. If you have credits, try a different mode or shorter prompt.
- **Q: Can I regenerate the same prompt?** → Yes! Just click generate again. Each generation may produce slightly different results.

## Account
- **Q: How do I change my password?** → Use the "Forgot Password" link on the login screen.
- **Q: Can I delete my account?** → Contact us through this forum or email support.

## Still Need Help?
Create a new thread in this category with:
1. What you were trying to do
2. What happened instead
3. Any error messages you saw
4. Your browser and device info

We typically respond within 24 hours.`,
    tags: ['faq', 'help', 'pinned'],
    is_pinned: true,
    is_locked: true
  }
];

// ═══════════════════════════════════════
// 3. BLOG POST — New Feature: Forums
// ═══════════════════════════════════════
const blogPost = {
  title: 'Introducing PromptQuill Community Forums — Connect, Discuss, Build Together',
  slug: 'introducing-promptquill-community-forums',
  excerpt: 'Today we\'re launching PromptQuill Community Forums — a dedicated space for prompt engineers, startup founders, developers, and creators to connect, share strategies, and help each other build with AI.',
  content: `# Introducing PromptQuill Community Forums

Today marks a major milestone for PromptQuill. We're not just an AI prompt generation engine anymore — **we're becoming a community.**

## Why Forums?

Since launching PromptQuill, we've watched thousands of users generate incredible briefs across our 6 modes. Startup founders validating ideas. Developers scaffolding entire architectures. Content creators building distribution strategies. Creative professionals crafting complex prompt chains.

But something was missing. **There was no place for you to talk to each other.**

The best prompt engineering happens through collaboration — sharing what works, learning from what doesn't, and building on each other's discoveries. That's why we built the PromptQuill Community Forums.

## What You'll Find

### 📢 Announcements
Stay updated on new features, platform changes, and upcoming releases. This is where the team posts official updates.

### 💬 General Discussion
The town square. Chat about AI, prompt engineering, share interesting finds, or just say hello.

### 🚀 Startup Mode
A dedicated space for founders and builders. Discuss validation strategies, share Startup Pro brief results, debate market opportunities, and help each other navigate the founder journey.

### 💻 Coding Mode  
Technical discussions for developers. Share architecture patterns from your Coding mode briefs, discuss tech stacks, debug together, and showcase projects you've built using PromptQuill's technical specifications.

### 🎨 Content & Creative
For content creators, marketers, and artists. Share creative workflows, discuss content strategies, and showcase work you've created with AI assistance.

### 🆘 Help & Support
Need help? This is the fastest way to get answers from both the community and our team. Check the pinned FAQ first, then create a thread if you need more help.

## Features

- **Threaded Conversations** — Start discussions, reply to threads, and build on each other's ideas
- **Upvoting** — The best content rises to the top
- **Pro Badges** — Your subscription status is displayed, helping others know your experience level
- **Admin Moderation** — We actively moderate to keep conversations productive and spam-free
- **Pinned Threads** — Important resources and guides stay at the top of each category
- **Category-Specific Discussions** — Find exactly the conversations relevant to your workflow

## What's Coming Next

This is version 1.0 of our forums. Here's what's on the roadmap:

- **Thread Search** — Find specific topics and solutions instantly
- **Reputation System** — Earn points for helpful contributions
- **Best Answer Marking** — In Help & Support, mark the solution that resolved your issue
- **Community Feed Integration** — Cross-post your best prompts to the Community Feed directly from forum threads
- **Notification System** — Get notified when someone replies to your thread

## Join the Conversation

The forums are live right now. Every PromptQuill user can browse, post, and reply — no additional signup needed. Just head to the **Forums** page from the navigation.

We've seeded each category with starter threads, tips, and guidelines to help you get oriented. Feel free to introduce yourself in the General Discussion category and start exploring.

**This is your community. Help us shape it.**

We're building the forums based on your feedback. If there's a feature you want, a category you'd like to see, or a change that would make the forums more useful — tell us. Create a thread, drop a comment, or just upvote the ideas you agree with.

Welcome to the next chapter of PromptQuill.

— The PromptQuill Team`,
  tags: ['announcement', 'forums', 'community', 'new-feature', 'update'],
  is_published: true,
  cover_image: '',
  author_id: null // Will be set to admin user if found
};

// ═══════════════════════════════════════
// SEED RUNNER
// ═══════════════════════════════════════
async function seed() {
  console.log('\n🌱 PromptQuill Forum & Blog Seed Script');
  console.log('═══════════════════════════════════════\n');

  // Find admin user for authoring threads & blog
  let adminUserId = null;
  try {
    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'ADMIN')
      .limit(1)
      .single();
    if (adminProfile) {
      adminUserId = adminProfile.id;
      console.log(`✅ Found admin user: ${adminUserId}`);
    }
  } catch {
    console.log('⚠️  No admin user found — threads will need a user_id. Checking for any user...');
    const { data: anyUser } = await supabase.from('profiles').select('id').limit(1).single();
    if (anyUser) {
      adminUserId = anyUser.id;
      console.log(`✅ Using user: ${adminUserId}`);
    }
  }

  if (!adminUserId) {
    console.error('❌ No users found in profiles table. Please create a user first.');
    process.exit(1);
  }

  // ── STEP 1: Seed Forum Categories ──
  console.log('\n📁 Seeding Forum Categories...');
  const categoryMap = {};

  for (const cat of forumCategories) {
    // Check if already exists
    const { data: existing } = await supabase
      .from('forum_categories')
      .select('id, slug')
      .eq('slug', cat.slug)
      .maybeSingle();

    if (existing) {
      console.log(`   ⏭️  "${cat.name}" already exists (${existing.id})`);
      categoryMap[cat.slug] = existing.id;
      // Ensure it's active
      await supabase.from('forum_categories').update({ is_active: true }).eq('id', existing.id);
    } else {
      const { data, error } = await supabase
        .from('forum_categories')
        .insert([cat])
        .select()
        .single();
      if (error) {
        console.error(`   ❌ Failed to create "${cat.name}":`, error.message);
      } else {
        console.log(`   ✅ Created "${cat.name}" (${data.id})`);
        categoryMap[cat.slug] = data.id;
      }
    }
  }

  // ── STEP 2: Seed Welcome Threads ──
  console.log('\n💬 Seeding Welcome Threads...');

  for (const thread of welcomeThreads) {
    const categoryId = categoryMap[thread.categorySlug];
    if (!categoryId) {
      console.error(`   ❌ Category "${thread.categorySlug}" not found — skipping thread "${thread.title}"`);
      continue;
    }

    // Check if thread with same title already exists
    const { data: existing } = await supabase
      .from('forum_threads')
      .select('id')
      .eq('title', thread.title)
      .eq('category_id', categoryId)
      .maybeSingle();

    if (existing) {
      console.log(`   ⏭️  "${thread.title.substring(0, 50)}..." already exists`);
      continue;
    }

    const { data, error } = await supabase
      .from('forum_threads')
      .insert([{
        title: thread.title,
        body: thread.body,
        category_id: categoryId,
        user_id: adminUserId,
        tags: thread.tags,
        is_pinned: thread.is_pinned || false,
        is_locked: thread.is_locked || false,
        is_deleted: false,
        reply_count: 0,
        upvotes: 0,
        views: 0,
        last_reply_at: null
      }])
      .select()
      .single();

    if (error) {
      console.error(`   ❌ Failed to create thread "${thread.title.substring(0, 40)}...":`, error.message);
    } else {
      console.log(`   ✅ Created: "${thread.title.substring(0, 50)}..." (${data.id})`);
    }
  }

  // ── STEP 3: Seed Blog Post ──
  console.log('\n📝 Seeding Blog Post...');

  // Check if already exists
  const { data: existingBlog } = await supabase
    .from('blog_posts')
    .select('id')
    .eq('slug', blogPost.slug)
    .maybeSingle();

  if (existingBlog) {
    console.log(`   ⏭️  Blog post "${blogPost.title.substring(0, 50)}..." already exists`);
  } else {
    const { data, error } = await supabase
      .from('blog_posts')
      .insert([{
        ...blogPost,
        author_id: adminUserId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error(`   ❌ Failed to create blog post:`, error.message);
    } else {
      console.log(`   ✅ Created blog: "${blogPost.title.substring(0, 50)}..." (${data.id})`);
    }
  }

  console.log('\n═══════════════════════════════════════');
  console.log('🎉 Seed complete!');
  console.log('═══════════════════════════════════════\n');
}

seed().catch(err => {
  console.error('💥 Seed failed:', err);
  process.exit(1);
});
