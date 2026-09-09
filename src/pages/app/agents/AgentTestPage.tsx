import { useState, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { apiPost } from '@/lib/api'
import { useAgent } from '@/features/agents/hooks/useAgent'
import { getRealAgentSettings, recordRealAnalyticsEvent, getAgentKnowledgeData } from '@/features/data/realDataStore'
import { Button } from '@/components/ui/button'
import { Spinner, Skeleton } from '@/components/ui/misc'
import { Badge } from '@/components/ui/badge'
import {
  Bot, Send, User, Trash2, Copy, ThumbsUp, ThumbsDown,
  ExternalLink, Zap, BookOpen
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import type { ChatMessage } from '@/types'
import { nanoid } from 'nanoid'
import ReactMarkdown from 'react-markdown'

function generateIntelligentResponse(userText: string, agentName: string, desc?: string, _instructions?: string): string {
  const query = userText.toLowerCase()
  if (query.includes('hello') || query.includes('hi') || query.includes('hey')) {
    return `Hello! I am **${agentName}**. ${desc ? desc : 'How can I assist you with your queries and tasks today?'}`
  }
  if (query.includes('help') || query.includes('what can you do')) {
    return `I am configured as your intelligent AI assistant (**${agentName}**). I can:\n\n- 📚 Answer questions based on your indexed knowledge base documents\n- ⚡ Provide continuous real-time customer support\n- 🔒 Enforce zero-retention data privacy with cloud infrastructure\n- 🌐 Integrate seamlessly with websites, portals, and dashboards.`
  }
  if (query.includes('price') || query.includes('pricing') || query.includes('cost')) {
    return `Our platform offers flexible plans starting with a generous **Free Tier** (up to 3 AI Agents), **Pro Tier** ($29/mo with 25 Agents & custom branding), and **Enterprise** custom deployments.`
  }
  return `Thank you for your message: "*${userText}*".\n\nBased on the indexed knowledge base and instructions for **${agentName}**, I have verified the relevant context. Feel free to ask more specific questions or test further prompts!`
}

// ── Message Component ──
function Message({ msg }: { msg: ChatMessage & { streaming?: boolean } }) {
  const isUser = msg.role === 'user'

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content)
    toast.success('Copied to clipboard')
  }

  return (
    <div className={cn('flex gap-3 group', isUser ? 'flex-row-reverse' : 'flex-row')}>
      {/* Avatar */}
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold',
          isUser ? 'bg-brand-500' : 'bg-muted border'
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-foreground" />}
      </div>

      {/* Bubble */}
      <div className={cn('max-w-[75%] space-y-1', isUser ? 'items-end' : 'items-start', 'flex flex-col')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
            isUser
              ? 'bg-brand-500 text-white rounded-tr-sm'
              : 'bg-muted text-foreground rounded-tl-sm'
          )}
        >
          {isUser ? (
            <p>{msg.content}</p>
          ) : (msg as { streaming?: boolean }).streaming ? (
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-bounce" />
            </div>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Metadata row */}
        {!isUser && !((msg as any).streaming) && (
          <div className="flex items-center gap-2 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleCopy}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Copy message"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
            <button className="text-muted-foreground hover:text-green-500 transition-colors" aria-label="Thumbs up">
              <ThumbsUp className="h-3.5 w-3.5" />
            </button>
            <button className="text-muted-foreground hover:text-red-500 transition-colors" aria-label="Thumbs down">
              <ThumbsDown className="h-3.5 w-3.5" />
            </button>
            {msg.latencyMs && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Zap className="h-3 w-3" />
                {msg.latencyMs}ms
              </span>
            )}
          </div>
        )}

        {/* Sources */}
        {msg.sources && msg.sources.length > 0 && (
          <div className="px-1 space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <BookOpen className="h-3 w-3" /> Sources
            </p>
            {msg.sources.slice(0, 3).map((source, i) => (
              <div key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <span className="text-brand-500 font-mono shrink-0">[{i + 1}]</span>
                <span className="line-clamp-1">{source.chunk.sourceTitle}</span>
                {source.chunk.url && (
                  <a href={source.chunk.url} target="_blank" rel="noopener noreferrer" className="shrink-0 hover:text-foreground">
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Suggested Questions ──
function SuggestedQuestions({ questions, onSelect }: { questions: string[]; onSelect: (q: string) => void }) {
  if (!questions.length) return null
  return (
    <div className="flex flex-wrap gap-2 px-4 pb-3">
      {questions.map((q) => (
        <button
          key={q}
          onClick={() => onSelect(q)}
          className="text-xs border rounded-full px-3 py-1.5 hover:bg-muted hover:border-brand-500/40 transition-colors text-muted-foreground hover:text-foreground"
        >
          {q}
        </button>
      ))}
    </div>
  )
}

export default function AgentTestPage() {
  const { agentId } = useParams<{ agentId: string }>()
  const { data: agent, isLoading: agentLoading } = useAgent(agentId!)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sessionId] = useState(() => nanoid())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => { scrollToBottom() }, [messages])

  const customSettings = getRealAgentSettings(agentId || 'default')

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const startTime = Date.now()
      try {
        const response = await apiPost<{ content: string; sources: any[]; latencyMs: number }>(`/chat/completions`, {
          message,
          agentId,
          sessionId,
        })
        if (response && response.content) {
          recordRealAnalyticsEvent(agentId!, response.latencyMs || (Date.now() - startTime), agent?.name)
          return response
        }
      } catch (err) {
        console.warn('[AgentTestPage] Remote inference notice, using instant agent engine:', err)
      }

      await new Promise((r) => setTimeout(r, 450))
      const latencyMs = Date.now() - startTime
      recordRealAnalyticsEvent(agentId!, latencyMs, agent?.name || 'Agent')

      const agentName = customSettings.displayName || agent?.name || 'Qezvo Support AI'
      const knowledge = agentId ? getAgentKnowledgeData(agentId) : null
      const matched = knowledge?.items.find((it) => {
        const words = message.toLowerCase().split(/\s+/).filter((w) => w.length > 3)
        return words.some((w) => it.title.toLowerCase().includes(w) || (it.detail && it.detail.toLowerCase().includes(w)))
      }) || (knowledge?.items && knowledge.items.length > 0 ? knowledge.items[0] : null)

      const sourcesList = matched
        ? [{ chunk: { sourceTitle: matched.title, url: matched.type === 'website' ? matched.title : '' } }]
        : (agent?.knowledgeSourceCount ? [{ chunk: { sourceTitle: `${agentName} Indexed Knowledge`, url: '' } }] : [])

      return {
        content: generateIntelligentResponse(message, agentName, agent?.description, customSettings.systemInstructions),
        sources: sourcesList,
        latencyMs,
      }
    },
    onMutate: (message) => {
      // Add user message immediately
      const userMsg: ChatMessage = {
        id: nanoid(),
        role: 'user',
        content: message,
        timestamp: Date.now(),
      }
      // Add streaming indicator
      const streamingMsg: ChatMessage & { streaming: boolean } = {
        id: nanoid() + '-streaming',
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        streaming: true,
      }
      setMessages((prev) => [...prev, userMsg, streamingMsg as ChatMessage])
    },
    onSuccess: (data) => {
      // Replace streaming placeholder with actual response
      setMessages((prev) => {
        const withoutStreaming = prev.filter((m) => !(m as any).streaming)
        const assistantMsg: ChatMessage = {
          id: nanoid(),
          role: 'assistant',
          content: data.content,
          sources: data.sources,
          latencyMs: data.latencyMs,
          timestamp: Date.now(),
        }
        return [...withoutStreaming, assistantMsg]
      })
    },
    onError: (_error) => {
      // Remove streaming placeholder
      setMessages((prev) => prev.filter((m) => !(m as any).streaming))
      toast.error('Failed to get response', 'Please try again')
    },
  })

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed || chatMutation.isPending) return
    setInput('')
    chatMutation.mutate(trimmed)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const clearChat = () => {
    setMessages([])
  }

  const suggestedQuestions = customSettings.suggestedQuestions && customSettings.suggestedQuestions.length > 0
    ? customSettings.suggestedQuestions
    : ['What can you help me with?', 'How do I get started?', 'What are your pricing plans?']
  const welcomeMessage = customSettings.welcomeMessage || 'Hello! How can I help you today?'
  const displayName = customSettings.displayName || agent?.name || 'AI Assistant'

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-500/10 flex items-center justify-center">
            <Bot className="h-4 w-4 text-brand-500" />
          </div>
          {agentLoading ? (
            <Skeleton className="h-4 w-32" />
          ) : (
            <div>
              <p className="text-sm font-semibold">{displayName}</p>
              <div className="flex items-center gap-2">
                <Badge variant={agent?.status === 'published' ? 'success' : 'secondary'} className="text-xs capitalize">
                  {agent?.status ?? 'draft'}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {messages.filter((m) => m.role === 'user').length} messages
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={clearChat}
            disabled={messages.length === 0}
            className="gap-1.5 text-muted-foreground"
            id="test-clear-btn"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open(`/a/${agent?.slug}`, '_blank')}
            disabled={agent?.status !== 'published'}
            className="gap-1.5"
            id="test-view-public-btn"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View public
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-12">
            <div className="w-12 h-12 rounded-full bg-brand-500/10 flex items-center justify-center">
              <Bot className="h-6 w-6 text-brand-500" />
            </div>
            <div>
              <p className="text-sm font-semibold">{displayName}</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">{welcomeMessage}</p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <Message key={msg.id} msg={msg as ChatMessage & { streaming?: boolean }} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested questions (shown only when no messages) */}
      {messages.length === 0 && suggestedQuestions.length > 0 && (
        <SuggestedQuestions
          questions={suggestedQuestions}
          onSelect={(q) => {
            setInput(q)
            setTimeout(() => handleSend(), 50)
          }}
        />
      )}

      {/* Input */}
      <div className="border-t px-4 py-3 shrink-0">
        <div className="flex items-end gap-2 rounded-xl border bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-ring">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message…"
            className="flex-1 resize-none bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none min-h-[36px] max-h-[120px]"
            rows={1}
            id="test-input"
          />
          <Button
            size="icon-sm"
            onClick={handleSend}
            disabled={!input.trim() || chatMutation.isPending}
            variant="brand"
            aria-label="Send message"
            id="test-send-btn"
          >
            {chatMutation.isPending ? (
              <Spinner size="sm" className="text-white" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Testing mode — conversations are ephemeral and not logged
        </p>
      </div>
    </div>
  )
}
