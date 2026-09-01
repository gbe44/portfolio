---
title: Gestion d'un dojo de kendo et iaido
period: 2025 - aujourd'hui
date: 2025-08
tags: Python, FastAPI, React, MySQL, Docker, RGPD, Threat Intelligence, Gestion des vulnérabilités, API REST, CI/CD, Sys Admin Linux, IA
summary: Application web de gestion des adhérents d'un dojo : saisons, inscriptions, certificats médicaux, grades et paiements, administrée par des bénévoles.
status: actif
gallery:
  - dojo/dashboard.webp | Dashboard du site
  - dojo/formulaire_inscription.webp | Formulaire d'inscription annuelle
  - dojo/inscription.webp | Tableau de gestion des inscriptions annuelles
  - dojo/profil.webp | Page de gestion de profil
---

Application web complète pour un club de **kendo et iaido** : cycle des saisons, fichier des adhérents, inscriptions annuelles avec calcul automatique des tarifs, suivi des paiements et des grades. Le tout pensé pour être administré au quotidien par des **bénévoles non techniques**.

- Backend **FastAPI** + SQLAlchemy sur MySQL, frontend **React** (Vite, Tailwind), authentification JWT avec quatre rôles (admin, bureau, enseignant, adhérent).
- Déploiement conteneurisé (Docker Compose, Nginx, HTTPS Let's Encrypt) sur un VPS, développement piloté par un backlog GitHub Projects.

Le projet est en production mais toujours en cours d'amélioration : une fonctionnalité de suivi des compétitions est à prévoir, ainsi que le MCO mensuel, un système de gestion calendaire des entraînements, et bien d'autres !
