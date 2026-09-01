---
title: Lead Backend Developer
org: La Poste - Network flow management platform
period: Nov 2018 - Apr 2021
date: 2018-11
location: Econocom - Nantes
tags: Python, Flask, Angular, Docker, REST API, Agile, CI/CD, Sys Admin Linux, Secure SDLC, OWASP Top 10, MySQL
summary: Backend owner and lead of a 4-developer team; complete migration of a PHP application to a Python/Angular stack.
cv: true
cv_points:
  - Responsible for the backend, deployment and team lead (4 developers)
  - Complete migration of an existing PHP application to a Python/Angular stack
  - Agile methodology, technical mentoring, code review and support of the development team
  - ! Optimization of a file processing task, reducing execution time from 25 minutes to less than 1 second
---

Owner of the backend and deployment of a network flow management platform for La Poste, leading a **team of 4 developers**: agile methodology, technical mentoring, code reviews and day-to-day support.

The team faced a major performance problem on the application, in particular the generation of a large network configuration file used several times a day.
Another target for improvement was the maintainability of the project: the interdependence of the code made the slightest change complex and a source of incidents or regressions.

To address these issues, my team and I worked on the complete migration of the existing PHP application to a Python/Angular stack.
We started by putting in place the building blocks needed to generate the file, then I worked on its algorithm, cutting its execution time from **25 minutes to under one second**.
Then, before carrying on with the project, I set up a backend architecture as a **modular monolith with versioned contracts between modules**, allowing several versions of the same module to coexist so that consumers could evolve independently.

The project benefited from an early first production release, in order to **give the business the optimised file generation as soon as possible**. We then continued the migration step by step, **without interrupting the service**.
