'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  X,
  Send,
  Mic,
  MicOff,
  MessageCircle,
  Target,
  BookOpen,
  Calendar,
  TrendingUp,
  Check,
} from 'lucide-react'
import { useChatStore } from '@/stores/chat-store'
import type { ChatMessage } from '@/stores/chat-store'

// ---------------------------------------------------------------------------
// Speech Recognition type shim
// ---------------------------------------------------------------------------

interface SpeechRecognitionEvent {
  results: { [index: number]: { [index: number]: { transcript: string } } }
}

interface SpeechRecognitionInstance {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onend: (() => void) | null
  onerror: (() => void) | null
  start: () => void
  stop: () => void
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance

function getSpeechRecognition(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null
  const win = window as unknown as Record<string, unknown>
  return (
    (win.SpeechRecognition ?? win.webkitSpeechRecognition) as
      | SpeechRecognitionConstructor
      | null
  )
}

// ---------------------------------------------------------------------------
// Action card icon mapping
// ---------------------------------------------------------------------------

const ACTION_ICONS: Record<string, typeof Target> = {
  create_goal: Target,
  add_backlog: BookOpen,
  create_event: Calendar,
  update_progress: TrendingUp,
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ActionChip({
  message,
  onMarkDone,
}: {
  message: ChatMessage
  onMarkDone: (id: string) => void
}) {
  const action = message.action
  if (!action) return null

  const Icon = ACTION_ICONS[action.type] ?? Target

  if (action.done) {
    return (
      <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-black/[0.08] px-3 py-2 text-[12px] text-black/[0.36]">
        <Check size={13} strokeWidth={2} className="text-[#34c759]" />
        <span className="line-through">{action.label}</span>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => onMarkDone(message.id)}
      className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-black/[0.08] px-3 py-2 text-[12px] text-[#0071e3] hover:bg-[#0071e3]/[0.04] transition-colors duration-150 cursor-pointer"
    >
      <Icon size={13} strokeWidth={1.8} />
      <span>{action.label}</span>
    </button>
  )
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 mr-auto rounded-2xl rounded-bl-md bg-[#f5f5f7] px-4 py-3 max-w-[80%]">
      <span className="typing-dot" />
      <span className="typing-dot [animation-delay:0.15s]" />
      <span className="typing-dot [animation-delay:0.3s]" />
    </div>
  )
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function MessageBubble({
  message,
  onMarkDone,
}: {
  message: ChatMessage
  onMarkDone: (id: string) => void
}) {
  const isUser = message.role === 'user'

  return (
    <div
      className={`flex flex-col px-4 py-1 ${isUser ? 'items-end' : 'items-start'}`}
    >
      <div
        className={`max-w-[80%] px-4 py-2.5 text-[13px] leading-[1.55] tracking-[-0.01em] whitespace-pre-wrap ${
          isUser
            ? 'bg-[#0071e3] text-white rounded-2xl rounded-br-md ml-auto'
            : 'bg-[#f5f5f7] text-[#1d1d1f] rounded-2xl rounded-bl-md mr-auto'
        }`}
      >
        {message.content}
      </div>
      {message.action && (
        <ActionChip message={message} onMarkDone={onMarkDone} />
      )}
      <span className="mt-1 text-[10px] text-black/[0.2] select-none px-0.5">
        {formatTime(message.timestamp)}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main ChatPanel
// ---------------------------------------------------------------------------

export function ChatPanel() {
  const isOpen = useChatStore((s) => s.isOpen)
  const messages = useChatStore((s) => s.messages)
  const isLoading = useChatStore((s) => s.isLoading)
  const toggleOpen = useChatStore((s) => s.toggleOpen)
  const setOpen = useChatStore((s) => s.setOpen)
  const sendMessage = useChatStore((s) => s.sendMessage)
  const markActionDone = useChatStore((s) => s.markActionDone)

  const [input, setInput] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [hasSpeech, setHasSpeech] = useState(false)

  const inputRef = useRef<HTMLTextAreaElement>(null)
  const scrollEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)

  // SSR-safe speech detection
  useEffect(() => {
    setHasSpeech(getSpeechRecognition() !== null)
  }, [])

  // Auto-scroll to bottom on new messages or loading state change
  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 180)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Escape to close
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, setOpen])

  const handleSend = useCallback(async () => {
    const trimmed = input.trim()
    if (!trimmed || isLoading) return
    setInput('')
    await sendMessage(trimmed)
  }, [input, isLoading, sendMessage])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend],
  )

