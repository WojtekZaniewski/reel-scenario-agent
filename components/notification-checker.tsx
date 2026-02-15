"use client"

import { useEffect } from "react"
import { getGrowthPlan, shouldPostToday, isTodayCompleted } from "@/lib/planner-storage"
import { showNotification } from "@/lib/notifications"

export function NotificationChecker() {
  useEffect(() => {
    const interval = setInterval(() => {
      const plan = getGrowthPlan()
      if (!plan || plan.status !== "active" || !plan.notificationsEnabled) return
      if (!shouldPostToday(plan) || isTodayCompleted()) return

      const now = new Date()
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`

      if (currentTime === plan.notificationTime) {
        showNotification(
          "Czas na rolkę!",
          `Twój plan: ${plan.goal} — nie zapomnij wrzucić dziś Reela!`
        )
      }
    }, 60_000)

    return () => clearInterval(interval)
  }, [])

  return null
}
