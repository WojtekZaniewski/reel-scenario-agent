"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, Sparkles } from "lucide-react"
import { TONE_OPTIONS } from "@/lib/constants"
import type { Brief } from "@/types/brief"

interface BriefFormProps {
  brief: Brief
  onChange: (brief: Brief) => void
  onSubmit: () => void
  isLoading: boolean
}

export function BriefForm({ brief, onChange, onSubmit, isLoading }: BriefFormProps) {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="treatment" className="text-sm font-medium text-foreground">
          Zabieg / Usługa *
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
        <Label htmlFor="tone" className="text-sm font-medium text-foreground">
          Ton komunikacji
        </Label>
        <select
          id="tone"
          value={brief.tone}
          onChange={(e) => onChange({ ...brief, tone: e.target.value })}
          className="flex h-9 w-full rounded-md border border-border bg-card px-3 py-1 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          {TONE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
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

      <Button
        type="submit"
        disabled={isLoading || !brief.treatment.trim()}
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Agent pracuje...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Generuj scenariusz
          </>
        )}
      </Button>
    </form>
  )
}
