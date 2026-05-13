export async function callCloudflare(apiKey, messages, params, extra = {}, onChunk) {
  const accountId = extra.accountId;
  if (!accountId) {
    throw new Error('Cloudflare requires accountId in extra parameter');
  }

  const model = params.model || '@cf/meta/llama-3.3-70b-instruct-fp8-fast';
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`;

  const systemMsg = messages.find(m => m.role === 'system');
  const userMsg = messages.find(m => m.role === 'user');
  const prompt = systemMsg ? `${systemMsg.content}\n\n${userMsg?.content || ''}` : (userMsg?.content || '');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      max_tokens: params.max_tokens || 4096,
      temperature: params.temperature || 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Cloudflare error: ${response.status} ${err}`);
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(`Cloudflare error: ${data.errors?.[0]?.message || 'Request failed'}`);
  }

  return { content: data.result.response, provider: 'cloudflare' };
}
