/*
 * Moteur partagé par tous les prototypes :
 *  - parseFrontmatter(text)      → { meta, body }
 *  - mdToHtml(md)                → chaîne HTML
 *  - loadPortfolio(base, lang)   → Promise<{ profile, experiences[], projects[] }>
 *    où chaque document vaut { meta, html, raw }.
 *  - getLang() / setLang(l)      → langue courante ('fr' par défaut), persistée
 *    en localStorage et surchargeable par ?lang=xx dans l'URL.
 *
 * Langues : le français est la langue de base (fichiers sans suffixe).
 * Une variante se nomme <fichier>.<lang>.md (ex. profile.en.md) ; si elle
 * n'existe pas, le fichier de base est servi à la place. Le manifest ne
 * liste que les fichiers de base.
 *
 * Les clés `tags` et `skills` du frontmatter sont converties en tableaux
 * (valeurs séparées par des virgules). Tout le reste est une chaîne.
 */
(function () {
  'use strict';

  var LIST_KEYS = { tags: true, skills: true };

  function parseFrontmatter(text) {
    var meta = {};
    var body = text;
    var m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
    if (m) {
      body = text.slice(m[0].length);
      var lines = m[1].split(/\r?\n/);
      for (var i = 0; i < lines.length; i++) {
        var idx = lines[i].indexOf(':');
        if (idx === -1) continue;
        var key = lines[i].slice(0, idx).trim();
        var value = lines[i].slice(idx + 1).trim();
        if (!key) continue;
        if (LIST_KEYS[key]) {
          meta[key] = value
            ? value.split(',').map(function (s) { return s.trim(); }).filter(Boolean)
            : [];
        } else {
          meta[key] = value;
        }
      }
    }
    return { meta: meta, body: body };
  }

  function escapeHtml(s) {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* Transformations en ligne — s'applique à du texte déjà échappé. */
  function inline(s) {
    s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img src="$2" alt="$1">');
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener">$1</a>');
    s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    return s;
  }

  function mdToHtml(md) {
    var lines = md.split(/\r?\n/);
    var out = [];
    var para = [];
    var listType = null;

    function closePara() {
      if (para.length) {
        out.push('<p>' + inline(para.join(' ')) + '</p>');
        para = [];
      }
    }
    function closeList() {
      if (listType) {
        out.push('</' + listType + '>');
        listType = null;
      }
    }
    function block() { closePara(); closeList(); }

    var i = 0;
    while (i < lines.length) {
      var line = lines[i];

      if (/^```/.test(line)) {
        block();
        var buf = [];
        i++;
        while (i < lines.length && !/^```/.test(lines[i])) {
          buf.push(lines[i]);
          i++;
        }
        i++; /* saute la clôture */
        out.push('<pre><code>' + escapeHtml(buf.join('\n')) + '</code></pre>');
        continue;
      }

      var esc = escapeHtml(line);

      var h = esc.match(/^(#{1,4})\s+(.*)$/);
      if (h) {
        block();
        var level = h[1].length;
        out.push('<h' + level + '>' + inline(h[2]) + '</h' + level + '>');
        i++;
        continue;
      }

      if (/^(-{3,}|\*{3,})\s*$/.test(esc)) {
        block();
        out.push('<hr>');
        i++;
        continue;
      }

      var bq = esc.match(/^&gt;\s?(.*)$/);
      if (bq) {
        block();
        var quote = [bq[1]];
        i++;
        while (i < lines.length) {
          var next = escapeHtml(lines[i]).match(/^&gt;\s?(.*)$/);
          if (!next) break;
          quote.push(next[1]);
          i++;
        }
        out.push('<blockquote><p>' + inline(quote.join(' ')) + '</p></blockquote>');
        continue;
      }

      var ul = esc.match(/^\s*[-*]\s+(.*)$/);
      if (ul) {
        closePara();
        if (listType !== 'ul') { closeList(); out.push('<ul>'); listType = 'ul'; }
        out.push('<li>' + inline(ul[1]) + '</li>');
        i++;
        continue;
      }

      var ol = esc.match(/^\s*\d+\.\s+(.*)$/);
      if (ol) {
        closePara();
        if (listType !== 'ol') { closeList(); out.push('<ol>'); listType = 'ol'; }
        out.push('<li>' + inline(ol[1]) + '</li>');
        i++;
        continue;
      }

      if (/^\s*$/.test(esc)) {
        block();
        i++;
        continue;
      }

      closeList();
      para.push(esc.trim());
      i++;
    }
    block();
    return out.join('\n');
  }

  /* cache: 'no-cache' force la revalidation HTTP — sans quoi le navigateur
     peut resservir un .md périmé après une modification du contenu. */
  function fetchText(url) {
    return fetch(url, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error('Impossible de charger ' + url + ' (HTTP ' + r.status + ')');
      return r.text();
    });
  }

  function fetchDoc(base, path, lang) {
    var variant = (lang && lang !== 'fr') ? path.replace(/\.md$/i, '.' + lang + '.md') : path;
    var attempt = fetchText(base + 'content/' + variant);
    if (variant !== path) {
      /* variante absente → repli silencieux sur le fichier de base (fr) */
      attempt = attempt.catch(function () { return fetchText(base + 'content/' + path); });
    }
    return attempt.then(function (text) {
      var parsed = parseFrontmatter(text);
      return { meta: parsed.meta, html: mdToHtml(parsed.body), raw: parsed.body };
    });
  }

  function loadPortfolio(base, lang) {
    lang = lang || 'fr';
    return fetch(base + 'content/manifest.json', { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error('manifest.json introuvable (HTTP ' + r.status + ')');
      return r.json();
    }).then(function (manifest) {
      return Promise.all([
        fetchDoc(base, manifest.profile, lang),
        Promise.all((manifest.experiences || []).map(function (p) { return fetchDoc(base, p, lang); })),
        Promise.all((manifest.projects || []).map(function (p) { return fetchDoc(base, p, lang); }))
      ]);
    }).then(function (res) {
      return { profile: res[0], experiences: res[1], projects: res[2] };
    });
  }

  var LANG_KEY = 'portfolio-lang';

  function getLang() {
    var q = null;
    try { q = new URLSearchParams(window.location.search).get('lang'); } catch (e) {}
    if (q && /^[a-z]{2}$/.test(q)) { setLang(q); return q; }
    try { return window.localStorage.getItem(LANG_KEY) || 'fr'; } catch (e) { return 'fr'; }
  }

  function setLang(lang) {
    try { window.localStorage.setItem(LANG_KEY, lang); } catch (e) {}
  }

  /* -----------------------------------------------------------------
   * Rechargement automatique — DÉVELOPPEMENT UNIQUEMENT
   *
   * Ne s'active que si la page est servie depuis localhost (ou avec
   * ?dev=1 dans l'URL). En ligne — GitHub Pages — ce bloc ne fait
   * strictement rien : le site reste 100 % statique, aucun serveur,
   * aucune requête supplémentaire.
   *
   * Principe : une requête HEAD périodique sur la page courante, ce
   * script et chaque fichier de contenu. Dès qu'une date de
   * modification (ou une taille) change, l'onglet se recharge.
   * --------------------------------------------------------------- */

  var DEV_HOSTS = { 'localhost': 1, '127.0.0.1': 1, '::1': 1, '[::1]': 1, '0.0.0.0': 1 };
  var DEV_POLL_MS = 1000;

  function isDevHost() {
    if (DEV_HOSTS[window.location.hostname]) return true;
    return window.location.search.indexOf('dev=1') !== -1;
  }

  /* Base du site déduite de l'URL de ce script (…/shared/portfolio.js). */
  function scriptBase() {
    var el = document.currentScript;
    var src = el ? el.src : '';
    var i = src.indexOf('shared/portfolio.js');
    return i >= 0 ? src.slice(0, i) : '';
  }

  /* Empreinte d'un fichier : null = requête ratée (on ignore ce tour). */
  function fileStamp(url) {
    return fetch(url, { method: 'HEAD', cache: 'no-store' }).then(function (r) {
      if (r.status === 404) return '404';
      if (!r.ok) return null;
      return [r.headers.get('Last-Modified'), r.headers.get('Content-Length'), r.headers.get('ETag')].join('|');
    }).catch(function () { return null; });
  }

  function startDevReload(base) {
    var urls = [window.location.href, base + 'shared/portfolio.js', base + 'content/manifest.json'];

    fetch(base + 'content/manifest.json', { cache: 'no-store' }).then(function (r) {
      return r.ok ? r.json() : null;
    }).catch(function () {
      return null;
    }).then(function (manifest) {
      if (manifest) {
        [manifest.profile]
          .concat(manifest.experiences || [], manifest.projects || [])
          .forEach(function (p) {
            if (!p) return;
            urls.push(base + 'content/' + p);
            /* les variantes .en sont surveillées même absentes (404) :
               en créer une déclenche donc aussi un rechargement */
            urls.push(base + 'content/' + p.replace(/\.md$/i, '.en.md'));
          });
      }
      return Promise.all(urls.map(fileStamp));
    }).then(function (initial) {
      var watched = [];
      var known = {};
      urls.forEach(function (u, i) {
        if (initial[i] === null || known[u] !== undefined) return;
        watched.push(u);
        known[u] = initial[i];
      });
      if (!watched.length) return;
      console.info('[portfolio] rechargement auto actif — ' + watched.length + ' fichiers surveillés');

      (function tick() {
        window.setTimeout(function () {
          if (document.hidden) { tick(); return; }
          Promise.all(watched.map(fileStamp)).then(function (now) {
            for (var i = 0; i < watched.length; i++) {
              if (now[i] !== null && now[i] !== known[watched[i]]) {
                console.info('[portfolio] modification détectée → rechargement');
                window.location.reload();
                return;
              }
            }
            tick();
          });
        }, DEV_POLL_MS);
      })();
    });
  }

  if (typeof window !== 'undefined' && typeof document !== 'undefined' && isDevHost()) {
    startDevReload(scriptBase());
  }

  var api = {
    parseFrontmatter: parseFrontmatter,
    mdToHtml: mdToHtml,
    escapeHtml: escapeHtml,
    loadPortfolio: loadPortfolio,
    getLang: getLang,
    setLang: setLang
  };

  if (typeof window !== 'undefined') window.PortfolioShared = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
