export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Only POST allowed');

  const { messages } = req.body;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;
    return res.status(200).json({ reply });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to connect to OpenAI' });
  }
}