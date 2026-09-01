---
title: Kendo and iaido dojo management
period: 2025 - present
date: 2025-08
tags: Python, FastAPI, React, MySQL, Docker, GDPR
summary: Web application managing a dojo's members: seasons, registrations, medical certificates, grades and payments, run by volunteers.
status: active
gallery:
  - dojo/dashboard.webp | Site dashboard
  - dojo/formulaire_inscription.webp | Yearly registration form
  - dojo/inscription.webp | Yearly registrations management table
  - dojo/profil.webp | Profile management page
---

Full web application for a **kendo and iaido** club: season cycles, member records, yearly registrations with automatic fee calculation, payment and grade tracking. Designed to be run day to day by **non-technical volunteers**.

- **FastAPI** + SQLAlchemy backend on MySQL, **React** frontend (Vite, Tailwind), JWT authentication with four roles (admin, board, teacher, member).
- Containerised deployment (Docker Compose, Nginx, Let's Encrypt HTTPS) on a VPS, development driven by a GitHub Projects backlog.

The project is in production but still being improved: a competition tracking feature is planned, along with monthly maintenance, a training calendar system, and many more!
