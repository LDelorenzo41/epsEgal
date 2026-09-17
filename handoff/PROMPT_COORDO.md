# Prompt de démarrage — module « EPS Égalité » dans coordo-eps

## Mode d'emploi *(ne pas copier)*

1. Copier `handoff/SPEC_EGALITE.md` dans le dépôt coordo-eps, à l'emplacement `docs/egalite/SPEC_EGALITE.md`.
2. Ouvrir une **nouvelle session Claude Code** à la racine du dépôt coordo-eps.
3. Copier-coller **tout ce qui suit la ligne de séparation**, jusqu'à la fin du fichier.
4. Ne rien ajouter d'autre dans le premier message : le prompt demande explicitement une phase d'analyse sans code.

---

Tu interviens sur **coordo-eps**, un SaaS destiné aux coordonnateurs d'équipes EPS. L'application gère déjà l'authentification, les établissements, les équipes, les membres, les classes et les affectations, sur Supabase.

Je veux y ajouter un nouveau module : **EPS Égalité**.

## 1. Ce qu'est le module

EPS Égalité permet à une équipe EPS de se situer objectivement sur l'égalité filles/garçons dans sa propre pratique. Le module :

- décrit la programmation annuelle de l'équipe (APSA rattachées aux compétences propres, et quelles classes pratiquent quelle APSA) ;
- recueille, par enseignant et par classe, les **moyennes de notes ventilées filles / garçons** — aucune donnée individuelle d'élève ;
- propose à chaque enseignant un **quiz d'auto-positionnement** en 5 questions sur la vigilance aux stéréotypes de genre ;
- restitue des statistiques personnelles et d'équipe (écarts, couverture et équilibre des compétences propres, analyses croisées) ;
- attribue un **Label Égalité** sur 100 points, réparti en trois niveaux.

Le module existe aujourd'hui sous forme d'une application autonome. **Nous ne reprenons ni son code, ni ses données** : la base est vierge et nous repartons de zéro, comme module intégré.

## 2. Première action attendue

**Lis intégralement `docs/egalite/SPEC_EGALITE.md`** avant toute autre chose.

C'est la spécification fonctionnelle exhaustive du module : parcours écran par écran, contenus métier recopiés à l'identique (questionnaires, intitulés, échelles), formules de calcul complètes avec exemples chiffrés, modèle de données conceptuel, et la liste des défauts de l'application d'origine avec les recommandations associées.

Ce document est indépendant de toute technologie. Il te dit **quoi** construire, pas **comment**. Le *comment* doit sortir de ton analyse de coordo-eps.

Trois sections à lire avec une attention particulière :

- **§0.4 — les trois prérequis** que coordo-eps doit fournir au module. Ta toute première tâche d'analyse est de vérifier s'ils sont satisfaits.
- **§5 — la logique de calcul.** Chaque formule y est donnée avec un exemple chiffré vérifiable. Le jeu de données de §5.0 sert de test de recette.
- **§9 — les défauts identifiés.** La spécification décrit l'existant *et* signale ce qui est faux. Les points marqués **[RECO]** sont les corrections à appliquer dans la reconstruction ; les points marqués **[BOGUÉ]** ne doivent **pas** être reproduits.

## 3. Contrainte n° 1 — AUCUNE RÉGRESSION DANS COORDO-EPS

coordo-eps est **en production, avec des utilisateurs réels**. Le module est un ajout, jamais une refonte. Cette contrainte prime sur toutes les autres, y compris sur l'élégance de l'architecture et sur le délai.

Sept règles, non négociables :

### 3.1 Code isolé dans un dossier dédié

Tout le code du module vit dans un répertoire qui lui est propre. Un développeur doit pouvoir supprimer ce répertoire et voir coordo-eps continuer de fonctionner à l'identique.

### 3.2 Tables préfixées `egalite_`

