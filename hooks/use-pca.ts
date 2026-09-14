"use client"

import { useCallback, useRef, useState } from "react"
import { fetchPcaItensComStatus } from "@/lib/fetch-pca"
import { MOCK_PCA_ITENS } from "@/lib/mock-pca-data"
import type { LoadStatus, PcaItem, SourceKind } from "@/lib/types"

interface UsePcaState {
  itens: PcaItem[]
  source: SourceKind
  status: LoadStatus
  error: string | null
  lastUpdated: Date | null
}

/**
 * Inicia com dados MOCK (para validar o layout imediatamente) e expõe
 * `refresh()` que busca o CSV real do Google Sheets sob demanda — nunca
 * dispara fetch em useEffect, apenas por ação do usuário.
 */
export function usePcaItens() {
  const [state, setState] = useState<UsePcaState>({
    itens: MOCK_PCA_ITENS,
    source: "mock",
    status: "idle",
    error: null,
    lastUpdated: null,
  })
  const abortRef = useRef<AbortController | null>(null)

  const refresh = useCallback(async () => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setState((prev) => ({ ...prev, status: "loading", error: null }))
    try {
      const data = await fetchPcaItensComStatus(controller.signal)
      setState({
        itens: data,
        source: "live",
        status: "idle",
        error: null,
        lastUpdated: new Date(),
      })
    } catch (err) {
      if (controller.signal.aborted) return
      const message =
        err instanceof Error
          ? err.message
          : "Não foi possível carregar os dados. Verifique sua conexão."
      setState((prev) => ({
        ...prev,
        status: "error",
        error: `${message} Se o erro persistir, pode ser bloqueio de CORS do navegador.`,
      }))
    }
  }, [])

  return { ...state, refresh }
}
