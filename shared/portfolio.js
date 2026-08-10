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

  /* Listes écrites sur une ligne, séparées par des virgules. */
  var LIST_KEYS = { tags: true, skills: true };
  /* Vrai / faux : `cv: true` fait entrer un document dans le CV PDF. */
  var BOOL_KEYS = { cv: true };

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

        /* Liste sur plusieurs lignes :
             cv_points:
               - premier point
               - second point
           La clé est suivie d'une valeur vide, puis de lignes « - … » indentées. */
        if (!value && /^\s*-\s+/.test(lines[i + 1] || '')) {
          var items = [];
          while (i + 1 < lines.length && /^\s*-\s+/.test(lines[i + 1])) {
            items.push(lines[i + 1].replace(/^\s*-\s+/, '').trim());
            i++;
          }
          meta[key] = items;
          continue;
        }

        if (LIST_KEYS[key]) {
          meta[key] = value
            ? value.split(',').map(function (s) { return s.trim(); }).filter(Boolean)
            : [];
        } else if (BOOL_KEYS[key]) {
          meta[key] = /^(true|oui|yes|1)$/i.test(value);
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
      /* Les `cv_points` et le `summary` restent dans meta : le générateur de
         CV les consomme, le site n'affiche que la prose du corps Markdown. */
      return {
        meta: parsed.meta,
        html: mdToHtml(parsed.body),
        raw: parsed.body
      };
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
        Promise.all((manifest.projects || []).map(function (p) { return fetchDoc(base, p, lang); })),
        /* facultatif : absent du manifest → null, les rendus masquent la section */
        manifest.education ? fetchDoc(base, manifest.education, lang) : Promise.resolve(null)
      ]);
    }).then(function (res) {
      /* Anti-moisson : l'adresse email n'existe en clair dans aucun fichier
         servi (email_user + email_domain dans profile.md) ; elle n'est
         réassemblée qu'ici, dans le navigateur du visiteur. */
      var pm = res[0] && res[0].meta;
      if (pm && !pm.email && pm.email_user && pm.email_domain) {
        pm.email = pm.email_user + '@' + pm.email_domain;
      }
      return { profile: res[0], experiences: res[1], projects: res[2], education: res[3] };
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
   * Principe : dev-server.py expose /__watch, un jeton qui change dès
   * qu'un fichier du dépôt bouge. On l'interroge une fois par seconde
   * — une seule requête, et seulement après l'affichage de la page,
   * pour ne jamais concurrencer le chargement du contenu.
   * --------------------------------------------------------------- */

  var DEV_HOSTS = { 'localhost': 1, '127.0.0.1': 1, '::1': 1, '[::1]': 1, '0.0.0.0': 1 };
  var DEV_POLL_MS = 1000;
  var DEV_START_DELAY_MS = 500;

  function isDevHost() {
    /* dev=0 coupe la surveillance même en local : la génération du PDF s'en
       sert pour que la page n'émette plus aucune requête une fois rendue. */
    if (window.location.search.indexOf('dev=0') !== -1) return false;
    if (DEV_HOSTS[window.location.hostname]) return true;
    return window.location.search.indexOf('dev=1') !== -1;
  }

  /* Base du site déduite de l'URL de ce script (…/shared/portfolio.js).
     À appeler pendant l'exécution synchrone : currentScript s'efface après. */
  function scriptBase() {
    var el = document.currentScript;
    var src = el ? el.src : '';
    var i = src.indexOf('shared/portfolio.js');
    return i >= 0 ? src.slice(0, i) : '';
  }

  /* null = endpoint absent ou requête ratée (on ignore ce tour). */
  function watchToken(url) {
    return fetch(url, { cache: 'no-store' }).then(function (r) {
      return r.ok ? r.text() : null;
    }).catch(function () { return null; });
  }

  function startDevReload(base) {
    var url = base + '__watch';
    watchToken(url).then(function (known) {
      if (known === null) {
        console.info('[portfolio] rechargement auto indisponible — lancez ./serve.sh');
        return;
      }
      console.info('[portfolio] rechargement auto actif');
      (function tick() {
        window.setTimeout(function () {
          if (document.hidden) { tick(); return; }
          watchToken(url).then(function (now) {
            if (now !== null && now !== known) {
              console.info('[portfolio] modification détectée → rechargement');
              window.location.reload();
              return;
            }
            tick();
          });
        }, DEV_POLL_MS);
      })();
    });
  }

  if (typeof window !== 'undefined' && typeof document !== 'undefined' && isDevHost()) {
    var devBase = scriptBase();
    var startWatching = function () {
      window.setTimeout(function () { startDevReload(devBase); }, DEV_START_DELAY_MS);
    };
    if (document.readyState === 'complete') startWatching();
    else window.addEventListener('load', startWatching);
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
