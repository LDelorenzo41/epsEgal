// @ts-nocheck
"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { getCurrentSchoolYear, getSchoolYearOptions } from "@/lib/school-year"

type Props = {
  value: string
  onChange: (value: string) => void
}

export function SchoolYearSelector({ value, onChange }: Props) {
  const currentSchoolYear = getCurrentSchoolYear()
  const schoolYears = getSchoolYearOptions()

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Label htmlFor="school-year" className="whitespace-nowrap font-semibold">
        Année scolaire :
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="school-year" className="w-[180px]">
          <SelectValue placeholder="Sélectionner l'année" />
        </SelectTrigger>
        <SelectContent>
          {schoolYears.map((year) => (
            <SelectItem key={year} value={year}>
              {year}
              {year === currentSchoolYear && " (actuelle)"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
