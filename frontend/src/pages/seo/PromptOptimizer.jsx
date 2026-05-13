import React from 'react';
import LandingPage from '../../components/LandingPage';

export default function PromptOptimizer() {
  const meta = {
    title: "Prompt Optimizer | PromptQuill",
    description: "Optimize your existing AI prompts for better results.",
    h1: "Prompt Optimizer",
    h2_main: "Why use our Prompt Optimizer?",
    targetKeyword: "prompt optimizer",
    urlPath: "/prompt-optimizer"
  };

  const content = (
    <>
      <p>Welcome to our comprehensive guide and tool for the <strong>prompt optimizer</strong>. Finding the right prompt can be difficult, but with our advanced algorithms, you can generate the exact structure needed for optimal AI output.</p>
      <h3>Boost Your Productivity</h3>
      <p>Using a specialized prompt optimizer helps you eliminate guesswork. Simply input your core idea, and we handle the complex prompt engineering behind the scenes.</p>
    </>
  );

  const faqs = [
    { question: "Is this tool free?", answer: "Yes, you can use our basic generation tools for free." },
    { question: "Do I need technical skills?", answer: "No, our interface is designed for beginners and experts alike." }
  ];

  return <LandingPage meta={meta} content={content} faqs={faqs} />;
}
