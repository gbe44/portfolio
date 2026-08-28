/* Convertit des captures d'écran (PNG, JPEG, WebP) en WebP légères pour
 * content/media/, sans autre outil que le Chrome de puppeteer déjà installé
 * pour le CV : l'image est chargée dans une page vierge, réduite si elle
 * dépasse la largeur maximale, puis « photographiée » en WebP.
 *
 * Usage : node tools/make-webp.mjs [options] <image> [<image>…]
 *   --out <dossier>    destination (défaut : à côté de la source)
 *   --width <px>       largeur maximale, l'image n'est jamais agrandie (défaut : 1600)
 *   --quality <0-100>  qualité WebP (défaut : 82)
 *
 * Exemple : node tools/make-webp.mjs --out content/media/dojo ~/Images/dashboard.png
 *   → content/media/dojo/dashboard.webp, à référencer par `dojo/dashboard.webp`.
 */
import { readFile, mkdir } from 'node:fs/promises';
import { basename, dirname, extname, join, resolve } from 'node:path';
import puppeteer from 'puppeteer';

const opts = { out: null, width: 1600, quality: 82 };
const files = [];
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--out') opts.out = argv[++i];
  else if (a === '--width') opts.width = parseInt(argv[++i], 10);
  else if (a === '--quality') opts.quality = parseInt(argv[++i], 10);
  else if (a.startsWith('--')) { console.error(`✗ option inconnue : ${a}`); process.exit(2); }
  else files.push(a);
}
if (!files.length || !(opts.width > 0) || !(opts.quality >= 0 && opts.quality <= 100)) {
  console.error('Usage : node tools/make-webp.mjs [--out dossier] [--width 1600] [--quality 82] <image>…');
  process.exit(2);
}

const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif' };

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
let failed = false;

for (const file of files) {
  const src = resolve(file);
  const ext = extname(src).toLowerCase();
  const mime = MIME[ext];
  if (!mime) { console.error(`✗ ${file} : format non géré (${ext || 'sans extension'})`); failed = true; continue; }

  try {
    const data = await readFile(src);
    const page = await browser.newPage();
    await page.setContent(
      `<!doctype html><body style="margin:0;background:#fff"><img id="i" src="data:${mime};base64,${data.toString('base64')}"></body>`,
      { waitUntil: 'load' }
    );
    const natural = await page.$eval('#i', (img) => ({ w: img.naturalWidth, h: img.naturalHeight }));
    if (!natural.w) throw new Error('image illisible');
    const width = Math.min(natural.w, opts.width);
    const height = Math.round(natural.h * width / natural.w);
    await page.setViewport({ width, height, deviceScaleFactor: 1 });
    await page.$eval('#i', (img, w) => { img.style.width = w + 'px'; img.style.height = 'auto'; img.style.display = 'block'; }, width);

    const outDir = opts.out ? resolve(opts.out) : dirname(src);
    await mkdir(outDir, { recursive: true });
    const dest = join(outDir, basename(src, extname(src)) + '.webp');
    const img = await page.$('#i');
    await img.screenshot({ path: dest, type: 'webp', quality: opts.quality });
    await page.close();

    const size = (await readFile(dest)).length;
    console.log(`✓ ${dest} — ${width}×${height}, ${Math.round(size / 1024)} Ko` +
      (width < natural.w ? ` (réduit depuis ${natural.w} px)` : ''));
  } catch (e) {
    console.error(`✗ ${file} : ${e.message}`);
    failed = true;
  }
}

await browser.close();
process.exit(failed ? 1 : 0);
