import React from 'react';
import LandingPage from '../../components/LandingPage';

export default function ChatGPTPromptGenerator() {
  const meta = {
    title: "ChatGPT Prompt Generator | PromptQuill",
    description: "Generate optimized prompts for ChatGPT.",
    h1: "ChatGPT Prompt Generator",
    h2_main: "Why use our ChatGPT Prompt Generator?",
    targetKeyword: "chatgpt prompt generator",
    urlPath: "/chatgpt-prompt-generator"
  };

  const content = (
    <>
      <p>Welcome to our comprehensive guide and tool for the <strong>chatgpt prompt generator</strong>. Finding the right prompt can be difficult, but with our advanced algorithms, you can generate the exact structure needed for optimal AI output.</p>
      <h3>Boost Your Productivity</h3>
      <p>Using a specialized chatgpt prompt generator helps you eliminate guesswork. Simply input your core idea, and we handle the complex prompt engineering behind the scenes.</p>
    </>
  );

  const faqs = [
    { question: "Is this tool free?", answer: "Yes, you can use our basic generation tools for free." },
    { question: "Do I need technical skills?", answer: "No, our interface is designed for beginners and experts alike." }
  ];

  return <LandingPage meta={meta} content={content} faqs={faqs} />;
}
