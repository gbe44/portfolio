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

Puis ouvrir <http://localhost:8000> : la page d'accueil liste les 6 prototypes.

| Dossier | Style |
|---|---|
| `prototypes/01-mission-control/` | NASA-punk / cassette futurism — console spatiale, ambre + vert phosphore **(direction retenue)** |
| `prototypes/02-terminal/` | Session shell plein écran, prompt interactif |
| `prototypes/03-neobrutalisme/` | Bordures épaisses, ombres dures, couleurs franches |
| `prototypes/04-editorial/` | Typographie Swiss, sections numérotées, bleu Klein |
| `prototypes/05-bento/` | Grille bento dark mode, cartes verre, vibe dashboard SaaS |
| `prototypes/06-bento-nasa/` | Hybride : la grille bento du 05 + ADN NASA-punk (ambre, micro-labels console, LEDs, télémétrie) |

### Rechargement automatique

`serve.sh` lance `dev-server.py` : un `http.server` standard (multi-thread, HTTP/1.1)
avec des en-têtes anti-cache et un point d'entrée `/__watch` qui renvoie une empreinte
de l'arborescence. Tant que la page est ouverte depuis `localhost`, elle interroge
`/__watch` une fois par seconde — une seule requête, démarrée après l'affichage pour
ne pas ralentir le chargement — et se recharge dès qu'un fichier du dépôt est modifié,
créé ou supprimé. Il n'y a donc **rien à relancer** — ni le serveur, ni le navigateur —
quand vous éditez un `.md`, un CSS ou un `index.html`.

Ce mécanisme est **strictement local** : le code ne s'active que sur
`localhost`/`127.0.0.1` (ou avec `?dev=1` dans l'URL, utile si vous testez depuis
un téléphone sur le réseau local). En ligne sur GitHub Pages il ne fait rien du
tout — aucune requête, aucun serveur : le site reste 100 % statique. `dev-server.py`
n'est jamais exécuté par GitHub Pages, c'est juste un fichier de plus dans le dépôt.

Avec un `python3 -m http.server` lancé à la main, `/__watch` n'existe pas : la page
le signale dans la console et fonctionne normalement, simplement sans rechargement
automatique.

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
  `location`, `tags`, `summary`, `cv` et `cv_points` (voir ci-dessous).
- **Projet** : `title`, `period`, `date`, `tags`, `summary`,
  `status` (`actif` | `en pause` | `archivé`), `repo` (optionnel), `link` (optionnel).

`tags` et `skills` sont des listes séparées par des virgules ; tous les autres champs
sont du texte libre. Les champs optionnels absents sont ignorés proprement.

## Le CV PDF

Le CV n'est pas un document séparé : il est **fabriqué à partir des mêmes `.md`**.
La page `cv/` en est le gabarit, et une GitHub Action l'imprime en PDF à chaque push,
en français et en anglais (`cv-fr.pdf`, `cv-en.pdf` à la racine du site). Le bouton
« Télécharger le CV » du portfolio sert celui de la langue affichée.

Deux champs de frontmatter pilotent ce qui y entre :

```markdown
---
title: Développeur Senior
org: Bessé
period: Aout 2025 — Maintenant
cv: true                        # ← sans ce champ, l'expérience reste sur le site
cv_points:                      #    mais n'apparaît pas dans le CV
  - Premier fait marquant, chiffré si possible.
  - Deuxième fait marquant.
---

Le paragraphe de prose reste ici : il s'affiche sur le site, pas dans le CV.
```

- **`cv: true`** sur une expérience la fait entrer dans le CV. Une expérience sans
  ce champ n'y figure pas — c'est volontaire, pour que vous choisissiez.
- **`cv_points`** est la liste de puces de l'expérience. Elle s'affiche sur le site
  exactement comme avant (elle était dans le corps Markdown), mais le générateur de
  CV sait la trouver. **Seuls ces points** vont dans le PDF, pas la prose.
- Les **projets personnels** n'apparaissent dans le CV que par leur nom, en une
  ligne. `cv: false` sur un projet l'en écarte.
- L'ordre est celui de `manifest.json`, comme sur le site.

### Voir le CV et le régénérer

En local, `http://localhost:8000/cv/` affiche le gabarit à la taille exacte d'une
page A4, avec un bandeau qui indique s'il tient sur une page (`?lang=en` pour
l'anglais). S'il déborde, la page réduit automatiquement la typographie jusqu'à
−15 % ; au-delà, elle passe le bandeau en rouge — il faut alors retirer une
expérience ou raccourcir des points.

