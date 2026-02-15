"use client"

import Link from "next/link"
import { ArrowLeft, User } from "lucide-react"
import { AgentPipeline } from "@/components/agent-pipeline"

export default function GeneratePage() {
  return (
    <main className="flex min-h-screen items-start justify-center px-4 py-10 sm:py-16">
      <div className="w-full max-w-xl flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/profile"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <User className="h-4 w-4" />
              Profil
            </Link>
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Nowy scenariusz
            </h1>
            <p className="text-sm text-muted-foreground">
              Wypełnij brief, a agent AI automatycznie znajdzie inspiracje i wygeneruje scenariusz.
            </p>
          </div>
        </div>

        <AgentPipeline />
      </div>
    </main>
  )
}
