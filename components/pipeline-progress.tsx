"use client"

import { useState } from "react"
import { Check, Loader2, Search, Instagram, BarChart3, Sparkles, ChevronDown, ChevronUp } from "lucide-react"

export type PipelineStep = "accounts" | "reels" | "enrich" | "scenario"
export type StepStatus = "waiting" | "running" | "done" | "error"

export interface StepState {
  status: StepStatus
  message?: string
  data?: Record<string, unknown>
}

interface PipelineProgressProps {
  steps: Record<PipelineStep, StepState>
}

const STEP_CONFIG: { key: PipelineStep; label: string; icon: React.ElementType }[] = [
  { key: "accounts", label: "Szukam kont Instagram", icon: Search },
  { key: "reels", label: "Pobieram Reelsy", icon: Instagram },
  { key: "enrich", label: "Analizuję treści", icon: BarChart3 },
  { key: "scenario", label: "Generuję scenariusz", icon: Sparkles },
]

function StepDetails({ step, data }: { step: PipelineStep; data?: Record<string, unknown> }) {
  const [open, setOpen] = useState(false)

  if (!data) return null

  let content: React.ReactNode = null

  if (step === "accounts" && data.accounts) {
    const accounts = data.accounts as string[]
    content = (
      <div className="flex flex-wrap gap-1.5">
        {accounts.map((a) => (
          <span key={a} className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            @{a}
          </span>
        ))}
      </div>
    )
  }

  if (step === "reels" && data.totalFound !== undefined) {
    const topReels = (data.topReels || []) as Array<{ ownerUsername?: string; viralScore: number; views: number }>
    content = (
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">
          Znaleziono {data.totalFound as number} Reelsów, wybrano top {topReels.length}
        </span>
        {topReels.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {topReels.map((r, i) => (
              <span key={i} className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                @{r.ownerUsername} (score: {r.viralScore})
              </span>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (!content) return null

  return (
    <div className="ml-8 mt-1">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        Szczegóły
      </button>
      {open && <div className="mt-1.5">{content}</div>}
    </div>
  )
}

export function PipelineProgress({ steps }: PipelineProgressProps) {
  return (
    <div className="flex flex-col gap-3">
      {STEP_CONFIG.map(({ key, label, icon: Icon }) => {
        const step = steps[key]
        const isWaiting = step.status === "waiting"
        const isRunning = step.status === "running"
        const isDone = step.status === "done"
        const isError = step.status === "error"

        return (
          <div key={key}>
            <div className="flex items-center gap-3">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full transition-colors ${
                  isDone
                    ? "bg-green-500/20 text-green-500"
                    : isRunning
                    ? "bg-primary/20 text-primary"
                    : isError
                    ? "bg-destructive/20 text-destructive"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {isDone ? (
                  <Check className="h-3.5 w-3.5" />
                ) : isRunning ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Icon className="h-3.5 w-3.5" />
                )}
              </div>
              <span
                className={`text-sm transition-colors ${
                  isDone
                    ? "text-foreground"
                    : isRunning
                    ? "text-foreground font-medium"
                    : isError
                    ? "text-destructive"
                    : "text-muted-foreground"
                }`}
              >
                {step.message || label}
                {isError && " — błąd"}
              </span>
            </div>
            {isDone && <StepDetails step={key} data={step.data} />}
          </div>
        )
      })}
    </div>
  )
}
