#!/usr/bin/env bash
# Génère cv-fr.pdf et cv-en.pdf en local — mêmes étapes que l'Action GitHub.
# Les PDF et node_modules sont gitignorés : en ligne, c'est le workflow
# .github/workflows/pages.yml qui produit et publie les PDF.
#
# Usage : tools/make-cv-local.sh [port]   (port par défaut : 8123)
set -euo pipefail
cd "$(dirname "$0")/.."

PORT="${1:-8123}"

command -v node >/dev/null || { echo "✗ node est requis" >&2; exit 1; }
command -v python3 >/dev/null || { echo "✗ python3 est requis" >&2; exit 1; }

# Puppeteer local, installé au premier lancement seulement.
if [ ! -d node_modules/puppeteer ]; then
  echo "▸ Installation de puppeteer (premier lancement uniquement)…"
  npm install --no-save puppeteer@23
fi

python3 dev-server.py "$PORT" >/dev/null 2>&1 &
SERVER=$!
trap 'kill $SERVER 2>/dev/null || true' EXIT
for i in $(seq 1 30); do
  curl -sf "http://127.0.0.1:$PORT/content/manifest.json" >/dev/null && break
  [ "$i" = 30 ] && { echo "✗ le serveur local n'a pas démarré (port $PORT occupé ?)" >&2; exit 1; }
  sleep 1
done

node tools/make-cv.mjs "http://127.0.0.1:$PORT" || {
  status=$?
  cat >&2 <<'EOF'

Si Chrome n'a pas pu démarrer (« error while loading shared libraries »),
installe ses dépendances système (WSL / Ubuntu) puis relance :
  sudo apt-get install -y libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 \
    libcups2 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 \
    libxrandr2 libgbm1 libasound2 libpango-1.0-0 libcairo2
EOF
  exit "$status"
}
