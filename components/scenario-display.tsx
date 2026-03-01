"use client"

import { useState } from "react"
import { Copy, Check, Download, Save, RefreshCw, ChevronDown, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ScenarioFeedback } from "@/components/scenario-feedback"
import type { ScenarioAIResponse } from "@/lib/ai/types"

interface ScenarioDisplayProps {
  scenario: ScenarioAIResponse | null
  rawText: string
  isStreaming: boolean
  onSave?: () => void
  onRegenerate: () => void
  onFeedback?: (positive: boolean) => void
}

export function ScenarioDisplay({
  scenario,
  rawText,
  isStreaming,
  onSave,
  onRegenerate,
  onFeedback,
}: ScenarioDisplayProps) {
  const [copied, setCopied] = useState(false)
  const [analysisOpen, setAnalysisOpen] = useState(false)

  function getExportText(): string {
    if (!scenario) return rawText
    const ct = scenario.contentType || "reel"

    if (ct === "carousel") {
      let text = `KARUZELA INSTAGRAM\n================================\n\n`
      text += `TEMAT: ${scenario.topic || ""}\nFORMAT: ${scenario.format || ""}\nTON: ${scenario.tone || ""}\n`
      if (scenario.slides) {
        text += `\nSLAJDY:\n`
        scenario.slides.forEach((s) => {
          text += `\n[Slajd ${s.slideNumber}]\nNagłówek: ${s.headline}\nTreść: ${s.content}\nVisual: ${s.visualDescription}\n`
        })
      }
      text += `\nSTYL: ${scenario.designStyle || ""}\nKOLORY: ${scenario.colorScheme || ""}\nTYPOGRAFIA: ${scenario.typography || ""}\n`
      text += `\nCAPTION:\n${scenario.captionText || ""}\n`
      text += `\nHASHTAGI: ${(scenario.hashtags || []).map((h) => "#" + h).join(" ")}\n`
      text += `\nCTA: ${scenario.cta}\n${scenario.ctaPunchline ? `Punchline: ${scenario.ctaPunchline}` : ""}\n`
      text += `\nPROGNOZA:\n• Potencjał: ${scenario.viralPotential || ""}\n`
      if (scenario.viralReason) text += `• Dlaczego: ${scenario.viralReason}\n`
      if (scenario.bestPublishTime) text += `• Publikuj: ${scenario.bestPublishTime}\n`
      if (scenario.patterns?.length > 0) {
        text += `\nWZORCE:\n${scenario.patterns.map((p) => `• ${p}`).join("\n")}\n`
      }
      return text
    }

    if (ct === "post") {
      let text = `POST INSTAGRAM\n================================\n\n`
      text += `TEMAT: ${scenario.topic || ""}\nFORMAT: ${scenario.format || ""}\nTON: ${scenario.tone || ""}\n`
      text += `\nCAPTION:\n${scenario.captionText || ""}\n`
      text += `\nOPIS ZDJĘCIA: ${scenario.photoDescription || ""}\n`
      text += `STYL EDYCJI: ${scenario.editingStyle || ""}\n`
      if (scenario.photoTips?.length) {
        text += `\nWSKAZÓWKI DOT. ZDJĘCIA:\n${scenario.photoTips.map((t) => `• ${t}`).join("\n")}\n`
      }
      text += `\nHASHTAGI: ${(scenario.hashtags || []).map((h) => "#" + h).join(" ")}\n`
      text += `\nCTA: ${scenario.cta}\n${scenario.ctaPunchline ? `Punchline: ${scenario.ctaPunchline}` : ""}\n`
      text += `\nPROGNOZA:\n• Potencjał: ${scenario.viralPotential || ""}\n`
      if (scenario.viralReason) text += `• Dlaczego: ${scenario.viralReason}\n`
      if (scenario.bestPublishTime) text += `• Publikuj: ${scenario.bestPublishTime}\n`
      if (scenario.patterns?.length > 0) {
        text += `\nWZORCE:\n${scenario.patterns.map((p) => `• ${p}`).join("\n")}\n`
      }
      return text
    }

    // Reel export
    let text = `SCENARIUSZ VIRALOWEGO REELA
================================

TEMAT: ${scenario.topic || ""}
FORMAT: ${scenario.format || ""}
TON: ${scenario.tone || ""}
CZAS: ${scenario.duration || ""}

HOOK (pierwsze 3 sekundy):
${scenario.hook}
${scenario.hookVisual ? `Visual: ${scenario.hookVisual}` : ""}
${scenario.hookRules ? `Dlaczego zadziała: ${scenario.hookRules}` : ""}

TREŚĆ GŁÓWNA:
${scenario.mainContent.map((p, i) => `${i + 1}. ${p}`).join("\n")}
${scenario.mainContentRules ? `\nZasady: ${scenario.mainContentRules}` : ""}

CTA (wezwanie do działania):
${scenario.cta}
${scenario.ctaPunchline ? `Punchline: ${scenario.ctaPunchline}` : ""}

NOTATKI PRODUKCYJNE:
• Muzyka: ${scenario.musicMood}
${scenario.subtitleStyle ? `• Napisy: ${scenario.subtitleStyle}` : ""}
${scenario.cameraWork ? `• Kadry: ${scenario.cameraWork}` : ""}
${scenario.estimatedRecordingTime ? `• Czas nagrania: ${scenario.estimatedRecordingTime}` : ""}

WSKAZÓWKI FILMOWANIA:
${scenario.filmingTips.map((t) => `• ${t}`).join("\n")}

SZACOWANY CZAS: ${scenario.estimatedDuration}

PROGNOZA VIRALOWOŚCI:
• Potencjał: ${scenario.viralPotential || ""}
${scenario.viralReason ? `• Dlaczego: ${scenario.viralReason}` : ""}
${scenario.bestPublishTime ? `• Najlepszy czas publikacji: ${scenario.bestPublishTime}` : ""}
${scenario.needsFollowUp && scenario.followUpTopic ? `• Follow-up: ${scenario.followUpTopic}` : ""}

WZORCE VIRALOWOŚCI:
${scenario.patterns.map((p) => `• ${p}`).join("\n")}
`

    if (scenario.reelAnalyses?.length > 0) {
      text += `\nANALIZA REELSÓW:\n`
      scenario.reelAnalyses.forEach((a, i) => {
        text += `\n${i + 1}. Hook: ${a.hookType} | Emocja: ${a.dominantEmotion} | Tempo: ${a.tempoStructure}
   Mechanizm: ${a.attentionMechanism}
   Komentarze: ${a.commentInsights}
   Dlaczego działa: ${a.whyItWorks}\n`
      })
    }

    return text
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(getExportText())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleDownload() {
    const ct = scenario?.contentType || "reel"
    const prefix = ct === "reel" ? "scenariusz-reel" : ct === "carousel" ? "karuzela" : "post"
    const blob = new Blob([getExportText()], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${prefix}-${new Date().toISOString().slice(0, 10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handlePrint() {
    window.print()
  }

  if (isStreaming && !scenario) {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {rawText || "Generuję..."}
          </p>
          <span className="mt-2 inline-block h-4 w-1 animate-pulse bg-primary" />
        </div>
      </div>
    )
  }

  if (!scenario) return null

  const contentType = scenario.contentType || "reel"

  const viralColor =
    scenario.viralPotential === "viralowy"
      ? "text-green-500"
      : scenario.viralPotential === "wysoki"
        ? "text-emerald-500"
        : scenario.viralPotential === "średni"
          ? "text-yellow-500"
          : "text-muted-foreground"

  const title = contentType === "carousel"
    ? "Wygenerowana karuzela"
    : contentType === "post"
      ? "Wygenerowany post"
      : "Wygenerowany scenariusz"

  return (
    <div className="flex flex-col gap-4 print:gap-2" id="scenario-print">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 print:hidden">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <div className="flex flex-wrap gap-1.5 sm:gap-1">
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
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrint}
            className="text-muted-foreground hover:text-foreground"
          >
            <Printer className="mr-1.5 h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="default" className="text-xs">
          {contentType === "carousel" ? "Karuzela" : contentType === "post" ? "Post" : "Reel"}
        </Badge>
        {scenario.topic && <Badge variant="outline">{scenario.topic}</Badge>}
        {scenario.format && <Badge variant="secondary">{scenario.format}</Badge>}
        {scenario.tone && <Badge variant="secondary">{scenario.tone}</Badge>}
        {contentType === "reel" && scenario.duration && <Badge variant="secondary">{scenario.duration}</Badge>}
        {contentType === "carousel" && scenario.numberOfSlides && (
          <Badge variant="secondary">{scenario.numberOfSlides} slajdów</Badge>
        )}
      </div>

      {/* Reel-specific: Analiza Reelsów */}
      {contentType === "reel" && scenario.reelAnalyses?.length > 0 && (
        <Collapsible open={analysisOpen} onOpenChange={setAnalysisOpen}>
          <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-lg border border-border bg-muted/50 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors">
            <ChevronDown
              className={`h-4 w-4 transition-transform ${analysisOpen ? "rotate-180" : ""}`}
            />
            Analiza Reelsów ({scenario.reelAnalyses.length})
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-2 flex flex-col gap-3">
              {scenario.reelAnalyses.map((analysis, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-border bg-card p-3 text-sm"
                >
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge variant="outline">{analysis.hookType}</Badge>
                    <Badge variant="secondary">{analysis.dominantEmotion}</Badge>
                    <Badge variant="secondary">{analysis.tempoStructure}</Badge>
                  </div>
                  <div className="flex flex-col gap-1 text-muted-foreground">
                    <p><span className="font-medium text-foreground">Mechanizm:</span> {analysis.attentionMechanism}</p>
                    <p><span className="font-medium text-foreground">Komentarze:</span> {analysis.commentInsights}</p>
                    <p><span className="font-medium text-foreground">Dlaczego działa:</span> {analysis.whyItWorks}</p>
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Scenariusz */}
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">

        {/* === REEL SECTIONS === */}
        {contentType === "reel" && (
          <>
            {/* Hook */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Hook (pierwsze 3 sek.)
              </span>
              <p className="text-sm font-medium leading-relaxed text-foreground">
                {scenario.hook}
              </p>
              {scenario.hookVisual && (
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">Visual:</span> {scenario.hookVisual}
                </p>
              )}
              {scenario.hookRules && (
                <p className="text-xs text-muted-foreground italic">
                  {scenario.hookRules}
                </p>
              )}
            </div>

            {/* Treść główna */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Treść główna
              </span>
              <ol className="list-decimal list-inside space-y-1 text-sm leading-relaxed text-foreground">
                {scenario.mainContent.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ol>
              {scenario.mainContentRules && (
                <p className="text-xs text-muted-foreground italic mt-1">
                  {scenario.mainContentRules}
                </p>
              )}
            </div>

            {/* CTA */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                CTA
              </span>
              <p className="text-sm leading-relaxed text-foreground">{scenario.cta}</p>
              {scenario.ctaPunchline && (
                <p className="text-xs font-medium text-primary">
                  {scenario.ctaPunchline}
                </p>
              )}
            </div>

            {/* Notatki produkcyjne */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Notatki produkcyjne
              </span>
              <div className="grid gap-3 sm:gap-2 text-sm text-foreground sm:grid-cols-2">
                <div>
                  <span className="text-xs text-muted-foreground">Muzyka</span>
                  <p>{scenario.musicMood}</p>
                </div>
                {scenario.subtitleStyle && (
                  <div>
                    <span className="text-xs text-muted-foreground">Napisy</span>
                    <p>{scenario.subtitleStyle}</p>
                  </div>
                )}
                {scenario.cameraWork && (
                  <div>
                    <span className="text-xs text-muted-foreground">Kadry</span>
                    <p>{scenario.cameraWork}</p>
                  </div>
                )}
                {scenario.estimatedRecordingTime && (
                  <div>
                    <span className="text-xs text-muted-foreground">Czas nagrania</span>
                    <p>{scenario.estimatedRecordingTime}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Wskazówki filmowania */}
            {scenario.filmingTips.length > 0 && (
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
            )}
          </>
        )}

        {/* === CAROUSEL SECTIONS === */}
        {contentType === "carousel" && scenario.slides && (
          <>
            {/* Slajdy */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Slajdy ({scenario.numberOfSlides || scenario.slides.length})
              </span>
              <div className="flex flex-col gap-2">
                {scenario.slides.map((slide) => (
                  <div key={slide.slideNumber} className="rounded-lg border border-border p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs shrink-0">
                        {slide.slideNumber}
                      </Badge>
                      <span className="text-sm font-medium text-foreground">{slide.headline}</span>
                    </div>
                    <p className="text-sm text-foreground mt-1">{slide.content}</p>
                    <p className="text-xs text-muted-foreground mt-1 italic">{slide.visualDescription}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Styl wizualny */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Styl wizualny
              </span>
              <div className="grid gap-2 text-sm text-foreground sm:grid-cols-2">
                {scenario.designStyle && (
                  <div>
                    <span className="text-xs text-muted-foreground">Styl</span>
                    <p>{scenario.designStyle}</p>
                  </div>
                )}
                {scenario.colorScheme && (
                  <div>
                    <span className="text-xs text-muted-foreground">Kolory</span>
                    <p>{scenario.colorScheme}</p>
                  </div>
                )}
                {scenario.typography && (
                  <div>
                    <span className="text-xs text-muted-foreground">Typografia</span>
                    <p>{scenario.typography}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Caption */}
            {scenario.captionText && (
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Caption
                </span>
                <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">
                  {scenario.captionText}
                </p>
              </div>
            )}

            {/* CTA */}
            {scenario.cta && (
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  CTA
                </span>
                <p className="text-sm leading-relaxed text-foreground">{scenario.cta}</p>
                {scenario.ctaPunchline && (
                  <p className="text-xs font-medium text-primary">{scenario.ctaPunchline}</p>
                )}
              </div>
            )}

            {/* Hashtagi */}
            {scenario.hashtags && scenario.hashtags.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Hashtagi
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {scenario.hashtags.map((tag, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">#{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* === POST SECTIONS === */}
        {contentType === "post" && (
          <>
            {/* Caption */}
            {scenario.captionText && (
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Caption
                </span>
                <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">
                  {scenario.captionText}
                </p>
              </div>
            )}

            {/* Opis zdjęcia */}
            {scenario.photoDescription && (
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Opis zdjęcia
                </span>
                <p className="text-sm leading-relaxed text-foreground">{scenario.photoDescription}</p>
              </div>
            )}

            {/* Styl edycji */}
            {scenario.editingStyle && (
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Styl edycji
                </span>
                <p className="text-sm text-foreground">{scenario.editingStyle}</p>
              </div>
            )}

            {/* Wskazówki dot. zdjęcia */}
            {scenario.photoTips && scenario.photoTips.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Wskazówki dot. zdjęcia
                </span>
                <ul className="list-disc list-inside space-y-1 text-sm leading-relaxed text-foreground">
                  {scenario.photoTips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* CTA */}
            {scenario.cta && (
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  CTA
                </span>
                <p className="text-sm leading-relaxed text-foreground">{scenario.cta}</p>
                {scenario.ctaPunchline && (
                  <p className="text-xs font-medium text-primary">{scenario.ctaPunchline}</p>
                )}
              </div>
            )}

            {/* Hashtagi */}
            {scenario.hashtags && scenario.hashtags.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Hashtagi
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {scenario.hashtags.map((tag, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">#{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* === SHARED: Prognoza viralowości === */}
        <div className="flex flex-col gap-1.5 rounded-lg bg-muted/50 p-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Prognoza viralowości
          </span>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold ${viralColor}`}>
              {scenario.viralPotential || "—"}
            </span>
            {scenario.bestPublishTime && (
              <Badge variant="outline" className="text-xs">
                {scenario.bestPublishTime}
              </Badge>
            )}
          </div>
          {scenario.viralReason && (
            <p className="text-xs text-muted-foreground">{scenario.viralReason}</p>
          )}
          {scenario.needsFollowUp && scenario.followUpTopic && (
            <p className="text-xs text-primary">
              Follow-up: {scenario.followUpTopic}
            </p>
          )}
        </div>

        {/* === SHARED: Wzorce === */}
        {scenario.patterns?.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Wzorce viralowości
            </span>
            <ul className="list-disc list-inside space-y-1 text-sm leading-relaxed text-foreground">
              {scenario.patterns.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Feedback */}
      {onFeedback && (
        <ScenarioFeedback onFeedback={onFeedback} />
      )}

      {/* Akcje */}
      <div className="flex flex-col sm:flex-row gap-2 pt-2 print:hidden">
        {onSave && (
          <Button type="button" onClick={onSave} className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
            <Save className="mr-2 h-4 w-4" />
            Zapisz
          </Button>
        )}
        <Button type="button" variant="outline" onClick={onRegenerate} className="w-full sm:w-auto">
          <RefreshCw className="mr-2 h-4 w-4" />
          Generuj ponownie
        </Button>
      </div>
    </div>
  )
}
