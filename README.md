# EPS Égalité

Application SaaS / PWA pour les équipes EPS des établissements scolaires, permettant de faire un état des lieux de l'égalité Filles/Garçons en EPS et de la répartition des compétences propres (CP) travaillées.

## Stack Technique

- **Framework**: Next.js 15 + TypeScript (App Router)
- **UI/CSS**: Tailwind CSS + shadcn/ui
- **Backend/BDD**: Supabase (PostgreSQL + Auth + RLS)
- **Déploiement**: Netlify
- **PWA**: Manifest + Service Worker

## Prérequis

- Node.js 20+
- npm ou yarn
- Compte Supabase

## Installation

1. Cloner le projet :
```bash
git clone <repo-url>
cd epsEgal
```

2. Installer les dépendances :
```bash
npm install
```

3. Configurer les variables d'environnement :
```bash
cp .env.local.example .env.local
```

Éditer `.env.local` et ajouter vos clés Supabase :
```
NEXT_PUBLIC_SUPABASE_URL=https://wvlanpnwijeoyhenrpyn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon_ici
```

4. Exécuter les migrations SQL dans Supabase :
   - Ouvrir le SQL Editor dans votre projet Supabase
   - Exécuter dans l'ordre :
     - `supabase/migrations/001_initial_schema.sql`
     - `supabase/migrations/002_rls_policies.sql`

5. Lancer le serveur de développement :
```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## Structure du Projet

```
epsEgal/
├── app/                          # Pages Next.js (App Router)
│   ├── auth/                     # Pages d'authentification
│   │   ├── login/
│   │   └── signup/
│   ├── dashboard/                # Tableau de bord
│   ├── etablissement/            # Gestion établissement
│   ├── perso/                    # Page personnelle professeur
│   ├── stats/                    # Statistiques
│   │   ├── perso/
│   │   └── etablissement/
│   ├── layout.tsx                # Layout racine
│   ├── page.tsx                  # Page d'accueil
│   └── globals.css               # Styles globaux
├── components/                   # Composants React
│   ├── ui/                       # Composants shadcn/ui
│   ├── nav-bar.tsx              # Navigation
│   └── pwa-register.tsx         # Enregistrement PWA
├── lib/                          # Utilitaires
│   ├── supabase/                # Clients Supabase
│   │   ├── client.ts            # Client navigateur
│   │   └── server.ts            # Client serveur
│   └── utils.ts                 # Utilitaires généraux
├── types/                        # Types TypeScript
│   └── database.types.ts        # Types Supabase
├── public/                       # Assets statiques
│   ├── manifest.json            # Manifest PWA
│   └── sw.js                    # Service Worker
├── supabase/                     # Migrations SQL
│   └── migrations/
│       ├── 001_initial_schema.sql
│       └── 002_rls_policies.sql
├── middleware.ts                 # Middleware Next.js (auth)
├── next.config.js               # Config Next.js
├── tailwind.config.ts           # Config Tailwind
├── netlify.toml                 # Config Netlify
└── package.json
```

## Fonctionnalités

### Authentification
- Inscription avec création d'établissement
- Inscription avec code pour rejoindre un établissement existant
- Connexion / Déconnexion
- Middleware de protection des routes

### Gestion Établissement
- Configuration des niveaux (6e, 5e, etc.)
- Configuration des classes
- Programmation des APSA (Activités Physiques Sportives et Artistiques)
- Lien avec les Compétences Propres (CP1 à CP5)

### Page Personnelle
- Gestion des classes du professeur
- Saisie des moyennes de notes par activité
- Moyennes distinctes Filles/Garçons

### Statistiques

#### Statistiques Personnelles
- Écart moyen Filles/Garçons par APSA
- Écart moyen Filles/Garçons par CP
- Répartition des APSA par CP

#### Statistiques Établissement
- Agrégation des données de tous les professeurs
- Écart moyen F/G global
- Couverture des CP
- **Label d'égalité** :
  - **Équilibré** : Écart moyen < 0.5 + toutes les CP couvertes
  - **En progrès** : Écart moyen < 1 OU au moins 4 CP couvertes
  - **À renforcer** : Autres cas

## Base de Données

### Schéma Principal

- `profiles` : Profils utilisateurs (lié à auth.users)
- `establishments` : Établissements scolaires
- `levels` : Niveaux (6e, 5e, etc.)
- `classes` : Classes de l'établissement
- `cp` : Compétences Propres (CP1 à CP5) - table globale
- `apsa` : APSA de l'établissement
- `teacher_classes` : Association professeur ↔ classe
- `class_activities` : Activités par classe avec moyennes F/G
- `equality_labels` : Labels d'égalité calculés

### Row Level Security (RLS)

Toutes les tables sont protégées par RLS. Les utilisateurs ne peuvent accéder qu'aux données de leur établissement.

## Déploiement sur Netlify

1. Connecter votre repo GitHub à Netlify
2. Configurer les variables d'environnement :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Le build se fera automatiquement selon `netlify.toml`

## PWA

L'application est installable en tant que PWA :
- Manifest configuré
- Service Worker pour cache offline basique
- Icônes à personnaliser dans `/public`

## Développement

### Commandes

```bash
npm run dev      # Serveur de développement
npm run build    # Build production
npm run start    # Serveur production
npm run lint     # Linter
```

### Ajouter des composants shadcn/ui

```bash
npx shadcn@latest add [component-name]
```

## Améliorations Futures

- [ ] Interface de gestion CRUD complète (ajouter/modifier/supprimer niveaux, classes, APSA)
- [ ] Export des statistiques (PDF, Excel)
- [ ] Graphiques interactifs (recharts)
- [ ] Mode hors-ligne avancé
- [ ] Notifications push
- [ ] Import CSV des données
- [ ] Rôles admin/professeur avec permissions
- [ ] Dashboard admin établissement

## Licence

Projet éducatif - À définir

## Support

Pour toute question ou problème, ouvrir une issue sur le repo.