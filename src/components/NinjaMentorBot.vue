<template>
  <div class="wrapper">

    <!-- Header -->
    <div class="header">
      <div class="ninja-icon">🥷</div>
      <h1>Ninja Mentor</h1>
      <p class="subtitle">Powered by real Solve Ninja actions</p>
    </div>

    <!-- Progress Steps -->
    <div v-if="started" class="steps">
      <div
        v-for="(step, i) in STEPS"
        :key="i"
        :class="['step', { done: i < currentStep, active: i === currentStep }]"
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
          🥷 Begin My Journey
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
            <span v-if="msg.role === 'assistant'" class="bot-icon">🥷</span>
            {{ msg.content }}
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

const currentStep = computed(() => Math.min(stage.value - 1, 4))

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
      content: 'Hey Ninja! 🥷 What problem did you discover in your community recently?',
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
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0c29 0%, #1a1a3e 50%, #0d1b2a 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: 'Georgia', serif;
  padding: 20px;
}

/* ── Header ── */
.header {
  text-align: center;
  margin-bottom: 24px;
}
.ninja-icon { font-size: 48px; margin-bottom: 8px; }
.header h1 {
  color: #f5c842;
  font-size: 28px;
  font-weight: bold;
  letter-spacing: 1px;
  margin: 0;
}
.subtitle {
  color: #8892b0;
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
  font-family: 'Courier New', monospace;
  background: rgba(255, 255, 255, 0.05);
  color: #4a5568;
  border: 1px solid transparent;
  transition: all 0.3s ease;
}
.step.done {
  background: #f5c842;
  color: #0f0c29;
}
.step.active {
  background: rgba(245, 200, 66, 0.2);
  color: #f5c842;
  border-color: #f5c842;
  font-weight: bold;
}

/* ── Chat container ── */
.chat-container {
  width: 100%;
  max-width: 680px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 16px;
  border: 1px solid rgba(245, 200, 66, 0.15);
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
  color: #ccd6f6;
  font-size: 16px;
  line-height: 1.8;
}
.start-btn {
  background: #f5c842;
  color: #0f0c29;
  border: none;
  border-radius: 30px;
  padding: 14px 36px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  font-family: 'Georgia', serif;
  box-shadow: 0 4px 20px rgba(245, 200, 66, 0.3);
  transition: transform 0.15s;
}
.start-btn:hover { transform: scale(1.05); }

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
  background: linear-gradient(135deg, #f5c842, #e8a020);
  color: #0f0c29;
  border-radius: 18px 18px 4px 18px;
}
.bubble.assistant {
  background: rgba(255, 255, 255, 0.07);
  color: #ccd6f6;
  border-radius: 18px 18px 18px 4px;
  border: 1px solid rgba(245, 200, 66, 0.1);
}
.bot-icon { margin-right: 6px; font-size: 16px; }

.typing {
  font-size: 20px;
  letter-spacing: 4px;
  color: #f5c842;
  animation: pulse 1s infinite;
}

/* ── Input area ── */
.input-area {
  padding: 16px 20px;
  border-top: 1px solid rgba(245, 200, 66, 0.1);
  display: flex;
  gap: 10px;
  background: rgba(0, 0, 0, 0.2);
}
textarea {
  flex: 1;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(245, 200, 66, 0.2);
  border-radius: 10px;
  padding: 10px 14px;
  color: #ccd6f6;
  font-size: 14px;
  font-family: 'Georgia', serif;
  resize: none;
  outline: none;
  line-height: 1.5;
}
textarea::placeholder { color: #4a5568; }
.send-btn {
  background: #f5c842;
  border: none;
  border-radius: 10px;
  padding: 0 18px;
  font-size: 20px;
  cursor: pointer;
  color: #0f0c29;
  transition: all 0.2s;
}
.send-btn:disabled {
  background: rgba(245, 200, 66, 0.2);
  color: #4a5568;
  cursor: not-allowed;
}

/* ── Restart ── */
.restart-area {
  padding: 16px 20px;
  border-top: 1px solid rgba(245, 200, 66, 0.1);
  display: flex;
  justify-content: center;
  background: rgba(0, 0, 0, 0.2);
}
.restart-btn {
  background: transparent;
  border: 1px solid #f5c842;
  border-radius: 20px;
  padding: 8px 24px;
  color: #f5c842;
  font-size: 13px;
  cursor: pointer;
  font-family: 'Georgia', serif;
}

/* ── Footer ── */
.footer {
  color: #3d4a5e;
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
