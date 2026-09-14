// Linha bruta da planilha (chaves = cabeçalhos originais, conforme o CSV).
export type RawRow = Record<string, string>

export type PrioridadeKey = "ALTA" | "MÉDIA" | "BAIXA" | "NÃO INFORMADA"

export type PcaStatusKey = "contratado" | "andamento" | "aguardando"

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
  /**
   * Cruzado com o painel de Processos 2026 pelo número do PAE:
   * "contratado" se algum PAE do item estiver com subfase CONTRATADO lá;
   * "andamento" se tiver PAE mas não estiver contratado (ou não foi encontrado);
   * "aguardando" se o item não tiver nenhum PAE.
   */
  status: PcaStatusKey
}

export type SourceKind = "mock" | "live"
export type LoadStatus = "idle" | "loading" | "error"
