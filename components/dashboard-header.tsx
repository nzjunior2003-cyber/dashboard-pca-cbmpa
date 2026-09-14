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
    <header className="border-b border-border">
      {/* Faixa institucional — full-bleed (ocupa toda a largura da página, sem recuo) */}
      <div className="flex w-full items-stretch">
        {/* Brasão em fundo branco, colado na margem esquerda da página */}
        <div className="flex shrink-0 items-center bg-white px-4 py-3 sm:px-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${BASE_PATH}/pca-badge.png`}
            alt="Brasão do CBMPA e da Defesa Civil do Pará"
            className="h-12 w-auto shrink-0 sm:h-14"
          />
        </div>

        {/* Faixa vermelha — título institucional à esquerda, status/ação à direita */}
        <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-3 bg-primary px-4 py-3 sm:px-6">
          <h1 className="text-pretty text-sm leading-snug font-semibold text-primary-foreground sm:text-base md:text-lg">
            Corpo de Bombeiros Militar do Pará e
            <br />
            Coordenadoria de Proteção e Defesa Civil
            <br />
            Departamento Geral de Administração
          </h1>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-primary-foreground/90">
              {source === "mock" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 font-medium">
                  <FlaskConical className="size-3.5" aria-hidden />
                  Dados de exemplo
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 font-medium">
                  <Database className="size-3.5" aria-hidden />
                  Dados reais
                </span>
              )}
              {lastUpdated && (
                <span>
                  Atualizado às{" "}
                  {lastUpdated.toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
              )}
            </div>
            <Button size="sm" variant="secondary" onClick={onRefresh} disabled={loading}>
              <RefreshCw data-icon="inline-start" className={cn(loading && "animate-spin")} />
              {loading ? "Atualizando…" : "Atualizar dados"}
            </Button>
          </div>
        </div>
      </div>

      {/* Linha amarela discreta, em toda a extensão da página */}
      <div className="h-1 w-full bg-amber-400" />

      {/* Nome do painel — centralizado, fora da faixa vermelha */}
      <div className="bg-card px-4 py-4 text-center sm:px-6">
        <p className="text-base font-semibold text-foreground md:text-lg">Painel de Execução do PCA 2026</p>
      </div>
    </header>
  )
}