Toute table, vue, fonction, déclencheur, type ou politique créé par le module porte le préfixe `egalite_`. Aucune exception. Un `\dt egalite_*` doit donner l'inventaire complet de l'empreinte du module en base.

### 3.3 Migrations uniquement additives

- Aucun `DROP`, aucun `ALTER ... DROP COLUMN`, aucun changement de type sur une colonne existante.
- Aucune modification d'une table existante de coordo-eps sans justification écrite et validation préalable.
- Si une colonne doit être ajoutée à une table existante (le cas le plus probable : le sexe de l'enseignant, ou le type d'établissement), elle est **nullable, sans valeur par défaut contraignante**, et tu me le signales explicitement dans le plan avant de l'écrire.
- Chaque migration doit être réversible, et son annulation documentée.
- **Tout le schéma passe par des migrations versionnées.** Aucune modification à la main dans l'interface Supabase — c'est précisément le défaut n° 1 de l'application d'origine (§9.1.1 de la spec), qui la rend aujourd'hui non reconstructible.

### 3.4 Sécurité au niveau des lignes sur chaque table

- RLS activée sur **chacune** des tables du module, sans exception.
- Une politique par table et par opération (lecture, insertion, modification, suppression).
- **Aucun `USING (true)`, aucun `WITH CHECK (true)`, nulle part.** L'application d'origine expose ainsi la totalité de ses établissements et de leurs codes d'accès (§9.1.2 de la spec).
- Les politiques dérivent de la logique d'appartenance **déjà utilisée par coordo-eps**. Tu ne réimplémentes pas cette logique : tu l'appelles.
- Les réponses individuelles au quiz ne sont accessibles qu'à leur auteur, jamais aux collègues, même en lecture.

### 3.5 Drapeau de fonctionnalité désactivé par défaut

- Le module est **inactif par défaut**, pour tous les établissements.
- Drapeau inactif = aucune entrée de menu, aucune route accessible, aucune requête émise, aucun coût de chargement.
- L'activation se fait par établissement (ou par équipe, selon l'arbitrage de §7.5.3 de la spec), pas globalement.
- Le comportement de coordo-eps avec le drapeau inactif doit être **strictement identique** à son comportement actuel.

### 3.6 Tout fichier existant modifié est annoncé et justifié

Pour chaque fichier de coordo-eps que tu touches :

1. tu l'annonces **avant** de le modifier ;
2. tu expliques pourquoi la modification est inévitable ;
3. tu montres la modification minimale qui répond au besoin ;
4. tu indiques comment vérifier l'absence de régression.

Un point d'entrée de menu et un enregistrement de route sont attendus. Au-delà, chaque fichier touché doit être défendu.

### 3.7 Droits d'écriture — modèle retenu

**Tous les enseignants membres de l'équipe EPS ont les mêmes droits de lecture et d'écriture** sur les données du module de leur établissement. Il n'y a pas de rôle privilégié au sein du module.

Deux réserves, détaillées en §2.3 de la spec :

- un enseignant ne modifie que **ses propres** saisies de moyennes, mais **lit** celles de ses collègues (indispensable aux statistiques d'équipe) ;
- les réponses nominatives au quiz ne sont jamais lisibles par les collègues — seuls la moyenne d'équipe et le nombre de répondants le sont, au-delà d'un seuil minimal de répondants.

## 4. Ce que je te demande maintenant — analyse, puis plan, SANS CODER

### Étape 1 — Analyse de l'existant

Explore coordo-eps et rends-moi une synthèse structurée :

**a) Architecture**
- organisation des dossiers, conventions de nommage, découpage des responsabilités ;
- où et comment sont écrites les requêtes à la base ;
- où vivent les composants réutilisables, les utilitaires, les types ;
- comment les migrations sont gérées, et où en est l'état du schéma.

**b) Modèle de données existant**
- entités disponibles : établissements, équipes, membres, classes, niveaux, années scolaires ;
- relations et clés ;
- politiques RLS en place et fonctions d'appartenance réutilisables.

