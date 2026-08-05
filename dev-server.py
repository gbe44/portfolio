#!/usr/bin/env python3
"""Serveur de développement local — jamais utilisé en production.

C'est `python3 -m http.server` avec deux ajustements :

  * en-têtes anti-cache : le navigateur ne peut plus servir une version
    périmée d'un `.md` (le cache heuristique masquait les modifications) ;
  * type MIME explicite pour `.md` et `.json`.

GitHub Pages n'exécute rien de tout ça : le site déployé reste 100 %
statique. Ce fichier n'existe que pour le confort d'édition en local.

Usage : python3 dev-server.py [port]   (ou simplement ./serve.sh)
"""

import os
import sys
from http.server import HTTPServer, SimpleHTTPRequestHandler


class NoCacheHandler(SimpleHTTPRequestHandler):
    extensions_map = dict(
        SimpleHTTPRequestHandler.extensions_map,
        **{
            ".md": "text/markdown; charset=utf-8",
            ".json": "application/json; charset=utf-8",
        }
    )

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, fmt, *args):
        """Silencieux pour les sondes du rechargement auto (HEAD)."""
        if self.command == "HEAD":
            return
        super().log_message(fmt, *args)


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    server = HTTPServer(("", port), NoCacheHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n→ Serveur arrêté.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
