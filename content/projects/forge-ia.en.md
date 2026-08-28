---
title: AI software forge
period: 2025 - present
date: 2025-06
tags: AI, LLM, Agents
summary: End-to-end software production line driven by AI agents, from requirements to deployment.
status: active
---

Experimenting with a complete **LLM-assisted** software production chain: from issue to deployment, every step is handled by **orchestrated agents**, with human checkpoints.

- **Steering**: connect a GitHub or GitLab account and pick the repository (existing or created by the tool). Work is organised on a Kanban board where each issue becomes a task for the agents.
- **Development**: each issue is developed on its own branch in a **dedicated container**, and can then be delivered on its own to the environment of your choice to be tested.
- **Delivery**: the CI/CD pipeline is generated automatically, including for pre-existing projects thanks to a **code scanner** (security checks, deployment), and deployment follows on the environment configured for the project.
- **Monitoring**: containers, their state and their logs are visible in the application to keep a minimum of insight. They can be stopped, an environment restarted, and so on.

The project is still in progress. Among the next developments I have in mind: the notion of releases in deliveries, multi-repository development, finer administration of the pipeline and its jobs, and many other ideas!
