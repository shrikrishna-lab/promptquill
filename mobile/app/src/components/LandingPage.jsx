import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Terminal } from 'lucide-react';
import SEO from './SEO';
import Breadcrumb from './Breadcrumb';
import FAQSection from './FAQSection';

const BASE_URL = import.meta.env.VITE_APP_URL || 'https://promptquill.com';

export default function LandingPage({ meta, content, faqs }) {
  const { title, description, h1, h2_main, targetKeyword, urlPath } = meta;
  
  const url = `${BASE_URL}${urlPath}`;

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": title,
    "description": description,
    "url": url,
    "publisher": {
      "@type": "Organization",
      "name": "PromptQuill",
      "logo": {
        "@type": "ImageObject",
        "url": `${BASE_URL}/logo.png`
      }
    }
  };

  const faqSchema = faqs ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(f => ({
      "@type": "Question",
      "name": f.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.answer
      }
    }))
  } : null;

  return (
    <>
      <SEO 
        title={title}
        description={description}
        keywords={`${targetKeyword}, prompt engineering, AI prompt generator`}
        jsonLd={[webPageSchema, faqSchema].filter(Boolean)}
        bingVerification={import.meta.env.VITE_BING_VERIFICATION || ""}
      />

      <div className="min-h-screen bg-[#040405] text-white">
        {/* Hero Section */}
        <div className="relative pt-32 pb-20 overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-[#040405] to-[#040405]"></div>
          
          <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
            <Breadcrumb items={[{ label: targetKeyword.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '), path: urlPath }]} />
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-medium mb-8">
              <Terminal className="w-4 h-4" />
              <span>PromptQuill SEO Guides</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-br from-white to-zinc-400 bg-clip-text text-transparent">
              {h1}
            </h1>
            
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              {description}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/ai" className="w-full sm:w-auto px-8 py-4 bg-white text-black rounded-xl font-bold hover:bg-purple-50 transition-colors flex items-center justify-center">
                Start Generating <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link to="/pricing" className="w-full sm:w-auto px-8 py-4 bg-zinc-900 text-white rounded-xl font-medium hover:bg-zinc-800 border border-white/10 transition-colors text-center">
                View Pricing
              </Link>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-3xl mx-auto px-6 py-20">
          <div className="prose prose-invert prose-purple max-w-none prose-lg
            prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-white
            prose-h2:text-3xl prose-h2:mt-16 prose-h2:mb-6
            prose-h3:text-2xl prose-h3:mt-12 prose-h3:mb-4
            prose-p:text-zinc-300 prose-p:leading-relaxed prose-p:mb-6
            prose-li:text-zinc-300
            prose-strong:text-white">
            
            <h2>{h2_main}</h2>
            {content}
            
          </div>
        </div>

        {/* Features / Benefits mini section */}
        <div className="border-t border-white/5 bg-[#09090b] py-20">
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Why use PromptQuill's {targetKeyword}?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: "Save 10x Time", desc: "Stop guessing what the AI wants. Generate optimized prompts instantly." },
                { title: "Better Results", desc: "Get highly specific, accurate, and creative outputs from any AI model." },
                { title: "Multi-Model Native", desc: "Works flawlessly with ChatGPT, Claude, Gemini, and Midjourney." }
              ].map((feature, i) => (
                <div key={i} className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5">
                  <CheckCircle2 className="w-8 h-8 text-purple-400 mb-4" />
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-zinc-400">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <FAQSection faqs={faqs} title={`FAQs about ${targetKeyword}`} subtitle={`Common questions about using our ${targetKeyword} tool.`} />

        {/* Final CTA */}
        <div className="py-24 text-center px-6">
          <h2 className="text-4xl font-bold mb-6">Ready to upgrade your prompts?</h2>
          <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
            Join thousands of users leveraging PromptQuill to engineer the perfect prompts for their AI workflows.
          </p>
          <Link to="/ai" className="inline-flex px-8 py-4 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-500 transition-colors shadow-[0_0_40px_-10px_rgba(147,51,234,0.5)]">
            Open Free Prompt Generator
          </Link>
        </div>
      </div>
    </>
  );
}
