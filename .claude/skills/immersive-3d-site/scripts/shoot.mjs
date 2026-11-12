#!/usr/bin/env node
// shoot.mjs: walk every act of an immersive-3d-site page and prove it holds up.
//
//   node shoot.mjs --url http://localhost:4600 --out shots/desktop
//   node shoot.mjs --url http://localhost:4600 --out shots/phone --width 390 --height 844 --touch
//   node shoot.mjs --url http://localhost:4600 --out shots/reduced --reduced-motion
//
// Needs playwright-core (npm i playwright-core in the build folder, or anywhere on the module path) and an
// installed Google Chrome. Writes one PNG per position, sheet.png (a contact sheet) and report.json.
// Exits 1 if it finds a blocker: a page error, no WebGL, an act that draws nothing, or sideways scroll.

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > -1 ? process.argv[i + 1] : d; };
const flag = (k) => process.argv.includes(`--${k}`);

const url = arg('url', 'http://localhost:4600');
const out = path.resolve(arg('out', 'shots/desktop'));
const width = Number(arg('width', 1440));
const height = Number(arg('height', 900));
const positions = (arg('positions', '0,0.25,0.5,0.75,1')).split(',').map(Number);
const touch = flag('touch');
const reducedMotion = flag('reduced-motion');

let chromium;
try {
  const req = createRequire(path.join(process.cwd(), 'noop.js'));
  ({ chromium } = req('playwright-core'));
} catch {
  try { ({ chromium } = await import('playwright-core')); }
  catch { console.error('playwright-core not found. Run: npm i playwright-core   (in the build folder)'); process.exit(2); }
}

fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch({
  channel: arg('channel', 'chrome'),
  headless: !flag('headed'),
  // Headless Chrome needs a software GL path on machines where the GPU is not exposed.
  args: ['--ignore-gpu-blocklist', '--enable-unsafe-swiftshader', '--use-angle=swiftshader'],
});
const ctx = await browser.newContext({
  viewport: { width, height }, deviceScaleFactor: 1, hasTouch: touch, isMobile: touch,
  reducedMotion: reducedMotion ? 'reduce' : 'no-preference',
});
const page = await ctx.newPage();

const errors = [];
const warnings = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => {
  if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(`console: ${m.text()}`);
  if (m.type() === 'warning') warnings.push(m.text());
});
page.on('requestfailed', (r) => errors.push(`request failed: ${r.url()} (${r.failure()?.errorText})`));
page.on('response', (r) => { if (r.status() >= 400 && !r.url().endsWith('/favicon.ico')) errors.push(`HTTP ${r.status()}: ${r.url()}`); });

await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForFunction(() => window.__stage?.state?.ready, null, { timeout: 60000 }).catch(() => {
  errors.push('stage never became ready (window.__stage.state.ready). Is createStage().start() called?');
});

const meta = await page.evaluate(() => {
  const s = window.__stage;
  const acts = s ? s.acts().map((name) => {
    const el = document.querySelector(`section[data-act="${name}"], [data-act="${name}"]:not(html)`);
    const r = el.getBoundingClientRect();
    return { name, top: r.top + scrollY, height: el.offsetHeight };
  }) : [];
  return {
    webgl: document.documentElement.classList.contains('has-webgl'),
    acts,
    docHeight: document.documentElement.scrollHeight,
    sideways: document.documentElement.scrollWidth > innerWidth + 1,
    title: document.title,
  };
});

if (!meta.webgl) errors.push('no WebGL: the page fell back to posters');
if (meta.sideways) errors.push(`sideways scroll at ${width}px: something is wider than the viewport`);
if (!meta.acts.length) errors.push('no acts registered');

// Rough frame rate while idle at the top, so a scene that crawls is caught early.
await page.evaluate(() => scrollTo(0, 0));
const fps = await page.evaluate(() => new Promise((res) => {
  const f0 = window.__stage?.state.frames ?? 0; const t0 = performance.now();
  setTimeout(() => res(((window.__stage?.state.frames ?? 0) - f0) / ((performance.now() - t0) / 1000)), 1500);
}));

