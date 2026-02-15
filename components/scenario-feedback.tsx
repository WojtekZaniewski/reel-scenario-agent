"use client"

import { useState } from "react"
import { ThumbsUp, ThumbsDown } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ScenarioFeedbackProps {
  currentFeedback?: "positive" | "negative"
  onFeedback: (positive: boolean) => void
}

export function ScenarioFeedback({ currentFeedback, onFeedback }: ScenarioFeedbackProps) {
  const [feedback, setFeedback] = useState<"positive" | "negative" | undefined>(currentFeedback)

  function handleFeedback(positive: boolean) {
    const value = positive ? "positive" : "negative"
    if (feedback === value) return
    setFeedback(value)
    onFeedback(positive)
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground">Oceń scenariusz:</span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => handleFeedback(true)}
        className={feedback === "positive" ? "text-green-500 hover:text-green-500" : "text-muted-foreground"}
      >
        <ThumbsUp className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => handleFeedback(false)}
        className={feedback === "negative" ? "text-red-500 hover:text-red-500" : "text-muted-foreground"}
      >
        <ThumbsDown className="h-4 w-4" />
      </Button>
      {feedback && (
        <span className="text-xs text-muted-foreground">
          {feedback === "positive" ? "Dzięki! Zapamiętam." : "Następnym razem lepiej!"}
        </span>
      )}
    </div>
  )
}
