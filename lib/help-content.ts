// Contenu de l'aide contextuelle (vignette "Aide"), par page de l'application.
// Pour modifier un texte, il suffit de l'éditer ici.

export type HelpSection = {
  title: string
  text?: string
  steps?: string[] // liste numérotée
  points?: string[] // liste à puces
  tip?: string // encadré "Bon à savoir"
}

export type HelpCategory = {
  id: string
  label: string
  sections: HelpSection[]
}

export type PageHelp = {
  title: string
  intro: string
  categories: HelpCategory[]
}

const HELP_CONTENT: Record<string, PageHelp> = {
  "/dashboard": {
    title: "Tableau de bord",
    intro:
      "Le résumé de vos données et de celles de l'établissement, avec les ressources et des raccourcis vers les autres pages.",
    categories: [
      {
        id: "overview",
        label: "Vue d'ensemble",
        sections: [
          {
            title: "Par où commencer ?",
            steps: [
              "Établissement : créez les niveaux, les classes et les APSA (une seule fois, pour toute l'équipe).",
              "Page Perso : ajoutez vos classes, puis vos activités avec les moyennes Filles et Garçons.",
              "Statistiques : consultez vos écarts et le Label Égalité de l'établissement.",
            ],
          },
          {
            title: "Le code de l'établissement",
            text: "Le bandeau bleu affiche le nom de l'établissement, le nombre de professeurs inscrits (sur le maximum autorisé) et le code de l'établissement.",
            tip: "Transmettez ce code à vos collègues : ils le saisiront à l'inscription pour rejoindre votre établissement.",
          },
          {
            title: "Accès rapide",
            text: "Les cartes en bas de page mènent directement aux pages Établissement, Page Perso, Statistiques perso et Statistiques établissement.",
          },
        ],
      },
      {
        id: "my-stats",
        label: "Mes statistiques",
        sections: [
          {
            title: "Les 4 compteurs",
            points: [
              "Mes classes : les classes que vous vous êtes attribuées dans la Page Perso.",
              "Mes activités : les activités que vous avez saisies, toutes années confondues.",
              "Niveaux établissement : les niveaux créés dans la page Établissement.",
              "Classes établissement : le nombre total de classes de l'établissement.",
            ],
            tip: "Ces chiffres évoluent avec vos saisies dans la Page Perso (classes, activités) et dans la page Établissement (niveaux, classes).",
          },
        ],
      },
      {
        id: "school-stats",
        label: "Établissement",
        sections: [
          {
            title: "Les 4 indicateurs",
            points: [
              "APSA configurées : les activités créées dans Établissement > APSA.",
              "Professeurs : le nombre de professeurs inscrits dans l'établissement.",
              "Écart moyen F/G : la moyenne des écarts entre moyennes Filles et Garçons, en points, sur toutes les activités notées (toutes années confondues).",
              "Label égalité : un repère rapide basé sur cet écart moyen (moins de 0,5 : Équilibré ; moins de 1 : En progrès ; au-delà : À renforcer).",
            ],
            tip: "Le Label Égalité complet, calculé sur 100 points pour une année scolaire, se trouve dans Statistiques > Établissement.",
          },
        ],
      },
      {
        id: "resources",
        label: "Ressources & quiz",
        sections: [
          {
            title: "Ressources pédagogiques",
            points: [
              "Podcast : un épisode audio sur l'égalité filles-garçons en EPS (il s'ouvre dans un nouvel onglet).",
              "Ressources & Informations : des repères sur l'égalité filles-garçons en EPS et les sources bibliographiques.",
            ],
          },
          {
            title: "Quiz de vigilance",
            text: "5 questions pour faire le point sur vos pratiques. Le score, sur 15 points, vous situe sur 4 niveaux de vigilance : absente, réactive, réflexive, systémique.",
            tip: "Le quiz se complète une seule fois par année scolaire. La moyenne des professeurs de l'établissement compte pour 10 % du Label Égalité.",
          },
        ],
      },
    ],
  },

  "/etablissement": {
    title: "Établissement",
    intro:
      "La configuration commune à toute l'équipe EPS : niveaux, classes et APSA. Ce que vous saisissez ici est partagé avec vos collègues.",
    categories: [
      {
        id: "info",
        label: "Informations",
        sections: [
          {
            title: "Ce que contient cet onglet",
            points: [
              "Le nom et le type de l'établissement (collège, lycée général et technologique, lycée professionnel).",
              "Le code établissement, à transmettre à vos collègues pour qu'ils rejoignent l'établissement à l'inscription.",
              "Le nombre maximum de professeurs pouvant s'inscrire.",
            ],
          },
          {
            title: "Le type d'établissement compte",
            text: "Au collège, le Label Égalité prend en compte les CP1 à CP4 (la CP5 est exclue). Au lycée, les CP1 à CP5 sont prises en compte.",
          },
        ],
      },
      {
        id: "levels",
        label: "Niveaux",
        sections: [
          {
            title: "Ajouter un niveau",
            steps: [
              "Cliquez sur « Ajouter un niveau ».",
              "Saisissez le nom (ex : 6e, 5e, 2nde) et, si vous le souhaitez, le nombre de classes.",
              "Cliquez sur « Ajouter ».",
            ],
            tip: "Les niveaux doivent exister avant de pouvoir créer les classes.",
          },
          {
            title: "Modifier ou supprimer",
            text: "Le crayon permet de modifier un niveau, la corbeille de le supprimer.",
            tip: "Attention : supprimer un niveau supprime aussi ses classes et les activités qui y sont rattachées.",
          },
        ],
      },
      {
        id: "classes",
        label: "Classes",
        sections: [
          {
            title: "Ajouter une classe",
            steps: [
              "Cliquez sur « Ajouter une classe » (au moins un niveau doit exister).",
              "Choisissez le niveau et saisissez le nom de la classe (ex : 6e1, 3eC).",
              "Indiquez l'effectif total, le nombre de filles et le nombre de garçons.",
              "Cliquez sur « Ajouter ».",
            ],
          },
          {
            title: "Pourquoi saisir les effectifs ?",
            text: "Les effectifs filles et garçons servent à l'analyse « Influence de la répartition Filles/Garçons » des statistiques établissement (classes à majorité de filles, équilibrées ou à majorité de garçons).",
          },
          {
            title: "Modifier ou supprimer",
            text: "Le crayon permet de modifier une classe, la corbeille de la supprimer.",
            tip: "Attention : supprimer une classe supprime aussi les activités saisies pour cette classe.",
          },
        ],
      },
      {
        id: "apsa",
        label: "APSA",
        sections: [
          {
            title: "Ajouter une APSA",
            steps: [
              "Cliquez sur « Ajouter une APSA ».",
              "Choisissez la Compétence Propre (CP) de l'activité.",
              "Saisissez le nom de l'APSA (ex : Badminton, Demi-fond) et, si besoin, une description.",
              "Cliquez sur « Ajouter ».",
            ],
          },
          {
            title: "Associer des classes pour l'année",
            steps: [
              "Choisissez l'année scolaire en haut de l'onglet (l'année en cours est proposée par défaut).",
              "Cliquez sur l'icône des personnes à côté de l'APSA.",
              "Sélectionnez les classes qui pratiquent cette APSA cette année, puis cliquez sur « Enregistrer ».",
            ],
            tip: "Les APSA restent d'une année sur l'autre, mais les classes associées sont propres à chaque année : pensez à refaire les associations à la rentrée.",
          },
          {
            title: "À quoi servent les associations ?",
            text: "Chaque APSA associée à une classe compte comme un enseignement de sa CP. Ces enseignements alimentent le « Poids des CP » et le critère « Équilibre des CP » (20 % du Label Égalité).",
          },
          {
            title: "Supprimer une APSA",
            text: "La corbeille supprime l'APSA, ainsi que les activités et les associations de classes qui y sont liées.",
          },
        ],
      },
    ],
  },

  "/perso": {
    title: "Page Perso",
    intro:
      "Votre espace personnel : les classes dont vous avez la charge et votre programmation, avec les moyennes Filles et Garçons.",
    categories: [
      {
        id: "my-classes",
        label: "Mes classes",
        sections: [
          {
            title: "Ajouter une classe",
            steps: [
              "Cliquez sur « Ajouter une classe ».",
              "Choisissez la classe dans la liste : ce sont les classes créées dans Établissement > Classes.",
              "Cliquez sur « Ajouter ».",
            ],
            tip: "Une classe n'apparaît pas dans la liste ? Elle n'a pas encore été créée dans Établissement > Classes, ou elle vous est déjà attribuée.",
          },
          {
            title: "Retirer une classe",
            text: "La corbeille retire la classe de votre liste.",
            tip: "Attention : les activités que vous aviez saisies pour cette classe sont supprimées avec elle.",
          },
        ],
      },
      {
        id: "my-activities",
        label: "Mes activités",
        sections: [
          {
            title: "Ajouter une activité",
            steps: [
              "Cliquez sur « Ajouter une activité » (au moins une classe doit vous être attribuée).",
              "Choisissez la classe et l'APSA (sa CP est indiquée entre parenthèses).",
              "Choisissez la période (trimestre ou semestre) et l'année scolaire : l'année en cours est proposée par défaut.",
              "Saisissez les moyennes sur 20 : générale, Filles et Garçons.",
              "Cliquez sur « Ajouter ».",
            ],
          },
          {
            title: "Programmer d'abord, noter ensuite",
            text: "Vous pouvez enregistrer une activité sans moyennes pour construire votre programmation, puis compléter les moyennes plus tard avec le crayon.",
            tip: "Seules les activités qui ont une moyenne Filles et une moyenne Garçons sont prises en compte dans les statistiques.",
          },
          {
            title: "Modifier ou supprimer",
            text: "Chaque activité affiche l'APSA, sa CP, la classe, la période et l'année scolaire. Le crayon permet de la corriger (par exemple changer l'année), la corbeille de la supprimer.",
          },
        ],
      },
    ],
  },

  "/stats/perso": {
    title: "Statistiques personnelles",
    intro:
      "L'analyse de vos propres données pour l'année scolaire choisie en haut de page (CP1 à CP4).",
    categories: [
      {
        id: "indicators",
        label: "Indicateurs",
        sections: [
          {
            title: "Choisir l'année",
            text: "Le sélecteur « Année scolaire » affiche les données d'une seule année. L'année en cours est sélectionnée par défaut.",
          },
          {
            title: "Les 3 indicateurs",
            points: [
              "Activités analysées : vos activités qui ont une moyenne Filles et une moyenne Garçons (CP5 exclue).",
              "Écart moyen F/G : la moyenne des écarts entre moyennes Filles et Garçons, en points, quel que soit le sens de l'écart.",
              "Couverture CP : le nombre de CP travaillées, sur 4 (CP1 à CP4).",
            ],
            tip: "Aucune donnée ? Vérifiez dans la Page Perso que vos activités sont enregistrées pour cette année et qu'elles ont des moyennes Filles et Garçons.",
          },
        ],
      },
      {
        id: "label",
        label: "Mon label",
        sections: [
          {
            title: "Comment est calculé votre label ?",
            points: [
              "Équilibré : les 4 CP sont couvertes et l'écart moyen est inférieur à 0,5 point.",
              "En progrès : au moins 3 CP sont couvertes, ou l'écart moyen est inférieur à 1 point.",
              "À renforcer : dans les autres cas.",
            ],
            tip: "Ce label personnel est un repère pour vous. Le Label Égalité de l'établissement se trouve dans Statistiques > Établissement.",
          },
        ],
      },
      {
        id: "charts",
        label: "Graphiques",
        sections: [
          {
            title: "Les 3 graphiques",
            points: [
              "Évolution par période : les moyennes Filles, Garçons et générale pour chaque période (trimestre, semestre).",
              "Répartition des activités : le nombre de vos activités par CP.",
              "Comparaison Filles/Garçons par APSA : les moyennes regroupées par activité.",
            ],
            tip: "Survolez ou touchez un graphique pour afficher les valeurs exactes.",
          },
        ],
      },
      {
        id: "gaps",
        label: "Écarts détaillés",
        sections: [
          {
            title: "Onglets « Par APSA » et « Par CP »",
            text: "« Par APSA » détaille chaque activité : moyennes Filles et Garçons, et écart Filles − Garçons. « Par CP » donne l'écart moyen et le nombre d'activités analysées pour chaque CP.",
          },
          {
            title: "Lire un écart",
            points: [
              "Écart positif (+) : les filles ont une moyenne plus élevée.",
              "Écart négatif (−) : les garçons ont une moyenne plus élevée.",
              "Couleur : vert en dessous de 0,5 point, jaune en dessous de 1 point, rouge au-delà.",
            ],
          },
          {
            title: "Trier la liste",
            text: "Les boutons « Trier par période », « Trier par CP » et « Trier par activité » réorganisent la liste de l'onglet « Par APSA ».",
          },
        ],
      },
    ],
  },

  "/stats/etablissement": {
    title: "Statistiques établissement",
    intro:
      "Le bilan de toute l'équipe EPS pour l'année scolaire choisie en haut de page, avec le Label Égalité de l'établissement.",
    categories: [
      {
        id: "label",
        label: "Label Égalité",
        sections: [
          {
            title: "Un score sur 100 points",
            text: "Le Label Égalité combine 4 critères, calculés sur l'année scolaire sélectionnée :",
            points: [
              "Écart moyen Filles/Garçons (40 %) : plus l'écart est faible, plus le score est élevé (0 à partir de 2 points d'écart).",
              "Couverture des CP (30 %) : la part des CP travaillées, sur 4 au collège et 5 au lycée.",
              "Équilibre des CP (20 %) : la répartition des enseignements entre les CP, d'après les classes associées aux APSA pour l'année.",
              "Quiz de vigilance (10 %) : la moyenne des quiz complétés par les professeurs, sur 15 points.",
            ],
          },
          {
            title: "Les 3 niveaux",
            points: [
              "Équilibré : de 75 à 100 points.",
              "En progrès : de 50 à 74 points.",
              "À renforcer : de 0 à 49 points.",
            ],
            tip: "Le bouton « i » à côté du titre du label détaille le calcul et donne des pistes pour progresser.",
          },
        ],
      },
      {
        id: "indicators",
        label: "Indicateurs",
        sections: [
          {
            title: "Les 4 indicateurs",
            points: [
              "Activités analysées : les activités de tous les professeurs qui ont une moyenne Filles et une moyenne Garçons (CP5 exclue au collège).",
              "Écart moyen F/G : la moyenne des écarts entre moyennes Filles et Garçons, en points.",
              "Couverture CP : le nombre de CP travaillées sur le total pris en compte.",
              "Quiz vigilance : la moyenne des scores (sur 15) et le nombre de répondants.",
            ],
            tip: "Changez d'année avec le sélecteur en haut de page pour comparer avec les années précédentes.",
          },
        ],
      },
      {
        id: "charts",
        label: "Graphiques",
        sections: [
          {
            title: "Les 3 graphiques",
            points: [
              "Comparaison Filles/Garçons par CP : les moyennes Filles et Garçons de chaque CP.",
              "Poids des CP : le nombre d'enseignements par CP (une APSA associée à une classe = un enseignement).",
              "Écarts moyens par CP : l'écart moyen Filles/Garçons de chaque CP.",
            ],
            tip: "Le poids des CP dépend des classes associées aux APSA dans Établissement > APSA, pour l'année affichée.",
          },
        ],
      },
      {
        id: "by-cp",
        label: "Analyse par CP",
        sections: [
          {
            title: "Le détail de chaque CP",
            text: "Pour chaque CP : son intitulé, le nombre d'évaluations (activités notées) et d'enseignements, les moyennes Filles et Garçons, et l'écart moyen (vert en dessous de 0,5 point, jaune en dessous de 1 point, rouge au-delà).",
            tip: "Un encadré jaune signale les CP qui ne sont pas encore couvertes sur l'année.",
          },
        ],
      },
      {
        id: "influences",
        label: "Influences",
        sections: [
          {
            title: "Sexe du professeur",
            text: "Compare l'écart moyen des activités selon le sexe indiqué par chaque professeur à son inscription.",
          },
          {
            title: "Répartition Filles/Garçons des classes",
            text: "Compare l'écart moyen selon la composition des classes : majorité de filles (plus de 60 %), équilibrée (40 à 60 %) ou majorité de garçons (plus de 60 %).",
            tip: "Cette analyse utilise les effectifs saisis dans Établissement > Classes : pensez à les renseigner.",
          },
        ],
      },
    ],
  },
}

export function getHelpForPath(pathname: string | null): PageHelp | null {
  if (!pathname) return null
  return HELP_CONTENT[pathname.replace(/\/$/, "")] ?? null
}
