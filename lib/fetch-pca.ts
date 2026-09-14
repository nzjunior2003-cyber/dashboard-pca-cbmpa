import Papa from "papaparse"
import { normalizeRows, applyStatus } from "./pca-utils"
import { fetchContratadoPaeSet } from "./fetch-processos-status"
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

/**
 * Busca os itens do PCA e, em seguida, cruza com o painel de Processos 2026
 * (pelo número do PAE) para determinar o status de cada item. Se o
 * cruzamento falhar (planilha de processos indisponível etc.), os itens do
 * PCA são retornados mesmo assim, com o status provisório baseado apenas em
 * ter ou não PAE.
 */
export async function fetchPcaItensComStatus(signal?: AbortSignal): Promise<PcaItem[]> {
  const itens = await fetchPcaItens(signal)
  try {
    const contratadoSet = await fetchContratadoPaeSet(signal)
    return applyStatus(itens, contratadoSet)
  } catch (err) {
    console.warn("Não foi possível cruzar status com Processos 2026:", err)
    return itens
  }
}
