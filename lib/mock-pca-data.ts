import type { PcaItem } from "./types"

interface RawMockRow {
  ordem: number
  origem: string
  demandante: string
  grupo: string
  descricao: string
  valorTotalEstimado: number
  prioridade: string
  fonteRecurso: string
  modalidade: string
  pae?: string
}

const RAW_MOCK: RawMockRow[] = [
  { ordem: 1, origem: "DGCEP", demandante: "DGCEP", grupo: "INVESTIMENTO", descricao: "MATERIAL DO DESPORTO", valorTotalEstimado: 449927.58, prioridade: "MÉDIA", fonteRecurso: "FESPDS", modalidade: "" },
  { ordem: 2, origem: "DGCEP", demandante: "DGCEP", grupo: "CUSTEIO", descricao: "CURSOS (CSBM, CGS, CAS, APH, CCIF, CCIU, CGV, CST)", valorTotalEstimado: 1034414.59, prioridade: "ALTA", fonteRecurso: "TESOURO/FEBOM", modalidade: "INEXIGIBILIDADE", pae: "2025/353638333 / E-2026/2432699" },
  { ordem: 3, origem: "DGCEP", demandante: "DGCEP", grupo: "CUSTEIO", descricao: "CURSO DE FORMAÇÃO OFICIAIS E PRAÇAS", valorTotalEstimado: 11261190, prioridade: "ALTA", fonteRecurso: "TESOURO", modalidade: "INEXIGIBILIDADE", pae: "E-2025/3734741" },
  { ordem: 4, origem: "DGCEP", demandante: "DGCEP", grupo: "INVESTIMENTO", descricao: "ESPADA", valorTotalEstimado: 23400, prioridade: "ALTA", fonteRecurso: "FEBOM", modalidade: "PREGÃO ELETRÔNICO", pae: "E-2026/2741168" },
  { ordem: 13, origem: "CEINT", demandante: "CEINT", grupo: "INVESTIMENTO", descricao: "CÂMERAS COM DVR QCG/UBMS", valorTotalEstimado: 254100, prioridade: "ALTA", fonteRecurso: "NOA", modalidade: "" },
  { ordem: 18, origem: "CEDEC", demandante: "CEDEC", grupo: "CUSTEIO", descricao: "ARP – CESTAS", valorTotalEstimado: 8937500, prioridade: "ALTA", fonteRecurso: "CEDEC", modalidade: "PREGÃO ELETRÔNICO-SRP", pae: "E-2026/2901374" },
  { ordem: 20, origem: "CEDEC", demandante: "CEDEC", grupo: "CUSTEIO", descricao: "ARP – KIT LIMPEZA", valorTotalEstimado: 1575000, prioridade: "ALTA", fonteRecurso: "CEDEC", modalidade: "" },
  { ordem: 24, origem: "CEDEC", demandante: "CEDEC", grupo: "CUSTEIO", descricao: "ARP – KIT HIGIENE", valorTotalEstimado: 1386000, prioridade: "ALTA", fonteRecurso: "CEDEC", modalidade: "PREGÃO ELETRÔNICO-SRP", pae: "2026/3237258" },
  { ordem: 35, origem: "CSMV/MOP", demandante: "CSMV/MOP", grupo: "INVESTIMENTO", descricao: "Aquisição de 01 (um) GUINCHO PLATAFORMA", valorTotalEstimado: 3000000, prioridade: "ALTA", fonteRecurso: "C.R", modalidade: "" },
  { ordem: 44, origem: "COP", demandante: "CSMV/MOP", grupo: "INVESTIMENTO", descricao: "AUTO BOMBA TANQUE", valorTotalEstimado: 8592000, prioridade: "MÉDIA", fonteRecurso: "C.R", modalidade: "ADESÃO A ARP", pae: "E-2026/2868732" },
  { ordem: 53, origem: "CENTROPAT", demandante: "CENTROPAT", grupo: "INVESTIMENTO", descricao: "AR CONDICIONADO", valorTotalEstimado: 1146550, prioridade: "ALTA", fonteRecurso: "FEBOM", modalidade: "ADESÃO A ARP", pae: "2026/2617066" },
  { ordem: 61, origem: "COP", demandante: "DAL", grupo: "CUSTEIO", descricao: "LOCAÇÃO DE VEÍCULOS PARA SALVAMENTO (PICK-UP)", valorTotalEstimado: 6516000, prioridade: "ALTA", fonteRecurso: "TESOURO", modalidade: "PREGÃO ELETRÔNICO-SRP", pae: "E-2026/2731976" },
  { ordem: 76, origem: "OBRAS", demandante: "DAL", grupo: "INVESTIMENTO", descricao: "REFORMA E AMPLIAÇÃO DO 27º GBM", valorTotalEstimado: 2500000, prioridade: "ALTA", fonteRecurso: "FEBOM", modalidade: "" },
  { ordem: 83, origem: "DTIC", demandante: "DTIC", grupo: "INVESTIMENTO", descricao: "DESKTOP C/ MONITOR + TECLADO + MOUSE, NOBREAK", valorTotalEstimado: 253194.92, prioridade: "ALTA", fonteRecurso: "FEBOM", modalidade: "PREGÃO ELETRÔNICO", pae: "E-2026/2682920" },
  { ordem: 88, origem: "DTIC", demandante: "DTIC", grupo: "CUSTEIO", descricao: "RADIO HT", valorTotalEstimado: 1379577, prioridade: "ALTA", fonteRecurso: "FEBOM", modalidade: "PREGÃO ELETRÔNICO-SRP", pae: "E-2025/3627323" },
  { ordem: 92, origem: "CEDEC", demandante: "DTIC", grupo: "CUSTEIO", descricao: "CLIMATEMPO (05 UNID.)", valorTotalEstimado: 1000000, prioridade: "MÉDIA", fonteRecurso: "C.R", modalidade: "" },
]

function toPcaItem(r: RawMockRow): PcaItem {
  const paeList = r.pae
    ? r.pae.split("/").map((s) => s.trim()).filter((s) => /\d{4}$|\d{5,}/.test(s))
    : []
  // fallback simples: se veio string com formato "E-YYYY/NNNNN", mantém como está
  const finalPaeList = r.pae ? (r.pae.match(/\b[Ee]?-?\d{4}\s*\/\s*\d{5,9}\b/g) ?? []) : []
  return {
    ordem: r.ordem,
    origem: r.origem,
    demandante: r.demandante,
    item: "",
    subitem: "",
    grupo: r.grupo,
    descricao: r.descricao,
    quantidade: "-",
    valorUnitario: null,
    valorTotalEstimado: r.valorTotalEstimado,
    prioridade: r.prioridade,
    prioridadeKey: r.prioridade === "ALTA" ? "ALTA" : r.prioridade === "MÉDIA" ? "MÉDIA" : "BAIXA",
    dataDesejada: "1º QDQQ",
    contratoNovo: "",
    fonteRecurso: r.fonteRecurso,
    valorRecursoProvavel: r.valorTotalEstimado,
    modalidade: r.modalidade,
    paeRaw: r.pae ?? "",
    paeList: finalPaeList,
    temPae: finalPaeList.length > 0,
  }
}

export const MOCK_PCA_ITENS: PcaItem[] = RAW_MOCK.map(toPcaItem)
