# Portfolio — Guillaume Berthelot

Site vitrine 100 % statique : le contenu (profil, expériences, projets) vit dans des
fichiers Markdown chargés côté client par un mini-moteur maison (`shared/portfolio.js`).
**Aucune étape de build**, aucun framework — déployable tel quel sur GitHub Pages.

> ⚠️ Tout le contenu de `content/` est un **exemple fictif** à remplacer par vos vraies
> expériences et projets (les liens GitHub/LinkedIn du profil sont aussi des placeholders).

## Tester en local

```bash
./serve.sh          # ou : python3 -m http.server 8000
```

Puis ouvrir <http://localhost:8000> : la page d'accueil liste les 5 prototypes.

| Dossier | Style |
|---|---|
| `prototypes/01-mission-control/` | NASA-punk / cassette futurism — console spatiale, ambre + vert phosphore |
| `prototypes/02-terminal/` | Session shell plein écran, prompt interactif |
| `prototypes/03-neobrutalisme/` | Bordures épaisses, ombres dures, couleurs franches |
| `prototypes/04-editorial/` | Typographie Swiss, sections numérotées, bleu Klein |
| `prototypes/05-bento/` | Grille bento dark mode, cartes verre, vibe dashboard SaaS |
| `prototypes/06-bento-nasa/` | Hybride : la grille bento du 05 + ADN NASA-punk (ambre, micro-labels console, LEDs, télémétrie) |

Important : servir depuis **la racine du dépôt** (les prototypes vont chercher
`../../content/`). Ouvrir un `index.html` en double-cliquant (`file://`) ne
fonctionnera pas — `fetch()` exige un serveur HTTP.

## Ajouter / modifier du contenu

Chaque document est un fichier Markdown avec un en-tête « frontmatter » :

```markdown
---
title: Développeur full-stack
org: Nom du client (mission freelance)
period: janv. 2025 — juin 2026
date: 2025-01
location: Remote
tags: TypeScript, React, PostgreSQL
summary: Une phrase de résumé affichée dans les listes.
---

Le corps en Markdown : paragraphes, **gras**, listes à puces, liens, `code`…
```

1. Créer le fichier dans `content/experiences/` ou `content/projects/`.
2. L'ajouter dans `content/manifest.json` (l'ordre du manifest = l'ordre d'affichage,
   mettre le plus récent en premier).

Champs par type :

- **Profil** (`content/profile.md`) : `name`, `title`, `tagline`, `location`, `email`,
  `github`, `linkedin`, `skills` (séparés par des virgules), `availability`, `years`.
- **Expérience** : `title` (poste), `org`, `period` (texte affiché), `date` (AAAA-MM),
  `location`, `tags`, `summary`.
- **Projet** : `title`, `period`, `date`, `tags`, `summary`,
  `status` (`actif` | `en pause` | `archivé`), `repo` (optionnel), `link` (optionnel).

`tags` et `skills` sont des listes séparées par des virgules ; tous les autres champs
sont du texte libre. Les champs optionnels absents sont ignorés proprement.

## Choisir un prototype

Quand vous avez choisi votre direction artistique, promouvez-la en page d'accueil :

```bash
cp prototypes/04-editorial/index.html index.html   # exemple avec le n°4
```

C'est tout : chaque prototype détecte automatiquement s'il tourne à la racine ou dans
`prototypes/`. Vous pouvez ensuite supprimer les dossiers des prototypes écartés.

## Mettre en ligne sur GitHub Pages

```bash
git init
git add .
git commit -m "Portfolio initial"
git branch -M main
git remote add origin git@github.com:<votre-compte>/portfolio.git
git push -u origin main
```

Puis sur GitHub : **Settings → Pages → Source : Deploy from a branch →
Branch : `main`, dossier `/ (root)`**. Le site sera en ligne quelques minutes plus
tard sur `https://<votre-compte>.github.io/portfolio/`.

Notes :

- Le fichier `.nojekyll` (déjà présent) est indispensable : sans lui, GitHub Pages
  passe le site dans Jekyll qui transforme les `.md` en `.html` et casse le chargement
  du contenu.
- Nommer le dépôt `<votre-compte>.github.io` publie le site directement à la racine
  (`https://<votre-compte>.github.io/`), sans suffixe `/portfolio/`.

## Structure

```
├── index.html            # Page d'accueil (hub des prototypes, puis votre choix)
├── content/              # ← votre contenu, en Markdown
│   ├── profile.md
│   ├── experiences/*.md
│   ├── projects/*.md
│   └── manifest.json     # liste + ordre d'affichage des fichiers
├── shared/portfolio.js   # frontmatter + rendu Markdown + chargement
├── prototypes/0X-*/      # les 5 directions artistiques
├── serve.sh              # serveur local
└── .nojekyll             # désactive Jekyll sur GitHub Pages
```
