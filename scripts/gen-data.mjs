/**
 * 生成前端数据产物 web/js/data.js（window.OTANGSHI_DATA）。
 *
 * 输入：data/src/tangshi-index.json / poems.json / annotations.json / poets.json
 * 校验：四表对齐、注疏全覆盖（占位率 0%）、体积上限
 *
 * 用法：node scripts/gen-data.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => JSON.parse(fs.readFileSync(path.join(repoRoot, p), 'utf8'));

const index = R('data/src/tangshi-index.json');
const poems = R('data/src/poems.json');
const poets = R('data/src/poets.json');

/* 注疏：合并 data/src/ann/*.json 分块 */
const errors0 = [];
const annDir = path.join(repoRoot, 'data/src/ann');
const ann = {};
for (const f of fs.readdirSync(annDir).filter((n) => n.endsWith('.json')).sort()) {
  const chunk = JSON.parse(fs.readFileSync(path.join(annDir, f), 'utf8'));
  for (const [k, v] of Object.entries(chunk)) {
    if (!/^\d{3}$/.test(k)) continue;
    if (ann[k]) errors0.push(`注疏 id 重复: ${k}（${f}）`);
    ann[k] = v;
  }
}

const errors = errors0;
const poemById = new Map(poems.map((p) => [p.id, p]));

for (const e of index) {
  const p = poemById.get(e.id);
  if (!p) { errors.push(`${e.id} ${e.title}: 缺正文`); continue; }
  const a = ann[e.id];
  if (!a) { errors.push(`${e.id} ${e.title}: 缺注疏`); continue; }
  for (const k of ['ti', 'yi', 'shang']) if (!a[k]) errors.push(`${e.id} ${e.title}: 注疏缺 ${k}`);
  if (!Array.isArray(a.zhu) || !a.zhu.length) errors.push(`${e.id} ${e.title}: 注疏缺 zhu`);
  if (!poets[e.author]) errors.push(`${e.id} ${e.title}: 诗人 ${e.author} 缺小传`);
}

if (errors.length) {
  console.error(`数据未就绪（${errors.length} 项）：`);
  errors.slice(0, 20).forEach((x) => console.error('  -', x));
  if (errors.length > 20) console.error(`  …另有 ${errors.length - 20} 项`);
  process.exit(1);
}

/* 组装 */
const poemsOut = index.map((e) => {
  const p = poemById.get(e.id);
  const item = { id: e.id, title: e.title, author: e.author, genre: e.genre, yuefu: !!e.yuefu, paragraphs: p.paragraphs };
  if (p.prelude) item.prelude = p.prelude;
  return item;
});

/* 注疏只保留展示字段，剔除说明键 */
const annOut = {};
for (const e of index) {
  const a = ann[e.id];
  annOut[e.id] = { ti: a.ti, zhu: a.zhu.map((z) => ({ w: z.w, v: z.v })), yi: a.yi, shang: a.shang };
}

const genres = [];
for (const e of index) if (genres.indexOf(e.genre) === -1) genres.push(e.genre);

const data = {
  meta: { count: poemsOut.length, poets: Object.keys(poets).length, genres, version: '1.0.0' },
  poems: poemsOut,
  ann: annOut,
  poets,
};

const js = 'window.OTANGSHI_DATA=' + JSON.stringify(data) + ';\n';
const outPath = path.join(repoRoot, 'web/js/data.js');
fs.writeFileSync(outPath, js, 'utf8');

const kb = Buffer.byteLength(js, 'utf8') / 1024;
const LIMIT_KB = 1536;
console.log(`data.js 已生成：${poemsOut.length} 首 · ${kb.toFixed(0)} KB`);
if (kb > LIMIT_KB) {
  console.error(`体积超限：${kb.toFixed(0)} KB > ${LIMIT_KB} KB`);
  process.exit(1);
}
console.log(`  体裁：${genres.join(' · ')}`);
console.log(`  注疏覆盖：${Object.keys(annOut).length}/${poemsOut.length}`);
