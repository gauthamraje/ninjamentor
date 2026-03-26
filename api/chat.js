const OpenAI = require('openai')

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function runAssistant(openai, threadId, messages) {
  const thread = threadId
    ? { id: threadId }
    : await openai.beta.threads.create()

  for (const msg of messages) {
    if (!msg.role || !msg.content) continue
    await openai.beta.threads.messages.create(thread.id, {
      role: msg.role,
      content: String(msg.content),
    })
  }

  // Keep outputs concise even if the assistant drifts.
  // Note: `max_tokens` from the frontend payload only applies to Chat Completions,
  // so we set an explicit cap for Assistants runs here.
  const run = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: ASSISTANT_ID,
    // Conservative cap to reduce long/multi-part replies.
    // If you need longer responses for specific flows, raise this later.
    max_completion_tokens: 450,
  })

  let runStatus = run
  const maxWait = 120000
  const started = Date.now()
  while (['queued', 'in_progress'].includes(runStatus.status)) {
    if (Date.now() - started > maxWait) {
      throw new Error('Assistant run timed out')
    }
    await sleep(1500)
    runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id)
  }

  if (runStatus.status !== 'completed') {
    const err = runStatus.last_error
    throw new Error(err?.message || `Run ended with status: ${runStatus.status}`)
  }

  const list = await openai.beta.threads.messages.list(thread.id, {
    order: 'desc',
    limit: 1,
  })
  const lastMessage = list.data?.[0]
  if (!lastMessage || lastMessage.role !== 'assistant') {
    throw new Error('No assistant message in thread')
  }
  const part = lastMessage.content?.[0]
  const content = part?.type === 'text' ? part.text?.value ?? '' : ''
  return { content, threadId: thread.id }
}

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
      threadId,
      model = 'gpt-4o',
      max_tokens = 1500,
    } = body

    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: '`messages` must be an array' })
    }

    // Use Assistants API (with vector store) when OPENAI_ASSISTANT_ID is set
    if (ASSISTANT_ID) {
      const { content, threadId: newThreadId } = await runAssistant(
        openai,
        threadId || null,
        messages
      )
      return res.status(200).json({ content, threadId: newThreadId })
    }

    // Fallback: Chat Completions with system prompt (uses ninjaData.js)
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
    return res.status(500).json({
      error: 'OpenAI request failed',
      detail: err?.message ?? String(err),
    })
  }
}

