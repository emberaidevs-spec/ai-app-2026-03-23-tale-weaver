export default async function handler(req, res) {
  try {
    const { method, headers, body } = req;
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };

    if (method === 'OPTIONS') {
      return res.writeHead(200, corsHeaders).end();
    }

    if (method !== 'POST' || !body) {
      return res.status(405).json({ error: 'Only POST requests are allowed' });
    }

    const { prompt, type } = JSON.parse(body);
    if (!prompt || !type) {
      return res.status(400).json({ error: 'Prompt and type are required' });
    }

    const systemPrompt = `You are a creative writing assistant. Your task is to generate a ${type} based on the following prompt: ${prompt}. Please create a unique and engaging ${type}.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'system', content: systemPrompt }],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch data from Groq API: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    res.writeHead(200, { ...corsHeaders, 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ result: aiResponse }));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}