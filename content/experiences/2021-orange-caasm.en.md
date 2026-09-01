---
title: Full Stack Developer
org: Orange - CAASM tool (Cyber Asset Attack Surface Management)
period: Apr 2021 - Aug 2025
date: 2021-04
location: Rennes (remote)
tags: Full-stack, Python, Flask, FastAPI, Celery, React, MySQL, Redis, Microservices, REST API, Event-driven, Asynchronous Processing, Tenable.sc, TestSSL, Docker, CI/CD, Artifactory, Sys Admin Linux, Secure SDLC, OWASP Top 10, GDPR, Threat Intelligence, Vulnerability Management
summary: Technical lead of a cyber attack-surface mapping tool with 150k+ assets inventoried and continuous, event-driven scan coverage.
cv: true
cv_points:
  - Technical lead of the project and its architecture
  - Close collaboration with the VOC manager for requirements gathering, tool design and demonstrations
  - Microservices architecture (10+ containers, 3 databases) with a Python backend (Flask, FastAPI, Celery) and a React frontend
  - Centralized inventory (150k+ assets) via the integration of 5 third-party APIs (Netbox and other internal inventories)
  - Asynchronous collection of various data sources and event-driven vulnerability scanners
  - Design and implementation of CI/CD pipelines with deployment of images to Artifactory
  - ! 70 days/year saved for the main user, continuous scanner orchestration across 150k+ assets and significant reduction of vulnerabilities
---

Four years as **technical lead of a Cyber Asset Attack Surface Management tool**: mapping every exposed asset, cross-referencing inventory sources and orchestrating vulnerability scanners to give the VOC a consolidated view of the attack surface.

The VOC manager wanted a vulnerability scan automation tool, and my first assignment was to automate loading two CSV files into a database so that a TenableSC scan could consume them.
With that goal quickly reached, we got a taste for **growing the tool together**: connecting the other inventory sources, moving to a SaaS model with a web interface, automating recurring and remediation scans, adding the TestSSL and nmap scanners. With their share of surprises along the way: IPv4-IPv6, uneven data quality depending on the source, changing procedures and third-party tools.

Four years later, I had the chance to have **single-handedly carried the design of a microservices solution** (10+ containers, 3 databases): a centralised inventory of over **150,000 devices**, fed by 5 third-party APIs through asynchronous collection and connected to 3 event-driven scanners.

Outcome: **70 days per year saved** for the VOC manager, about as much estimated for the other users, **continuous scan coverage** across the whole perimeter and a **significant reduction in vulnerabilities**.