La génération du PDF elle-même tourne dans la GitHub Action. Pour la lancer à la
main il faut Chrome et Puppeteer :

```bash
npm install --no-save puppeteer     # une fois
./serve.sh &                        # le rendu se fait sur le site servi
node tools/make-cv.mjs http://127.0.0.1:8000
```

Le script échoue si un CV dépasse une page — c'est le garde-fou qui vous évite de
publier un CV de deux pages sans le voir.

### Compatibilité avec les logiciels de tri (ATS)

Le gabarit est fait pour être lu par les robots des recruteurs : une seule colonne,
aucun tableau, aucun texte dans une image, du texte réel sélectionnable, des titres
de section standards (« Expérience professionnelle », « Compétences ») et les
coordonnées en clair. C'est aussi la raison de sa sobriété.

## Bilingue français / anglais

Le français est la langue de base ; l'anglais est optionnel, fichier par fichier :

- La traduction d'un fichier est le même nom avec le suffixe `.en` :
  `experiences/2025-neobanque.md` → `experiences/2025-neobanque.en.md`.
- `manifest.json` ne liste **que les fichiers français** — les variantes `.en.md`
  sont trouvées automatiquement.
- Si une traduction manque, le site affiche la version française à la place :
  vous pouvez traduire au fil de l'eau sans rien casser.
- Le visiteur change de langue via le commutateur FR/EN de chaque prototype ;
  son choix est mémorisé (localStorage) et une URL avec `?lang=en` force l'anglais
  (pratique pour partager le site à un contact anglophone).
- Dans les fichiers anglais, utilisez les statuts `active` / `paused` / `archived`
  (équivalents de `actif` / `en pause` / `archivé`) — les deux sont reconnus.

## Anatomie du prototype 01 (celui retenu)

Les prototypes 02 à 06 sont des fichiers uniques auto-portants. Le 01, sur lequel le
travail continue, est découpé en briques — une par section du site, style et rendu
séparés. Toujours zéro build : ce sont des `<link>` et des `<script src>`.

```
prototypes/01-mission-control/
├── index.html          structure HTML seule (~130 lignes)
├── css/
│   ├── 00-base.css     variables, typographie, primitives (.panel, .btn, .led, .doc)
│   ├── 10-topbar.css   barre supérieure + commutateur de langue
│   ├── 20-hero.css     écran principal + télémétrie
│   ├── 30-about.css    à propos + compétences
│   ├── 40-log.css      journal de mission (expériences)
│   ├── 50-payloads.css projets — le manifeste de soute
│   ├── 60-contact.css  contact + pied de page
│   ├── 70-boot.css     séquence de démarrage
│   └── 99-motion.css   « mouvement réduit » — doit rester chargée en dernier
└── js/
    ├── i18n.js         libellés d'interface FR / EN
    └── render.js       applyI18n() + initSite() + amorçage
```

Le préfixe numérique des CSS **fait la cascade** : les `<link>` sont dans cet ordre
dans `index.html`, et `99-motion.css` doit rester le dernier pour que ses `!important`
priment. Chaque brique embarque ses propres media queries.

## Choisir un prototype

Quand vous avez choisi votre direction artistique, promouvez-la en page d'accueil :

```bash
cp prototypes/04-editorial/index.html index.html          # prototype en un seul fichier
cp -r prototypes/01-mission-control/{index.html,css,js} . # le 01, avec ses briques
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

Puis sur GitHub : **Settings → Pages → Source : `GitHub Actions`**. Le workflow
`.github/workflows/pages.yml` régénère les CV puis publie le site à chaque push ;
il sera en ligne quelques minutes plus tard sur
`https://<votre-compte>.github.io/portfolio/`.

> Le mode « Deploy from a branch » fonctionne aussi, mais alors les PDF ne sont
> jamais générés : c'est l'Action qui les fabrique.

Si la génération du CV échoue (CV trop long), le job `cv` apparaît en rouge mais
**le site est publié quand même** — seuls les PDF ne sont pas rafraîchis.

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
├── cv/                   # gabarit du CV PDF (même contenu, mise en page sobre)
├── tools/make-cv.mjs     # imprime cv/ en cv-fr.pdf et cv-en.pdf (Chrome headless)
├── .github/workflows/    # génère les CV puis publie le site
├── shared/portfolio.js   # frontmatter + rendu Markdown + chargement + reload dev
├── prototypes/0X-*/      # les 6 directions artistiques (le 01 est découpé en css/ + js/)
├── serve.sh              # serveur local
├── dev-server.py         # http.server sans cache (développement seulement)
└── .nojekyll             # désactive Jekyll sur GitHub Pages
```
