import Papa from "papaparse"
import { normalizeRows } from "./pca-utils"
import type { PcaItem, RawRow } from "./types"

// URL do CSV publicado da planilha do Google Sheets (arquivo "GERAL.xlsx", aba "GERAL PCA").
export const CSV_URL =
  "https://docs.google.com/spreadsheets/d/1-XrRG5oLqrcMPLNHePm3KS4671vCp1r0/gviz/tq?tqx=out:csv&sheet=GERAL%20PCA"

/**
 * Busca o CSV real do Google Sheets, faz o parse com papaparse e
 * retorna os itens do PCA normalizados. Lança erro em caso de falha de rede.
 */
export async function fetchPcaItens(signal?: AbortSignal): Promise<PcaItem[]> {
  const response = await fetch(CSV_URL, { signal, cache: "no-store" })
  if (!response.ok) {
    throw new Error(`Falha ao carregar a planilha (HTTP ${response.status}).`)
  }
  const csv = await response.text()

  const result = Papa.parse<RawRow>(csv, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (h) => h.trim(),
  })

  if (!result.data || result.data.length === 0) {
    throw new Error("A planilha retornou vazia ou em formato inesperado.")
  }

  const fields = result.meta.fields ?? Object.keys(result.data[0] ?? {})
  return normalizeRows(result.data, fields)
}
