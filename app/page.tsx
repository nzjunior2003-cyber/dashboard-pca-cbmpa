"use client"

import { useMemo, useState } from "react"
import { usePcaItens } from "@/hooks/use-pca"
import { computeKpis } from "@/lib/pca-metrics"
import type { PcaItem } from "@/lib/types"
import { DashboardHeader } from "@/components/dashboard-header"
import { KpiCards } from "@/components/kpi-cards"
import { DashboardCharts } from "@/components/dashboard-charts"
import { PcaTable } from "@/components/pca-table"
import { PcaDetailSheet } from "@/components/pca-detail-sheet"
import { ContentSkeleton } from "@/components/dashboard-skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { TriangleAlert, RotateCw, X } from "lucide-react"

export default function Page() {
  const { itens, source, status, error, lastUpdated, refresh } = usePcaItens()
  const [selected, setSelected] = useState<PcaItem | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [paeFilter, setPaeFilter] = useState<"com" | "sem" | null>(null)

  const kpis = useMemo(() => computeKpis(itens), [itens])
  const loading = status === "loading"

  const itensDaTabela = useMemo(() => {
    if (paeFilter === "com") return itens.filter((i) => i.temPae)
    if (paeFilter === "sem") return itens.filter((i) => !i.temPae)
    return itens
  }, [itens, paeFilter])

  function handleRowClick(item: PcaItem) {
    setSelected(item)
    setSheetOpen(true)
  }

  function handleTogglePaeFilter(value: "com" | "sem") {
    setPaeFilter((prev) => (prev === value ? null : value))
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        source={source}
        status={status}
        lastUpdated={lastUpdated}
        onRefresh={refresh}
      />

      <main className="mx-auto flex max-w-[1400px] flex-col gap-4 px-4 py-5 md:px-6">
        {source === "mock" && status !== "loading" && (
          <Alert>
            <TriangleAlert />
            <AlertTitle>Exibindo dados de exemplo</AlertTitle>
            <AlertDescription>
              O layout está sendo validado com dados fictícios. Clique em{" "}
              <strong>Atualizar dados</strong> para carregar a planilha real do Google Sheets.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <TriangleAlert />
            <AlertTitle>Não foi possível carregar os dados</AlertTitle>
            <AlertDescription className="flex flex-col items-start gap-3">
              <span>{error}</span>
              <Button size="sm" variant="outline" onClick={refresh}>
                <RotateCw data-icon="inline-start" />
                Tentar novamente
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <KpiCards
          kpis={kpis}
          loading={loading}
          paeFilterActive={paeFilter}
          onTogglePaeFilter={handleTogglePaeFilter}
        />

        {loading ? (
          <ContentSkeleton />
        ) : (
          <>
            {paeFilter && (
              <Alert>
                <AlertDescription className="flex flex-wrap items-center justify-between gap-2">
                  <span>
                    Mostrando apenas itens <strong>{paeFilter === "com" ? "Com PAE" : "Sem PAE"}</strong> (
                    {itensDaTabela.length} de {itens.length}).
                  </span>
                  <Button size="sm" variant="outline" onClick={() => setPaeFilter(null)}>
                    <X data-icon="inline-start" />
                    Limpar filtro
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            <PcaTable itens={itensDaTabela} onRowClick={handleRowClick} />
            <DashboardCharts itens={itens} />
          </>
        )}
      </main>

      <PcaDetailSheet item={selected} open={sheetOpen} onOpenChange={setSheetOpen} />

      <footer className="border-t border-border py-6">
        <div className="mx-auto max-w-[1400px] px-4 text-center text-xs text-muted-foreground md:px-6">
          <p>Corpo de Bombeiros Militar do Pará</p>
          <p>Departamento Geral de Administração</p>
          <p>Diretoria de Apoio Logístico</p>
        </div>
      </footer>
    </div>
  )
}
