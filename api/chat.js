// /api/chat.js
// Función serverless de Vercel — proxy seguro hacia Groq API.
// La GROQ_API_KEY se configura como variable de entorno en Vercel
// (Project Settings → Environment Variables) y nunca se expone al navegador.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GROQ_API_KEY no configurada en el servidor' });
  }

  try {
    const { model, messages, max_tokens } = req.body || {};

    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages es requerido' });
    }

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model || 'llama-3.3-70b-versatile',
        messages,
        max_tokens: max_tokens || 300
      })
    });

    const data = await groqResponse.json();

    if (!groqResponse.ok) {
      return res.status(groqResponse.status).json(data);
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('Error /api/chat:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
