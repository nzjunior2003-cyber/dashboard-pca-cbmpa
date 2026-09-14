import Papa from "papaparse"

// Mesma planilha/aba usada pelo painel de Processos 2026.
const PROCESSOS_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1deakLqP8-enEgY384EkFyYedgo5WYSONjvYIBJDwqXE/gviz/tq?tqx=out:csv&sheet=Processos%202026"

/** Normaliza um número de PAE para comparação ("E-2026/2432699" -> "2026/2432699"). */
export function normalizePaeForMatch(pae: string): string {
  return pae
    .trim()
    .toUpperCase()
    .replace(/^E\s*-?\s*/, "")
    .replace(/\s+/g, "")
}

function parseSubfaseLabel(raw: string): string {
  const trimmed = (raw ?? "").trim()
  const match = trimmed.match(/^(\d+)\s*(.*)$/)
  return (match ? match[2] : trimmed).trim().toUpperCase()
}

/**
 * Busca a aba "Processos 2026" e retorna o conjunto de PAEs (normalizados)
 * cuja subfase do processo é "CONTRATADO".
 */
export async function fetchContratadoPaeSet(signal?: AbortSignal): Promise<Set<string>> {
  const response = await fetch(PROCESSOS_CSV_URL, { signal, cache: "no-store" })
  if (!response.ok) {
    throw new Error(`Falha ao carregar Processos 2026 para cruzamento de status (HTTP ${response.status}).`)
  }
  const csv = await response.text()

  const result = Papa.parse<Record<string, string>>(csv, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (h) => h.trim(),
  })

  const fields = result.meta.fields ?? []
  const paeKey = fields.find((f) => f.toUpperCase().includes("PAE"))
  const subfaseKey = fields.find((f) => f.toUpperCase().includes("SUBFASE"))

  const set = new Set<string>()
  if (!paeKey) return set

  for (const row of result.data) {
    const pae = (row[paeKey] ?? "").trim()
    if (!pae) continue
    const subfaseLabel = subfaseKey ? parseSubfaseLabel(row[subfaseKey]) : ""
    if (subfaseLabel === "CONTRATADO") {
      set.add(normalizePaeForMatch(pae))
    }
  }
  return set
}
