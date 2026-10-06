import type { PcaItem } from "./types"
import { formatBRL } from "./pca-utils"

export interface Insight {
  id: string
  tone: "info" | "warn" | "danger" | "ok"
  text: string
}

function sumBy(itens: PcaItem[], value: (i: PcaItem) => number): number {
  return itens.reduce((acc, i) => acc + value(i), 0)
}

function topByValue(itens: PcaItem[], key: (i: PcaItem) => string): [string, number] | null {
  const map = new Map<string, number>()
  for (const i of itens) {
    const label = key(i).trim() || "(não informado)"
    map.set(label, (map.get(label) ?? 0) + (i.valorTotalEstimado ?? 0))
  }
  const entries = [...map.entries()].sort((a, b) => b[1] - a[1])
  return entries.length > 0 ? entries[0] : null
}

/**
 * Gera insights automáticos (baseados em regras, sem IA) a partir do
 * conjunto de itens atualmente filtrado. Limitado a poucos insights por vez
 * para não poluir a tela — só aparecem quando o padrão é relevante o
 * suficiente (limiares mínimos abaixo).
 */
export function computeInsights(itens: PcaItem[]): Insight[] {
  const insights: Insight[] = []
  if (itens.length === 0) return insights

  const semPae = itens.filter((i) => !i.temPae)
  const valorSemPaeTotal = sumBy(semPae, (i) => i.valorTotalEstimado ?? 0)
  const valorTotalGeral = sumBy(itens, (i) => i.valorTotalEstimado ?? 0)

  // 1. Demandante que mais concentra valor ainda sem PAE.
  if (semPae.length > 0 && valorSemPaeTotal > 0) {
    const top = topByValue(semPae, (i) => i.demandante)
    if (top) {
      const [demandante, valor] = top
      const pct = (valor / valorSemPaeTotal) * 100
      if (pct >= 20) {
        insights.push({
          id: "demandante-sem-pae",
          tone: "warn",
          text: `${demandante} concentra ${formatBRL(valor)} (${pct.toFixed(0)}%) do valor ainda sem PAE.`,
        })
      }
    }
  }

  // 2. Itens de prioridade ALTA sem PAE.
  const altaSemPae = semPae.filter((i) => i.prioridadeKey === "ALTA")
  if (altaSemPae.length > 0) {
    const valor = sumBy(altaSemPae, (i) => i.valorTotalEstimado ?? 0)
    insights.push({
      id: "alta-prioridade-sem-pae",
      tone: "danger",
      text: `${altaSemPae.length} ${altaSemPae.length === 1 ? "item de prioridade ALTA está" : "itens de prioridade ALTA estão"} sem PAE, somando ${formatBRL(valor)}.`,
    })
  }

  // 3. Percentual geral de execução (itens contratados).
  const contratados = itens.filter((i) => i.status === "contratado")
  const pctContratado = (contratados.length / itens.length) * 100
  insights.push({
    id: "execucao",
    tone: pctContratado >= 50 ? "ok" : "info",
    text: `${pctContratado.toFixed(0)}% dos itens (${contratados.length} de ${itens.length}) já estão contratados.`,
  })

  // 4. Fonte de recurso que mais concentra valor total (concentração/risco).
  if (valorTotalGeral > 0) {
    const top = topByValue(itens, (i) => i.fonteRecurso)
    if (top) {
      const [fonte, valor] = top
      const pct = (valor / valorTotalGeral) * 100
      if (pct >= 25) {
        insights.push({
          id: "fonte-concentracao",
          tone: "info",
          text: `A fonte ${fonte} responde por ${pct.toFixed(0)}% do valor total estimado (${formatBRL(valor)}).`,
        })
      }
    }
  }

  // 5. Item de maior valor ainda sem PAE — destaque individual.
  if (semPae.length > 0) {
    const maior = [...semPae].sort(
      (a, b) => (b.valorTotalEstimado ?? 0) - (a.valorTotalEstimado ?? 0),
    )[0]
    const valor = maior.valorTotalEstimado ?? 0
    if (valor > 0) {
      const desc = maior.descricao.length > 60 ? `${maior.descricao.slice(0, 60)}…` : maior.descricao
      insights.push({
        id: "maior-item-sem-pae",
        tone: "warn",
        text: `Maior item ainda sem PAE: "${desc}" (${formatBRL(valor)}, ${maior.demandante}).`,
      })
    }
  }

  return insights.slice(0, 5)
}
