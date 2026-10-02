export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { message, history } = req.body || {};
    if (!message) return res.status(400).json({ error: 'Message kosong' });

    const API_KEY = process.env.GROQ_API_KEY;
    if (!API_KEY) return res.status(500).json({ error: 'GROQ_API_KEY belum diset' });

    const messages = [
      { role: 'system', content: 'Kamu adalah AI Support website Vinzxcyy. Bantu user ramah, singkat, santai, dan bisa diajak ngobrol bebas.' },
      ...(Array.isArray(history) ? history.slice(-8) : []),
      { role: 'user', content: message }
    ];

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${API_KEY}` },
      body: JSON.stringify({ 
        model: 'openai/gpt-oss-120b', 
        messages, 
        temperature: 0.7, 
        max_tokens: 500 
      })
    });

    const data = await groqRes.json();
    if (!groqRes.ok) return res.status(groqRes.status).json({ error: data?.error?.message || 'Groq error' });

    const reply = data?.choices?.[0]?.message?.content?.trim() || 'Maaf, belum bisa jawab.';
    return res.status(200).json({ reply });
  } catch (err) {
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
      }
