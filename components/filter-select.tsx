"use client"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export const ALL_VALUE = "__all__"

export function FilterSelect({
  label,
  value,
  options,
  onValueChange,
}: {
  label: string
  value: string
  options: string[]
  onValueChange: (value: string) => void
}) {
  return (
    <Select value={value} onValueChange={(v) => onValueChange(v as string)}>
      <SelectTrigger size="sm" className="w-full" aria-label={label}>
        <SelectValue>
          {(v: string) => (
            <span className="truncate">{v === ALL_VALUE ? label : v}</span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-72">
        <SelectGroup>
          <SelectItem value={ALL_VALUE}>{label} (todos)</SelectItem>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
