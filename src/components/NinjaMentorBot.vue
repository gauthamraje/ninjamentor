<template>
  <div class="wrapper">

    <!-- Header -->
    <div class="header">
      <div class="ninja-icon">
        <img src="https://forum.solveninja.org/uploads/default/original/1X/321593460c29373164862fadbdfd8b0d04f9f043.png" alt="Solve Ninja" />
      </div>
      <h1>Ninja Mentor</h1>
      <p class="subtitle">Powered by real Solve Ninja actions</p>
    </div>

    <!-- Progress Steps -->
    <div v-if="started" class="steps">
      <div
        v-for="(step, i) in STEPS"
        :key="i"
        :class="['step', { done: i + 1 < stage, active: i + 1 === stage }]"
      >
        <span>{{ step.icon }}</span>
        <span>{{ step.label }}</span>
      </div>
    </div>

    <!-- Chat Container -->
    <div class="chat-container">

      <!-- Welcome Screen -->
      <div v-if="!started" class="welcome">
        <p>
          Welcome, Ninja! 👋<br />
          I'm your personal civic action mentor.<br />
          Tell me about a problem you've discovered, and I'll help you become a real changemaker.
        </p>
        <button class="start-btn" @click="startConversation">
          <span class="start-icon">
            <img src="https://forum.solveninja.org/uploads/default/original/1X/321593460c29373164862fadbdfd8b0d04f9f043.png" alt="Solve Ninja" />
          </span>
          <span>Begin My Journey</span>
        </button>
      </div>

      <!-- Messages -->
      <div v-else class="messages" ref="messagesEl">
        <div
          v-for="(msg, i) in messages"
          :key="i"
          :class="['message-row', msg.role]"
        >
          <div :class="['bubble', msg.role]">
            <span v-if="msg.role === 'assistant'" class="bot-icon">
              <img src="https://forum.solveninja.org/uploads/default/original/1X/321593460c29373164862fadbdfd8b0d04f9f043.png" alt="Solve Ninja" />
            </span>
            <div
              v-if="msg.role === 'assistant'"
              class="assistant-content"
              v-html="msg.content"
            />
            <div v-else>
              {{ msg.content }}
            </div>
          </div>
        </div>

        <!-- Typing indicator -->
        <div v-if="loading" class="message-row assistant">
          <div class="bubble assistant typing">···</div>
        </div>

        <div ref="bottomEl" />
      </div>

      <!-- Input Area -->
      <div v-if="started && stage < 5" class="input-area">
        <textarea
          ref="inputEl"
          v-model="input"
          placeholder="Share your thoughts..."
          rows="2"
          :disabled="loading"
          @keydown.enter.exact.prevent="sendMessage"
        />
        <button
          class="send-btn"
          :disabled="loading || !input.trim()"
          @click="sendMessage"
        >
          ➤
        </button>
      </div>

      <!-- Restart button after completion -->
      <div v-if="started && stage >= 5 && !loading" class="restart-area">
        <button class="restart-btn" @click="restart">
          🔄 Start a new conversation
        </button>
      </div>

    </div>

    <!-- Footer -->
    <p class="footer">
      Insights powered by 48,000+ real Solve Ninja actions · Reap Benefit
    </p>

  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { SYSTEM_PROMPT } from '../data/ninjaData.js'

// ─── State ────────────────────────────────────────────────────────────────────
const messages  = ref([])
const input     = ref('')
const loading   = ref(false)
const stage     = ref(0)
const started   = ref(false)

const messagesEl = ref(null)
const bottomEl   = ref(null)
const inputEl    = ref(null)

const STEPS = [
  { label: 'Problem',        icon: '🔍' },
  { label: 'Why it matters', icon: '💛' },
  { label: 'Actions taken',  icon: '⚡' },
  { label: 'Ideas',          icon: '💡' },
  { label: 'Mentor feedback',icon: '🥷' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
const parseStage = (text) => {
  const match = text.match(/\{"stage":\s*(\d)\}/)
  return match ? parseInt(match[1]) : null
}

const cleanText = (text) =>
  text.replace(/\{"stage":\s*\d\}/g, '').trim()

const scrollToBottom = async () => {
  await nextTick()
  bottomEl.value?.scrollIntoView({ behavior: 'smooth' })
}

const focusInput = async () => {
  await nextTick()
  inputEl.value?.focus()
}

// ─── API call (OpenAI) ────────────────────────────────────────────────────────
const callOpenAI = async (conversationMessages) => {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemPrompt: SYSTEM_PROMPT,
      messages: conversationMessages,
      model: 'gpt-4o',
      max_tokens: 1500,
    }),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(text || `Request failed: ${response.status}`)
  }

  const data = await response.json()
  return data.content
}

