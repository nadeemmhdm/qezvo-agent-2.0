import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Bot, ArrowRight, ArrowLeft, Check, Loader2, Globe, Sparkles } from 'lucide-react'
import { useCreateAgent } from '@/features/agents/hooks/useAgents'
import { createRealAgent } from '@/features/data/realDataStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ErrorMessage } from '@/components/ui/misc'
import type { AgentLanguage, AgentTone } from '@/types'

const step1Schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(60),
  description: z.string().max(200).optional(),
  language: z.string(),
})

type Step1Form = z.infer<typeof step1Schema>

const languages: { value: AgentLanguage; label: string; flag: string }[] = [
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'es', label: 'Spanish', flag: '🇪🇸' },
  { value: 'fr', label: 'French', flag: '🇫🇷' },
  { value: 'de', label: 'German', flag: '🇩🇪' },
  { value: 'pt', label: 'Portuguese', flag: '🇧🇷' },
  { value: 'it', label: 'Italian', flag: '🇮🇹' },
  { value: 'zh', label: 'Chinese', flag: '🇨🇳' },
  { value: 'ja', label: 'Japanese', flag: '🇯🇵' },
]

const tones: { value: AgentTone; label: string; description: string }[] = [
  { value: 'professional', label: 'Professional', description: 'Formal and business-oriented' },
  { value: 'friendly', label: 'Friendly', description: 'Warm, helpful, and approachable' },
  { value: 'casual', label: 'Casual', description: 'Relaxed and conversational' },
  { value: 'formal', label: 'Formal', description: 'Strict and highly structured' },
  { value: 'empathetic', label: 'Empathetic', description: 'Understanding and supportive' },
]

const STEPS = ['Basics', 'Personality', 'Review']

export default function CreateAgentPage() {
  const navigate = useNavigate()
  const createAgent = useCreateAgent()
  const [step, setStep] = useState(0)
  const [selectedTone, setSelectedTone] = useState<AgentTone>('friendly')
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Step1Form>({
    resolver: zodResolver(step1Schema),
    defaultValues: { name: '', description: '', language: 'en' },
  })

  const formValues = watch()

  const goNext = handleSubmit(() => {
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  })

  const goBack = () => setStep((s) => Math.max(s - 1, 0))

  const handleCreate = async () => {
    setError('')
    try {
      const agent = await createAgent.mutateAsync({
        name: formValues.name,
        description: formValues.description ?? '',
        language: (formValues.language as AgentLanguage) || 'en',
      })
      if (agent && agent.id) {
        navigate(`/app/agents/${agent.id}/overview`)
        return
      }
    } catch (err) {
      console.warn('Backend create agent notice, saving locally:', err)
      try {
        const localAgent = createRealAgent({
          name: formValues.name,
          description: formValues.description ?? '',
          language: (formValues.language as AgentLanguage) || 'en',
        })
        navigate(`/app/agents/${localAgent.id}/overview`)
        return
      } catch {
        setError('Failed to create agent. Please check your agent name and try again.')
      }
    }
  }

  return (
    <div className="min-h-full flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-brand-600 flex items-center justify-center mx-auto mb-4">
            <Bot className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Create New Agent</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Set up your AI agent in just a few steps
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  i < step
                    ? 'bg-brand-600 text-white'
                    : i === step
                    ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-600 border-2 border-brand-600'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span
                className={`text-sm ${
                  i === step ? 'text-foreground font-medium' : 'text-muted-foreground'
                }`}
              >
                {label}
              </span>
              {i < STEPS.length - 1 && (
                <div className="w-8 h-px bg-border mx-1" />
              )}
            </div>
          ))}
        </div>

        <Card>
          <CardContent className="pt-6">
            {/* Step 1: Basics */}
            {step === 0 && (
              <form onSubmit={goNext} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium" htmlFor="agent-name">
                    Agent Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="agent-name"
                    {...register('name')}
                    placeholder="e.g. Customer Support Bot"
                    autoFocus
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium" htmlFor="agent-description">
                    Description{' '}
                    <span className="text-muted-foreground font-normal">(optional)</span>
                  </label>
                  <textarea
                    id="agent-description"
                    {...register('description')}
                    placeholder="Brief description of what this agent does…"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  />
                  {errors.description && (
                    <p className="text-xs text-destructive">{errors.description.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5" />
                    Primary Language
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {languages.map((lang) => (
                      <label key={lang.value} className="cursor-pointer">
                        <input
                          type="radio"
                          {...register('language')}
                          value={lang.value}
                          className="sr-only"
                        />
                        <div
                          className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-center transition-colors ${
                            formValues.language === lang.value
                              ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300'
                              : 'border-border hover:border-border/80 hover:bg-muted/50'
                          }`}
                        >
                          <span className="text-lg">{lang.flag}</span>
                          <span className="text-xs font-medium">{lang.label}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit">
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            )}

            {/* Step 2: Personality */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    Agent Personality
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Choose how your agent communicates with users
                  </p>
                  <div className="space-y-2 mt-2">
                    {tones.map((tone) => (
                      <label key={tone.value} className="cursor-pointer block">
                        <div
                          onClick={() => setSelectedTone(tone.value)}
                          className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                            selectedTone === tone.value
                              ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                              : 'border-border hover:border-muted-foreground/40 hover:bg-muted/30'
                          }`}
                        >
                          <div
                            className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                              selectedTone === tone.value
                                ? 'border-brand-500'
                                : 'border-muted-foreground/40'
                            }`}
                          >
                            {selectedTone === tone.value && (
                              <div className="h-2 w-2 rounded-full bg-brand-500" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{tone.label}</p>
                            <p className="text-xs text-muted-foreground">{tone.description}</p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Button variant="ghost" onClick={goBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button onClick={() => setStep(2)}>
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 2 && (
              <div className="space-y-4">
                {error && <ErrorMessage message={error} />}

                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Review Your Agent
                  </h3>
                  <div className="rounded-lg bg-muted/50 border border-border/50 divide-y divide-border/50">
                    {[
                      { label: 'Name', value: formValues.name },
                      {
                        label: 'Description',
                        value: formValues.description || '(none)',
                      },
                      {
                        label: 'Language',
                        value:
                          languages.find((l) => l.value === formValues.language)?.label ?? 'English',
                      },
                      {
                        label: 'Personality',
                        value: tones.find((t) => t.value === selectedTone)?.label ?? 'Friendly',
                      },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-start gap-4 px-4 py-3">
                        <span className="text-xs text-muted-foreground w-24 pt-0.5 shrink-0">
                          {label}
                        </span>
                        <span className="text-sm font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Button variant="ghost" onClick={goBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button onClick={handleCreate} disabled={createAgent.isPending}>
                    {createAgent.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating…
                      </>
                    ) : (
                      <>
                        <Bot className="mr-2 h-4 w-4" />
                        Create Agent
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
