"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lightbulb, TriangleAlert, Info, CircleCheckBig } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { Insight } from "@/lib/pca-insights"
import { cn } from "@/lib/utils"

const TONE_ICON: Record<Insight["tone"], LucideIcon> = {
  info: Info,
  warn: TriangleAlert,
  danger: TriangleAlert,
  ok: CircleCheckBig,
}

const TONE_CLASS: Record<Insight["tone"], string> = {
  info: "bg-status-progress text-status-progress-foreground",
  warn: "bg-status-warn text-status-warn-foreground",
  danger: "bg-status-late text-status-late-foreground",
  ok: "bg-status-ok text-status-ok-foreground",
}

export function InsightsPanel({ insights }: { insights: Insight[] }) {
  if (insights.length === 0) return null
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Lightbulb className="size-4" aria-hidden />
          Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {insights.map((insight) => {
          const Icon = TONE_ICON[insight.tone]
          return (
            <div key={insight.id} className="flex items-start gap-3">
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-lg",
                  TONE_CLASS[insight.tone],
                )}
              >
                <Icon className="size-4" aria-hidden />
              </span>
              <p className="text-sm text-pretty text-foreground">{insight.text}</p>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
