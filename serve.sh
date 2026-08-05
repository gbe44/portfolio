#!/usr/bin/env bash
# Sert le site en local. Usage : ./serve.sh [port]
cd "$(dirname "$0")"
PORT="${1:-8000}"
echo "→ Hub des prototypes : http://localhost:${PORT}"
echo "  Rechargement auto : modifiez un .md ou un index.html, l'onglet se rafraîchit seul."
echo "  (Ctrl+C pour arrêter)"
exec python3 dev-server.py "${PORT}"
