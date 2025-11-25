// @ts-nocheck
"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Info, Award, CheckCircle2, AlertTriangle, XCircle } from "lucide-react"

export function LabelInfoModal() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors ml-2"
          aria-label="Informations sur le calcul du Label Égalité"
        >
          <Info className="h-4 w-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-blue-900 flex items-center gap-2">
            <Award className="h-5 w-5" />
            Comment est calculé le Label Égalité ?
          </DialogTitle>
          <DialogDescription className="sr-only">
            Explication du calcul des points et des critères d'attribution du Label Égalité
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Introduction */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-gray-700 leading-relaxed">
                Le <span className="font-semibold text-blue-800">Label Égalité</span> évalue le niveau d'équilibre entre les filles et les garçons dans les pratiques d'EPS de votre établissement. Il est calculé à partir de plusieurs indicateurs objectifs.
              </p>
            </div>

            {/* Critères de calcul */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Critères de calcul (90% du score)</h3>
              
              <div className="space-y-4">
                {/* Critère 1 */}
                <div className="border-l-4 border-blue-500 pl-4 py-2 bg-white rounded-r-lg shadow-sm">
                  <h4 className="font-semibold text-blue-800 mb-2">1. Écart moyen Filles/Garçons</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    Mesure la différence absolue moyenne entre les notes des filles et des garçons sur l'ensemble des activités.
                  </p>
                  <div className="bg-gray-50 rounded p-3 text-sm">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-green-100 rounded p-2">
                        <span className="font-bold text-green-700">&lt; 0.5 pt</span>
                        <p className="text-xs text-green-600">Excellent</p>
                      </div>
                      <div className="bg-yellow-100 rounded p-2">
                        <span className="font-bold text-yellow-700">0.5 - 1 pt</span>
                        <p className="text-xs text-yellow-600">Acceptable</p>
                      </div>
                      <div className="bg-orange-100 rounded p-2">
                        <span className="font-bold text-orange-700">&gt; 1 pt</span>
                        <p className="text-xs text-orange-600">À améliorer</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Critère 2 */}
                <div className="border-l-4 border-purple-500 pl-4 py-2 bg-white rounded-r-lg shadow-sm">
                  <h4 className="font-semibold text-purple-800 mb-2">2. Couverture des Compétences Propres</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    Évalue la diversité des APSA enseignées à travers les 4 CP du collège (CP1 à CP4). La CP5 est exclue du calcul car elle concerne principalement le lycée.
                  </p>
                  <div className="bg-gray-50 rounded p-3 text-sm">
                    <ul className="space-y-1 text-gray-600">
                      <li><span className="font-medium">CP1</span> - Performance motrice mesurable</li>
                      <li><span className="font-medium">CP2</span> - Adaptation à l'environnement</li>
                      <li><span className="font-medium">CP3</span> - Prestation artistique/acrobatique</li>
                      <li><span className="font-medium">CP4</span> - Affrontement individuel/collectif</li>
                    </ul>
                  </div>
                </div>

                {/* Critère 3 - Quiz */}
                <div className="border-l-4 border-violet-500 pl-4 py-2 bg-white rounded-r-lg shadow-sm">
                  <h4 className="font-semibold text-violet-800 mb-2">3. Quiz de vigilance pédagogique (10% du score)</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    La moyenne des scores des professeurs au quiz de vigilance égalité contribue à 10% du score global du Label.
                  </p>
                  <div className="bg-gray-50 rounded p-3 text-sm">
                    <p className="text-gray-600">
                      <span className="font-medium">Formule :</span> Score Label = (Indicateurs × 0.9) + (Quiz moyen × 0.1)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Les 3 Labels */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Les 3 niveaux de Label</h3>
              
              <div className="space-y-4">
                {/* Label Équilibré */}
                <div className="border-2 border-green-300 rounded-lg p-4 bg-green-50">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-200 rounded-full">
                      <CheckCircle2 className="h-6 w-6 text-green-700" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-green-800 text-lg">Équilibré</h4>
                      <p className="text-sm text-green-700 mt-1 mb-3">
                        Félicitations ! Votre établissement présente un excellent équilibre.
                      </p>
                      <div className="bg-white rounded p-3 text-sm">
                        <p className="font-medium text-gray-800 mb-2">Conditions requises :</p>
                        <ul className="space-y-1 text-gray-600">
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            Écart moyen F/G inférieur à 0.5 point
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            4 CP sur 4 couvertes (CP1 à CP4)
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Label En progrès */}
                <div className="border-2 border-yellow-300 rounded-lg p-4 bg-yellow-50">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-yellow-200 rounded-full">
                      <AlertTriangle className="h-6 w-6 text-yellow-700" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-yellow-800 text-lg">En progrès</h4>
                      <p className="text-sm text-yellow-700 mt-1 mb-3">
                        Votre établissement progresse vers l'égalité. Continuez vos efforts !
                      </p>
                      <div className="bg-white rounded p-3 text-sm">
                        <p className="font-medium text-gray-800 mb-2">Conditions (au moins une) :</p>
                        <ul className="space-y-1 text-gray-600">
                          <li className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            Au moins 3 CP couvertes sur 4
                          </li>
                          <li className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            OU Écart moyen F/G inférieur à 1 point
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Label À renforcer */}
                <div className="border-2 border-orange-300 rounded-lg p-4 bg-orange-50">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-orange-200 rounded-full">
                      <XCircle className="h-6 w-6 text-orange-700" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-orange-800 text-lg">À renforcer</h4>
                      <p className="text-sm text-orange-700 mt-1 mb-3">
                        Des efforts sont nécessaires pour améliorer l'égalité F/G.
                      </p>
                      <div className="bg-white rounded p-3 text-sm">
                        <p className="font-medium text-gray-800 mb-2">Situation :</p>
                        <ul className="space-y-1 text-gray-600">
                          <li className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-orange-600" />
                            Moins de 3 CP couvertes
                          </li>
                          <li className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-orange-600" />
                            ET Écart moyen F/G supérieur ou égal à 1 point
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Conseils */}
            <div className="bg-gray-100 rounded-lg p-4">
              <h3 className="font-bold text-gray-900 mb-3">Comment améliorer votre Label ?</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600">1.</span>
                  <span>Diversifiez les APSA pour couvrir les 4 compétences propres du collège</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600">2.</span>
                  <span>Adaptez vos évaluations pour valoriser les apprentissages plutôt que la performance brute</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600">3.</span>
                  <span>Utilisez des formes de pratique scolaire (FPS) inclusives</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600">4.</span>
                  <span>Complétez le quiz de vigilance pour sensibiliser l'équipe</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600">5.</span>
                  <span>Analysez les écarts par CP pour identifier les axes d'amélioration</span>
                </li>
              </ul>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}