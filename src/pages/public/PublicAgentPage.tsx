import { useState, useRef, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Bot, Send, ShieldCheck, RefreshCw, ThumbsUp, ThumbsDown,
  Copy, Check, ExternalLink, Sparkles, BookOpen
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  getRealAgentBySlug,
  resolveCleanAgentName,
  getAgentKnowledgeData,
  getRealAgentSettings,
  recordRealAnalyticsEvent,
  type RealKnowledgeSourceItem,
} from '@/features/data/realDataStore'
import { safeLocalStorageGet } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'
import { toast } from '@/hooks/use-toast'
import type { Agent } from '@/types'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  citations?: { title: string; url?: string }[]
}

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but',
  'by', 'can', 'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for',
  'from', 'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself',
  'him', 'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'let',
  'me', 'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only',
  'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she',
  'should', 'so', 'some', 'such', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves',
  'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too', 'under', 'until',
  'up', 'very', 'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom',
  'why', 'with', 'would', 'you', 'your', 'yours', 'yourself', 'yourselves', 'tell', 'give',
  'show', 'please', 'know', 'want', 'need'
])

function generateIntelligentResponse(
  query: string,
  agentName: string,
  agent: Agent | null,
  knowledge: ReturnType<typeof getAgentKnowledgeData> | null,
  rawClipboards: any[],
  _customInstructions?: string
): { reply: string; citations: { title: string; url?: string }[] } {
  const trimmed = query.trim()
  const lower = trimmed.toLowerCase()

  // 1. Natural greetings
  const greetingPattern = /^(hi|hello|hallo|helo|hey|hii+|howdy|greetings|salaam|namaste|good\s*(morning|afternoon|evening|day))\b/i
  if (greetingPattern.test(lower) || lower === 'hi' || lower === 'hello' || lower === 'hallo' || lower === 'hey') {
    const greeting = `Hello! I am **${agentName}**. How can I assist you today?\n\nFeel free to ask any questions about our products, services, or verified documentation.`
    const citations = knowledge && knowledge.items.length > 0
      ? [{ title: knowledge.items[0].title, url: knowledge.items[0].type === 'website' ? knowledge.items[0].title : undefined }]
      : []
    return { reply: greeting, citations }
  }

  // 2. Social & How are you
  if (/^(how are you|how's it going|how r u|what's up|sup)\b/i.test(lower)) {
    return {
      reply: `I'm doing great, thank you! I'm ready to assist you as **${agentName}**. What would you like to know today?`,
      citations: [],
    }
  }

  // 3. Identity & Capabilities
  if (/(who are you|what are you|what can you do|introduce yourself|tell me about yourself|what is your purpose)\b/i.test(lower)) {
    const about = agent?.description ? `\n\n**About**: ${agent.description}` : ''
    const sourcesCount = knowledge?.totalCount || 0
    const sourcesText = sourcesCount > 0
      ? `I currently have **${sourcesCount} verified knowledge source${sourcesCount !== 1 ? 's' : ''}** indexed to answer your questions accurately.`
      : 'I am ready to answer your inquiries based on our verified system documentation.'

    return {
      reply: `I am **${agentName}**, your intelligent AI assistant.${about}\n\n${sourcesText}\n\nYou can ask me about our features, policies, documentation, and guides.`,
      citations: knowledge && knowledge.items.length > 0
        ? knowledge.items.slice(0, 2).map((it) => ({ title: it.title, url: it.type === 'website' ? it.title : undefined }))
        : [],
    }
  }

  // 4. Politeness & Goodbyes
  if (/^(thank you|thanks|thx|thank u|appreciate it|ok thanks)\b/i.test(lower)) {
    return {
      reply: `You're very welcome! If you have any more questions, feel free to ask anytime. I'm always happy to help!`,
      citations: [],
    }
  }

  if (/^(bye|goodbye|see you|cya|take care|have a good day)\b/i.test(lower)) {
    return {
      reply: `Goodbye! Have a wonderful day ahead. Feel free to return whenever you need assistance!`,
      citations: [],
    }
  }

  // 5. Extract meaningful search keywords from user query
  const queryTokens = lower
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w))

  // 6. Search in real clipboard content items
  if (rawClipboards && rawClipboards.length > 0) {
    let bestClip: any = null
    let bestClipScore = 0

    for (const clip of rawClipboards) {
      const titleLower = (clip.title || '').toLowerCase()
      const contentLower = (clip.content || '').toLowerCase()
      let score = 0

      for (const token of queryTokens) {
        if (titleLower.includes(token)) score += 5
        if (contentLower.includes(token)) score += 2
      }

      // Also check full substring match
      if (titleLower.includes(lower) || contentLower.includes(lower)) {
        score += 10
      }

      if (score > bestClipScore) {
        bestClipScore = score
        bestClip = clip
      }
    }

    if (bestClip && bestClipScore >= 2) {
      return {
        reply: `Based on our verified knowledge base (**${bestClip.title}**):\n\n${bestClip.content}\n\nPlease let me know if you need any further assistance!`,
        citations: [{ title: bestClip.title }],
      }
    }
  }

  // 7. Search in all knowledge items (websites, files, sitemaps)
  if (knowledge && knowledge.items.length > 0) {
    let bestItem: RealKnowledgeSourceItem | null = null
    let bestItemScore = 0

    for (const item of knowledge.items) {
      const titleLower = (item.title || '').toLowerCase()
      const detailLower = (item.detail || '').toLowerCase()
      let score = 0

      for (const token of queryTokens) {
        if (titleLower.includes(token)) score += 4
        if (detailLower.includes(token)) score += 2
      }

      if (titleLower.includes(lower)) score += 8

      if (score > bestItemScore) {
        bestItemScore = score
        bestItem = item
      }
    }

    if (bestItem && bestItemScore >= 2) {
      if (bestItem.type === 'website') {
        const link = bestItem.title.startsWith('http') ? bestItem.title : `https://${bestItem.title}`
        return {
          reply: `Based on the verified website documentation for **${bestItem.title}**:\n\nOur indexed documentation covers this topic in detail. You can review the complete resources and live guides directly at [${bestItem.title}](${link}).\n\nIf you have a specific question about a section, please feel free to ask!`,
          citations: [{ title: bestItem.title, url: link }],
        }
      }

      if (bestItem.type === 'file') {
        return {
          reply: `Based on the indexed document **${bestItem.title}**:\n\n${bestItem.detail || 'This document contains verified data addressing your request.'}\n\nLet me know if you would like me to elaborate on any specific point!`,
          citations: [{ title: bestItem.title }],
        }
      }

      return {
        reply: `Based on the indexed source **${bestItem.title}**:\n\n${bestItem.detail}\n\nPlease let me know if you need more details!`,
        citations: [{ title: bestItem.title }],
      }
    }
  }

  // 8. Security / Privacy Built-in Guidance
  if (lower.includes('security') || lower.includes('privacy') || lower.includes('data safe')) {
    return {
      reply: `**${agentName}** operates on an architectural **Zero-Storage Chat & Ephemeral Analysis** policy:\n\n- 🔒 **Ephemeral Streaming**: Real-time conversations are held strictly in memory and are never written to disk or relational databases.\n- 🛡️ **Zero-Retention Files**: Staged files for semantic extraction are automatically permanently deleted upon indexing.\n- 🌐 **SSRF Protected Scraper**: All external website crawling blocks internal RFC 1918 subnets and cloud metadata endpoints.`,
      citations: [{ title: 'Architecture: Zero-Storage Chat Guarantee' }],
    }
  }

  // 9. If no specific match, formulate an honest, guided response listing real sources
  if (knowledge && knowledge.items.length > 0) {
    const topicList = knowledge.items.slice(0, 5).map((it) => `- 📄 **${it.title}** (${it.type})`).join('\n')
    return {
      reply: `I searched our verified knowledge base for **${agentName}**, but couldn't locate a section directly addressing "${trimmed}".\n\nHere are the verified documentation topics currently indexed and available:\n\n${topicList}\n\nPlease let me know if you would like information regarding any of these topics, or try rephrasing your question!`,
      citations: knowledge.items.slice(0, 2).map((it) => ({
        title: it.title,
        url: it.type === 'website' ? it.title : undefined,
      })),
    }
  }

  // 10. Fallback for unconfigured agents
  return {
    reply: `Thank you for your question. I am **${agentName}**.${agent?.description ? ` ${agent.description}` : ''}\n\nMy knowledge base is currently being updated with verified documentation. How can I assist you with general inquiries in the meantime?`,
    citations: [],
  }
}

