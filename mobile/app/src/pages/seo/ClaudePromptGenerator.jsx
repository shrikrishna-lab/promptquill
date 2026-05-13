import React from 'react';
import LandingPage from '../../components/LandingPage';

export default function ClaudePromptGenerator() {
  const meta = {
    title: "Claude Prompt Generator | PromptQuill",
    description: "Write better prompts for Claude AI.",
    h1: "Claude Prompt Generator",
    h2_main: "Why use our Claude Prompt Generator?",
    targetKeyword: "claude prompt generator",
    urlPath: "/claude-prompt-generator"
  };

  const content = (
    <>
      <p>Welcome to our comprehensive guide and tool for the <strong>claude prompt generator</strong>. Finding the right prompt can be difficult, but with our advanced algorithms, you can generate the exact structure needed for optimal AI output.</p>
      <h3>Boost Your Productivity</h3>
      <p>Using a specialized claude prompt generator helps you eliminate guesswork. Simply input your core idea, and we handle the complex prompt engineering behind the scenes.</p>
    </>
  );

  const faqs = [
    { question: "Is this tool free?", answer: "Yes, you can use our basic generation tools for free." },
    { question: "Do I need technical skills?", answer: "No, our interface is designed for beginners and experts alike." }
  ];

  return <LandingPage meta={meta} content={content} faqs={faqs} />;
}
