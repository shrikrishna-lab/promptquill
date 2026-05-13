import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function addBlog() {
  const payload = {
    title: 'Welcome to PromptQuill',
    slug: 'welcome-to-promptquill',
    excerpt: 'Turn any idea into a complete strategic brief in seconds.',
    content: `PromptQuill is an AI-powered brief generator. Type any idea and get a complete structured brief with 15 analysis sections in seconds.`,
    tags: ['announcement'],
    is_published: true,
    cover_image: '',
    created_at: new Date().toISOString()
  };

  const { data, error } = await supabase.from('blog_posts').insert([payload]);

  if (error) {
    console.error('Error inserting blog:', error);
  } else {
    console.log('Blog added successfully!');
  }
}

addBlog();
