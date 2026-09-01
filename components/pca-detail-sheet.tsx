"use client"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { formatBRL } from "@/lib/pca-utils"
import { cn } from "@/lib/utils"
import type { PcaItem } from "@/lib/types"

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground">{children || "—"}</dd>
    </div>
  )
}

function Money({ value }: { value: number | null }) {
  return <span className="tabular-nums">{formatBRL(value)}</span>
}

const PRIORIDADE_STYLES: Record<PcaItem["prioridadeKey"], string> = {
  ALTA: "bg-status-late text-status-late-foreground",
  MÉDIA: "bg-status-warn text-status-warn-foreground",
  BAIXA: "bg-status-ok text-status-ok-foreground",
  "NÃO INFORMADA": "bg-status-archived text-status-archived-foreground",
}

export function PcaDetailSheet({
  item,
  open,
  onOpenChange,
}: {
  item: PcaItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-md">
        {item && (
          <>
            <SheetHeader className="gap-2 border-b border-border">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                    PRIORIDADE_STYLES[item.prioridadeKey],
                  )}
                >
                  {item.prioridade || "Prioridade não informada"}
                </span>
                <span
                  className={cn(
                    "inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                    item.temPae
                      ? "bg-status-ok text-status-ok-foreground"
                      : "bg-status-archived text-status-archived-foreground",
                  )}
                >
                  {item.temPae ? "Com PAE" : "Sem PAE"}
                </span>
              </div>
              <SheetTitle className="text-base">Item {item.ordem ?? "—"} do PCA</SheetTitle>
              <SheetDescription className="text-pretty leading-relaxed">
                {item.descricao || "Sem descrição"}
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-col gap-5 p-4">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
                <Field label="Origem">{item.origem}</Field>
                <Field label="Demandante">{item.demandante}</Field>
                <Field label="Item">{item.item}</Field>
                <Field label="Subitem">{item.subitem}</Field>
                <Field label="Grupo">{item.grupo}</Field>
                <Field label="Quantidade">{item.quantidade}</Field>
                <Field label="Data desejada">{item.dataDesejada}</Field>
                <Field label="Contrato novo">{item.contratoNovo}</Field>
                <Field label="Modalidade / rito">{item.modalidade}</Field>
              </dl>

              <Separator />

              <div>
                <span className="text-xs font-medium text-muted-foreground">Valores</span>
                <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-4">
                  <Field label="Valor unitário">
                    <Money value={item.valorUnitario} />
                  </Field>
                  <Field label="Valor total estimado">
                    <Money value={item.valorTotalEstimado} />
                  </Field>
                  <Field label="Fonte do recurso">{item.fonteRecurso}</Field>
                  <Field label="Valor do recurso provável">
                    <Money value={item.valorRecursoProvavel} />
                  </Field>
                </dl>
              </div>

              <Separator />

              <div>
                <span className="text-xs font-medium text-muted-foreground">Processo (PAE)</span>
                <div className="mt-2">
                  {item.paeList.length > 0 ? (
                    <ul className="flex flex-wrap gap-1.5">
                      {item.paeList.map((pae) => (
                        <li
                          key={pae}
                          className="rounded-md bg-muted px-2 py-1 font-mono text-xs text-foreground"
                        >
                          {pae}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Nenhum PAE identificado para este item ainda.
                    </p>
                  )}
                  {item.paeRaw && item.paeList.length === 0 && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Texto original da planilha: “{item.paeRaw}”
                    </p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
