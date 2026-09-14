"use client"

import { useMemo, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MultiFilterSelect } from "@/components/multi-filter-select"
import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { uniqueValues } from "@/lib/pca-metrics"
import { formatBRL, STATUS_META } from "@/lib/pca-utils"
import { matchesFilters, countActiveFilters, type PcaFilters } from "@/lib/pca-filters"
import { cn } from "@/lib/utils"
import type { PcaItem } from "@/lib/types"
import { ArrowUpDown, ArrowUp, ArrowDown, Search, FilterX } from "lucide-react"

type SortKey = "ordem" | "demandante" | "valorTotalEstimado" | "valorRecursoProvavel" | "status"
type SortDir = "asc" | "desc"

const PAGE_SIZE = 10
const STATUS_ORDEM: PcaItem["status"][] = ["aguardando", "andamento", "contratado"]
const STATUS_OPTIONS = STATUS_ORDEM.map((k) => STATUS_META[k].label)

function compare(a: PcaItem, b: PcaItem, key: SortKey): number {
  switch (key) {
    case "valorTotalEstimado":
      return (a.valorTotalEstimado ?? -1) - (b.valorTotalEstimado ?? -1)
    case "valorRecursoProvavel":
      return (a.valorRecursoProvavel ?? -1) - (b.valorRecursoProvavel ?? -1)
    case "status":
      return STATUS_ORDEM.indexOf(a.status) - STATUS_ORDEM.indexOf(b.status)
    case "ordem":
      return (a.ordem ?? 999999) - (b.ordem ?? 999999)
    default:
      return String(a[key]).localeCompare(String(b[key]), "pt-BR")
  }
}

function StatusBadge({ status }: { status: PcaItem["status"] }) {
  const meta = STATUS_META[status]
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        meta.className,
      )}
    >
      {meta.label}
    </span>
  )
}

function PaeBadge({ temPae }: { temPae: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        temPae
          ? "bg-status-ok text-status-ok-foreground"
          : "bg-status-archived text-status-archived-foreground",
      )}
    >
      {temPae ? "Com PAE" : "Sem PAE"}
    </span>
  )
}

function SortHeader({
  label,
  active,
  dir,
  onClick,
  align = "left",
}: {
  label: string
  active: boolean
  dir: SortDir
  onClick: () => void
  align?: "left" | "right"
}) {
  const Icon = !active ? ArrowUpDown : dir === "asc" ? ArrowUp : ArrowDown
  return (
    <TableHead className={align === "right" ? "text-right" : undefined}>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground",
          align === "right" && "flex-row-reverse",
        )}
      >
        {label}
        <Icon className={cn("size-3.5", active && "text-foreground")} aria-hidden />
      </button>
    </TableHead>
  )
}

