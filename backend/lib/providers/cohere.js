export async function callCohere(apiKey, messages, params, extra = {}, onChunk) {
  const systemMsg = messages.find(m => m.role === 'system');
  const userMsg = messages.find(m => m.role === 'user');
  const response = await fetch('https://api.cohere.com/v2/chat', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: params.model || 'command-r-plus',
      messages: [{ role: 'user', content: userMsg?.content || '' }],
      system: systemMsg?.content || '',
      temperature: params.temperature || 0.7,
      max_tokens: params.max_tokens || 4096,
    }),
  });
  if (!response.ok) { const err = await response.text(); throw new Error(`Cohere error: ${response.status} ${err}`); }
  const data = await response.json();
  return { content: data.message?.content?.[0]?.text || '', provider: 'cohere' };
}
