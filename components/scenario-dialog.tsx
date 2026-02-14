"use client"

import { useState } from "react"
import { Copy, Check, Download, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { SavedScenario } from "@/types/saved-scenario"

interface ScenarioDialogProps {
  scenario: SavedScenario | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onDelete: (id: string) => void
}

export function ScenarioDialog({ scenario, open, onOpenChange, onDelete }: ScenarioDialogProps) {
  const [copied, setCopied] = useState(false)

  if (!scenario) return null

  const s = scenario.scenario

  function getExportText(): string {
    return `SCENARIUSZ VIRALOWEGO REELA
================================

HOOK (pierwsze 3 sekundy):
${s.hook}

TREŚĆ GŁÓWNA:
${s.mainContent.map((p, i) => `${i + 1}. ${p}`).join("\n")}

CTA (wezwanie do działania):
${s.cta}

MOOD MUZYCZNY:
${s.musicMood}

WSKAZÓWKI FILMOWANIA:
${s.filmingTips.map((t) => `• ${t}`).join("\n")}

SZACOWANY CZAS: ${s.estimatedDuration}

ZAOBSERWOWANE WZORCE VIRALOWOŚCI:
${s.patterns.map((p) => `• ${p}`).join("\n")}
`
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(getExportText())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleDownload() {
    const blob = new Blob([getExportText()], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `scenariusz-${scenario!.title.replace(/\s+/g, "-").toLowerCase()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleDelete() {
    onDelete(scenario!.id)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{scenario.title}</DialogTitle>
          <div className="flex flex-wrap gap-2 pt-1">
            <Badge variant="outline">{scenario.brief.tone}</Badge>
            {s.estimatedDuration && (
              <Badge variant="secondary">{s.estimatedDuration}</Badge>
            )}
            <Badge variant="secondary">{scenario.reelsUsed} Reelsów</Badge>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Hook (pierwsze 3 sek.)
            </span>
            <p className="text-sm font-medium leading-relaxed">{s.hook}</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Treść główna
            </span>
            <ol className="list-decimal list-inside space-y-1 text-sm leading-relaxed">
              {s.mainContent.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ol>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              CTA
            </span>
            <p className="text-sm leading-relaxed">{s.cta}</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Mood muzyczny
            </span>
            <p className="text-sm leading-relaxed">{s.musicMood}</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Wskazówki filmowania
            </span>
            <ul className="list-disc list-inside space-y-1 text-sm leading-relaxed">
              {s.filmingTips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>

          {s.patterns.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Wzorce viralowości
              </span>
              <ul className="list-disc list-inside space-y-1 text-sm leading-relaxed">
                {s.patterns.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-4 border-t border-border">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? (
              <>
                <Check className="mr-1.5 h-4 w-4" />
                Skopiowano
              </>
            ) : (
              <>
                <Copy className="mr-1.5 h-4 w-4" />
                Kopiuj
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="mr-1.5 h-4 w-4" />
            TXT
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            className="ml-auto text-destructive hover:text-destructive"
          >
            <Trash2 className="mr-1.5 h-4 w-4" />
            Usuń
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
