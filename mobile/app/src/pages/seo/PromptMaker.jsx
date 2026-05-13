import React from 'react';
import LandingPage from '../../components/LandingPage';

export default function PromptMaker() {
  const meta = {
    title: "Prompt Maker | PromptQuill",
    description: "Make the perfect prompt for any AI model.",
    h1: "Prompt Maker",
    h2_main: "Why use our Prompt Maker?",
    targetKeyword: "prompt maker",
    urlPath: "/prompt-maker"
  };

  const content = (
    <>
      <p>Welcome to our comprehensive guide and tool for the <strong>prompt maker</strong>. Finding the right prompt can be difficult, but with our advanced algorithms, you can generate the exact structure needed for optimal AI output.</p>
      <h3>Boost Your Productivity</h3>
      <p>Using a specialized prompt maker helps you eliminate guesswork. Simply input your core idea, and we handle the complex prompt engineering behind the scenes.</p>
    </>
  );

  const faqs = [
    { question: "Is this tool free?", answer: "Yes, you can use our basic generation tools for free." },
    { question: "Do I need technical skills?", answer: "No, our interface is designed for beginners and experts alike." }
  ];

  return <LandingPage meta={meta} content={content} faqs={faqs} />;
}
