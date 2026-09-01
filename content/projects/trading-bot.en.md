---
title: Parangon, crypto trading bot
period: 2024 - 2025
date: 2024-05
tags: Python, FastAPI, WebSocket, React, Binance API, Crypto
summary: Foundation of a trading bot on the Binance SPOT market: real-time price feed, asset ranking, portfolio valuation and a web dashboard.
status: paused
---

Foundation of a cryptocurrency trading bot on the **SPOT** market, wired to the Binance testnet to experiment risk-free.

- **FastAPI** + SQLAlchemy backend: a dedicated process consumes the Binance **WebSocket** feed, continuously ranks assets by variation and volume, and values the portfolio in USDT.