// ─── Start conversation ───────────────────────────────────────────────────────
const startConversation = async () => {
  started.value = true
  loading.value = true

  try {
    const text = await callOpenAI([
      { role: 'user', content: 'Start the conversation. You are at stage 1.' },
    ])
    const parsedStage = parseStage(text)
    if (parsedStage) stage.value = parsedStage
    messages.value.push({ role: 'assistant', content: cleanText(text) })
  } catch (e) {
    console.error(e)
    messages.value.push({
      role: 'assistant',
      content: 'Hey Solve Ninja! What problem did you discover in your community recently?',
    })
    stage.value = 1
  }

  loading.value = false
  await scrollToBottom()
  await focusInput()
}

// ─── Send message ─────────────────────────────────────────────────────────────
const sendMessage = async () => {
  if (!input.value.trim() || loading.value) return

  const userText = input.value.trim()
  messages.value.push({ role: 'user', content: userText })
  input.value = ''
  loading.value = true
  await scrollToBottom()

  try {
    // Build API message history + stage instruction
    const apiMessages = [
      ...messages.value.slice(0, -1).map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: userText },
      { role: 'user', content: `[Current stage: ${stage.value}. After this user response, move to stage ${stage.value + 1}.]` },
    ]

    const text = await callOpenAI(apiMessages)
    const parsedStage = parseStage(text)
    if (parsedStage) stage.value = parsedStage
    messages.value.push({ role: 'assistant', content: cleanText(text) })
  } catch (e) {
    console.error(e)
    messages.value.push({ role: 'assistant', content: 'Something went wrong. Please try again!' })
  }

  loading.value = false
  await scrollToBottom()
  await focusInput()
}

// ─── Restart ──────────────────────────────────────────────────────────────────
const restart = () => {
  messages.value = []
  input.value    = ''
  stage.value    = 0
  started.value  = false
}
</script>

