/* CV — rendu à partir des mêmes fichiers Markdown que le site.
 *
 * Règles de contenu :
 *   - une expérience n'entre dans le CV que si son frontmatter porte `cv: true` ;
 *   - seuls ses `cv_points` sont repris (la prose reste sur le site) ;
 *   - les projets personnels sont réduits à leurs noms, `cv: false` en écarte un ;
 *   - l'ordre est celui de content/manifest.json, comme sur le site.
 *
 * Le script ajuste ensuite l'échelle typographique jusqu'à ce que le CV tienne
 * sur une page, puis expose son verdict sur <html> :
 *   data-cv-ready="1"  data-cv-fit="ok|overflow"  data-cv-scale="0.94"
 * C'est ce que le générateur PDF (tools/make-cv.mjs) attend avant d'imprimer.
 */
(function () {
  'use strict';

  var L = {
    fr: {
      xp: 'Expérience professionnelle',
      projects: 'Projets personnels',
      skills: 'Compétences',
      edu: 'Formation et certifications',
      docTitle: 'CV',
      fitOk: 'Tient sur une page',
      fitOverflow: 'DÉBORDE SUR UNE 2e PAGE — retirez une expérience ou raccourcissez des points',
      scale: 'échelle',
      error: 'Erreur de chargement du contenu :'
    },
    en: {
      xp: 'Professional experience',
      projects: 'Personal projects',
      skills: 'Skills',
      edu: 'Education and certifications',
      docTitle: 'Resume',
      fitOk: 'Fits on one page',
      fitOverflow: 'OVERFLOWS ONTO A 2nd PAGE — remove an experience or shorten some points',
      scale: 'scale',
      error: 'Content load error:'
    }
  };

  var MIN_SCALE = 0.85;   /* en dessous, le CV devient pénible à lire */
  var SCALE_STEP = 0.02;

  var $ = function (id) { return document.getElementById(id); };
  var esc = window.PortfolioShared.escapeHtml;

  /* Une URL affichée comme on l'écrit sur un CV : sans protocole ni slash final. */
  function pretty(url) {
    return String(url).replace(/^https?:\/\//, '').replace(/\/+$/, '');
  }

  function join(parts) {
    return parts.filter(Boolean).join('<span class="sep">·</span>');
  }

  function render(data, lang) {
    var T = L[lang] || L.fr;
    var p = (data.profile && data.profile.meta) || {};

    document.title = T.docTitle + (p.name ? ' — ' + p.name : '');
    $('cv-job').textContent = p.title || '';
    $('cv-name').textContent = p.name || '';
    $('cv-contact').innerHTML = join([
      p.email ? '<a href="mailto:' + esc(p.email) + '">' + esc(p.email) + '</a>' : '',
      p.github ? '<a href="' + esc(p.github) + '">' + esc(pretty(p.github)) + '</a>' : '',
      p.linkedin ? '<a href="' + esc(p.linkedin) + '">' + esc(pretty(p.linkedin)) + '</a>' : '',
      p.location ? esc(p.location) : ''
    ]);
    $('cv-intro').textContent = p.tagline || '';
    if (!p.tagline) $('cv-intro').hidden = true;

    /* --- Expériences retenues (`cv: true`), réduites à leurs points --- */
    var kept = (data.experiences || []).filter(function (xp) { return (xp.meta || {}).cv === true; });
    $('cv-xp-title').textContent = T.xp;
    $('cv-xp').innerHTML = kept.map(function (xp) {
      var m = xp.meta || {};
      var points = m.cv_points || [];
      var out = '<article class="xp">';
      out += '<div class="xp-head"><p class="xp-role">' + esc(m.title || '') +
        (m.org ? ' <span class="org">— ' + esc(m.org) + '</span>' : '') + '</p>' +
        (m.period ? '<span class="xp-when">' + esc(m.period) + '</span>' : '') + '</div>';
      if (m.location) out += '<p class="xp-where">' + esc(m.location) + '</p>';
      if (points.length) {
        out += '<ul>' + points.map(function (pt) {
          return '<li>' + esc(pt) + '</li>';
        }).join('') + '</ul>';
      }
      return out + '</article>';
    }).join('');
    $('block-xp').hidden = !kept.length;

    /* --- Projets personnels : les noms seuls --- */
    var projects = (data.projects || []).filter(function (pr) { return (pr.meta || {}).cv !== false; });
    $('cv-proj-title').textContent = T.projects;
    $('cv-proj').innerHTML = projects.map(function (pr) {
      return '<li>' + esc((pr.meta || {}).title || '') + '</li>';
    }).join('');
    $('block-proj').hidden = !projects.length;

    /* --- Compétences, en bas --- */
    var skills = p.skills || [];
    $('cv-skills-title').textContent = T.skills;
    $('cv-skills').innerHTML = skills.map(esc).join('<span class="sep">·</span>');
    $('block-skills').hidden = !skills.length;

    /* --- Formation / certifications : « année | libellé » dans education.md --- */
    var edu = (data.education && data.education.meta && data.education.meta.entries) || [];
    $('cv-edu-title').textContent = T.edu;
    $('cv-edu').innerHTML = edu.map(function (e) {
      var sep = e.indexOf('|');
      var year = sep !== -1 ? e.slice(0, sep).trim() : '';
      var label = sep !== -1 ? e.slice(sep + 1).trim() : e.trim();
      return '<p class="edu-row"><span class="edu-year">' + esc(year) + '</span>' + esc(label) + '</p>';
    }).join('');
    $('block-edu').hidden = !edu.length;
  }

  /* --- Ajustement à une page ------------------------------------------- */

  /* Hauteur disponible en pixels, mesurée depuis la vraie unité mm du navigateur. */
  function pageHeightPx() {
    var probe = document.createElement('div');
    probe.style.cssText = 'position:absolute;visibility:hidden;height:var(--page-h)';
    document.body.appendChild(probe);
    var h = probe.getBoundingClientRect().height;
    probe.remove();
    return h;
  }

  function fitToPage() {
    var sheet = $('sheet');
    var available = pageHeightPx();
    var scale = 1;
    sheet.style.setProperty('--cv-scale', scale);
    /* La feuille a un min-height d'une page : on mesure le contenu, pas le cadre. */
    var content = function () {
      var last = sheet.lastElementChild;
      return last ? last.getBoundingClientRect().bottom - sheet.getBoundingClientRect().top : 0;
    };
    while (content() > available && scale > MIN_SCALE + 0.001) {
      scale = Math.round((scale - SCALE_STEP) * 100) / 100;
      sheet.style.setProperty('--cv-scale', scale);
    }
    return { scale: scale, fits: content() <= available };
  }

  function announce(state, lang) {
    var T = L[lang] || L.fr;
    var bar = $('screen-bar');
    var msg = state.fits ? T.fitOk : T.fitOverflow;
    $('fit-msg').textContent = msg + ' — ' + T.scale + ' ' + Math.round(state.scale * 100) + ' %';
    bar.classList.toggle('overflow', !state.fits);
    var root = document.documentElement;
    root.setAttribute('data-cv-fit', state.fits ? 'ok' : 'overflow');
    root.setAttribute('data-cv-scale', String(state.scale));
    root.setAttribute('data-cv-ready', '1');
    $('sheet').setAttribute('aria-busy', 'false');
  }

  var lang = window.PortfolioShared.getLang();
  document.documentElement.lang = lang;

  window.PortfolioShared.loadPortfolio('../', lang).then(function (data) {
    render(data, lang);
    /* Les polices changent la hauteur du texte : mesurer avant leur chargement
       donnerait une échelle fausse. */
    var ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    return ready.then(function () {
      announce(fitToPage(), lang);
    });
  }).catch(function (e) {
    document.body.innerHTML = '<p style="font-family:monospace;padding:2rem">' +
      (L[lang] || L.fr).error + ' ' + esc(e.message) + '</p>';
    document.documentElement.setAttribute('data-cv-ready', 'error');
  });
})();
