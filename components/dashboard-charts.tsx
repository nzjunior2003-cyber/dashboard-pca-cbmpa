"use client"

import { useMemo } from "react"
import { Bar, BarChart, CartesianGrid, Cell, LabelList, Pie, PieChart, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { countByDemandante, countByPrioridade, countComSemPae, sumValorByFonte } from "@/lib/pca-metrics"
import { formatBRLCompact } from "@/lib/pca-utils"
import type { PcaItem } from "@/lib/types"

const PALETTE = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"]

const PRIORIDADE_COLORS: Record<string, string> = {
  ALTA: "var(--status-late-foreground)",
  MÉDIA: "var(--status-warn-foreground)",
  BAIXA: "var(--status-ok-foreground)",
  "NÃO INFORMADA": "var(--status-archived-foreground)",
}

const PAE_COLORS: Record<string, string> = {
  "Com PAE": "var(--status-ok-foreground)",
  "Sem PAE": "var(--status-archived-foreground)",
}

function shorten(label: string, max = 22) {
  return label.length > max ? `${label.slice(0, max - 1)}…` : label
}

export function DashboardCharts({ itens }: { itens: PcaItem[] }) {
  const demandantes = useMemo(() => countByDemandante(itens, 10), [itens])
  const prioridades = useMemo(() => countByPrioridade(itens), [itens])
  const fontes = useMemo(() => sumValorByFonte(itens, 10), [itens])
  const comSemPae = useMemo(() => countComSemPae(itens), [itens])

  const demandanteConfig: ChartConfig = { value: { label: "Itens", color: "var(--chart-2)" } }
  const fonteConfig: ChartConfig = { value: { label: "Valor estimado", color: "var(--chart-4)" } }

  const prioridadeConfig: ChartConfig = useMemo(() => {
    const cfg: ChartConfig = { value: { label: "Itens" } }
    prioridades.forEach((p) => {
      cfg[p.label] = { label: p.label, color: PRIORIDADE_COLORS[p.label] ?? "var(--chart-1)" }
    })
    return cfg
  }, [prioridades])

  const prioridadeData = useMemo(
    () => prioridades.map((p) => ({ ...p, fill: PRIORIDADE_COLORS[p.label] ?? "var(--chart-1)" })),
    [prioridades],
  )

  const paeConfig: ChartConfig = useMemo(() => {
    const cfg: ChartConfig = { value: { label: "Itens" } }
    comSemPae.forEach((p) => {
      cfg[p.label] = { label: p.label, color: PAE_COLORS[p.label] ?? "var(--chart-1)" }
    })
    return cfg
  }, [comSemPae])

  const paeData = useMemo(
    () => comSemPae.map((p) => ({ ...p, fill: PAE_COLORS[p.label] ?? "var(--chart-1)" })),
    [comSemPae],
  )

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

      {/* Distribuição por prioridade */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por prioridade</CardTitle>
          <CardDescription>Participação de cada prioridade no total</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={prioridadeConfig} className="mx-auto aspect-square h-[300px]">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie data={prioridadeData} dataKey="value" nameKey="label" innerRadius={60} strokeWidth={2}>
                {prioridadeData.map((entry) => (
                  <Cell key={entry.label} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
            {prioridadeData.map((p) => (
              <li key={p.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: p.fill }} />
                <span className="truncate">{p.label}</span>
                <span className="ml-auto font-medium text-foreground">{p.value}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Valor estimado por fonte de recurso */}
      <Card>
        <CardHeader>
          <CardTitle>Valor estimado por fonte de recurso</CardTitle>
          <CardDescription>Top 10 fontes por soma do valor total estimado</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={fonteConfig} className="h-[300px] w-full">
            <BarChart data={fontes} layout="vertical" margin={{ left: 8, right: 32 }}>
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
              <ChartTooltip content={<ChartTooltipContent formatter={(value) => formatBRLCompact(Number(value))} />} />
              <Bar dataKey="value" fill="var(--color-value)" radius={4}>
                <LabelList
                  dataKey="value"
                  position="right"
                  className="fill-foreground text-xs"
                  formatter={(value: unknown) => formatBRLCompact(Number(value))}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Com PAE vs sem PAE */}
      <Card>
        <CardHeader>
          <CardTitle>Itens com PAE vs sem PAE</CardTitle>
          <CardDescription>Quantos itens do planejamento já têm processo aberto</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={paeConfig} className="mx-auto aspect-square h-[300px]">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie data={paeData} dataKey="value" nameKey="label" innerRadius={60} strokeWidth={2}>
                {paeData.map((entry) => (
                  <Cell key={entry.label} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
            {paeData.map((p) => (
              <li key={p.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: p.fill }} />
                <span className="truncate">{p.label}</span>
                <span className="ml-auto font-medium text-foreground">{p.value}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  )
}
