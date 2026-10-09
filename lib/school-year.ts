// Année scolaire au format court "2026-27", qui bascule au 1er septembre
function formatSchoolYear(startYear: number): string {
  return `${startYear}-${(startYear + 1).toString().slice(2)}`
}

export function getCurrentSchoolYear(date: Date = new Date()): string {
  const startYear = date.getMonth() >= 8 ? date.getFullYear() : date.getFullYear() - 1
  return formatSchoolYear(startYear)
}

// Années proposées dans les menus : 2 années passées, l'année en cours et la suivante
export function getSchoolYearOptions(): string[] {
  const currentStartYear = parseInt(getCurrentSchoolYear().slice(0, 4))
  const years = []
  for (let startYear = currentStartYear - 2; startYear <= currentStartYear + 1; startYear++) {
    years.push(formatSchoolYear(startYear))
  }
  return years
}