**c) Les trois prérequis de §0.4 de la spec** — c'est le point le plus important de ton analyse :

| # | Prérequis | Question précise |
|---|---|---|
| **P1** | Affectation enseignant ↔ classes | Existe-t-elle ? Sous quelle forme ? **Est-elle datée par année scolaire ?** |
| **P2** | Sexe de l'enseignant | Est-il disponible sur le profil ? Avec quelles valeurs possibles ? |
| **P3** | Effectifs filles / garçons par classe | Sont-ils disponibles ? Renseignés en pratique ? |

**P1 est bloquant** : sans lui, le module ne peut pas être construit. Si P1 manque, dis-le-moi immédiatement et arrête-toi là.

**d) Cinq questions complémentaires** (§8.3 de la spec)
- le **type d'établissement** (collège / lycée GT / lycée pro) est-il disponible ? Il détermine 100 % du calcul du label ;
- la notion d'**année scolaire** existe-t-elle, et sous quel format exact ?
- y a-t-il **plusieurs équipes par établissement**, ou une seule ?
- existe-t-il déjà un **mécanisme de drapeau de fonctionnalité** ?
- quelles **conventions d'interface** dois-je respecter (bibliothèque de composants, graphiques, notifications, fenêtres modales) ?

**e) Points de vigilance**
- zones du code qu'il vaut mieux ne pas toucher ;
- fichiers qu'il faudra probablement modifier, et pourquoi ;
- dépendances à ajouter, le cas échéant, avec justification.

### Étape 2 — Plan en lots

Propose un découpage en **lots livrables indépendamment**, chacun apportant de la valeur et vérifiable seul.

Pour chaque lot :

- **objectif** en une phrase ;
- **contenu** : écrans, tables, calculs concernés, avec renvoi aux sections de la spec ;
- **migrations** : ce qui est créé, et la preuve du caractère additif ;
- **fichiers existants touchés**, avec justification (idéalement : aucun) ;
- **critères de recette** : ce que je dois pouvoir vérifier moi-même, en m'appuyant sur l'annexe C et le jeu de données de §5.0 de la spec ;
- **risque de régression** identifié, et comment il est neutralisé ;
- **dépendances** vis-à-vis des autres lots.

Ordonne les lots par valeur décroissante, et indique lesquels sont parallélisables.

Suggestion de découpage, à critiquer librement — c'est ta proposition qui compte, pas la mienne :

1. Fondations : drapeau de fonctionnalité, schéma, RLS, référentiel des compétences propres, coquille de navigation ;
2. Programmation : APSA, rattachement aux compétences propres, association APSA ↔ classes par année ;
3. Saisie des moyennes filles / garçons ;
4. Calculs et restitutions personnelles ;
5. Quiz de vigilance ;
6. Label d'équipe et restitutions collectives ;
7. Historique pluriannuel et export de la fiche de synthèse.

### Étape 3 — Points à trancher

Liste les décisions qui m'appartiennent et que tu ne peux pas prendre seul. Pour chacune : l'enjeu, les options, ta recommandation motivée. La spec en identifie déjà plusieurs (§7.5.3, §8.4, §9.4.2) ; il y en aura d'autres, propres à l'architecture de coordo-eps.

## 5. Règles de travail

- **Tu ne codes rien tant que je n'ai pas validé le plan.** Aucun fichier créé, aucune migration écrite, aucune dépendance installée pendant les étapes 1 à 3.
- Tu peux lire tout le dépôt, exécuter des commandes en lecture seule, inspecter le schéma.
- **Réponds en français**, de façon structurée et directe, sans remplissage.
- Si une information te manque pour décider, **demande-la** au lieu de supposer.
- Si tu constates que la spécification contredit ce que tu observes dans coordo-eps, **signale-le** : la spécification décrit une application autonome, pas coordo-eps.

Commence par lire `docs/egalite/SPEC_EGALITE.md`, puis livre-moi l'étape 1.
