"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { ArrowLeft, RotateCcw, CreditCard, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { getProfile, saveProfile, resetProfile, initProfile } from "@/lib/profile-storage"
import { getScenarios } from "@/lib/storage"
import { INDUSTRY_OPTIONS, TONE_OPTIONS, FORMAT_OPTIONS } from "@/lib/constants"
import type { UserProfile } from "@/types/user-profile"
import type { SavedScenario } from "@/types/saved-scenario"
import { toast } from "sonner"

interface GenerationStats {
  topIndustry: string | null
  topTones: string[]
  avgControversy: number | null
  positiveRate: number | null
  uniqueTopics: number
  totalScenarios: number
}

function computeStats(scenarios: SavedScenario[]): GenerationStats {
  if (scenarios.length === 0) {
    return { topIndustry: null, topTones: [], avgControversy: null, positiveRate: null, uniqueTopics: 0, totalScenarios: 0 }
  }

  const briefs = scenarios.map((s) => s.brief)

  // Industry — most common
  const indFreq = new Map<string, number>()
  for (const b of briefs) {
    if (b.industry) indFreq.set(b.industry, (indFreq.get(b.industry) || 0) + 1)
  }
  let topIndustry: string | null = null
  let topIndCount = 0
  for (const [ind, count] of indFreq) {
    if (count > topIndCount) { topIndustry = ind; topIndCount = count }
  }

  // Tones — top 3
  const toneFreq = new Map<string, number>()
  for (const b of briefs) {
    const tones = b.tone.split(",").map((t) => t.trim()).filter(Boolean)
    for (const t of tones) toneFreq.set(t, (toneFreq.get(t) || 0) + 1)
  }
  const topTones = [...toneFreq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([t]) => t)

  // Avg controversy
  const contValues = briefs.map((b) => b.controversyLevel).filter((v) => v >= 1 && v <= 5)
  const avgControversy = contValues.length > 0
    ? Math.round((contValues.reduce((a, b) => a + b, 0) / contValues.length) * 10) / 10
    : null

  // Positive rate
  const rated = scenarios.filter((s) => s.feedback)
  const positiveRate = rated.length > 0
    ? Math.round((rated.filter((s) => s.feedback === "positive").length / rated.length) * 100)
    : null

  // Unique topics
  const uniqueTopics = new Set(briefs.map((b) => b.treatment)).size

  return { topIndustry, topTones, avgControversy, positiveRate, uniqueTopics, totalScenarios: scenarios.length }
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [scenarios, setScenarios] = useState<SavedScenario[]>([])

  useEffect(() => {
    setProfile(getProfile())
    setScenarios(getScenarios())
  }, [])

  const stats = useMemo(() => computeStats(scenarios), [scenarios])

  function handleCardField(field: keyof UserProfile, value: string) {
    const current = profile || initProfile()
    const updated = { ...current, [field]: value }
    saveProfile(updated)
    setProfile(updated)
  }

  function handleIndustryChange(value: string) {
    if (!profile) return
    const updated = { ...profile, industry: value }
    saveProfile(updated)
    setProfile(updated)
  }

  function toggleTone(tone: string) {
    if (!profile) return
    const tones = profile.preferredTones.includes(tone)
      ? profile.preferredTones.filter((t) => t !== tone)
      : [...profile.preferredTones, tone]
    const updated = { ...profile, preferredTones: tones }
    saveProfile(updated)
    setProfile(updated)
  }

  function toggleFormat(format: string) {
    if (!profile) return
    const formats = profile.preferredFormats.includes(format)
      ? profile.preferredFormats.filter((f) => f !== format)
      : [...profile.preferredFormats, format]
    const updated = { ...profile, preferredFormats: formats }
    saveProfile(updated)
    setProfile(updated)
  }

  function handleReset() {
    resetProfile()
    setProfile(null)
    toast.success("Profil zresetowany")
  }

  const industryLabel = (value: string) =>
    INDUSTRY_OPTIONS.find((o) => o.value === value)?.label || value

  return (
    <main className="flex min-h-screen items-start justify-center px-4 py-10 sm:py-16">
      <div className="w-full max-w-xl flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
          <div className="flex flex-col gap-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Twój profil
            </h1>
            <p className="text-sm text-muted-foreground">
              Agent uczy się Twoich preferencji z każdym użyciem.
            </p>
          </div>
        </div>

        {/* Karta członkowska — zawsze widoczna */}
        <div key={profile?.updatedAt || "empty"} className="rounded-xl border-2 border-primary/20 bg-gradient-to-br from-card to-card/80 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Twoja karta</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Wypełnij dane, aby AI lepiej dopasowywał scenariusze do Twojego biznesu.
          </p>
          <div className="flex flex-col gap-3">
            <div>
              <Label htmlFor="businessName" className="text-xs">Nazwa firmy / marki</Label>
              <Input
                id="businessName"
                placeholder="np. Studio Piękna Anna"
                defaultValue={profile?.businessName || ""}
                onBlur={(e) => handleCardField("businessName", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="businessDescription" className="text-xs">Opis działalności</Label>
              <Textarea
                id="businessDescription"
                placeholder="Czym się zajmujesz? 1-2 zdania."
                rows={2}
                defaultValue={profile?.businessDescription || ""}
                onBlur={(e) => handleCardField("businessDescription", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="targetNiche" className="text-xs">Nisza docelowa</Label>
              <Input
                id="targetNiche"
                placeholder="np. kobiety 25-45, zainteresowane anti-aging"
                defaultValue={profile?.targetNiche || ""}
                onBlur={(e) => handleCardField("targetNiche", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="uniqueSellingPoints" className="text-xs">Co Cię wyróżnia (USP)</Label>
              <Textarea
                id="uniqueSellingPoints"
                placeholder="Twoja unikalna przewaga nad konkurencją"
                rows={2}
                defaultValue={profile?.uniqueSellingPoints || ""}
                onBlur={(e) => handleCardField("uniqueSellingPoints", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="contentGoals" className="text-xs">Cel contentu</Label>
              <Input
                id="contentGoals"
                placeholder="np. sprzedaż, edukacja, budowanie marki"
                defaultValue={profile?.contentGoals || ""}
                onBlur={(e) => handleCardField("contentGoals", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="personalStyle" className="text-xs">Styl osobisty</Label>
              <Input
                id="personalStyle"
                placeholder="np. luźny, ekspercki, formalny"
                defaultValue={profile?.personalStyle || ""}
                onBlur={(e) => handleCardField("personalStyle", e.target.value)}
              />
            </div>
          </div>
        </div>

        {!profile ? (
          <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Brak danych profilu. Wygeneruj pierwszy scenariusz, aby rozpocząć budowanie profilu.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {/* Statystyki */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-foreground mb-3">Statystyki</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-foreground">{profile.generationCount}</p>
                  <p className="text-xs text-muted-foreground">Scenariuszy</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-500">{profile.feedback.positive}</p>
                  <p className="text-xs text-muted-foreground">Pozytywnych</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-500">{profile.feedback.negative}</p>
                  <p className="text-xs text-muted-foreground">Negatywnych</p>
                </div>
              </div>
            </div>

            {/* Podsumowanie generowań */}
            {stats.totalScenarios > 0 && (
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold text-foreground">Podsumowanie generowań</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-sm">
                  {stats.topIndustry && (
                    <div>
                      <p className="text-xs text-muted-foreground">Najczęstsza branża</p>
                      <p className="font-medium text-foreground">{industryLabel(stats.topIndustry)}</p>
                    </div>
                  )}
                  {stats.topTones.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground">Najczęstsze tony</p>
                      <p className="font-medium text-foreground">{stats.topTones.join(", ")}</p>
                    </div>
                  )}
                  {stats.avgControversy !== null && (
                    <div>
                      <p className="text-xs text-muted-foreground">Śr. kontrowersja</p>
                      <p className="font-medium text-foreground">{stats.avgControversy}/5</p>
                    </div>
                  )}
                  {stats.positiveRate !== null && (
                    <div>
                      <p className="text-xs text-muted-foreground">Pozytywne oceny</p>
                      <p className="font-medium text-foreground">{stats.positiveRate}%</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground">Unikalne tematy</p>
                    <p className="font-medium text-foreground">{stats.uniqueTopics}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Zapisane scenariusze</p>
                    <p className="font-medium text-foreground">{stats.totalScenarios}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Branża */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-foreground mb-3">Branża</h3>
              <select
                value={profile.industry}
                onChange={(e) => handleIndustryChange(e.target.value)}
                className="flex h-9 w-full rounded-md border border-border bg-card px-3 py-1 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Nie wybrano</option>
                {INDUSTRY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Preferowane tony */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-foreground mb-3">Preferowane tony</h3>
              <div className="flex flex-wrap gap-2">
                {TONE_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => toggleTone(o.value)}
                    className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                      profile.preferredTones.includes(o.value)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Preferowane formaty */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-foreground mb-3">Preferowane formaty</h3>
              <div className="flex flex-wrap gap-2">
                {FORMAT_OPTIONS.filter((o) => o.value !== "random").map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => toggleFormat(o.value)}
                    className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                      profile.preferredFormats.includes(o.value)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Historia tematów */}
            {profile.topicHistory.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-foreground mb-3">Ostatnie tematy</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.topicHistory.slice(0, 10).map((topic, i) => (
                    <Badge key={i} variant="secondary">{topic}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Tematy z feedbackiem */}
            {(profile.feedback.positiveTopics.length > 0 || profile.feedback.negativeTopics.length > 0) && (
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-foreground mb-3">Feedback</h3>
                {profile.feedback.positiveTopics.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs text-muted-foreground mb-1">Pozytywne:</p>
                    <div className="flex flex-wrap gap-1">
                      {profile.feedback.positiveTopics.map((t, i) => (
                        <Badge key={i} variant="outline" className="text-green-500 border-green-500/30">{t}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {profile.feedback.negativeTopics.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Negatywne:</p>
                    <div className="flex flex-wrap gap-1">
                      {profile.feedback.negativeTopics.map((t, i) => (
                        <Badge key={i} variant="outline" className="text-red-500 border-red-500/30">{t}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Reset */}
            <Button variant="outline" onClick={handleReset} className="text-destructive hover:text-destructive">
              <RotateCcw className="mr-2 h-4 w-4" />
              Resetuj profil
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}
