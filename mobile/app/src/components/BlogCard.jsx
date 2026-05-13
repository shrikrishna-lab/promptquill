import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';

export default function BlogCard({ post }) {
  const { slug, title, excerpt, date, readTime, category, image } = post;
  
  return (
    <article className="group relative bg-[#09090b] border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:shadow-[0_0_30px_-10px_rgba(168,85,247,0.2)]">
      <Link to={`/blog/${slug}`} className="absolute inset-0 z-10">
        <span className="sr-only">Read {title}</span>
      </Link>

      <div className="aspect-[16/9] w-full overflow-hidden bg-zinc-900 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] to-transparent opacity-60 z-[1]" />
        {/* We use a colored gradient placeholder if no image exists to keep performance high */}
        {image ? (
          <img 
            src={image} 
            alt={title} 
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-900/40 to-blue-900/40 group-hover:scale-105 transition-transform duration-500 flex items-center justify-center">
            <span className="text-zinc-700 font-mono opacity-50">/promptquill/blog</span>
          </div>
        )}
        
        <div className="absolute top-4 left-4 z-[2]">
          <span className="px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-xs font-medium text-purple-300 uppercase tracking-wider">
            {category}
          </span>
        </div>
      </div>

      <div className="p-6 relative z-20">
        <div className="flex items-center gap-4 text-xs text-zinc-500 mb-4">
          <time dateTime={date}>{new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric'})}</time>
          <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {readTime} min read</span>
        </div>

        <h3 className="text-xl font-bold text-white mb-3 leading-tight group-hover:text-purple-400 transition-colors">
          {title}
        </h3>
        
        <p className="text-zinc-400 text-sm line-clamp-3 mb-6">
          {excerpt}
        </p>

        <div className="flex items-center text-purple-400 font-medium text-sm">
          Read Article <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </article>
  );
}
