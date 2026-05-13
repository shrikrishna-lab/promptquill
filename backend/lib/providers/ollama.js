export async function callOllama(apiKey, messages, params, extra = {}, onChunk) {
  const baseUrl = extra.baseUrl || 'http://localhost:11434';
  const response = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: params.model || 'llama3.1',
      messages,
      stream: params.stream || false,
      options: { temperature: params.temperature || 0.7 },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Ollama error: ${response.status} ${err}`);
  }

  const data = await response.json();
  return { content: data.message?.content || '', provider: 'ollama' };
}
