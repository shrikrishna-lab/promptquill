export async function callNVIDIA(apiKey, messages, params, extra = {}, onChunk) {
  const baseUrl = extra.baseUrl || 'https://integrate.api.nvidia.com/v1';
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: params.model || 'nvidia/llama-3.3-nemotron-super-49b-v1',
      messages,
      temperature: params.temperature || 0.7,
      max_tokens: params.max_tokens || 4096,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`NVIDIA error: ${response.status} ${err}`);
  }

  const data = await response.json();
  return { content: data.choices[0].message.content, provider: 'nvidia' };
}
