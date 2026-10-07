// Visite des pages avec Chrome, prend des captures et signale les erreurs (JS, console, API >= 400).
// Usage: node check.mjs --out <dossier> [--admin] [--width 1360] <chemin> [<chemin> ...]
//   ex:  node check.mjs --out C:/tmp/shots / /search /product/<id>
//        (MM_USER / MM_PASSWORD pour un autre compte)
//        node check.mjs --out C:/tmp/shots --admin /admin /admin/products /admin/orders
import puppeteer from 'puppeteer-core';
import { existsSync, mkdirSync } from 'node:fs';

const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(name); if (i < 0) return def; const [, v] = args.splice(i, 2); return v ?? def; };
const flag = (name) => { const i = args.indexOf(name); if (i < 0) return false; args.splice(i, 1); return true; };

const out = opt('--out', './shots');
const width = Number(opt('--width', 1360));
const admin = flag('--admin');
const base = opt('--base', 'http://localhost:4200');
// Git Bash (MSYS) convertit un argument "/" en "C:/Program Files/Git/": on remet le chemin d'origine.
const fixPath = (p) => p.replace(/^[A-Za-z]:[\/]Program Files[\/]Git/i, '') || '/';
const paths = (args.length ? args : ['/']).map(fixPath);

const chrome = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
].find(existsSync);
if (!chrome) { console.error('Chrome introuvable'); process.exit(2); }
mkdirSync(out, { recursive: true });

const browser = await puppeteer.launch({ executablePath: chrome, headless: 'new', defaultViewport: { width, height: 900 } });
const page = await browser.newPage();
let errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text().slice(0, 200)}`); });
page.on('response', (r) => { if (r.status() >= 400 && r.url().includes('/api/')) errors.push(`${r.status()} ${r.request().method()} ${r.url()}`); });

if (admin) {
  await page.goto(`${base}/login?returnUrl=/admin`, { waitUntil: 'networkidle2' });
  await page.type('#email', process.env.MM_USER ?? 'admin@minimarket.local');
  await page.type('#password', process.env.MM_PASSWORD ?? 'admin1234');
  await Promise.all([page.waitForFunction(() => location.pathname.startsWith('/admin')), page.click('.auth form button[type=submit]')]);
  await page.waitForNetworkIdle();
}

let failed = false;
for (const p of paths) {
  errors = [];
  await page.goto(base + p, { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 800));
  const file = `${out}/${p.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') || 'home'}.png`;
  await page.screenshot({ path: file, fullPage: false });
  const title = await page.title();
  console.log(`${errors.length ? 'KO' : 'OK'}  ${p}  [${title}]  -> ${file}`);
  for (const e of errors) console.log(`     ${e}`);
  if (errors.length) failed = true;
}
await browser.close();
process.exit(failed ? 1 : 0);
