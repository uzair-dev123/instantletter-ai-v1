export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Only POST requests are allowed.');
  }

  const { messages } = req.body;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',  // ✅ Upgraded to GPT-4o
        messages,
        temperature: 0.7,
        max_tokens: 1000,
        presence_penalty: 0,
        frequency_penalty: 0,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'OpenAI API error' });
    }

    const reply = data.choices?.[0]?.message?.content || 'No response received from OpenAI.';
    return res.status(200).json({ reply });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to connect to OpenAI API.' });
  }
}
