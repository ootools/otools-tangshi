/** 快速校验注疏分块（词条在正文、长度、条数）。用法：node scripts/check-ann.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const poems = JSON.parse(fs.readFileSync(path.join(repoRoot, 'data/src/poems.json'), 'utf8'));
const index = JSON.parse(fs.readFileSync(path.join(repoRoot, 'data/src/tangshi-index.json'), 'utf8'));
const byId = new Map(poems.map((p) => [p.id, p]));
const titleOf = new Map(index.map((e) => [e.id, e.title]));
const dir = path.join(repoRoot, 'data/src/ann');

const ann = {};
for (const f of fs.readdirSync(dir).filter((n) => n.endsWith('.json')).sort()) {
  Object.assign(ann, JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
}

const bad = [];
for (const [id, a] of Object.entries(ann)) {
  const p = byId.get(id);
  if (!p) { bad.push(`${id}: 无对应正文`); continue; }
  const body = (titleOf.get(id) || '') + p.paragraphs.join('') + (p.prelude || '');
  for (const z of a.zhu || []) {
    const w = String(z.w).split(/[、,，]/)[0].trim();
    if (w && !body.includes(w)) bad.push(`${id} ${p.title}: 「${w}」不在正文`);
  }
  if (!a.ti || a.ti.length > 120) bad.push(`${id}: ti 长度 ${a.ti ? a.ti.length : 0}`);
  if (!a.yi || a.yi.length > 200) bad.push(`${id}: yi 长度 ${a.yi ? a.yi.length : 0}`);
  if (!a.shang || a.shang.length > 150) bad.push(`${id}: shang 长度 ${a.shang ? a.shang.length : 0}`);
  if (!Array.isArray(a.zhu) || a.zhu.length < 3 || a.zhu.length > 10) bad.push(`${id}: zhu 条数 ${a.zhu ? a.zhu.length : 0}`);
}

const done = Object.keys(ann).length;
const missing = index.filter((e) => !ann[e.id]);
console.log(`已完成 ${done}/${index.length}，待撰写 ${missing.length}`);
if (missing.length) {
  const byGenre = {};
  missing.forEach((e) => { (byGenre[e.genre] = byGenre[e.genre] || []).push(e.id); });
  for (const [g, ids] of Object.entries(byGenre)) console.log(`  ${g}: ${ids.length}（${ids[0]}→${ids[ids.length - 1]}）`);
}
if (bad.length) {
  console.error(`\n问题 ${bad.length} 项：`);
  bad.slice(0, 30).forEach((x) => console.error('  -', x));
  process.exit(1);
}
console.log('分块校验通过');
