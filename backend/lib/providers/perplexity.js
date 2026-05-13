export async function callPerplexity(apiKey, messages, params, extra = {}, onChunk) {
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: params.model || 'sonar-pro',
      messages,
      temperature: params.temperature || 0.7,
      max_tokens: params.max_tokens || 4096,
    }),
  });
  if (!response.ok) { const err = await response.text(); throw new Error(`Perplexity error: ${response.status} ${err}`); }
  const data = await response.json();
  return { content: data.choices[0].message.content, provider: 'perplexity' };
}
