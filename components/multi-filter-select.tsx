"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ChevronDown, Check } from "lucide-react"

interface MultiFilterSelectProps {
  label: string
  options: string[]
  selected: string[]
  onChange: (values: string[]) => void
}

export function MultiFilterSelect({ label, options, selected, onChange }: MultiFilterSelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    document.addEventListener("keydown", handleKey)
    return () => {
      document.removeEventListener("mousedown", handleClick)
      document.removeEventListener("keydown", handleKey)
    }
  }, [])

  function toggleOption(opt: string) {
    onChange(selected.includes(opt) ? selected.filter((v) => v !== opt) : [...selected, opt])
  }

  return (
    <div ref={ref} className="relative">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen((v) => !v)}
        className="w-full justify-between font-normal"
        aria-expanded={open}
      >
        <span className="truncate">
          {label}
          {selected.length > 0 && <span className="ml-1 text-muted-foreground">({selected.length})</span>}
        </span>
        <ChevronDown className="size-4 shrink-0 opacity-50" aria-hidden />
      </Button>
      {open && (
        <div className="absolute z-20 mt-1 max-h-64 w-56 overflow-y-auto rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md">
          <div className="flex items-center justify-between gap-2 border-b border-border px-2 py-1.5">
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => onChange([])}
            >
              Limpar
            </button>
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => onChange(options)}
            >
              Selecionar todos
            </button>
          </div>
          {options.length === 0 ? (
            <p className="px-2 py-2 text-xs text-muted-foreground">Nenhuma opção</p>
          ) : (
            options.map((opt) => {
              const checked = selected.includes(opt)
              return (
                <label
                  key={opt}
                  className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                >
                  <span
                    className={cn(
                      "flex size-4 shrink-0 items-center justify-center rounded border border-input",
                      checked && "border-primary bg-primary text-primary-foreground",
                    )}
                    aria-hidden
                  >
                    {checked && <Check className="size-3" />}
                  </span>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={checked}
                    onChange={() => toggleOption(opt)}
                  />
                  <span className="truncate">{opt}</span>
                </label>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
