"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { BriefForm } from "@/components/brief-form"
import { PipelineProgress, type PipelineStep, type StepState } from "@/components/pipeline-progress"
import { ScenarioDisplay } from "@/components/scenario-display"
import { saveScenario } from "@/lib/storage"
import { getProfile, updateProfileFromBrief, updateProfileFeedback } from "@/lib/profile-storage"
import { getGrowthPlan, getFollowerTrend, getLatestFollowerCount, getCurrentWeek, getCurrentMilestoneTarget } from "@/lib/planner-storage"
import type { Brief } from "@/types/brief"
import type { ScenarioAIResponse } from "@/lib/ai/types"
import type { UserProfile } from "@/types/user-profile"
import type { GrowthContext } from "@/lib/ai/prompts"

const INITIAL_STEPS: Record<PipelineStep, StepState> = {
  accounts: { status: "waiting" },
  reels: { status: "waiting" },
  enrich: { status: "waiting" },
  scenario: { status: "waiting" },
}

export function AgentPipeline() {
  const router = useRouter()
  const [brief, setBrief] = useState<Brief>({
    treatment: "",
    targetAudience: "",
    tone: "profesjonalny",
    industry: "beauty",
    reelFormat: "hook-transformation",
    duration: "30s",
    language: "pl",
    controversyLevel: 3,
  })

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [steps, setSteps] = useState<Record<PipelineStep, StepState>>(INITIAL_STEPS)
  const [scenario, setScenario] = useState<ScenarioAIResponse | null>(null)
  const [rawText, setRawText] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [pipelineAccounts, setPipelineAccounts] = useState<string[]>([])
  const [pipelineReelsUsed, setPipelineReelsUsed] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(true)

  useEffect(() => {
    const p = getProfile()
    if (p) setProfile(p)
  }, [])

  const runPipeline = useCallback(async () => {
    setIsRunning(true)
    setShowForm(false)
    setSteps(INITIAL_STEPS)
    setScenario(null)
    setRawText("")
    setIsStreaming(false)
    setPipelineAccounts([])
    setPipelineReelsUsed(0)
    setError(null)

    // Update profile from brief
    updateProfileFromBrief(brief)
    const currentProfile = getProfile()
    setProfile(currentProfile)

    // Build growth context if plan is active
    let growthCtx: GrowthContext | null = null
    const activePlan = getGrowthPlan()
    if (activePlan && activePlan.status === "active") {
      const trend = getFollowerTrend(activePlan)
      const current = getLatestFollowerCount(activePlan)
      const target = getCurrentMilestoneTarget(activePlan)
      if (trend && current !== null && target !== null) {
        growthCtx = {
          trend,
          currentFollowers: current,
          targetFollowers: target,
          weekNumber: getCurrentWeek(activePlan),
          totalWeeks: activePlan.durationWeeks,
        }
      }
    }

    try {
      const res = await fetch("/api/run-pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief, profile: currentProfile, growthContext: growthCtx }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Błąd pipeline")
      }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      if (!reader) throw new Error("Brak streamu")

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        const lines = buffer.split("\n\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          const dataLine = line.trim()
          if (!dataLine.startsWith("data: ")) continue

          try {
            const event = JSON.parse(dataLine.slice(6))
            const step = event.step as PipelineStep | "error"
            const status = event.status as string

            if (step === "error") {
              setError(event.message || "Nieoczekiwany błąd")
              continue
            }

            if (status === "running") {
              setSteps((prev) => ({
                ...prev,
                [step]: { status: "running", message: event.message },
              }))
            } else if (status === "done") {
              setSteps((prev) => ({
                ...prev,
                [step]: { status: "done", data: event.data },
              }))

              if (step === "accounts" && event.data?.accounts) {
                setPipelineAccounts(event.data.accounts)
              }

              if (step === "scenario" && event.data?.scenario) {
                setScenario(event.data.scenario)
                setPipelineReelsUsed(event.data.reelsUsed || 0)
                setIsStreaming(false)
              }
            } else if (status === "streaming") {
              setIsStreaming(true)
              setRawText((prev) => prev + (event.chunk || ""))
            } else if (status === "error") {
              setSteps((prev) => ({
                ...prev,
                [step]: { status: "error", message: event.message },
              }))
              setError(event.message)
            }
          } catch {
            // skip malformed events
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd")
    } finally {
      setIsRunning(false)
    }
  }, [brief])

  const handleSave = useCallback(() => {
    if (!scenario) return

    saveScenario({
      id: crypto.randomUUID(),
      title: brief.treatment,
      brief,
      scenario,
      accounts: pipelineAccounts,
      reelsUsed: pipelineReelsUsed,
      createdAt: new Date().toISOString(),
    })

    toast.success("Scenariusz zapisany!")
    router.push("/")
  }, [scenario, brief, pipelineAccounts, pipelineReelsUsed, router])

  const handleRegenerate = useCallback(() => {
    runPipeline()
  }, [runPipeline])

  const handleReset = useCallback(() => {
    setShowForm(true)
    setSteps(INITIAL_STEPS)
    setScenario(null)
    setRawText("")
    setIsStreaming(false)
    setError(null)
  }, [])

  const handleFeedback = useCallback(
    (positive: boolean) => {
      updateProfileFeedback(brief.treatment, positive)
      setProfile(getProfile())
      toast.success(positive ? "Dzięki za feedback!" : "Zapamiętam na przyszłość")
    },
    [brief.treatment]
  )

  const pipelineStarted = !showForm

  return (
    <div className="flex flex-col gap-6">
      {showForm && (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
          <BriefForm
            brief={brief}
            onChange={setBrief}
            onSubmit={runPipeline}
            isLoading={isRunning}
          />
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
          <button
            type="button"
            onClick={handleReset}
            className="ml-2 underline hover:no-underline"
          >
            Spróbuj ponownie
          </button>
        </div>
      )}

      {pipelineStarted && (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-1 mb-4">
            <h3 className="text-sm font-semibold text-foreground">Agent pracuje</h3>
            <p className="text-xs text-muted-foreground">
              Zabieg: {brief.treatment}
            </p>
          </div>
          <PipelineProgress steps={steps} />
        </div>
      )}

      {(isStreaming || scenario) && (
        <ScenarioDisplay
          scenario={scenario}
          rawText={rawText}
          isStreaming={isStreaming}
          onSave={scenario ? handleSave : undefined}
          onRegenerate={handleRegenerate}
          onFeedback={scenario ? handleFeedback : undefined}
        />
      )}
    </div>
  )
}
