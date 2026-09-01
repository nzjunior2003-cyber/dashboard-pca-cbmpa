import type { PcaItem, PrioridadeKey, RawRow } from "./types"

const norm = (s: string | undefined | null) => (s ?? "").trim()

/** Remove acentos, deixa maiúsculo, colapsa espaços — para casar cabeçalhos "sujos". */
function normalizeHeader(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/\s+/g, " ")
    .trim()
}

/**
 * Mapa de coluna canônica -> conjunto de palavras-chave que devem aparecer
 * (em qualquer ordem) no cabeçalho normalizado para essa coluna ser
 * reconhecida. Resiliente a espaços extras, quebras de linha e pequenas
 * variações de texto na planilha de origem.
 */
const HEADER_KEYWORDS: Record<keyof typeof COLUMN_KEYS, string[][]> = {
  ordem: [["ORDEM"]],
  origem: [["ORIGEM"]],
  demandante: [["DEMANDANTE"]],
  item: [["ITEM"]],
  subitem: [["SUBITEM"]],
  grupo: [["GRUPO"]],
  descricao: [["DESCRICAO"]],
  quantidade: [["QUANTIDADE"]],
  valorUnitario: [["VALOR", "UNITARIO"]],
  valorTotalEstimado: [["VALOR", "TOTAL", "ESTIMADO"]],
  prioridade: [["PRIORIDADE"]],
  dataDesejada: [["DATA", "DESEJADA"]],
  contratoNovo: [["CONTRATO", "NOVO"]],
  fonteRecurso: [["FONTE"]],
  valorRecursoProvavel: [["VALOR", "RECURSO"]],
  modalidade: [["MODALIDADE"], ["RITO", "PROCESSUAL"]],
  pae: [["PAE"]],
}

// placeholder para tipagem acima (declarado depois de usado por causa do const)
const COLUMN_KEYS = {
  ordem: 0, origem: 0, demandante: 0, item: 0, subitem: 0, grupo: 0,
  descricao: 0, quantidade: 0, valorUnitario: 0, valorTotalEstimado: 0,
  prioridade: 0, dataDesejada: 0, contratoNovo: 0, fonteRecurso: 0,
  valorRecursoProvavel: 0, modalidade: 0, pae: 0,
}

export type ColumnMap = Partial<Record<keyof typeof COLUMN_KEYS, string>>

/** A partir da lista de cabeçalhos reais do CSV, monta o mapa coluna->header. */
export function buildColumnMap(fields: string[]): ColumnMap {
  const map: ColumnMap = {}
  const normalizedFields = fields.map((f) => ({ raw: f, norm: normalizeHeader(f) }))

  for (const key of Object.keys(HEADER_KEYWORDS) as (keyof typeof COLUMN_KEYS)[]) {
    const optionSets = HEADER_KEYWORDS[key]
    const found = normalizedFields.find(({ norm: n }) =>
      optionSets.some((keywords) => keywords.every((kw) => n.includes(kw))),
    )
    if (found) map[key] = found.raw
  }
  return map
}

function getVal(row: RawRow, map: ColumnMap, key: keyof typeof COLUMN_KEYS): string {
  const header = map[key]
  if (!header) return ""
  return norm(row[header])
}

export function parseValor(input: string | undefined | null): number | null {
  if (!input) return null
  let s = input.trim()
  if (!s) return null
  s = s.replace(/R\$\s?/g, "").trim()
  if (["-", "--", "---", "x", "X"].includes(s)) return null
  s = s.replace(/\./g, "").replace(",", ".")
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

export function formatBRL(value: number | null | undefined): string {
  if (value == null) return "—"
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export function formatBRLCompact(value: number | null | undefined): string {
  if (value == null) return "—"
  const abs = Math.abs(value)
  if (abs >= 1_000_000) return `R$ ${(value / 1_000_000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mi`
  if (abs >= 1_000) return `R$ ${(value / 1_000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mil`
  return formatBRL(value)
}

/**
 * Extrai números de PAE de uma célula que pode conter um ou vários,
 * em formatos como "E-2026/2432699", "2026/2741168", "E - 2025/2738090",
 * separados por "/", "," ou espaço. Ignora placeholders como
 * "2026/XXXXX (em instrução)".
 */
export function parsePaeList(raw: string): string[] {
  if (!raw) return []
  const regex = /\b[Ee]?\s*-?\s*\d{4}\s*\/\s*\d{5,9}\b/g
  const matches = raw.match(regex) ?? []
  return matches.map((m) => m.replace(/\s+/g, "").replace(/^E-?/i, "E-"))
}

function parsePrioridade(raw: string): PrioridadeKey {
  const r = raw.trim().toUpperCase()
  if (r.startsWith("ALTA")) return "ALTA"
  if (r.startsWith("MEDIA") || r.startsWith("MÉDIA")) return "MÉDIA"
  if (r.startsWith("BAIXA")) return "BAIXA"
  return "NÃO INFORMADA"
}

function isEmptyRow(row: RawRow): boolean {
  return Object.values(row).every((v) => !v || String(v).trim() === "")
}

export function normalizeRow(row: RawRow, map: ColumnMap): PcaItem | null {
  if (isEmptyRow(row)) return null

  const descricao = getVal(row, map, "descricao")
  const ordemRaw = getVal(row, map, "ordem")
  if (!descricao && !ordemRaw) return null

  const ordemNum = Number(ordemRaw)
  const paeRaw = getVal(row, map, "pae")
  const paeList = parsePaeList(paeRaw)
  const prioridadeRaw = getVal(row, map, "prioridade")

  return {
    ordem: Number.isFinite(ordemNum) && ordemRaw !== "" ? ordemNum : null,
    origem: getVal(row, map, "origem"),
    demandante: getVal(row, map, "demandante"),
    item: getVal(row, map, "item"),
    subitem: getVal(row, map, "subitem"),
    grupo: getVal(row, map, "grupo"),
    descricao,
    quantidade: getVal(row, map, "quantidade"),
    valorUnitario: parseValor(getVal(row, map, "valorUnitario")),
    valorTotalEstimado: parseValor(getVal(row, map, "valorTotalEstimado")),
    prioridade: prioridadeRaw,
    prioridadeKey: parsePrioridade(prioridadeRaw),
    dataDesejada: getVal(row, map, "dataDesejada"),
    contratoNovo: getVal(row, map, "contratoNovo"),
    fonteRecurso: getVal(row, map, "fonteRecurso"),
    valorRecursoProvavel: parseValor(getVal(row, map, "valorRecursoProvavel")),
    modalidade: getVal(row, map, "modalidade"),
    paeRaw,
    paeList,
    temPae: paeList.length > 0,
  }
}

export function normalizeRows(rows: RawRow[], fields: string[]): PcaItem[] {
  const map = buildColumnMap(fields)
  const out: PcaItem[] = []
  for (const row of rows) {
    const item = normalizeRow(row, map)
    if (item) out.push(item)
  }
  return out
}
