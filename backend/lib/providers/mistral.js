export async function callMistral(apiKey, messages, params, extra = {}, onChunk) {
  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: params.model || 'mistral-large-latest',
      messages,
      temperature: params.temperature || 0.7,
      max_tokens: params.max_tokens || 4096,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Mistral error: ${response.status} ${err}`);
  }

  const data = await response.json();
  return { content: data.choices[0].message.content, provider: 'mistral' };
}
