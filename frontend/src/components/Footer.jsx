import React from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Github, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-[#09090b] text-zinc-400 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-purple-600/20 rounded-xl ring-1 ring-purple-500/30">
                <Terminal className="w-5 h-5 text-purple-400" />
              </div>
              <span className="font-bold text-xl text-white">PromptQuill</span>
            </Link>
            <p className="text-sm text-zinc-500 mb-6">
              The ultimate AI prompt generator and engineering tool. Create, refine, and optimize perfect prompts instantly.
            </p>
            <div className="flex gap-4">
              <a href="https://twitter.com/yourhandle" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://github.com/shrikrishna-lab" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com/company/yourcompany" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/ai" className="hover:text-purple-400 transition-colors">AI Prompt Generator</Link></li>
              <li><Link to="/features" className="hover:text-purple-400 transition-colors">Features</Link></li>
              <li><Link to="/pricing" className="hover:text-purple-400 transition-colors">Pricing</Link></li>
            </ul>
          </div>

          {/* Landing Pages (SEO) */}
          <div>
            <h3 className="text-white font-semibold mb-4">Prompt Tools</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/prompt-generator" className="hover:text-purple-400 transition-colors">Prompt Generator</Link></li>
              <li><Link to="/chatgpt-prompt-generator" className="hover:text-purple-400 transition-colors">ChatGPT Prompts</Link></li>
              <li><Link to="/prompt-engineering-tool" className="hover:text-purple-400 transition-colors">Engineering Tool</Link></li>
              <li><Link to="/midjourney-prompt-generator" className="hover:text-purple-400 transition-colors">Midjourney Prompts</Link></li>
              <li><Link to="/free-prompt-generator" className="hover:text-purple-400 transition-colors">Free Generator</Link></li>
            </ul>
          </div>

          {/* Blog (SEO) */}
          <div>
            <h3 className="text-white font-semibold mb-4">Learn</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/blog" className="hover:text-purple-400 transition-colors">Blog Home</Link></li>
              <li><Link to="/blog/what-is-prompt-engineering" className="hover:text-purple-400 transition-colors">What is Prompt Engineering?</Link></li>
              <li><Link to="/blog/how-to-write-perfect-ai-prompts" className="hover:text-purple-400 transition-colors">How to Write Prompts</Link></li>
              <li><Link to="/blog/best-chatgpt-prompts-2025" className="hover:text-purple-400 transition-colors">Best ChatGPT Prompts</Link></li>
              <li><Link to="/prompt-templates" className="hover:text-purple-400 transition-colors">Prompt Templates</Link></li>
            </ul>
          </div>

          {/* Legal & Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/about" className="hover:text-purple-400 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-purple-400 transition-colors">Contact Support</Link></li>
              <li><Link to="/privacy" className="hover:text-purple-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-purple-400 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm">
            © {currentYear} PromptQuill. All rights reserved.
          </p>
          <p className="text-sm flex items-center gap-1">
            Built with <span className="text-red-500">♥</span> for Prompt Engineers
          </p>
        </div>
      </div>
    </footer>
  );
}
