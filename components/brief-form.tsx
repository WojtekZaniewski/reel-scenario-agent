"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Loader2, Sparkles, Shuffle, Heart, Film, LayoutGrid, Image } from "lucide-react"
import { toast } from "sonner"
import {
  INDUSTRY_OPTIONS,
  TONE_OPTIONS,
  FORMAT_OPTIONS,
  CAROUSEL_FORMAT_OPTIONS,
  POST_FORMAT_OPTIONS,
  DURATION_OPTIONS,
  LANGUAGE_OPTIONS,
  CONTROVERSY_LABELS,
  CONTENT_TYPE_OPTIONS,
} from "@/lib/constants"
import { getProfile, suggestFromLikedScenarios } from "@/lib/profile-storage"
import type { Brief, ContentType } from "@/types/brief"

interface BriefFormProps {
  brief: Brief
  onChange: (brief: Brief) => void
  onSubmit: () => void
  isLoading: boolean
}

const CONTENT_TYPE_ICONS: Record<string, React.ElementType> = {
  reel: Film,
  carousel: LayoutGrid,
  post: Image,
}

export function BriefForm({ brief, onChange, onSubmit, isLoading }: BriefFormProps) {
  useEffect(() => {
    const profile = getProfile()
    if (!profile) return
    const updates: Partial<Brief> = {}
    if (profile.industry && !brief.industry) updates.industry = profile.industry
    if (profile.preferredTones.length > 0 && brief.tone === "edukacyjny") {
      updates.tone = profile.preferredTones.slice(0, 2).join(",")
    }
    if (profile.preferredFormats.length > 0 && brief.reelFormat === "hook-transformation") {
      updates.reelFormat = profile.preferredFormats[0]
    }
    if (Object.keys(updates).length > 0) {
      onChange({ ...brief, ...updates })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit()
  }

  function toggleTone(tone: string) {
    const current = brief.tone.split(",").filter(Boolean)
    if (current.includes(tone)) {
      onChange({ ...brief, tone: current.filter((t) => t !== tone).join(",") })
    } else if (current.length < 2) {
      onChange({ ...brief, tone: [...current, tone].join(",") })
    }
  }

  function suggestFromLiked() {
    const suggestion = suggestFromLikedScenarios()
    if (!suggestion) {
      toast.info("Brak polubionych scenariuszy — oceń wygenerowane scenariusze, aby dostać sugestie")
      return
    }
    onChange({ ...brief, ...suggestion })
    toast.success("Ustawienia wypełnione na podstawie polubionych scenariuszy")
  }

  function randomize() {
    const randomFrom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]
    const tones = TONE_OPTIONS.sort(() => Math.random() - 0.5).slice(0, 2)
    const ct = brief.contentType || "reel"
    onChange({
      ...brief,
      industry: randomFrom(INDUSTRY_OPTIONS.filter((o) => o.value !== "other")).value,
      tone: tones.map((t) => t.value).join(","),
      reelFormat: ct === "reel" ? "random" : brief.reelFormat,
      carouselFormat: ct === "carousel" ? "random" : brief.carouselFormat,
      postFormat: ct === "post" ? "random" : brief.postFormat,
      duration: ct === "reel" ? randomFrom(DURATION_OPTIONS).value : brief.duration,
      numberOfSlides: ct === "carousel" ? String(Math.floor(Math.random() * 10) + 1) : brief.numberOfSlides,
      controversyLevel: Math.floor(Math.random() * 5) + 1,
    })
  }

  function handleContentTypeChange(value: ContentType) {
    onChange({
      ...brief,
      contentType: value,
      carouselFormat: value === "carousel" ? (brief.carouselFormat || "educational") : brief.carouselFormat,
      postFormat: value === "post" ? (brief.postFormat || "educational") : brief.postFormat,
      numberOfSlides: value === "carousel" ? (brief.numberOfSlides || "7") : brief.numberOfSlides,
    })
  }

  const selectedTones = brief.tone.split(",").filter(Boolean)
  const contentType = brief.contentType || "reel"

  const formatOptions = contentType === "reel"
    ? FORMAT_OPTIONS
    : contentType === "carousel"
      ? CAROUSEL_FORMAT_OPTIONS
      : POST_FORMAT_OPTIONS

  const currentFormat = contentType === "reel"
    ? brief.reelFormat
    : contentType === "carousel"
      ? (brief.carouselFormat || "educational")
      : (brief.postFormat || "educational")

  function handleFormatChange(value: string) {
    if (contentType === "reel") onChange({ ...brief, reelFormat: value })
    else if (contentType === "carousel") onChange({ ...brief, carouselFormat: value })
    else onChange({ ...brief, postFormat: value })
  }

  const submitLabel = contentType === "reel"
    ? "Generuj scenariusz"
    : contentType === "carousel"
      ? "Generuj karuzelę"
      : "Generuj post"

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Content Type Selector */}
      <div className="flex flex-col gap-2">
        <Label className="text-sm font-medium text-foreground">Typ treści</Label>
        <div className="grid grid-cols-3 gap-2">
          {CONTENT_TYPE_OPTIONS.map((option) => {
            const Icon = CONTENT_TYPE_ICONS[option.value]
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleContentTypeChange(option.value as ContentType)}
                className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 text-sm font-medium transition-colors ${
                  contentType === option.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <Icon className="h-5 w-5" />
                {option.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="treatment" className="text-sm font-medium text-foreground">
          {contentType === "post" ? "Temat / Usługa *" : "Zabieg / Usługa *"}
        </Label>
        <Input
          id="treatment"
          placeholder="np. mikrodermabrazja, manicure hybrydowy, botox"
          value={brief.treatment}
          onChange={(e) => onChange({ ...brief, treatment: e.target.value })}
          required
          className="border-border bg-card text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="industry" className="text-sm font-medium text-foreground">
          Branża
        </Label>
        <select
          id="industry"
          value={brief.industry}
          onChange={(e) => onChange({ ...brief, industry: e.target.value })}
          className="flex h-9 w-full rounded-md border border-border bg-card px-3 py-1 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          {INDUSTRY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="targetAudience" className="text-sm font-medium text-foreground">
          Grupa docelowa
        </Label>
        <Input
          id="targetAudience"
          placeholder="np. kobiety 25-40 lat, dbające o skórę"
          value={brief.targetAudience}
          onChange={(e) => onChange({ ...brief, targetAudience: e.target.value })}
          className="border-border bg-card text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-sm font-medium text-foreground">
          Ton komunikacji (max 2)
        </Label>
        <div className="flex flex-wrap gap-2">
          {TONE_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => toggleTone(o.value)}
              className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                selectedTones.includes(o.value)
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="contentFormat" className="text-sm font-medium text-foreground">
            {contentType === "reel" ? "Format Reela" :
             contentType === "carousel" ? "Format karuzeli" : "Format posta"}
          </Label>
          <select
            id="contentFormat"
            value={currentFormat}
            onChange={(e) => handleFormatChange(e.target.value)}
            className="flex h-9 w-full rounded-md border border-border bg-card px-3 py-1 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {formatOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="language" className="text-sm font-medium text-foreground">
            Język
          </Label>
          <select
            id="language"
            value={brief.language}
            onChange={(e) => onChange({ ...brief, language: e.target.value })}
            className="flex h-9 w-full rounded-md border border-border bg-card px-3 py-1 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {LANGUAGE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Duration — only for reels */}
      {contentType === "reel" && (
        <div className="flex flex-col gap-2">
          <Label className="text-sm font-medium text-foreground">Długość</Label>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {DURATION_OPTIONS.map((o) => (
              <label key={o.value} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="duration"
                  value={o.value}
                  checked={brief.duration === o.value}
                  onChange={(e) => onChange({ ...brief, duration: e.target.value })}
                  className="accent-primary"
                />
                <span className="text-sm text-foreground">{o.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Number of slides — only for carousels */}
      {contentType === "carousel" && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="numberOfSlides" className="text-sm font-medium text-foreground">
            Liczba slajdów
          </Label>
          <Input
            id="numberOfSlides"
            type="number"
            min={1}
            max={10}
            value={brief.numberOfSlides ?? "5"}
            onChange={(e) => onChange({ ...brief, numberOfSlides: e.target.value })}
            onBlur={() => {
              const raw = brief.numberOfSlides
              const n = Number(raw)
              const clamped = !raw || Number.isNaN(n) || n < 1 ? 1 : n > 10 ? 10 : Math.floor(n)
              onChange({ ...brief, numberOfSlides: String(clamped) })
            }}
            className="border-border bg-card text-foreground w-24"
          />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label className="text-sm font-medium text-foreground">
          Poziom kontrowersji: {CONTROVERSY_LABELS[brief.controversyLevel]}
        </Label>
        <Slider
          value={[brief.controversyLevel]}
          onValueChange={([v]) => onChange({ ...brief, controversyLevel: v })}
          min={1}
          max={5}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Bezpieczny</span>
          <span>Kontrowersyjny</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="notes" className="text-sm font-medium text-foreground">
          Dodatkowe notatki
        </Label>
        <Textarea
          id="notes"
          placeholder="np. chcę pokazać efekt before/after, salon w Krakowie"
          value={brief.notes || ""}
          onChange={(e) => onChange({ ...brief, notes: e.target.value })}
          rows={3}
          className="border-border bg-card text-foreground placeholder:text-muted-foreground resize-none"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={suggestFromLiked} className="flex-1 sm:flex-initial">
            <Heart className="mr-2 h-4 w-4" />
            Z polubionych
          </Button>
          <Button type="button" variant="outline" onClick={randomize} className="flex-1 sm:flex-initial">
            <Shuffle className="mr-2 h-4 w-4" />
            Losuj
          </Button>
        </div>
        <Button
          type="submit"
          disabled={isLoading || !brief.treatment.trim()}
          className="w-full sm:flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Agent pracuje...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              {submitLabel}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
