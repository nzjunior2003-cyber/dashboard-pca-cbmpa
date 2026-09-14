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
      {/* Barra utilitária (status + atualizar), compacta, alinhada à direita */}
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-end gap-3 px-4 pt-3 md:px-6">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
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
        <Button size="sm" onClick={onRefresh} disabled={loading}>
          <RefreshCw data-icon="inline-start" className={cn(loading && "animate-spin")} />
          {loading ? "Atualizando…" : "Atualizar dados"}
        </Button>
      </div>

      {/* Nome institucional centralizado */}
      <div className="mx-auto flex max-w-[1400px] flex-col items-center gap-3 px-4 pt-2 pb-6 text-center md:px-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${BASE_PATH}/pca-badge.png`}
          alt="Brasão do CBMPA e da Defesa Civil do Pará"
          className="h-16 w-auto shrink-0"
        />
        <div>
          <h1 className="text-balance text-base font-semibold leading-snug tracking-tight text-foreground md:text-lg">
            Corpo de Bombeiros Militar do Pará e
            <br />
            Coordenadoria de Proteção e Defesa Civil
            <br />
            Departamento Geral de Administração
          </h1>
          <p className="mt-2 text-sm font-medium text-muted-foreground md:text-base">
            Painel de Execução do PCA 2026
          </p>
        </div>
      </div>
    </header>
  )
}
