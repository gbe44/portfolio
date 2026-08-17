---
title: Lead Développeur Backend
org: La Poste - Plateforme de gestion des flux réseau
period: nov. 2018 - avr. 2021
date: 2018-11
location: Econocom - Nantes
tags: Python, Angular, Docker, Agile, Sys Admin Linux, Secure SDLC, OWASP Top 10
summary: Responsable du backend et lead d'une équipe de 4 développeurs ; migration complète d'une application PHP vers une stack Python/Angular.
cv: true
cv_points:
  - Responsable du backend, du déploiement et lead d'équipe (4 développeurs)
  - Migration complète d'une application PHP existante vers une stack Python/Angular
  - Méthodologie agile, mentorat technique, revue de code et accompagnement de l'équipe de développement
  - ! Optimisation d'un traitement de fichiers, réduction du temps d'exécution de 25 minutes à moins d'1 seconde
---

Responsable du backend et du déploiement d'une plateforme de gestion des flux réseau pour La Poste, avec le lead d'une **équipe de 4 développeurs** : méthodologie agile, mentorat technique, revues de code et accompagnement au quotidien.

L'équipe rencontrait une problématique majeur de performance sur l'application, notamment la génération d'un fichier volumineux de configuration réseau, utilisé plusieurs fois par jour. 
Une autre cible d'amélioration était la maintenabilité du projet, dont l'interdépendance des éléments du code rendais la moindre évolution complexe et génératrice d'incidents ou de regression.

Pour répondre à ces problématiques, avec mon équipe nous avons travaillé la migration complète de l'application PHP existante vers une stack Python/Angular. 
Nous avons commencé par mettre en place les briques nécessaires à la génération du fichier, puis j'ai travaillé à son algorithme, dont j'ai pu réduire le temps d'execution **25 minutes à moins d'une seconde**. 
Ensuite, avant de poursuivre le développement du projet, j'ai mis en place une architecture backend en **monolithe modulaire avec versioning des contrats inter-modules**, permettant la coexistance de plusieurs verions d'un même module pour découpler l'évolution des consommateurs.

Le projet à profité d'une première livraison en production tôt dans son cycle de vie, afin de **mettre à disposition du métier le plus rapidement possible** la génération de fichier optimisé. Puis nous avons continuer la migration au fur et à mesure, **sans interruption de service**.