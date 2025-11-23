// @ts-nocheck
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BookOpen } from "lucide-react"

export function SourcesModal() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full h-auto py-4">
          <div className="flex flex-col items-center gap-2 w-full">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <BookOpen className="h-8 w-8 text-indigo-600" />
            </div>
            <span className="font-semibold text-sm">Voir les sources</span>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-blue-900">
            Sources bibliographiques
          </DialogTitle>
          <DialogDescription>
            Ressources et références sur l'égalité filles-garçons en EPS (Recherche via NotebookLM)
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Section I */}
            <div>
              <h3 className="text-lg font-bold text-blue-800 mb-3">
                I. Rapports d'expertise et documents institutionnels
              </h3>
              <p className="text-sm text-gray-600 mb-4 italic">
                Ces documents établissent le cadre de la politique d'égalité et insistent sur la déconstruction des stéréotypes.
              </p>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 rounded-r">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    • Rapport du Haut Conseil à l'Égalité (HCE) : Formation à l'égalité filles-garçons : Faire des personnels enseignants et d'éducation les moteurs de l'apprentissage et de l'expérience de l'égalité.
                  </h4>
                  <p className="text-sm text-gray-700 ml-4">
                    Ce rapport fait le lien entre la formation des personnels et la lutte contre les stéréotypes. Il rappelle que l'Égalité filles-garçons doit être une connaissance requise pour l'obtention des diplômes d'enseignant et d'encadrement.
                  </p>
                </div>

                <div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 rounded-r">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    • Ressource IH2EF (Institut des hautes études de l'éducation et de la formation) : Agir pour l'égalité filles-garçons en établissement public local d'enseignement (EPLE).
                  </h4>
                  <p className="text-sm text-gray-700 ml-4">
                    Cette ressource vise à aider les établissements à mettre en place une stratégie pour l'égalité filles-garçons et à en évaluer l'efficacité.
                  </p>
                </div>

                <div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 rounded-r">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    • Publication du Ministère de l'Éducation nationale (DEPP) : Filles et garçons sur le chemin de l'égalité, de l'école à l'enseignement supérieur, édition 2024.
                  </h4>
                  <p className="text-sm text-gray-700 ml-4">
                    Il s'agit d'une publication annuelle de la Direction de l'évaluation, de la prospective et de la performance (DEPP) traitant des statistiques d'égalité.
                  </p>
                </div>

                <div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 rounded-r">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    • Projet de programmes d'EPS du Cycle 4 (Collège) : Projet de programmes d'éducation physique et sportive du cycle 4 (Juillet 2025).
                  </h4>
                  <p className="text-sm text-gray-700 ml-4">
                    Ces programmes stipulent que l'élève doit comprendre la diversité des facteurs qui expliquent les différences de performances entre les filles et les garçons et mettent en avant l'égalité filles-garçons comme un enjeu citoyen.
                  </p>
                </div>
              </div>
            </div>

            {/* Section II */}
            <div>
              <h3 className="text-lg font-bold text-green-800 mb-3">
                II. Études académiques sur la « Fabrication Scolaire » et l'Inconscient
              </h3>
              <p className="text-sm text-gray-600 mb-4 italic">
                Ces recherches analysent comment les inégalités sont produites en classe, souvent de manière involontaire (inconsciente) par les enseignants et la didactique.
              </p>
              <div className="space-y-4">
                <div className="border-l-4 border-green-500 pl-4 py-2 bg-green-50 rounded-r">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    • Vigneron, Cécile : Les inégalités de réussite en EPS entre filles et garçons : déterminisme biologique ou fabrication scolaire ? (2006).
                  </h4>
                  <p className="text-sm text-gray-700 ml-4">
                    Cet article fondateur pose la question centrale du sujet audio, cherchant à déterminer si les écarts de réussite sont dus à des facteurs biologiques ou à des mécanismes scolaires.
                  </p>
                </div>

                <div className="border-l-4 border-green-500 pl-4 py-2 bg-green-50 rounded-r">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    • Debars, Claire : Analyse didactique des pratiques d'enseignement en EPS selon le genre en contexte d'éducation prioritaire... (Présentation 2022, basée sur sa thèse 2020).
                  </h4>
                  <p className="text-sm text-gray-700 ml-4">
                    Cette analyse conclut à l'existence de « processus implicites que les enseignant∙es font fonctionner de manière inconsciente ». Ces processus incluent un choix d'APSA et de contenus discriminants, un curriculum caché bâti autour d'une culture sportive plutôt masculine, et plus d'interactions des enseignant∙es avec les garçons qu'avec les filles.
                  </p>
                  <p className="text-sm text-gray-700 ml-4 mt-2">
                    Elle souligne la nécessité d'une prise de conscience pour dépasser les stéréotypes.
                  </p>
                </div>

                <div className="border-l-4 border-green-500 pl-4 py-2 bg-green-50 rounded-r">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    • Couchot-Schiex, Sigolène : Chapitre 5. Les normes de sexes dans les interactions enseignant.e et élèves. Deux études de cas en Éducation Physique et Sportive (2013).
                  </h4>
                  <p className="text-sm text-gray-700 ml-4">
                    Ce chapitre examine directement les normes de sexes dans les interactions professeur-élèves en EPS.
                  </p>
                </div>

                <div className="border-l-4 border-green-500 pl-4 py-2 bg-green-50 rounded-r">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    • Patinet-Bienaimé, Catherine et Cogérino, Geneviève : La vigilance des enseignant-e-s d'éducation physique et sportive relative à l'égalité des filles et des garçons (2011).
                  </h4>
                  <p className="text-sm text-gray-700 ml-4">
                    Cette étude explore la faible vigilance des enseignants relative à l'égalité des sexes et note que les indices perceptifs des enseignants sont différenciés : les filles sont perçues par leur manque de mobilité ou leur peur des engins, tandis que les garçons le sont par leur vitesse excessive ou leur comportement agressif.
                  </p>
                </div>
              </div>
            </div>

            {/* Section III */}
            <div>
              <h3 className="text-lg font-bold text-purple-800 mb-3">
                III. Travaux sur l'évaluation et les pratiques didactiques
              </h3>
              <p className="text-sm text-gray-600 mb-4 italic">
                Ces sources détaillent comment les biais se manifestent dans l'enseignement et comment les corriger.
              </p>
              <div className="space-y-4">
                <div className="border-l-4 border-purple-500 pl-4 py-2 bg-purple-50 rounded-r">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    • Pistes didactiques et évaluation (Articles e-novEPS) :
                  </h4>
                  <p className="text-sm text-gray-700 ml-4 mb-2">
                    <span className="font-medium">Francis Huot (2021)</span> préconise de revoir la méthodologie de construction des grilles d'évaluation pour les aligner sur le projet de formation et non sur un élève type masculin, afin de rétablir l'équité. Il conseille d'évaluer les savoirs fondamentaux acquis plutôt que les résultats bruts souvent associés aux techniques sportives masculines.
                  </p>
                  <p className="text-sm text-gray-700 ml-4">
                    <span className="font-medium">Mathieu Rolan (2021)</span> propose de s'éloigner des connotations stéréotypées des APSA en se focalisant sur les expériences à vivre (par exemple, prendre des risques affectifs en CA3 ou gagner en CA4) pour identifier des enjeux éducatifs "asexués".
                  </p>
                </div>

                <div className="border-l-4 border-purple-500 pl-4 py-2 bg-purple-50 rounded-r">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    • Hariti, H. et al. : Les conceptions de l'évaluation, la régulation des...
                  </h4>
                  <p className="text-sm text-gray-700 ml-4">
                    Ce document note que l'évaluation en EPS est le domaine où les élèves perçoivent le plus d'injustices et que l'EPS est une discipline à forte connotation masculine.
                  </p>
                </div>

                <div className="border-l-4 border-purple-500 pl-4 py-2 bg-purple-50 rounded-r">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    • Maufrais, Odile et Carminatti, Nathalie : Égalité filles/garçons en EPS
                  </h4>
                  <p className="text-sm text-gray-700 ml-4 mb-2">
                    Cette formation propose des pistes pour dépasser le curriculum masculiniste et pour lutter contre les inégalités dans l'occupation de l'espace (les garçons se mettent souvent au centre).
                  </p>
                  <p className="text-sm text-gray-700 ml-4">
                    Elle suggère d'utiliser la rotation stricte des rôles pour obliger les filles à être meneuses et à prendre des risques, et les garçons à s'engager dans la composition et la chorégraphie.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}