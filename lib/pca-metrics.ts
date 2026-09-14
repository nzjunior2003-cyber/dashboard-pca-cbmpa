import type { PcaItem } from "./types"

export interface PcaKpis {
  totalItens: number
  valorTotalEstimado: number
  valorRecursoProvavel: number
  itensComPae: number
  itensSemPae: number
  itensAltaPrioridadeSemPae: number
  valorSemPae: number
}

export function computeKpis(itens: PcaItem[]): PcaKpis {
  const comPae = itens.filter((i) => i.temPae)
  const semPae = itens.filter((i) => !i.temPae)
  return {
    totalItens: itens.length,
    valorTotalEstimado: itens.reduce((acc, i) => acc + (i.valorTotalEstimado ?? 0), 0),
    valorRecursoProvavel: itens.reduce((acc, i) => acc + (i.valorRecursoProvavel ?? 0), 0),
    itensComPae: comPae.length,
    itensSemPae: semPae.length,
    itensAltaPrioridadeSemPae: semPae.filter((i) => i.prioridadeKey === "ALTA").length,
    valorSemPae: semPae.reduce((acc, i) => acc + (i.valorTotalEstimado ?? 0), 0),
  }
}

export interface CountItem {
  label: string
  value: number
}

function tally(itens: PcaItem[], key: (i: PcaItem) => string): CountItem[] {
  const map = new Map<string, number>()
  for (const i of itens) {
    const label = key(i).trim() || "(não informado)"
    map.set(label, (map.get(label) ?? 0) + 1)
  }
  return Array.from(map, ([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value)
}

function sumBy(itens: PcaItem[], key: (i: PcaItem) => string, value: (i: PcaItem) => number): CountItem[] {
  const map = new Map<string, number>()
  for (const i of itens) {
    const label = key(i).trim() || "(não informado)"
    map.set(label, (map.get(label) ?? 0) + value(i))
  }
  return Array.from(map, ([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value)
}

export function countByDemandante(itens: PcaItem[], top = 10): CountItem[] {
  return tally(itens, (i) => i.demandante).slice(0, top)
}

export interface DemandanteStackedItem {
  demandante: string
  comPaeCount: number
  semPaeCount: number
  totalCount: number
}

/** Nº de itens por demandante, dividido em Com PAE / Sem PAE (para gráfico empilhado). */
export function stackedByDemandantePae(itens: PcaItem[], top = 10): DemandanteStackedItem[] {
  const map = new Map<string, DemandanteStackedItem>()
  for (const i of itens) {
    const label = i.demandante.trim() || "(não informado)"
    const prev = map.get(label) ?? { demandante: label, comPaeCount: 0, semPaeCount: 0, totalCount: 0 }
    if (i.temPae) {
      prev.comPaeCount += 1
    } else {
      prev.semPaeCount += 1
    }
    prev.totalCount += 1
    map.set(label, prev)
  }
  return Array.from(map.values())
    .sort((a, b) => b.totalCount - a.totalCount)
    .slice(0, top)
}

export function countByPrioridade(itens: PcaItem[]): CountItem[] {
  const order = ["ALTA", "MÉDIA", "BAIXA", "NÃO INFORMADA"]
  const items = tally(itens, (i) => i.prioridadeKey)
  return items.sort((a, b) => order.indexOf(a.label) - order.indexOf(b.label))
}

export function sumValorByFonte(itens: PcaItem[], top = 10): CountItem[] {
  return sumBy(itens, (i) => i.fonteRecurso, (i) => i.valorTotalEstimado ?? 0).slice(0, top)
}

export function countComSemPae(itens: PcaItem[]): CountItem[] {
  return [
    { label: "Com PAE", value: itens.filter((i) => i.temPae).length },
    { label: "Sem PAE", value: itens.filter((i) => !i.temPae).length },
  ]
}

export function uniqueValues(itens: PcaItem[], key: (i: PcaItem) => string): string[] {
  const set = new Set<string>()
  for (const i of itens) {
    const v = key(i).trim()
    if (v) set.add(v)
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, "pt-BR"))
}

export interface FonteStatusStackedItem {
  fonte: string
  contratadoValor: number
  contratadoCount: number
  andamentoValor: number
  andamentoCount: number
  aguardandoValor: number
  aguardandoCount: number
  total: number
  totalCount: number
}

/** Valor estimado e nº de processos por fonte, dividido pelas 3 categorias de status (para gráfico empilhado). */
export function stackedByFonteStatus(itens: PcaItem[], top = 12): FonteStatusStackedItem[] {
  const map = new Map<string, FonteStatusStackedItem>()
  for (const i of itens) {
    const label = i.fonteRecurso.trim() || "(não informado)"
    // A coluna "Fonte" se refere ao recurso, então o valor associado é o
    // "Valor do Recurso" (coluna O) — não o valor total estimado do item.
    const valor = i.valorRecursoProvavel ?? 0
    const prev =
      map.get(label) ??
      ({
        fonte: label,
        contratadoValor: 0,
        contratadoCount: 0,
        andamentoValor: 0,
        andamentoCount: 0,
        aguardandoValor: 0,
        aguardandoCount: 0,
        total: 0,
        totalCount: 0,
      } as FonteStatusStackedItem)
    if (i.status === "contratado") {
      prev.contratadoValor += valor
      prev.contratadoCount += 1
    } else if (i.status === "andamento") {
      prev.andamentoValor += valor
      prev.andamentoCount += 1
    } else {
      prev.aguardandoValor += valor
      prev.aguardandoCount += 1
    }
    prev.total += valor
    prev.totalCount += 1
    map.set(label, prev)
  }
  return Array.from(map.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, top)
}
