import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Calendar, Clock, Terminal } from 'lucide-react';
import SEO from './SEO';

const BASE_URL = import.meta.env.VITE_APP_URL || 'https://promptquill.com';

export default function BlogPost({ post }) {
  const { title, description, date, readTime, author, content, category, keywords, slug } = post;
  
  const url = `${BASE_URL}/blog/${slug}`;
  
  // Article JSON-LD
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "image": `${BASE_URL}/og-image.png`,
    "author": {
      "@type": "Person",
      "name": author.name,
      "url": `${BASE_URL}/about`
    },
    "publisher": {
      "@type": "Organization",
      "name": "PromptQuill",
      "logo": {
        "@type": "ImageObject",
        "url": `${BASE_URL}/logo.png`
      }
    },
    "datePublished": new Date(date).toISOString(),
    "dateModified": new Date(date).toISOString()
  };

  return (
    <>
      <SEO 
        title={`${title} | PromptQuill Blog`}
        description={description}
        url={url}
        type="article"
        keywords={keywords}
        publishedTime={new Date(date).toISOString()}
        author={author.name}
        jsonLd={articleSchema}
      />

      <div className="min-h-screen bg-[#040405] text-zinc-300 pb-20">
        <div className="max-w-3xl mx-auto px-6 pt-32">
          
          <Link to="/blog" className="inline-flex items-center text-purple-400 hover:text-purple-300 text-sm font-medium mb-12 transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Blog
          </Link>

          <header className="mb-12">
            <div className="flex items-center gap-4 text-sm text-zinc-500 mb-6">
              <span className="px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full font-medium border border-purple-500/20 uppercase tracking-wider text-xs">
                {category}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric'})}
              </span>
              <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {readTime} min read
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
              {title}
            </h1>
            
            <p className="text-xl text-zinc-400 leading-relaxed mb-8">
              {description}
            </p>
            
            {/* Author Box */}
            <div className="flex items-center gap-4 pt-8 border-t border-white/10">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 to-blue-600 p-[2px]">
                <div className="w-full h-full bg-[#09090b] rounded-full flex items-center justify-center border border-white/10">
                  <Terminal className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <p className="text-white font-medium">{author.name}</p>
                <p className="text-sm text-zinc-500">{author.role}</p>
              </div>
            </div>
          </header>

          {/* Article Content */}
          <article className="prose prose-invert prose-purple max-w-none prose-lg
            prose-headings:font-bold prose-headings:tracking-tight
            prose-h2:text-3xl prose-h2:mt-16 prose-h2:mb-6 prose-h2:text-white
            prose-h3:text-2xl prose-h3:mt-12 prose-h3:mb-4
            prose-p:text-zinc-300 prose-p:leading-relaxed prose-p:mb-6
            prose-a:text-purple-400 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-white
            prose-ul:my-6 prose-li:my-2
            prose-code:text-purple-300 prose-code:bg-purple-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
            prose-pre:bg-[#09090b] prose-pre:border prose-pre:border-white/10
            prose-blockquote:border-l-purple-500 prose-blockquote:bg-purple-500/5 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-xl prose-blockquote:font-normal prose-blockquote:not-italic prose-blockquote:text-zinc-300"
          >
            {content}
          </article>

          {/* CTA Box */}
          <div className="mt-20 p-8 rounded-3xl bg-gradient-to-br from-purple-900/40 to-blue-900/20 border border-purple-500/30 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-white mb-4">Ready to engineer better prompts?</h3>
              <p className="text-zinc-300 mb-8 max-w-lg mx-auto">
                Stop guessing and start generating. Use PromptQuill's 15 AI models and built-in optimizer for free.
              </p>
              <Link to="/ai" className="inline-flex items-center justify-center px-8 py-4 bg-white text-black rounded-xl font-bold hover:bg-purple-50 transition-colors">
                Open AI Prompt Generator <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
          
        </div>
      </div>
    </>
  );
}
