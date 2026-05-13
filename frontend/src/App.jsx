import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    // Nuclear reset for stuck scroll issues (e.g. from Lenis or Modals)
    document.body.style.overflow = 'unset';
    document.documentElement.style.overflow = 'unset';
    document.body.classList.remove('lenis-stopped');
    document.documentElement.classList.remove('lenis-stopped');
  }, [pathname]);
  return null;
}

import { GlobalErrorBoundary } from './components/ErrorBoundary';
import { PromptMemory, ResponseCache } from './lib/ai.js';
import AnnouncementsBanner from './components/AnnouncementsBanner';


// Lazy load pages for better performance and to isolate chart-related errors
const Welcome = lazy(() => import('./pages/Welcome'));
const Setup = lazy(() => import('./pages/Setup'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Graveyard = lazy(() => import('./pages/Graveyard'));

const PricingPage = lazy(() => import('./pages/PricingPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const PublicProfile = lazy(() => import('./pages/PublicProfile'));
const PromptBattlePage = lazy(() => import('./pages/PromptBattlePage'));
const IdeaRemixerPage = lazy(() => import('./pages/IdeaRemixerPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const PromptSharePage = lazy(() => import('./pages/PromptSharePage'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const CookiePolicy = lazy(() => import('./pages/CookiePolicy'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const HowItWorks = lazy(() => import('./pages/HowItWorks'));
const Features = lazy(() => import('./pages/Features'));
const ForumPage = lazy(() => import('./pages/ForumPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));

// SEO Pages
const PromptGenerator = lazy(() => import('./pages/seo/PromptGenerator'));
const AIPromptGenerator = lazy(() => import('./pages/seo/AIPromptGenerator'));
const ChatGPTPromptGenerator = lazy(() => import('./pages/seo/ChatGPTPromptGenerator'));
const MidjourneyPromptGenerator = lazy(() => import('./pages/seo/MidjourneyPromptGenerator'));
const ClaudePromptGenerator = lazy(() => import('./pages/seo/ClaudePromptGenerator'));
const AIImagePromptGenerator = lazy(() => import('./pages/seo/AIImagePromptGenerator'));
const PromptBuilder = lazy(() => import('./pages/seo/PromptBuilder'));
const PromptMaker = lazy(() => import('./pages/seo/PromptMaker'));
const PromptOptimizer = lazy(() => import('./pages/seo/PromptOptimizer'));
const CodingPromptGenerator = lazy(() => import('./pages/seo/CodingPromptGenerator'));
const MarketingPromptGenerator = lazy(() => import('./pages/seo/MarketingPromptGenerator'));
const WritingPromptGenerator = lazy(() => import('./pages/seo/WritingPromptGenerator'));

function App() {
  return (
    <GlobalErrorBoundary>
      <Router>
        <ScrollToTop />
        <AnnouncementsBanner />
        <Suspense fallback={<div style={{ minHeight: '100vh', backgroundColor: '#080808' }} />}>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/setup" element={<Setup />} />
            <Route path="/prompt-generator" element={<PromptGenerator />} />
            <Route path="/ai-prompt-generator" element={<AIPromptGenerator />} />
            <Route path="/chatgpt-prompt-generator" element={<ChatGPTPromptGenerator />} />
            <Route path="/midjourney-prompt-generator" element={<MidjourneyPromptGenerator />} />
            <Route path="/claude-prompt-generator" element={<ClaudePromptGenerator />} />
            <Route path="/ai-image-prompt-generator" element={<AIImagePromptGenerator />} />
            <Route path="/prompt-builder" element={<PromptBuilder />} />
            <Route path="/prompt-maker" element={<PromptMaker />} />
            <Route path="/prompt-optimizer" element={<PromptOptimizer />} />
            <Route path="/coding-prompt-generator" element={<CodingPromptGenerator />} />
            <Route path="/marketing-prompt-generator" element={<MarketingPromptGenerator />} />
            <Route path="/writing-prompt-generator" element={<WritingPromptGenerator />} />
            <Route path="/ai" element={<Dashboard />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/graveyard" element={<Graveyard />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/u/:username" element={<PublicProfile />} />
            <Route path="/shared/:id" element={<PromptSharePage />} />
            <Route path="/share/:promptId" element={<PromptSharePage />} />
            <Route path="/battles" element={<PromptBattlePage />} />
            <Route path="/remixer" element={<IdeaRemixerPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPage />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/cookies" element={<CookiePolicy />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/features" element={<Features />} />
            <Route path="/forums" element={<ForumPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </Router>
    </GlobalErrorBoundary>
  );
}

export default App;
