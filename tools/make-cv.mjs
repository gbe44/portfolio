/* Génère cv-fr.pdf et cv-en.pdf depuis la page /cv/.
 *
 * Le rendu est fait par un vrai Chrome sur la page servie en HTTP : c'est
 * exactement ce que tu vois en local, donc pas de second moteur de mise en
 * page à maintenir. La page décide elle-même de son échelle et annonce si
 * elle tient sur une page (data-cv-fit) ; ce script se contente de la lire.
 *
 * Usage : node tools/make-cv.mjs [http://127.0.0.1:8000]
 * Sortie : cv-fr.pdf, cv-en.pdf à la racine du dépôt.
 * Code de retour 1 si un CV déborde sur une seconde page.
 */
import { writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = (process.argv[2] || 'http://127.0.0.1:8000').replace(/\/+$/, '');
const LANGS = ['fr', 'en'];

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--font-render-hinting=none']
});

let overflowed = false;

for (const lang of LANGS) {
  const page = await browser.newPage();
  /* dev=0 désactive la surveillance de rechargement : sans ça la page continue
     d'émettre une requête par seconde et l'impression n'est jamais « au calme ». */
  const url = `${ORIGIN}/cv/?lang=${lang}&dev=0`;
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60_000 });

  /* La page pose data-cv-ready quand le contenu est rendu, les polices chargées
     et l'échelle ajustée. */
  await page.waitForFunction(() => document.documentElement.dataset.cvReady, { timeout: 30_000 });

  const state = await page.evaluate(() => ({
    ready: document.documentElement.dataset.cvReady,
    fit: document.documentElement.dataset.cvFit,
    scale: document.documentElement.dataset.cvScale,
    xp: document.querySelectorAll('.xp').length,
    projects: document.querySelectorAll('.names li').length
  }));

  if (state.ready === 'error') {
    console.error(`✗ ${lang} : la page CV n'a pas pu charger le contenu`);
    await browser.close();
    process.exit(1);
  }

  /* selon la version de Puppeteer, page.pdf() rend un Buffer ou un Uint8Array */
  const pdf = Buffer.from(await page.pdf({
    printBackground: true,
    preferCSSPageSize: true,   /* @page { size: A4; margin: 12mm 14mm } fait foi */
    displayHeaderFooter: false
  }));

  const out = join(ROOT, `cv-${lang}.pdf`);
  await writeFile(out, pdf);

  /* Verdict : c'est la page elle-même qui fait autorité — elle a mesuré sa
     hauteur après chargement des polices. Le comptage de pages du PDF n'est
     qu'un contrôle secondaire ; s'il ne sait pas conclure, il se tait plutôt
     que de faire échouer une génération valide. */
  const pages = countPages(pdf);
  const ok = state.fit === 'ok' && pages <= 1;
  if (!ok) overflowed = true;
  console.log(
    `${ok ? '✓' : '✗'} cv-${lang}.pdf — ${pages ? pages + ' page(s)' : 'pages non comptées'}, ` +
    `ajustement ${state.fit}, échelle ${Math.round(state.scale * 100)} %, ` +
    `${state.xp} expérience(s), ${state.projects} projet(s), ${(pdf.length / 1024).toFixed(0)} Ko`
  );
  await page.close();
}

await browser.close();

if (overflowed) {
  console.error('\n✗ Un CV dépasse une page malgré la réduction automatique (jusqu\'à −15 %).');
  console.error('  Retire une expérience (cv: false) ou raccourcis des cv_points.');
  process.exit(1);
}
console.log('\n✓ Les deux CV tiennent sur une page.');

/* Compte les objets « /Type /Page » du PDF, sans dépendance.
   Renvoie 0 si le format ne s'y prête pas (flux compressés) : l'appelant
   traite alors le résultat comme « indéterminé », pas comme une erreur. */
function countPages(buf) {
  const matches = Buffer.from(buf).toString('latin1').match(/\/Type\s*\/Page(?![s\w])/g);
  return matches ? matches.length : 0;
}
