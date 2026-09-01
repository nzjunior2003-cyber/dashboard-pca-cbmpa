import type { PcaItem } from "./types"

export interface PcaKpis {
  totalItens: number
  valorTotalEstimado: number
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
