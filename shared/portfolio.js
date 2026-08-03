/*
 * Moteur partagé par tous les prototypes :
 *  - parseFrontmatter(text)  → { meta, body }
 *  - mdToHtml(md)            → chaîne HTML
 *  - loadPortfolio(base)     → Promise<{ profile, experiences[], projects[] }>
 *    où chaque document vaut { meta, html, raw }.
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

  function fetchDoc(base, path) {
    return fetch(base + 'content/' + path).then(function (r) {
      if (!r.ok) throw new Error('Impossible de charger ' + path + ' (HTTP ' + r.status + ')');
      return r.text();
    }).then(function (text) {
      var parsed = parseFrontmatter(text);
      return { meta: parsed.meta, html: mdToHtml(parsed.body), raw: parsed.body };
    });
  }

  function loadPortfolio(base) {
    return fetch(base + 'content/manifest.json').then(function (r) {
      if (!r.ok) throw new Error('manifest.json introuvable (HTTP ' + r.status + ')');
      return r.json();
    }).then(function (manifest) {
      return Promise.all([
        fetchDoc(base, manifest.profile),
        Promise.all((manifest.experiences || []).map(function (p) { return fetchDoc(base, p); })),
        Promise.all((manifest.projects || []).map(function (p) { return fetchDoc(base, p); }))
      ]);
    }).then(function (res) {
      return { profile: res[0], experiences: res[1], projects: res[2] };
    });
  }

  var api = {
    parseFrontmatter: parseFrontmatter,
    mdToHtml: mdToHtml,
    escapeHtml: escapeHtml,
    loadPortfolio: loadPortfolio
  };

  if (typeof window !== 'undefined') window.PortfolioShared = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
