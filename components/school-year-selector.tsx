// @ts-nocheck
"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

type Props = {
  value: string
  onChange: (value: string) => void
}

export function SchoolYearSelector({ value, onChange }: Props) {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()
  
  // Année scolaire commence en septembre (mois 8)
  const currentSchoolYear = currentMonth >= 8 
    ? `${currentYear}-${(currentYear + 1).toString().slice(2)}`
    : `${currentYear - 1}-${currentYear.toString().slice(2)}`

  // Générer les 5 dernières années scolaires
  const schoolYears = []
  for (let i = 2; i >= -2; i--) {
    const startYear = currentYear - i
    const endYear = startYear + 1
    schoolYears.push(`${startYear}-${endYear.toString().slice(2)}`)
  }

  return (
    <div className="flex items-center gap-3">
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
