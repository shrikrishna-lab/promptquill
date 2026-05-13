export async function callOpenRouter(apiKey, messages, params, extra = {}, onChunk) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://github.com/shrikrishna-lab/promptquill',
    },
    body: JSON.stringify({
      model: params.model || 'meta-llama/llama-3.3-70b-instruct:free',
      messages,
      temperature: params.temperature || 0.7,
      max_tokens: params.max_tokens || 4096,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenRouter error: ${response.status} ${err}`);
  }

  const data = await response.json();
  return { content: data.choices[0].message.content, provider: 'openrouter' };
}
