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
import { FilterSelect, ALL_VALUE } from "@/components/filter-select"
import { uniqueValues } from "@/lib/pca-metrics"
import { formatBRL } from "@/lib/pca-utils"
import { cn } from "@/lib/utils"
import type { PcaItem } from "@/lib/types"
import { ArrowUpDown, ArrowUp, ArrowDown, Search, FilterX } from "lucide-react"

type SortKey = "ordem" | "demandante" | "valorTotalEstimado" | "prioridade"
type SortDir = "asc" | "desc"

interface Filters {
  demandante: string
  prioridade: string
  fonte: string
  grupo: string
  temPae: string
}

const INITIAL_FILTERS: Filters = {
  demandante: ALL_VALUE,
  prioridade: ALL_VALUE,
  fonte: ALL_VALUE,
  grupo: ALL_VALUE,
  temPae: ALL_VALUE,
}

const PAGE_SIZE = 10
const PRIORIDADE_ORDEM = ["ALTA", "MÉDIA", "BAIXA", "NÃO INFORMADA"]

function compare(a: PcaItem, b: PcaItem, key: SortKey): number {
  switch (key) {
    case "valorTotalEstimado":
      return (a.valorTotalEstimado ?? -1) - (b.valorTotalEstimado ?? -1)
    case "prioridade":
      return PRIORIDADE_ORDEM.indexOf(a.prioridadeKey) - PRIORIDADE_ORDEM.indexOf(b.prioridadeKey)
    case "ordem":
      return (a.ordem ?? 999999) - (b.ordem ?? 999999)
    default:
      return String(a[key]).localeCompare(String(b[key]), "pt-BR")
  }
}

function PrioridadeBadge({ prioridadeKey, prioridade }: { prioridadeKey: PcaItem["prioridadeKey"]; prioridade: string }) {
  const styles: Record<PcaItem["prioridadeKey"], string> = {
    ALTA: "bg-status-late text-status-late-foreground",
    MÉDIA: "bg-status-warn text-status-warn-foreground",
    BAIXA: "bg-status-ok text-status-ok-foreground",
    "NÃO INFORMADA": "bg-status-archived text-status-archived-foreground",
  }
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        styles[prioridadeKey],
      )}
    >
      {prioridade || "—"}
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
  onRowClick,
}: {
  itens: PcaItem[]
  onRowClick: (item: PcaItem) => void
}) {
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS)
  const [sortKey, setSortKey] = useState<SortKey>("ordem")
  const [sortDir, setSortDir] = useState<SortDir>("asc")
  const [page, setPage] = useState(0)

  const options = useMemo(
    () => ({
      demandante: uniqueValues(itens, (i) => i.demandante),
      prioridade: uniqueValues(itens, (i) => i.prioridade),
      fonte: uniqueValues(itens, (i) => i.fonteRecurso),
      grupo: uniqueValues(itens, (i) => i.grupo),
    }),
    [itens],
  )

  function updateFilter(key: keyof Filters, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(0)
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    let result = itens.filter((i) => {
      if (q) {
        const haystack = `${i.descricao} ${i.demandante} ${i.paeRaw} ${i.modalidade}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      if (filters.demandante !== ALL_VALUE && i.demandante !== filters.demandante) return false
      if (filters.prioridade !== ALL_VALUE && i.prioridade !== filters.prioridade) return false
      if (filters.fonte !== ALL_VALUE && i.fonteRecurso !== filters.fonte) return false
      if (filters.grupo !== ALL_VALUE && i.grupo !== filters.grupo) return false
      if (filters.temPae === "Com PAE" && !i.temPae) return false
      if (filters.temPae === "Sem PAE" && i.temPae) return false
      return true
    })
    result = [...result].sort((a, b) => (sortDir === "asc" ? compare(a, b, sortKey) : -compare(a, b, sortKey)))
    return result
  }, [itens, search, filters, sortKey, sortDir])

  const activeFilters =
    search.trim() !== "" || Object.values(filters).some((v) => v !== ALL_VALUE)

  function resetFilters() {
    setSearch("")
    setFilters(INITIAL_FILTERS)
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
        {activeFilters && (
          <Button variant="outline" size="sm" onClick={resetFilters} className="lg:w-auto">
            <FilterX data-icon="inline-start" />
            Limpar filtros
          </Button>
        )}
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-5">
        <FilterSelect
          label="Demandante"
          value={filters.demandante}
          options={options.demandante}
          onValueChange={(v) => updateFilter("demandante", v)}
        />
        <FilterSelect
          label="Prioridade"
          value={filters.prioridade}
          options={options.prioridade}
          onValueChange={(v) => updateFilter("prioridade", v)}
        />
        <FilterSelect
          label="Fonte"
          value={filters.fonte}
          options={options.fonte}
          onValueChange={(v) => updateFilter("fonte", v)}
        />
        <FilterSelect
          label="Grupo"
          value={filters.grupo}
          options={options.grupo}
          onValueChange={(v) => updateFilter("grupo", v)}
        />
        <FilterSelect
          label="Situação do PAE"
          value={filters.temPae}
          options={["Com PAE", "Sem PAE"]}
          onValueChange={(v) => updateFilter("temPae", v)}
        />
      </div>

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
                label="Prioridade"
                active={sortKey === "prioridade"}
                dir={sortDir}
                onClick={() => toggleSort("prioridade")}
              />
              <SortHeader
                label="Valor estimado"
                active={sortKey === "valorTotalEstimado"}
                dir={sortDir}
                onClick={() => toggleSort("valorTotalEstimado")}
                align="right"
              />
              <TableHead>Nº PAE</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
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
                    <PrioridadeBadge prioridadeKey={i.prioridadeKey} prioridade={i.prioridade} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{formatBRL(i.valorTotalEstimado)}</TableCell>
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
