/* Rendu du prototype « Mission Control ».
   applyI18n(lang) traduit le chrome statique, initSite(data, lang) injecte
   le contenu Markdown chargé par shared/portfolio.js.
   Dépend de js/i18n.js (global `L`), chargé juste avant. */

/* ==================== SÉQUENCE DE BOOT ==================== */
(function () {
  var boot = document.getElementById('boot');
  if (!boot) return;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) { boot.remove(); return; }
  var gone = false;
  function kill() {
    if (gone) return;
    gone = true;
    boot.classList.add('boot--out');
    setTimeout(function () { boot.remove(); }, 260);
  }
  boot.addEventListener('click', kill);
  setTimeout(kill, 1800);
})();


/* Traduit le chrome statique de la page (boot, nav, titres, contact…). */
function applyI18n(lang) {
  var T = L[lang] || L.fr;
  document.title = T.docTitle;
  var desc = document.querySelector('meta[name="description"]');
  if (desc) desc.setAttribute('content', T.docDesc);
  document.querySelectorAll('[data-i18n]').forEach(function (el) {
    var key = el.getAttribute('data-i18n');
    if (T[key] !== undefined) el.textContent = T[key];
  });
  document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
    var key = el.getAttribute('data-i18n-html');
    if (T[key] !== undefined) el.innerHTML = T[key];
  });
  document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
    var key = el.getAttribute('data-i18n-aria');
    if (T[key] !== undefined) el.setAttribute('aria-label', T[key]);
  });
}

