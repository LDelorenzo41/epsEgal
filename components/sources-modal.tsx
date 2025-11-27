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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Info } from "lucide-react"

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
            <span className="font-semibold text-sm">Ressources & Informations</span>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-blue-900">
            Ressources pédagogiques
          </DialogTitle>
          <DialogDescription>
            Informations sur l'égalité filles-garçons en EPS et sources bibliographiques
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              Comprendre les enjeux
            </TabsTrigger>
            <TabsTrigger value="sources" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Sources bibliographiques
            </TabsTrigger>
          </TabsList>

          {/* ONGLET INFORMATIONS */}
          <TabsContent value="info">
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-6">
                {/* Introduction */}
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    En EPS, les choix d'activités et les résultats au baccalauréat révèlent encore des écarts entre filles et garçons selon les compétences propres mobilisées. Les données montrent notamment une surreprésentation masculine dans les activités d'affrontement (CP4) et une meilleure réussite relative des filles dans les activités à visée expressive (CP3). Ces tendances ne traduisent pas des capacités naturelles différentes, mais renvoient souvent à des effets de socialisation, de stéréotypes persistants et à une offre d'APSA parfois peu questionnée.
                  </p>
                  <p>
                    <span className="font-semibold text-blue-800">EPS Égalité</span> a pour ambition de rendre ces déséquilibres visibles, de les objectiver par des données claires et d'accompagner les équipes dans une réflexion pédagogique éclairée, afin de construire une EPS plus juste, plus inclusive et réellement émancipatrice pour toutes et tous.
                  </p>
                </div>

                {/* Question principale */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-bold text-blue-900 mb-4">
                    Comment les stéréotypes de genre se manifestent et persistent dans l'enseignement de l'EPS ?
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Les stéréotypes de genre se manifestent et persistent dans l'enseignement de l'Éducation Physique et Sportive (EPS) par une combinaison complexe de facteurs didactiques, pédagogiques, culturels et évaluatifs, transformant la discipline en un lieu de production et de reproduction d'inégalités scolaires mesurables. L'EPS, discipline du corps, est particulièrement sensible aux injonctions de genre qui y sont immédiatement palpables.
                  </p>
                </div>

                {/* Section 1 */}
                <div>
                  <h4 className="text-md font-bold text-blue-800 mb-3 flex items-center gap-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                    La domination d'une culture et d'un modèle masculin
                  </h4>
                  <p className="text-gray-700 text-sm mb-3">
                    L'enseignement de l'EPS est historiquement et culturellement attaché aux pratiques sportives compétitives. La culture transmise en EPS a une forte connivence avec la culture masculine, ce qui contribue à la domination des dimensions masculines.
                  </p>
                  <div className="space-y-3 ml-4">
                    <div className="border-l-4 border-blue-300 pl-3 py-1">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Choix des APSA :</span> Le curriculum en EPS privilégie souvent un modèle de puissance et de performance à forte valence masculine. Les stéréotypes de sexe sont fondés sur des oppositions binaires hiérarchisées impliquant la supériorité du masculin sur le féminin.
                      </p>
                    </div>
                    <div className="border-l-4 border-blue-300 pl-3 py-1">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Curriculum Caché :</span> La persistance des stéréotypes est alimentée par un curriculum caché bâti autour d'une culture sportive plutôt masculine. Même lorsque des APSA potentiellement moins connotées sont introduites, la motricité privilégiée reste souvent empreinte de valeurs masculines (force, vitesse, prise de risque).
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 2 */}
                <div>
                  <h4 className="text-md font-bold text-green-800 mb-3 flex items-center gap-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                    Les pratiques pédagogiques différenciées des enseignant(e)s
                  </h4>
                  <p className="text-gray-700 text-sm mb-3">
                    Les enseignant(e)s, bien que majoritairement favorables à la mixité, sont sous l'influence des stéréotypes et participent à la fabrication scolaire des inégalités.
                  </p>
                  <div className="space-y-3 ml-4">
                    <div className="border-l-4 border-green-300 pl-3 py-1">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Interactions Enseignant(e)-Élèves :</span> Les garçons bénéficient généralement d'une attention plus conséquente et d'interactions de meilleure qualité (loi des 2/3 - 1/3, ou 58% pour les garçons contre 42% pour les filles).
                      </p>
                    </div>
                    <div className="border-l-4 border-green-300 pl-3 py-1">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Discours et Attentes (Effet Pygmalion) :</span> Les enseignant(e)s ont des attentes stéréotypées envers les élèves. Ces attentes peuvent fonctionner comme des "prophéties auto-réalisatrices".
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 3 */}
                <div>
                  <h4 className="text-md font-bold text-purple-800 mb-3 flex items-center gap-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                    Les biais dans l'évaluation
                  </h4>
                  <p className="text-gray-700 text-sm mb-3">
                    L'évaluation en EPS est le domaine où les élèves perçoivent le plus d'injustices et constitue un facteur structurel majeur des inégalités de réussite.
                  </p>
                  <div className="space-y-3 ml-4">
                    <div className="border-l-4 border-purple-300 pl-3 py-1">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Écart de Notation :</span> Les résultats des filles en EPS sont systématiquement inférieurs à ceux des garçons. L'écart de note est d'environ 1,21 point en moyenne en faveur des garçons.
                      </p>
                    </div>
                    <div className="border-l-4 border-purple-300 pl-3 py-1">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Mesure des Capacités Innées :</span> L'évaluation a tendance à mesurer les capacités innées plutôt que les apprentissages réels issus de l'enseignement.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 4 */}
                <div>
                  <h4 className="text-md font-bold text-orange-800 mb-3 flex items-center gap-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                    L'intériorisation par les élèves et les comportements sexués
                  </h4>
                  <p className="text-gray-700 text-sm mb-3">
                    Les élèves eux-mêmes contribuent à la persistance des stéréotypes en intériorisant les rôles sociaux attendus.
                  </p>
                  <div className="space-y-3 ml-4">
                    <div className="border-l-4 border-orange-300 pl-3 py-1">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Déclin de l'Intérêt :</span> Les résultats des filles en EPS tendent à décroître à l'adolescence, car la socialisation les pousse à restreindre leur motricité.
                      </p>
                    </div>
                    <div className="border-l-4 border-orange-300 pl-3 py-1">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">"Loi des garçons" :</span> En milieu mixte, les filles doivent faire face à la « loi des garçons » qui dominent et contrôlent les jeux et l'espace.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Conclusion */}
                <div className="bg-gray-100 rounded-lg p-4">
                  <p className="text-gray-700 text-sm leading-relaxed mb-3">
                    Ces manifestations s'entremêlent pour maintenir une <span className="font-semibold">mixité inégale</span> en EPS, où l'égalité est souvent mise en œuvre sous condition de performance de la différence sexuée, loin du principe d'une « égalité sans condition ».
                  </p>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Pour illustrer comment la persistance des stéréotypes opère, on peut considérer l'enseignement de l'EPS comme un <span className="font-semibold">terrain de jeu penché</span>. Si les règles (les programmes officiels) affirment l'égalité, l'inclinaison historique et culturelle du terrain, centrée sur les APSA masculines, fait que le ballon roule naturellement vers le camp des garçons (la réussite et l'attention).
                  </p>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* ONGLET SOURCES */}
          <TabsContent value="sources">
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
                        Cette étude explore la faible vigilance des enseignants relative à l'égalité des sexes et note que les indices perceptifs des enseignants sont différenciés.
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
                        <span className="font-medium">Francis Huot (2021)</span> préconise de revoir la méthodologie de construction des grilles d'évaluation pour les aligner sur le projet de formation et non sur un élève type masculin, afin de rétablir l'équité.
                      </p>
                      <p className="text-sm text-gray-700 ml-4">
                        <span className="font-medium">Mathieu Rolan (2021)</span> propose de s'éloigner des connotations stéréotypées des APSA en se focalisant sur les expériences à vivre pour identifier des enjeux éducatifs "asexués".
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
                      <p className="text-sm text-gray-700 ml-4">
                        Cette formation propose des pistes pour dépasser le curriculum masculiniste et pour lutter contre les inégalités dans l'occupation de l'espace.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sources résumées */}
                <div className="border-t pt-6">
                  <h4 className="text-md font-bold text-gray-800 mb-4">Autres sources consultées</h4>
                  <ol className="space-y-2 text-xs text-gray-600 italic list-decimal list-inside">
                    <li>Analyse didactique des pratiques d'enseignement en EPS selon le genre (Claire Debars)</li>
                    <li>Les inégalités de réussite en EPS entre filles et garçons (Revue française de pédagogie)</li>
                    <li>Mixité, égalité et pratiques en éducation physique et sportive</li>
                    <li>Rapport d'Expertise : L'Égalité Filles-Garçons en EPS en France</li>
                    <li>La vigilance des enseignant-e-s d'EPS relative à l'égalité</li>
                    <li>Les conceptions de l'évaluation (ResearchGate)</li>
                    <li>Évaluer les filles en EPS (Francis Huot)</li>
                    <li>Désapprendre les stéréotypes en EPS (Mathieu Rolan)</li>
                    <li>Égalité filles/garçons en EPS (Maufrais et Carminatti)</li>
                    <li>Mixité sexuée et EPS (Mathieu Jean)</li>
                    <li>Agir pour l'égalité filles-garçons en EPLE (2024-2025)</li>
                    <li>Filles et garçons sur le chemin de l'égalité (DEPP)</li>
                    <li>Formation à l'égalité filles-garçons (HCE)</li>
                    <li>Projet de programmes d'EPS du cycle 4</li>
                    <li>Les inégalités de réussite en EPS (Cécile Vigneron, Cairn.info)</li>
                    <li>L'évaluation en EPS : entre légitimité disciplinaire et défis culturels</li>
                    <li>Égalité entre les filles et les garçons - Ministère de l'Éducation nationale</li>
                  </ol>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}