<style scoped>
/* ── Layout ── */
.wrapper {
  --rb-green: #00a86b;
  --rb-green-dark: #007b50;
  --rb-yellow: #ffc857;
  --rb-bg-light: #f4fff9;
  --rb-bg-card: #ffffff;
  --rb-text-main: #123524;
  --rb-text-muted: #5b6b65;

  min-height: 100vh;
  background: radial-gradient(circle at top, #d8ffeb 0%, #f4fff9 45%, #e5f5ff 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  padding: 20px;
}

/* ── Header ── */
.header {
  text-align: center;
  margin-bottom: 24px;
}
.ninja-icon {
  margin-bottom: 8px;
}
.ninja-icon img {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  box-shadow: 0 8px 24px rgba(0, 168, 107, 0.5);
}
.header h1 {
  color: var(--rb-green-dark);
  font-size: 30px;
  font-weight: bold;
  letter-spacing: 1px;
  margin: 0;
}
.subtitle {
  color: var(--rb-text-muted);
  font-size: 13px;
  margin: 6px 0 0;
}

/* ── Progress steps ── */
.steps {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  justify-content: center;
}
.step {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: rgba(0, 168, 107, 0.06);
  color: var(--rb-text-muted);
  border: 1px solid transparent;
  transition: all 0.3s ease;
}
.step.done {
  background: var(--rb-green);
  color: #ffffff;
  font-weight: 600;
}
.step.active {
  background: rgba(0, 168, 107, 0.16);
  color: var(--rb-green-dark);
  border-color: var(--rb-green);
  font-weight: 700;
  box-shadow: 0 0 0 1px rgba(0, 168, 107, 0.35);
}

/* ── Chat container ── */
.chat-container {
  width: 100%;
  max-width: 680px;
  background: var(--rb-bg-card);
  border-radius: 16px;
  border: 1px solid rgba(0, 168, 107, 0.18);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 420px;
  max-height: 560px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

/* ── Welcome screen ── */
.welcome {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 30px;
  gap: 28px;
}
.welcome p {
  color: var(--rb-text-main);
  font-size: 16px;
  line-height: 1.8;
}
.start-btn {
  background: var(--rb-green);
  color: #ffffff;
  border: none;
  border-radius: 30px;
  padding: 14px 36px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  font-family: inherit;
  box-shadow: 0 4px 16px rgba(0, 168, 107, 0.35);
  transition: transform 0.15s;
}
.start-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
}
.start-icon img {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #ffffff;
}
.start-btn:hover {
  transform: translateY(-1px) scale(1.03);
  background: var(--rb-green-dark);
}

/* ── Messages ── */
.messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.message-row {
  display: flex;
}
.message-row.user     { justify-content: flex-end; }
.message-row.assistant{ justify-content: flex-start; }

.bubble {
  max-width: 85%;
  padding: 12px 18px;
  font-size: 14px;
  line-height: 1.7;
  white-space: pre-wrap;
}
.bubble.user {
  background: linear-gradient(135deg, var(--rb-green), var(--rb-green-dark));
  color: #ffffff;
  border-radius: 18px 18px 4px 18px;
}
.bubble.assistant {
  background: #f7fff9;
  color: var(--rb-text-main);
  border-radius: 18px 18px 18px 4px;
  border: 1px solid rgba(0, 168, 107, 0.18);
}
.assistant-content {
  display: block;
}
.assistant-content h3 {
  margin: 0 0 8px;
  font-size: 15px;
  color: var(--rb-green-dark);
}
.assistant-content p {
  margin: 8px 0 0;
}
.assistant-content ul,
.assistant-content ol {
  margin: 6px 0 0 1.25rem;
  padding-left: 1.25rem;
}
.assistant-content li {
  margin-bottom: 4px;
}
.assistant-content details {
  margin-top: 12px;
}
.assistant-content summary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 18px;
  border-radius: 999px;
  background: var(--rb-green-dark);
  color: #ffffff;
  cursor: pointer;
  font-weight: 600;
  list-style: none;
  font-size: 13px;
  box-shadow: 0 2px 8px rgba(0, 168, 107, 0.45);
}
.assistant-content details[open] summary {
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
}
.assistant-content details ol {
  margin-top: 10px;
  padding: 8px 0 0 1.25rem;
}
.assistant-content summary::-webkit-details-marker {
  display: none;
}
.bot-icon {
  margin-right: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.bot-icon img {
  width: 18px;
  height: 18px;
  border-radius: 50%;
}

.typing {
  font-size: 20px;
  letter-spacing: 4px;
  color: var(--rb-green);
  animation: pulse 1s infinite;
}

/* ── Input area ── */
.input-area {
  padding: 16px 20px;
  border-top: 1px solid rgba(0, 168, 107, 0.16);
  display: flex;
  gap: 10px;
  background: #f5fff9;
}
textarea {
  flex: 1;
  background: #ffffff;
  border: 1px solid rgba(0, 168, 107, 0.24);
  border-radius: 10px;
  padding: 10px 14px;
  color: var(--rb-text-main);
  font-size: 14px;
  font-family: inherit;
  resize: none;
  outline: none;
  line-height: 1.5;
}
textarea::placeholder { color: var(--rb-text-muted); }
.send-btn {
  background: var(--rb-green);
  border: none;
  border-radius: 10px;
  padding: 0 18px;
  font-size: 20px;
  cursor: pointer;
  color: #ffffff;
  transition: all 0.2s;
}
.send-btn:disabled {
  background: rgba(0, 168, 107, 0.12);
  color: var(--rb-text-muted);
  cursor: not-allowed;
}

/* ── Restart ── */
.restart-area {
  padding: 16px 20px;
  border-top: 1px solid rgba(0, 168, 107, 0.16);
  display: flex;
  justify-content: center;
  background: #f5fff9;
}
.restart-btn {
  background: #ffffff;
  border: 1px solid rgba(0, 168, 107, 0.7);
  border-radius: 20px;
  padding: 8px 24px;
  color: var(--rb-green-dark);
  font-size: 13px;
  cursor: pointer;
  font-family: 'Georgia', serif;
}

/* ── Footer ── */
.footer {
  color: var(--rb-text-muted);
  font-size: 11px;
  margin-top: 16px;
  text-align: center;
}

/* ── Scrollbar ── */
.messages::-webkit-scrollbar       { width: 4px; }
.messages::-webkit-scrollbar-track { background: transparent; }
.messages::-webkit-scrollbar-thumb { background: rgba(245, 200, 66, 0.2); border-radius: 2px; }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.3; }
}
</style>