/* ==================== RENDU DU SITE ==================== */
function initSite(data, lang) {
  var T = L[lang] || L.fr;
  var esc = window.PortfolioShared.escapeHtml;
  var $ = function (id) { return document.getElementById(id); };
  var pad2 = function (n) { return String(n).padStart(2, '0'); };
  var profile = (data.profile && data.profile.meta) || {};
  var experiences = data.experiences || [];
  var projects = data.projects || [];

  /* --- Métadonnées du document --- */
  if (profile.name) {
    document.title = profile.name + (profile.title ? ' — ' + profile.title : '') + ' · Mission Control';
  }
  var descTag = document.querySelector('meta[name="description"]');
  if (descTag && profile.tagline) {
    descTag.setAttribute('content', profile.tagline + (profile.name ? T.portfolioOf + profile.name + '.' : ''));
  }

  /* --- Hero --- */
  if (profile.title) $('hero-callsign').textContent = T.callsignPrefix + profile.title;
  $('hero-name').textContent = profile.name || T.unknownOperator;
  if (profile.tagline) $('hero-tagline').textContent = profile.tagline;

  var tiles = [
    { label: T.tileMissions, value: pad2(experiences.length) },
    { label: T.tilePayloads, value: pad2(projects.length) }
  ];
  if (profile.years) tiles.push({ label: T.tileYears, value: pad2(profile.years) });
  if (profile.location) tiles.push({ label: T.tileBase, value: profile.location, small: true });
  var teleHtml = tiles.map(function (t) {
    var cls = t.small ? 'tele-value" style="font-size:0.95rem;padding-top:0.3rem' : 'tele-value';
    return '<div class="tele"><span class="tele-label">' + esc(t.label) + '</span>' +
      '<span class="' + cls + '">' + esc(String(t.value)) + '</span></div>';
  });
  if (profile.availability) {
    teleHtml.push(
      '<div class="tele"><span class="tele-label">' + esc(T.tileStatus) + '</span>' +
      '<span class="tele-live"><span class="led led--ok led--blink" aria-hidden="true"></span>' +
      '<span class="txt">' + esc(profile.availability) + '</span></span></div>'
    );
  }
  $('hero-telemetry').innerHTML = teleHtml.join('');

  var cta = [];
  if (profile.email) {
    cta.push('<a class="btn btn--solid" href="mailto:' + esc(profile.email) + '">' + esc(T.ctaContact) + '</a>');
  }
  cta.push('<a class="btn" href="#journal">' + esc(T.ctaLog) + '</a>');
  $('hero-cta').innerHTML = cta.join('');

  /* --- À propos --- */
  $('about-body').innerHTML = (data.profile && data.profile.html) || '';
  var facts = [];
  function fact(k, v, ok) {
    if (!v) return;
    facts.push('<div class="row"><span class="k">' + esc(k) + '</span><span class="v' +
      (ok ? ' ok' : '') + '">' + esc(v) + '</span></div>');
  }
  fact(T.factOperator, profile.name);
  fact(T.factRole, profile.title);
  fact(T.factBase, profile.location);
  fact(T.factYears, profile.years ? pad2(profile.years) : '');
  fact(T.factStatus, profile.availability, true);
  $('about-facts').innerHTML =
    '<div class="row"><span class="k" style="color:var(--amber)">' + esc(T.factsHead) + '</span><span class="v"></span></div>' + facts.join('');

  /* --- Compétences --- */
  var skills = profile.skills || [];
  $('skills-list').innerHTML = skills.map(function (s, i) {
    return '<li><span class="idx" aria-hidden="true">M' + pad2(i + 1) + '</span>' + esc(s) + '</li>';
  }).join('');

  /* --- Utilitaires de rendu partagés --- */
  function modules(tags) {
    if (!tags || !tags.length) return '';
    return '<ul class="modules"><span class="mod-label" aria-hidden="true">' + esc(T.modulesLabel) + '</span>' +
      tags.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>';
  }

  /* --- Journal de mission (expériences) --- */
  $('log-list').innerHTML = experiences.map(function (xp) {
    var m = xp.meta || {};
    var out = '<li class="log-entry"><article class="panel">';
    if (m.period || m.date) out += '<div class="stamp">' + esc(m.period || m.date) + '</div>';
    out += '<h3>' + esc(m.title || T.untitledMission) + '</h3>';
    if (m.org) out += '<p class="operator">' + esc(T.operatorPrefix) + esc(m.org) + '</p>';
    if (m.location) out += '<p class="loc-line">' + esc(T.positionPrefix) + esc(m.location) + '</p>';
    if (m.summary) out += '<p class="lead">' + esc(m.summary) + '</p>';
    if (xp.html) out += '<div class="doc">' + xp.html + '</div>';
    out += modules(m.tags);
    out += '</article></li>';
    return out;
  }).join('');

  /* --- Charges utiles (projets) --- */
  /* meta.status peut être en FR ou EN ('actif'/'active', 'en pause'/'paused',
     'archivé'/'archived') → détection par sous-chaîne, texte affiché tel quel. */
  function statusInfo(status) {
    var k = (status || '').toLowerCase();
    if (k.indexOf('acti') !== -1) return { cls: 'led--ok led--pulse', label: status };
    if (k.indexOf('pause') !== -1) return { cls: 'led--hold', label: status };
    if (k.indexOf('archiv') !== -1) return { cls: 'led--off', label: status };
    return { cls: 'led--off', label: status || T.statusUnknown };
  }
  /* Une ligne par projet : l'essentiel visible, le détail derrière « Déployer ». */
  $('payloads-list').hidden = !projects.length;
  $('payloads-list').innerHTML = projects.map(function (pr, i) {
    var m = pr.meta || {};
    var st = statusInfo(m.status);

    /* Contenu du détail : résumé, corps Markdown, modules, liens. */
    var body = '';
    if (m.summary) body += '<p class="lead">' + esc(m.summary) + '</p>';
    if (pr.html) body += '<div class="doc">' + pr.html + '</div>';
    body += modules(m.tags);
    var links = [];
    if (m.repo) links.push('<a class="btn" href="' + esc(m.repo) + '" target="_blank" rel="noopener">' + esc(T.repoLink) + '</a>');
    if (m.link) links.push('<a class="btn" href="' + esc(m.link) + '" target="_blank" rel="noopener">' + esc(T.directLink) + '</a>');
    if (links.length) body += '<div class="payload-links">' + links.join('') + '</div>';

    var row =
      '<span class="led ' + st.cls + '" aria-hidden="true"></span>' +
      '<span class="pl-id">' + esc(T.payloadRef) + pad2(i + 1) + '</span>' +
      '<span class="pl-title">' + esc(m.title || T.unnamedPayload) + '</span>' +
      (m.summary ? '<span class="pl-sum">' + esc(m.summary) + '</span>' : '') +
      '<span class="pl-right">' +
        '<span class="pl-status">' + esc(st.label) + '</span>' +
        (m.period || m.date ? '<span class="pl-period">' + esc(m.period || m.date) + '</span>' : '') +
        (body ? '<span class="deploy">' +
          '<span class="chev" aria-hidden="true">▸</span>' +
          '<span class="on-closed">' + esc(T.deployLabel) + '</span>' +
          '<span class="on-open">' + esc(T.stowLabel) + '</span>' +
        '</span>' : '') +
      '</span>';

    /* Rien à déplier (projet sans corps ni tags) → simple ligne, pas de bouton. */
    if (!body) return '<div class="payload"><div class="pl-row">' + row + '</div></div>';
    return '<details class="payload"><summary>' + row + '</summary>' +
      '<div class="payload-body">' + body + '</div></details>';
  }).join('');

  /* --- Contact --- */
  var actions = [];
  if (profile.email) {
    actions.push('<a class="btn btn--solid" href="mailto:' + esc(profile.email) + '">' + esc(profile.email) + '</a>');
  }
  if (profile.github) {
    actions.push('<a class="btn" href="' + esc(profile.github) + '" target="_blank" rel="noopener">GitHub ↗</a>');
  }
  if (profile.linkedin) {
    actions.push('<a class="btn" href="' + esc(profile.linkedin) + '" target="_blank" rel="noopener">LinkedIn ↗</a>');
  }
  $('contact-actions').innerHTML = actions.join('');
  if (profile.availability) {
    $('contact-avail-txt').textContent = profile.availability;
    $('contact-avail').hidden = false;
  }

  /* --- Pied de page --- */
  if (profile.name) {
    $('footer-id').textContent = '© ' + new Date().getFullYear() + ' ' + profile.name + ' — ' + T.footerId;
  }
}

