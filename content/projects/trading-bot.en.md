---
title: Parangon, crypto trading bot
period: 2024 - 2025
date: 2024-05
tags: Python, FastAPI, WebSocket, React, Binance API
summary: Foundation of a trading bot on the Binance SPOT market: real-time price feed, asset ranking, portfolio valuation and a web dashboard.
status: paused
---

Foundation of a cryptocurrency trading bot on the **SPOT** market, wired to the Binance testnet to experiment risk-free.

- **FastAPI** + SQLAlchemy backend: a dedicated process consumes the Binance **WebSocket** feed, continuously ranks assets by variation and volume, and values the portfolio in USDT.
- REST API exposing the top 10, the asset list and the wallet, consumed by a **React** (Vite) dashboard.
- Project paused at the order-execution step: automated strategies were not wired in.
