"use client"

import { useMemo } from "react"
import { Bar, BarChart, CartesianGrid, Cell, LabelList, Pie, PieChart, XAxis, YAxis, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import {
  countByDemandante,
  stackedByFonteStatus,
  type FonteStatusStackedItem,
} from "@/lib/pca-metrics"
import { formatBRL, STATUS_META } from "@/lib/pca-utils"
import type { PcaItem, PcaStatusKey } from "@/lib/types"

const PAE_COLORS: Record<string, string> = {
  "Com PAE": "var(--status-ok)",
  "Sem PAE": "var(--status-archived)",
}

interface PieSliceDatum {
  key: string
  label: string
  value: number
  fill: string
  pctFiltered: number
  pctTotal: number
}

/** Conta ocorrências dentro do subconjunto filtrado e calcula % do filtro e % do total geral. */
function buildDualPctData<T extends string>(
  itens: PcaItem[],
  totalCount: number,
  groups: { key: T; label: string; fill: string; predicate: (i: PcaItem) => boolean }[],
): PieSliceDatum[] {
  const filteredTotal = itens.length
  return groups.map((g) => {
    const value = itens.filter(g.predicate).length
    return {
      key: g.key,
      label: g.label,
      value,
      fill: g.fill,
      pctFiltered: filteredTotal > 0 ? (value / filteredTotal) * 100 : 0,
      pctTotal: totalCount > 0 ? (value / totalCount) * 100 : 0,
    }
  })
}

function shorten(label: string, max = 22) {
  return label.length > max ? `${label.slice(0, max - 1)}…` : label
}

function FonteTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload: FonteStatusStackedItem }>
}) {
  if (!active || !payload || payload.length === 0) return null
  const d = payload[0].payload
  const rows: Array<{ key: PcaItem["status"]; valor: number; count: number }> = [
    { key: "aguardando", valor: d.aguardandoValor, count: d.aguardandoCount },
    { key: "andamento", valor: d.andamentoValor, count: d.andamentoCount },
    { key: "contratado", valor: d.contratadoValor, count: d.contratadoCount },
  ]
  return (
    <div className="rounded-lg border border-border bg-background p-2.5 text-xs shadow-md">
      <p className="mb-1.5 font-medium text-foreground">{d.fonte}</p>
      {rows.map((r) => (
        <div key={r.key} className="flex items-center gap-1.5">
          <span
            className="size-2 rounded-full border border-black/10"
            style={{ backgroundColor: STATUS_META[r.key].chartColor }}
          />
          <span className="text-muted-foreground">{STATUS_META[r.key].label}:</span>
          <span className="font-medium text-foreground">
            {formatBRL(r.valor)} ({r.count} proc.)
          </span>
        </div>
      ))}
      <div className="mt-1.5 border-t border-border pt-1.5 font-medium text-foreground">
        Total: {formatBRL(d.total)} ({d.totalCount} processos)
      </div>
    </div>
  )
}

