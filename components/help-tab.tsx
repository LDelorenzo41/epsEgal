"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { HelpCircle, Lightbulb } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getHelpForPath, type HelpSection } from "@/lib/help-content"
import { cn } from "@/lib/utils"

type Side = "left" | "right"

const SIDE_STORAGE_KEY = "eps-egal-help-side"

// Espaces insécables de la typographie française : « » : ; ? ! % jamais seuls en bout de ligne
const nbsp = (text: string) => text.replace(/« /g, "« ").replace(/ ([»:;?!%])/g, " $1")

function HelpSectionBlock({ section }: { section: HelpSection }) {
  return (
    <section className="space-y-2">
      <h3 className="font-semibold text-gray-900">{nbsp(section.title)}</h3>
      {section.text && <p className="text-sm text-gray-700">{nbsp(section.text)}</p>}
      {section.steps && (
        <ol className="list-decimal space-y-1 pl-5 text-sm text-gray-700">
          {section.steps.map((step) => (
            <li key={step}>{nbsp(step)}</li>
          ))}
        </ol>
      )}
      {section.points && (
        <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
          {section.points.map((point) => (
            <li key={point}>{nbsp(point)}</li>
          ))}
        </ul>
      )}
      {section.tip && (
        <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <Lightbulb className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{nbsp(section.tip)}</span>
        </div>
      )}
    </section>
  )
}

export function HelpTab() {
  const pathname = usePathname()
  const help = getHelpForPath(pathname)
  const [open, setOpen] = useState(false)
  // null tant que le côté mémorisé n'est pas lu : évite d'afficher l'onglet du mauvais côté
  const [side, setSide] = useState<Side | null>(null)

  useEffect(() => {
    let saved: string | null = null
    try {
      saved = localStorage.getItem(SIDE_STORAGE_KEY)
    } catch {
      // Stockage indisponible (navigation privée...) : côté par défaut
    }
    setSide(saved === "left" ? "left" : "right")
  }, [])

  // Le panneau se referme quand on change de page
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const changeSide = (newSide: Side) => {
    setSide(newSide)
    try {
      localStorage.setItem(SIDE_STORAGE_KEY, newSide)
    } catch {
      // Le choix reste valable jusqu'au rechargement de la page
    }
  }

  if (!help || !side) return null

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ouvrir l'aide de la page"
        className={cn(
          "fixed top-1/2 z-40 flex -translate-y-1/2 items-center gap-1.5 bg-blue-600 px-1.5 py-3 text-xs font-semibold text-white shadow-lg transition-transform duration-200 [writing-mode:vertical-rl] hover:bg-blue-700 sm:px-2 sm:text-sm",
          side === "right"
            ? "right-0 translate-x-1 rounded-l-lg hover:translate-x-0"
            : "left-0 -translate-x-1 rounded-r-lg hover:translate-x-0"
        )}
      >
        <HelpCircle className="h-4 w-4" />
        Aide
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side={side} className="flex w-[90%] flex-col gap-0 p-0 sm:max-w-md">
          <SheetHeader className="border-b p-6 pb-4 pr-12 text-left">
            <SheetTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 flex-shrink-0 text-blue-600" />
              Aide · {help.title}
            </SheetTitle>
            <SheetDescription>{nbsp(help.intro)}</SheetDescription>
          </SheetHeader>

          <Tabs
            key={pathname}
            defaultValue={help.categories[0].id}
            className="flex min-h-0 flex-1 flex-col"
          >
            <TabsList className="mx-6 mt-4 flex h-auto flex-wrap justify-start gap-1">
              {help.categories.map((category) => (
                <TabsTrigger key={category.id} value={category.id}>
                  {category.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {help.categories.map((category) => (
              <TabsContent
                key={category.id}
                value={category.id}
                className="mt-0 flex-1 overflow-y-auto px-6 py-4"
              >
                <div className="space-y-6">
                  {category.sections.map((section) => (
                    <HelpSectionBlock key={section.title} section={section} />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t px-6 py-3 text-sm">
            <span className="text-gray-600">Position de l'onglet Aide</span>
            <div className="flex rounded-md border p-0.5">
              {(["left", "right"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => changeSide(value)}
                  aria-pressed={side === value}
                  className={cn(
                    "rounded px-3 py-1 transition-colors",
                    side === value ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  {value === "left" ? "Gauche" : "Droite"}
                </button>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
