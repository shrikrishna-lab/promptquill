import React from 'react';
import LandingPage from '../../components/LandingPage';

export default function PromptBuilder() {
  const meta = {
    title: "Prompt Builder | PromptQuill",
    description: "Build complex AI prompts easily.",
    h1: "Prompt Builder",
    h2_main: "Why use our Prompt Builder?",
    targetKeyword: "prompt builder",
    urlPath: "/prompt-builder"
  };

  const content = (
    <>
      <p>Welcome to our comprehensive guide and tool for the <strong>prompt builder</strong>. Finding the right prompt can be difficult, but with our advanced algorithms, you can generate the exact structure needed for optimal AI output.</p>
      <h3>Boost Your Productivity</h3>
      <p>Using a specialized prompt builder helps you eliminate guesswork. Simply input your core idea, and we handle the complex prompt engineering behind the scenes.</p>
    </>
  );

  const faqs = [
    { question: "Is this tool free?", answer: "Yes, you can use our basic generation tools for free." },
    { question: "Do I need technical skills?", answer: "No, our interface is designed for beginners and experts alike." }
  ];

  return <LandingPage meta={meta} content={content} faqs={faqs} />;
}
