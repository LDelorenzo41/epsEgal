# EPS Égalité — Spécification fonctionnelle exhaustive

**Objet** : décrire intégralement le module « EPS Égalité » pour permettre sa reconstruction **de zéro**, comme module d'une application hôte (coordo-eps) qui gère déjà l'authentification, les établissements, les équipes et les membres.

**Source** : dépôt `LDelorenzo41/epsEgal`, branche `main`, commit `bd2091b`.
**Date d'analyse** : 17 septembre 2026.
**Base de données cible** : vierge. Aucune reprise de données n'est prévue.

---

## Sommaire

| § | Section | Contenu |
|---|---|---|
| **0** | [Comment lire ce document](#0-comment-lire-ce-document) | Conventions, arbitrages appliqués, **trois prérequis fermes attendus de l'hôte** |
| **1** | [Objectif et public](#1-objectif-et-public-du-module) | Problème métier, périmètre, vocabulaire |
| **2** | [Rôles et droits](#2-rôles-et-droits) | Matrice existante, modèle retenu, **point d'entrée menu Outils et accès restreint** |
| **3** | [Parcours écran par écran](#3-parcours-utilisateur-écran-par-écran) | 12 écrans : contenu, actions, états vides, messages |
| **4** | [Contenus métier complets](#4-contenus-métier-complets) | Référentiel CP, **questions du quiz**, textes d'interprétation, bibliographie — recopiés à l'identique |
| **5** | [Logique de calcul](#5-logique-de-calcul-complète) | 13 calculs, formules, seuils, arrondis, **exemples chiffrés** |
| **6** | [Restitutions](#6-restitutions) | Cartes, 6 graphiques, tableaux, alertes, exports |
| **7** | [Modèle de données](#7-modèle-de-données-conceptuel) | 13 entités, relations, **dérive schéma/migrations**, cible recommandée |
| **8** | [Doublons avec l'hôte](#8-doublons-avec-lapplication-hôte) | Ce qu'il ne faut pas reconstruire, points de raccordement |
| **9** | [Défauts et recommandations](#9-ce-qui-est-incomplet-bogué-ou-mal-conçu) | ~35 points classés par gravité, synthèse priorisée |
| **10** | [Annexes](#10-annexes) | Inventaire, correspondances, **checklist de recette**, scénario complet |

**Les cinq points à lire en priorité**

1. **§0.4** — les trois prérequis (P1 affectation enseignant↔classes, P2 sexe de l'enseignant, P3 effectifs F/G par classe). P1 est bloquant.
2. **§2.4** — intégration au menu Outils sur le modèle de « Schéma », et restriction d'accès à un seul compte en phase 1.
3. **§5.7** — le calcul du Label Égalité, seule formule de référence, avec son exemple chiffré complet.
4. **§7.3** — le schéma de production diverge des migrations sur 8 objets : la base d'origine n'est pas reconstructible.
5. **§9.2.7** — trois labels contradictoires coexistent dans l'application actuelle.
6. **§9.4.2** — risque de ré-identification des personnes dans les équipes de petite taille.

---

## 0. Comment lire ce document

### 0.1 Conventions de statut

Chaque comportement décrit porte un statut :

| Marqueur | Signification |
|---|---|
| **[EXISTANT]** | Comportement réellement implémenté dans le code actuel. À reproduire sauf indication contraire. |
| **[BOGUÉ]** | Comportement implémenté mais incorrect. Décrit tel quel + correction recommandée. |
| **[MORT]** | Code ou table présent mais jamais utilisé. À ne pas reconstruire. |
| **[MANQUANT]** | Fonctionnalité annoncée (README, interface) mais absente du code. |
| **[RECO]** | Recommandation de l'analyse, non présente dans l'existant. Décision à valider. |

### 0.2 Référencement des sources

Chaque point important porte son fichier d'origine sous la forme `chemin/fichier.tsx:ligne`. Les numéros de ligne renvoient au commit `bd2091b`.

### 0.3 Deux arbitrages appliqués par défaut

Faute de décision contraire, cette spécification retient :

1. **Un seul label d'établissement**, celui calculé sur 100 points (§5.7). Les deux autres formules de label existantes (tableau de bord §5.8, label personnel §5.9) sont documentées comme bugs et **ne doivent pas être reconstruites en l'état**.
2. **Renormalisation du quiz** : quand aucun enseignant n'a répondu au quiz, le score du label est calculé sur les trois autres critères ramenés à 100 % au lieu d'infliger une perte sèche de 10 points (§5.7.4).

Ces deux choix sont signalés **[RECO]** partout où ils s'appliquent.

### 0.4 Trois prérequis fermes attendus de l'application hôte

Le module ne reconstruit **pas** ces données, il les consomme. Ce sont des conditions de faisabilité :

| # | Donnée attendue | Usage dans le module | Sans elle |
|---|---|---|---|
| **P1** | **Affectation enseignant ↔ classes** : quelles classes sont prises en charge par quel professeur. | Rattachement de chaque saisie de moyennes (§7.2). Socle de tout le module. | Le module ne peut pas fonctionner du tout. |
| **P2** | **Sexe de l'enseignant** (homme / femme, avec valeurs de non-réponse possibles). | Analyse « influence du sexe du professeur » (§5.10, §6.3.4). | Cette analyse disparaît ; le reste fonctionne. |
| **P3** | **Effectifs filles / garçons par classe**. | Analyse « influence de la composition des classes » (§5.11, §6.3.5). | Cette analyse disparaît ; le reste fonctionne. |

**P1 est bloquant. P2 et P3 sont dégradables.** Si P2 ou P3 ne sont pas disponibles dans coordo-eps, les restitutions correspondantes doivent être masquées, pas affichées à zéro.

### 0.5 Droits d'écriture — décision retenue

**Tous les enseignants membres d'une équipe EPS disposent des mêmes droits de lecture et d'écriture** sur les données du module de leur établissement. Il n'y a pas de rôle « coordonnateur » privilégié au sein du module. Voir §2.

**En phase de mise au point, le module n'est toutefois accessible qu'à un seul compte nominatif**, et il est atteint depuis le **menu « Outils »** de coordo-eps, sur le modèle de la fonctionnalité « Schéma ». Voir §2.4.

---

## 1. Objectif et public du module

### 1.1 Problème métier

*Source : `app/page.tsx:33-39`, `components/eps-info-modal.tsx:40-51`, `README.md:3`*

En EPS, les écarts de résultats entre filles et garçons persistent et sont mesurables : l'écart de note moyen constaté dans la littérature est d'environ **1,21 point** en faveur des garçons (13,25 pour les filles contre 14,46 pour les garçons). Ces écarts ne traduisent pas des capacités différentes mais des effets de socialisation, de stéréotypes et d'une offre d'APSA peu questionnée.

Le module permet à une équipe EPS de **s'objectiver** : rendre visibles ses propres écarts de notation et sa propre répartition des compétences propres travaillées, à partir de ses données réelles, plutôt que de rester sur des impressions.

Formulation exacte de la page d'accueil (`app/page.tsx:37-39`) :

> Faites un état des lieux de l'égalité Filles/Garçons en EPS et de la répartition des compétences propres travaillées dans votre établissement

### 1.2 Public visé

- **Utilisateur principal** : professeur d'EPS d'un collège ou d'un lycée, membre d'une équipe EPS d'établissement.
- **Unité d'analyse** : l'**équipe EPS d'un établissement**. Le module n'a de sens qu'en collectif : un professeur seul ne peut pas obtenir de label d'établissement représentatif.
- **Échelle** : de 1 à 50 professeurs par établissement (`app/auth/signup/page.tsx:254-259`, champ `max_teachers` borné 1–50).

### 1.3 Périmètre fonctionnel

**Ce que le module fait :**

1. Décrire la programmation EPS de l'établissement : niveaux, classes, APSA rattachées aux compétences propres, et quelles classes pratiquent quelle APSA sur une année scolaire donnée.
2. Recueillir, par professeur et par classe, les **moyennes de notes** d'une APSA, ventilées Filles / Garçons / ensemble.
3. Recueillir, par professeur, un **auto-positionnement** sur la vigilance aux stéréotypes de genre (quiz de 5 questions).
4. Restituer des statistiques personnelles et d'établissement : écarts, couverture et équilibre des compétences propres, analyses croisées.
5. Attribuer un **Label Égalité** d'établissement sur 100 points, réparti en trois niveaux.
6. Documenter les enjeux (contenus pédagogiques et bibliographie intégrés à l'application).

**Ce que le module ne fait pas :**

- Aucune donnée individuelle d'élève. **Seules des moyennes agrégées par sexe sont saisies.** Point capital pour le volet RGPD (§9.4).
- Aucun calcul automatique des moyennes : elles sont saisies à la main par le professeur.
- Aucun export, aucune impression, aucun historique inter-annuel comparé **[MANQUANT]**.
- Aucune notification, aucun rappel, aucune relance.

### 1.4 Vocabulaire métier

| Terme | Définition retenue dans le module | Source |
|---|---|---|
| **APSA** | Activité Physique Sportive et Artistique. Ex. : Badminton, Demi-fond, Acrosport. Définie au niveau de l'établissement, rattachée à exactement une CP. | `app/etablissement/page.tsx:828-840` |
| **CP** | Compétence Propre. Référentiel national fixe de 5 items (CP1 à CP5). Table globale, identique pour tous les établissements. | `supabase/migrations/001_initial_schema.sql:80-97` |
| **Écart F/G** | Différence entre la moyenne des filles et celle des garçons sur une même APSA dans une même classe. Exprimé en points de note. | §5.1 |
| **Enseignement** | Une APSA enseignée à une classe sur une année scolaire = 1 enseignement. Unité de mesure du « poids » d'une CP. | `components/label-info-modal.tsx:134-138` |
| **Évaluation** | Une saisie de moyennes (générale / filles / garçons) pour un couple classe × APSA, sur une période et une année. | §7.1 |
| **Couverture CP** | Nombre de CP pour lesquelles au moins une évaluation a été saisie, rapporté au nombre de CP attendues. | §5.3 |
| **Poids d'une CP** | Nombre d'enseignements rattachés à cette CP. | §5.4 |
| **Équilibre CP** | Mesure de l'homogénéité de la répartition des enseignements entre les CP. | §5.5 |
| **Label Égalité** | Note sur 100 de l'établissement, traduite en trois niveaux : Équilibré / En progrès / À renforcer. | §5.7 |
| **Année scolaire** | Chaîne au format `AAAA-AA`, ex. `2025-26`. Bascule au 1er septembre. | §5.12 |
| **Période** | Trimestre 1/2/3 ou Semestre 1/2. Liste fermée. | `components/perso-manager.tsx:64-70` |

---

## 2. Rôles et droits

### 2.1 Existant

*Source : `supabase/migrations/001_initial_schema.sql:15`, `supabase/migrations/002_rls_policies.sql`*

La table `profiles` porte une colonne `role` contrainte à `'teacher'` ou `'admin'`, avec `'teacher'` par défaut.

**[MORT]** Cette colonne n'est **jamais lue nulle part dans le code applicatif**. Vérification : aucune occurrence de `profile.role`, `role ===` ou `"admin"` dans `app/` ou `components/`. L'inscription force systématiquement `role: "teacher"` (`app/auth/signup/page.tsx:79`, `:140`). Aucune politique RLS ne discrimine sur le rôle.

**Conséquence de l'existant** : tout professeur inscrit dans un établissement peut créer, modifier et supprimer **tous** les niveaux, classes et APSA de cet établissement, y compris ceux créés par ses collègues. Seules les saisies personnelles (attribution de classes, moyennes) sont protégées : un professeur ne peut modifier que les siennes.

### 2.2 Matrice des droits — existant

Périmètre : un utilisateur authentifié `U` rattaché à l'établissement `E`.

| Ressource | Lire | Créer | Modifier | Supprimer | Politique RLS source |
|---|---|---|---|---|---|
| Son propre profil | ✅ | ✅ | ✅ | ❌ | `002_rls_policies.sql:24-52` |
| Profil des collègues de `E` | ✅ | ❌ | ❌ | ❌ | `002_rls_policies.sql:33-44` |
| Établissement `E` | ✅ | ✅ | ✅ | ❌ | `002_rls_policies.sql:62-100` |
| **Tout autre établissement** | ⚠️ **✅** | — | ❌ | ❌ | `002_rls_policies.sql:75-79` — voir §9.1.2 |
| Niveaux de `E` | ✅ | ✅ | ✅ | ✅ | `002_rls_policies.sql:106-159` |
| Classes de `E` | ✅ | ✅ | ✅ | ✅ | `002_rls_policies.sql:165-218` |
| CP (table globale) | ✅ | ❌ | ❌ | ❌ | RLS non activée, lecture ouverte |
| APSA de `E` | ✅ | ✅ | ✅ | ✅ | `002_rls_policies.sql:224-277` |
| Ses attributions de classes | ✅ | ✅ | — | ✅ | `002_rls_policies.sql:283-315` |
| Attributions des collègues | ✅ | ❌ | ❌ | ❌ | `002_rls_policies.sql:292-306` |
| Ses saisies de moyennes | ✅ | ✅ | ✅ | ✅ | `002_rls_policies.sql:321-395` |
| Saisies des collègues de `E` | ✅ | ❌ | ❌ | ❌ | `002_rls_policies.sql:337-352` |
| Son score de quiz | ✅ | ✅ | ✅ | ❌ | hors migrations (§7.3) |
| Scores de quiz des collègues | ❌ (agrégé seulement) | ❌ | ❌ | ❌ | hors migrations |
| Statistiques agrégées du quiz | ✅ | — | — | — | hors migrations |

### 2.3 Modèle de droits retenu pour coordo-eps — **[DÉCISION VALIDÉE]**

**Tous les enseignants membres de l'équipe EPS ont les mêmes droits d'écriture.** Pas de rôle privilégié dans le module.

| Ressource du module | Membre de l'équipe EPS de `E` | Non-membre |
|---|---|---|
| Programmation de l'établissement (APSA, rattachement CP, association APSA↔classes) | Lecture + écriture complète | Aucun accès |
| Ses propres saisies de moyennes | Lecture + écriture complète | Aucun accès |
| Saisies de moyennes des collègues | **Lecture seule** | Aucun accès |
| Son propre score de quiz | Lecture + écriture (une fois par an, §3.7) | Aucun accès |
| Scores de quiz nominatifs des collègues | **Aucun accès, même en lecture** | Aucun accès |
| Statistiques agrégées d'établissement | Lecture | Aucun accès |

**Trois invariants à faire respecter par les politiques RLS :**

1. **Cloisonnement établissement** : aucune donnée du module n'est lisible hors de l'établissement auquel elle appartient. À dériver de la notion d'appartenance déjà gérée par coordo-eps, jamais d'un `USING (true)` (§9.1.2).
2. **Propriété des saisies** : l'écriture sur une saisie de moyennes est réservée à son auteur. La lecture est ouverte aux membres de l'équipe — c'est indispensable aux statistiques d'établissement.
3. **Confidentialité du quiz** : les réponses et scores nominatifs ne sortent jamais sous forme individuelle. Seule la moyenne d'établissement et le nombre de répondants sont exposés. Voir §9.4.2 pour le seuil minimal de répondants.

### 2.4 Point d'entrée et restriction d'accès — **[DÉCISION VALIDÉE]**

#### 2.4.1 Emplacement dans coordo-eps

Le module est accessible **depuis le menu « Outils » de coordo-eps, exactement comme la fonctionnalité « Schéma »**.

C'est une contrainte d'intégration, pas une suggestion : le motif d'intégration de « Schéma » (entrée de menu, déclaration de route, structure de page, contrôle d'accès, conventions d'interface) sert de **modèle de référence**. Toute divergence par rapport à ce motif doit être justifiée.

Conséquence pratique : le module n'est **pas** une section de premier niveau de coordo-eps. Il n'apparaît pas dans la navigation principale, ne modifie pas le tableau de bord de l'hôte, et ne s'impose à aucun utilisateur qui ne le cherche pas.

#### 2.4.2 Phase 1 — accès restreint à un seul compte

Tant que le module n'est pas jugé complet et correct, il est accessible **à un seul compte**, celui du propriétaire du produit :

> **Compte autorisé en phase 1 : `delorenzo.lionel@orange.fr`**
> ⚠️ **À confirmer** — adresse transmise sous la forme `delorenzo.Lionel@orange.f`. L'extension `.fr` et la casse sont des reconstitutions. Voir §2.4.5.

Pendant cette phase :

| Pour le compte autorisé | Pour tous les autres comptes |
|---|---|
| L'entrée « EPS Égalité » apparaît dans le menu Outils | **Aucune entrée de menu** |
| Toutes les routes du module sont accessibles | **Toutes les routes répondent comme inexistantes** |
| Toutes les données du module sont lisibles et modifiables | **Aucune ligne d'aucune table du module n'est lisible** |
| Le module fonctionne intégralement | coordo-eps est **strictement identique** à aujourd'hui |

#### 2.4.3 Trois exigences non négociables

**① Le contrôle est appliqué à trois niveaux, pas un seul.**

Masquer l'entrée de menu ne protège rien : les routes restent atteignables par quiconque connaît ou devine l'URL, et les tables restent interrogeables par l'API de données.

| Niveau | Effet attendu si le compte n'est pas autorisé |
|---|---|
| **Interface** | L'entrée de menu n'est pas rendue |
| **Route / serveur** | L'accès direct à l'URL renvoie une page inexistante ou une redirection — **pas** un message « accès refusé » qui révélerait l'existence du module |
| **Base de données (RLS)** | Chaque politique du module intègre la condition d'autorisation. Aucune ligne n'est lisible, même avec un jeton valide |

La couche base de données est la seule réellement contraignante. Les deux autres relèvent du confort et de la discrétion.

**② Un point de contrôle unique.**

L'autorisation est évaluée par **une seule fonction**, appelée partout. Le jour de l'ouverture à tous, une seule ligne change. Si la condition est recopiée à quinze endroits, l'ouverture sera un chantier et il restera des oublis.

**③ La liste n'est pas figée dans le code.**

L'adresse autorisée est stockée en base (table `egalite_parametres` ou équivalent) ou en variable d'environnement — **jamais en dur dans un composant**. Élargir l'accès à un premier collègue testeur doit être une opération de données, pas un déploiement.

#### 2.4.4 Phase 2 — ouverture

L'ouverture progressive est prévue dès la conception, en trois crans, du plus restrictif au plus ouvert :

| Cran | Accès | Mise en œuvre attendue |
|---|---|---|
| **1 — Actuel** | Un compte nominatif | Liste d'adresses autorisées |
| **2 — Bêta** | Quelques établissements pilotes | Activation par établissement ou par équipe |
| **3 — Général** | Tous les utilisateurs | Le point de contrôle retourne systématiquement vrai, ou le drapeau est retiré |

**[RECO]** : concevoir le point de contrôle **dès le lot 1** pour qu'il sache déjà répondre aux trois crans. Un contrôle qui ne sait faire que « cette adresse ou rien » devra être réécrit deux fois.

**Le modèle de droits de §2.3 reste la cible.** En phase 1, il n'a simplement pas d'effet observable, puisqu'un seul compte accède au module. Il doit malgré tout être implémenté dès le départ : le découvrir au cran 2, avec de vraies données d'équipe, serait une reprise coûteuse.

#### 2.4.5 ⚠️ Deux points à confirmer avant écriture du code

1. **L'adresse exacte.** Telle que transmise, `delorenzo.Lionel@orange.f` comporte une extension à une lettre et une majuscule. La reconstitution retenue est `delorenzo.lionel@orange.fr`. **Une erreur d'un caractère sur cette valeur bloque l'accès au seul compte autorisé.**
2. **Le compte de connexion réel.** L'adresse d'exploitation connue par ailleurs est `lionel.delorenzo@teachtech.fr`. Si le compte coordo-eps est ouvert sous cette adresse et non sous l'adresse Orange, c'est celle-ci qu'il faut autoriser — ou les deux.

**[RECO]** : normaliser en minuscules des deux côtés de la comparaison, et prévoir une **liste** d'adresses dès le départ plutôt qu'une valeur unique. Le surcoût est nul, et cela couvre les deux cas ci-dessus sans arbitrage.

---

---

## 3. Parcours utilisateur, écran par écran

Chaque écran est décrit par : chemin, accès, contenu, actions, états vides, messages.

### 3.1 Écran — Accueil public

*Source : `app/page.tsx`*

**Chemin** : `/` · **Accès** : public. Un utilisateur connecté n'est pas redirigé depuis cette page.

**Contenu**

- En-tête : titre « EPS Égalité » + bouton ⓘ ouvrant la modale « À propos » (§3.10.1) ; boutons « Connexion » et « Inscription ».
- Titre principal « EPS Égalité » + ⓘ, et l'accroche citée en §1.1.
- Trois cartes de présentation :

| Titre | Texte exact |
|---|---|
| Programmation | Définissez votre programmation commune des APSA et leur répartition par CP |
| Suivi personnel | Gérez vos classes et saisissez les moyennes de notes par sexe |
| Statistiques | Visualisez les écarts et obtenez un label d'égalité pour votre établissement |

- Bouton d'appel à l'action : « Commencer maintenant » → `/auth/signup`.
- Bloc « Comment ça marche ? » en 4 étapes numérotées :

| # | Titre | Texte exact |
|---|---|---|
| 1 | Créez ou rejoignez un établissement | Le premier professeur crée l'établissement et obtient un code à partager avec ses collègues |
| 2 | Configurez votre établissement | Définissez les niveaux, les classes et la programmation commune des APSA |
| 3 | Saisissez vos données | Chaque professeur saisit ses moyennes de notes par sexe pour ses classes |
| 4 | Consultez les statistiques | Visualisez les écarts et obtenez un label d'égalité pour votre établissement |

- Pied de page : « EPS Égalité - Outil d'analyse de l'égalité Filles/Garçons en EPS ».

**Dans coordo-eps** : cet écran est un **doublon** de la page d'accueil de l'hôte. Voir §8.1. Seule l'étape 4 et le bloc de présentation en trois cartes méritent d'être repris comme page d'introduction *interne* au module.

### 3.2 Écran — Inscription

*Source : `app/auth/signup/page.tsx`*

**Chemin** : `/auth/signup` · **Accès** : public ; un utilisateur connecté est redirigé vers `/dashboard` par le middleware (`middleware.ts:43-46`).

Deux onglets : « Créer un établissement » / « Rejoindre un établissement ».

**Onglet « Créer un établissement »** — champs, dans l'ordre :

| Champ | Type | Obligatoire | Contrainte / aide |
|---|---|---|---|
| Nom complet | texte | ✅ | — |
| Sexe | liste | ✅ | Homme / Femme / Autre / Préfère ne pas répondre |
| Email | email | ✅ | — |
| Mot de passe | mot de passe | ✅ | 6 caractères minimum |
| Nom de l'établissement | texte | ✅ | placeholder « Ex: Collège Victor Hugo » |
| Type d'établissement | liste | ✅ | Collège / Lycée Général et Technologique / Lycée Professionnel |
| Nombre maximum de professeurs | nombre | ✅ | min 1, max 50, défaut 10 |

Encart d'aide sous le type d'établissement, texte exact (`:247-250`) :

> **Collège :** CP1 à CP4 (CP5 exclue du Label)
> **Lycée :** CP1 à CP5 (toutes les CP incluses)

Bouton : « Créer l'établissement » / « Création... » pendant le traitement.

**Séquence d'exécution [EXISTANT]** (`:39-89`) : validation sexe → validation type → `auth.signUp` → génération d'un code à 8 caractères → insertion de l'établissement → insertion du profil → redirection `/dashboard`.

**[BOGUÉ]** Cette séquence présente quatre défauts, détaillés en §9.2.1 : code d'établissement généré côté client sans contrôle d'unicité, non-transactionnalité, échec silencieux si la confirmation d'e-mail est activée, erreurs affichées via `alert()` natif.

**Onglet « Rejoindre un établissement »** — champs : Nom complet, Sexe, Email, Mot de passe, Code établissement (placeholder « Ex: A1B2C3D4 », **conversion automatique en majuscules à la saisie**, `:342`), avec l'aide « Demandez le code à un collègue déjà inscrit ».

**Séquence** (`:91-148`) : validation sexe → recherche de l'établissement par code → comptage des profils rattachés → comparaison à `max_teachers` → création du compte → création du profil → redirection.

**Messages d'erreur exacts** :

| Condition | Message |
|---|---|
| Sexe non renseigné | `Veuillez sélectionner votre sexe` |
| Type non renseigné (création) | `Veuillez sélectionner le type d'établissement` |
| Code introuvable | `Code établissement invalide` |
| Quota atteint | `Nombre maximum de professeurs atteint pour cet établissement` |
| Échec création compte | `Échec de la création du compte` |

Lien de bas de page : « Vous avez déjà un compte ? **Se connecter** ».

**Dans coordo-eps** : écran entièrement **doublon**. §8.1. Seuls **le sexe de l'enseignant (P2)** et **le type d'établissement** doivent exister côté hôte ou être ajoutés.

### 3.3 Écrans — Connexion et mot de passe

*Sources : `app/auth/login/page.tsx`, `app/auth/forgot-password/page.tsx`, `app/auth/reset-password/page.tsx`*

**`/auth/login`** : e-mail + mot de passe, lien « Mot de passe oublié ? », bouton « Se connecter » / « Connexion... ». Succès → toast « Connexion réussie » / « Bienvenue ! » puis `/dashboard`. Échec → toast destructif « Erreur de connexion » avec le message brut du fournisseur d'authentification.

**`/auth/forgot-password`** : saisie de l'e-mail, envoi d'un lien de récupération pointant vers `/auth/reset-password`. Écran de confirmation : « Email envoyé ! », « Un email de récupération a été envoyé à **{email}** », « Cliquez sur le lien dans l'email pour réinitialiser votre mot de passe. Vérifiez également votre dossier spam. »

**`/auth/reset-password`** : vérifie la présence d'une session au montage ; sinon toast « Lien invalide ou expiré » / « Veuillez demander un nouveau lien de récupération » et redirection vers `/auth/forgot-password`. Deux champs (mot de passe, confirmation) avec bascule d'affichage. Validations : correspondance des deux champs (« Les mots de passe ne correspondent pas »), longueur ≥ 6 (« Le mot de passe doit contenir au moins 6 caractères »).

**Dans coordo-eps** : les trois écrans sont des **doublons intégraux**. §8.1.

### 3.4 Écran — Tableau de bord

*Source : `app/dashboard/page.tsx`*

**Chemin** : `/dashboard` · **Accès** : authentifié (middleware). Rendu côté serveur.

**Contenu, dans l'ordre**

1. Titre « Tableau de bord », sous-titre « Bienvenue, {nom complet ou e-mail} ».
2. Bandeau établissement : nom, « {n} / {max} professeurs », « Code: {code} ».
3. Bloc **« Mes statistiques »** — 4 cartes :

| Carte | Valeur | Légende |
|---|---|---|
| Mes classes | nombre de classes attribuées | Classes attribuées |
| Mes activités | nombre de saisies de l'utilisateur | APSA enseignées |
| Niveaux établissement | nombre de niveaux | Niveaux configurés |
| Classes établissement | nombre de classes | Classes totales |

4. Bloc **« Statistiques de l'établissement »** — 4 cartes :

| Carte | Valeur | Légende |
|---|---|---|
| APSA configurées | nombre d'APSA | Activités disponibles |
| Professeurs | nombre de profils rattachés | Inscrits |
| Écart moyen F/G | écart moyen, 2 décimales, ou `-` | « Points d'écart » ou « Pas de données » |
| Label égalité | libellé du label | « {n} activité(s) » |

⚠️ **[BOGUÉ — majeur]** Les deux dernières cartes appliquent une formule **différente** de celle de l'écran de statistiques d'établissement : pas de filtrage par année scolaire, pas d'exclusion de CP5 en collège, et attribution du label par simple seuil sur l'écart. Voir §5.8. **Le même établissement peut afficher deux labels contradictoires sur deux écrans.**

5. Bloc **« Ressources pédagogiques »** — 3 tuiles :
   - Lien externe vers un podcast : « État des lieux de l'égalité filles / garçons en EPS en France » / « Podcast audio sur l'égalité en EPS (créé avec NotebookLM) » (URL Google Drive, `:327`).
   - Bouton « Ressources & Informations » ouvrant la modale bibliographique (§3.10.2).
   - Tuile du quiz de vigilance (§3.7), affichée seulement si l'utilisateur est rattaché à un établissement.
6. Bloc **« Accès rapide »** — 4 cartes cliquables :

| Carte | Description | Bouton | Cible |
|---|---|---|---|
| Établissement | Configurer les niveaux, classes et APSA | Gérer l'établissement | `/etablissement` |
| Page Perso | Gérer mes classes et ma programmation | Accéder à ma page | `/perso` |
| Statistiques Perso | Mes écarts Filles/Garçons et répartition CP | Voir mes stats | `/stats/perso` |
| Statistiques Établissement | Vue globale et label égalité | Voir les stats | `/stats/etablissement` |

**État vide** : aucun état vide dédié. Les compteurs affichent `0` et le label « Non calculé » sur fond gris.

**[RECO]** Dans coordo-eps, ce tableau de bord doit soit disparaître au profit du tableau de bord de l'hôte, soit devenir la page d'accueil *du module* — mais dans les deux cas, **il doit afficher le label calculé par §5.7 et aucun autre**.

### 3.5 Écran — Établissement

*Source : `app/etablissement/page.tsx` (1 048 lignes)*

**Chemin** : `/etablissement` · **Accès** : authentifié ; redirection vers `/dashboard` si l'utilisateur n'est rattaché à aucun établissement (`:85-88`).

En-tête : « Établissement » + nom de l'établissement. Quatre onglets.

#### 3.5.1 Onglet « Informations » (par défaut)

Lecture seule. Quatre blocs :

| Libellé | Valeur | Aide affichée |
|---|---|---|
| Nom de l'établissement | nom | — |
| Type d'établissement | Collège / Lycée Général et Technologique / Lycée Professionnel, ou « Non défini » | Si collège : « CP1 à CP4 prises en compte pour le Label (CP5 exclue) » — sinon : « CP1 à CP5 prises en compte pour le Label » |
| Code établissement | code en police à chasse fixe | « Partagez ce code avec vos collègues » |
| Nombre maximum de professeurs | nombre | — |

**[MANQUANT]** Aucun de ces champs n'est modifiable après création : ni le nom, ni le type, ni le quota. Une équipe qui se trompe de type à l'inscription fausse son label de façon irréversible depuis l'interface.

#### 3.5.2 Onglet « Niveaux »

**Actions** : bouton « Ajouter un niveau » ouvrant un formulaire en ligne (fond bleu).

| Champ | Obligatoire | Aide |
|---|---|---|
| Nom du niveau * | ✅ | placeholder « Ex: 6e, 5e, 2nde... » |
| Nombre de classes (optionnel) | ❌ | placeholder « Ex: 4 » |

Boutons « Ajouter »/« Modifier » et « Annuler ».

**Tableau** : colonnes Nom · Nombre de classes (ou `-`) · Actions (crayon = modifier, corbeille = supprimer). Tri par nom.

**État vide** : `Aucun niveau configuré. Cliquez sur "Ajouter un niveau" pour commencer.`

**Confirmation de suppression** (fenêtre native) : `Êtes-vous sûr de vouloir supprimer ce niveau ?`

**Messages de succès** : `Niveau ajouté avec succès` / `Niveau modifié avec succès` / `Niveau supprimé avec succès`.

⚠️ **[BOGUÉ]** La suppression d'un niveau **cascade** sur ses classes, donc sur les attributions de classes, donc sur **toutes les saisies de moyennes rattachées** — sans aucun avertissement sur le volume de données détruit. Voir §9.2.6.

**Dans coordo-eps** : **doublon**. Les niveaux sont gérés par l'hôte. §8.1.

#### 3.5.3 Onglet « Classes »

Bouton « Ajouter une classe », **désactivé tant qu'aucun niveau n'existe**.

Bandeau d'avertissement si aucun niveau (`:630-632`) : `Vous devez d'abord créer des niveaux avant de pouvoir ajouter des classes.`

| Champ | Obligatoire | Aide |
|---|---|---|
| Niveau * | ✅ | liste des niveaux, placeholder « Sélectionner un niveau » |
| Nom de la classe * | ✅ | placeholder « Ex: 6e1, 3eC... » |
| Total élèves | ❌ | nombre |
| Filles | ❌ | nombre |
| Garçons | ❌ | nombre |

**Tableau** : Nom · Niveau · Effectif total · Filles · Garçons · Actions. Valeurs absentes affichées `-`.

**État vide** : `Aucune classe configurée. Cliquez sur "Ajouter une classe" pour commencer.`

**Confirmation** : `Êtes-vous sûr de vouloir supprimer cette classe ?`

⚠️ **[BOGUÉ]** Aucune cohérence n'est vérifiée entre `Total élèves` et `Filles + Garçons`. Un effectif de 26 avec 14 filles et 15 garçons est accepté. Ces effectifs alimentent pourtant l'analyse §5.11.

**Dans coordo-eps** : **doublon** pour l'entité classe. **Mais les effectifs filles/garçons (P3) doivent exister côté hôte** — c'est une exigence, pas un doublon à ignorer.

#### 3.5.4 Onglet « APSA »

C'est l'écran de **programmation commune** de l'équipe, et le seul écran de l'application où l'année scolaire est sélectionnable côté établissement.

**En-tête d'onglet** : titre « APSA », description « Activités Physiques Sportives et Artistiques - Année {année} », sélecteur d'année scolaire (§3.12.2), bouton « Ajouter une APSA ».

**Encart d'information permanent** (`:801-807`) :

> Pour chaque APSA, vous pouvez définir quelles classes la pratiquent cette année. Cliquez sur l'icône 👥 pour associer des classes.

**Formulaire APSA**

| Champ | Obligatoire | Aide |
|---|---|---|
| Compétence Propre * | ✅ | liste `{code} - {intitulé}`, placeholder « Sélectionner une CP » |
| Nom de l'APSA * | ✅ | placeholder « Ex: Badminton, Demi-fond... » |
| Description (optionnel) | ❌ | placeholder « Description de l'activité » |

⚠️ **Filtrage des CP proposées** (`:112-118`) : **si le type d'établissement vaut `college`, CP5 est retirée de la liste.** Une équipe de collège ne peut donc pas déclarer d'APSA en CP5.

**Formulaire d'association APSA ↔ classes** (fond vert, `:869-917`)

- Titre : « Associer des classes à : {nom de l'APSA} »
- Aide : « Sélectionnez les classes qui pratiqueront cette APSA en {année} »
- Grille de boutons à bascule, une par classe (nom + niveau en second niveau). Sélection = fond vert.
- Compteur : « {n} classe(s) sélectionnée(s) »
- Boutons « Enregistrer » / « Annuler ».
- Message de succès : `Classes associées avec succès`

**Mécanique d'enregistrement [EXISTANT]** (`:344-372`) : suppression de **toutes** les associations existantes de cette APSA pour cette année, puis insertion des nouvelles. C'est un remplacement intégral, pas un différentiel.

⚠️ **[BOGUÉ]** Cette suppression puis insertion n'est pas transactionnelle : si l'insertion échoue, les associations précédentes sont perdues.

**Affichage de la liste** : les APSA sont **groupées par CP**, dans une carte par CP portant « {code} - {intitulé} ». Une CP sans APSA n'affiche aucun bloc. Chaque APSA affiche son nom, sa description, et une ligne de statut :
- `{n} classe(s) associée(s)` si n > 0
- `Aucune classe associée` sinon

Actions par APSA : bouton 👥 (associer des classes, bordure verte et compteur si n > 0), crayon (modifier), corbeille (supprimer).

**État vide** : `Aucune APSA configurée. Cliquez sur "Ajouter une APSA" pour commencer.`

**Confirmation** : `Êtes-vous sûr de vouloir supprimer cette APSA ?`

**Messages de succès** : `APSA ajoutée avec succès` / `APSA modifiée avec succès` / `APSA supprimée avec succès`.

⚠️ **Point d'attention majeur pour la reconstruction** : les associations APSA↔classes sont **portées par une année scolaire**, alors que les APSA elles-mêmes ne le sont pas. Une APSA créée reste indéfiniment ; sa programmation change chaque année. Ce découplage est correct et doit être conservé.

### 3.6 Écran — Page personnelle

*Sources : `app/perso/page.tsx`, `components/perso-manager.tsx` (702 lignes)*

**Chemin** : `/perso` · **Accès** : authentifié + rattaché à un établissement.

En-tête : « Ma Page Personnelle » / « Gérez vos classes et votre programmation ». Deux cartes.

#### 3.6.1 Carte « Mes Classes »

Sous-titre : « Classes dont vous avez la charge ». Bouton « Ajouter une classe », **désactivé quand toutes les classes de l'établissement sont déjà attribuées à l'utilisateur**.

Formulaire : liste déroulante « Sélectionner une classe * », affichant `{nom} - {niveau}`, **restreinte aux classes non encore attribuées à cet utilisateur** (`:344-346`). Boutons « Ajouter » / « Annuler ».

Liste : par classe, nom (gros), niveau, effectif « {n} élèves », ventilation « {f} F / {g} G », bouton de suppression.

**État vide** : `Aucune classe attribuée. Cliquez sur "Ajouter une classe" pour commencer.`

**Confirmation** : `Êtes-vous sûr de vouloir retirer cette classe ?`

**Messages** : succès `Classe ajoutée avec succès` / `Classe retirée avec succès` ; erreurs `Veuillez sélectionner une classe`, `Cette classe vous est déjà attribuée`, `Impossible d'ajouter la classe`, `Impossible de retirer la classe`.

⚠️ **[BOGUÉ]** L'attribution d'une classe n'est **pas datée par année scolaire**. Elle vaut pour toujours. Un professeur qui change de service doit retirer manuellement ses anciennes classes — ce qui supprime en cascade toutes ses saisies historiques.

**Dans coordo-eps** : c'est le **prérequis P1**. Cet écran doit disparaître, remplacé par la lecture de l'affectation prof↔classes de l'hôte.

#### 3.6.2 Carte « Mes Activités / Programmation »

Sous-titre : « APSA travaillées avec mes classes et moyennes de notes ». Bouton « Ajouter une activité », **désactivé tant qu'aucune classe n'est attribuée**, accompagné du bandeau : `Vous devez d'abord vous attribuer des classes avant de pouvoir ajouter des activités.`

**Formulaire de saisie** — titre « Ajouter une activité » ou « Modifier une activité ».

| Champ | Obligatoire | Type | Valeurs |
|---|---|---|---|
| Classe * | ✅ | liste | classes attribuées à l'utilisateur |
| APSA * | ✅ | liste | APSA de l'établissement, affichées `{nom} ({code CP})` |
| Période | ❌ | liste | Trimestre 1, Trimestre 2, Trimestre 3, Semestre 1, Semestre 2 |
| Année scolaire | ❌ | liste | 2023-24, 2024-25, **2025-26 (actuelle)**, 2026-27 — défaut `2025-26` |
| Moyenne générale | ❌ | nombre, pas 0.01 | placeholder `0.00` |
| Moyenne Filles | ❌ | nombre, pas 0.01 | placeholder `0.00` |
| Moyenne Garçons | ❌ | nombre, pas 0.01 | placeholder `0.00` |

**Messages** : erreur `La classe et l'APSA sont requises` ; succès `Activité créée avec succès` / `Activité modifiée avec succès` / `Activité supprimée avec succès` ; erreurs techniques `Impossible de créer l'activité` / `Impossible de modifier l'activité` / `Impossible de supprimer l'activité`.

**Confirmation** : `Êtes-vous sûr de vouloir supprimer cette activité ?`

**Liste des activités** : par activité — nom de l'APSA, `{code CP} - {intitulé CP}`, « Classe: {nom} », badge de période, boutons modifier/supprimer. Si au moins une moyenne est renseignée, un bloc de trois colonnes affiche « Moyenne générale » (bleu), « Moyenne Filles » (rose), « Moyenne Garçons » (bleu foncé), valeur brute ou `-`.

**État vide** : `Aucune activité programmée. Cliquez sur "Ajouter une activité" pour commencer.`

⚠️ **Quatre problèmes [BOGUÉ] sur cet écran**, détaillés en §9.2 :
1. La liste des activités **n'est pas filtrée par année scolaire** : toutes les années sont mélangées, sans que l'année soit affichée sur les lignes.
2. La liste des années est **codée en dur** et différente de celle du sélecteur d'année utilisé ailleurs (§3.12.2).
3. **Aucune validation des moyennes** : une valeur de 35 ou de −4 est acceptée et faussera tous les calculs.
4. Aucune contrainte d'unicité : la même classe × APSA × période × année peut être saisie deux fois et comptera double.

⚠️ **Incohérence de conception** : l'écran Établissement déclare *quelles classes pratiquent quelle APSA* (`apsa_classes`), et cet écran déclare *quelles APSA j'évalue avec mes classes* (`class_activities`). **Ces deux déclarations ne sont jamais confrontées.** Un professeur peut saisir une moyenne pour une APSA non associée à sa classe. Le poids des CP (§5.4) se fonde sur la première, la couverture (§5.3) sur la seconde. Voir §9.3.1.

### 3.7 Écran — Quiz de vigilance

*Source : `components/vigilance-quiz.tsx` (622 lignes)*

**Accès** : tuile sur le tableau de bord, visible si l'utilisateur est rattaché à un établissement. S'ouvre en fenêtre modale.

**Tuile de déclenchement** : icône balance sur fond violet, titre « Quiz de vigilance Égalité », texte « Évaluez votre niveau de vigilance face aux stéréotypes de genre en EPS ». Si l'utilisateur a déjà répondu pour l'année en cours, une pastille verte affiche « Complété ({score}/15) ».

**Titre de la modale** : « Test de vigilance didactique et pédagogique en EPS ».

Trois étapes : `intro` → `quiz` → `result`. **Si un score existe déjà pour l'année scolaire courante, la modale s'ouvre directement sur `result`.**

#### 3.7.1 Étape « intro »

Texte d'accroche exact (`:369-372`) :

> Ce test a pour objectif de mesurer votre **niveau de vigilance réflexive** face aux stéréotypes de genre en EPS. Il ne s'agit pas d'un jugement mais d'un **outil d'auto-positionnement professionnel** contribuant à l'attribution du Label Égalité de votre établissement.

Section « Comment ça fonctionne ? » — 4 points numérotés, textes exacts :

1. 5 questions sur vos pratiques pédagogiques
2. Répondez honnêtement : OUI (3 pts), Parfois (1 pt), NON (0 pt)
3. Score sur 15 points, 4 niveaux de vigilance
4. Contribue à 10% du Label Égalité de l'établissement

Avertissement (fond ambre) : `Le quiz est complétable une seule fois par année scolaire ({année}).`

Bouton : « Commencer le test ».

#### 3.7.2 Étape « quiz »

- Barre de progression : « Question {n} sur 5 » et pourcentage `round((n/5) × 100)`.
- Encart violet : titre thématique de la question + énoncé.
- Trois options exclusives, dans cet ordre :

| Libellé | Points | Description | Couleur |
|---|---|---|---|
| OUI | 3 | Je le fais systématiquement | vert |
| Parfois | 1 | Je le fais de temps en temps | ambre |
| NON | 0 | Je ne le fais pas ou rarement | rouge |

Le libellé affiché est « {Libellé} ({n} pt) » au singulier pour 0 et 1 point, « (3 pts) » au pluriel.

- Navigation : « Précédent » (désactivé sur la question 1), « Suivant » (désactivé tant que la question n'a pas de réponse), « Voir mon résultat » sur la dernière (désactivé si les 5 réponses ne sont pas complètes ; affiche « Calcul en cours... » pendant l'enregistrement).
- Fermer la modale en cours de quiz **réinitialise les réponses**.

#### 3.7.3 Étape « result »

- Pastille circulaire : « {score}/15 », couleur du niveau.
- Titre : « Niveau {n} : {libellé du niveau} ».
- Sous-titre : « {pourcentage}% de vigilance ».
- Jauge en 4 segments égaux (rouge, orange, bleu, vert) surmontée des repères « Niveau 1 » à « Niveau 4 », avec un curseur positionné au **pourcentage du score** — et non au numéro de niveau. **[BOGUÉ mineur]** : un score de 15/15 place le curseur à 100 %, mais un score de 8/15 (niveau 2) le place à 53 %, soit dans le segment « Niveau 3 ». La jauge contredit le niveau annoncé.
- Encart d'interprétation : texte du niveau (§4.3).
- Encart « Comparaison établissement » (si au moins un répondant) : moyenne d'établissement sur 15, nombre de « Professeurs évalués », puis une phrase parmi :
  - `Votre score est supérieur à la moyenne de l'établissement.`
  - `Votre score est inférieur à la moyenne de l'établissement.`
  - `Votre score correspond à la moyenne de l'établissement.`
- Encart « Contribution au Label Égalité » : « Ce score représente **10%** du calcul du Label Égalité de votre établissement. Votre contribution : **{pourcentage × 0,1} points** sur 10. »

⚠️ **[BOGUÉ]** Cette phrase est fausse : la contribution au label dépend de la **moyenne d'établissement**, pas du score individuel. Un professeur à 15/15 dans un établissement dont la moyenne est 6/15 ne contribue pas 10 points sur 10.

- Mention de traçabilité : « Quiz complété le {date au format français} pour l'année {année} ».
- Bouton « Fermer ».

**Message d'erreur technique** (fenêtre native) : `Une erreur est survenue lors de l'enregistrement. Veuillez réessayer.`

⚠️ **[BOGUÉ]** L'intro annonce « complétable une seule fois par année scolaire », mais le code d'enregistrement gère explicitement la mise à jour d'un score existant (`:238-280`). En pratique le verrou tient — l'interface ne propose pas de refaire le quiz — mais la fonction `resetQuiz()` existe sans être appelée. Le comportement voulu doit être tranché : **[RECO]** autoriser explicitement une nouvelle réponse par année, avec date de dernière mise à jour, plutôt qu'un verrou implicite.

### 3.8 Écran — Statistiques personnelles

*Source : `app/stats/perso/page.tsx` (615 lignes)*

**Chemin** : `/stats/perso` (également cible de la redirection depuis `/stats`, `app/stats/page.tsx`).

En-tête : « Statistiques Personnelles » / « Analyse de vos données d'égalité Filles/Garçons (Collège - CP1 à CP4) » + sélecteur d'année + bouton « Voir stats établissement ».

⚠️ **[BOGUÉ]** Le sous-titre annonce « Collège - CP1 à CP4 » **quel que soit le type d'établissement**. Pour un professeur de lycée, cet écran exclut CP5 et raisonne sur 4 CP, sans le dire. Voir §9.2.3.

**Données prises en compte** : les saisies de l'utilisateur, pour l'année sélectionnée, ayant **à la fois** une moyenne filles et une moyenne garçons renseignées, **hors CP5**.

**Contenu**

1. Trois cartes : « Activités analysées » (légende « Activités avec moyennes F/G (CP5 exclue) »), « Écart moyen F/G » (légende « Points d'écart absolu »), « Couverture CP » au format `{n} / 4` (légende « {p}% des CP travaillées (Collège) »).
2. Carte « Mon Label Égalité Personnel » : libellé coloré + « Basé sur vos {n} activité(s) pour l'année {année} ». Formule en §5.9 — **[BOGUÉ]**, à ne pas reconstruire en l'état.
3. Graphique « Évolution par période » (courbes Filles / Garçons / Moyenne). État vide : `Aucune donnée de période disponible`.
4. Graphique « Répartition des activités » (camembert du nombre d'activités par CP, « Nombre d'activités par CP (CP5 exclue) »).
5. Graphique « Comparaison Filles/Garçons par APSA » (barres groupées, « Moyennes regroupées par activité (CP5 exclue) »).
6. Onglets « Par APSA » / « Par CP ».

**Onglet « Par APSA »** : titre « Écarts Filles/Garçons par APSA », description « Différence de moyennes pour chaque activité ». Trois boutons de tri : « Trier par période », « Trier par CP », « Trier par activité » (tri alphabétique ; les périodes absentes sont envoyées en fin de liste via la valeur de tri `ZZZ`).

Chaque ligne : nom de l'APSA, `{code CP} - {classe}`, badge de période, puis Filles / Garçons / **Écart signé** avec code couleur (§5.13). L'écart positif est préfixé `+`.

**Onglet « Par CP »** : titre « Écarts Filles/Garçons par CP », description « Analyse par compétence propre (Collège - CP1 à CP4) ». Par CP : code, intitulé, écart moyen (2 décimales), « {n} activité(s) analysée(s) ».

**État vide global** :
> Aucune donnée statistique disponible pour l'année {année}.
> Commencez par saisir des moyennes de notes pour vos activités dans la page Perso.

avec un bouton « Accéder à ma page perso ».

### 3.9 Écran — Statistiques établissement

*Source : `app/stats/etablissement/page.tsx` (924 lignes)*

**Chemin** : `/stats/etablissement`. C'est l'écran central du module.

En-tête : « Statistiques Établissement » / « {nom} - {type} (CP1 à CP{n}) » + sélecteur d'année + bouton « Voir mes stats perso ».

**Données prises en compte** : toutes les saisies de l'établissement, pour l'année sélectionnée, avec moyennes filles **et** garçons renseignées, CP5 exclue si l'établissement est un collège.

**Contenu, dans l'ordre**

1. **Carte du Label** — titre « Label Égalité - Année {année} » + bouton ⓘ (§3.10.3), description « {type} (CP1 à CP{n}{ - CP5 exclue si collège}) ».
   - Libellé du label en très gros, couleur associée.
   - « Score : {n}/100 ».
   - Quatre vignettes de détail : « Écart F/G (40%) », « Couverture CP (30%) », « Équilibre CP (20%) », « Quiz vigilance (10%) », chacune avec son sous-score entier. La vignette quiz affiche `0` et la mention « Aucun quiz » si personne n'a répondu.
   - Un texte d'accompagnement selon le label (§4.4).
   - Si des quiz existent : bandeau violet « **Quiz de vigilance :** {n} professeur(s) ont répondu - Moyenne : {m}/15 ».

2. **Alerte de déséquilibre CP** — affichée si au moins une CP présente une déviation > 0,5 :
   > **Déséquilibre détecté dans la répartition des enseignements par CP**
   > Certaines CP sont sur ou sous-représentées par rapport à une répartition équilibrée. Pour améliorer votre Label, essayez d'équilibrer le nombre d'enseignements (APSA × classes) dans chaque CP.

   Suivie d'une puce par CP : `{CP}: {n} enseignement(s) ({p}%)`, en ambre si la déviation dépasse 0,5, en vert sinon.

3. **Quatre cartes de synthèse** : « Activités analysées » (« Total établissement »), « Écart moyen F/G » (« Points d'écart absolu »), « Couverture CP » au format `{n} / {total}` (« {p}% des CP travaillées »), « Quiz vigilance » au format `{m}/15` ou `-` (« {n} répondant(s) » ou « Aucune donnée »).

4. **Graphique « Comparaison Filles/Garçons par CP »** — barres groupées, description « Moyennes comparées pour chaque compétence propre ».

5. **Graphique « Poids des CP (nombre d'enseignements) »** — camembert, description « Répartition des enseignements (APSA × classes) par CP ». État vide : `Associez des APSA aux classes pour voir cette répartition`.

6. **Graphique « Écarts moyens par CP »** — barres simples, description « Différence absolue Filles/Garçons ».

7. **Carte « Analyse par Compétence Propre »** — par CP : code, intitulé, « {n} évaluation(s) • {p} enseignement(s) », puis Moy. Filles / Moy. Garçons / Écart moyen avec code couleur.
   Si la couverture est incomplète : encadré jaune en pointillés — `**CP non couvertes :** Il manque {n} CP pour une couverture complète.`

8. **Carte « Influence du sexe du professeur »** — description « Analyse comparative des écarts F/G selon le sexe de l'enseignant ». Deux blocs : « Professeurs hommes » (bleu) et « Professeures femmes » (rose), chacun avec l'écart moyen et « Écart moyen sur {n} activité(s) ». Si les deux groupes sont peuplés, une phrase d'analyse (§4.5.2).

9. **Carte « Influence de la répartition Filles/Garçons »** — description « Impact de la composition des classes sur les écarts de moyennes ». Trois blocs : « Majorité de filles (>60%) », « Équilibrée (40-60%) », « Majorité de garçons (>60%) », chacun avec l'écart moyen et « {n} données ». Puis une phrase d'analyse (§4.5.3).

⚠️ **[BOGUÉ]** Le troisième bloc est intitulé « Majorité de garçons (**>60%**) » alors que le critère effectif est « **moins de 40 % de filles** ». Le libellé est trompeur mais le calcul est cohérent.

**État vide global** :
> Aucune donnée statistique disponible pour l'année {année}.
> Les professeurs doivent commencer à saisir des moyennes de notes dans leur page personnelle.

avec un bouton « Accéder à ma page perso ».

⚠️ **[BOGUÉ]** Quand aucune activité n'est trouvée, **tout l'écran bascule sur l'état vide**, y compris le label, alors même que des associations APSA↔classes et des quiz peuvent exister. Une équipe qui a fait toute sa programmation mais pas encore saisi de notes ne voit rien.

### 3.10 Modales d'information

#### 3.10.1 « À propos d'EPS Égalité »

*Source : `components/eps-info-modal.tsx`* — Déclenchée par un bouton ⓘ sur la page d'accueil (deux emplacements). Contenu intégral repris en §4.6, bibliographie en §4.7.1.

#### 3.10.2 « Ressources pédagogiques »

*Source : `components/sources-modal.tsx`* — Déclenchée depuis le tableau de bord. Description : « Informations sur l'égalité filles-garçons en EPS et sources bibliographiques ». Deux onglets : « Comprendre les enjeux » (version abrégée de §4.6) et « Sources bibliographiques » (§4.7.2).

⚠️ **[BOGUÉ mineur]** Le contenu de l'onglet « Comprendre les enjeux » **duplique** celui de la modale « À propos » dans une version tronquée. Deux textes à maintenir pour un seul contenu. **[RECO]** : source unique.

#### 3.10.3 « Comment est calculé le Label Égalité ? »

*Source : `components/label-info-modal.tsx`* — Déclenchée par un ⓘ à côté du titre du label sur l'écran de statistiques d'établissement. Contenu intégral en §4.5.1.

⚠️ **[BOGUÉ — important]** Cette modale **contredit la formule réellement appliquée** sur le critère de l'écart F/G. Voir §5.7.5.

### 3.11 Écran — Mentions légales

*Source : `app/legal/page.tsx`* — Chemin `/legal`. Dix sections : éditeur, hébergement, RGPD (responsable, données collectées, finalités, base légale, durée de conservation, destinataires), sécurité, droits des utilisateurs, cookies, propriété intellectuelle, limitation de responsabilité, modifications, contact. Date de mise à jour générée dynamiquement à l'affichage.

**Dans coordo-eps** : **doublon** — les mentions légales sont celles de l'hôte. **Mais** deux éléments doivent y être **ajoutés** par le module (§9.4) : la nature des données pédagogiques traitées et le traitement du sexe de l'enseignant.

### 3.12 Éléments transverses

#### 3.12.1 Navigation

*Source : `components/nav-bar.tsx`* — Barre supérieure : logo « EPS Égalité » → `/dashboard` ; quatre entrées (Tableau de bord, Établissement, Page Perso, Statistiques) avec état actif ; menu « Suite d'outils » (liens externes ProfAssist, Demi-fond) ; bouton « Déconnexion ». Version mobile : entrées en défilement horizontal.

*Source : `components/footer.tsx`* — Pied de page : « © {année} LD Teach & Tech - Tous droits réservés », menu « Mes autres applications », contact, lien « Mentions légales ».

**Dans coordo-eps** : **doublon intégral**.

#### 3.12.2 Sélecteur d'année scolaire

*Source : `components/school-year-selector.tsx`* — Libellé « Année scolaire : », liste de 5 années allant de `annéeCourante−2` à `annéeCourante+2`, au format `AAAA-AA`. L'année scolaire en cours est suffixée « (actuelle) ».

⚠️ **[BOGUÉ]** Trois défauts, détaillés en §9.2.2 :
1. La valeur initiale est **codée en dur à `"2025-26"`** dans les trois écrans qui utilisent ce composant, au lieu de l'année courante calculée.
2. Le quiz, lui, utilise toujours l'année courante réelle. À partir de septembre 2026, les écrans de statistiques affichent par défaut 2025-26 alors que les quiz s'enregistrent en 2026-27 : **le critère quiz du label tombe à 0 sur la vue par défaut**.
3. À partir de 2028, `"2025-26"` sortira de la plage proposée et le sélecteur affichera une valeur absente de sa propre liste.

#### 3.12.3 Application installable (PWA)

*Sources : `public/manifest.json`, `public/sw.js`, `components/pwa-register.tsx`* — Manifeste complet (nom, icônes 192 et 512, couleur de thème `#2563eb`, affichage `standalone`, orientation portrait) et service worker en cache réseau-d'abord, ignorant les requêtes non-GET, le manifeste et les appels à la base de données.

⚠️ **[MORT]** Le composant `PWARegister` **n'est monté nulle part** : il n'apparaît ni dans `app/layout.tsx` ni dans aucune page. Le service worker n'est donc jamais enregistré. **La PWA ne fonctionne pas**, malgré le manifeste déclaré dans les métadonnées.

**Dans coordo-eps** : relève de l'hôte. Ne pas reconstruire.

---

## 4. Contenus métier complets

> Tous les textes de cette section sont **recopiés à l'identique** depuis le code source. Ils constituent le contenu pédagogique du module et doivent être repris mot pour mot.

### 4.1 Référentiel des Compétences Propres

*Source : `supabase/migrations/001_initial_schema.sql:87-96`*

Table globale, identique pour tous les établissements, pré-remplie à l'initialisation. Clé unique : `code`.

| Code | Intitulé (`label`) | Description |
|---|---|---|
| **CP1** | Réaliser une performance motrice maximale mesurable à une échéance donnée | Activités athlétiques, de natation |
| **CP2** | Se déplacer en s'adaptant à des environnements variés et incertains | Activités de pleine nature |
| **CP3** | Réaliser une prestation corporelle à visée artistique ou acrobatique | Activités artistiques, acrosport, gymnastique |
| **CP4** | Conduire et maîtriser un affrontement individuel ou collectif | Sports de combat, sports collectifs |
| **CP5** | Réaliser et orienter son activité physique en vue du développement et de l'entretien de soi | Activités de la forme, step, musculation |

**Libellés abrégés** utilisés dans la modale explicative (`components/label-info-modal.tsx:118-125`) :

| Code | Libellé abrégé |
|---|---|
| CP1 | Performance motrice mesurable |
| CP2 | Adaptation à l'environnement |
| CP3 | Prestation artistique/acrobatique |
| CP4 | Affrontement individuel/collectif |
| CP5 | Entretien de soi *(Lycées uniquement)* |

**Règle d'applicabilité** : CP5 est exclue pour les établissements de type `college` — à la fois du choix des APSA (§3.5.4), du calcul du label (§5.7) et des statistiques personnelles (§3.8).

### 4.2 Quiz de vigilance — questions intégrales

*Source : `components/vigilance-quiz.tsx:47-75`*

Cinq questions, posées dans cet ordre. Le « titre » est l'intitulé thématique affiché au-dessus de l'énoncé.

---

**Q1 — Interactions verbales**

> Dans mes régulations et mes retours (gestion des contenus), est-ce que je m'assure activement d'adresser une attention et des interactions de qualité équivalentes aux filles et aux garçons ?

---

**Q2 — Évaluation**

> Mes référentiels d'évaluation valorisent-ils systématiquement le processus d'apprentissage (procédures, savoirs fondamentaux) et la progression auto-référencée plutôt que la seule performance athlétique maximale ou le résultat brut ?

---

**Q3 — Choix des APSA**

> Lorsque je programme des activités traditionnellement connotées masculines (ex : sports collectifs, athlétisme), est-ce que j'utilise des formes de pratique scolaire (FPS) explicitement conçues pour déconstruire les stéréotypes de genre et favoriser l'engagement équitable (ex : règles de non-contact, rôles tournants) ?

---

**Q4 — Rôles et groupement**

> J'évite de laisser les élèves constituer eux-mêmes les équipes, et j'impose une rotation stricte des rôles socio-participatifs (arbitre, observateur, secrétaire, preneur de décision) pour empêcher l'assignation stéréotypée par sexe ?

---

**Q5 — Intervention immédiate**

> J'intercepte et j'utilise immédiatement toute remarque ou comportement sexiste ou homophobe comme un objet d'éducation civique, plutôt que de laisser passer ou de tolérer l'indiscipline.

---

**Échelle de réponse** — identique pour les cinq questions, **non linéaire** :

| Libellé | Points | Description affichée |
|---|---|---|
| OUI | **3** | Je le fais systématiquement |
| Parfois | **1** | Je le fais de temps en temps |
| NON | **0** | Je ne le fais pas ou rarement |

**Score total** : 0 à 15 points.

⚠️ **Point de conception à noter** : l'échelle 3 / 1 / 0 n'est pas linéaire. « Parfois » vaut un tiers de « OUI », pas la moitié. Ce choix est volontaire — il pénalise la vigilance intermittente — et doit être conservé tel quel.

### 4.3 Niveaux de vigilance — textes intégraux

*Source : `components/vigilance-quiz.tsx:77-102`*

**Seuils** : niveau 1 pour 0–4 points, niveau 2 pour 5–8, niveau 3 pour 9–12, niveau 4 pour 13–15.

---

**Niveau 1 — Vigilance absente** *(rouge)*

> Ce résultat suggère que les pratiques actuelles ne prennent pas encore suffisamment en compte les enjeux d'égalité filles-garçons. C'est une opportunité de développement professionnel importante.

---

**Niveau 2 — Vigilance réactive** *(orange)*

> Vous êtes sensible aux questions d'égalité et réagissez ponctuellement. Pour progresser, il s'agit de passer d'une posture réactive à une démarche plus systématique et anticipée.

---

**Niveau 3 — Vigilance réflexive** *(bleu)*

> Vous intégrez régulièrement la dimension égalitaire dans votre enseignement. Votre pratique témoigne d'une réflexion professionnelle solide sur ces enjeux.

---

**Niveau 4 — Vigilance systémique** *(vert)*

> Votre pratique intègre pleinement et systématiquement les enjeux d'égalité. Vous êtes un moteur de transformation pour l'équipe pédagogique.

---

### 4.4 Labels d'établissement — libellés et textes

*Source : `app/stats/etablissement/page.tsx:239-252`, `:491-511`*

| Label | Plage de score | Couleur |
|---|---|---|
| **Équilibré** | 75 à 100 | vert |
| **En progrès** | 50 à 74 | jaune |
| **À renforcer** | 0 à 49 | orange |
| *Non calculé* | aucune donnée | gris |

**Textes d'accompagnement affichés sous le label**, exacts :

**Équilibré**
> Félicitations ! Votre établissement présente un bon équilibre entre les moyennes Filles/Garçons et une répartition harmonieuse des CP.

**En progrès**
> Votre établissement progresse dans l'égalité Filles/Garçons. Continuez vos efforts pour équilibrer les CP et réduire les écarts.

**À renforcer**
> Des efforts sont nécessaires pour améliorer l'égalité. Travaillez sur l'équilibre des CP et la réduction des écarts.

**Textes de la modale explicative** (`components/label-info-modal.tsx:192-247`), plus courts et légèrement différents :

| Label | Texte |
|---|---|
| Équilibré | Félicitations ! Votre établissement présente un excellent équilibre entre filles et garçons. |
| En progrès | Votre établissement progresse vers l'égalité. Continuez vos efforts ! |
| À renforcer | Des efforts sont nécessaires pour améliorer l'égalité F/G dans votre établissement. |

**[RECO]** : unifier ces deux jeux de textes.

### 4.5 Textes d'aide et d'interprétation

#### 4.5.1 Modale « Comment est calculé le Label Égalité ? »

*Source : `components/label-info-modal.tsx`* — contenu intégral.

**Introduction**
> Le **Label Égalité** évalue le niveau d'équilibre entre les filles et les garçons dans les pratiques d'EPS de votre établissement. Il est calculé sur 100 points à partir de 4 critères pondérés.

**Section « Selon votre type d'établissement »**

*Collège*
- **4 CP** prises en compte (CP1 à CP4)
- **CP5 exclue** du calcul
- Objectif : couvrir les 4 CP

*Lycée (GT / Pro)*
- **5 CP** prises en compte (CP1 à CP5)
- **CP5 incluse** dans le calcul
- Objectif : couvrir les 5 CP

**Section « Les 4 critères de calcul »**

**1. Écart moyen Filles/Garçons — 40 %**
> Mesure la différence absolue moyenne entre les notes des filles et des garçons.

Barème affiché : `< 0.5 pt` → 100 pts · `1 pt` → 50 pts · `> 2 pts` → 0 pts

⚠️ **[BOGUÉ]** Ce barème est **inexact** — voir §5.7.5.

**2. Couverture des Compétences Propres — 30 %**
> Évalue la diversité des CP enseignées par rapport au nombre attendu pour votre établissement.

Suivi de la liste abrégée des CP (§4.1).

**3. Équilibre des CP — 20 %**
> Mesure la répartition équilibrée des **enseignements** entre les différentes CP. Un enseignement = une APSA enseignée à une classe.

*Objectif :*
- Proposer des activités dans **toutes les CP**
- Avoir un **volume d'enseignement équilibré** par CP

*Exemple de calcul affiché :*
- CP1 : Natation (3 classes) + Athlétisme (2 classes) = **5 enseignements**
- CP4 : Badminton (1 classe) = **1 enseignement**
- → Déséquilibre : CP1 est 5× plus enseignée que CP4

**4. Quiz de vigilance pédagogique — 10 %**
> La moyenne des scores des professeurs au quiz de vigilance égalité. Basé sur les réponses des enseignants ayant complété le quiz.

> **Score max :** 15 points au quiz = 100% de contribution

**Formule affichée** (bloc sombre) :
```
Score = (Écart F/G × 0.40) + (Couverture CP × 0.30) + (Équilibre CP × 0.20) + (Quiz × 0.10)
```

**Section « Comment améliorer votre Label ? »** — cinq conseils, textes exacts :

1. Diversifiez les APSA pour couvrir toutes les CP de votre niveau
2. Équilibrez le volume d'enseignement entre les CP (évitez de sur-représenter une CP)
3. Adaptez vos évaluations pour valoriser les apprentissages plutôt que la performance brute
4. Invitez tous les professeurs à compléter le quiz de vigilance
5. Analysez les écarts par CP pour identifier les axes d'amélioration

#### 4.5.2 Phrases d'analyse — sexe du professeur

*Source : `app/stats/etablissement/page.tsx:838-845`* — une seule phrase affichée, préfixée « **Analyse :** ».

| Condition | Phrase |
|---|---|
| écart moyen hommes < écart moyen femmes | Les professeurs hommes obtiennent des écarts légèrement plus faibles que les professeures femmes. |
| écart moyen hommes > écart moyen femmes | Les professeures femmes obtiennent des écarts légèrement plus faibles que les professeurs hommes. |
| égalité stricte | Les écarts sont similaires entre professeurs hommes et femmes. |

⚠️ **[BOGUÉ]** La comparaison ne tient aucun compte de l'ampleur de la différence ni du nombre d'observations. Un écart de 0,01 point entre deux groupes de 2 activités produit une affirmation aussi assurée qu'un écart de 1 point sur 50 activités. Voir §9.3.4.

#### 4.5.3 Phrase d'analyse — composition des classes

*Source : `app/stats/etablissement/page.tsx:905-912`* — phrase à trous, préfixée « **Analyse :** » :

> Les classes équilibrées tendent à présenter **les écarts les plus faibles**.

ou

> Les classes équilibrées tendent à présenter **des écarts comparables aux autres configurations**.

Le premier libellé est retenu si l'écart moyen des classes équilibrées est strictement inférieur au plus petit des deux autres.

⚠️ **[BOGUÉ]** Si un groupe est vide, son écart moyen vaut 0 et devient donc le minimum, ce qui empêche mécaniquement la phrase favorable de s'afficher. Voir §9.3.4.

#### 4.5.4 Alerte de déséquilibre des CP

*Source : `app/stats/etablissement/page.tsx:531-538`*

> **Déséquilibre détecté dans la répartition des enseignements par CP**
> Certaines CP sont sur ou sous-représentées par rapport à une répartition équilibrée. Pour améliorer votre Label, essayez d'équilibrer le nombre d'enseignements (APSA × classes) dans chaque CP.

Puce par CP : `{CP}: {n} enseignement(s) ({p}%)`

#### 4.5.5 Alerte de couverture incomplète

*Source : `app/stats/etablissement/page.tsx:779-784`*

> **CP non couvertes :** Il manque {n} CP pour une couverture complète.

### 4.6 Modale « À propos d'EPS Égalité » — contenu intégral

*Source : `components/eps-info-modal.tsx:38-236`*

**Introduction**

> En EPS, les choix d'activités et les résultats au baccalauréat révèlent encore des écarts entre filles et garçons selon les compétences propres mobilisées. Les données montrent notamment une surreprésentation masculine dans les activités d'affrontement (CP4) et une meilleure réussite relative des filles dans les activités à visée expressive (CP3). Ces tendances ne traduisent pas des capacités naturelles différentes, mais renvoient souvent à des effets de socialisation, de stéréotypes persistants et à une offre d'APSA parfois peu questionnée.

> **EPS Égalité** a pour ambition de rendre ces déséquilibres visibles, de les objectiver par des données claires et d'accompagner les équipes dans une réflexion pédagogique éclairée, afin de construire une EPS plus juste, plus inclusive et réellement émancipatrice pour toutes et tous.

**Question centrale**

> ### Comment les stéréotypes de genre se manifestent et persistent dans l'enseignement de l'EPS ?

> Les stéréotypes de genre se manifestent et persistent dans l'enseignement de l'Éducation Physique et Sportive (EPS) par une combinaison complexe de facteurs didactiques, pédagogiques, culturels et évaluatifs, transformant la discipline en un lieu de production et de reproduction d'inégalités scolaires mesurables. L'EPS, discipline du corps, est particulièrement sensible aux injonctions de genre qui y sont immédiatement palpables.

---

**1. La domination d'une culture et d'un modèle masculin**

> L'enseignement de l'EPS est historiquement et culturellement attaché aux pratiques sportives compétitives. La culture transmise en EPS a une forte connivence avec la culture masculine, ce qui contribue à la domination des dimensions masculines.

**Choix des APSA :** Le curriculum en EPS privilégie souvent un modèle de puissance et de performance à forte valence masculine. Les stéréotypes de sexe sont fondés sur des oppositions binaires hiérarchisées impliquant la supériorité du masculin sur le féminin. Par exemple, le handball, le football et le rugby sont connotés socialement comme masculins, tandis que la danse est perçue comme féminine.

**Curriculum Caché :** La persistance des stéréotypes est alimentée par un curriculum caché bâti autour d'une culture sportive plutôt masculine. Même lorsque des APSA potentiellement moins connotées sont introduites (comme l'escalade, le cirque ou le badminton), la motricité privilégiée reste souvent empreinte de valeurs masculines (force, vitesse, prise de risque).

---

**2. Les pratiques pédagogiques différenciées des enseignant(e)s**

> Les enseignant(e)s, bien que majoritairement favorables à la mixité, sont sous l'influence des stéréotypes et participent à la fabrication scolaire des inégalités.

**Interactions Enseignant(e)-Élèves :** Les garçons bénéficient généralement d'une attention plus conséquente et d'interactions de meilleure qualité (loi des 2/3 - 1/3, ou 58% pour les garçons contre 42% pour les filles). Les garçons mettent en œuvre une "stratégie d'accaparement" de l'attention enseignante.

**Discours et Attentes (Effet Pygmalion) :** Les enseignant(e)s ont des attentes stéréotypées envers les élèves (indiscipline des garçons / docilité des filles). Ces attentes peuvent fonctionner comme des "prophéties auto-réalisatrices". Le discours des enseignant(e)s peut être sexué : on décrit ce qui est « beau » pour les filles et ce qui est « risqué » pour les garçons.

**Différenciation et Contenus d'Enseignement :** Certaines pratiques de différenciation naturalisent et renforcent les différences. Par exemple, la différenciation peut se traduire par une dégradation de la tâche initiale pour les filles ou par l'attribution de rôles stéréotypés : arbitrage pour les garçons et secrétariat pour les filles.

---

**3. Les biais dans l'évaluation**

> L'évaluation en EPS est le domaine où les élèves perçoivent le plus d'injustices et constitue un facteur structurel majeur des inégalités de réussite.

**Écart de Notation :** Les résultats des filles en EPS sont systématiquement inférieurs à ceux des garçons. L'écart de note, qui persiste de manière significative, est d'environ 1,21 point en moyenne en faveur des garçons (e.g., 13,25 pour les filles contre 14,46 pour les garçons).

**Modèle d'Évaluation :** L'évaluation est restée fortement orientée vers la performance motrice maximale et la confrontation. Les épreuves athlétiques, où la performance physique prime, sont privilégiées pour la certification.

**Mesure des Capacités Innées :** L'évaluation a tendance à mesurer les capacités innées (déterminations génétiques, hormonales) plutôt que les apprentissages réels issus de l'enseignement. Par conséquent, l'EPS mesure le sexe des élèves et non les transformations issues des enseignements.

**APSA Discriminantes :** Les activités les plus souvent évaluées, comme l'athlétisme, le volley-ball et le badminton, sont souvent les plus discriminantes, avec les plus grands écarts de notes en défaveur des filles.

---

**4. L'intériorisation par les élèves et les comportements sexués**

> Les élèves eux-mêmes contribuent à la persistance des stéréotypes en intériorisant les rôles sociaux attendus, influencés par la socialisation et les attentes de l'école.

**Déclin de l'Intérêt :** Les résultats des filles en EPS tendent à décroître à l'adolescence, car la socialisation les pousse à restreindre leur motricité pour correspondre aux critères de séduction, tandis que la virilité masculine est associée à la force et à la puissance.

**Pression de la Féminité :** Les filles utilisent la pratique physique pour répondre aux normes sociales du corps féminin. Elles craignent d'être jugées ou moquées et cherchent à maîtriser le regard masculin (male gaze) en évitant de transpirer ou en choisissant des vêtements amples.

**Options Comportementales :** Face à ce contexte, les filles ont le choix entre se conformer aux modèles masculins ou se distinguer en "sur-jouant la féminité", allant parfois jusqu'à simuler une quasi-« débilité motrice ». Elles s'estiment moins compétentes dans les matières qu'elles perçoivent comme "non faites pour elles".

**"Loi des garçons" :** En milieu mixte, les filles doivent faire face à la « loi des garçons » qui dominent et contrôlent les jeux et l'espace, les réduisant parfois au rôle de spectatrices passives.

---

**Conclusion**

> Ces manifestations s'entremêlent pour maintenir une **mixité inégale** en EPS, où l'égalité est souvent mise en œuvre sous condition de performance de la différence sexuée, loin du principe d'une « égalité sans condition ».

> Pour illustrer comment la persistance des stéréotypes opère, on peut considérer l'enseignement de l'EPS comme un **terrain de jeu penché**. Si les règles (les programmes officiels) affirment l'égalité, l'inclinaison historique et culturelle du terrain, centrée sur les APSA masculines, fait que le ballon roule naturellement vers le camp des garçons (la réussite et l'attention). Les efforts pédagogiques visant à compenser cette pente (comme les barèmes différenciés) s'avèrent insuffisants car ils tentent de corriger le résultat plutôt que de redresser le terrain lui-même (le curriculum et les pratiques d'enseignement).

### 4.7 Bibliographie

#### 4.7.1 Liste de références courte

*Source : `components/eps-info-modal.tsx:209-232`* — affichée en fin de modale « À propos », sous le titre « Sources », numérotée.

1. Analyse didactique des pratiques d'enseignement en EPS selon le genre en contexte d'éducation prioritaire : des pistes pour tendre vers davantage d'égalité filles et garçons (Claire Debars)
2. Les inégalités de réussite en EPS entre filles et garçons : déterminisme biologique ou fabrication scolaire ? (Revue française de pédagogie, ResearchGate, Cairn)
3. Mixité, égalité et pratiques en éducation physique et sportive
4. Rapport d'Expertise : L'Égalité Filles-Garçons en Éducation Physique et Sportive (EPS) en France : Diagnostic, Enjeux Didactiques et Stratégies de Transformation
5. La vigilance des enseignant-e-s d'éducation physique et sportive relative à l'égalité des filles et des garçons
6. Les conceptions de l'évaluation, la régulation des ... (ResearchGate)
7. Évaluer les filles en EPS (Francis Huot)
8. Désapprendre les stéréotypes en EPS (Mathieu Rolan)
9. Égalité filles/garçons en EPS (Odile Maufrais et Nathalie Carminatti)
10. Mixité sexuée et EPS (Mathieu Jean)
11. Agir pour l'égalité filles-garçons en établissement public local d'enseignement (EPLE) - collection académique (2024-2025)
12. Filles et garçons sur le chemin de l'égalité, de l'école à l'enseignement supérieur (DEPP)
13. Formation à l'égalité filles-garçons : Faire des personnels enseignants et d'éducation les moteurs de l'apprentissage et de l'expérience de l'égalité
14. Projet de programmes d'éducation physique et sportive du cycle 4
15. Les inégalités de réussite en EPS entre filles et garçons (Cécile Vigneron, Cairn.info)
16. L'évaluation en EPS : entre légitimité disciplinaire et défis culturels (1959-2009) - Cairn
17. Égalité entre les filles et les garçons - Ministère de l'Éducation nationale
18. Rapport « Formation à l'égalité filles-garçons » | HCE
19. Dossier pédagogique Les femmes et le sport (France Archives)
20. Document Ministère de l'Éducation nationale

#### 4.7.2 Bibliographie commentée

*Source : `components/sources-modal.tsx:203-333`* — onglet « Sources bibliographiques », trois sections.

---

**I. Rapports d'expertise et documents institutionnels**

*Ces documents établissent le cadre de la politique d'égalité et insistent sur la déconstruction des stéréotypes.*

- **Rapport du Haut Conseil à l'Égalité (HCE) :** *Formation à l'égalité filles-garçons : Faire des personnels enseignants et d'éducation les moteurs de l'apprentissage et de l'expérience de l'égalité.*
  > Ce rapport fait le lien entre la formation des personnels et la lutte contre les stéréotypes. Il rappelle que l'Égalité filles-garçons doit être une connaissance requise pour l'obtention des diplômes d'enseignant et d'encadrement.

- **Ressource IH2EF (Institut des hautes études de l'éducation et de la formation) :** *Agir pour l'égalité filles-garçons en établissement public local d'enseignement (EPLE).*
  > Cette ressource vise à aider les établissements à mettre en place une stratégie pour l'égalité filles-garçons et à en évaluer l'efficacité.

- **Publication du Ministère de l'Éducation nationale (DEPP) :** *Filles et garçons sur le chemin de l'égalité, de l'école à l'enseignement supérieur, édition 2024.*
  > Il s'agit d'une publication annuelle de la Direction de l'évaluation, de la prospective et de la performance (DEPP) traitant des statistiques d'égalité.

- **Projet de programmes d'EPS du Cycle 4 (Collège) :** *Projet de programmes d'éducation physique et sportive du cycle 4 (Juillet 2025).*
  > Ces programmes stipulent que l'élève doit comprendre la diversité des facteurs qui expliquent les différences de performances entre les filles et les garçons et mettent en avant l'égalité filles-garçons comme un enjeu citoyen.

---

**II. Études académiques sur la « Fabrication Scolaire » et l'Inconscient**

*Ces recherches analysent comment les inégalités sont produites en classe, souvent de manière involontaire (inconsciente) par les enseignants et la didactique.*

- **Vigneron, Cécile :** *Les inégalités de réussite en EPS entre filles et garçons : déterminisme biologique ou fabrication scolaire ?* (2006).
  > Cet article fondateur pose la question centrale du sujet audio, cherchant à déterminer si les écarts de réussite sont dus à des facteurs biologiques ou à des mécanismes scolaires.

- **Debars, Claire :** *Analyse didactique des pratiques d'enseignement en EPS selon le genre en contexte d'éducation prioritaire...* (Présentation 2022, basée sur sa thèse 2020).
  > Cette analyse conclut à l'existence de « processus implicites que les enseignant∙es font fonctionner de manière inconsciente ». Ces processus incluent un choix d'APSA et de contenus discriminants, un curriculum caché bâti autour d'une culture sportive plutôt masculine, et plus d'interactions des enseignant∙es avec les garçons qu'avec les filles.

- **Couchot-Schiex, Sigolène :** *Chapitre 5. Les normes de sexes dans les interactions enseignant.e et élèves. Deux études de cas en Éducation Physique et Sportive* (2013).
  > Ce chapitre examine directement les normes de sexes dans les interactions professeur-élèves en EPS.

- **Patinet-Bienaimé, Catherine et Cogérino, Geneviève :** *La vigilance des enseignant-e-s d'éducation physique et sportive relative à l'égalité des filles et des garçons* (2011).
  > Cette étude explore la faible vigilance des enseignants relative à l'égalité des sexes et note que les indices perceptifs des enseignants sont différenciés.

---

**III. Travaux sur l'évaluation et les pratiques didactiques**

*Ces sources détaillent comment les biais se manifestent dans l'enseignement et comment les corriger.*

- **Pistes didactiques et évaluation (Articles e-novEPS) :**
  > **Francis Huot (2021)** préconise de revoir la méthodologie de construction des grilles d'évaluation pour les aligner sur le projet de formation et non sur un élève type masculin, afin de rétablir l'équité.
  > **Mathieu Rolan (2021)** propose de s'éloigner des connotations stéréotypées des APSA en se focalisant sur les expériences à vivre pour identifier des enjeux éducatifs "asexués".

- **Hariti, H. et al. :** *Les conceptions de l'évaluation, la régulation des...*
  > Ce document note que l'évaluation en EPS est le domaine où les élèves perçoivent le plus d'injustices et que l'EPS est une discipline à forte connotation masculine.

- **Maufrais, Odile et Carminatti, Nathalie :** *Égalité filles/garçons en EPS*
  > Cette formation propose des pistes pour dépasser le curriculum masculiniste et pour lutter contre les inégalités dans l'occupation de l'espace.

---

**Autres sources consultées** — liste de 17 entrées reprenant les items 1 à 17 de §4.7.1.

### 4.8 Listes fermées

| Liste | Valeurs (valeur technique → libellé) | Source |
|---|---|---|
| **Type d'établissement** | `college` → Collège · `lycee_gt` → Lycée Général et Technologique · `lycee_pro` → Lycée Professionnel | `app/etablissement/page.tsx:19-23` |
| **Sexe de l'enseignant** | `male` → Homme · `female` → Femme · `other` → Autre · `prefer_not_to_say` → Préfère ne pas répondre | `app/auth/signup/page.tsx:190-199` |
| **Période** | Trimestre 1 · Trimestre 2 · Trimestre 3 · Semestre 1 · Semestre 2 *(valeur = libellé)* | `components/perso-manager.tsx:64-70` |
| **Année scolaire (saisie)** | 2023-24 · 2024-25 · 2025-26 (actuelle) · 2026-27 | `components/perso-manager.tsx:561-566` — **codée en dur** |
| **Année scolaire (filtres)** | 5 valeurs glissantes de `annéeCourante−2` à `annéeCourante+2` | `components/school-year-selector.tsx:21-27` |
| **Label d'établissement** | Équilibré · En progrès · À renforcer | §4.4 |
| **Niveau de vigilance** | 1 à 4 | §4.3 |

⚠️ Les deux listes d'années scolaires sont **différentes**. Voir §9.2.2.

### 4.9 Ressources externes référencées

| Ressource | Nature | Emplacement |
|---|---|---|
| « État des lieux de l'égalité filles / garçons en EPS en France » | Podcast audio, hébergé sur Google Drive, produit avec NotebookLM | Tuile du tableau de bord (`app/dashboard/page.tsx:325`) |
| ProfAssist (`profassist.net`) | Lien externe, autre produit de l'éditeur | Menu « Suite d'outils » et pied de page |
| Demi-fond (`demifond.netlify.app`) | Lien externe, autre produit de l'éditeur | Menu « Suite d'outils » et pied de page |

**[RECO]** : dans coordo-eps, conserver le podcast (contenu métier du module) et supprimer les liens croisés vers les autres produits, qui relèvent de l'hôte.

---

## 5. Logique de calcul complète

> **Principe général** : tous les calculs sont effectués **côté client**, en pleine précision flottante. L'arrondi n'intervient **qu'à l'affichage**. Aucun résultat intermédiaire n'est stocké en base.

### 5.0 Jeu de données de référence

Tous les exemples chiffrés de cette section portent sur le même jeu de données fictif, afin qu'ils s'enchaînent.

**Établissement** : Collège Victor Hugo · type `college` → **4 CP prises en compte, CP5 exclue** · année analysée : **2025-26**

**Enseignants** : Alice (*female*), Bruno (*male*), Chloé (*female*)

**Classes**

| Classe | Filles | Garçons | Total |
|---|---|---|---|
| 5e1 | 18 | 8 | 26 |
| 5e2 | 13 | 13 | 26 |
| 4e1 | 12 | 13 | 25 |
| 4e2 | 14 | 12 | 26 |
| 3eB | 11 | 14 | 25 |
| 3eC | 9 | 17 | 26 |

**APSA et associations aux classes pour 2025-26**

| APSA | CP | Classes associées | Enseignements |
|---|---|---|---|
| Demi-fond | CP1 | 5e1, 5e2, 4e1, 4e2 | 4 |
| Natation | CP1 | 3eB, 3eC | 2 |
| Acrosport | CP3 | 5e1, 4e1, 3eB | 3 |
| Badminton | CP4 | 5e1, 5e2, 4e1, 4e2, 3eB | 5 |
| Handball | CP4 | 3eB, 3eC | 2 |
| *(aucune)* | CP2 | — | **0** |

**Évaluations saisies pour 2025-26** (moyennes filles **et** garçons renseignées)

| # | APSA | CP | Classe | Professeur | Période | Moy. Filles | Moy. Garçons |
|---|---|---|---|---|---|---|---|
| A | Badminton | CP4 | 4e2 | Bruno | Trimestre 1 | 12,40 | 14,10 |
| B | Acrosport | CP3 | 5e1 | Alice | Trimestre 2 | 15,20 | 14,90 |
| C | Demi-fond | CP1 | 3eC | Chloé | Trimestre 1 | 11,60 | 12,40 |

**Quiz** : Alice a répondu (12/15), Bruno a répondu (9/15), Chloé n'a pas répondu.

---

### 5.1 Écart Filles/Garçons d'une évaluation

*Source : `app/stats/perso/page.tsx:549`, `app/stats/etablissement/page.tsx:155-158`*

Deux variantes coexistent et servent des usages différents.

**Écart signé** — utilisé pour l'affichage détaillé par activité :
```
écart_signé = moyenne_filles − moyenne_garçons
```
Affiché avec 2 décimales, préfixé `+` s'il est positif. Un écart positif signifie que les filles ont la meilleure moyenne.

**Écart absolu** — utilisé pour toutes les agrégations :
```
écart_absolu = | moyenne_filles − moyenne_garçons |
```

**Traitement des valeurs manquantes** : les évaluations dont la moyenne filles **ou** la moyenne garçons est absente sont **exclues en amont** par la requête. Dans le calcul, `(a.avg_score_girls || 0)` remplace néanmoins toute valeur absente ou nulle par 0.

⚠️ **[BOGUÉ]** Cette substitution transforme une **moyenne réellement égale à 0** en valeur manquante, et vice-versa. Une moyenne de 0,00 est certes improbable, mais la construction est incorrecte. **[RECO]** : traiter explicitement `null` et rejeter la ligne, plutôt que de la ramener à 0.

**Exemple chiffré** — évaluation A (Badminton 4e2) :
```
écart_signé  = 12,40 − 14,10 = −1,70   → affiché « −1.70 » en rouge
écart_absolu = |−1,70|       =  1,70
```

### 5.2 Écart moyen global

*Source : `app/stats/etablissement/page.tsx:160`, `app/stats/perso/page.tsx:99`*

Moyenne arithmétique **non pondérée** des écarts absolus de toutes les évaluations retenues.

```
écart_moyen = Σ |moyenne_filles(i) − moyenne_garçons(i)|  /  nombre_évaluations
```

**Non pondéré signifie** : une évaluation portant sur une classe de 30 élèves pèse autant qu'une évaluation portant sur une classe de 15. **[RECO]** : envisager une pondération par effectif, puisque l'effectif est disponible (P3).

**Affichage** : 2 décimales.

**Exemple chiffré**
```
écarts absolus : |−1,70| = 1,70  ·  |+0,30| = 0,30  ·  |−0,80| = 0,80
somme          : 1,70 + 0,30 + 0,80 = 2,80
écart_moyen    : 2,80 / 3 = 0,93333…
affiché        : 0.93
```

**Cas limites**

| Cas | Comportement existant |
|---|---|
| Aucune évaluation | La requête ne renvoie rien → l'écran bascule sur l'état vide, `écart_moyen = 0` |
| Une seule évaluation | L'écart moyen vaut l'écart de cette évaluation. **Aucun seuil minimal de robustesse.** **[RECO]** : afficher un avertissement en dessous de 5 évaluations |

### 5.3 Couverture des Compétences Propres

*Source : `app/stats/etablissement/page.tsx:206-212`*

```
CP_couvertes = nombre de CP distinctes ayant AU MOINS UNE ÉVALUATION SAISIE
CP_attendues = 4 si type = college, sinon 5
couverture_% = (CP_couvertes / CP_attendues) × 100
```

⚠️ **Point capital** : la couverture se fonde sur les **évaluations saisies** (`class_activities`), **pas** sur la programmation déclarée (`apsa_classes`). Une CP programmée mais non encore évaluée compte comme **non couverte**.

**Affichage** : `{couvertes} / {attendues}` et `{pourcentage arrondi à l'entier}% des CP travaillées`.

**Exemple chiffré**
```
CP présentes dans les évaluations : CP4 (A), CP3 (B), CP1 (C) → 3 CP
CP attendues (collège)                                        → 4
couverture = 3 / 4 = 75 %
affiché : « 3 / 4 » et « 75% des CP travaillées »
```

**Cas limites**

| Cas | Comportement |
|---|---|
| Une CP programmée mais non évaluée | Compte comme non couverte |
| Un collège ayant des évaluations en CP5 (données héritées) | Les évaluations CP5 sont filtrées en amont, donc invisibles du calcul |
| Une CP peut-elle être comptée plus d'une fois ? | Non, comptage de clés distinctes |

### 5.4 Poids d'une Compétence Propre

*Source : `app/stats/etablissement/page.tsx:176-184`*

```
poids(CP) = nombre d'associations APSA↔classe rattachées à cette CP, pour l'année sélectionnée
poids_total = Σ poids(CP)
```

Une association = **un enseignement** : une APSA enseignée à une classe. Le filtrage CP5 en collège s'applique aussi ici.

**Affichage** : « {n} enseignement(s) » et pourcentage du total à 1 décimale.

**Exemple chiffré**
```
CP1 : Demi-fond (4 classes) + Natation (2 classes)   = 6 enseignements → 6/16 = 37,5 %
CP2 : aucune APSA                                     = 0 enseignement  → absente
CP3 : Acrosport (3 classes)                           = 3 enseignements → 3/16 = 18,8 %
CP4 : Badminton (5 classes) + Handball (2 classes)    = 7 enseignements → 7/16 = 43,8 %
poids_total = 6 + 0 + 3 + 7 = 16
```

⚠️ **[BOGUÉ]** Une CP sans aucune association **n'apparaît pas** dans la structure de résultat. CP2 n'existe tout simplement pas dans le calcul, au lieu d'y figurer avec un poids de 0. C'est la cause directe du biais décrit en §5.5.

### 5.5 Équilibre des Compétences Propres

*Source : `app/stats/etablissement/page.tsx:186-205`*

**Formule**
```
poids_idéal        = poids_total / CP_attendues
déviation(CP)      = | poids(CP) − poids_idéal | / poids_idéal
déviation_moyenne  = Σ déviation(CP) / nombre de CP AYANT AU MOINS UN ENSEIGNEMENT
score_équilibre    = max(0, 100 − déviation_moyenne × 100)
```

Protection contre la division par zéro : si `poids_idéal` vaut 0, le diviseur est remplacé par 1.

**Exemple chiffré**
```
poids_idéal = 16 / 4 = 4

déviation(CP1) = |6 − 4| / 4 = 2/4 = 0,50
déviation(CP3) = |3 − 4| / 4 = 1/4 = 0,25
déviation(CP4) = |7 − 4| / 4 = 3/4 = 0,75
(CP2 est absente de la structure : elle n'entre pas dans le calcul)

somme des déviations = 0,50 + 0,25 + 0,75 = 1,50
nombre de CP présentes = 3
déviation_moyenne = 1,50 / 3 = 0,50

score_équilibre = max(0, 100 − 0,50 × 100) = 50
affiché : 50
```

⚠️ **[BOGUÉ — majeur] Le biais des CP absentes**

Le dénominateur ne compte que les CP **présentes**. Une CP totalement absente de la programmation n'est jamais pénalisée par ce critère.

*Démonstration sur l'exemple :* si CP2 était correctement comptée avec un poids de 0, sa déviation serait `|0 − 4| / 4 = 1,00`, et l'on aurait :
```
somme = 0,50 + 0,25 + 0,75 + 1,00 = 2,50
déviation_moyenne = 2,50 / 4 = 0,625
score_équilibre = max(0, 100 − 62,5) = 37,5   au lieu de 50
```
Soit **12,5 points d'équilibre gagnés indûment**, c'est-à-dire 2,5 points sur le score final.

*Cas plus frappant :* une équipe qui répartit 12 enseignements également sur CP1, CP2 et CP3 en ignorant totalement CP4 obtient un score d'équilibre de **66,7** (déviations de 1/3 chacune sur un idéal de 3), alors qu'elle laisse un quart du référentiel de côté. Avec CP4 comptée à 0, elle obtiendrait **50**.

**[RECO]** : itérer sur **les CP attendues** et non sur les CP présentes. Correction d'une ligne, effet majeur sur la justesse du label.

⚠️ **[BOGUÉ] Aucune programmation déclarée = 0 point sur 20**

Si l'équipe n'a créé **aucune** association APSA↔classe pour l'année, la structure de poids est vide, `déviation_moyenne` est forcée à **1**, et le score d'équilibre vaut **0**. L'équipe perd 20 points sur 100 alors même qu'elle a pu saisir toutes ses moyennes. C'est une pénalité invisible : rien dans l'interface n'indique que l'onglet APSA doit être renseigné pour obtenir un label correct.

**[RECO]** : soit dériver le poids des CP depuis les évaluations saisies quand aucune programmation n'existe, soit exclure le critère d'équilibre du calcul et renormaliser (même logique qu'en §5.7.4 pour le quiz), soit bloquer explicitement l'affichage du label avec un message d'action.

**Seuil d'alerte** : une CP dont la déviation dépasse **strictement 0,50** est signalée en ambre et déclenche l'encart d'alerte (§4.5.4). Dans l'exemple, CP1 à 0,50 exactement **n'est pas** signalée ; CP4 à 0,75 l'est.

### 5.6 Quiz de vigilance

*Source : `components/vigilance-quiz.tsx:232-234`, `:166`*

#### 5.6.1 Score individuel

```
score = Σ points des 5 réponses          (OUI = 3, Parfois = 1, NON = 0)
→ entier de 0 à 15
```

#### 5.6.2 Niveau de vigilance

```
niveau = 1  si score ≤ 4
         2  si score ≤ 8
         3  si score ≤ 12
         4  sinon
```

| Niveau | Plage | Amplitude |
|---|---|---|
| 1 — Vigilance absente | 0 – 4 | 5 valeurs |
| 2 — Vigilance réactive | 5 – 8 | 4 valeurs |
| 3 — Vigilance réflexive | 9 – 12 | 4 valeurs |
| 4 — Vigilance systémique | 13 – 15 | 3 valeurs |

#### 5.6.3 Pourcentage individuel

```
pourcentage = arrondi_entier( score / 15 × 100 )
```

#### 5.6.4 Agrégation d'établissement

```
moyenne_établissement = moyenne arithmétique des scores des enseignants AYANT RÉPONDU
nombre_répondants     = nombre d'enseignants ayant répondu
```

Les enseignants n'ayant pas répondu ne comptent **ni au numérateur, ni au dénominateur**.

**Affichage** : 1 décimale, format `{m}/15`.

**Exemple chiffré**
```
Alice : OUI + OUI + OUI + OUI + NON = 3+3+3+3+0 = 12  → niveau 3, 80 %
Bruno : OUI + OUI + Parfois + Parfois + Parfois = 3+3+1+1+1 = 9 → niveau 3, 60 %
Chloé : n'a pas répondu → exclue

moyenne_établissement = (12 + 9) / 2 = 10,5   → affiché « 10.5/15 »
nombre_répondants     = 2                     → affiché « 2 professeur(s) ont répondu »
```

**Cas limites**

| Cas | Comportement existant |
|---|---|
| Aucun répondant | Pas de ligne d'agrégation → carte affichant `-` et « Aucune donnée » ; score quiz du label = **0** (§5.7.4) |
| Un seul répondant sur 12 enseignants | La moyenne de cet unique répondant vaut pour tout l'établissement. **Aucun seuil minimal.** |
| Réponse modifiée | Le score est mis à jour ; l'agrégat est recalculé par un déclencheur en base, avec un délai d'environ 500 ms côté interface (`vigilance-quiz.tsx:290-292`) |

⚠️ **[BOGUÉ]** L'attente de 500 ms est une temporisation arbitraire. Si le déclencheur est plus lent, l'interface affiche un agrégat périmé. **[RECO]** : calculer l'agrégat à la demande ou confirmer explicitement sa mise à jour.

### 5.7 Label Égalité de l'établissement

*Source : `app/stats/etablissement/page.tsx:214-252`* — **c'est le calcul de référence du module.**

#### 5.7.1 Les quatre sous-scores

Chacun est ramené sur 100.

**① Score d'écart F/G — pondération 40 %**
```
score_écart = max(0, 100 − écart_moyen × 50)
```
Lecture : 0 point d'écart → 100 ; 1 point d'écart → 50 ; **2 points d'écart ou plus → 0**.

**② Score de couverture — pondération 30 %**
```
score_couverture = (CP_couvertes / CP_attendues) × 100
```
Valeurs possibles en collège : 0, 25, 50, 75, 100. En lycée : 0, 20, 40, 60, 80, 100.

**③ Score d'équilibre — pondération 20 %**
```
score_équilibre = max(0, 100 − déviation_moyenne × 100)     (§5.5)
```

**④ Score de quiz — pondération 10 %**
```
score_quiz = (moyenne_établissement / 15) × 100   si au moins un répondant
             0                                    sinon
```

#### 5.7.2 Score total

```
score_total = score_écart      × 0,40
            + score_couverture × 0,30
            + score_équilibre  × 0,20
            + score_quiz       × 0,10
```

**Affichage** : entier (arrondi au plus proche), format `Score : {n}/100`. Chaque sous-score est également affiché arrondi à l'entier dans sa vignette.

#### 5.7.3 Attribution du label

```
score_total ≥ 75  →  « Équilibré »     (vert)
score_total ≥ 50  →  « En progrès »    (jaune)
sinon             →  « À renforcer »   (orange)
```

Si aucune évaluation n'est disponible, le label vaut « Non calculé » (gris) et le score 0 — mais dans ce cas l'écran entier bascule sur l'état vide et le label n'est pas affiché.

#### 5.7.4 Exemple chiffré complet

```
① écart_moyen = 0,93333  →  score_écart = max(0, 100 − 0,93333 × 50)
                                        = max(0, 100 − 46,6667)
                                        = 53,3333        → vignette « 53 »

② CP_couvertes = 3 sur 4 →  score_couverture = 3/4 × 100
                                              = 75,0000  → vignette « 75 »

③ déviation_moyenne = 0,50 → score_équilibre = max(0, 100 − 50)
                                              = 50,0000  → vignette « 50 »

④ moyenne_quiz = 10,5 sur 15 → score_quiz = 10,5/15 × 100
                                          = 70,0000     → vignette « 70 »

score_total = 53,3333 × 0,40  =  21,3333
            + 75,0000 × 0,30  =  22,5000
            + 50,0000 × 0,20  =  10,0000
            + 70,0000 × 0,10  =   7,0000
                              ─────────────
                                 60,8333

affiché : « Score : 61/100 »
label   : « En progrès »  (60,83 ≥ 50 et < 75)
```

**Variante — aucun quiz rempli.** Mêmes données, mais Alice et Bruno n'ont pas répondu :
```
score_quiz  = 0
score_total = 21,3333 + 22,5000 + 10,0000 + 0 = 53,8333  → « 54/100 », toujours « En progrès »
```
L'équipe perd **7 points** pour une raison sans rapport avec ses pratiques mesurées.

⚠️ **[BOGUÉ] — traitement de l'absence de quiz**

Traiter l'absence de réponse comme un score de 0 revient à affirmer que l'équipe a la pire vigilance possible, alors qu'on ne sait simplement rien. Sur un établissement dont les trois autres critères seraient à 100, le plafond atteignable sans quiz est de **90/100**.

**[RECO — appliquée dans cette spécification]** : quand il n'y a aucun répondant, **renormaliser sur les trois critères restants** :
```
score_total = ( score_écart × 0,40 + score_couverture × 0,30 + score_équilibre × 0,20 ) / 0,90
```
Sur la variante ci-dessus : `53,8333 / 0,90 = 59,81` → **60/100**. L'écran doit alors mentionner explicitement que le label est calculé sans le critère de vigilance, avec une invitation à compléter le quiz.

#### 5.7.5 ⚠️ [BOGUÉ] La documentation contredit la formule

La modale d'aide (§4.5.1) annonce un barème pour le critère d'écart :

| Ce qu'affiche la modale | Ce que calcule réellement la formule |
|---|---|
| `< 0.5 pt` → **100 pts** | écart 0,5 → `100 − 25` = **75 pts** |
| `1 pt` → **50 pts** | écart 1,0 → `100 − 50` = **50 pts** ✅ |
| `> 2 pts` → **0 pts** | écart 2,0 → **0 pt** ✅ |

Seul le seuil intermédiaire est exact. Un utilisateur qui atteint un écart moyen de 0,4 point s'attend à 100 points et en obtient 80. **[RECO]** : corriger le texte de la modale, qui est faux, plutôt que la formule, qui est cohérente et continue.

#### 5.7.6 Table de sensibilité du score d'écart

| Écart moyen (points de note) | Score d'écart | Contribution au total (×0,40) |
|---|---|---|
| 0,00 | 100 | 40,0 |
| 0,25 | 87,5 | 35,0 |
| 0,50 | 75 | 30,0 |
| 0,75 | 62,5 | 25,0 |
| 1,00 | 50 | 20,0 |
| 1,21 *(écart national moyen, §4.6)* | 39,5 | 15,8 |
| 1,50 | 25 | 10,0 |
| 2,00 et au-delà | 0 | 0,0 |

### 5.8 ⚠️ [BOGUÉ — majeur] Le label du tableau de bord

*Source : `app/dashboard/page.tsx:82-104`*

Le tableau de bord calcule **son propre** écart moyen et **son propre** label, selon des règles **incompatibles** avec §5.7 :

| Critère | Écran « Statistiques établissement » | Tableau de bord |
|---|---|---|
| Filtrage par année scolaire | ✅ année sélectionnée | ❌ **toutes années confondues** |
| Exclusion de CP5 en collège | ✅ | ❌ **aucune exclusion** |
| Critères pris en compte | 4 critères pondérés | **écart moyen seul** |
| Attribution | Seuils sur un score /100 | Seuils directs sur l'écart |

Règle du tableau de bord :
```
écart_moyen < 0,5  →  « Équilibré »
écart_moyen < 1    →  « En progrès »
sinon              →  « À renforcer »
```

**Exemple chiffré de contradiction.** Supposons que le Collège Victor Hugo ait aussi saisi **20 évaluations en 2024-25**, toutes avec un écart de 0,10.

*Tableau de bord* (toutes années) :
```
somme des écarts = 20 × 0,10 + (1,70 + 0,30 + 0,80) = 2,00 + 2,80 = 4,80
écart_moyen      = 4,80 / 23 = 0,2087
affiché          : « Écart moyen F/G : 0.21 » — label « ÉQUILIBRÉ »
```

*Écran Statistiques établissement* (2025-26) :
```
écart_moyen = 0,93  —  score 61/100  —  label « EN PROGRÈS »
```

**Deux écrans de la même application, au même instant, affichent « Équilibré » et « En progrès » pour le même établissement, avec deux écarts moyens différents (0,21 et 0,93).**

**[RECO — appliquée dans cette spécification]** : **ne pas reconstruire cette formule.** Le tableau de bord doit afficher exactement le résultat de §5.7, calculé une seule fois, pour l'année scolaire courante.

### 5.9 ⚠️ [BOGUÉ] Le label personnel

*Source : `app/stats/perso/page.tsx:122-142`*

Troisième formule, encore différente, appliquée aux seules données d'un enseignant.

```
si CP_couvertes == 4  ET  écart_moyen < 0,5   →  « Équilibré »
sinon si CP_couvertes ≥ 3  OU  écart_moyen < 1 →  « En progrès »
sinon                                          →  « À renforcer »
```

**Trois défauts :**

1. **Le nombre 4 est codé en dur.** Un professeur de lycée ne peut jamais obtenir « Équilibré », puisqu'on lui exclut CP5 tout en exigeant 4 CP sur les 4 restantes — et le libellé de l'écran prétend qu'il est au collège (§3.8).
2. **La condition « En progrès » est un OU**, donc quasi toujours vraie. Il faut cumuler **moins de 3 CP** *et* **un écart ≥ 1 point** pour obtenir « À renforcer ».
3. **Aucun rapport avec le label d'établissement**, ni dans les critères, ni dans les seuils.

**Exemples chiffrés**

| Situation du professeur | CP couvertes | Écart moyen | Label obtenu | Commentaire |
|---|---|---|---|---|
| Alice | 2 | 0,40 | **En progrès** | `2 ≥ 3` faux, mais `0,40 < 1` vrai |
| Spécialiste d'une seule CP, très équilibré | 1 | 0,20 | **En progrès** | Une seule CP travaillée, pourtant « En progrès » |
| Polyvalent, gros écarts | 3 | 1,80 | **En progrès** | Écart de 1,8 point, pourtant « En progrès » |
| Peu diversifié, gros écarts | 2 | 1,20 | **À renforcer** | Le seul cas réellement atteignable |
| Complet et équilibré | 4 | 0,45 | **Équilibré** | Cas nominal |

**[RECO — appliquée dans cette spécification]** : **ne pas reconstruire ce label.** Deux options :
- **(a)** Appliquer §5.7 à l'échelle de l'enseignant, avec le critère quiz remplacé par son score individuel — mêmes seuils, mêmes couleurs, message unique.
- **(b)** Supprimer purement le label personnel et ne conserver que les indicateurs bruts (écart moyen, couverture), afin de ne pas transformer un outil d'auto-positionnement en notation individuelle des collègues.

L'option **(b)** est préférable : un label personnel visible est en tension directe avec l'esprit du quiz, présenté comme « pas un jugement » (§3.7.1).

### 5.10 Analyse par sexe du professeur

*Source : `app/stats/etablissement/page.tsx:294-331`*

```
Pour chaque évaluation, on récupère le sexe de son auteur.
Ne sont retenues que les valeurs « male » et « female » —
« other » et « prefer_not_to_say » sont ignorés silencieusement.

écart_moyen(sexe) = Σ |moyenne_filles − moyenne_garçons| des évaluations de ce groupe
                    / nombre d'évaluations du groupe
```

Un groupe vide conserve la valeur **0**.

**Exemple chiffré**
```
Bruno (male)   : évaluation A → 1,70
                 écart_moyen(hommes) = 1,70 / 1 = 1,70   « sur 1 activité(s) »

Alice + Chloé (female) : évaluations B et C → 0,30 et 0,80
                 écart_moyen(femmes) = (0,30 + 0,80) / 2 = 0,55   « sur 2 activité(s) »

1,70 > 0,55 → phrase affichée :
« Les professeures femmes obtiennent des écarts légèrement plus faibles
  que les professeurs hommes. »
```

⚠️ **Trois problèmes** — voir §9.3.4 et §9.4.2 :
1. Une différence de **1,15 point** est qualifiée de « légèrement plus faible ». Le qualificatif est fixe, quelle que soit l'ampleur.
2. La comparaison porte ici sur **1 activité contre 2**. Aucun effectif minimal n'est exigé.
3. Dans une équipe de 3 enseignants dont un seul homme, afficher « les professeurs hommes : 1,70 sur 1 activité » **désigne nominativement Bruno**. C'est une donnée de performance individuelle rendue lisible par toute l'équipe.

**[RECO]** : n'afficher ce bloc qu'à partir de **5 évaluations par groupe et 3 enseignants par groupe**, avec un message explicite d'effectif insuffisant en deçà, et remplacer la phrase d'analyse par une formulation graduée.

### 5.11 Analyse par composition Filles/Garçons des classes

*Source : `app/stats/etablissement/page.tsx:333-385`*

**Classement des classes**
```
pourcentage_filles = filles / (filles + garçons) × 100

pourcentage_filles > 60  →  « Majorité de filles »
pourcentage_filles < 40  →  « Majorité de garçons »
sinon                    →  « Équilibrée »
```

Les classes dont la somme filles + garçons vaut 0 sont ignorées. Le champ « effectif total » n'est pas utilisé : seule la somme des deux sexes compte.

**Agrégation** : chaque évaluation rattachée à une classe ajoute une ligne à la catégorie de cette classe. On calcule ensuite l'écart moyen absolu par catégorie. Le compteur affiché (« {n} données ») compte des **évaluations**, pas des classes.

**Exemple chiffré**
```
5e1 : 18 F / 8 G  → 18/26 = 69,2 %  → Majorité de filles
5e2 : 13 F / 13 G → 50,0 %          → Équilibrée
4e1 : 12 F / 13 G → 48,0 %          → Équilibrée
4e2 : 14 F / 12 G → 53,8 %          → Équilibrée
3eB : 11 F / 14 G → 44,0 %          → Équilibrée
3eC :  9 F / 17 G → 34,6 %          → Majorité de garçons

Rattachement des évaluations :
  B (Acrosport 5e1, écart 0,30) → Majorité de filles
  A (Badminton 4e2, écart 1,70) → Équilibrée
  C (Demi-fond 3eC, écart 0,80) → Majorité de garçons

Résultats affichés :
  Majorité de filles   : 0,30  — « 1 données »
  Équilibrée           : 1,70  — « 1 données »
  Majorité de garçons  : 0,80  — « 1 données »

Phrase : 1,70 < min(0,30 ; 0,80) ? Non
→ « Les classes équilibrées tendent à présenter des écarts comparables
    aux autres configurations. »
```

⚠️ **[BOGUÉ]**
1. **Un groupe vide vaut 0** et devient donc mécaniquement le minimum, ce qui empêche la phrase favorable de s'afficher (§4.5.3).
2. Le libellé « Majorité de garçons (>60%) » affiché est **trompeur** : le seuil effectif est « moins de 40 % de filles ».
3. Le compteur « {n} données » ne précise pas qu'il s'agit d'évaluations et non de classes.
4. Aucun effectif minimal par catégorie.

### 5.12 Calcul de l'année scolaire

*Sources : `components/school-year-selector.tsx:13-27`, `components/vigilance-quiz.tsx:103-114`*

**Règle de bascule** (identique dans les deux implémentations) :
```
si mois ≥ septembre  →  année_scolaire = « {A}-{(A+1) sur 2 chiffres} »
sinon                →  année_scolaire = « {A−1}-{A sur 2 chiffres} »
```

**Exemples**
```
31 août 2026     → « 2025-26 »
1er septembre 2026 → « 2026-27 »
17 septembre 2026 → « 2026-27 »
15 janvier 2027  → « 2026-27 »
```

**Liste proposée par le sélecteur** : 5 valeurs, de `annéeCivileCourante − 2` à `annéeCivileCourante + 2`. En 2026 : `2024-25`, `2025-26`, `2026-27`, `2027-28`, `2028-29`. L'année scolaire en cours est suffixée « (actuelle) ».

⚠️ **[BOGUÉ — trois défauts cumulés]**

1. **La valeur initiale est `"2025-26"`, codée en dur** dans les trois écrans (`app/etablissement/page.tsx:33`, `app/stats/perso/page.tsx:33`, `app/stats/etablissement/page.tsx:40`), au lieu d'appeler la fonction de calcul. **Le calcul existe et n'est pas utilisé pour la valeur par défaut.**
2. **Le quiz utilise, lui, l'année réelle.** Dès septembre 2026, les quiz s'enregistrent en `2026-27` pendant que l'écran de statistiques interroge par défaut `2025-26` : **la requête d'agrégat ne trouve rien et le critère quiz du label tombe à 0**, faisant chuter le score de tous les établissements de 7 à 10 points sans aucune cause métier.
3. **À partir de 2028**, `"2025-26"` sortira de la plage glissante et le sélecteur affichera une valeur absente de sa propre liste.

**[RECO]** : une seule fonction utilitaire partagée, appelée pour initialiser chaque écran. Défaut = année scolaire en cours, jamais une constante.

### 5.13 Table récapitulative des seuils, arrondis et couleurs

| Grandeur | Seuils | Arrondi affiché | Source |
|---|---|---|---|
| Écart d'une évaluation | vert `< 0,5` · jaune `< 1` · rouge `≥ 1` | 2 décimales | `stats/perso:551` |
| Écart moyen | idem | 2 décimales | `stats/etablissement:738` |
| Moyennes par CP | — | 2 décimales | `stats/etablissement:731-732` |
| Couverture CP | — | entier (%) | `stats/etablissement:211` |
| Poids d'une CP | — | entier · % à 1 décimale | `stats/etablissement:196` |
| Déviation d'une CP | alerte si `> 0,50` | non affichée | `stats/etablissement:530` |
| Sous-scores du label | — | entier | `stats/etablissement:479-495` |
| Score total | Équilibré `≥ 75` · En progrès `≥ 50` · À renforcer sinon | entier | `stats/etablissement:239-252` |
| Score de quiz individuel | niveaux `≤4` · `≤8` · `≤12` · sinon | entier | `vigilance-quiz:233` |
| Pourcentage de quiz | — | entier | `vigilance-quiz:233` |
| Moyenne de quiz d'établissement | — | 1 décimale | `stats/etablissement:521` |
| Composition d'une classe | filles `> 60 %` · `< 40 %` · sinon équilibrée | non affichée | `stats/etablissement:357-361` |
| Axe des ordonnées des graphiques de moyennes | domaine fixe `[0 ; 20]` | — | `stats/etablissement:637` |

**Règle d'arrondi** : arrondi décimal au plus proche, appliqué **uniquement à l'affichage**. Les comparaisons de seuils portent sur les valeurs non arrondies. Conséquence à connaître : un score de 74,6 s'affiche « 75/100 » mais reçoit le label « En progrès ». **[RECO]** : comparer sur la valeur arrondie affichée, ou afficher une décimale.

---

## 6. Restitutions

### 6.1 Cartes de synthèse

**Écran Statistiques établissement** — 4 cartes (`app/stats/etablissement/page.tsx:556-655`)

| Titre | Valeur | Format | Légende | Couleur |
|---|---|---|---|---|
| Activités analysées | nombre d'évaluations retenues | entier | Total établissement | bleu |
| Écart moyen F/G | §5.2 | 2 décimales | Points d'écart absolu | violet |
| Couverture CP | §5.3 | `{n} / {total}` | {p}% des CP travaillées | vert |
| Quiz vigilance | §5.6.4 | `{m}/15` ou `-` | {n} répondant(s) / Aucune donnée | violet foncé |

**Écran Statistiques personnelles** — 3 cartes : Activités analysées (« Activités avec moyennes F/G (CP5 exclue) »), Écart moyen F/G, Couverture CP (`{n} / 4`).

**Tableau de bord** — 8 cartes réparties en deux blocs (§3.4). ⚠️ Les cartes « Écart moyen F/G » et « Label égalité » utilisent la formule erronée §5.8.

### 6.2 Graphiques

Cinq graphiques, tous en rendu réactif à la largeur du conteneur.

#### 6.2.1 Comparaison Filles/Garçons par CP — barres groupées

*Écran : Statistiques établissement · Hauteur : 400 px*

| Propriété | Valeur |
|---|---|
| Axe X | code de la CP |
| Axe Y | domaine **fixe [0 ; 20]** |
| Série 1 | « Moy. Filles » — rose `#ec4899` |
| Série 2 | « Moy. Garçons » — bleu `#3b82f6` |
| Données | moyenne des moyennes filles / garçons des évaluations de la CP, 2 décimales |
| Légende | affichée |

**Calcul par CP** :
```
moy_filles(CP)  = Σ moyenne_filles  des évaluations de la CP / nombre d'évaluations
moy_garçons(CP) = Σ moyenne_garçons des évaluations de la CP / nombre d'évaluations
écart(CP)       = Σ |filles − garçons| / nombre d'évaluations
```

⚠️ **Attention** : `écart(CP)` est la **moyenne des écarts absolus**, et non la différence des deux moyennes affichées. Sur un graphique où les barres filles et garçons sont quasi identiques, l'écart affiché ailleurs peut être élevé si les écarts individuels se compensent. C'est le comportement correct, mais il doit être expliqué à l'utilisateur. **[RECO]** : ajouter une note de lecture.

#### 6.2.2 Poids des CP — camembert

*Écran : Statistiques établissement · Hauteur : 300 px*

| Propriété | Valeur |
|---|---|
| Valeur | poids de la CP (§5.4) |
| Étiquette | `{code CP}: {nombre}` |
| Palette | `#3b82f6`, `#10b981`, `#f59e0b`, `#ef4444`, `#8b5cf6` — attribuée **par ordre d'apparition**, pas par CP |
| État vide | `Associez des APSA aux classes pour voir cette répartition` |

⚠️ **[BOGUÉ mineur]** La couleur d'une CP **change selon les CP présentes**. CP1 est bleue si elle est la première présente, verte si CP2 la précède. Les couleurs ne sont donc pas comparables d'un établissement à l'autre ni d'une année à l'autre. **[RECO]** : couleur fixe par code de CP.

#### 6.2.3 Écarts moyens par CP — barres simples

*Écran : Statistiques établissement · Hauteur : 300 px* · Axe Y automatique · Barre violette `#8b5cf6` · Série « Écart ».

#### 6.2.4 Évolution par période — courbes

*Écran : Statistiques personnelles · Hauteur : 350 px*

| Propriété | Valeur |
|---|---|
| Axe X | libellé de période |
| Axe Y | domaine fixe [0 ; 20] |
| Courbe 1 | « Filles » — rose, trait plein |
| Courbe 2 | « Garçons » — bleu, trait plein |
| Courbe 3 | « Moyenne » — vert, **trait pointillé** (moyenne générale saisie) |
| État vide | `Aucune donnée de période disponible` |

⚠️ **[BOGUÉ]** Les périodes sont ordonnées **par ordre d'apparition dans les données**, pas chronologiquement. « Trimestre 3 » peut précéder « Trimestre 1 » sur l'axe. De plus, trimestres et semestres peuvent coexister sur le même axe, ce qui n'a pas de sens. Les évaluations sans période sont regroupées sous « Non défini ». **[RECO]** : ordre fixe et séparation trimestres / semestres.

#### 6.2.5 Comparaison Filles/Garçons par APSA — barres groupées

*Écran : Statistiques personnelles · Hauteur : 400 px* · Axe X en **rotation −45°**, zone réservée de 100 px · Axe Y [0 ; 20] · Séries « Moy. Filles » (rose) / « Moy. Garçons » (bleu). L'info-bulle affiche « {APSA} ({n} évaluation(s)) ».

#### 6.2.6 Camembert de répartition des activités

*Écran : Statistiques personnelles · Hauteur : 350 px* · Valeur = **nombre d'évaluations** par CP (et non le poids en enseignements) · Étiquette `{CP}: {n}` · Même palette que §6.2.2.

⚠️ **Piège de lecture** : deux camemberts très semblables visuellement mesurent des choses différentes — le camembert d'établissement compte des **enseignements programmés**, celui des statistiques personnelles compte des **évaluations saisies**. **[RECO]** : titres et légendes explicites.

### 6.3 Tableaux et listes détaillées

#### 6.3.1 Liste des évaluations personnelles — onglet « Par APSA »

Une ligne par évaluation : APSA · `{CP} - {classe}` · badge de période · Filles · Garçons · Écart signé coloré. Trois tris disponibles (période, CP, activité), tous alphabétiques et **non persistés**.

#### 6.3.2 Synthèse par CP — statistiques personnelles

Par CP : code · intitulé · écart moyen (2 décimales, violet) · « {n} activité(s) analysée(s) ».

#### 6.3.3 Analyse par CP — statistiques établissement

Par CP : code · intitulé · « {n} évaluation(s) • {p} enseignement(s) » · Moy. Filles · Moy. Garçons · Écart moyen coloré. Suivi le cas échéant de l'encart « CP non couvertes ».

**C'est le seul endroit de l'application où les deux notions — évaluations saisies et enseignements programmés — sont affichées côte à côte.** Une CP peut y apparaître avec « 3 évaluation(s) • 0 enseignement(s) », signe d'une programmation non déclarée.

#### 6.3.4 Influence du sexe du professeur

Deux blocs (hommes / femmes) : écart moyen 2 décimales, « Écart moyen sur {n} activité(s) », plus une phrase d'analyse (§4.5.2). **Affiché même avec une seule activité par groupe.**

#### 6.3.5 Influence de la composition des classes

Trois blocs (majorité de filles / équilibrée / majorité de garçons) : écart moyen 2 décimales, « {n} données », plus une phrase d'analyse (§4.5.3).

#### 6.3.6 Tableaux d'administration

Niveaux (Nom · Nombre de classes · Actions) et Classes (Nom · Niveau · Effectif total · Filles · Garçons · Actions). Valeurs absentes affichées `-`. Tri alphabétique par nom, **non modifiable**.

⚠️ **[BOGUÉ mineur]** Le tri alphabétique classe « 6e10 » avant « 6e2 ». **[RECO]** : tri naturel.

### 6.4 Alertes conditionnelles

| Alerte | Condition de déclenchement | Emplacement |
|---|---|---|
| Déséquilibre des CP | au moins une CP avec déviation `> 0,50` | Statistiques établissement, au-dessus des cartes |
| CP non couvertes | `CP_couvertes < CP_attendues` | Fin de la carte « Analyse par CP » |
| Niveaux requis | aucun niveau créé | Onglet Classes |
| Classes requises | aucune classe attribuée | Carte Activités |
| Quiz déjà complété | un score existe pour l'année en cours | Tuile du quiz |

### 6.5 Textes d'interprétation automatiques

Récapitulatif des textes générés dynamiquement, tous détaillés en §4.5 :

| Texte | Déclencheur |
|---|---|
| Message d'accompagnement du label | valeur du label |
| Phrase sur le sexe du professeur | comparaison stricte de deux moyennes |
| Phrase sur la composition des classes | comparaison à un minimum |
| Comparaison individuelle au quiz | comparaison du score à la moyenne d'établissement |
| Contribution au label | pourcentage individuel × 0,1 — ⚠️ faux (§3.7.3) |

### 6.6 Exports — **[MANQUANT]**

**Aucune fonction d'export n'existe** dans le code : ni PDF, ni tableur, ni CSV, ni impression, ni partage de lien. Le `README.md:190-191` les annonce pourtant comme améliorations futures.

**[RECO]** Trois exports à prévoir, par ordre de valeur métier décroissante :

1. **Fiche de synthèse du label** (une page) : label, score, quatre sous-scores, écart moyen, couverture, poids par CP, nombre de répondants au quiz, année. C'est le livrable naturel pour un conseil pédagogique ou un projet d'établissement. **Priorité haute.**
2. **Export tabulaire des évaluations** de l'établissement pour une année : classe, niveau, APSA, CP, période, moyennes, écart. Permet les retraitements que l'application ne fait pas.
3. **Comparaison pluriannuelle** : évolution du score et de ses quatre composantes sur les années disponibles. Les données existent déjà en base ; **aucun écran ne les exploite** — c'est le manque fonctionnel le plus visible du module.

---

## 7. Modèle de données conceptuel

### 7.1 Entités

Colonne « Niveau » : à quoi l'entité se rattache — **Global** (partagé par tous), **Éta** (établissement), **Éq** (équipe EPS), **Util** (utilisateur).

#### 7.1.1 `profiles` — Utilisateur · Niveau : Util

| Attribut | Type | Contraintes | Remarque |
|---|---|---|---|
| `id` | UUID | PK, référence le compte d'authentification | |
| `created_at` | horodatage | non nul, défaut maintenant | |
| `full_name` | texte | nullable | |
| `role` | texte | `teacher` \| `admin`, défaut `teacher` | **[MORT]** jamais lu (§2.1) |
| `establishment_id` | UUID | FK nullable, `ON DELETE SET NULL` | |
| `gender` | texte | `male` \| `female` \| `other` \| `prefer_not_to_say` | ⚠️ **absent des migrations** |

#### 7.1.2 `establishments` — Établissement · Niveau : Éta

| Attribut | Type | Contraintes | Remarque |
|---|---|---|---|
| `id` | UUID | PK | |
| `created_at` | horodatage | non nul | |
| `name` | texte | non nul | |
| `identification_code` | texte | non nul, **unique**, indexé | Code de 8 caractères majuscules |
| `max_teachers` | entier | non nul | Quota, borné 1–50 à la saisie |
| `nb_students_total` / `_girls` / `_boys` | entier | nullable | **[MORT]** jamais lus ni saisis |
| `type` | texte | `college` \| `lycee_gt` \| `lycee_pro` | ⚠️ **absent des migrations** · **détermine tout le calcul du label** |

#### 7.1.3 `levels` — Niveau scolaire · Niveau : Éta

`id` · `establishment_id` (FK, cascade) · `name` · `nb_classes` (nullable, purement informatif) · `created_at`.

#### 7.1.4 `classes` — Classe · Niveau : Éta

`id` · `establishment_id` (FK, cascade) · `level_id` (FK, cascade) · `name` · `nb_students_total` · `nb_students_girls` · `nb_students_boys` (les trois nullables) · `created_at`.

> **`nb_students_girls` et `nb_students_boys` sont le prérequis P3.** Ce sont les seuls champs d'effectif réellement utilisés (§5.11). `nb_students_total` n'est qu'affiché.

#### 7.1.5 `cp` — Compétence Propre · Niveau : **Global**

`id` · `code` (unique) · `label` · `description` · `created_at`. Cinq lignes fixes (§4.1). **RLS non activée** : lecture ouverte.

#### 7.1.6 `apsa` — Activité · Niveau : Éta

`id` · `establishment_id` (FK, cascade) · `cp_id` (FK, cascade) · `name` · `description` (nullable) · `created_at`.

**Une APSA appartient à exactement une CP.** Pas de rattachement à une année : l'APSA est permanente, sa programmation est annuelle (§7.1.7).

#### 7.1.7 `apsa_classes` — Programmation annuelle · Niveau : Éta

⚠️ **Table absente des migrations.** Structure déduite du code (`app/etablissement/page.tsx:357-368`) :

| Attribut | Type | Remarque |
|---|---|---|
| `id` | UUID | PK présumée |
| `apsa_id` | UUID | FK vers `apsa` |
| `class_id` | UUID | FK vers `classes` |
| `school_year` | texte | format `AAAA-AA` |

**Une ligne = un « enseignement »**, unité de mesure du poids des CP (§5.4). Aucune contrainte d'unicité connue sur le triplet — l'application la simule par un remplacement intégral (§3.5.4).

#### 7.1.8 `teacher_classes` — Affectation enseignant ↔ classe · Niveau : Util × Éta

`id` · `teacher_id` (FK, cascade) · `class_id` (FK, cascade) · `created_at` · **unique (`teacher_id`, `class_id`)**.

> **C'est le prérequis P1.** Cette table **doit disparaître** au profit de l'affectation gérée par coordo-eps. Elle ne porte **aucune année scolaire** — défaut à corriger dans la reprise (§9.2.5).

#### 7.1.9 `class_activities` — Évaluation · Niveau : Util

| Attribut | Type | Contraintes | Remarque |
|---|---|---|---|
| `id` | UUID | PK | |
| `teacher_class_id` | UUID | FK, cascade | Porte **à la fois** l'enseignant et la classe |
| `apsa_id` | UUID | FK, cascade | |
| `period` | texte | nullable | Liste fermée (§4.8) |
| `school_year` | texte | nullable | ⚠️ **absent des migrations** |
| `avg_score_total` | numérique(4,2) | nullable | Saisi à la main, **non recalculé** |
| `avg_score_girls` | numérique(4,2) | nullable | |
| `avg_score_boys` | numérique(4,2) | nullable | |
| `created_at` / `updated_at` | horodatage | `updated_at` maintenu par déclencheur | |

**C'est l'entité centrale du module.** Aucune contrainte d'unicité, aucune borne sur les valeurs (§9.2.4).

#### 7.1.10 `teachers_quiz_scores` — Réponse au quiz · Niveau : Util

⚠️ **Table absente des migrations.** Structure déduite (`components/vigilance-quiz.tsx:144-283`) :

| Attribut | Type | Remarque |
|---|---|---|
| `id` | UUID | PK |
| `user_id` | UUID | FK vers le profil |
| `school_id` | UUID | FK vers l'établissement |
| `score` | entier | 0 à 15 |
| `level` | entier | 1 à 4 — **valeur dérivée, stockée** |
| `school_year` | texte | format `AAAA-AA` |
| `answers` | JSON | tableau `{questionId, value}` |
| `completed_at` | horodatage | |

Unicité fonctionnelle attendue : (`user_id`, `school_year`) — l'application interroge avec `maybeSingle()`, donc **une seule ligne est supposée**, mais rien ne garantit la contrainte en base.

⚠️ **Données sensibles** : les réponses détaillées à des questions d'auto-évaluation professionnelle, nominatives. Voir §9.4.2.

#### 7.1.11 `school_quiz_stats` — Agrégat de quiz · Niveau : Éta

⚠️ **Objet absent des migrations.** Vue ou table maintenue par déclencheur. Colonnes utilisées : `school_id`, `school_year`, `average_score`, `total_respondents`.

#### 7.1.12 `equality_labels` — **[MORT]**

Table définie dans les migrations (`001_initial_schema.sql:141-150`) : `id`, `establishment_id`, `computed_at`, `label` contraint aux trois valeurs, `details` JSON. Politiques RLS complètes.

**Aucune ligne de code ne la lit ni ne l'écrit.** Vérification : aucune occurrence de `equality_labels` hors des fichiers de migration et de types.

**[RECO]** L'intention était manifestement de **conserver l'historique des labels calculés**. C'est une bonne idée abandonnée : il n'existe aujourd'hui aucun moyen de savoir quel label un établissement avait l'an dernier, ni comment son score a évolué. **À reconstruire dans coordo-eps**, avec le score et les quatre sous-scores dans le détail JSON.

#### 7.1.13 `cp_weight_by_establishment` — vue fantôme

La migration `003_fix_security_definer_view.sql` exécute `ALTER VIEW public.cp_weight_by_establishment SET (security_invoker = on)` sur une vue **qu'aucune migration ne crée**. Elle existe en production, créée à la main. **Aucun code applicatif ne l'interroge** — le poids des CP est recalculé côté client (§5.4).

**Sur une base vierge, cette migration échoue.** Voir §9.1.1.

### 7.2 Relations

```
establishments ──1:N──> levels ──1:N──> classes
       │                                   │
       ├──1:N──> apsa ──N:1──> cp          │
       │           │                       │
       │           └──1:N──> apsa_classes ─┘   (porte school_year)
       │
       ├──1:N──> profiles ──1:N──> teacher_classes ──N:1──> classes
       │                                  │
       │                                  └──1:N──> class_activities ──N:1──> apsa
       │                                                (porte school_year + period)
       │
       ├──1:N──> teachers_quiz_scores  (porte school_year)
       ├──1:1──> school_quiz_stats     (par school_year)
       └──1:N──> equality_labels       [MORT]
```

**Deux chemins parallèles vers la même information**, jamais réconciliés :

| Chemin | Entité | Répond à | Alimente |
|---|---|---|---|
| **Déclaratif** | `apsa_classes` | « quelles classes pratiquent quelle APSA cette année ? » | Poids et équilibre des CP (50 % du label) |
| **Constaté** | `class_activities` | « quelles moyennes ai-je relevées ? » | Écart et couverture (70 % du label) |

⚠️ Rien n'oblige à ce qu'une évaluation corresponde à un enseignement déclaré, ni l'inverse. Voir §9.3.1.

### 7.3 ⚠️ [BOGUÉ — critique] Le schéma réel diverge des migrations

**Constat vérifié** : l'historique Git ne contient que trois fichiers SQL, et aucun ne définit les objets suivants, pourtant indispensables au fonctionnement :

| Objet manquant des migrations | Utilisé par | Conséquence de son absence |
|---|---|---|
| `class_activities.school_year` | Tous les filtres d'année | **Les statistiques ne renvoient rien** |
| `profiles.gender` | Analyse §5.10, inscription | **L'inscription échoue** |
| `establishments.type` | Choix des CP, tout le label | **Calcul du label faux** (bascule sur `college` par défaut) |
| Table `apsa_classes` | Programmation, poids des CP | **Écran APSA en erreur, équilibre à 0** |
| Table `teachers_quiz_scores` | Quiz | **Quiz non fonctionnel** |
| Vue/table `school_quiz_stats` | Agrégat de quiz | **Critère quiz toujours à 0** |
| Déclencheur d'agrégation du quiz | `school_quiz_stats` | **Agrégat jamais mis à jour** |
| Vue `cp_weight_by_establishment` | Migration `003` | **La migration `003` échoue** |

Le fichier `types/database.types.ts` est lui aussi périmé : il ne connaît ni `apsa_classes`, ni `teachers_quiz_scores`, ni `school_quiz_stats`, ni `school_year`, ni `gender`, ni `type`. C'est précisément pourquoi **presque tous les fichiers portent `@ts-nocheck`** (11 fichiers sur 12 concernés) : la vérification de types a été désactivée en bloc plutôt que les types régénérés.

**Gravité** : sur une base vierge, l'application appliquée depuis ces migrations **ne démarre pas fonctionnellement**. C'est le problème n°1 du dépôt et la meilleure justification de la reconstruction.

**[RECO]** Dans coordo-eps : **toute évolution de schéma passe par une migration versionnée**, sans exception. Régénérer les types après chaque migration et retirer tout `@ts-nocheck`.

### 7.4 Dimension temporelle — portée incohérente

| Entité | Porte l'année ? | Conséquence |
|---|---|---|
| `apsa_classes` | ✅ | Programmation réellement annuelle — **correct** |
| `class_activities` | ✅ (hors migration) | Évaluations réellement annuelles — **correct** |
| `teachers_quiz_scores` | ✅ | Une réponse par an — **correct** |
| `teacher_classes` | ❌ | ⚠️ **Affectation permanente** : impossible de savoir qui avait quelle classe l'an dernier |
| `apsa` | ❌ | Correct : l'APSA existe, sa programmation varie |
| `classes`, `levels` | ❌ | ⚠️ Une classe supprimée emporte tout son historique |

**[RECO]** Dans coordo-eps, l'affectation enseignant↔classe (P1) **doit être datée par année scolaire**. Si l'hôte ne le fait pas déjà, c'est une évolution à prévoir **avant** d'intégrer le module, sinon le module ne pourra jamais restituer d'historique fiable.

### 7.5 Schéma cible recommandé pour coordo-eps

**Principe** : le module ne crée que ce qui lui est propre, préfixé `egalite_`, et référence les entités de l'hôte par clé étrangère sans jamais les dupliquer.

#### 7.5.1 Tables du module

| Table | Niveau | Rôle | Reprise de |
|---|---|---|---|
| `egalite_cp` | **Global** | Référentiel des 5 CP | `cp` |
| `egalite_apsa` | Éta | APSA de l'établissement, rattachée à une CP | `apsa` |
| `egalite_programmation` | Éta | APSA × classe × année scolaire = un enseignement | `apsa_classes` |
| `egalite_evaluations` | Util | Moyennes F/G par classe × APSA × période × année | `class_activities` |
| `egalite_quiz_reponses` | Util | Réponses et score du quiz, par année | `teachers_quiz_scores` |
| `egalite_labels_historique` | Éta | Label calculé archivé : score, 4 sous-scores, année, date | `equality_labels` **ressuscitée** |
| `egalite_parametres` | Éta | Type d'établissement si absent de l'hôte, activation du module | — |

#### 7.5.2 Colonnes de rattachement à l'hôte

| Donnée | Origine | Prérequis |
|---|---|---|
| Identifiant d'établissement | hôte | — |
| Identifiant d'enseignant | hôte | — |
| Identifiant de classe, niveau, effectifs F/G | hôte | **P3** |
| Affectation enseignant ↔ classe ↔ année | hôte | **P1** |
| Sexe de l'enseignant | hôte | **P2** |
| Type d'établissement | hôte **ou** `egalite_parametres` | à vérifier |

#### 7.5.3 Trois points de conception à trancher

1. **`egalite_evaluations` référence-t-elle l'affectation de l'hôte, ou directement le couple (enseignant, classe) ?** Référencer l'affectation reproduit la cascade destructrice de l'existant (§9.2.6). **[RECO]** : stocker `enseignant_id` **et** `classe_id` séparément, en interdisant la suppression en cascade — une évaluation est une donnée historique, pas une dépendance de l'affectation courante.
2. **Le type d'établissement existe-t-il dans coordo-eps ?** Si non, le module doit le porter lui-même dans `egalite_parametres`, avec un écran de réglage (l'existant ne permet même pas de le corriger — §3.5.1).
3. **Faut-il rattacher les données du module à l'établissement ou à l'équipe EPS ?** Dans l'existant, tout est au niveau établissement, avec l'hypothèse implicite « une équipe EPS = un établissement ». Si coordo-eps distingue plusieurs équipes par établissement, il faut trancher. **[RECO]** : rattacher à l'**équipe EPS**, puisque le label qualifie une pratique pédagogique d'équipe, pas un établissement en tant que bâtiment.

### 7.6 Politiques de sécurité au niveau des lignes

**Existant** : RLS activée sur 8 tables sur 9 (`cp` en est exemptée volontairement). Le principe est le cloisonnement par établissement, via une sous-requête sur le profil de l'utilisateur courant.

⚠️ **Trois défauts majeurs** — voir §9.1.2 pour le détail et les corrections :
1. `establishments` autorise la **lecture de tous les établissements** (`USING (true)`).
2. `establishments` autorise la **création par n'importe qui** (`WITH CHECK (true)`).
3. Les politiques de `profiles` interrogent `profiles`, avec un **risque de récursion** connu sur ce moteur.

**[RECO]** Dans coordo-eps : dériver toutes les politiques du module de la fonction d'appartenance **déjà utilisée par l'hôte**, sans jamais réimplémenter la logique d'appartenance. Une politique par table, par opération, sans aucun `USING (true)`.

---

## 8. Doublons avec l'application hôte

### 8.1 À ne pas reconstruire

Tout ce qui suit existe déjà dans coordo-eps et doit être consommé, pas réimplémenté.

| Élément de l'existant | Fichiers concernés | Remplacé par |
|---|---|---|
| Inscription, connexion, mot de passe oublié, réinitialisation | `app/auth/**` (869 lignes) | Authentification de l'hôte |
| Protection des routes | `middleware.ts` | Middleware de l'hôte |
| Clients d'accès aux données | `lib/supabase/*` | Clients de l'hôte |
| Table `profiles` | `001_initial_schema.sql:11-18` | Utilisateurs de l'hôte |
| Table `establishments` | `001_initial_schema.sql:25-34` | Établissements de l'hôte |
| Code d'adhésion, quota `max_teachers` | `signup`, `001_initial_schema.sql:30` | Mécanisme d'équipe de l'hôte |
| Table `levels` | `001_initial_schema.sql:51-57` | Niveaux de l'hôte |
| Table `classes` | `001_initial_schema.sql:63-73` | Classes de l'hôte |
| Table `teacher_classes` | `001_initial_schema.sql:104-111` | **Affectation de l'hôte — P1** |
| Barre de navigation, pied de page | `nav-bar.tsx`, `footer.tsx` | Navigation de l'hôte |
| Mentions légales | `app/legal/page.tsx` (364 lignes) | Mentions légales de l'hôte (à **compléter**, §9.4) |
| Page d'accueil publique | `app/page.tsx` | Accueil de l'hôte |
| Application installable, service worker | `public/*`, `pwa-register.tsx` | Dispositif de l'hôte — **[MORT]** ici de toute façon |
| Liens vers les autres produits de l'éditeur | `nav-bar.tsx`, `footer.tsx` | Sans objet |

**Volume évité** : environ **2 400 lignes** sur les 5 983 du dépôt, soit **40 %**.

### 8.2 À conserver — cœur du module

| Élément | Fichiers d'origine | Volume |
|---|---|---|
| Référentiel des 5 CP et textes associés | `001_initial_schema.sql:80-97` | §4.1 |
| Gestion des APSA et rattachement aux CP | `app/etablissement/page.tsx` onglet APSA | ~300 lignes |
| Programmation annuelle APSA ↔ classes | idem | ~120 lignes |
| Saisie des moyennes F/G | `components/perso-manager.tsx` | ~400 lignes |
| Quiz de vigilance complet | `components/vigilance-quiz.tsx` | 622 lignes |
| Calculs et restitutions personnelles | `app/stats/perso/page.tsx` | 615 lignes |
| Calculs et restitutions d'établissement | `app/stats/etablissement/page.tsx` | 924 lignes |
| Contenus pédagogiques et bibliographie | `eps-info-modal`, `sources-modal`, `label-info-modal` | 842 lignes |

**Volume utile** : environ **3 500 lignes**, dont une part importante de contenu textuel réutilisable tel quel.

### 8.3 Points de raccordement à vérifier dans coordo-eps

**À faire en premier**, avant toute conception détaillée.

| # | Question à instruire | Si la réponse est « non » |
|---|---|---|
| **1** | L'affectation **enseignant ↔ classe** existe-t-elle ? *(P1)* | **Bloquant.** Le module ne peut pas être construit. |
| **2** | Cette affectation est-elle **datée par année scolaire** ? | Le module fonctionne, mais sans historique fiable (§7.4). Évolution à prévoir. |
| **3** | Le **sexe de l'enseignant** est-il disponible ? *(P2)* | L'analyse §5.10 est retirée, ou une colonne facultative est ajoutée dans `egalite_parametres`. |
| **4** | Les **effectifs filles/garçons par classe** sont-ils disponibles ? *(P3)* | L'analyse §5.11 est retirée. **[RECO]** : les ajouter, ils conditionnent aussi une éventuelle pondération (§5.2). |
| **5** | Le **type d'établissement** (collège / LGT / LP) est-il disponible ? | Le module le porte lui-même. **Il détermine 100 % du calcul du label** — pas de valeur par défaut silencieuse. |
| **6** | La notion d'**année scolaire** existe-t-elle, et sous quel format ? | Aligner le module sur le format de l'hôte. Ne pas introduire un second format. |
| **7** | Existe-t-il plusieurs **équipes** par établissement ? | Trancher le niveau de rattachement (§7.5.3, point 3). |
| **8** | Existe-t-il un **mécanisme d'activation par module** (feature flag) ? | À créer — c'est une exigence du cahier des charges d'intégration. |
| **9** | Comment la fonctionnalité **« Schéma » est-elle intégrée au menu Outils** ? | **Question prioritaire** : ce motif d'intégration est imposé comme modèle (§2.4.1). |
| **10** | Comment identifier l'utilisateur courant par son **adresse e-mail**, côté serveur et dans une politique RLS ? | Conditionne la restriction d'accès de phase 1 (§2.4.2). |

### 8.4 Arbitrage — à qui appartiennent les données du module ?

Trois lectures possibles, à trancher avec l'hôte :

| Option | Conséquence | Avis |
|---|---|---|
| **(a) À l'établissement** | Reproduit l'existant. Simple. | Suffisant si coordo-eps a une équipe EPS par établissement. |
| **(b) À l'équipe EPS** | Plusieurs équipes possibles par établissement, labels distincts. | **[RECO]** — le label qualifie une pratique d'équipe. |
| **(c) À l'enseignant, agrégé à la demande** | Maximise la confidentialité, complique toutes les restitutions. | Trop coûteux au regard du bénéfice. |

**Position retenue par cette spécification : (b)**, avec repli sur (a) si coordo-eps ne modélise qu'une équipe par établissement.

---

## 9. Ce qui est incomplet, bogué ou mal conçu

> Classement par gravité. Chaque point : symptôme observable, cause, fichier source, recommandation.

### 9.1 Bloquants

#### 9.1.1 Les migrations ne reconstruisent pas la base

**Symptôme** : appliquer les trois migrations sur une base vierge produit une base **inutilisable** — l'inscription échoue, le quiz est inopérant, les statistiques sont vides, et la migration `003` échoue sur une vue inexistante.

**Cause** : huit objets créés à la main en production n'ont jamais été versionnés (§7.3).

**Source** : `supabase/migrations/*`, vérifié sur l'intégralité de l'historique Git.

**[RECO]** — **C'est la première justification de la reconstruction.** Dans coordo-eps : aucune modification de schéma hors migration, régénération systématique des types, et vérification que la base se reconstruit de zéro depuis les seules migrations (à automatiser).

#### 9.1.2 Politiques de sécurité trop permissives

**Trois failles** dans `002_rls_policies.sql` :

**(a) Lecture de tous les établissements** — `:75-79`
```sql
CREATE POLICY "Anyone can check establishment code existence"
    ON public.establishments FOR SELECT USING (true);
```
**Symptôme** : n'importe quel visiteur, **même non authentifié**, peut lire la table complète des établissements : noms, **codes d'adhésion**, quotas. Connaître un code suffit à rejoindre une équipe (§3.2).

**Cause** : la politique visait à permettre la vérification d'un code à l'inscription, mais ouvre la table entière.

**[RECO]** : la vérification d'un code doit passer par une fonction serveur qui prend le code en entrée et ne retourne qu'un booléen ou l'identifiant, **jamais** par une politique de lecture ouverte. Dans coordo-eps, cette mécanique relève de l'hôte de toute façon.

**(b) Création d'établissement ouverte** — `:82-85`
```sql
CREATE POLICY "Users can create establishment"
    ON public.establishments FOR INSERT WITH CHECK (true);
```
**Symptôme** : création en masse d'établissements possible sans contrôle.

**(c) Récursion potentielle sur `profiles`** — `:33-44`

La politique de lecture de `profiles` interroge `profiles`. Le moteur le tolère dans certaines configurations, mais c'est une construction fragile, connue pour produire des erreurs de récursion infinie.

**[RECO]** : passer par une fonction de sécurité qui retourne l'établissement de l'utilisateur courant, appelée par toutes les politiques — jamais une sous-requête sur la table protégée elle-même.

### 9.2 Majeurs — résultats faux ou perte de données

#### 9.2.1 Inscription non transactionnelle

**Quatre défauts cumulés** (`app/auth/signup/page.tsx:38-149`) :

1. **Code généré côté client sans contrôle d'unicité** — `Math.random().toString(36).substring(2, 10).toUpperCase()` (`:62`). La fonction serveur `generate_establishment_code()`, qui boucle jusqu'à obtenir un code libre (`001_initial_schema.sql:158-181`), **existe mais n'est jamais appelée**. Une collision provoque une erreur de contrainte d'unicité **après** la création du compte.
2. **Non transactionnelle** : création du compte → création de l'établissement → création du profil. Un échec à l'étape 2 ou 3 laisse un compte orphelin, sans profil, donc sans accès à rien.
3. **Échec silencieux si la confirmation d'e-mail est active** : `signUp` retourne alors un utilisateur sans session ; l'insertion du profil est refusée par la politique `auth.uid() = id`. Le compte existe, le profil non.
4. **Erreurs affichées par `alert()`** natif (`:87`, `:146`), incohérent avec le système de notifications utilisé partout ailleurs.

**[RECO]** : dans coordo-eps, tout cela relève de l'hôte (§8.1). Ne pas reconstruire.

#### 9.2.2 Année scolaire par défaut codée en dur

Détaillé en §5.12. **Trois écrans** initialisent l'année à `"2025-26"` alors qu'une fonction de calcul existe. Conséquence la plus grave : **à partir de septembre 2026, le critère quiz du label tombe à 0** pour tous les établissements, sur la vue par défaut.

**Sources** : `app/etablissement/page.tsx:33`, `app/stats/perso/page.tsx:33`, `app/stats/etablissement/page.tsx:40`, plus la liste figée de `components/perso-manager.tsx:561-566`.

**[RECO]** : fonction utilitaire unique, aucune constante d'année dans le code.

#### 9.2.3 Les statistiques personnelles ignorent le type d'établissement

**Symptôme** : pour un professeur de lycée, l'écran affiche « Collège - CP1 à CP4 », exclut CP5 de ses données et calcule sa couverture sur 4 CP.

**Cause** : `totalCPs = 4` codé en dur (`app/stats/perso/page.tsx:115`) et exclusion inconditionnelle de CP5 (`:89`, `:104`).

**Conséquence** : un professeur de lycée spécialisé en CP5 (musculation, step) voit une page vide et un label « Non calculé », alors que ses données comptent bien dans le label d'établissement.

**[RECO]** : lire le type d'établissement, comme le fait l'écran d'établissement.

#### 9.2.4 Aucune validation des moyennes saisies

**Symptôme** : les champs de moyenne acceptent n'importe quelle valeur — 35, −4, 200. Aucune borne côté interface, aucune contrainte en base (`numeric(4,2)` accepte jusqu'à 99,99).

**Conséquence** : une faute de frappe (141 au lieu de 14,1) fausse l'écart moyen, donc le label de tout l'établissement, sans aucun signal.

**Source** : `components/perso-manager.tsx:576-600`, `001_initial_schema.sql:126-128`.

**[RECO]** : borne 0–20 côté interface **et** contrainte de vérification en base. Ajouter un avertissement de cohérence si l'écart dépasse 5 points.

#### 9.2.5 Aucune contrainte d'unicité sur les évaluations

**Symptôme** : la même classe × APSA × période × année peut être saisie plusieurs fois. Chaque doublon compte une fois de plus dans toutes les moyennes.

**Source** : `001_initial_schema.sql:118-136` — aucune contrainte unique.

**[RECO]** : contrainte unique sur (`évaluation_enseignant`, `classe`, `apsa`, `période`, `année`), avec un message d'interface explicite proposant de modifier la saisie existante.

#### 9.2.6 Cascades destructrices sans avertissement

**Symptôme** : supprimer un niveau détruit ses classes, donc les affectations, donc **toutes les évaluations historiques rattachées**. La confirmation affichée est `Êtes-vous sûr de vouloir supprimer ce niveau ?` — aucune mention du volume détruit.

**Chaîne** : `levels` → `classes` → `teacher_classes` → `class_activities`, toutes en `ON DELETE CASCADE` (`001_initial_schema.sql:54`, `:66-67`, `:106-107`, `:120`).

**Le même effet se produit** quand un professeur retire une classe de sa page personnelle : toutes ses saisies sur cette classe disparaissent (§3.6.1).

**[RECO]** : dans coordo-eps, `egalite_evaluations` ne doit **pas** être supprimée en cascade. Une évaluation est une donnée historique. Prévoir soit une restriction de suppression, soit un archivage, et **toujours** annoncer le volume concerné dans la confirmation.

#### 9.2.7 Trois labels contradictoires

Détaillé en §5.7 / §5.8 / §5.9. Trois formules incompatibles, sur trois écrans, pour la même notion.

**[RECO — appliquée]** : une seule formule (§5.7), calculée une seule fois, réutilisée partout.

#### 9.2.8 La documentation du label contredit le calcul

Détaillé en §5.7.5. La modale d'aide annonce « écart < 0,5 pt → 100 pts » alors que la formule donne 75.

**[RECO]** : corriger le texte, pas la formule.

### 9.3 Défauts de conception — biais de mesure

#### 9.3.1 Programmation déclarée et évaluations saisies ne sont jamais réconciliées

**Symptôme** : le poids des CP (50 % du label via l'équilibre et indirectement la couverture) provient de `apsa_classes`, tandis que l'écart et la couverture proviennent de `class_activities`. **Rien ne garantit leur cohérence.**

**Trois situations problématiques observables :**

| Situation | Effet sur le label |
|---|---|
| Programmation renseignée, aucune évaluation | État vide : aucun label affiché, malgré une programmation complète |
| Évaluations saisies, aucune programmation | Équilibre = **0**, soit 20 points perdus sans cause métier |
| Évaluation sur une APSA non programmée pour cette classe | Acceptée sans alerte ; incohérence invisible |

**Source** : §7.2.

**[RECO]** : trois options, par ordre de préférence :
- **(a)** Dériver le poids des CP des évaluations saisies quand la programmation est absente, avec mention explicite de la source utilisée.
- **(b)** Rendre la programmation obligatoire : bloquer la saisie d'une évaluation sur une APSA non programmée pour la classe.
- **(c)** Afficher un écran de cohérence listant les écarts entre programmé et évalué — utile en soi pour une équipe.

#### 9.3.2 Le biais des CP absentes dans le critère d'équilibre

Détaillé et chiffré en §5.5. Une CP jamais programmée n'est pas pénalisée par le critère d'équilibre.

**[RECO]** : itérer sur les CP attendues. Correction d'une ligne.

#### 9.3.3 Aucune pondération par effectif

Détaillé en §5.2. Une évaluation sur 15 élèves pèse autant qu'une évaluation sur 30.

**[RECO]** : les effectifs sont disponibles (P3). Prévoir une pondération, ou au minimum l'exposer comme option de lecture.

#### 9.3.4 Interprétations automatiques sans garde-fou statistique

**Trois affirmations produites sans condition d'effectif ni test de significativité :**

| Affirmation | Condition réelle | Risque |
|---|---|---|
| « Les professeures femmes obtiennent des écarts légèrement plus faibles » | comparaison stricte de deux moyennes, même sur 1 vs 1 observation | Affirmation non fondée sur une donnée sensible |
| « Les classes équilibrées tendent à présenter les écarts les plus faibles » | comparaison à un minimum, un groupe vide valant 0 | Affirmation quasi jamais affichée, ou fausse |
| « Votre score est supérieur à la moyenne de l'établissement » | comparaison stricte, même avec 1 seul répondant | Comparaison à soi-même |

**[RECO]** : effectif minimal par groupe (5 évaluations, 3 personnes), formulation graduée selon l'ampleur de l'écart, et message explicite d'effectif insuffisant en deçà. Une équipe EPS compte souvent 3 à 8 personnes : **le cas des petits effectifs est le cas normal, pas l'exception.**

#### 9.3.5 L'absence de quiz est traitée comme un mauvais score

Détaillé en §5.7.4. Perte sèche de 7 à 10 points sans cause métier.

**[RECO — appliquée]** : renormalisation sur les critères disponibles.

#### 9.3.6 Le label personnel contredit l'esprit de l'outil

Le quiz est explicitement présenté comme « pas un jugement » mais un « outil d'auto-positionnement » (§3.7.1). Dans le même temps, l'application attribue à chaque professeur un label personnel — « À renforcer » — visible sur son écran, avec des règles arbitraires (§5.9).

**[RECO]** : supprimer le label personnel, conserver les indicateurs bruts.

#### 9.3.7 La jauge du quiz contredit le niveau annoncé

Détaillé en §3.7.3. Un score de 8/15 affiche « Niveau 2 » tout en plaçant le curseur dans le segment « Niveau 3 ».

**[RECO]** : positionner le curseur sur les bornes réelles des niveaux (0-4, 5-8, 9-12, 13-15), non sur un pourcentage linéaire.

#### 9.3.8 La contribution individuelle au label est fausse

Détaillé en §3.7.3. La phrase « Votre contribution : X points sur 10 » calcule `pourcentage_individuel × 0,1`, alors que la contribution réelle dépend de la **moyenne d'établissement**.

**[RECO]** : afficher la contribution collective réelle, ou supprimer cette phrase.

### 9.4 Protection des données et éthique

#### 9.4.1 Le traitement réel n'est pas celui que décrivent les mentions légales

Les mentions légales annoncent la collecte de « moyennes d'élèves (anonymisées par genre) » (`app/legal/page.tsx:100`). Le traitement va plus loin et n'est pas décrit :

| Donnée réellement traitée | Décrite dans les mentions ? |
|---|---|
| Sexe de l'enseignant | ❌ **Non** |
| Réponses individuelles à un questionnaire d'auto-évaluation professionnelle | ❌ **Non** |
| Analyse comparative des résultats **selon le sexe de l'enseignant** | ❌ **Non** |

**[RECO]** : compléter les mentions légales de l'hôte avec ces trois éléments, indiquer la finalité, et rendre le renseignement du sexe **facultatif** (la valeur `prefer_not_to_say` existe déjà dans la liste mais n'est jamais expliquée à l'utilisateur).

#### 9.4.2 Ré-identification dans les petits effectifs

**Deux restitutions permettent d'identifier une personne dans une équipe réduite :**

1. **Analyse par sexe du professeur** (§5.10) : dans une équipe de 4 personnes dont un seul homme, le bloc « Professeurs hommes : 1,70 sur 1 activité » **désigne cette personne**. Son écart F/G devient une donnée de performance individuelle, lisible par toute l'équipe.
2. **Moyenne du quiz** (§5.6.4) : avec un seul répondant, la « moyenne d'établissement » **est** le score individuel de cette personne, affiché à tous.

**[RECO — à traiter avant mise en service]** :
- Seuil minimal de **3 personnes et 5 observations** par groupe pour toute restitution ventilée par sexe d'enseignant ; en deçà, message « effectif insuffisant pour une analyse fiable ».
- Seuil minimal de **3 répondants** pour afficher la moyenne du quiz ; en deçà, afficher le nombre de répondants sans la moyenne, et **neutraliser le critère quiz** par renormalisation (§5.7.4).
- Rendre l'analyse par sexe d'enseignant **désactivable** au niveau de l'équipe.

#### 9.4.3 Le rôle `admin` n'existe que sur le papier

Tout membre peut supprimer la programmation commune de toute l'équipe, sans trace ni possibilité d'annulation (§2.1, §9.2.6).

**[DÉCISION VALIDÉE]** : ce modèle de droits égaux est **assumé** pour coordo-eps (§2.3). Mais il rend deux mesures nécessaires :
- **Journal des suppressions** sur les données partagées (programmation, APSA), pour savoir qui a supprimé quoi.
- **Confirmation renforcée** annonçant le volume de données affecté.

### 9.5 Qualité technique

| # | Constat | Source | Recommandation |
|---|---|---|---|
| 1 | **`@ts-nocheck` sur 11 fichiers**, dont tous les écrans de calcul | en-tête de fichier | Régénérer les types, retirer les désactivations |
| 2 | **Types de base de données périmés** — 6 objets manquants | `types/database.types.ts` | Régénérer depuis le schéma |
| 3 | **Traces de débogage laissées en production** | `app/stats/etablissement/page.tsx:96` | Supprimer |
| 4 | **Commentaire trompeur** : « CORRECTION: utiliser establishment_id au lieu de school_id » suivi d'un filtre sur `school_id` | `app/stats/etablissement/page.tsx:87-93` | Nommer la colonne de façon cohérente |
| 5 | **Aucun test**, d'aucune nature | dépôt entier | Couvrir en priorité les fonctions de calcul (§5) |
| 6 | **Calculs dans les composants d'affichage**, non isolés, non testables | `stats/*` | Extraire dans un module de calcul pur |
| 7 | **Redirection inadaptée** : `/* → /index.html` en 200, incompatible avec un rendu serveur | `netlify.toml:11-14` | Supprimer |
| 8 | **Duplication de contenu** entre deux modales | `eps-info-modal` / `sources-modal` | Source unique |
| 9 | **Filtrage côté client après requête** sur les associations APSA↔classe | `app/stats/etablissement/page.tsx:111-117` | Filtrer côté serveur |
| 10 | **Temporisation arbitraire de 500 ms** après enregistrement du quiz | `components/vigilance-quiz.tsx:288-291` | Recalcul explicite |
| 11 | **Confirmations par `confirm()` natif**, notifications par `alert()` | plusieurs fichiers | Uniformiser |
| 12 | **Identifiant de projet de base de données exposé** dans le fichier d'exemple d'environnement | `.env.local.example:2` | Retirer |
| 13 | **Tri alphabétique** classant « 6e10 » avant « 6e2 » | `app/etablissement/page.tsx:94`, `:103` | Tri naturel |
| 14 | **Application installable non fonctionnelle** : composant d'enregistrement jamais monté | `components/pwa-register.tsx` | Relève de l'hôte |

### 9.6 Fonctionnalités manquantes

| Manque | Impact métier | Priorité |
|---|---|---|
| **Aucun export** (§6.6) | L'équipe ne peut rien présenter en conseil pédagogique | **Haute** |
| **Aucune comparaison pluriannuelle** | Les données existent, aucun écran ne les exploite. C'est pourtant l'usage naturel : « avons-nous progressé ? » | **Haute** |
| **Aucun historique des labels** (`equality_labels` mort, §7.1.12) | Impossible de savoir quel label on avait l'an dernier | **Haute** |
| **Aucune modification des informations d'établissement** (§3.5.1) | Une erreur de type à l'inscription fausse le label définitivement | **Haute** |
| **Aucune saisie en lot** des moyennes | Saisie fastidieuse : une activité à la fois, formulaire complet à chaque fois | Moyenne |
| **Aucune duplication de programmation** d'une année sur l'autre | Toute la programmation est à ressaisir chaque année | Moyenne |
| **Aucun import de données** | Les moyennes existent déjà dans les logiciels de notes | Moyenne |
| **Aucune vue de cohérence** programmé / évalué (§9.3.1) | Les incohérences restent invisibles | Moyenne |
| **Aucune suppression de compte** ni export personnel, alors que les mentions légales les promettent (§3.11) | Écart entre l'engagement affiché et le produit | Moyenne |
| **Aucune relance** pour compléter le quiz | Le critère reste à 0 faute de sollicitation | Basse |

### 9.7 Synthèse priorisée

**À traiter impérativement avant toute mise en service**

| # | Point | § |
|---|---|---|
| 1 | Schéma entièrement versionné en migrations | 9.1.1 |
| 2 | Politiques de sécurité sans `USING (true)` | 9.1.2 |
| 3 | Un seul label, une seule formule | 9.2.7 |
| 4 | Seuils de confidentialité sur les restitutions ventilées | 9.4.2 |
| 5 | Année scolaire calculée, jamais codée en dur | 9.2.2 |

**À traiter avant la première campagne annuelle**

| # | Point | § |
|---|---|---|
| 6 | Correction du biais des CP absentes | 9.3.2 |
| 7 | Renormalisation en l'absence de quiz | 9.3.5 |
| 8 | Validation des moyennes et unicité des saisies | 9.2.4, 9.2.5 |
| 9 | Suppression non destructrice de l'historique | 9.2.6 |
| 10 | Prise en compte du type d'établissement partout | 9.2.3 |
| 11 | Correction de la modale d'aide | 9.2.8 |
| 12 | Interprétations automatiques encadrées | 9.3.4 |

**Améliorations à forte valeur**

| # | Point | § |
|---|---|---|
| 13 | Export de la fiche de synthèse du label | 6.6 |
| 14 | Historique et comparaison pluriannuelle | 9.6 |
| 15 | Réconciliation programmé / évalué | 9.3.1 |
| 16 | Duplication de la programmation d'une année sur l'autre | 9.6 |
| 17 | Modification des informations d'établissement | 9.6 |

---

## 10. Annexes

### Annexe A — Inventaire du dépôt d'origine

| Fichier | Lignes | Rôle | Sort dans coordo-eps |
|---|---|---|---|
| `app/page.tsx` | 141 | Accueil public | **Doublon** |
| `app/layout.tsx` | 40 | Structure globale | **Doublon** |
| `app/auth/login/page.tsx` | 125 | Connexion | **Doublon** |
| `app/auth/signup/page.tsx` | 392 | Inscription | **Doublon** |
| `app/auth/forgot-password/page.tsx` | 148 | Mot de passe oublié | **Doublon** |
| `app/auth/reset-password/page.tsx` | 204 | Réinitialisation | **Doublon** |
| `app/dashboard/page.tsx` | 471 | Tableau de bord | **À refondre** (§5.8) |
| `app/etablissement/page.tsx` | 1 048 | Niveaux, classes, APSA, programmation | **Partiel** — garder APSA + programmation |
| `app/perso/page.tsx` | 125 | Chargement page personnelle | **Partiel** |
| `app/stats/page.tsx` | 6 | Redirection | À adapter |
| `app/stats/perso/page.tsx` | 615 | Statistiques personnelles | **À conserver**, corriger §9.2.3 et §5.9 |
| `app/stats/etablissement/page.tsx` | 924 | Statistiques et label | **Cœur du module** |
| `app/legal/page.tsx` | 364 | Mentions légales | **Doublon**, à compléter (§9.4.1) |
| `components/perso-manager.tsx` | 702 | Classes et saisies | **Partiel** — garder les saisies |
| `components/vigilance-quiz.tsx` | 622 | Quiz complet | **À conserver** |
| `components/label-info-modal.tsx` | 274 | Aide au calcul du label | **À conserver**, corriger §5.7.5 |
| `components/eps-info-modal.tsx` | 216 | Contenu « À propos » | **À conserver** |
| `components/sources-modal.tsx` | 352 | Bibliographie | **À conserver**, dédoublonner |
| `components/school-year-selector.tsx` | 49 | Sélecteur d'année | **À conserver**, corriger §5.12 |
| `components/nav-bar.tsx` | 183 | Navigation | **Doublon** |
| `components/footer.tsx` | 75 | Pied de page | **Doublon** |
| `components/pwa-register.tsx` | 20 | Enregistrement du service worker | **[MORT]** |
| `components/ui/*` | ~600 | Composants d'interface génériques | **Doublon** |
| `lib/supabase/*` | 39 | Clients d'accès aux données | **Doublon** |
| `middleware.ts` | 63 | Protection des routes | **Doublon** |
| `types/database.types.ts` | 359 | Types de base de données | **Périmé** (§7.3) |
| `supabase/migrations/001` | 196 | Schéma initial | **Incomplet** (§7.3) |
| `supabase/migrations/002` | 425 | Politiques de sécurité | **À revoir** (§9.1.2) |
| `supabase/migrations/003` | 14 | Correctif de vue | **Inapplicable** sur base vierge |

**Total : 5 983 lignes** — dont environ 40 % de doublons avec l'hôte.

### Annexe B — Correspondance exigence → source

| Exigence | § | Fichier source principal |
|---|---|---|
| Référentiel des CP | 4.1 | `supabase/migrations/001_initial_schema.sql:80-97` |
| Questions du quiz | 4.2 | `components/vigilance-quiz.tsx:47-75` |
| Niveaux de vigilance | 4.3 | `components/vigilance-quiz.tsx:77-102` |
| Libellés et textes des labels | 4.4 | `app/stats/etablissement/page.tsx:239-252`, `:497-517` |
| Aide au calcul du label | 4.5.1 | `components/label-info-modal.tsx` |
| Contenu « À propos » | 4.6 | `components/eps-info-modal.tsx:38-236` |
| Bibliographie commentée | 4.7.2 | `components/sources-modal.tsx:203-333` |
| Écart F/G | 5.1–5.2 | `app/stats/etablissement/page.tsx:155-160` |
| Couverture des CP | 5.3 | `app/stats/etablissement/page.tsx:206-212` |
| Poids des CP | 5.4 | `app/stats/etablissement/page.tsx:176-184` |
| Équilibre des CP | 5.5 | `app/stats/etablissement/page.tsx:186-205` |
| Score et niveau du quiz | 5.6 | `components/vigilance-quiz.tsx:232-234` |
| Label d'établissement | 5.7 | `app/stats/etablissement/page.tsx:214-252` |
| Label du tableau de bord | 5.8 | `app/dashboard/page.tsx:82-104` |
| Label personnel | 5.9 | `app/stats/perso/page.tsx:122-142` |
| Analyse par sexe d'enseignant | 5.10 | `app/stats/etablissement/page.tsx:294-331` |
| Analyse par composition de classe | 5.11 | `app/stats/etablissement/page.tsx:333-385` |
| Calcul de l'année scolaire | 5.12 | `components/school-year-selector.tsx:13-27` |
| Graphiques | 6.2 | `app/stats/*/page.tsx` |
| Modèle de données | 7 | `supabase/migrations/001_initial_schema.sql` + code |
| Politiques de sécurité | 7.6 | `supabase/migrations/002_rls_policies.sql` |

### Annexe C — Checklist de recette fonctionnelle

À dérouler sur une base vierge, dans cet ordre.

**Préparation**
- [ ] La base se reconstruit intégralement depuis les seules migrations, sans intervention manuelle *(§9.1.1)*
- [ ] Le module est désactivé par défaut ; il s'active par le drapeau de fonctionnalité
- [ ] Les 5 CP sont présentes avec les intitulés exacts de §4.1

**Programmation**
- [ ] Création d'une APSA rattachée à une CP
- [ ] En collège, CP5 n'est **pas** proposée
- [ ] En lycée, CP5 **est** proposée
- [ ] Association de classes à une APSA pour une année donnée
- [ ] Changer d'année scolaire affiche des associations distinctes
- [ ] Réenregistrer une association remplace bien l'ancienne sélection

**Saisie**
- [ ] Une évaluation ne peut être créée que sur une classe affectée à l'enseignant *(P1)*
- [ ] Une moyenne hors de l'intervalle 0–20 est refusée *(§9.2.4)*
- [ ] Un doublon exact est refusé avec un message explicite *(§9.2.5)*
- [ ] La liste des évaluations est filtrée par année scolaire *(§3.6.2)*
- [ ] Un enseignant ne peut pas modifier la saisie d'un collègue *(§2.3)*
- [ ] Un enseignant **peut** lire les saisies de ses collègues *(§2.3)*

**Quiz**
- [ ] Les 5 questions s'affichent avec leurs intitulés exacts *(§4.2)*
- [ ] Le barème 3 / 1 / 0 est appliqué
- [ ] Le niveau correspond aux bornes de §5.6.2
- [ ] Le curseur de la jauge est cohérent avec le niveau *(§9.3.7)*
- [ ] Un second passage la même année est traité selon la règle retenue *(§3.7.3)*
- [ ] Aucun score nominatif de collègue n'est accessible *(§2.3)*

**Calculs** — à vérifier sur le jeu de données de §5.0
- [ ] Écart moyen = **0,93**
- [ ] Couverture = **3 / 4**, soit **75 %**
- [ ] Poids : CP1 = 6, CP2 = 0, CP3 = 3, CP4 = 7
- [ ] Score d'équilibre = **37,5** avec la correction §9.3.2 *(50 sans la correction)*
- [ ] Moyenne du quiz = **10,5 / 15**, 2 répondants
- [ ] Score total et label conformes à §5.7.4
- [ ] Sans aucun quiz : renormalisation appliquée *(§5.7.4)*
- [ ] Le tableau de bord affiche **le même** label et le **même** écart que l'écran de statistiques *(§9.2.7)*

**Confidentialité**
- [ ] L'analyse par sexe d'enseignant est masquée en dessous des seuils de §9.4.2
- [ ] La moyenne du quiz est masquée en dessous de 3 répondants
- [ ] Aucune donnée d'un autre établissement n'est accessible, même en lecture *(§9.1.2)*

**États vides**
- [ ] Aucune APSA · aucune classe affectée · aucune évaluation · aucun quiz · aucune programmation — chacun affiche un message d'action, pas un écran blanc ni un zéro trompeur

**Point d'entrée et restriction d'accès** *(§2.4)*
- [ ] L'entrée « EPS Égalité » figure dans le **menu Outils**, au même niveau que « Schéma »
- [ ] Connecté avec le compte autorisé : l'entrée apparaît et le module fonctionne
- [ ] Connecté avec **tout autre compte** : l'entrée n'apparaît pas
- [ ] Tout autre compte, **accès direct par l'URL** : page inexistante ou redirection, sans révéler l'existence du module
- [ ] Tout autre compte, **interrogation directe des tables du module** : aucune ligne retournée
- [ ] Non connecté : aucun accès, aucune donnée
- [ ] L'adresse autorisée est **modifiable sans déploiement**
- [ ] L'autorisation est évaluée par **un seul point de contrôle**, identifiable dans le code

**Non-régression de l'hôte**
- [ ] Module désactivé : aucun changement visible dans coordo-eps
- [ ] Aucune table existante modifiée sans justification écrite
- [ ] Aucune migration destructive
- [ ] Le menu Outils se comporte à l'identique pour un compte non autorisé
- [ ] La fonctionnalité « Schéma » est inchangée dans son comportement et ses performances

### Annexe D — Scénario de bout en bout

Reprend le jeu de données de §5.0.

1. **Configuration** — L'équipe du Collège Victor Hugo active le module. Type : collège → 4 CP, CP5 exclue.
2. **Programmation** — Alice crée 5 APSA et les associe aux classes pour 2025-26 (§5.0). CP2 reste vide : l'équipe ne programme aucune activité de pleine nature.
3. **Saisie** — Bruno saisit Badminton/4e2 (12,40 / 14,10). Alice saisit Acrosport/5e1 (15,20 / 14,90). Chloé saisit Demi-fond/3eC (11,60 / 12,40).
4. **Quiz** — Alice obtient 12/15 (niveau 3), Bruno 9/15 (niveau 3). Chloé ne répond pas.
5. **Restitution** — L'écran affiche :
   - Écart moyen **0,93** — code couleur jaune
   - Couverture **3 / 4** — 75 %
   - Alerte de déséquilibre : CP4 à 43,8 % des enseignements, en ambre
   - Encart « Il manque 1 CP pour une couverture complète »
   - Quiz **10,5/15**, 2 répondants
   - **Score 61/100 — label « En progrès »** *(58/100 avec la correction du biais §9.3.2)*
   - Analyse par sexe d'enseignant : **masquée**, effectif insuffisant *(§9.4.2)*
   - Analyse par composition de classe : 3 catégories à une donnée chacune → **masquée** pour la même raison
6. **Lecture par l'équipe** — Trois leviers visibles et actionnables :
   - **CP2 absente** de la programmation : c'est le gisement le plus rentable, elle pèse à la fois sur la couverture (30 %) et sur l'équilibre (20 %).
   - **CP4 surreprésentée** : 7 enseignements sur 16.
   - **Chloé n'a pas répondu au quiz**, ce qui laisse le critère de vigilance incomplet.

---

*Fin de la spécification. Document rédigé pour être lu intégralement avant toute conception technique.*
