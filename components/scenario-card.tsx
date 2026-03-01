"use client"

import { Trash2, Clock, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { SavedScenario } from "@/types/saved-scenario"

interface ScenarioCardProps {
  scenario: SavedScenario
  onClick: () => void
  onDelete: () => void
}

export function ScenarioCard({ scenario, onClick, onDelete }: ScenarioCardProps) {
  const date = new Date(scenario.createdAt)
  const formattedDate = date.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })

  const contentType = scenario.scenario.contentType || "reel"

  // Show appropriate preview text based on content type
  const previewText =
    contentType === "carousel" && scenario.scenario.slides?.[0]
      ? scenario.scenario.slides[0].headline
      : contentType === "post" && scenario.scenario.captionText
        ? scenario.scenario.captionText.split("\n")[0]
        : scenario.scenario.hook

  return (
    <Card
      className="cursor-pointer transition-colors hover:bg-accent/50"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-tight">
            {scenario.title}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive shrink-0"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {previewText}
        </p>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formattedDate}
          </div>
          <Badge variant="default" className="text-xs">
            {contentType === "carousel" ? "Karuzela" : contentType === "post" ? "Post" : "Reel"}
          </Badge>
          {contentType === "reel" && scenario.scenario.estimatedDuration && (
            <Badge variant="secondary" className="text-xs">
              <Clock className="mr-1 h-3 w-3" />
              {scenario.scenario.estimatedDuration}
            </Badge>
          )}
          {contentType === "carousel" && scenario.scenario.numberOfSlides && (
            <Badge variant="secondary" className="text-xs">
              {scenario.scenario.numberOfSlides} slajdów
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            {scenario.brief.tone}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
