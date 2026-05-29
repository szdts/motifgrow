import { create } from 'zustand'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  // Structured action card attached to AI replies
  action?: {
    type: 'create_goal' | 'add_backlog' | 'create_event' | 'update_progress'
    label: string
    done: boolean
  }
}

interface ChatState {
  messages: ChatMessage[]
  isOpen: boolean
  isLoading: boolean
  toggleOpen: () => void
  setOpen: (open: boolean) => void
  sendMessage: (content: string) => Promise<void>
  markActionDone: (messageId: string) => void
}

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    '你好！我是你的生活调度助手。你可以告诉我你想做什么，比如：\n\n\u2022 "帮我设一个读书目标"\n\u2022 "把《三体》加到媒体库"\n\u2022 "明天下午安排看电影"\n\u2022 "这周健身完成了 3 次"',
  timestamp: new Date(),
}

function getSmartResponse(input: string): ChatMessage[] {
  const lower = input.toLowerCase()
  const now = new Date()

  if (lower.includes('目标') || lower.includes('okr')) {
    return [
      {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '好的，我帮你创建一个新目标。你可以在目标页面查看和编辑详情。',
        timestamp: now,
        action: {
          type: 'create_goal',
          label: '已创建目标草稿',
          done: false,
        },
      },
    ]
  }

  if (
    lower.includes('加') &&
    (lower.includes('媒体') ||
      lower.includes('书') ||
      lower.includes('电影') ||
      lower.includes('剧'))
  ) {
    return [
      {
        id: crypto.randomUUID(),
        role: 'assistant',
        content:
          '收到！我把这个加到你的媒体库了。你可以去媒体库页面查看详情和设置进度。',
        timestamp: now,
        action: {
          type: 'add_backlog',
          label: '已添加到媒体库',
          done: false,
        },
      },
    ]
  }

  if (
    lower.includes('安排') ||
    lower.includes('日程') ||
    lower.includes('明天') ||
    lower.includes('今天')
  ) {
    return [
      {
        id: crypto.randomUUID(),
        role: 'assistant',
        content:
          '好的，我在日历上为你安排了一个时段。你可以在日历页面查看和调整。',
        timestamp: now,
        action: {
          type: 'create_event',
          label: '已创建日程建议',
          done: false,
        },
      },
    ]
  }

  if (
    lower.includes('完成') ||
    lower.includes('打卡') ||
    lower.includes('做了')
  ) {
    return [
      {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '太棒了！已记录你的进度。继续保持！',
        timestamp: now,
        action: {
          type: 'update_progress',
          label: '已更新进度',
          done: false,
        },
      },
    ]
  }

  return [
    {
      id: crypto.randomUUID(),
      role: 'assistant',
      content:
        '我理解了。你可以试着告诉我更具体的需求，比如想添加什么内容、设置什么目标、或者安排什么日程。我会尽力帮你处理！',
      timestamp: now,
    },
  ]
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [WELCOME_MESSAGE],
  isOpen: false,
  isLoading: false,

  toggleOpen: () => set((s) => ({ isOpen: !s.isOpen })),
  setOpen: (open) => set({ isOpen: open }),

  sendMessage: async (content) => {
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
    }
    set((s) => ({ messages: [...s.messages, userMsg], isLoading: true }))

    // Mock AI response -- TODO: wire to real AI API
    await new Promise((r) => setTimeout(r, 1000 + Math.random() * 500))

    const responses = getSmartResponse(content)
    set((s) => ({
      messages: [...s.messages, ...responses],
      isLoading: false,
    }))
  },

  markActionDone: (messageId) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === messageId && m.action
          ? { ...m, action: { ...m.action, done: true } }
          : m,
      ),
    })),
}))
