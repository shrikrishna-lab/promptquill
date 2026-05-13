export async function callClaude(apiKey, messages, params, extra = {}, onChunk) {
  const systemMsg = messages.find(m => m.role === 'system');
  const userMsgs = messages.filter(m => m.role !== 'system');

  const body = {
    model: params.model || 'claude-3-5-sonnet-20241022',
    max_tokens: params.max_tokens || 4096,
    messages: userMsgs.length > 0 ? userMsgs : [{ role: 'user', content: 'Hello' }],
  };
  if (systemMsg) body.system = systemMsg.content;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude error: ${response.status} ${err}`);
  }

  const data = await response.json();
  return { content: data.content?.[0]?.text || '', provider: 'claude' };
}
