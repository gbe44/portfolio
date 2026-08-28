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

Le responsable du VOC voulait un outil d'automatisation de scans de vulnérabilités, et ma première mission était l'automatisation de l'enregistrement de deux CSV dans une base de données pour qu'un scan TenableSC puisse les consommer.

L'objectif rapidement atteint, nous avons pris goût à faire grandir l'outil ensemble : connexion des autres sources d'inventaire, passage en SaaS avec interface, automatisation de scans récurrents/de remédiation, ajout des scanners TestSSL et nmap. Avec, en chemin, leur lot de surprises : IPv4-IPv6, qualité inégale des données selon les sources, procédures et outils tiers qui changent.

Quatre ans plus tard, j'ai eu la chance d'avoir porté seul la conception d'une solution en architecture microservices (10+ conteneurs, 3 bases de données) : un inventaire centralisé de plus de **150 000 équipements**, alimenté par 5 API tierces en collecte asynchrone et connecté à 3 scanners déclenchés par événements.

Résultat : **70 jours par an économisés** pour le responsable du VOC, autant estimé pour les autres utilisateurs, une **couverture de scan continue** sur l'ensemble du périmètre et une **réduction significative des vulnérabilités**.
