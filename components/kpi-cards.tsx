"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { formatBRL } from "@/lib/pca-utils"
import type { PcaKpis } from "@/lib/pca-metrics"
import {
  ListChecks,
  FileCheck2,
  FileX2,
  TriangleAlert,
  Wallet,
  CircleDollarSign,
  Landmark,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface KpiDef {
  key: string
  label: string
  value: string
  hint?: string
  icon: LucideIcon
  tone: "neutral" | "info" | "ok" | "muted" | "danger" | "warn"
  clickable?: boolean
}

const TONES: Record<KpiDef["tone"], string> = {
  neutral: "bg-secondary text-secondary-foreground",
  info: "bg-status-progress text-status-progress-foreground",
  ok: "bg-status-ok text-status-ok-foreground",
  muted: "bg-status-archived text-status-archived-foreground",
  danger: "bg-status-late text-status-late-foreground",
  warn: "bg-status-warn text-status-warn-foreground",
}

interface KpiCardsProps {
  kpis: PcaKpis
  loading: boolean
  temPaeFilter: string[]
  onToggleTemPae: (value: "Com PAE" | "Sem PAE") => void
}

export function KpiCards({ kpis, loading, temPaeFilter, onToggleTemPae }: KpiCardsProps) {
  const cards: KpiDef[] = [
    {
      key: "total",
      label: "Itens do PCA",
      value: String(kpis.totalItens),
      hint: formatBRL(kpis.valorTotalEstimado) + " estimado",
      icon: ListChecks,
      tone: "info",
    },
    {
      key: "comPae",
      label: "Com PAE aberto",
      value: String(kpis.itensComPae),
      hint: "clique para filtrar a lista",
      icon: FileCheck2,
      tone: "ok",
      clickable: true,
    },
    {
      key: "semPae",
      label: "Sem PAE",
      value: String(kpis.itensSemPae),
      hint: "clique para filtrar a lista",
      icon: FileX2,
      tone: "muted",
      clickable: true,
    },
    {
      key: "altaSemPae",
      label: "Alta prioridade sem PAE",
      value: String(kpis.itensAltaPrioridadeSemPae),
      hint: "requer atenção",
      icon: TriangleAlert,
      tone: "warn",
    },
    {
      key: "valorTotal",
      label: "Valor total estimado",
      value: formatBRL(kpis.valorTotalEstimado),
      hint: "todos os itens do PCA",
      icon: Wallet,
      tone: "neutral",
    },
    {
      key: "valorRecurso",
      label: "Valor do Recurso",
      value: formatBRL(kpis.valorRecursoProvavel),
      hint: "coluna O — recurso provável",
      icon: CircleDollarSign,
      tone: "info",
    },
    {
      key: "valorSemPae",
      label: "Valor sem PAE",
      value: formatBRL(kpis.valorSemPae),
      hint: "ainda não processado",
      icon: Landmark,
      tone: "danger",
    },
  ]

  return (
    <section aria-label="Indicadores principais">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {cards.map((c) => {
          const filterKey: "Com PAE" | "Sem PAE" | null =
            c.key === "comPae" ? "Com PAE" : c.key === "semPae" ? "Sem PAE" : null
          const isActive = filterKey !== null && temPaeFilter.includes(filterKey)
          const content = (
            <>
              <CardHeader className="flex flex-row items-center justify-between gap-2 px-4 pt-4 pb-0">
                <CardTitle className="text-xs font-medium text-muted-foreground text-pretty">
                  {c.label}
                </CardTitle>
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-lg",
                    TONES[c.tone],
                  )}
                >
                  <c.icon className="size-4" aria-hidden />
                </span>
              </CardHeader>
              <CardContent className="px-4 pt-1 pb-4">
                {loading ? (
                  <Skeleton className="h-7 w-16" />
                ) : (
                  <div className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">
                    {c.value}
                  </div>
                )}
                {c.hint && <p className="mt-0.5 text-xs text-muted-foreground">{c.hint}</p>}
              </CardContent>
            </>
          )

          if (c.clickable && filterKey) {
            return (
              <Card
                key={c.key}
                role="button"
                tabIndex={0}
                aria-pressed={isActive}
                onClick={() => onToggleTemPae(filterKey)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    onToggleTemPae(filterKey)
                  }
                }}
                className={cn(
                  "gap-0 py-0 cursor-pointer transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive && "ring-2 ring-primary",
                )}
              >
                {content}
              </Card>
            )
          }

          return (
            <Card key={c.key} className="gap-0 py-0">
              {content}
            </Card>
          )
        })}
      </div>
    </section>
  )
}
