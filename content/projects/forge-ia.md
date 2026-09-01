---
title: Forge logicielle IA
period: 2025 - aujourd'hui
date: 2025-06
tags: IA, LLM, Agents
summary: Chaîne de fabrication logicielle de bout en bout pilotée par des agents IA, de l'expression du besoin au déploiement et monitoring.
status: actif
gallery:
  - forge/accounts.webp | Administration des comptes Git et clef Claude Code
  - forge/environnement.webp | Paramétrage des environnement cible pour projet
  - forge/infrastructure_log.webp | Page de monitoring de l'infrastructure
  - forge/setup_deploy.webp | Paramètres de déploiement
  - forge/nouveau_projet.webp | Initialisation d'un projet
  - forge/kanban.webp | Visualisation Kanban
  - forge/avancement.webp | Gestion des tâches
---

Expérimentation d'une chaîne complète de production logicielle **assistée par LLM** : de l'issue au déploiement, chaque étape est prise en charge par des **agents orchestrés**, avec points de contrôle humains.

- **Pilotage** : connexion aux comptes GitHub ou GitLab et sélection du dépôt (existant ou créé par l'outil). Le travail s'organise sur un Kanban où chaque issue devient une tâche pour les agents.
- **Développement** : chaque issue est développée sur sa propre branche dans un **conteneur dédié**, puis possibilité de la livrer unitairement dans l'environnement de son choix pour la tester.
- **Livraison** : le pipeline CI/CD est généré automatiquement, y compris pour un projet préexistant grâce à un **scanner de code** (vérifications de sécurité, déploiement), et le déploiement s'enchaîne sur l'environnement configuré pour le projet.
- **Monitoring** : les conteneurs, leur état et leurs logs sont visibles dans l'application afin d'avoir un minimum d'informations. Possibilité de les couper, de redémarrer un environnement, etc.

Le projet est pour le moment en cours. Parmi les prochains développements envisagés, j'aimerais implémenter la notion de release dans les livraisons, le développement multi-dépôt, une administration plus fine du pipeline et de ses jobs, et beaucoup d'autres idées !
