export async function callGemini(apiKey, messages, params, extra = {}, onChunk) {
  const model = params.model || 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const systemMsg = messages.find(m => m.role === 'system');
  const contents = messages.filter(m => m.role !== 'system').map(m => ({
    parts: [{ text: m.content }],
  }));

  const body = {
    contents,
    generationConfig: {
      temperature: params.temperature || 0.7,
      maxOutputTokens: params.max_tokens || 4096,
    },
  };
  if (systemMsg) {
    body.systemInstruction = { parts: [{ text: systemMsg.content }] };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini error: ${response.status} ${err}`);
  }

  const data = await response.json();
  return { content: data.candidates[0].content.parts[0].text, provider: 'gemini' };
}
