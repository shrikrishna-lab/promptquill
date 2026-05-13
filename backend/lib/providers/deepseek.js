export async function callDeepSeek(apiKey, messages, params, extra = {}, onChunk) {
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: params.model || 'deepseek-chat',
      messages,
      temperature: params.temperature || 0.7,
      max_tokens: params.max_tokens || 4096,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`DeepSeek error: ${response.status} ${err}`);
  }

  const data = await response.json();
  return { content: data.choices[0].message.content, provider: 'deepseek' };
}
