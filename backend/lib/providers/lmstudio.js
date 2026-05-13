export async function callLMStudio(apiKey, messages, params, extra = {}, onChunk) {
  const baseUrl = extra.baseUrl || 'http://localhost:1234';
  const response = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages,
      temperature: params.temperature || 0.7,
      max_tokens: params.max_tokens || 4096,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`LM Studio error: ${response.status} ${err}`);
  }

  const data = await response.json();
  return { content: data.choices?.[0]?.message?.content || '', provider: 'lmstudio' };
}
