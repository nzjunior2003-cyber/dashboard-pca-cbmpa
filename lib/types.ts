// Linha bruta da planilha (chaves = cabeçalhos originais, conforme o CSV).
export type RawRow = Record<string, string>

export type PrioridadeKey = "ALTA" | "MÉDIA" | "BAIXA" | "NÃO INFORMADA"

// Item do PCA normalizado, pronto para consumo pela UI.
export interface PcaItem {
  ordem: number | null
  origem: string
  demandante: string
  item: string
  subitem: string
  grupo: string
  descricao: string
  quantidade: string
  valorUnitario: number | null
  valorTotalEstimado: number | null
  prioridade: string
  prioridadeKey: PrioridadeKey
  dataDesejada: string
  contratoNovo: string
  fonteRecurso: string
  valorRecursoProvavel: number | null
  modalidade: string
  paeRaw: string
  paeList: string[]
  temPae: boolean
}

export type SourceKind = "mock" | "live"
export type LoadStatus = "idle" | "loading" | "error"
