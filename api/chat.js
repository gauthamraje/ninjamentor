const OpenAI = require('openai')

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({
      error: 'Missing OPENAI_API_KEY on server',
    })
  }

  try {
    const body =
      typeof req.body === 'string' ? JSON.parse(req.body) : (req.body ?? {})

    const {
      messages,
      systemPrompt,
      model = 'gpt-4o',
      max_tokens = 1500,
    } = body

    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: '`messages` must be an array' })
    }

    const completion = await openai.chat.completions.create({
      model,
      max_tokens,
      messages: [
        ...(systemPrompt ? [{ role: 'system', content: String(systemPrompt) }] : []),
        ...messages,
      ],
    })

    const content = completion?.choices?.[0]?.message?.content ?? ''
    return res.status(200).json({ content })
  } catch (err) {
    // Avoid leaking internals; return a small message
    return res.status(500).json({
      error: 'OpenAI request failed',
      detail: err?.message ?? String(err),
    })
  }
}

