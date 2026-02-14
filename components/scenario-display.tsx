"use client"

import { useState } from "react"
import { Copy, Check, Download, Save, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ScenarioAIResponse } from "@/lib/ai/types"

interface ScenarioDisplayProps {
  scenario: ScenarioAIResponse | null
  rawText: string
  isStreaming: boolean
  onSave?: () => void
  onRegenerate: () => void
}

export function ScenarioDisplay({
  scenario,
  rawText,
  isStreaming,
  onSave,
  onRegenerate,
}: ScenarioDisplayProps) {
  const [copied, setCopied] = useState(false)

  function getExportText(): string {
    if (!scenario) return rawText

    return `SCENARIUSZ VIRALOWEGO REELA
================================

HOOK (pierwsze 3 sekundy):
${scenario.hook}

TREŚĆ GŁÓWNA:
${scenario.mainContent.map((p, i) => `${i + 1}. ${p}`).join("\n")}

CTA (wezwanie do działania):
${scenario.cta}

MOOD MUZYCZNY:
${scenario.musicMood}

WSKAZÓWKI FILMOWANIA:
${scenario.filmingTips.map((t) => `• ${t}`).join("\n")}

SZACOWANY CZAS: ${scenario.estimatedDuration}

ZAOBSERWOWANE WZORCE VIRALOWOŚCI:
${scenario.patterns.map((p) => `• ${p}`).join("\n")}
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
    a.download = `scenariusz-reel-${new Date().toISOString().slice(0, 10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (isStreaming && !scenario) {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {rawText || "Generuję scenariusz..."}
          </p>
          <span className="mt-2 inline-block h-4 w-1 animate-pulse bg-primary" />
        </div>
      </div>
    )
  }

  if (!scenario) return null

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Wygenerowany scenariusz</h3>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="text-muted-foreground hover:text-foreground"
          >
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
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="text-muted-foreground hover:text-foreground"
          >
            <Download className="mr-1.5 h-4 w-4" />
            TXT
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Hook (pierwsze 3 sek.)
          </span>
          <p className="text-sm font-medium leading-relaxed text-foreground">
            {scenario.hook}
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Treść główna
          </span>
          <ol className="list-decimal list-inside space-y-1 text-sm leading-relaxed text-foreground">
            {scenario.mainContent.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ol>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            CTA
          </span>
          <p className="text-sm leading-relaxed text-foreground">{scenario.cta}</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Mood muzyczny
          </span>
          <p className="text-sm leading-relaxed text-foreground">{scenario.musicMood}</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Wskazówki filmowania
          </span>
          <ul className="list-disc list-inside space-y-1 text-sm leading-relaxed text-foreground">
            {scenario.filmingTips.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Szacowany czas
          </span>
          <p className="text-sm leading-relaxed text-foreground">
            {scenario.estimatedDuration}
          </p>
        </div>

        {scenario.patterns.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Zaobserwowane wzorce viralowości
            </span>
            <ul className="list-disc list-inside space-y-1 text-sm leading-relaxed text-foreground">
              {scenario.patterns.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-2">
        {onSave && (
          <Button type="button" onClick={onSave} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Save className="mr-2 h-4 w-4" />
            Zapisz scenariusz
          </Button>
        )}
        <Button type="button" variant="outline" onClick={onRegenerate}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Generuj ponownie
        </Button>
      </div>
    </div>
  )
}
