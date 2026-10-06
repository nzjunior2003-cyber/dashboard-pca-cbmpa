"use client"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
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

export function InsightsSheet({
  insights,
  open,
  onOpenChange,
}: {
  insights: Insight[]
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-md">
        <SheetHeader className="gap-2 border-b border-border">
          <SheetTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="size-4" aria-hidden />
            Insights
          </SheetTitle>
          <SheetDescription>
            Destaques calculados automaticamente a partir dos itens atualmente filtrados.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 p-4">
          {insights.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum insight disponível para o recorte atual.
            </p>
          ) : (
            insights.map((insight) => {
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
            })
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