const shots = [];
const empty = [];
for (const act of meta.acts) {
  const travel = Math.max(0, act.height - height);
  for (const p of positions) {
    const y = Math.round(act.top + travel * p);
    await page.evaluate((yy) => scrollTo(0, yy), y);
    await page.waitForFunction(() => window.__stage?.settled(), null, { timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(reducedMotion ? 120 : 450);
    const st = await page.evaluate(() => ({ current: window.__stage.state.current, stats: window.__stage.state.stats }));
    const file = path.join(out, `${act.name}-${String(Math.round(p * 100)).padStart(3, '0')}.png`);
    await page.screenshot({ path: file });
    const drew = st.stats && (st.stats.triangles > 0 || st.stats.points > 0);
    if (!drew && meta.webgl) empty.push(`${act.name} at ${p}`);
    shots.push({ act: act.name, p, y, owner: st.current, file: path.basename(file), stats: st.stats });
  }
}
if (empty.length) errors.push(`act drew nothing (0 triangles, 0 points): ${empty.join(', ')}`);

// Contact sheet: lay the shots out in an HTML grid and screenshot it. No image libraries needed.
const cols = positions.length;
const cell = 300;
const rows = meta.acts.map((a) => {
  const cells = shots.filter((s) => s.act === a.name)
    .map((s) => `<figure><img src="file://${path.join(out, s.file)}"><figcaption>${s.act} · ${s.p}</figcaption></figure>`).join('');
  return `<div class="row">${cells}</div>`;
}).join('');
const sheetHtml = `<!doctype html><meta charset="utf-8"><style>
body{margin:0;background:#111;color:#bbb;font:12px system-ui;padding:12px;width:fit-content}
.row{display:grid;grid-template-columns:repeat(${cols},${cell}px);gap:8px;margin-bottom:8px}
figure{margin:0}img{width:${cell}px;height:${Math.round(cell * height / width)}px;object-fit:cover;border:1px solid #333}
figcaption{padding:3px 0}</style>${rows}`;
const sheetFile = path.join(out, 'sheet.html');
fs.writeFileSync(sheetFile, sheetHtml);
const sp = await ctx.newPage();
await sp.setViewportSize({ width: cols * (cell + 8) + 24, height: 400 });
await sp.goto(`file://${sheetFile}`);
await sp.waitForFunction(() => [...document.images].every((i) => i.complete && i.naturalWidth > 0), null, { timeout: 15000 }).catch(() => {});
await sp.setViewportSize({ width: cols * (cell + 8) + 24, height: await sp.evaluate(() => document.documentElement.scrollHeight) });
await sp.locator('body').screenshot({ path: path.join(out, 'sheet.png') });

const report = {
  url, width, height, touch, reducedMotion, title: meta.title,
  webgl: meta.webgl, fps: Math.round(fps), docHeightScreens: +(meta.docHeight / height).toFixed(1),
  acts: meta.acts.map((a) => ({ name: a.name, screens: +(a.height / height).toFixed(1) })),
  errors, warnings: warnings.slice(0, 20), shots,
};
fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2));
await browser.close();

console.log(`\n${meta.title}  ${width}x${height}${touch ? ' touch' : ''}${reducedMotion ? ' reduced-motion' : ''}`);
console.log(`WebGL ${meta.webgl ? 'yes' : 'NO'} · ~${report.fps} fps idle (headless software GL, a real GPU is far faster) · ${report.docHeightScreens} screens tall`);
console.log(`acts: ${report.acts.map((a) => `${a.name} (${a.screens})`).join(', ')}`);
console.log(`shots: ${shots.length} → ${out}/sheet.png`);
if (errors.length) { console.log(`\nBLOCKERS (${errors.length}):`); errors.forEach((e) => console.log(`  - ${e}`)); process.exit(1); }
console.log('\nno blockers. Now open sheet.png and look at it: the script cannot judge whether it is good.');
