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
  /* Le PDF est produit par la GitHub Action ; s'il manque (dépôt fraîchement
     cloné, génération en échec), le bouton s'efface plutôt que de mener à un 404. */
  var cvUrl = (window.SITE_BASE || './') + 'cv-' + lang + '.pdf';
  var cvName = 'CV' + (profile.name ? ' - ' + profile.name : '') + ' (' + lang.toUpperCase() + ').pdf';
  cta.push('<a class="btn" id="cta-cv" href="' + esc(cvUrl) + '" download="' + esc(cvName) + '">' +
    esc(T.ctaCv) + '</a>');
  $('hero-cta').innerHTML = cta.join('');
  fetch(cvUrl, { method: 'HEAD' })
    .then(function (r) { if (!r.ok) throw 0; })
    .catch(function () { var b = $('cta-cv'); if (b) b.remove(); });

  /* --- À propos --- */
  $('about-body').innerHTML = (data.profile && data.profile.html) || '';
  /* La fiche opérateur est désactivée dans index.html (doublon avec la
     télémétrie du héro) ; ce bloc la remplit à nouveau si l'aside est
     décommenté un jour. */
  var factsEl = $('about-facts');
  if (factsEl) {
    var facts = [];
    var fact = function (k, v, ok) {
      if (!v) return;
      facts.push('<div class="row"><span class="k">' + esc(k) + '</span><span class="v' +
        (ok ? ' ok' : '') + '">' + esc(v) + '</span></div>');
    };
    fact(T.factOperator, profile.name);
    fact(T.factRole, profile.title);
    fact(T.factBase, profile.location);
    fact(T.factYears, profile.years ? pad2(profile.years) : '');
    fact(T.factStatus, profile.availability, true);
    factsEl.innerHTML =
      '<div class="row"><span class="k" style="color:var(--amber)">' + esc(T.factsHead) + '</span><span class="v"></span></div>' + facts.join('');
  }

  /* --- Compétences --- */
  /* Groupées par catégories via `skill_groups` de profile.md
     (« Catégorie | a, b, c ») — les mêmes données que le CV ; repli sur la
     liste plate `skills:` si les groupes manquent. Cliquer allume le module
     (tag) du même nom — insensible à la casse, parenthèse finale ignorée
     (« CI/CD (GitLab CI) » cible le tag « CI/CD »). Câblage plus bas, après
     le rendu du journal et des projets. */
  var normTag = function (t) { return t.trim().toLowerCase(); };
  var skillKey = function (t) { return normTag(t.replace(/\s*\([^)]*\)\s*$/, '')); };
  var skillGroups = (profile.skill_groups || []).map(function (g) {
    var sep = g.indexOf('|');
    return {
      label: sep !== -1 ? g.slice(0, sep).trim() : '',
      items: (sep !== -1 ? g.slice(sep + 1) : g).split(',')
        .map(function (s) { return s.trim(); }).filter(Boolean)
    };
  });
  if (!skillGroups.length) skillGroups = [{ label: '', items: profile.skills || [] }];
  /* clé normalisée → libellé d'origine, pour la ligne de statut du filtre */
  var skillLabels = {};
  var skillIdx = 0;
  function skillChip(s) {
    skillLabels[skillKey(s)] = s;
    return '<li><button type="button" class="skill-btn" data-skill="' + esc(skillKey(s)) + '" aria-pressed="false">' +
      '<span class="idx" aria-hidden="true">M' + pad2(++skillIdx) + '</span>' + esc(s) + '</button></li>';
  }
  $('skills-list').innerHTML = skillGroups.map(function (g) {
    return '<div class="skill-group panel corners">' +
      (g.label ? '<p class="skill-group-label">' + esc(g.label) + '</p>' : '') +
      '<ul class="skills">' + g.items.map(skillChip).join('') + '</ul></div>';
  }).join('');

  /* --- Utilitaires de rendu partagés --- */
  function modules(tags) {
    if (!tags || !tags.length) return '';
    return '<ul class="modules"><span class="mod-label" aria-hidden="true">' + esc(T.modulesLabel) + '</span>' +
      tags.map(function (t) {
        return '<li data-tag="' + esc(normTag(t)) + '">' + esc(t) + '</li>';
      }).join('') + '</ul>';
  }

  /* --- Journal de mission (expériences) --- */
  $('log-list').innerHTML = experiences.map(function (xp) {
    var m = xp.meta || {};
    var out = '<li class="log-entry"><article class="panel">';
    out += '<div class="log-head"><h3>' + esc(m.title || T.untitledMission) + '</h3>';
    if (m.period || m.date) out += '<div class="stamp">' + esc(m.period || m.date) + '</div>';
    out += '</div>';
    if (m.org) out += '<p class="operator">' + esc(T.operatorPrefix) + esc(m.org) + '</p>';
    if (m.location) out += '<p class="loc-line">' + esc(T.positionPrefix) + esc(m.location) + '</p>';
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

  /* --- Filtre compétences → modules --- */
  /* Sélection multiple : chaque clic ajoute ou retire la compétence, les
     modules de toutes les compétences actives s'allument dans les missions /
     projets qui les portent, et la carte entière est signalée. */
  var activeSkills = {};
  var skillButtons = document.querySelectorAll('#skills-list .skill-btn');
  function applySkillFilter() {
    skillButtons.forEach(function (btn) {
      var on = !!activeSkills[btn.getAttribute('data-skill')];
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.parentElement.classList.toggle('is-active', on);
    });
    document.querySelectorAll('.modules li').forEach(function (chip) {
      chip.classList.toggle('tag-hit', !!activeSkills[chip.getAttribute('data-tag')]);
    });
    /* Les modules d'un projet replié sont invisibles → la carte porteuse est
       marquée pour que la ligne se signale quand même (voir 50-payloads.css). */
    document.querySelectorAll('.log-entry, .payload').forEach(function (card) {
      card.classList.toggle('has-tag-hit', !!card.querySelector('.modules li.tag-hit'));
    });
    /* Projet perso porteur d'une compétence sélectionnée → déployé d'office ;
       redéselectionner le replie. Seuls les projets ouverts par le filtre
       (data-auto-opened) sont repliés : un projet déplié à la main reste tel quel. */
    document.querySelectorAll('details.payload').forEach(function (d) {
      var hit = d.classList.contains('has-tag-hit');
      if (hit && !d.open) {
        d.open = true;
        d.dataset.autoOpened = '1';
      } else if (!hit && d.dataset.autoOpened) {
        d.open = false;
        delete d.dataset.autoOpened;
      }
    });
    /* Ligne de statut, toujours visible : sélection courante et nombre de
       correspondances, ou état de veille (LED éteinte, pas de bouton
       Effacer) quand rien n'est sélectionné. */
    var statusEl = $('skills-status');
    if (statusEl) {
      var keys = Object.keys(activeSkills);
      var led = statusEl.querySelector('.led');
      if (led) led.className = keys.length ? 'led led--hold led--bounce' : 'led';
      $('skills-status-clear').hidden = !keys.length;
      if (keys.length) {
        var names = keys.map(function (k) { return skillLabels[k] || k; }).join(', ');
        var nExp = document.querySelectorAll('.log-entry.has-tag-hit').length;
        var nPrj = document.querySelectorAll('.payload.has-tag-hit').length;
        var plural = function (n, word) { return n + ' ' + word + (n > 1 ? 's' : ''); };
        var parts = [];
        if (nExp) parts.push(plural(nExp, T.traceMissionWord));
        if (nPrj) parts.push(plural(nPrj, T.traceProjectWord));
        $('skills-status-txt').innerHTML = esc(T.traceActive) +
          '<span class="hl">' + esc(names) + '</span> → ' +
          (parts.length ? esc(parts.join(' · ')) : esc(T.traceNoMatch));
      } else {
        $('skills-status-txt').textContent = T.traceNone;
      }
    }
    updateTraceNav();
  }
  skillButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var k = btn.getAttribute('data-skill');
      if (activeSkills[k]) delete activeSkills[k];
      else activeSkills[k] = true;
      applySkillFilter();
    });
  });
  var clearBtn = $('skills-status-clear');
  if (clearBtn) {
    clearBtn.addEventListener('click', function () {
      activeSkills = {};
      applySkillFilter();
    });
  }

  /* --- Navigateur de trace --- */
  /* Compteur + flèches fixés près de la barre de défilement, et repères
     cliquables sur le rail : chaque repère marque la position d'une carte
     correspondante dans la hauteur de la page. */
  var traceNav = $('trace-nav');
  var traceMatches = [];
  var traceIdx = -1;
  function cardTop(el) { return el.getBoundingClientRect().top + window.pageYOffset; }
  function updateTraceNav() {
    if (!traceNav) return;
    traceMatches = Array.prototype.slice.call(
      document.querySelectorAll('.log-entry.has-tag-hit, .payload.has-tag-hit'));
    traceIdx = -1;
    document.querySelectorAll('.tag-current').forEach(function (c) { c.classList.remove('tag-current'); });
    traceNav.hidden = !traceMatches.length;
    renderTraceRail();
    renderTraceCount();
  }
  function renderTraceRail() {
    var docH = document.documentElement.scrollHeight;
    $('trace-rail').innerHTML = traceMatches.map(function (el, i) {
      var pct = (cardTop(el) / docH * 100).toFixed(2);
      return '<button type="button" class="trace-tick' + (i === traceIdx ? ' is-current' : '') +
        '" data-i="' + i + '" style="top:' + pct + '%" aria-label="' +
        esc(T.traceTickAria) + (i + 1) + '"></button>';
    }).join('');
  }
  function renderTraceCount() {
    $('trace-count').textContent =
      (traceIdx >= 0 ? pad2(traceIdx + 1) : '--') + '/' + pad2(traceMatches.length);
  }
  function goToMatch(i) {
    if (!traceMatches.length) return;
    traceIdx = ((i % traceMatches.length) + traceMatches.length) % traceMatches.length;
    var el = traceMatches[traceIdx];
    document.querySelectorAll('.tag-current').forEach(function (c) { c.classList.remove('tag-current'); });
    el.classList.add('tag-current');
    el.scrollIntoView({ block: 'start' });
    $('trace-rail').querySelectorAll('.trace-tick').forEach(function (t, j) {
      t.classList.toggle('is-current', j === traceIdx);
    });
    renderTraceCount();
  }
  /* Saut relatif au défilement : ▼ va à la première carte sous la position
     courante, ▲ à la dernière au-dessus, avec bouclage aux extrémités.
     84px ≈ scroll-margin-top des cartes (5rem) + marge, pour exclure la
     carte déjà alignée en haut de l'écran. */
  function traceJump(dir) {
    if (!traceMatches.length) return;
    var y = window.pageYOffset + 84;
    var target = -1;
    if (dir > 0) {
      for (var i = 0; i < traceMatches.length; i++) {
        if (cardTop(traceMatches[i]) > y + 6) { target = i; break; }
      }
      if (target === -1) target = 0;
    } else {
      for (var j = traceMatches.length - 1; j >= 0; j--) {
        if (cardTop(traceMatches[j]) < y - 6) { target = j; break; }
      }
      if (target === -1) target = traceMatches.length - 1;
    }
    goToMatch(target);
  }
  $('trace-prev').addEventListener('click', function () { traceJump(-1); });
  $('trace-next').addEventListener('click', function () { traceJump(1); });
  $('trace-rail').addEventListener('click', function (e) {
    var t = e.target.closest('.trace-tick');
    if (t) goToMatch(parseInt(t.getAttribute('data-i'), 10));
  });
  /* La hauteur du document bouge (redimensionnement, dépliage manuel d'un
     projet) → repositionne les repères. `toggle` ne remonte pas : capture. */
  window.addEventListener('resize', function () {
    if (!traceNav.hidden) renderTraceRail();
  });
  document.addEventListener('toggle', function () {
    if (!traceNav.hidden) renderTraceRail();
  }, true);
  /* État initial normalisé : ligne de statut en veille, navigateur masqué. */
  applySkillFilter();

  /* --- Formation / certifications --- */
  /* Chaque entrée du registre s'écrit « année | libellé » dans content/education.md. */
  var eduEntries = (data.education && data.education.meta && data.education.meta.entries) || [];
  var eduSection = document.getElementById('formation');
  if (eduSection) {
    eduSection.hidden = !eduEntries.length;
    $('edu-list').innerHTML = eduEntries.map(function (e) {
      var sep = e.indexOf('|');
      var year = sep !== -1 ? e.slice(0, sep).trim() : '';
      var label = sep !== -1 ? e.slice(sep + 1).trim() : e.trim();
      return '<li class="edu-row"><span class="edu-year">' + esc(year) + '</span>' +
        '<span class="edu-label">' + esc(label) + '</span></li>';
    }).join('');
  }

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
    $('footer-id').textContent = '© ' + new Date().getFullYear() + ' ' + profile.name;
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
  window.SITE_BASE = BASE;
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
