import type { PcaItem } from "./types"

export interface PcaFilters {
  demandante: string[]
  prioridade: string[]
  fonte: string[]
  grupo: string[]
  temPae: string[] // subconjunto de ["Com PAE", "Sem PAE"]
  qdqq: string[]
}

export const INITIAL_FILTERS: PcaFilters = {
  demandante: [],
  prioridade: [],
  fonte: [],
  grupo: [],
  temPae: [],
  qdqq: [],
}

/** Verdadeiro se o item passa em todos os filtros ativos (arrays vazios = sem restrição). */
export function matchesFilters(i: PcaItem, filters: PcaFilters): boolean {
  if (filters.demandante.length > 0 && !filters.demandante.includes(i.demandante)) return false
  if (filters.prioridade.length > 0 && !filters.prioridade.includes(i.prioridade)) return false
  if (filters.fonte.length > 0 && !filters.fonte.includes(i.fonteRecurso)) return false
  if (filters.grupo.length > 0 && !filters.grupo.includes(i.grupo)) return false
  if (filters.qdqq.length > 0 && !filters.qdqq.includes(i.dataDesejada)) return false
  if (filters.temPae.length > 0) {
    const wantCom = filters.temPae.includes("Com PAE")
    const wantSem = filters.temPae.includes("Sem PAE")
    if (wantCom && !wantSem && !i.temPae) return false
    if (wantSem && !wantCom && i.temPae) return false
  }
  return true
}

export function filterItens(itens: PcaItem[], filters: PcaFilters): PcaItem[] {
  return itens.filter((i) => matchesFilters(i, filters))
}

export function countActiveFilters(filters: PcaFilters): number {
  return Object.values(filters).reduce((acc, arr) => acc + (arr.length > 0 ? 1 : 0), 0)
}

export function isFiltersEmpty(filters: PcaFilters): boolean {
  return countActiveFilters(filters) === 0
}
