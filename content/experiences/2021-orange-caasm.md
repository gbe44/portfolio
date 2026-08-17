---
title: Développeur Full Stack
org: Orange - Outil CAASM (Cyber Asset Attack Surface Management)
period: avr. 2021 - août 2025
date: 2021-04
location: Rennes (remote)
tags: Python, Flask, FastAPI, Celery, React, Docker, GitLab CI, Sys Admin Linux, Secure SDLC, OWASP Top 10
summary: Référent technique d'un outil de cartographie de la surface d'attaque cyber : plus de 150 000 actifs inventoriés et une couverture de scan continue, orchestrée par événements.
cv: true
cv_points:
  - Référent technique du projet et de son architecture
  - Collaboration étroite avec le responsable VOC pour le recueil des besoins, la conception de l'outil et les démonstrations
  - Architecture microservices (10+ conteneurs, 3 bases de données) avec un backend Python (Flask, FastAPI, Celery) et un frontend React
  - Inventaire centralisé (150k+ actifs) via l'intégration de 5 API tierces (Netbox et autres inventaires internes)
  - Collecte asynchrone de différentes sources de données et de scanners de vulnérabilités event-driven
  - Conception et mise en œuvre de pipelines CI/CD avec déploiement des images vers Artifactory
  - ! 70 jours/an économisés pour l'utilisateur principal, orchestration continue des scanners sur 150 000+ actifs et réduction significative des vulnérabilités
---

Quatre ans comme référent technique d'un outil de Cyber Asset Attack Surface Management : cartographier l'ensemble des actifs exposés, croiser les sources d'inventaire et orchestrer les scanners de vulnérabilités pour donner au VOC une vision consolidée de la surface d'attaque.

Le responsable du VOC avais besoin d'un outil pour automatiser des scans de sécurité. A mon arrivé sur le projet, la mission initial était d'automatiser l'enregistrement de deux CSVs dans une base de donnée qu'un script de scan TenableSC pourrait consommer.
L'objectif étant rapidement atteint, nous avons commencé a réfléchir à l'amélioration de la fonctionnalité initial : Lancer des scans de sécurité sur un emsemble d'équipement du parc.

Nous avons commencé par identifier les autres sources d'équipement pour les connecter au projet et en faire l'inventaire. Puis le passage du projet en SaaS avec un interface permettant de selectionner les équipement pour lancer un scan, la mise en place de scans réccurent (hebdomadaire, mensuels...), l'interpretation du retour de TenableSC afin de re-créer des sans automatique de remédiation, l'ajout de scanner TestSSL et nmap, les problématiques IPv4-IPv6, les problématiques de qualité des données des inventaires en fonction des sources, les changements interne des procédures et outils tiers...

Finallement, en partant d'un petit script de parsing de CSV pour un lancement de scan ponctuel, j'ai eu la chance d'avoir eu la responsabilité complète de la conception d'une solution en architecture microservices (10+ conteneurs, 3 bases de données), pour créer un inventaire centralisé avec collecte asynchrone de plus de **150 000 équipements**, alimenté par 5 API tierces, et connecté à 3 scanners déclenchés par événements.

Résultat : **70 jours par an économisés** pour le responsable du VOC, une estimation similaire pour les autres utilisateurs de la solution, une **couverture de scan continue** sur l'ensemble du périmètre et une **réduction significative des vulnérabilités**.