export function PcaTable({
  itens,
  filters,
  onFiltersChange,
  onRowClick,
}: {
  /** Lista COMPLETA (não filtrada) — a tabela aplica os filtros e a busca internamente. */
  itens: PcaItem[]
  filters: PcaFilters
  onFiltersChange: (filters: PcaFilters) => void
  onRowClick: (item: PcaItem) => void
}) {
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("ordem")
  const [sortDir, setSortDir] = useState<SortDir>("asc")
  const [page, setPage] = useState(0)

  const options = useMemo(
    () => ({
      demandante: uniqueValues(itens, (i) => i.demandante),
      fonte: uniqueValues(itens, (i) => i.fonteRecurso),
      grupo: uniqueValues(itens, (i) => i.grupo),
      qdqq: uniqueValues(itens, (i) => i.dataDesejada),
    }),
    [itens],
  )

  function updateFilter(key: keyof PcaFilters, values: string[]) {
    onFiltersChange({ ...filters, [key]: values })
    setPage(0)
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    let result = itens.filter((i) => {
      if (!matchesFilters(i, filters)) return false
      if (q) {
        const haystack = `${i.descricao} ${i.demandante} ${i.paeRaw} ${i.modalidade}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
    result = [...result].sort((a, b) => (sortDir === "asc" ? compare(a, b, sortKey) : -compare(a, b, sortKey)))
    return result
  }, [itens, search, filters, sortKey, sortDir])

  const activeFilterCount = countActiveFilters(filters)
  const hasActiveFilters = search.trim() !== "" || activeFilterCount > 0

  function resetFilters() {
    setSearch("")
    onFiltersChange({ demandante: [], status: [], fonte: [], grupo: [], temPae: [], qdqq: [] })
    setPage(0)
  }

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir(key === "valorTotalEstimado" ? "desc" : "asc")
    }
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)

  // Resumo (valor + Com/Sem PAE) quando exatamente UMA fonte está selecionada no filtro.
  const fonteBreakdown = useMemo(() => {
    if (filters.fonte.length !== 1) return null
    const fonte = filters.fonte[0]
    const subset = itens.filter((i) => i.fonteRecurso === fonte)
    const comPae = subset.filter((i) => i.temPae)
    const semPae = subset.filter((i) => !i.temPae)
    // A coluna "Fonte" se refere ao recurso, então o valor mostrado é o
    // "Valor do Recurso" (coluna O) — não o valor total estimado do item.
    const sum = (arr: PcaItem[]) => arr.reduce((acc, i) => acc + (i.valorRecursoProvavel ?? 0), 0)
    return {
      fonte,
      total: sum(subset),
      totalCount: subset.length,
      data: [
        { label: "Com PAE", value: sum(comPae), count: comPae.length },
        { label: "Sem PAE", value: sum(semPae), count: semPae.length },
      ],
    }
  }, [itens, filters.fonte])

  const fonteChartConfig: ChartConfig = { value: { label: "Valor do Recurso" } }

  return (
    <Card className="gap-4 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(0)
            }}
            placeholder="Buscar por descrição, demandante, Nº PAE ou modalidade…"
            className="pl-8"
            aria-label="Buscar itens do PCA"
          />
        </div>
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={resetFilters} className="lg:w-auto">
            <FilterX data-icon="inline-start" />
            Limpar filtros
          </Button>
        )}
      </div>

      {/* Filtros (multi-seleção) */}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
        <MultiFilterSelect
          label="Demandante"
          selected={filters.demandante}
          options={options.demandante}
          onChange={(v) => updateFilter("demandante", v)}
        />
        <MultiFilterSelect
          label="Status"
          selected={filters.status}
          options={STATUS_OPTIONS}
          onChange={(v) => updateFilter("status", v)}
        />
        <MultiFilterSelect
          label="Fonte"
          selected={filters.fonte}
          options={options.fonte}
          onChange={(v) => updateFilter("fonte", v)}
        />
        <MultiFilterSelect
          label="Grupo"
          selected={filters.grupo}
          options={options.grupo}
          onChange={(v) => updateFilter("grupo", v)}
        />
        <MultiFilterSelect
          label="Situação do PAE"
          selected={filters.temPae}
          options={["Com PAE", "Sem PAE"]}
          onChange={(v) => updateFilter("temPae", v)}
        />
        <MultiFilterSelect
          label="QDQQ"
          selected={filters.qdqq}
          options={options.qdqq}
          onChange={(v) => updateFilter("qdqq", v)}
        />
      </div>

      {fonteBreakdown && (
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h3 className="text-sm font-medium text-foreground">
              Fonte: <span className="font-semibold">{fonteBreakdown.fonte}</span>
            </h3>
            <p className="text-sm text-muted-foreground">
              {fonteBreakdown.totalCount} item(ns) • valor do recurso:{" "}
              <span className="font-semibold text-foreground">{formatBRL(fonteBreakdown.total)}</span>
            </p>
          </div>
          <ChartContainer config={fonteChartConfig} className="h-[130px] w-full">
            <BarChart data={fonteBreakdown.data} layout="vertical" margin={{ left: 8, right: 70 }}>
              <CartesianGrid horizontal={false} />
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="label"
                tickLine={false}
                axisLine={false}
                width={80}
                tick={{ fontSize: 12 }}
              />
              <ChartTooltip
                content={<ChartTooltipContent formatter={(value) => formatBRL(Number(value))} />}
              />
              <Bar dataKey="value" radius={4}>
                {fonteBreakdown.data.map((entry) => (
                  <Cell
                    key={entry.label}
                    fill={
                      entry.label === "Com PAE"
                        ? "var(--status-ok-foreground)"
                        : "var(--status-archived-foreground)"
                    }
                  />
                ))}
                <LabelList
                  dataKey="value"
                  position="right"
                  className="fill-foreground text-xs"
                  formatter={(value: unknown) => formatBRL(Number(value))}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <SortHeader label="Ordem" active={sortKey === "ordem"} dir={sortDir} onClick={() => toggleSort("ordem")} />
              <TableHead className="min-w-[260px]">Descrição</TableHead>
              <SortHeader
                label="Demandante"
                active={sortKey === "demandante"}
                dir={sortDir}
                onClick={() => toggleSort("demandante")}
              />
              <SortHeader
                label="Status"
                active={sortKey === "status"}
                dir={sortDir}
                onClick={() => toggleSort("status")}
              />
              <SortHeader
                label="Valor estimado"
                active={sortKey === "valorTotalEstimado"}
                dir={sortDir}
                onClick={() => toggleSort("valorTotalEstimado")}
                align="right"
              />
              <SortHeader
                label="Valor do Recurso"
                active={sortKey === "valorRecursoProvavel"}
                dir={sortDir}
                onClick={() => toggleSort("valorRecursoProvavel")}
                align="right"
              />
              <TableHead>Nº PAE</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  Nenhum item encontrado com os filtros atuais.
                </TableCell>
              </TableRow>
            ) : (
              pageItems.map((i) => (
                <TableRow
                  key={`${i.ordem}-${i.descricao}`}
                  onClick={() => onRowClick(i)}
                  className="cursor-pointer"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      onRowClick(i)
                    }
                  }}
                >
                  <TableCell className="font-mono text-xs whitespace-nowrap">{i.ordem ?? "—"}</TableCell>
                  <TableCell className="max-w-[320px]">
                    <span className="line-clamp-2 text-pretty">{i.descricao || "—"}</span>
                  </TableCell>
                  <TableCell className="max-w-[180px]">
                    <span className="line-clamp-2 text-xs text-muted-foreground">{i.demandante || "—"}</span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={i.status} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{formatBRL(i.valorTotalEstimado)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatBRL(i.valorRecursoProvavel)}</TableCell>
                  <TableCell>
                    <PaeBadge temPae={i.temPae} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {filtered.length} item(ns) • página {page + 1} de {totalPages}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          >
            Próxima
          </Button>
        </div>
      </div>
    </Card>
  )
}
