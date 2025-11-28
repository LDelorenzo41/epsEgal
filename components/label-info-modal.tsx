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
import { Info, Award, CheckCircle2, AlertTriangle, XCircle, School, GraduationCap } from "lucide-react"

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
                Le <span className="font-semibold text-blue-800">Label Égalité</span> évalue le niveau d'équilibre entre les filles et les garçons dans les pratiques d'EPS de votre établissement. Il est calculé sur 100 points à partir de 4 critères pondérés.
              </p>
            </div>

            {/* Type d'établissement */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Selon votre type d'établissement</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
                  <div className="flex items-center gap-2 mb-3">
                    <School className="h-5 w-5 text-blue-600" />
                    <h4 className="font-bold text-blue-800">Collège</h4>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• <strong>4 CP</strong> prises en compte (CP1 à CP4)</li>
                    <li>• <strong>CP5 exclue</strong> du calcul</li>
                    <li>• Objectif : couvrir les 4 CP</li>
                  </ul>
                </div>
                
                <div className="border-2 border-purple-200 rounded-lg p-4 bg-purple-50">
                  <div className="flex items-center gap-2 mb-3">
                    <GraduationCap className="h-5 w-5 text-purple-600" />
                    <h4 className="font-bold text-purple-800">Lycée (GT / Pro)</h4>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• <strong>5 CP</strong> prises en compte (CP1 à CP5)</li>
                    <li>• <strong>CP5 incluse</strong> dans le calcul</li>
                    <li>• Objectif : couvrir les 5 CP</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Critères de calcul */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Les 4 critères de calcul</h3>
              
              <div className="space-y-4">
                {/* Critère 1 - Écart F/G */}
                <div className="border-l-4 border-blue-500 pl-4 py-2 bg-white rounded-r-lg shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-blue-800">1. Écart moyen Filles/Garçons</h4>
                    <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">40%</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    Mesure la différence absolue moyenne entre les notes des filles et des garçons.
                  </p>
                  <div className="bg-gray-50 rounded p-3 text-sm">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-green-100 rounded p-2">
                        <span className="font-bold text-green-700">&lt; 0.5 pt</span>
                        <p className="text-xs text-green-600">100 pts</p>
                      </div>
                      <div className="bg-yellow-100 rounded p-2">
                        <span className="font-bold text-yellow-700">1 pt</span>
                        <p className="text-xs text-yellow-600">50 pts</p>
                      </div>
                      <div className="bg-orange-100 rounded p-2">
                        <span className="font-bold text-orange-700">&gt; 2 pts</span>
                        <p className="text-xs text-orange-600">0 pts</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Critère 2 - Couverture CP */}
                <div className="border-l-4 border-purple-500 pl-4 py-2 bg-white rounded-r-lg shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-purple-800">2. Couverture des Compétences Propres</h4>
                    <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2 py-1 rounded">30%</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    Évalue la diversité des CP enseignées par rapport au nombre attendu pour votre établissement.
                  </p>
                  <div className="bg-gray-50 rounded p-3 text-sm">
                    <ul className="space-y-1 text-gray-600">
                      <li><span className="font-medium">CP1</span> - Performance motrice mesurable</li>
                      <li><span className="font-medium">CP2</span> - Adaptation à l'environnement</li>
                      <li><span className="font-medium">CP3</span> - Prestation artistique/acrobatique</li>
                      <li><span className="font-medium">CP4</span> - Affrontement individuel/collectif</li>
                      <li><span className="font-medium">CP5</span> - Entretien de soi <span className="text-purple-600 text-xs">(Lycées uniquement)</span></li>
                    </ul>
                  </div>
                </div>

                {/* Critère 3 - Équilibre CP */}
                <div className="border-l-4 border-green-500 pl-4 py-2 bg-white rounded-r-lg shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-green-800">3. Équilibre des CP</h4>
                    <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">20%</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    Mesure la répartition équilibrée des <strong>enseignements</strong> entre les différentes CP. 
                    Un enseignement = une APSA enseignée à une classe.
                  </p>
                  <div className="bg-gray-50 rounded p-3 text-sm text-gray-600">
                    <p className="mb-2"><span className="font-medium">Objectif :</span></p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Proposer des activités dans <strong>toutes les CP</strong></li>
                      <li>Avoir un <strong>volume d'enseignement équilibré</strong> par CP</li>
                    </ul>
                    <div className="mt-3 p-2 bg-white rounded border">
                      <p className="text-xs text-gray-500 mb-2">Exemple de calcul :</p>
                      <ul className="text-xs space-y-1">
                        <li>• CP1 : Natation (3 classes) + Athlétisme (2 classes) = <strong>5 enseignements</strong></li>
                        <li>• CP4 : Badminton (1 classe) = <strong>1 enseignement</strong></li>
                        <li className="text-amber-600">→ Déséquilibre : CP1 est 5× plus enseignée que CP4</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Critère 4 - Quiz */}
                <div className="border-l-4 border-violet-500 pl-4 py-2 bg-white rounded-r-lg shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-violet-800">4. Quiz de vigilance pédagogique</h4>
                    <span className="bg-violet-100 text-violet-800 text-xs font-bold px-2 py-1 rounded">10%</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    La moyenne des scores des professeurs au quiz de vigilance égalité. Basé sur les réponses des enseignants ayant complété le quiz.
                  </p>
                  <div className="bg-gray-50 rounded p-3 text-sm text-gray-600">
                    <p><span className="font-medium">Score max :</span> 15 points au quiz = 100% de contribution</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Formule */}
            <div className="bg-gray-800 text-white rounded-lg p-4">
              <h3 className="font-bold mb-2">Formule de calcul</h3>
              <p className="font-mono text-sm">
                Score = (Écart F/G × 0.40) + (Couverture CP × 0.30) + (Équilibre CP × 0.20) + (Quiz × 0.10)
              </p>
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
                      <div className="flex items-center gap-3">
                        <h4 className="font-bold text-green-800 text-lg">Équilibré</h4>
                        <span className="bg-green-200 text-green-800 text-sm font-bold px-3 py-1 rounded-full">75 - 100 pts</span>
                      </div>
                      <p className="text-sm text-green-700 mt-1">
                        Félicitations ! Votre établissement présente un excellent équilibre entre filles et garçons.
                      </p>
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
                      <div className="flex items-center gap-3">
                        <h4 className="font-bold text-yellow-800 text-lg">En progrès</h4>
                        <span className="bg-yellow-200 text-yellow-800 text-sm font-bold px-3 py-1 rounded-full">50 - 74 pts</span>
                      </div>
                      <p className="text-sm text-yellow-700 mt-1">
                        Votre établissement progresse vers l'égalité. Continuez vos efforts !
                      </p>
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
                      <div className="flex items-center gap-3">
                        <h4 className="font-bold text-orange-800 text-lg">À renforcer</h4>
                        <span className="bg-orange-200 text-orange-800 text-sm font-bold px-3 py-1 rounded-full">0 - 49 pts</span>
                      </div>
                      <p className="text-sm text-orange-700 mt-1">
                        Des efforts sont nécessaires pour améliorer l'égalité F/G dans votre établissement.
                      </p>
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
                  <span>Diversifiez les APSA pour couvrir toutes les CP de votre niveau</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600">2.</span>
                  <span>Équilibrez le volume d'enseignement entre les CP (évitez de sur-représenter une CP)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600">3.</span>
                  <span>Adaptez vos évaluations pour valoriser les apprentissages plutôt que la performance brute</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600">4.</span>
                  <span>Invitez tous les professeurs à compléter le quiz de vigilance</span>
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
