"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Check, Film } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getGrowthPlan, shouldPostToday, isTodayCompleted, markTodayCompleted, getCurrentWeek } from "@/lib/planner-storage"
import { toast } from "sonner"

export function PlannerBanner() {
  const [visible, setVisible] = useState(false)
  const [done, setDone] = useState(false)
  const [info, setInfo] = useState({ goal: "", week: 0, totalWeeks: 0 })

  useEffect(() => {
    const plan = getGrowthPlan()
    if (!plan || plan.status !== "active") return

    const shouldPost = shouldPostToday(plan)
    if (!shouldPost) return

    setVisible(true)
    setDone(isTodayCompleted())
    setInfo({
      goal: plan.goal,
      week: getCurrentWeek(plan),
      totalWeeks: plan.durationWeeks,
    })
  }, [])

  if (!visible) return null

  const handleMarkDone = () => {
    markTodayCompleted()
    setDone(true)
    toast.success("Brawo! Rolka zaliczona na dziś!")
  }

  if (done) {
    return (
      <div className="rounded-xl border-2 border-green-500/30 bg-green-500/5 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500/20">
            <Check className="h-4 w-4 text-green-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-green-400">Rolka wrzucona!</p>
            <p className="text-xs text-muted-foreground">
              {info.goal} — Tydzień {info.week}/{info.totalWeeks}
            </p>
          </div>
        </div>
        <Link href="/planner">
          <Button size="sm" variant="outline" className="w-full sm:w-auto">
            Plan
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20">
          <Film className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium">Czas na nową rolkę!</p>
          <p className="text-xs text-muted-foreground">
            {info.goal} — Tydzień {info.week}/{info.totalWeeks}
          </p>
        </div>
      </div>
      <div className="flex gap-2 w-full sm:w-auto">
        <Button size="sm" onClick={handleMarkDone} className="flex-1 sm:flex-initial">
          Wrzuciłem!
        </Button>
        <Link href="/planner">
          <Button size="sm" variant="outline">
            Plan
          </Button>
        </Link>
      </div>
    </div>
  )
}
