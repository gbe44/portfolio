/* Normalise content/media/ : toute image qui n'est pas en WebP (PNG, JPEG,
 * GIF) est convertie sur place par tools/make-webp.mjs, l'original est
 * supprimé et les références dans content/**\/*.md sont réécrites
 * (`dojo/capture.png` → `dojo/capture.webp`).
 *
 * Pensé pour le workflow GitHub Pages (qui commite le résultat), mais
 * utilisable en local : `npm run media`.
 *
 * Usage : node tools/convert-media.mjs [--check]
 *   --check   ne modifie rien, sort en code 1 s'il y a des images à convertir
 * Sortie : « media_changed=true|false » sur la dernière ligne, pour le workflow.
 */
import { readdir, readFile, writeFile, unlink } from 'node:fs/promises';
import { dirname, extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MEDIA = join(ROOT, 'content', 'media');
const CONTENT = join(ROOT, 'content');
const CONVERTIBLE = new Set(['.png', '.jpg', '.jpeg', '.gif']);
const check = process.argv.includes('--check');

async function walk(dir, out = []) {
  let entries;
  try { entries = await readdir(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) await walk(p, out);
    else out.push(p);
  }
  return out;
}

const toConvert = (await walk(MEDIA)).filter((f) => CONVERTIBLE.has(extname(f).toLowerCase()));

if (!toConvert.length) {
  console.log('✓ content/media/ : rien à convertir');
  console.log('media_changed=false');
  process.exit(0);
}

console.log(`▸ ${toConvert.length} image(s) à convertir en WebP :`);
toConvert.forEach((f) => console.log('  ' + relative(ROOT, f)));
if (check) {
  console.log('media_changed=true');
  process.exit(1);
}

/* Conversion sur place (make-webp écrit à côté de la source par défaut). */
const res = spawnSync(process.execPath, [join(ROOT, 'tools', 'make-webp.mjs'), ...toConvert], { stdio: 'inherit' });
if (res.status !== 0) {
  console.error('✗ la conversion a échoué, rien n\'est supprimé ni réécrit');
  process.exit(res.status || 1);
}

/* Références dans les .md : chemin relatif à content/media/, toujours avec des
   « / » même sous Windows. On ne remplace que le chemin exact de chaque
   fichier converti, l'extension passe en .webp. */
const rewrites = toConvert.map((f) => {
  const rel = relative(MEDIA, f).split(sep).join('/');
  return { from: rel, to: rel.slice(0, -extname(rel).length) + '.webp' };
});
const mdFiles = (await walk(CONTENT)).filter((f) => extname(f).toLowerCase() === '.md');
let mdChanged = 0;
for (const md of mdFiles) {
  const before = await readFile(md, 'utf8');
  let after = before;
  for (const { from, to } of rewrites) after = after.split(from).join(to);
  if (after !== before) {
    await writeFile(md, after);
    mdChanged++;
    console.log('  réécrit : ' + relative(ROOT, md));
  }
}

for (const f of toConvert) await unlink(f);
console.log(`✓ ${toConvert.length} original(aux) supprimé(s), ${mdChanged} fichier(s) .md mis à jour`);
console.log('media_changed=true');