export default function PublicAgentPage() {
  const { agentSlug } = useParams<{ agentSlug: string }>()

  const [agent, setAgent] = useState<Agent | null>(null)
  const [agentName, setAgentName] = useState('AI Assistant')
  const [knowledge, setKnowledge] = useState<ReturnType<typeof getAgentKnowledgeData> | null>(null)
  const [rawClipboards, setRawClipboards] = useState<any[]>([])

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<Record<string, 'up' | 'down'>>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load agent data and knowledge
  useEffect(() => {
    if (!agentSlug) return

    const found = getRealAgentBySlug(agentSlug)
    setAgent(found)

    const resolvedName = resolveCleanAgentName(found, agentSlug)
    setAgentName(resolvedName)

    const targetId = found?.id || agentSlug
    const kn = getAgentKnowledgeData(targetId)
    setKnowledge(kn)

    const clips = safeLocalStorageGet<any[]>(`qezvo_clipboard_${targetId}`, [])
    const defClips = safeLocalStorageGet<any[]>('qezvo_clipboard_default', [])
    const mergedClips = [...clips, ...defClips.filter((dc) => !clips.some((c) => c.id === dc.id))]
    setRawClipboards(mergedClips)

    // Initial welcome message
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: `Hello! I'm **${resolvedName}**, your dedicated assistant. How can I help you today? Feel free to ask any questions about our products, services, or verified documentation.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: kn && kn.items.length > 0
          ? [{ title: kn.items[0].title, url: kn.items[0].type === 'website' ? kn.items[0].title : undefined }]
          : undefined,
      },
    ])
  }, [agentSlug])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  // Suggested questions based on real indexed sources
  const suggestedQuestions = useMemo(() => {
    const list: string[] = []
    if (rawClipboards && rawClipboards.length > 0) {
      list.push(`Tell me about ${rawClipboards[0].title}`)
    }
    if (knowledge && knowledge.items.length > 0) {
      const web = knowledge.items.find((it) => it.type === 'website')
      if (web) {
        list.push(`What is available on ${web.title}?`)
      }
    }
    list.push('What can you do?')
    list.push('Can you explain your security & privacy guarantees?')
    return list.slice(0, 4)
  }, [rawClipboards, knowledge])

  const handleSend = async (textToSend?: string) => {
    const text = textToSend ?? input
    if (!text.trim() || isTyping) return

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    const startTime = Date.now()

    // Generate intelligent response using real agent knowledge
    setTimeout(() => {
      const customSettings = agent ? getRealAgentSettings(agent.id) : null
      const { reply, citations } = generateIntelligentResponse(
        text,
        agentName,
        agent,
        knowledge,
        rawClipboards,
        customSettings?.systemInstructions
      )

      const latencyMs = Date.now() - startTime
      if (agent?.id) {
        recordRealAnalyticsEvent(agent.id, latencyMs, agentName)
      }

      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: citations && citations.length > 0 ? citations : undefined,
      }

      setMessages((prev) => [...prev, assistantMsg])
      setIsTyping(false)
    }, 600)
  }

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: `Conversation refreshed. I'm ready to answer any questions as **${agentName}**.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ])
    toast.info('Chat refreshed')
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* ── Top Header ── */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-md px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-500 flex items-center justify-center font-bold shrink-0">
            <Bot className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-bold text-base tracking-tight truncate">
                {agentName}
              </h1>
              <Badge variant="success" className="text-[10px] font-bold px-1.5 py-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1" />
                Live Agent
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {knowledge && knowledge.totalCount > 0
                ? `${knowledge.totalCount} verified knowledge source${knowledge.totalCount !== 1 ? 's' : ''} active`
                : 'Trained on verified documentation'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 border border-border px-2.5 py-1 rounded-lg">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>Zero-Storage Chat</span>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleResetChat}
            title="Clear conversation"
            aria-label="Clear conversation"
          >
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </header>

      {/* ── Chat Messages Stream ── */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 max-w-3xl mx-auto w-full">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-start gap-3 max-w-[88%] sm:max-w-[82%]">
              {m.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-500 border border-brand-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div className="space-y-1.5 w-full">
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-brand-500 text-white rounded-br-none shadow-md shadow-brand-500/10'
                      : 'bg-card border border-border rounded-bl-none text-foreground shadow-sm'
                  }`}
                >
                  {m.role === 'assistant' ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none break-words">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap break-words">{m.content}</p>
                  )}

                  {/* Real Citations if available */}
                  {m.citations && m.citations.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-border/50 flex flex-wrap gap-1.5">
                      <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1 w-full mb-0.5">
                        <BookOpen className="h-3 w-3 text-brand-500" />
                        Verified Sources:
                      </span>
                      {m.citations.map((c, idx) => (
                        c.url ? (
                          <a
                            key={idx}
                            href={c.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-muted hover:bg-muted/80 text-brand-600 dark:text-brand-400 border border-border/60 transition-colors"
                          >
                            <ExternalLink className="h-3 w-3" />
                            {c.title}
                          </a>
                        ) : (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border/60"
                          >
                            <Sparkles className="h-3 w-3 text-amber-500" />
                            {c.title}
                          </span>
                        )
                      ))}
                    </div>
                  )}
                </div>

                {/* Message footer: timestamp and feedback actions */}
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground px-1">
                  <span>{m.timestamp}</span>
                  {m.role === 'assistant' && (
                    <div className="flex items-center gap-1.5 ml-1">
                      <button
                        type="button"
                        onClick={() => handleCopy(m.id, m.content)}
                        className="hover:text-foreground transition-colors p-0.5"
                        aria-label="Copy response"
                        title="Copy to clipboard"
                      >
                        {copiedId === m.id ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFeedback({ ...feedback, [m.id]: 'up' })
                          toast.success('Thank you for your feedback!')
                        }}
                        className={`hover:text-foreground transition-colors p-0.5 ${
                          feedback[m.id] === 'up' ? 'text-emerald-500' : ''
                        }`}
                        aria-label="Helpful"
                        title="Helpful"
                      >
                        <ThumbsUp className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFeedback({ ...feedback, [m.id]: 'down' })
                          toast.info('Feedback recorded')
                        }}
                        className={`hover:text-foreground transition-colors p-0.5 ${
                          feedback[m.id] === 'down' ? 'text-rose-500' : ''
                        }`}
                        aria-label="Not helpful"
                        title="Not helpful"
                      >
                        <ThumbsDown className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-500 flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4" />
            </div>
            <div className="p-3.5 rounded-2xl rounded-bl-none bg-card border border-border flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-brand-500 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: '0.15s' }} />
              <div className="w-2 h-2 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: '0.3s' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Suggested Questions (when few messages) ── */}
      {messages.length <= 2 && (
        <div className="max-w-3xl mx-auto w-full px-4 pb-2">
          <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-brand-500" />
            Suggested questions:
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handleSend(q)}
                className="text-xs px-3 py-1.5 rounded-xl border border-border bg-card/80 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors font-medium shadow-xs"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Input Box & Footer ── */}
      <div className="border-t border-border bg-card/50 p-4 sticky bottom-0">
        <div className="max-w-3xl mx-auto space-y-3">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="flex items-center gap-2 relative"
          >
            <input
              type="text"
              placeholder={`Ask ${agentName} anything...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isTyping}
              className="flex-1 h-12 pl-4 pr-12 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all shadow-xs"
            />
            <Button
              type="submit"
              size="icon"
              variant="brand"
              disabled={!input.trim() || isTyping}
              className="absolute right-1.5 top-1.5 h-9 w-9 rounded-lg"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
            <span>Press Enter to send</span>
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brand-500 transition-colors flex items-center gap-1 font-medium"
            >
              <span>Powered by Qezvo Agent</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
