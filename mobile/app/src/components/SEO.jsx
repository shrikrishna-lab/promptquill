import React from 'react';
import { Helmet } from 'react-helmet-async';

const BASE_URL = import.meta.env.VITE_APP_URL || "https://promptquill.com";

export default function SEO({ 
  title = "PromptQuill — AI Prompt Generator & Engineering Tool", 
  description = "Create, refine, and optimize perfect prompts for ChatGPT, Claude, Gemini, and Midjourney in seconds.", 
  url = BASE_URL, 
  image = `${BASE_URL}/og-image.png`, 
  type = "website", 
  keywords = "prompt generator, AI prompt generator, prompt engineering, ChatGPT prompt generator, prompt builder", 
  publishedTime, 
  modifiedTime, 
  author = "PromptQuill", 
  noIndex = false,
  jsonLd = null,
  bingVerification = "" // Add this for Bing Webmaster verification
}) {
  const isNoIndex = noIndex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content={isNoIndex} />
      <link rel="canonical" href={url} />
      {bingVerification && <meta name="msvalidate.01" content={bingVerification} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="PromptQuill" />
      <meta property="og:locale" content="en_US" />

      {/* Article Specific Open Graph */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && (
        <meta property="article:author" content={author} />
      )}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:creator" content="@promptquill" />
      <meta name="twitter:site" content="@promptquill" />

      {/* Inject JSON-LD if provided */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
}
