"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Plus, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScenarioCard } from "@/components/scenario-card"
import { ScenarioDialog } from "@/components/scenario-dialog"
import { getScenarios, deleteScenario } from "@/lib/storage"
import type { SavedScenario } from "@/types/saved-scenario"
import { toast } from "sonner"

export default function DashboardPage() {
  const [scenarios, setScenarios] = useState<SavedScenario[]>([])
  const [selectedScenario, setSelectedScenario] = useState<SavedScenario | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    setScenarios(getScenarios())
  }, [])

  const handleDelete = useCallback((id: string) => {
    deleteScenario(id)
    setScenarios(getScenarios())
    toast.success("Scenariusz usunięty")
  }, [])

  const handleCardClick = useCallback((scenario: SavedScenario) => {
    setSelectedScenario(scenario)
    setDialogOpen(true)
  }, [])

  return (
    <main className="flex min-h-screen items-start justify-center px-4 py-10 sm:py-16">
      <div className="w-full max-w-2xl flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Reel Scenario Agent
            </h1>
            <p className="text-sm text-muted-foreground">
              AI Agent do generowania scenariuszy viralowych Reelsów
            </p>
          </div>
          <Link href="/generate">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Nowy scenariusz
            </Button>
          </Link>
        </div>

        {scenarios.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Sparkles className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-medium text-foreground">
                Brak zapisanych scenariuszy
              </h3>
              <p className="text-sm text-muted-foreground">
                Wygeneruj swój pierwszy scenariusz viralowego Reela!
              </p>
            </div>
            <Link href="/generate">
              <Button variant="outline">
                <Sparkles className="mr-2 h-4 w-4" />
                Generuj scenariusz
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {scenarios.map((scenario) => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                onClick={() => handleCardClick(scenario)}
                onDelete={() => handleDelete(scenario.id)}
              />
            ))}
          </div>
        )}

        <ScenarioDialog
          scenario={selectedScenario}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onDelete={handleDelete}
        />
      </div>
    </main>
  )
}
