---
title: Parangon, bot de trading crypto
period: 2024 - 2025
date: 2024-05
tags: Python, FastAPI, WebSocket, React, Binance API, Crypto
summary: Socle d'un bot de trading sur le marché SPOT de Binance : flux de prix temps réel, classement des actifs, valorisation du portefeuille et tableau de bord web.
status: en pause
---

Socle d'un bot de trading de cryptomonnaies sur le marché **SPOT**, branché sur le testnet de Binance pour expérimenter sans risque.

- Backend **FastAPI** + SQLAlchemy : un processus dédié consomme le flux **WebSocket** de Binance, classe les actifs en continu selon variation et volume, et valorise le portefeuille en USDT.