  const startRecording = useCallback(() => {
    const Ctor = getSpeechRecognition()
    if (!Ctor) return
    const recognition = new Ctor()
    recognition.lang = 'zh-CN'
    recognition.continuous = false
    recognition.interimResults = false
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const text = event.results[0][0].transcript
      setInput((prev) => prev + text)
    }
    recognition.onend = () => setIsRecording(false)
    recognition.onerror = () => setIsRecording(false)
    recognition.start()
    recognitionRef.current = recognition
    setIsRecording(true)
  }, [])

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop()
    setIsRecording(false)
  }, [])

  const canSend = input.trim().length > 0 && !isLoading

  return (
    <>
      {/* ---------- Floating trigger button ---------- */}
      <button
        type="button"
        onClick={toggleOpen}
        aria-label="打开 AI 对话"
        className={`fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[#0071e3] shadow-lg hover:scale-110 transition-all duration-200 cursor-pointer ${
          isOpen
            ? 'pointer-events-none scale-0 opacity-0'
            : 'scale-100 opacity-100'
        }`}
      >
        <MessageCircle size={22} strokeWidth={1.8} className="text-white" />
      </button>

      {/* ---------- Chat panel ---------- */}
      <div
        className={`fixed bottom-5 right-5 z-50 flex w-[380px] max-h-[70vh] h-[560px] flex-col rounded-2xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-black/[0.06] transition-all duration-250 origin-bottom-right ${
          isOpen
            ? 'scale-100 opacity-100 pointer-events-auto'
            : 'scale-90 opacity-0 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-black/[0.06] px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0071e3]">
              <MessageCircle
                size={14}
                strokeWidth={1.8}
                className="text-white"
              />
            </div>
            <span className="text-[14px] font-semibold tracking-[-0.01em] text-[#1d1d1f]">
              AI 助手
            </span>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-black/[0.3] hover:text-black/[0.6] hover:bg-black/[0.04] transition-colors duration-150 cursor-pointer"
            aria-label="关闭面板"
          >
            <X size={15} strokeWidth={1.5} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto overscroll-contain py-3">
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              onMarkDone={markActionDone}
            />
          ))}
          {isLoading && (
            <div className="px-4 py-1">
              <TypingDots />
            </div>
          )}
          <div ref={scrollEndRef} />
        </div>

        {/* Input bar */}
        <div className="shrink-0 border-t border-black/[0.06] px-3 py-2.5">
          <div className="flex items-end gap-2">
            {/* Mic button -- hidden when browser doesn't support Speech API */}
            {hasSpeech && (
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-200 cursor-pointer ${
                  isRecording
                    ? 'bg-[#ff3b30]/[0.12] text-[#ff3b30] recording-pulse'
                    : 'text-black/[0.36] hover:text-black/[0.6] hover:bg-black/[0.04]'
                }`}
                aria-label={isRecording ? '停止录音' : '语音输入'}
              >
                {isRecording ? (
                  <MicOff size={17} strokeWidth={1.8} />
                ) : (
                  <Mic size={17} strokeWidth={1.5} />
                )}
              </button>
            )}

            {/* Text input */}
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入消息..."
              rows={1}
              className="flex-1 resize-none rounded-full border border-black/[0.08] px-4 py-2.5 text-[14px] text-[#1d1d1f] placeholder:text-black/[0.3] outline-none tracking-[-0.01em] leading-[1.4] max-h-[80px] scrollbar-none"
              style={{ fieldSizing: 'content' } as React.CSSProperties}
            />

            {/* Send button */}
            <button
              type="button"
              onClick={handleSend}
              disabled={!canSend}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-200 ${
                canSend
                  ? 'bg-[#0071e3] text-white hover:bg-[#0077ED] cursor-pointer'
                  : 'bg-black/[0.06] text-black/[0.16] cursor-not-allowed'
              }`}
              aria-label="发送消息"
            >
              <Send size={15} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </div>

      {/* Inline styles for typing dots and recording pulse (no framer-motion) */}
      <style>{`
        .typing-dot {
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: rgba(0, 0, 0, 0.24);
          animation: typing-bounce 0.6s ease-in-out infinite;
        }
        @keyframes typing-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .recording-pulse {
          animation: rec-pulse 1.2s ease-in-out infinite;
        }
        @keyframes rec-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255, 59, 48, 0.3); }
          50% { box-shadow: 0 0 0 8px rgba(255, 59, 48, 0); }
        }
      `}</style>
    </>
  )
}
