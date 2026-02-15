"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  ArrowLeft, Loader2, Target, Check, Bell, BellOff,
  Calendar, Trophy, Lightbulb, Flame, Zap, Clock,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { INDUSTRY_OPTIONS } from "@/lib/constants"
import {
  getGrowthPlan, saveGrowthPlan, deleteGrowthPlan,
  markTodayCompleted, isTodayCompleted, shouldPostToday,
  getProgress, getCurrentWeek,
} from "@/lib/planner-storage"
import { getProfile } from "@/lib/profile-storage"
import { requestNotificationPermission, isNotificationSupported } from "@/lib/notifications"
import type { GrowthPlan, GrowthPlanAI, DifficultyOption } from "@/types/growth-plan"
import { toast } from "sonner"

const DIFFICULTY_ICONS: Record<string, React.ElementType> = {
  easy: Clock,
  medium: Zap,
  hard: Flame,
}

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "border-green-500/30 bg-green-500/5",
  medium: "border-yellow-500/30 bg-yellow-500/5",
  hard: "border-red-500/30 bg-red-500/5",
}

export default function PlannerPage() {
  const [plan, setPlan] = useState<GrowthPlan | null>(null)
  const [loading, setLoading] = useState(false)
  const [generatedPlan, setGeneratedPlan] = useState<GrowthPlanAI | null>(null)

  // Form state
  const [goal, setGoal] = useState("")
  const [industry, setIndustry] = useState("beauty")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    setPlan(getGrowthPlan())
    const profile = getProfile()
    if (profile?.industry) setIndustry(profile.industry)
  }, [])

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    if (!goal.trim()) return

    setLoading(true)
    setGeneratedPlan(null)

    try {
      const profile = getProfile()
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, industry, notes, profile }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Błąd generowania planu")
      }

      const planAI: GrowthPlanAI = await res.json()
      setGeneratedPlan(planAI)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Błąd generowania planu")
    } finally {
      setLoading(false)
    }
  }

  function handleSelectDifficulty(option: DifficultyOption) {
    if (!generatedPlan) return

    const now = new Date()
    const end = new Date(now)
    end.setDate(end.getDate() + option.durationWeeks * 7)

    const newPlan: GrowthPlan = {
      id: crypto.randomUUID(),
      goal,
      difficulty: option.level,
      durationWeeks: option.durationWeeks,
      reelsPerWeek: option.reelsPerWeek,
      startDate: now.toISOString(),
      endDate: end.toISOString(),
      industry,
      plan: generatedPlan,
      completedDays: [],
      notificationsEnabled: false,
      notificationTime: "09:00",
      status: "active",
      createdAt: now.toISOString(),
    }

    saveGrowthPlan(newPlan)
    setPlan(newPlan)
    setGeneratedPlan(null)
    toast.success("Plan aktywowany!")
  }

  function handleMarkDone() {
    markTodayCompleted()
    setPlan(getGrowthPlan())
    toast.success("Super! Dzisiejsza rolka zaliczona!")
  }

  async function handleToggleNotifications() {
    if (!plan) return

    if (!plan.notificationsEnabled) {
      const granted = await requestNotificationPermission()
      if (!granted) {
        toast.error("Nie udało się włączyć powiadomień. Sprawdź uprawnienia przeglądarki.")
        return
      }
    }

    const updated = { ...plan, notificationsEnabled: !plan.notificationsEnabled }
    saveGrowthPlan(updated)
    setPlan(updated)
    toast.success(updated.notificationsEnabled ? "Powiadomienia włączone" : "Powiadomienia wyłączone")
  }

  function handleTimeChange(time: string) {
    if (!plan) return
    const updated = { ...plan, notificationTime: time }
    saveGrowthPlan(updated)
    setPlan(updated)
  }

  function handleDeletePlan() {
    deleteGrowthPlan()
    setPlan(null)
    setGeneratedPlan(null)
    setGoal("")
    toast.success("Plan usunięty")
  }

  const todayDone = isTodayCompleted()
  const progress = plan ? getProgress(plan) : null
  const currentWeek = plan ? getCurrentWeek(plan) : 0
  const postToday = plan ? shouldPostToday(plan) : false

  // FORM STATE — no plan, no generated plan
  if (!plan && !generatedPlan && !loading) {
    return (
      <main className="flex min-h-screen items-start justify-center px-4 py-10 sm:py-16">
        <div className="w-full max-w-xl flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit">
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>
            <div className="flex items-center gap-2">
              <Target className="h-6 w-6 text-primary" />
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Planer rozwoju konta
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Ustaw cel, a AI stworzy realistyczny plan oparty na prawdziwych statystykach Instagrama.
            </p>
          </div>

          <form onSubmit={handleGenerate} className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex flex-col gap-2">
              <Label htmlFor="goal" className="text-sm font-medium">Twój cel *</Label>
              <Input
                id="goal"
                placeholder="np. 1000 obserwujących, 10 klientek miesięcznie, rozpoznawalność w mieście"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="planIndustry" className="text-sm font-medium">Branża</Label>
              <select
                id="planIndustry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="flex h-9 w-full rounded-md border border-border bg-card px-3 py-1 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {INDUSTRY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="planNotes" className="text-sm font-medium">Dodatkowe informacje</Label>
              <Textarea
                id="planNotes"
                placeholder="np. mam aktualnie 200 obserwujących, prowadzę salon w Krakowie"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            <Button type="submit" className="w-full bg-primary text-primary-foreground">
              <Target className="mr-2 h-4 w-4" />
              Stwórz plan
            </Button>
          </form>
        </div>
      </main>
    )
  }

  // LOADING STATE
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div>
            <p className="text-sm font-medium text-foreground">Analizuję Twój cel...</p>
            <p className="text-xs text-muted-foreground mt-1">
              Tworzę realistyczny plan oparty na statystykach IG
            </p>
          </div>
        </div>
      </main>
    )
  }

  // DIFFICULTY SELECTION — generated plan, no active plan yet
  if (generatedPlan && !plan) {
    return (
      <main className="flex min-h-screen items-start justify-center px-4 py-10 sm:py-16">
        <div className="w-full max-w-xl flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <button
              onClick={() => setGeneratedPlan(null)}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
            >
              <ArrowLeft className="h-4 w-4" />
              Zmień cel
            </button>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Wybierz tempo
            </h1>
            <p className="text-sm text-muted-foreground">
              {generatedPlan.summary}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {generatedPlan.difficultyOptions.map((option) => {
              const Icon = DIFFICULTY_ICONS[option.level] || Zap
              const colorClass = DIFFICULTY_COLORS[option.level] || ""
              return (
                <button
                  key={option.level}
                  onClick={() => handleSelectDifficulty(option)}
                  className={`rounded-xl border-2 ${colorClass} p-4 text-left transition-all hover:scale-[1.01] active:scale-[0.99]`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-5 w-5" />
                    <span className="font-semibold text-foreground">{option.label}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{option.description}</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{option.durationWeeks} tyg.</Badge>
                    <Badge variant="secondary">{option.reelsPerWeek} Reelsów/tydz.</Badge>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Preview sections */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Filary contentu</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {generatedPlan.contentPillars.map((p, i) => (
                <Badge key={i} variant="outline">{p}</Badge>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h3 className="text-sm font-semibold mb-2">Oczekiwany wzrost</h3>
            <p className="text-sm text-muted-foreground">{generatedPlan.expectedGrowth}</p>
          </div>
        </div>
      </main>
    )
  }

  // ACTIVE PLAN
  if (!plan) return null

  const todayDay = ["Niedziela", "Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota"][new Date().getDay()]
  const todayTask = plan.plan.weeklySchedule.find((t) => t.day === todayDay)

  return (
    <main className="flex min-h-screen items-start justify-center px-4 py-10 sm:py-16">
      <div className="w-full max-w-xl flex flex-col gap-5">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit">
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {plan.goal}
              </h1>
              <p className="text-sm text-muted-foreground">
                Tydzień {currentWeek}/{plan.durationWeeks} &middot;{" "}
                {plan.difficulty === "easy" ? "Spokojne tempo" : plan.difficulty === "medium" ? "Zbalansowany" : "Intensywny"}
              </p>
            </div>
            <Badge variant="secondary" className="w-fit">
              {progress?.percentage}% ukończone
            </Badge>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${progress?.percentage || 0}%` }}
          />
        </div>

        {/* Today's action */}
        {postToday && (
          <div className={`rounded-xl border-2 p-4 ${todayDone ? "border-green-500/30 bg-green-500/5" : "border-primary/30 bg-primary/5"}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {todayDone ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <Calendar className="h-5 w-5 text-primary" />
                  )}
                  <span className="font-semibold text-foreground">
                    {todayDone ? "Zrobione!" : `Dzisiaj: ${todayDay}`}
                  </span>
                </div>
                {todayTask && (
                  <p className="text-sm text-muted-foreground">
                    {todayTask.action} &middot; <span className="text-foreground">{todayTask.contentType}</span>
                  </p>
                )}
              </div>
              {!todayDone && (
                <Button onClick={handleMarkDone} className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto">
                  <Check className="mr-2 h-4 w-4" />
                  Wrzuciłem rolkę!
                </Button>
              )}
            </div>
          </div>
        )}

        {!postToday && (
          <div className="rounded-xl border border-border bg-card/50 p-4 text-center">
            <p className="text-sm text-muted-foreground">Dzisiaj dzień wolny od nagrywania. Odpoczywaj!</p>
          </div>
        )}

        {/* Weekly schedule */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground mb-3">Harmonogram tygodniowy</h3>
          <div className="flex flex-col gap-2">
            {plan.plan.weeklySchedule.map((task, i) => {
              const isToday = task.day === todayDay
              return (
                <div
                  key={i}
                  className={`flex items-center gap-3 rounded-lg p-2.5 text-sm ${
                    isToday ? "bg-primary/10 border border-primary/20" : "bg-muted/30"
                  }`}
                >
                  <span className={`font-medium min-w-[90px] ${isToday ? "text-primary" : "text-foreground"}`}>
                    {task.day}
                  </span>
                  <span className="text-muted-foreground flex-1">{task.action}</span>
                  <Badge variant="secondary" className="text-xs shrink-0">{task.contentType}</Badge>
                </div>
              )
            })}
          </div>
        </div>

        {/* Milestones */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Kamienie milowe</h3>
          </div>
          <div className="flex flex-col gap-3">
            {plan.plan.milestones.map((m, i) => {
              const isPast = m.week < currentWeek
              const isCurrent = m.week === currentWeek
              return (
                <div
                  key={i}
                  className={`flex items-start gap-3 rounded-lg p-2.5 text-sm ${
                    isCurrent ? "bg-primary/10 border border-primary/20"
                    : isPast ? "opacity-60"
                    : "bg-muted/30"
                  }`}
                >
                  <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    isPast ? "bg-green-500/20 text-green-500"
                    : isCurrent ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                  }`}>
                    {isPast ? <Check className="h-3 w-3" /> : m.week}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Tydz. {m.week}: {m.target}</p>
                    <p className="text-xs text-muted-foreground">{m.metric}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Content pillars */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Filary contentu</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {plan.plan.contentPillars.map((p, i) => (
              <Badge key={i} variant="outline">{p}</Badge>
            ))}
          </div>
        </div>

        {/* Tips */}
        {plan.plan.tips.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground mb-2">Wskazówki</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {plan.plan.tips.map((t, i) => <li key={i}>{t}</li>)}
            </ul>
          </div>
        )}

        {/* Notifications */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {plan.notificationsEnabled ? (
                <Bell className="h-4 w-4 text-primary" />
              ) : (
                <BellOff className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-sm font-medium text-foreground">Powiadomienia push</span>
            </div>
            <div className="flex items-center gap-2">
              {plan.notificationsEnabled && (
                <input
                  type="time"
                  value={plan.notificationTime}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className="h-8 rounded-md border border-border bg-card px-2 text-sm text-foreground"
                />
              )}
              <Button
                variant={plan.notificationsEnabled ? "default" : "outline"}
                size="sm"
                onClick={handleToggleNotifications}
                disabled={!isNotificationSupported()}
              >
                {plan.notificationsEnabled ? "Wyłącz" : "Włącz"}
              </Button>
            </div>
          </div>
          {!isNotificationSupported() && (
            <p className="text-xs text-muted-foreground mt-2">
              Twoja przeglądarka nie wspiera powiadomień push.
            </p>
          )}
        </div>

        {/* Delete plan */}
        <Button variant="outline" onClick={handleDeletePlan} className="text-destructive hover:text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Anuluj plan
        </Button>
      </div>
    </main>
  )
}
