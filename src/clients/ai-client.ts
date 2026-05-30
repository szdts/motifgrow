import OpenAI from 'openai'
import { env } from '@/lib/env'

export interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface AITool {
  type: 'function'
  function: {
    name: string
    description: string
    parameters: Record<string, unknown>
  }
}

export interface AIResponse {
  content: string | null
  toolCalls?: {
    id: string
    function: { name: string; arguments: string }
  }[]
  usage?: { promptTokens: number; completionTokens: number }
}

export interface AIClient {
  chat(messages: AIMessage[], tools?: AITool[]): Promise<AIResponse>
  classify(prompt: string): Promise<string>
}

export class DeepSeekClient implements AIClient {
  private client: OpenAI

  constructor() {
    this.client = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey: env.DEEPSEEK_API_KEY ?? 'not-configured',
    })
  }

  async chat(messages: AIMessage[], tools?: AITool[]): Promise<AIResponse> {
    const response = await this.client.chat.completions.create({
      model: 'deepseek-chat',
      messages,
      tools: tools?.length ? tools : undefined,
      max_tokens: 4096,
    })

    const choice = response.choices[0]
    return {
      content: choice.message.content,
      toolCalls: choice.message.tool_calls
        ?.filter((tc): tc is Extract<typeof tc, { type: 'function' }> => tc.type === 'function')
        .map((tc) => ({
          id: tc.id,
          function: { name: tc.function.name, arguments: tc.function.arguments },
        })),
      usage: response.usage
        ? {
            promptTokens: response.usage.prompt_tokens,
            completionTokens: response.usage.completion_tokens,
          }
        : undefined,
    }
  }

  async classify(prompt: string): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 64,
    })
    return response.choices[0]?.message.content?.trim() ?? ''
  }
}

let _aiClient: AIClient | null = null

export function getAIClient(): AIClient {
  if (!_aiClient) {
    _aiClient = new DeepSeekClient()
  }
  return _aiClient
}
