#!/usr/bin/env python3
"""Serveur de développement local — jamais utilisé en production.

C'est `python3 -m http.server` avec trois ajustements :

  * en-têtes anti-cache : le navigateur ne peut plus servir une version
    périmée d'un `.md` (le cache heuristique masquait les modifications) ;
  * un point d'entrée `/__watch` qui renvoie un jeton changeant dès qu'un
    fichier du dépôt est modifié, ajouté ou supprimé — c'est ce que
    `shared/portfolio.js` interroge (une requête par seconde) pour recharger
    l'onglet automatiquement ;
  * type MIME explicite pour `.md` et `.json`.

Comme le serveur standard, il est multi-thread et parle HTTP/1.1 (connexions
réutilisées) : les requêtes ne se mettent pas en file d'attente.

GitHub Pages n'exécute rien de tout ça : le site déployé reste 100 %
statique. Ce fichier n'existe que pour le confort d'édition en local.

Usage : python3 dev-server.py [port]   (ou simplement ./serve.sh)
"""

import os
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))
WATCH_PATH = "/__watch"
SKIP_DIRS = {"node_modules", "__pycache__"}


def watch_token():
    """Empreinte de l'arborescence : nombre de fichiers + date la plus récente.

    Change à la moindre modification, création ou suppression. Les dossiers
    cachés (.git…) et les fichiers cachés sont ignorés.
    """
    latest = 0.0
    count = 0
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS and not d.startswith(".")]
        for name in filenames:
            if name.startswith("."):
                continue
            try:
                mtime = os.stat(os.path.join(dirpath, name)).st_mtime
            except OSError:
                continue
            count += 1
            latest = max(latest, mtime)
    return "%d-%.3f" % (count, latest)


class DevHandler(SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.1"  # connexions persistantes

    extensions_map = dict(
        SimpleHTTPRequestHandler.extensions_map,
        **{
            ".md": "text/markdown; charset=utf-8",
            ".json": "application/json; charset=utf-8",
        }
    )

    def _watch(self, body=True):
        payload = watch_token().encode()
        self.send_response(200)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        if body:
            self.wfile.write(payload)

    def do_GET(self):
        if self.path.split("?")[0] == WATCH_PATH:
            return self._watch()
        return super().do_GET()

    def do_HEAD(self):
        if self.path.split("?")[0] == WATCH_PATH:
            return self._watch(body=False)
        return super().do_HEAD()

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, fmt, *args):
        """Silencieux pour les sondes du rechargement auto."""
        if self.path.split("?")[0] == WATCH_PATH:
            return
        super().log_message(fmt, *args)


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    os.chdir(ROOT)
    server = ThreadingHTTPServer(("", port), DevHandler)
    server.daemon_threads = True
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n→ Serveur arrêté.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