/* ==================== AMORÇAGE ==================== */
(async () => {
  let BASE = null;
  for (const b of ['./', '../../']) {
    try { const r = await fetch(b + 'content/manifest.json'); if (r.ok) { BASE = b; break; } } catch (e) {}
  }
  if (!BASE) {
    document.body.innerHTML = '<p style="font-family:monospace;padding:2rem">Contenu introuvable — lancez ./serve.sh depuis la racine du dépôt (voir README).<br>Content not found — run ./serve.sh from the repository root (see README).</p>';
    return;
  }
  const s = document.createElement('script');
  s.src = BASE + 'shared/portfolio.js';
  s.onload = async () => {
    const lang = window.PortfolioShared.getLang();
    document.documentElement.lang = lang;
    applyI18n(lang);
    document.querySelectorAll('.lang-btn').forEach((btn) => {
      const l = btn.getAttribute('data-lang');
      btn.setAttribute('aria-pressed', l === lang ? 'true' : 'false');
      btn.addEventListener('click', () => {
        if (l === lang) return;
        window.PortfolioShared.setLang(l);
        location.reload();
      });
    });
    try {
      const data = await window.PortfolioShared.loadPortfolio(BASE, lang);
      initSite(data, lang);
    } catch (e) {
      document.body.innerHTML = '<p style="font-family:monospace;padding:2rem">' + (L[lang] || L.fr).loadError + ' ' + e.message + '</p>';
    }
  };
  document.head.appendChild(s);
})();
