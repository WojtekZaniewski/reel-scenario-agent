"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getProfile, saveProfile, resetProfile } from "@/lib/profile-storage"
import { INDUSTRY_OPTIONS, TONE_OPTIONS, FORMAT_OPTIONS } from "@/lib/constants"
import type { UserProfile } from "@/types/user-profile"
import { toast } from "sonner"

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    setProfile(getProfile())
  }, [])

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
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Twój profil
            </h1>
            <p className="text-sm text-muted-foreground">
              Agent uczy się Twoich preferencji z każdym użyciem.
            </p>
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
              <div className="grid grid-cols-3 gap-4 text-center">
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
