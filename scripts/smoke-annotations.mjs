/**
 * Task 6–9 校验：data/src/annotations.json 注疏完整性。
 * 断言的是用户会看到的东西：每首诗都有题解/注释/译文/赏析，篇幅合规、字条对得上原文。
 *
 * 用法：node scripts/smoke-annotations.mjs [--expect-batches A,B,C,D]
 *   默认要求全覆盖（占位率 0%）；带 --expect-batches 时只检查所列批次的完整性。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ART = path.join(repoRoot, 'data/src/annotations.json');
const INDEX = path.join(repoRoot, 'data/src/tangshi-index.json');
const POEMS = path.join(repoRoot, 'data/src/poems.json');

const LIMITS = { ti: 120, yi: 200, shang: 150, zhuMin: 3, zhuMax: 10 };

let failed = 0;
const check = (name, cond, detail) => {
  if (cond) console.log(`  ok  ${name}`);
  else { failed += 1; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
};

const annDir = path.join(repoRoot, 'data/src/ann');
const ann = {};
for (const f of fs.readdirSync(annDir).filter((n) => n.endsWith('.json')).sort()) {
  Object.assign(ann, JSON.parse(fs.readFileSync(path.join(annDir, f), 'utf8')));
}
const index = JSON.parse(fs.readFileSync(INDEX, 'utf8'));
const poems = JSON.parse(fs.readFileSync(POEMS, 'utf8'));
const bodyOf = new Map(poems.map((p) => [p.id, p]));
const titleOf = new Map(index.map((e) => [e.id, e.title]));

console.log(`注疏分块：${Object.keys(ann).length} 首（篇目 ${index.length}）`);

const missing = index.filter((e) => !ann[e.id]);
check('每首诗都有注疏', missing.length === 0, `${missing.length} 首缺失：` + missing.slice(0, 8).map((e) => `${e.id}${e.title}`).join('、'));

const bad = { ti: [], zhu: [], yi: [], shang: [], key: [] };
for (const e of index) {
  const a = ann[e.id];
  if (!a) continue;
  if (!a.ti || a.ti.length > LIMITS.ti) bad.ti.push(`${e.id}${e.title}(${a.ti ? a.ti.length : 0})`);
  if (!Array.isArray(a.zhu) || a.zhu.length < LIMITS.zhuMin || a.zhu.length > LIMITS.zhuMax) bad.zhu.push(`${e.id}${e.title}(${a.zhu ? a.zhu.length : 0})`);
  if (!a.yi || a.yi.length > LIMITS.yi) bad.yi.push(`${e.id}${e.title}(${a.yi ? a.yi.length : 0})`);
  if (!a.shang || a.shang.length > LIMITS.shang) bad.shang.push(`${e.id}${e.title}(${a.shang ? a.shang.length : 0})`);
}

check(`题解非空且 ≤${LIMITS.ti} 字`, bad.ti.length === 0, bad.ti.slice(0, 6).join('、'));
check(`注释 ${LIMITS.zhuMin}–${LIMITS.zhuMax} 条`, bad.zhu.length === 0, bad.zhu.slice(0, 6).join('、'));
check(`译文非空且 ≤${LIMITS.yi} 字`, bad.yi.length === 0, bad.yi.slice(0, 6).join('、'));
check(`赏析非空且 ≤${LIMITS.shang} 字`, bad.shang.length === 0, bad.shang.slice(0, 6).join('、'));

/* 注释的「字」必须真的出现在该诗正文里（防止张冠李戴） */
for (const e of index) {
  const a = ann[e.id];
  if (!a || !Array.isArray(a.zhu)) continue;
  const p = bodyOf.get(e.id);
  const body = (titleOf.get(e.id) || '') + (p ? p.paragraphs.join('') : '') + (p && p.prelude ? p.prelude : '');
  for (const z of a.zhu) {
    if (!z || !z.w) continue;
    const word = String(z.w).split(/[、,，]/)[0].trim();
    if (word && !body.includes(word)) bad.key.push(`${e.id}${e.title}:「${word}」不在正文`);
  }
}
check('注释词条可在正文中找到', bad.key.length === 0, bad.key.slice(0, 6).join(' | '));

if (failed) { console.error(`\n${failed} 项失败`); process.exit(1); }
console.log('\n全部通过');
