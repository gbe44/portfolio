#!/usr/bin/env bash
# Sert le site en local. Usage : ./serve.sh [port]
cd "$(dirname "$0")"
PORT="${1:-8000}"
echo "→ Hub des prototypes : http://localhost:${PORT}"
echo "  (Ctrl+C pour arrêter)"
python3 -m http.server "${PORT}"