export function DashboardCharts({ itens, totalCount }: { itens: PcaItem[]; totalCount: number }) {
  const demandantes = useMemo(() => countByDemandante(itens, 10), [itens])
  const fontesStacked = useMemo(() => stackedByFonteStatus(itens, 12), [itens])

  const demandanteConfig: ChartConfig = { value: { label: "Itens", color: "var(--chart-2)" } }
  const fonteStackedConfig: ChartConfig = {
    aguardandoValor: { label: STATUS_META.aguardando.label, color: STATUS_META.aguardando.chartColor },
    andamentoValor: { label: STATUS_META.andamento.label, color: STATUS_META.andamento.chartColor },
    contratadoValor: { label: STATUS_META.contratado.label, color: STATUS_META.contratado.chartColor },
  }

  const statusData = useMemo(
    () =>
      buildDualPctData<PcaStatusKey>(itens, totalCount, [
        { key: "aguardando", label: STATUS_META.aguardando.label, fill: STATUS_META.aguardando.chartColor, predicate: (i) => i.status === "aguardando" },
        { key: "andamento", label: STATUS_META.andamento.label, fill: STATUS_META.andamento.chartColor, predicate: (i) => i.status === "andamento" },
        { key: "contratado", label: STATUS_META.contratado.label, fill: STATUS_META.contratado.chartColor, predicate: (i) => i.status === "contratado" },
      ]),
    [itens, totalCount],
  )
  const statusConfig: ChartConfig = { value: { label: "Itens" } }

  const paeData = useMemo(
    () =>
      buildDualPctData(itens, totalCount, [
        { key: "com", label: "Com PAE", fill: PAE_COLORS["Com PAE"], predicate: (i) => i.temPae },
        { key: "sem", label: "Sem PAE", fill: PAE_COLORS["Sem PAE"], predicate: (i) => !i.temPae },
      ]),
    [itens, totalCount],
  )
  const paeConfig: ChartConfig = { value: { label: "Itens" } }

  return (
    <section aria-label="Gráficos" className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Itens por demandante */}
      <Card>
        <CardHeader>
          <CardTitle>Itens por demandante</CardTitle>
          <CardDescription>Top 10 setores com mais itens planejados no PCA</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={demandanteConfig} className="h-[300px] w-full">
            <BarChart data={demandantes} layout="vertical" margin={{ left: 8, right: 24 }}>
              <CartesianGrid horizontal={false} />
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="label"
                tickLine={false}
                axisLine={false}
                width={140}
                tick={{ fontSize: 11 }}
                tickFormatter={(v: string) => shorten(v, 20)}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value" fill="var(--color-value)" radius={4}>
                <LabelList dataKey="value" position="right" className="fill-foreground text-xs" />
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Distribuição por status */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por status</CardTitle>
          <CardDescription>% do filtro selecionado e % do total geral de itens do PCA</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={statusConfig} className="mx-auto aspect-square h-[260px]">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie data={statusData} dataKey="value" nameKey="label" strokeWidth={2}>
                {statusData.map((entry) => (
                  <Cell key={entry.key} fill={entry.fill} stroke="var(--border)" />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <ul className="mt-3 flex flex-col gap-2">
            {statusData.map((d) => (
              <li key={d.key} className="flex items-start gap-1.5 text-xs">
                <span
                  className="mt-0.5 size-2 shrink-0 rounded-full border border-black/10"
                  style={{ backgroundColor: d.fill }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-foreground">{d.label}</span>
                    <span className="font-medium text-foreground">{d.value}</span>
                  </div>
                  <p className="text-muted-foreground">
                    {d.pctFiltered.toFixed(0)}% do filtro selecionado · {d.pctTotal.toFixed(0)}% do total
                    geral
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Valor e nº de processos por fonte de recurso (empilhado por status) */}
      <Card>
        <CardHeader>
          <CardTitle>Valor e processos por fonte de recurso</CardTitle>
          <CardDescription>
            Empilhado por status (Aguardando instrução / Em andamento / Contratado) — passe o mouse para
            ver o nº de processos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={fonteStackedConfig} className="h-[300px] w-full">
            <BarChart data={fontesStacked} layout="vertical" margin={{ left: 8, right: 8 }}>
              <CartesianGrid horizontal={false} />
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="fonte"
                tickLine={false}
                axisLine={false}
                width={140}
                tick={{ fontSize: 11 }}
                tickFormatter={(v: string) => shorten(v, 20)}
              />
              <Tooltip content={<FonteTooltip />} cursor={{ fill: "var(--muted)", opacity: 0.4 }} />
              <Bar
                dataKey="aguardandoValor"
                stackId="v"
                fill={STATUS_META.aguardando.chartColor}
                stroke="var(--border)"
                strokeWidth={1}
                radius={[4, 0, 0, 4]}
              />
              <Bar
                dataKey="andamentoValor"
                stackId="v"
                fill={STATUS_META.andamento.chartColor}
                stroke="var(--border)"
                strokeWidth={1}
              />
              <Bar
                dataKey="contratadoValor"
                stackId="v"
                fill={STATUS_META.contratado.chartColor}
                stroke="var(--border)"
                strokeWidth={1}
                radius={[0, 4, 4, 0]}
              >
                <LabelList
                  dataKey="total"
                  position="right"
                  className="fill-foreground text-xs"
                  formatter={(value: unknown) => formatBRL(Number(value))}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            <li className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span
                className="size-2 shrink-0 rounded-full border border-black/10"
                style={{ backgroundColor: STATUS_META.aguardando.chartColor }}
              />
              {STATUS_META.aguardando.label}
            </li>
            <li className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span
                className="size-2 shrink-0 rounded-full border border-black/10"
                style={{ backgroundColor: STATUS_META.andamento.chartColor }}
              />
              {STATUS_META.andamento.label}
            </li>
            <li className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span
                className="size-2 shrink-0 rounded-full border border-black/10"
                style={{ backgroundColor: STATUS_META.contratado.chartColor }}
              />
              {STATUS_META.contratado.label}
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Com PAE vs sem PAE */}
      <Card>
        <CardHeader>
          <CardTitle>Itens com PAE vs sem PAE</CardTitle>
          <CardDescription>% do filtro selecionado e % do total geral de itens do PCA</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={paeConfig} className="mx-auto aspect-square h-[260px]">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie data={paeData} dataKey="value" nameKey="label" strokeWidth={2}>
                {paeData.map((entry) => (
                  <Cell key={entry.key} fill={entry.fill} stroke="var(--border)" />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <ul className="mt-3 flex flex-col gap-2">
            {paeData.map((d) => (
              <li key={d.key} className="flex items-start gap-1.5 text-xs">
                <span
                  className="mt-0.5 size-2 shrink-0 rounded-full border border-black/10"
                  style={{ backgroundColor: d.fill }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-foreground">{d.label}</span>
                    <span className="font-medium text-foreground">{d.value}</span>
                  </div>
                  <p className="text-muted-foreground">
                    {d.pctFiltered.toFixed(0)}% do filtro selecionado · {d.pctTotal.toFixed(0)}% do total
                    geral
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  )
}
