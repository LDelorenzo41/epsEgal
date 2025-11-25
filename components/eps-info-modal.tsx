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
import { Info } from "lucide-react"

export function EpsInfoModal() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors ml-2"
          aria-label="Plus d'informations sur EPS Égalité"
        >
          <Info className="h-4 w-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-blue-900">
            À propos d'EPS Égalité
          </DialogTitle>
          <DialogDescription className="sr-only">
            Présentation du projet EPS Égalité et analyse des stéréotypes de genre en EPS
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[70vh] pr-4">
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
                    <span className="font-semibold">Choix des APSA :</span> Le curriculum en EPS privilégie souvent un modèle de puissance et de performance à forte valence masculine. Les stéréotypes de sexe sont fondés sur des oppositions binaires hiérarchisées impliquant la supériorité du masculin sur le féminin. Par exemple, le handball, le football et le rugby sont connotés socialement comme masculins, tandis que la danse est perçue comme féminine.
                  </p>
                </div>
                <div className="border-l-4 border-blue-300 pl-3 py-1">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Curriculum Caché :</span> La persistance des stéréotypes est alimentée par un curriculum caché bâti autour d'une culture sportive plutôt masculine. Même lorsque des APSA potentiellement moins connotées sont introduites (comme l'escalade, le cirque ou le badminton), la motricité privilégiée reste souvent empreinte de valeurs masculines (force, vitesse, prise de risque).
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
                    <span className="font-semibold">Interactions Enseignant(e)-Élèves :</span> Les garçons bénéficient généralement d'une attention plus conséquente et d'interactions de meilleure qualité (loi des 2/3 - 1/3, ou 58% pour les garçons contre 42% pour les filles). Les garçons mettent en œuvre une "stratégie d'accaparement" de l'attention enseignante.
                  </p>
                </div>
                <div className="border-l-4 border-green-300 pl-3 py-1">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Discours et Attentes (Effet Pygmalion) :</span> Les enseignant(e)s ont des attentes stéréotypées envers les élèves (indiscipline des garçons / docilité des filles). Ces attentes peuvent fonctionner comme des "prophéties auto-réalisatrices". Le discours des enseignant(e)s peut être sexué : on décrit ce qui est « beau » pour les filles et ce qui est « risqué » pour les garçons.
                  </p>
                </div>
                <div className="border-l-4 border-green-300 pl-3 py-1">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Différenciation et Contenus d'Enseignement :</span> Certaines pratiques de différenciation naturalisent et renforcent les différences. Par exemple, la différenciation peut se traduire par une dégradation de la tâche initiale pour les filles ou par l'attribution de rôles stéréotypés : arbitrage pour les garçons et secrétariat pour les filles.
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
                    <span className="font-semibold">Écart de Notation :</span> Les résultats des filles en EPS sont systématiquement inférieurs à ceux des garçons. L'écart de note, qui persiste de manière significative, est d'environ 1,21 point en moyenne en faveur des garçons (e.g., 13,25 pour les filles contre 14,46 pour les garçons).
                  </p>
                </div>
                <div className="border-l-4 border-purple-300 pl-3 py-1">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Modèle d'Évaluation :</span> L'évaluation est restée fortement orientée vers la performance motrice maximale et la confrontation. Les épreuves athlétiques, où la performance physique prime, sont privilégiées pour la certification.
                  </p>
                </div>
                <div className="border-l-4 border-purple-300 pl-3 py-1">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Mesure des Capacités Innées :</span> L'évaluation a tendance à mesurer les capacités innées (déterminations génétiques, hormonales) plutôt que les apprentissages réels issus de l'enseignement. Par conséquent, l'EPS mesure le sexe des élèves et non les transformations issues des enseignements.
                  </p>
                </div>
                <div className="border-l-4 border-purple-300 pl-3 py-1">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">APSA Discriminantes :</span> Les activités les plus souvent évaluées, comme l'athlétisme, le volley-ball et le badminton, sont souvent les plus discriminantes, avec les plus grands écarts de notes en défaveur des filles.
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
                Les élèves eux-mêmes contribuent à la persistance des stéréotypes en intériorisant les rôles sociaux attendus, influencés par la socialisation et les attentes de l'école.
              </p>
              <div className="space-y-3 ml-4">
                <div className="border-l-4 border-orange-300 pl-3 py-1">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Déclin de l'Intérêt :</span> Les résultats des filles en EPS tendent à décroître à l'adolescence, car la socialisation les pousse à restreindre leur motricité pour correspondre aux critères de séduction, tandis que la virilité masculine est associée à la force et à la puissance.
                  </p>
                </div>
                <div className="border-l-4 border-orange-300 pl-3 py-1">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Pression de la Féminité :</span> Les filles utilisent la pratique physique pour répondre aux normes sociales du corps féminin. Elles craignent d'être jugées ou moquées et cherchent à maîtriser le regard masculin (male gaze) en évitant de transpirer ou en choisissant des vêtements amples.
                  </p>
                </div>
                <div className="border-l-4 border-orange-300 pl-3 py-1">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Options Comportementales :</span> Face à ce contexte, les filles ont le choix entre se conformer aux modèles masculins ou se distinguer en "sur-jouant la féminité", allant parfois jusqu'à simuler une quasi-« débilité motrice ». Elles s'estiment moins compétentes dans les matières qu'elles perçoivent comme "non faites pour elles".
                  </p>
                </div>
                <div className="border-l-4 border-orange-300 pl-3 py-1">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">"Loi des garçons" :</span> En milieu mixte, les filles doivent faire face à la « loi des garçons » qui dominent et contrôlent les jeux et l'espace, les réduisant parfois au rôle de spectatrices passives.
                  </p>
                </div>
              </div>
            </div>

            {/* Conclusion */}
            <div className="bg-gray-50 p-4 rounded-lg border">
              <p className="text-gray-700 text-sm leading-relaxed mb-4">
                Ces manifestations s'entremêlent pour maintenir une <span className="font-semibold">mixité inégale</span> en EPS, où l'égalité est souvent mise en œuvre sous condition de performance de la différence sexuée, loin du principe d'une « égalité sans condition ».
              </p>
              <p className="text-gray-700 text-sm leading-relaxed">
                Pour illustrer comment la persistance des stéréotypes opère, on peut considérer l'enseignement de l'EPS comme un <span className="font-semibold">terrain de jeu penché</span>. Si les règles (les programmes officiels) affirment l'égalité, l'inclinaison historique et culturelle du terrain, centrée sur les APSA masculines, fait que le ballon roule naturellement vers le camp des garçons (la réussite et l'attention). Les efforts pédagogiques visant à compenser cette pente (comme les barèmes différenciés) s'avèrent insuffisants car ils tentent de corriger le résultat plutôt que de redresser le terrain lui-même (le curriculum et les pratiques d'enseignement).
              </p>
            </div>

            {/* Sources */}
            <div className="border-t pt-6">
              <h4 className="text-md font-bold text-gray-800 mb-4">Sources</h4>
              <ol className="space-y-2 text-xs text-gray-600 italic list-decimal list-inside">
                <li>Analyse didactique des pratiques d'enseignement en EPS selon le genre en contexte d'éducation prioritaire : des pistes pour tendre vers davantage d'égalité filles et garçons (Claire Debars)</li>
                <li>Les inégalités de réussite en EPS entre filles et garçons : déterminisme biologique ou fabrication scolaire ? (Revue française de pédagogie, ResearchGate, Cairn)</li>
                <li>Mixité, égalité et pratiques en éducation physique et sportive</li>
                <li>Rapport d'Expertise : L'Égalité Filles-Garçons en Éducation Physique et Sportive (EPS) en France : Diagnostic, Enjeux Didactiques et Stratégies de Transformation</li>
                <li>La vigilance des enseignant-e-s d'éducation physique et sportive relative à l'égalité des filles et des garçons</li>
                <li>Les conceptions de l'évaluation, la régulation des ... (ResearchGate)</li>
                <li>Évaluer les filles en EPS (Francis Huot)</li>
                <li>Désapprendre les stéréotypes en EPS (Mathieu Rolan)</li>
                <li>Égalité filles/garçons en EPS (Odile Maufrais et Nathalie Carminatti)</li>
                <li>Mixité sexuée et EPS (Mathieu Jean)</li>
                <li>Agir pour l'égalité filles-garçons en établissement public local d'enseignement (EPLE) - collection académique (2024-2025)</li>
                <li>Filles et garçons sur le chemin de l'égalité, de l'école à l'enseignement supérieur (DEPP)</li>
                <li>Formation à l'égalité filles-garçons : Faire des personnels enseignants et d'éducation les moteurs de l'apprentissage et de l'expérience de l'égalité</li>
                <li>Projet de programmes d'éducation physique et sportive du cycle 4</li>
                <li>Les inégalités de réussite en EPS entre filles et garçons (Cécile Vigneron, Cairn.info)</li>
                <li>L'évaluation en EPS : entre légitimité disciplinaire et défis culturels (1959-2009) - Cairn</li>
                <li>Égalité entre les filles et les garçons - Ministère de l'Éducation nationale</li>
                <li>Rapport « Formation à l'égalité filles-garçons » | HCE</li>
                <li>Dossier pédagogique Les femmes et le sport (France Archives)</li>
                <li>Document Ministère de l'Éducation nationale</li>
              </ol>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}