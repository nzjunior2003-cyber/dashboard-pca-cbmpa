"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { LoadStatus, SourceKind } from "@/lib/types"
import { RefreshCw, Database, FlaskConical } from "lucide-react"

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

interface DashboardHeaderProps {
  source: SourceKind
  status: LoadStatus
  lastUpdated: Date | null
  onRefresh: () => void
}

export function DashboardHeader({ source, status, lastUpdated, onRefresh }: DashboardHeaderProps) {
  const loading = status === "loading"
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${BASE_PATH}/pca-badge.png`}
            alt="Brasão do CBMPA e da Defesa Civil do Pará"
            className="h-14 w-auto shrink-0"
          />
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-foreground text-balance md:text-xl">
              Painel do PCA
            </h1>
            <p className="text-sm text-muted-foreground">
              CBMPA • Plano de Contratações Anual — 2026
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {source === "mock" ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 font-medium text-secondary-foreground">
                <FlaskConical className="size-3.5" aria-hidden />
                Dados de exemplo
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-status-ok px-2.5 py-1 font-medium text-status-ok-foreground">
                <Database className="size-3.5" aria-hidden />
                Dados reais
              </span>
            )}
            {lastUpdated && (
              <span>
                Atualizado às{" "}
                {lastUpdated.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" onClick={onRefresh} disabled={loading}>
              <RefreshCw data-icon="inline-start" className={cn(loading && "animate-spin")} />
              {loading ? "Atualizando…" : "Atualizar dados"}
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
