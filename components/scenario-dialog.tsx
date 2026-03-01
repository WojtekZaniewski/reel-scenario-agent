"use client"

import { useState } from "react"
import { Copy, Check, Download, Trash2, ChevronDown } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import type { SavedScenario } from "@/types/saved-scenario"

interface ScenarioDialogProps {
  scenario: SavedScenario | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onDelete: (id: string) => void
}

export function ScenarioDialog({ scenario, open, onOpenChange, onDelete }: ScenarioDialogProps) {
  const [copied, setCopied] = useState(false)
  const [analysisOpen, setAnalysisOpen] = useState(false)

  if (!scenario) return null

  const s = scenario.scenario
  const contentType = s.contentType || "reel"

  function getExportText(): string {
    if (contentType === "carousel") {
      let text = `KARUZELA INSTAGRAM\n================================\n\nTEMAT: ${s.topic || ""}\nFORMAT: ${s.format || ""}\n`
      if (s.slides) {
        text += `\nSLAJDY:\n`
        s.slides.forEach((sl) => {
          text += `\n[Slajd ${sl.slideNumber}]\nNagłówek: ${sl.headline}\nTreść: ${sl.content}\nVisual: ${sl.visualDescription}\n`
        })
      }
      text += `\nCAPTION:\n${s.captionText || ""}\n`
      text += `\nHASHTAGI: ${(s.hashtags || []).map((h) => "#" + h).join(" ")}\n`
      text += `\nCTA: ${s.cta}\n`
      return text
    }
    if (contentType === "post") {
      let text = `POST INSTAGRAM\n================================\n\nTEMAT: ${s.topic || ""}\n`
      text += `\nCAPTION:\n${s.captionText || ""}\n`
      text += `\nOPIS ZDJĘCIA: ${s.photoDescription || ""}\n`
      text += `\nHASHTAGI: ${(s.hashtags || []).map((h) => "#" + h).join(" ")}\n`
      text += `\nCTA: ${s.cta}\n`
      return text
    }
    let text = `SCENARIUSZ VIRALOWEGO REELA
================================

TEMAT: ${s.topic || ""}
FORMAT: ${s.format || ""}
TON: ${s.tone || ""}
CZAS: ${s.duration || ""}

HOOK (pierwsze 3 sekundy):
${s.hook}
${s.hookVisual ? `Visual: ${s.hookVisual}` : ""}

TREŚĆ GŁÓWNA:
${s.mainContent.map((p, i) => `${i + 1}. ${p}`).join("\n")}

CTA (wezwanie do działania):
${s.cta}
${s.ctaPunchline ? `Punchline: ${s.ctaPunchline}` : ""}

NOTATKI PRODUKCYJNE:
• Muzyka: ${s.musicMood}
${s.subtitleStyle ? `• Napisy: ${s.subtitleStyle}` : ""}
${s.cameraWork ? `• Kadry: ${s.cameraWork}` : ""}
${s.estimatedRecordingTime ? `• Czas nagrania: ${s.estimatedRecordingTime}` : ""}

WSKAZÓWKI FILMOWANIA:
${s.filmingTips.map((t) => `• ${t}`).join("\n")}

SZACOWANY CZAS: ${s.estimatedDuration}

PROGNOZA:
• Potencjał: ${s.viralPotential || ""}
${s.viralReason ? `• Dlaczego: ${s.viralReason}` : ""}
${s.bestPublishTime ? `• Najlepszy czas: ${s.bestPublishTime}` : ""}
${s.needsFollowUp && s.followUpTopic ? `• Follow-up: ${s.followUpTopic}` : ""}

WZORCE VIRALOWOŚCI:
${s.patterns.map((p) => `• ${p}`).join("\n")}
`
    return text
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(getExportText())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleDownload() {
    const prefix = contentType === "carousel" ? "karuzela" : contentType === "post" ? "post" : "scenariusz"
    const blob = new Blob([getExportText()], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${prefix}-${scenario!.title.replace(/\s+/g, "-").toLowerCase()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleDelete() {
    onDelete(scenario!.id)
    onOpenChange(false)
  }

  const viralColor =
    s.viralPotential === "viralowy"
      ? "text-green-500"
      : s.viralPotential === "wysoki"
        ? "text-emerald-500"
        : s.viralPotential === "średni"
          ? "text-yellow-500"
          : "text-muted-foreground"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{scenario.title}</DialogTitle>
          <div className="flex flex-wrap gap-2 pt-1">
            <Badge variant="default" className="text-xs">
              {contentType === "carousel" ? "Karuzela" : contentType === "post" ? "Post" : "Reel"}
            </Badge>
            {s.format && <Badge variant="outline">{s.format}</Badge>}
            <Badge variant="secondary">{scenario.brief.tone}</Badge>
            {contentType === "reel" && s.estimatedDuration && (
              <Badge variant="secondary">{s.estimatedDuration}</Badge>
            )}
            {contentType === "reel" && (
              <Badge variant="secondary">{scenario.reelsUsed} Reelsów</Badge>
            )}
            {contentType === "carousel" && s.numberOfSlides && (
              <Badge variant="secondary">{s.numberOfSlides} slajdów</Badge>
            )}
            {scenario.feedback && (
              <Badge variant={scenario.feedback === "positive" ? "default" : "destructive"}>
                {scenario.feedback === "positive" ? "+" : "-"}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-4 pt-2">

          {/* === REEL SECTIONS === */}
          {contentType === "reel" && (
            <>
              {/* Analiza Reelsów */}
              {s.reelAnalyses?.length > 0 && (
                <Collapsible open={analysisOpen} onOpenChange={setAnalysisOpen}>
                  <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors">
                    <ChevronDown
                      className={`h-3 w-3 transition-transform ${analysisOpen ? "rotate-180" : ""}`}
                    />
                    Analiza Reelsów ({s.reelAnalyses.length})
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="mt-2 flex flex-col gap-2">
                      {s.reelAnalyses.map((a, i) => (
                        <div key={i} className="rounded-lg border border-border p-2 text-xs">
                          <div className="flex flex-wrap gap-1 mb-1">
                            <Badge variant="outline" className="text-xs">{a.hookType}</Badge>
                            <Badge variant="secondary" className="text-xs">{a.dominantEmotion}</Badge>
                          </div>
                          <p className="text-muted-foreground">{a.whyItWorks}</p>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}

              {/* Hook */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Hook (pierwsze 3 sek.)
                </span>
                <p className="text-sm font-medium leading-relaxed">{s.hook}</p>
                {s.hookVisual && (
                  <p className="text-xs text-muted-foreground">Visual: {s.hookVisual}</p>
                )}
              </div>

              {/* Treść główna */}
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

              {/* CTA */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">CTA</span>
                <p className="text-sm leading-relaxed">{s.cta}</p>
                {s.ctaPunchline && <p className="text-xs font-medium text-primary">{s.ctaPunchline}</p>}
              </div>

              {/* Notatki produkcyjne */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Notatki produkcyjne
                </span>
                <div className="grid gap-1 text-sm">
                  <p><span className="text-muted-foreground">Muzyka:</span> {s.musicMood}</p>
                  {s.subtitleStyle && <p><span className="text-muted-foreground">Napisy:</span> {s.subtitleStyle}</p>}
                  {s.cameraWork && <p><span className="text-muted-foreground">Kadry:</span> {s.cameraWork}</p>}
                  {s.estimatedRecordingTime && <p><span className="text-muted-foreground">Czas nagrania:</span> {s.estimatedRecordingTime}</p>}
                </div>
              </div>

              {/* Wskazówki filmowania */}
              {s.filmingTips.length > 0 && (
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
              )}
            </>
          )}

          {/* === CAROUSEL SECTIONS === */}
          {contentType === "carousel" && s.slides && (
            <>
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Slajdy ({s.numberOfSlides || s.slides.length})
                </span>
                {s.slides.map((slide) => (
                  <div key={slide.slideNumber} className="rounded-lg border border-border p-2 text-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs shrink-0">{slide.slideNumber}</Badge>
                      <span className="text-sm font-medium">{slide.headline}</span>
                    </div>
                    <p className="text-sm">{slide.content}</p>
                    <p className="text-muted-foreground mt-1 italic">{slide.visualDescription}</p>
                  </div>
                ))}
              </div>

              {(s.designStyle || s.colorScheme || s.typography) && (
                <div className="flex flex-col gap-1 text-sm">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Styl wizualny</span>
                  {s.designStyle && <p><span className="text-muted-foreground">Styl:</span> {s.designStyle}</p>}
                  {s.colorScheme && <p><span className="text-muted-foreground">Kolory:</span> {s.colorScheme}</p>}
                  {s.typography && <p><span className="text-muted-foreground">Typografia:</span> {s.typography}</p>}
                </div>
              )}

              {s.captionText && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Caption</span>
                  <p className="text-sm leading-relaxed whitespace-pre-line">{s.captionText}</p>
                </div>
              )}

              {s.cta && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">CTA</span>
                  <p className="text-sm leading-relaxed">{s.cta}</p>
                  {s.ctaPunchline && <p className="text-xs font-medium text-primary">{s.ctaPunchline}</p>}
                </div>
              )}

              {s.hashtags && s.hashtags.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Hashtagi</span>
                  <div className="flex flex-wrap gap-1.5">
                    {s.hashtags.map((tag, i) => (
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
              {s.captionText && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Caption</span>
                  <p className="text-sm leading-relaxed whitespace-pre-line">{s.captionText}</p>
                </div>
              )}

              {s.photoDescription && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Opis zdjęcia</span>
                  <p className="text-sm leading-relaxed">{s.photoDescription}</p>
                </div>
              )}

              {s.editingStyle && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Styl edycji</span>
                  <p className="text-sm">{s.editingStyle}</p>
                </div>
              )}

              {s.photoTips && s.photoTips.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Wskazówki</span>
                  <ul className="list-disc list-inside space-y-1 text-sm leading-relaxed">
                    {s.photoTips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {s.cta && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">CTA</span>
                  <p className="text-sm leading-relaxed">{s.cta}</p>
                  {s.ctaPunchline && <p className="text-xs font-medium text-primary">{s.ctaPunchline}</p>}
                </div>
              )}

              {s.hashtags && s.hashtags.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Hashtagi</span>
                  <div className="flex flex-wrap gap-1.5">
                    {s.hashtags.map((tag, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">#{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* === SHARED: Prognoza === */}
          <div className="flex flex-col gap-1.5 rounded-lg bg-muted/50 p-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Prognoza
            </span>
            <span className={`text-sm font-bold ${viralColor}`}>
              {s.viralPotential || "—"}
            </span>
            {s.viralReason && (
              <p className="text-xs text-muted-foreground">{s.viralReason}</p>
            )}
            {s.bestPublishTime && (
              <p className="text-xs text-muted-foreground">Publikuj: {s.bestPublishTime}</p>
            )}
            {s.needsFollowUp && s.followUpTopic && (
              <p className="text-xs text-primary">Follow-up: {s.followUpTopic}</p>
            )}
          </div>

          {/* === SHARED: Wzorce === */}
          {s.patterns?.length > 0 && (
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

        <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
          <Button variant="outline" size="sm" onClick={handleCopy} className="flex-1 sm:flex-initial">
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
          <Button variant="outline" size="sm" onClick={handleDownload} className="flex-1 sm:flex-initial">
            <Download className="mr-1.5 h-4 w-4" />
            TXT
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            className="w-full sm:w-auto sm:ml-auto text-destructive hover:text-destructive"
          >
            <Trash2 className="mr-1.5 h-4 w-4" />
            Usuń
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
